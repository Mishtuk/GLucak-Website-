// Web copies of Gabe's files for the prototype. Node 22+ and Chrome, no dependencies (no sharp or Python on the Laptop).
//   node prototype/tools/resize.mjs
// Loads each source into headless Chrome over the DevTools Protocol, draws it on a canvas and exports it
// (OffscreenCanvas.convertToBlob, the same encoder as toBlob). Re-encoding through a canvas drops all metadata (EXIF,
// GPS, camera serials). The originals in assets/from-gabe/ are only read, never written. WebP starts at quality 0.82
// (plenty under the duotone and grain; a job can set its own `q`) and steps down until the file fits `maxKB`.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const PROTO = resolve(import.meta.dirname, '..');
const REPO = resolve(PROTO, '..');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// src: file under assets/from-gabe. out: file under prototype/assets.
// width/height: output size. crop: source rectangle [x, y, w, h] (default: whole image).
// pad: fit the crop inside the output with transparent (or `bg`) padding instead of stretching.
// Live photos are NOT made here any more (privacy, 2026-11-05): the whole Kealey frame and the Paslier still show audience
// faces. The prototype uses the Desktop's treatments (tools/photo/run.mjs -> docs/review/photo-treatments/, copied as they
// are into prototype/assets/), whose crops keep only Gabe, the stage and backs of heads. Never add a whole-frame job back.
const JOBS = [
  // Logo D (IDENTITY's mark): the whole mark, transparent, scaled only. Header shows it at 30px tall = 94px wide.
  { src: 'logo-d-identity.png', out: 'mark-identity-300.webp', width: 300, height: 96, type: 'image/webp', maxKB: 20, crop: [0, 0, 1554, 495] },
  // Favicon: the cross only, a plain square crop of the original (no redrawing). Wing tips that fall inside the
  // square stay, as drawn. 32px for tabs, 180px on the era ground for iOS home screens (iOS fills transparency black).
  { src: 'logo-d-identity.png', out: 'favicon-32.png', width: 32, height: 32, type: 'image/png', crop: [404, 31, 746, 446], pad: true },
  { src: 'logo-d-identity.png', out: 'apple-touch-icon-180.png', width: 180, height: 180, type: 'image/png', crop: [404, 31, 746, 446], pad: true, bg: '#111111', inset: 0.14 },
];

const server = createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://x').pathname).slice(1);
  if (name === '') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>resize</title>'); return; }
  if (!JOBS.some((j) => j.src === name)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': name.endsWith('.png') ? 'image/png' : 'image/jpeg' });
  res.end(readFileSync(join(REPO, 'assets', 'from-gabe', name)));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const profile = mkdtempSync(join(tmpdir(), 'glresize-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); });
  setTimeout(() => rej(new Error('no DevTools URL')), 15000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } };
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await send('Target.createTarget', { url: BASE });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
await sleep(500);

try {
  for (const j of JOBS) {
    // Same-origin image, so the canvas is not tainted. createImageBitmap applies EXIF orientation, then the bytes are gone.
    // Downscale in halving steps (each one a high-quality resample) so a 6000px source doesn't alias at 800px.
    const result = await evaluate(`(async () => {
      const j = ${JSON.stringify(j)};
      const blob = await (await fetch(${JSON.stringify(BASE)} + encodeURIComponent(j.src))).blob();
      const full = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      const [sx, sy, sw, sh] = j.crop || [0, 0, full.width, full.height];
      let src = await createImageBitmap(full, sx, sy, sw, sh);
      const scale = j.pad ? Math.min(j.width / sw, j.height / sh) * (1 - 2 * (j.inset || 0)) : j.width / sw;
      let tw = Math.round(sw * scale), th = Math.round(sh * scale);
      while (src.width / 2 > tw) src = await createImageBitmap(src, { resizeWidth: Math.round(src.width / 2), resizeHeight: Math.round(src.height / 2), resizeQuality: 'high' });
      src = await createImageBitmap(src, { resizeWidth: tw, resizeHeight: th, resizeQuality: 'high' });
      const c = new OffscreenCanvas(j.width, j.height), x = c.getContext('2d');
      if (j.bg) { x.fillStyle = j.bg; x.fillRect(0, 0, j.width, j.height); }
      x.drawImage(src, Math.round((j.width - tw) / 2), Math.round((j.height - th) / 2));
      const enc = async (quality) => { const b = await c.convertToBlob({ type: j.type, quality }); return b; };
      let q = j.q || 0.82, out = await enc(q);
      if (j.maxKB) while (out.size > j.maxKB * 1024 && q > 0.3) { q = +(q - 0.04).toFixed(2); out = await enc(q); }
      const bytes = new Uint8Array(await out.arrayBuffer());
      let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { b64: btoa(bin), q, type: out.type, srcW: full.width, srcH: full.height };
    })()`);
    if (result.type !== j.type) throw new Error(`${j.out}: Chrome made ${result.type}, wanted ${j.type}`);
    const file = join(PROTO, 'assets', j.out);
    writeFileSync(file, Buffer.from(result.b64, 'base64'));
    const kb = statSync(file).size / 1024;
    if (j.maxKB && kb > j.maxKB) throw new Error(`${j.out}: ${kb.toFixed(1)} KB is over the ${j.maxKB} KB budget`);
    console.log(`${j.out}: ${j.width}x${j.height} from ${j.src} (${result.srcW}x${result.srcH}), ${kb.toFixed(1)} KB${j.type === 'image/webp' ? `, quality ${result.q}` : ''}`);
  }
} catch (e) {
  console.error(e); process.exitCode = 1;
} finally {
  ws.close(); chrome.kill(); server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome can hold the folder briefly on Windows */ }
}
