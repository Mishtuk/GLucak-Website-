// Share images (1200x630) for each page -> public/media/og/<page>.png. Node 22+ and Chrome, no dependencies beyond sharp.
//   node tools/og.mjs [--era src/eras/placeholder.json]
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..');
const PUB = join(ROOT, 'public');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const eraPath = process.argv.includes('--era') ? process.argv[process.argv.indexOf('--era') + 1] : join(ROOT, 'src/eras/placeholder.json');
const era = JSON.parse(readFileSync(eraPath, 'utf8'));
const C = era.colors;
const u = (p) => pathToFileURL(join(PUB, p)).href;
const SLOGAN = 'Rise, Live It Loud, Push Past Fear, The Time Is Now.';
const covers = ['duck-dodge-jump-fight', 'rapping-like-oh-yeah', 'one-and-done', 'go', 'glucak-deluxe-edition', 'time-is-at-the-essence', 'earned-your-stripes-live-at-riverside', 'fall-down-7-stand-up-8-a-remix-album'].map((c) => `<img src="${u(`media/covers/${c}.webp`)}">`).join('');
const shop = ['tee', 'hoodie', 'identity-cd', 'sticker'].map((c) => `<img src="${u(`media/shop/sample-${c}.webp`)}">`).join('');

// word: the page word; art: right-hand visual
const pages = {
  home: { word: '', art: `<div class="photo" style="background-image:url(${u('media/a-era-grade-1600.webp')})"></div>`, slogan: true },
  about: { word: 'ABOUT', art: `<div class="photo" style="background-image:url(${u('media/a-era-grade-1600.webp')})"></div>` },
  shows: { word: 'SHOWS', art: `<div class="photo" style="background-image:url(${u('media/c-poster-1000.webp')});background-position:50% 30%"></div>` }, // gig poster on Gabe, no fan as focal point
  music: { word: 'MUSIC', art: `<div class="grid g4">${covers}</div>` },
  shop: { word: 'SHOP', art: `<div class="grid g2">${shop}</div><div class="tag">Preview</div>` },
};

const html = ({ word, art, slogan }) => `<!doctype html><meta charset=utf-8><style>
@font-face{font-family:BSD;font-weight:900;src:url(${u('fonts/big-shoulders-display-900.woff2')})}
@font-face{font-family:AHN;font-weight:200 800;src:url(${u('fonts/atkinson-hyperlegible-next-wght.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:${C.bg};color:${C.text};font-family:AHN}
.art{position:absolute;right:0;top:0;width:640px;height:630px}
.photo{width:100%;height:100%;background-size:cover;background-position:center;}  /* treatments are already graded (D34): keep their colour */
.photo::after{content:"";position:absolute;inset:0;background:${C.accent};mix-blend-mode:multiply;opacity:.45}
.art::before{content:"";position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,${C.bg} 0,${C.bg}00 55%)}
.grid{display:grid;gap:10px;padding:40px 40px 40px 60px;height:100%;align-content:center}
.g4{grid-template-columns:repeat(4,1fr)}.g2{grid-template-columns:repeat(2,1fr);padding:30px 40px 30px 120px}
.grid img{width:100%;aspect-ratio:1;object-fit:cover;display:block;box-shadow:0 0 0 2px ${C.bg}}
.tag{position:absolute;z-index:3;right:40px;top:30px;background:${C.accent};color:${C['accent-text']};font:700 22px AHN;padding:6px 16px;text-transform:uppercase;letter-spacing:.12em}
.copy{position:absolute;z-index:3;left:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:10px}
.mark{width:130px;margin-bottom:6px}
h1{font:900 190px/.85 BSD;letter-spacing:.01em}
h2{font:900 120px/.9 BSD;color:${C.accent};letter-spacing:.02em}
p{font:600 28px/1.25 AHN;color:${C.muted};max-width:430px;margin-top:10px}
.grain{position:absolute;inset:0;z-index:5;background:url(${u('grain.png')});opacity:.35;mix-blend-mode:overlay}
</style><div class="art">${art}</div>
<div class="copy"><img class="mark" src="${u(era.mark.replace(/^\//, ''))}"><h1>GLUCAK</h1>${word ? `<h2>${word}</h2>` : ''}${slogan ? `<p>${SLOGAN}</p>` : ''}</div>
<div class="grain"></div>`;

const profile = mkdtempSync(join(tmpdir(), 'glog-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--allow-file-access-from-files', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
const ws = new WebSocket(wsUrl); await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } };
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p) => send(m, p, sessionId);
await cdp('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
mkdirSync(join(PUB, 'media/og'), { recursive: true });
const tmp = join(profile, 'og.html');
try {
  for (const [name, p] of Object.entries(pages)) {
    writeFileSync(tmp, html(p));
    await cdp('Page.navigate', { url: pathToFileURL(tmp).href });
    for (let i = 0; i < 100; i++) { await new Promise((r) => setTimeout(r, 50)); const r = await cdp('Runtime.evaluate', { expression: 'document.readyState==="complete"&&document.fonts.ready.then(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>0)))).then(()=>true)', awaitPromise: true, returnByValue: true }); if (r.result.value) break; }
    const png = Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64');
    let out = await sharp(png).png({ palette: true, quality: 90, colours: 256, effort: 10 }).toBuffer();
    if (out.length > 300 * 1024) out = await sharp(png).png({ palette: true, quality: 70, colours: 128, effort: 10 }).toBuffer();
    writeFileSync(join(PUB, 'media/og', `${name}.png`), out);
    console.log(name, Math.round(out.length / 1024) + ' KB');
  }
} finally { ws.close(); chrome.kill(); try { rmSync(profile, { recursive: true, force: true }); } catch {} }
