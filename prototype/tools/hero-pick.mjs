// One side-by-side image of hero A and hero B for the owner's pick (D14). Run after `node prototype/check.mjs`
// (or `--shots`), which makes the four screenshots this lays out.
//   node prototype/tools/hero-pick.mjs   -> prototype/shots/hero-pick.png
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SHOTS = resolve(import.meta.dirname, '..', 'shots');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const src = (f) => pathToFileURL(join(SHOTS, f)).href;
const W = 1360, H = 1520;

const row = (k, title, note) => `
  <h2>${title} <small>${note}</small></h2>
  <div class="row"><figure><img src="${src(`hero-${k}-390x660-first.png`)}" width="390" height="660"><figcaption>Phone, 390x660 (first screen)</figcaption></figure>
  <figure><img src="${src(`hero-${k}-1280-first.png`)}" width="896" height="560"><figcaption>Laptop, 1280x800, shown at 70%</figcaption></figure></div>`;
const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;padding:20px 24px;background:#e9e6df;color:#111;font:16px/1.3 system-ui,sans-serif;width:${W - 48}px}
  h1{margin:0 0 4px;font-size:26px} p{margin:0 0 12px} h2{margin:14px 0 8px;font-size:21px} small{font-weight:400;font-size:15px;color:#444}
  .row{display:flex;gap:24px;align-items:flex-start} figure{margin:0} img{display:block;border:1px solid #111}
  figcaption{font-size:14px;color:#444;margin-top:4px}
</style>
<h1>GLucak Home: pick a hero (D14)</h1>
<p>Same page, same photos (Alexander Kealey; hero B's phone slot is the MCCC MSP video still). Colors are the placeholder era, not IDENTITY.</p>
${row('a', 'A: GLUCAK over the full photo', 'on phones his face is small and dark at the top; on a laptop it sits between G and L')}
${row('b', 'B: the photo set into the name, G[photo]LUCAK', 'photo at full strength, no text over it; thumbnail-sized on phones')}`;

const dir = mkdtempSync(join(tmpdir(), 'glpick-'));
writeFileSync(join(dir, 'pick.html'), html);
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${join(dir, 'p')}`, '--no-first-run', '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
const ws = new WebSocket(wsUrl); await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Page.navigate', { url: pathToFileURL(join(dir, 'pick.html')).href }, sessionId);
  await sleep(1500);
  const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(join(SHOTS, 'hero-pick.png'), Buffer.from(data, 'base64'));
  console.log('wrote', join(SHOTS, 'hero-pick.png'));
} finally {
  ws.close(); chrome.kill(); await sleep(300);
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* Chrome can hold the folder briefly on Windows */ }
}
