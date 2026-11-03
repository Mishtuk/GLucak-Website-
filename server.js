// The GLucak website server: serves the static Astro build in dist/ with strict security headers and fills the
// shows list into the HTML at the <!--gl:shows--> marker on every request (so past shows drop off by themselves).
// Node 22+ built-ins only. Admin / sign-in come later (Gabe's edit screen).
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { brotliCompressSync, constants as zc, gzipSync } from 'node:zlib';
import { showsHtml } from './src/lib/shows.js';

const ROOT = import.meta.dirname;
const DIST = process.env.DIST_DIR || join(ROOT, 'dist');
const SHOWS = process.env.SHOWS_FILE || join(ROOT, 'src/data/shows.json');
const PORT = Number(process.env.PORT) || 8080;

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
  const rows = JSON.parse(readFileSync(SHOWS, 'utf8'));
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

function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
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
    return send(req, res, url, 200, type, Buffer.from(html), { 'Cache-Control': 'no-cache' });
  }
  send(req, res, url, 200, type, readFileSync(file), { 'Cache-Control': p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400' });
}

export const server = createServer(handle);
// Tests import this file without listening; `node server.js` listens.
if (process.argv[1] && import.meta.filename === process.argv[1]) server.listen(PORT, () => console.log(`GLucak site on :${PORT}`));
