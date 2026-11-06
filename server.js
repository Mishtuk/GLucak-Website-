// The GLucak website server: serves the static Astro build in dist/ with strict security headers and fills the
// shows list into the HTML at the <!--gl:shows--> marker on every request (so past shows drop off by themselves), and
// the shop at <!--gl:shop--> the same way. SHOP_ENABLED=1 adds Shop to the nav, phone bar and footer (D8, D36).
// Gabe's edit screen lives under /edit/: sign-in, then GET/POST /edit/api/shows and /edit/api/products, and
// POST /edit/api/upload for product images (served back from /media/uploads/). Node 22+ built-ins, plus sharp for uploads.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { brotliCompressSync, constants as zc, gzipSync } from 'node:zlib';
import { icsById, nowHtml, showsHtml, showsLdHtml } from './src/lib/shows.js';
import { signup } from './src/lib/signup.js';
import { allow, checkLogin, clearFailures, cookieHeader, locked, parseEditors, readCookie, recordFailure, sameOrigin, signSession, verifySession, SESSION_DAYS, USER_LOCK } from './src/lib/auth.js';
import { checkShows, listVersion, readList, readShows, saveList } from './src/lib/store.js';
import { checkProducts, productsHtml, shopLinks } from './src/lib/products.js';
import { MAX_BYTES, TYPES as IMAGE_TYPES, UPLOAD_NAME, toWebp } from './src/lib/upload.js';

const ROOT = import.meta.dirname;
const env = process.env;
const DIST = normalize(env.DIST_DIR || join(ROOT, 'dist')); // normalized, so forward slashes on Windows still match
const SHOWS = env.SHOWS_FILE || join(ROOT, 'src/data/shows.json'); // the shipped list
const RELEASES = env.RELEASES_FILE || join(ROOT, 'src/data/releases.json');
const PRODUCTS = env.PRODUCTS_FILE || join(ROOT, 'src/data/products.json'); // the shipped SAMPLE products
const PORT = Number(env.PORT) || 8080;
const PROD = env.NODE_ENV === 'production' || Boolean(env.WEBSITE_SITE_NAME); // App Service sets WEBSITE_SITE_NAME
// Gabe's saved shows live here, outside the build; DATA/shows.json wins over the shipped SHOWS file. Same for
// products.json; uploaded product images live in DATA/uploads.
const DATA = env.DATA_DIR || join(ROOT, '.data');
const UPLOADS = join(DATA, 'uploads');
const shopOn = () => env.SHOP_ENABLED === '1'; // read per request; the owner flips it with a restart, no rebuild
const EDITORS = parseEditors(env.EDITOR_USERS);
// Production needs a real SESSION_SECRET (32+ characters) or the edit routes stay off (503). Dev: a new secret each start.
const SECRET = env.SESSION_SECRET?.length >= 32 ? env.SESSION_SECRET : PROD ? null : randomBytes(32).toString('hex');
if (!SECRET) console.error('Edit screen off: set SESSION_SECRET (32+ characters) to turn it on.');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const TEXT = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

// Astro inlines the stylesheet (style-src 'unsafe-inline'); no inline scripts, so script-src is 'self' only.
// Spotify and YouTube players are the only frames allowed.
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; " +
  "connect-src 'self'; frame-src https://open.spotify.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'";

function baseHeaders(req) {
  const h = { 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' };
  if (isHttps(req)) h['Strict-Transport-Security'] = 'max-age=31536000';
  return h;
}

function compress(req, buf, type, headers) {
  if (!TEXT.test(type) || buf.length < 1024) return buf;
  const ae = String(req.headers['accept-encoding'] ?? '');
  headers.Vary = 'Accept-Encoding';
  if (/\bbr\b/.test(ae)) { headers['Content-Encoding'] = 'br'; return brotliCompressSync(buf, { params: { [zc.BROTLI_PARAM_QUALITY]: 5 } }); }
  if (/\bgzip\b/.test(ae)) { headers['Content-Encoding'] = 'gzip'; return gzipSync(buf); }
  return buf;
}

const statSafe = (f) => { try { return statSync(f); } catch { return null; } };

/** Fill the shop links, the shop, the shows and the Now line. Fails open (caller catches): an unreadable file leaves the static page. */
function inject(html, path) {
  const products = readList(DATA, PRODUCTS, 'products.json');
  html = shopLinks(html, { enabled: shopOn(), path, rows: products });
  if (html.includes('<!--gl:shop-->')) {
    const shop = productsHtml(products, { preview: !shopOn() });
    html = html.replace('<!--gl:shop-->', () => shop);
  }
  const shows = html.includes('<!--gl:shows-->'), ld = html.includes('<!--gl:shows-ld-->'), now = html.includes('<!--gl:now-->');
  if (!shows && !now && !ld) return html;
  const rows = readShows(DATA, SHOWS);
  if (now) { // D45: the dated line replaces the static one between the markers; '' leaves the static one
    let rel = [];
    try { rel = JSON.parse(readFileSync(RELEASES, 'utf8')); } catch { /* no releases file: shows only */ }
    const line = nowHtml(rows, new Date(), Array.isArray(rel) ? rel : []);
    if (line) html = html.replace(/<!--gl:now-->[\s\S]*?<!--\/gl:now-->/, () => line);
  }
  if (ld) html = html.replace('<!--gl:shows-ld-->', () => showsLdHtml(rows));
  return shows ? html.replace('<!--gl:shows-->', () => showsHtml(rows, new Date(), path === '/' ? { limit: 3, allLink: '/shows/' } : { past: true })) : html;
}

function send(req, res, status, type, body, extra = {}) {
  const headers = { ...baseHeaders(req), 'Content-Type': type, ...extra };
  const out = compress(req, body, type, headers);
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : out);
}

/** The 404 page (src/pages/404.astro) with status 404; the shop links are filled in like any page. Plain text if the build is missing. */
function notFound(req, res) {
  const f = join(DIST, '404.html');
  let body = Buffer.from('Not found');
  if (existsSync(f)) {
    let html = readFileSync(f, 'utf8');
    try { html = inject(html, '/404'); } catch (e) { console.error('inject failed on 404', e.message); }
    body = Buffer.from(html);
  }
  send(req, res, 404, TYPES['.html'], body, { 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex' });
}

/** POST /api/signup. Form or JSON body, max 2 KB. JSON reply for the page's script; 303 back to the form without JS. */
function handleSignup(req, res) {
  let raw = '', big = false;
  req.setEncoding('utf8');
  req.on('data', (c) => { if (!big) raw += c; if (raw.length > 2048) { big = true; raw = ''; } }); // keep reading, drop the excess, then answer 413
  req.on('end', async () => {
    const reply = (status, body) => {
      if (/json/.test(req.headers.accept ?? '')) return send(req, res, status, 'application/json', Buffer.from(JSON.stringify(body)), { 'Cache-Control': 'no-store' });
      res.writeHead(303, { ...baseHeaders(req), Location: `/?signup=${body.ok ? 'ok' : 'error'}#join`, 'Cache-Control': 'no-store' });
      res.end();
    };
    if (big) return reply(413, { ok: false });
    let fields = {};
    try { fields = /json/.test(req.headers['content-type'] ?? '') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw)); } catch { return reply(400, { ok: false }); }
    const r = await signup(fields, { ip: clientIp(req), headers: req.headers, host: req.headers.host });
    reply(r.status, r.body);
  });
}

// X-Forwarded-* only when TRUST_PROXY=1 (behind the host's proxy); otherwise anyone could spoof them.
// The client IP is the RIGHTMOST X-Forwarded-For entry (the one our proxy added); entries to its left are whatever the
// client sent. App Service writes "1.2.3.4:port" or "[v6]:port", so the port is stripped.
export function clientIp(req) {
  const last = env.TRUST_PROXY === '1' && String(req.headers['x-forwarded-for'] ?? '').split(',').at(-1).trim();
  return (last && last.replace(/^\[(.*)\](:\d+)?$/, '$1').replace(/^([\d.]+):\d+$/, '$1')) || req.socket.remoteAddress;
}
export const isHttps = (req) => Boolean(req.socket.encrypted) || (env.TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https');

// ---------- Edit screen: /edit/ ----------
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const BODY_MAX = 32 * 1024;
// Each list the edit screen saves, same model for both: validate all, version check -> 409, atomic write + .prev.
const LISTS = {
  shows: { file: 'shows.json', fallback: SHOWS, check: checkShows, max: BODY_MAX, big: 'That list is too big to save. Delete some old shows.' },
  products: { file: 'products.json', fallback: PRODUCTS, check: checkProducts, max: 256 * 1024, big: 'That list is too big to save. Delete some products or shorten descriptions.' },
};

/** The signed-in editor, or null. DEV_EDITOR=1 works only off production, on a localhost URL, from this machine. */
function editor(req, url) {
  if (env.DEV_EDITOR === '1' && !PROD && ['localhost', '127.0.0.1'].includes(url.hostname) && LOOPBACK.has(req.socket.remoteAddress)) return 'dev';
  return verifySession(readCookie(req.headers.cookie), SECRET, EDITORS);
}

/** The body bytes up to `max`, or null when bigger (the excess is read and dropped; 1 MB past `max` the socket is cut). */
function readBody(req, max = BODY_MAX) {
  return new Promise((resolve) => {
    const parts = [];
    let size = 0;
    req.on('data', (c) => { size += c.length; if (size <= max) parts.push(c); else if (size > max + 1024 * 1024) req.destroy(); });
    req.on('end', () => resolve(size > max ? null : Buffer.concat(parts)));
    req.on('error', () => resolve(null));
    req.on('close', () => resolve(null)); // cut off or aborted; a no-op after 'end'
  });
}

function redirect(req, res, location, extra = {}) {
  res.writeHead(303, { ...baseHeaders(req), Location: location, 'Cache-Control': 'no-store', ...extra });
  res.end();
}

const WRONG = "That name and password don't match. Check them and try again.";
const LOCKED = 'Too many tries. Wait 15 minutes, then try again.';
const STALE = (kind) => `Someone else saved the ${kind} just now, so yours didn't save. Reloading shows their changes but clears yours, so write down what you changed first.`;
const NOT_IMAGE = "That file isn't a photo we can use. Try a JPG, PNG or WebP.";

async function handleEdit(req, res, url) {
  const p = url.pathname;
  const json = (status, body, extra = {}) => {
    req.resume(); // drain any unread body
    send(req, res, status, 'application/json', Buffer.from(JSON.stringify(body)), { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...extra });
  };
  if (!SECRET) return json(503, { error: 'off', message: "The edit screen isn't switched on yet. Tell the person who runs the site." });
  const kind = p.match(/^\/edit\/api\/(shows|products)$/)?.[1], list = LISTS[kind];
  if (req.method === 'GET' && list) {
    const who = editor(req, url);
    if (!who) return json(401, { error: 'signed_out' });
    return json(200, { editor: who, [kind]: readList(DATA, list.fallback, list.file), version: listVersion(DATA, list.fallback, list.file) });
  }
  if (req.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST' });
  if (!sameOrigin(req.headers)) return json(403, { error: 'origin', message: "That didn't go through. Try again." });

  if (p === '/edit/login') {
    const isJson = /json/.test(req.headers['content-type'] ?? '');
    const asJson = isJson || /json/.test(req.headers.accept ?? ''); // JSON reply for scripts; a plain browser form gets a redirect
    const raw = (await readBody(req))?.toString('utf8');
    if (raw == null) return json(413, { error: 'too_big' });
    let b;
    try { b = isJson ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw)); } catch { return json(400, { error: 'bad_body' }); }
    const username = String(b?.username ?? '').trim().toLowerCase().slice(0, 64);
    const fail = (status, error, message) => (asJson ? json(status, { error, message }) : redirect(req, res, `/edit/?login=${error}`));
    // 10 tries per IP per 15 minutes, 30 per minute across all IPs (each try costs a scrypt). 5 wrong passwords lock that
    // name from that IP for 15 minutes; 50 in an hour lock the name everywhere (known or not, so it reveals nothing).
    const ip = clientIp(req), userIp = `user:${username}|ip:${ip}`, user = `user:${username}`;
    if (!allow(`ip:${ip}`, 10, 15 * 60e3) || !allow('login:all', 30, 60e3) || locked(userIp) || locked(user)) return fail(429, 'locked', LOCKED);
    const name = await checkLogin(EDITORS, username, b?.password);
    if (!name) { recordFailure(userIp); recordFailure(user, Date.now(), USER_LOCK); return fail(401, 'wrong', WRONG); }
    clearFailures(userIp);
    clearFailures(user);
    console.log(new Date().toISOString(), 'editor signed in:', name);
    const cookie = cookieHeader(signSession(name, Date.now() + SESSION_DAYS * 864e5, SECRET, EDITORS.get(name)), { secure: PROD || isHttps(req) });
    return asJson ? json(200, { ok: true, editor: name }, { 'Set-Cookie': cookie }) : redirect(req, res, '/edit/', { 'Set-Cookie': cookie });
  }

  const who = editor(req, url);
  if (!who) return json(401, { error: 'signed_out' });
  if (p === '/edit/logout') return json(200, { ok: true }, { 'Set-Cookie': cookieHeader('', { secure: PROD || isHttps(req), maxAge: 0 }) });
  if (list) {
    // JSON only: a cross-site HTML form can't send this content type (one more wall on top of SameSite and Origin).
    if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) return json(415, { error: 'json_only' });
    const raw = (await readBody(req, list.max))?.toString('utf8');
    if (raw == null) return json(413, { error: 'too_big', errors: [{ row: null, message: list.big }] });
    let b;
    try { b = JSON.parse(raw); } catch { return json(400, { error: 'bad_body', errors: [{ row: null, message: "That didn't save. Try again." }] }); }
    const r = list.check(Array.isArray(b) ? b : b?.[kind]);
    if (r.errors) return json(400, { error: 'invalid', errors: r.errors });
    // Two tabs or two editors: refuse a save based on an older list instead of silently dropping the other's changes.
    const version = () => listVersion(DATA, list.fallback, list.file);
    if (b?.version !== version()) return json(409, { error: 'stale', message: STALE(kind), errors: [{ row: null, message: STALE(kind) }] });
    saveList(DATA, r.rows, list.fallback, list.file);
    console.log(new Date().toISOString(), `${kind} saved by ${who}: ${r.rows.length} rows`);
    return json(200, { ok: true, [kind]: r.rows, version: version(), message: kind === 'products' && !shopOn() ? "Saved. The shop isn't open to fans yet, so they won't see it until it's switched on." : "Saved. It's on the site now." });
  }
  if (p === '/edit/api/upload') {
    // The raw image is the body. The declared type only gates the door; sharp decides what the bytes really are.
    const type = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    if (!IMAGE_TYPES.includes(type)) return json(415, { error: 'type', message: NOT_IMAGE });
    if (!allow(`upload:${who}`, 30, 10 * 60e3) || !allow(`upload-ip:${clientIp(req)}`, 30, 10 * 60e3)) {
      return json(429, { error: 'slow_down', message: 'Too many uploads. Wait a few minutes, then try again.' });
    }
    const buf = await readBody(req, MAX_BYTES);
    if (!buf) return json(413, { error: 'too_big', message: 'That photo is over 5 MB. Pick a smaller one.' });
    let out;
    try { out = await toWebp(buf); } catch (e) {
      return json(400, e.message === 'too_many_pixels'
        ? { error: 'too_many_pixels', message: 'That photo is too big (over 40 megapixels). Shrink it or pick another one.' } : { error: 'not_image', message: NOT_IMAGE });
    }
    const name = `${randomBytes(16).toString('hex')}.webp`; // our name, never the client's
    mkdirSync(UPLOADS, { recursive: true });
    writeFileSync(join(UPLOADS, name), out, { flag: 'wx' });
    console.log(new Date().toISOString(), `image uploaded by ${who}: ${name} (${out.length} bytes)`);
    return json(200, { ok: true, path: `/media/uploads/${name}` });
  }
  return json(404, { error: 'not_found' });
}

function handle(req, res) {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`); } catch { // a junk Host header ('a b', '[')
    res.writeHead(400, { Connection: 'close' });
    return res.end();
  }
  if (req.method === 'POST' && url.pathname === '/api/signup') return handleSignup(req, res);
  if (['/edit/login', '/edit/logout'].includes(url.pathname) || url.pathname.startsWith('/edit/api/')) {
    return handleEdit(req, res, url).catch((e) => {
      console.error('edit failed:', e.message);
      if (!res.headersSent) { res.writeHead(500, { ...baseHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end('{"error":"server"}'); }
    });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { ...baseHeaders(req), Allow: 'GET, HEAD' }); return res.end(); }
  const ics = url.pathname.match(/^\/shows\/([a-z0-9-]+)\.ics$/); // Add to calendar: an upcoming show by id (showId in src/lib/shows.js)
  if (ics) {
    let text = null;
    try { text = icsById(readShows(DATA, SHOWS), ics[1]); } catch (e) { console.error('ics failed', e.message); }
    if (!text) return notFound(req, res);
    return send(req, res, 200, 'text/calendar; charset=utf-8', Buffer.from(text), { 'Content-Disposition': `attachment; filename="glucak-${ics[1]}.ics"`, 'Cache-Control': 'no-cache' });
  }
  if (url.pathname.startsWith('/media/uploads/')) { // only server-made names (32 hex + .webp), so nothing can climb out
    const name = url.pathname.slice('/media/uploads/'.length);
    const st = UPLOAD_NAME.test(name) ? statSafe(join(UPLOADS, name)) : null;
    if (!st?.isFile()) return notFound(req, res);
    return send(req, res, 200, 'image/webp', readFileSync(join(UPLOADS, name)), { 'Cache-Control': 'public, max-age=31536000, immutable' });
  }
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return notFound(req, res); }
  let file = normalize(join(DIST, p));
  if (file !== DIST && !file.startsWith(DIST + sep)) return notFound(req, res);
  let st = statSafe(file);
  if (st?.isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { ...baseHeaders(req), Location: `${url.pathname}/${url.search}` }); return res.end(); }
    file = join(file, 'index.html');
    st = statSafe(file);
  }
  if (!st?.isFile()) return notFound(req, res);
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  if (type.startsWith('text/html')) {
    let html = readFileSync(file, 'utf8');
    try { html = inject(html, p); } catch (e) { console.error('inject failed, serving the static page', e.message); }
    const edit = p.startsWith('/edit/') ? { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
      : p.startsWith('/shop/') && !shopOn() ? { 'X-Robots-Tag': 'noindex' } : {}; // the shop preview stays out of search
    return send(req, res, 200, type, Buffer.from(html), { 'Cache-Control': 'no-cache', ...edit });
  }
  send(req, res, 200, type, readFileSync(file), { 'Cache-Control': p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400' });
}

export const server = createServer(handle);
// Tests import this file without listening; `node server.js` listens.
if (process.argv[1] && import.meta.filename === process.argv[1]) server.listen(PORT, () => console.log(`GLucak site on :${PORT}`));
