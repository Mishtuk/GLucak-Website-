// One image of the heroes: the live default (D34: A under 900px, B from 900px), then A and B on their own (D14).
//   node prototype/tools/hero-pick.mjs                     -> prototype/shots/hero-pick.png, laid out from the six
//                                                            screenshots `node prototype/check.mjs` (or `--shots`) makes
//   node prototype/tools/hero-pick.mjs --era identity-guess -> prototype/shots/hero-pick-identity-guess.png; takes its own
//                                                            six screenshots in that era (kept in a temp folder)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PROTO = resolve(import.meta.dirname, '..');
const SHOTS = join(PROTO, 'shots');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 1360, H = 2290;
const eraArg = process.argv.indexOf('--era');
const era = eraArg > -1 ? process.argv[eraArg + 1] : null;
if (era != null && !/^[a-z0-9-]+$/.test(era)) throw new Error('--era takes an era slug, like identity-guess');

const dir = mkdtempSync(join(tmpdir(), 'glpick-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${join(dir, 'p')}`, '--no-first-run', '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
const ws = new WebSocket(wsUrl); await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });

// With --era: serve prototype/ the same way check.mjs does, and take the six first-screen shots in that era.
let server = null;
async function eraShots(sessionId) {
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[\\/]+/, '') || 'index.html';
    if (path.startsWith('..')) { res.writeHead(404); return res.end(); } // an encoded ../ must not leave prototype/
    try { const body = readFileSync(join(PROTO, path)); res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(body); } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/index.html`;
  const ev = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId)).result?.value;
  for (const k of ['ab', 'a', 'b']) for (const [w, h, tag] of [[390, 660, '390x660'], [1280, 800, '1280']]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 }, sessionId);
    await send('Page.navigate', { url: `${base}?hero=${k}&era=${era}` }, sessionId);
    for (let i = 0; i < 100; i++) { await sleep(50); if ((await ev('document.readyState')) === 'complete') break; }
    await ev('document.fonts.ready.then(()=>true)');
    await ev(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>0)}))`);
    await sleep(400);
    const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    writeFileSync(join(dir, `hero-${k}-${tag}-first.png`), Buffer.from(data, 'base64'));
  }
}

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  if (era) await eraShots(sessionId);
  const from = era ? dir : SHOTS;
  const src = (f) => pathToFileURL(join(from, f)).href;
  const row = (k, title, note) => `
  <h2>${title} <small>${note}</small></h2>
  <div class="row"><figure><img src="${src(`hero-${k}-390x660-first.png`)}" width="390" height="660"><figcaption>Phone, 390x660 (first screen)</figcaption></figure>
  <figure><img src="${src(`hero-${k}-1280-first.png`)}" width="896" height="560"><figcaption>Laptop, 1280x800, shown at 70%</figcaption></figure></div>`;
  const colors = era === 'identity-guess'
    ? 'Colors are <b>our guess at IDENTITY</b>, sampled from the smart-link art (wingsmusic.lnk.to/IDENTITY), not Gabe\u2019s. His real art and colors replace them.'
    : era ? `Colors are the ${era} era, not IDENTITY.` : 'Colors are the placeholder era, not IDENTITY.';
  const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;padding:20px 24px;background:#e9e6df;color:#111;font:16px/1.3 system-ui,sans-serif;width:${W - 48}px}
  h1{margin:0 0 4px;font-size:26px} p{margin:0 0 12px} h2{margin:14px 0 8px;font-size:21px} small{font-weight:400;font-size:15px;color:#444}
  .row{display:flex;gap:24px;align-items:flex-start} figure{margin:0} img{display:block;border:1px solid #111}
  figcaption{font-size:14px;color:#444;margin-top:4px}
</style>
<h1>GLucak Home: the hero (D34)${era === 'identity-guess' ? ', in the IDENTITY guess colors' : ''}</h1>
<p>Photos are the Desktop's treatments of Alexander Kealey's photo: (a) era grade for A, (b) riso for B (hero B's phone slot, ?hero=b only, is (f), the MCCC MSP still). No audience face is in any crop. ${colors}</p>
${row('ab', 'Live default (D34, ?hero=ab): A on phones, B from 900px', 'phones: his face in the open strip above the name; 900px and up: the riso set into the name')}
${row('a', 'A only (?hero=a): GLUCAK over the photo', 'treatment (a); on a laptop the name covers him')}
${row('b', 'B only (?hero=b): the photo set into the name, G[photo]LUCAK', 'no text over it; thumbnail-sized on phones')}`;
  writeFileSync(join(dir, 'pick.html'), html);
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Page.navigate', { url: pathToFileURL(join(dir, 'pick.html')).href }, sessionId);
  await sleep(1500);
  const out = join(SHOTS, era ? `hero-pick-${era}.png` : 'hero-pick.png');
  const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(out, Buffer.from(data, 'base64'));
  console.log('wrote', out);
} finally {
  ws.close(); chrome.kill(); server?.close(); await sleep(300);
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* Chrome can hold the folder briefly on Windows */ }
}
