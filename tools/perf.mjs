// Lighthouse-style numbers without Lighthouse (not installed). Starts server.js, loads each page in headless Chrome at 390px
// (cold cache, no throttling), prints transfer by type, LCP, CLS, images missing width/height, fonts loaded.
//   node tools/perf.mjs      (run `npm run build` first)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8391, BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, SHOP_ENABLED: '1' }, stdio: 'ignore' });
const profile = mkdtempSync(join(tmpdir(), 'glperf-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
const ws = new WebSocket(wsUrl); await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map(); const listeners = [];
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } else listeners.forEach((f) => f(m)); };
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p) => send(m, p, sessionId);
await cdp('Page.enable'); await cdp('Network.enable'); await cdp('Network.setCacheDisabled', { cacheDisabled: true });
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.__lcp=null;window.__cls=0;
  new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp={t:Math.round(e.startTime),size:e.size,el:(e.element?.tagName||'')+'.'+(e.element?.className||'')+' '+(e.url||'').split('/').pop()}}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});` });
const ev = async (expr) => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
const kind = (t, url) => /font/.test(t) || /woff/.test(url) ? 'fonts' : /image/.test(t) ? 'img' : /css/.test(t) ? 'css' : /javascript/.test(t) ? 'js' : /html/.test(t) ? 'html' : 'other';

const out = {};
for (const path of ['/', '/music/', '/shows/', '/about/', '/shop/']) {
  const reqs = new Map(); const ls = (m) => {
    if (m.sessionId !== sessionId) return;
    const p = m.params;
    if (m.method === 'Network.responseReceived') reqs.set(p.requestId, { url: p.response.url, type: p.response.mimeType, bytes: 0 });
    if (m.method === 'Network.loadingFinished' && reqs.has(p.requestId)) reqs.get(p.requestId).bytes = p.encodedDataLength;
  };
  listeners.push(ls);
  await cdp('Page.navigate', { url: BASE + path }); await sleep(3500);
  const scan = () => { const t = { html: 0, css: 0, js: 0, fonts: 0, img: 0, other: 0 }; for (const r of reqs.values()) if (!/spotify|youtube/.test(r.url)) t[kind(r.type, r.url)] += r.bytes; t.total = Object.values(t).reduce((a, b) => a + b, 0); return t; };
  const first = scan();
  const info = await ev(`({lcp:window.__lcp,cls:+window.__cls.toFixed(4),noSize:[...document.images].filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).map(i=>i.src.split('/').pop()),
    fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight),eager:[...document.images].filter(i=>i.loading!=='lazy').length})`);
  await ev(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}})()`); await sleep(1200);
  const all = scan();
  listeners.splice(listeners.indexOf(ls), 1);
  const kb = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v / 1024)]));
  out[path] = { firstLoadKB: kb(first), afterScrollKB: all.total >> 10, ...info };
}
console.log(JSON.stringify(out, null, 1));
ws.close(); chrome.kill(); srv.kill(); try { rmSync(profile, { recursive: true, force: true }); } catch {}
