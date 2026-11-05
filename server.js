// The GLucak website server: serves the static Astro build in dist/ with strict security headers and fills the
// shows list into the HTML at the <!--gl:shows--> marker on every request (so past shows drop off by themselves).
// Gabe's edit screen (shows only for now) lives under /edit/: sign-in, then GET/POST /edit/api/shows.
// Node 22+ built-ins only.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { brotliCompressSync, constants as zc, gzipSync } from 'node:zlib';
import { showsHtml } from './src/lib/shows.js';
import { signup } from './src/lib/signup.js';
import { allow, checkLogin, clearFailures, cookieHeader, locked, parseEditors, readCookie, recordFailure, sameOrigin, signSession, verifySession, SESSION_DAYS } from './src/lib/auth.js';
import { checkShows, readShows, saveShows } from './src/lib/store.js';

const ROOT = import.meta.dirname;
const env = process.env;
const DIST = env.DIST_DIR || join(ROOT, 'dist');
const SHOWS = env.SHOWS_FILE || join(ROOT, 'src/data/shows.json'); // the shipped list
const PORT = Number(env.PORT) || 8080;
const PROD = env.NODE_ENV === 'production' || Boolean(env.WEBSITE_SITE_NAME); // App Service sets WEBSITE_SITE_NAME
// Gabe's saved shows live here, outside the build; DATA/shows.json wins over the shipped SHOWS file.
const DATA = env.DATA_DIR || join(ROOT, '.data');
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

function baseHeaders(url) {
  const h = { 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' };
  if (url.protocol === 'https:') h['Strict-Transport-Security'] = 'max-age=31536000';
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

/** Fill the shows marker. Fails open (caller catches): an unreadable shows.json leaves the invisible marker comment. */
function inject(html, path) {
  if (!html.includes('<!--gl:shows-->')) return html;
  const rows = readShows(DATA, SHOWS);
  return html.replace('<!--gl:shows-->', () => showsHtml(rows, new Date(), path === '/' ? { limit: 3, allLink: '/shows/' } : { past: true }));
}

function send(req, res, url, status, type, body, extra = {}) {
  const headers = { ...baseHeaders(url), 'Content-Type': type, ...extra };
  const out = compress(req, body, type, headers);
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : out);
}

function notFound(req, res, url) {
  const f = join(DIST, '404.html');
  send(req, res, url, 404, TYPES['.html'], existsSync(f) ? readFileSync(f) : Buffer.from('Not found'), { 'Cache-Control': 'no-cache' });
}

/** POST /api/signup. Form or JSON body, max 2 KB. JSON reply for the page's script; 303 back to the form without JS. */
function handleSignup(req, res, url) {
  let raw = '', big = false;
  req.setEncoding('utf8');
  req.on('data', (c) => { if (!big) raw += c; if (raw.length > 2048) { big = true; raw = ''; } }); // keep reading, drop the excess, then answer 413
  req.on('end', async () => {
    const reply = (status, body) => {
      if (/json/.test(req.headers.accept ?? '')) return send(req, res, url, status, 'application/json', Buffer.from(JSON.stringify(body)), { 'Cache-Control': 'no-store' });
      res.writeHead(303, { ...baseHeaders(url), Location: `/?signup=${body.ok ? 'ok' : 'error'}#join`, 'Cache-Control': 'no-store' });
      res.end();
    };
    if (big) return reply(413, { ok: false });
    let fields = {};
    try { fields = /json/.test(req.headers['content-type'] ?? '') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw)); } catch { return reply(400, { ok: false }); }
    const r = await signup(fields, { ip: clientIp(req), headers: req.headers, host: req.headers.host });
    reply(r.status, r.body);
  });
}

// ponytail: X-Forwarded-For only when TRUST_PROXY=1 (behind the host's proxy); otherwise it could be spoofed.
const clientIp = (req) => (env.TRUST_PROXY === '1' && String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()) || req.socket.remoteAddress;
const isHttps = (req) => PROD || Boolean(req.socket.encrypted) || (env.TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https');

// ---------- Edit screen: /edit/ ----------
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const BODY_MAX = 32 * 1024;

/** The signed-in editor, or null. DEV_EDITOR=1 works only off production, on a localhost URL, from this machine. */
function editor(req, url) {
  if (env.DEV_EDITOR === '1' && !PROD && ['localhost', '127.0.0.1'].includes(url.hostname) && LOOPBACK.has(req.socket.remoteAddress)) return 'dev';
  return verifySession(readCookie(req.headers.cookie), SECRET, EDITORS);
}

/** The body text up to BODY_MAX, or null when bigger (the excess is read and dropped; past 1 MB the socket is cut). */
function readBody(req) {
  return new Promise((resolve) => {
    let raw = '', size = 0;
    req.setEncoding('utf8');
    req.on('data', (c) => { size += c.length; if (size <= BODY_MAX) raw += c; else if (size > 1024 * 1024) req.destroy(); });
    req.on('end', () => resolve(size > BODY_MAX ? null : raw));
    req.on('error', () => resolve(null));
    req.on('close', () => resolve(null)); // cut off or aborted; a no-op after 'end'
  });
}

function redirect(res, url, location, extra = {}) {
  res.writeHead(303, { ...baseHeaders(url), Location: location, 'Cache-Control': 'no-store', ...extra });
  res.end();
}

const WRONG = "That name and password don't match. Check them and try again.";
const LOCKED = 'Too many tries. Wait 15 minutes, then try again.';

async function handleEdit(req, res, url) {
  const p = url.pathname;
  const json = (status, body, extra = {}) => {
    req.resume(); // drain any unread body
    send(req, res, url, status, 'application/json', Buffer.from(JSON.stringify(body)), { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...extra });
  };
  if (!SECRET) return json(503, { error: 'off', message: 'The edit screen is not set up yet.' });
  if (req.method === 'GET' && p === '/edit/api/shows') {
    const who = editor(req, url);
    if (!who) return json(401, { error: 'signed_out' });
    return json(200, { editor: who, shows: readShows(DATA, SHOWS) });
  }
  if (req.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST' });
  if (!sameOrigin(req.headers)) return json(403, { error: 'origin', message: 'Refused: this has to come from the edit page itself.' });

  if (p === '/edit/login') {
    const isJson = /json/.test(req.headers['content-type'] ?? '');
    const raw = await readBody(req);
    if (raw == null) return json(413, { error: 'too_big' });
    let b;
    try { b = isJson ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw)); } catch { return json(400, { error: 'bad_body' }); }
    const username = String(b?.username ?? '').trim().toLowerCase().slice(0, 64);
    // JSON from edit.js; a plain form post (no JS) gets a redirect back to the page.
    const fail = (status, error, message) => (isJson ? json(status, { error, message }) : redirect(res, url, `/edit/?login=${error}`));
    // 10 tries per IP per 15 minutes; 5 wrong passwords lock that name for 15 minutes (known or not, so it reveals nothing).
    if (!allow(`ip:${clientIp(req)}`, 10, 15 * 60e3) || locked(`user:${username}`)) return fail(429, 'locked', LOCKED);
    const name = checkLogin(EDITORS, username, b?.password);
    if (!name) { recordFailure(`user:${username}`); return fail(401, 'wrong', WRONG); }
    clearFailures(`user:${name}`);
    console.log(new Date().toISOString(), 'editor signed in:', name);
    const cookie = cookieHeader(signSession(name, Date.now() + SESSION_DAYS * 864e5, SECRET, EDITORS.get(name)), { secure: isHttps(req) });
    return isJson ? json(200, { ok: true, editor: name }, { 'Set-Cookie': cookie }) : redirect(res, url, '/edit/', { 'Set-Cookie': cookie });
  }

  const who = editor(req, url);
  if (!who) return json(401, { error: 'signed_out' });
  if (p === '/edit/logout') return json(200, { ok: true }, { 'Set-Cookie': cookieHeader('', { secure: isHttps(req), maxAge: 0 }) });
  if (p === '/edit/api/shows') {
    // JSON only: a cross-site HTML form can't send this content type (one more wall on top of SameSite and Origin).
    if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) return json(415, { error: 'json_only' });
    const raw = await readBody(req);
    if (raw == null) return json(413, { error: 'too_big', errors: [{ row: null, message: 'That list is too big to save. Delete some old shows.' }] });
    let b;
    try { b = JSON.parse(raw); } catch { return json(400, { error: 'bad_body', errors: [{ row: null, message: 'That save got garbled. Try again.' }] }); }
    const r = checkShows(Array.isArray(b) ? b : b?.shows);
    if (r.errors) return json(400, { error: 'invalid', errors: r.errors });
    saveShows(DATA, r.rows, SHOWS);
    console.log(new Date().toISOString(), `shows saved by ${who}: ${r.rows.length} rows`);
    return json(200, { ok: true, shows: r.rows, message: "Saved. It's on the site now." });
  }
  return json(404, { error: 'not_found' });
}

function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/signup') return handleSignup(req, res, url);
  if (['/edit/login', '/edit/logout'].includes(url.pathname) || url.pathname.startsWith('/edit/api/')) {
    return handleEdit(req, res, url).catch((e) => {
      console.error('edit failed:', e.message);
      if (!res.headersSent) { res.writeHead(500, { ...baseHeaders(url), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end('{"error":"server"}'); }
    });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { ...baseHeaders(url), Allow: 'GET, HEAD' }); return res.end(); }
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return notFound(req, res, url); }
  let file = normalize(join(DIST, p));
  if (file !== DIST && !file.startsWith(DIST + sep)) return notFound(req, res, url);
  let st = statSafe(file);
  if (st?.isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { ...baseHeaders(url), Location: `${url.pathname}/${url.search}` }); return res.end(); }
    file = join(file, 'index.html');
    st = statSafe(file);
  }
  if (!st?.isFile()) return notFound(req, res, url);
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  if (type.startsWith('text/html')) {
    let html = readFileSync(file, 'utf8');
    try { html = inject(html, p); } catch (e) { console.error('inject failed, serving the static page', e.message); }
    const edit = p.startsWith('/edit/') ? { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } : {};
    return send(req, res, url, 200, type, Buffer.from(html), { 'Cache-Control': 'no-cache', ...edit });
  }
  send(req, res, url, 200, type, readFileSync(file), { 'Cache-Control': p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400' });
}

export const server = createServer(handle);
// Tests import this file without listening; `node server.js` listens.
if (process.argv[1] && import.meta.filename === process.argv[1]) server.listen(PORT, () => console.log(`GLucak site on :${PORT}`));
