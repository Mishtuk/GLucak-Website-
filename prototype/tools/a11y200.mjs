// 200% text checks (a11y audit row 1, WCAG 1.4.4 / 1.4.10; DESIGN.md section 17).
//   node prototype/tools/a11y200.mjs                       every page at 320 / 390 / 1280, root font 100% and 200%, first-screen
//                                                          shots at 200% -> docs/review/a11y-200/ (OUT=dir to redirect, --full for full pages)
//   node prototype/tools/a11y200.mjs --url <base> [--inject] [--shots]   the same checks on the real build (node server.js);
//                                                          --inject adds the prototype section 17 block first; no shots
//                                                          unless --shots; pages are the build's routes
//   node prototype/tools/a11y200.mjs --eval <page> <w> <font%> <js>   print one expression (debugging)
// Root font 200% = a `html { font-size: 200% !important }` <style> injected at document start (before the page's CSS) (text-only zoom: rem and em double, px and
// px media queries stay). Same harness as round2.mjs: the prototype served with the site's real CSP, headless Chrome over
// the DevTools Protocol, exact widths via Emulation.setDeviceMetricsOverride (true 320 / 390, no window-size guess).
// Reports per view: sideways scroll (document scrollWidth AND any box past the viewport, because body{overflow-x:clip}
// hides the scrollbar), overlapping text / controls / pictures, text clipped by an overflow box, and targets under 48px.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const urlIdx = args.indexOf('--url');
const EXT = urlIdx >= 0 ? args[urlIdx + 1].replace(/\/$/, '') + '/' : null;
const WANT_SHOTS = !EXT || args.includes('--shots');
// --inject: the build plus the prototype's section 17 block (from its header to the end of styles.css), so the port can be
// checked on the build before the Desktop copies it. .yt-note becomes the build's .yt-title.
const INJECT = args.includes('--inject') ? (() => { const css = readFileSync(join(ROOT, 'styles.css'), 'utf8'); return css.slice(css.lastIndexOf('/* ====', css.indexOf('17. Text at 200%'))).replaceAll('.yt-note', '.yt-title'); })() : '';
// What 17b item 15 removes from the build (c8a4aa1's first 200% pass), undone here so --inject tests the port as specified.
const UNDO = `.header-bar{container-type:normal}.mark+.brand-word{display:inline}.hero-actions .btn{flex:1}
.links{grid-template-columns:repeat(2,minmax(0,1fr))}@media (min-width:380px){.links{grid-template-columns:repeat(3,minmax(max-content,1fr))}}
@media (min-width:900px){.site-footer .links{grid-template-columns:repeat(7,minmax(max-content,1fr))}}.links-lg{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:520px){.links-lg{grid-template-columns:repeat(3,minmax(max-content,1fr))}}
@container (max-width:17rem){.poster .btn-show{margin-bottom:0}}`;
const OUT = process.env.OUT || resolve(ROOT, '..', 'docs', 'review', 'a11y-200', EXT ? 'build' : '');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src https://open.spotify.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'";
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ics': 'text/calendar; charset=utf-8' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[\\/]+/, '') || 'index.html';
  if (path.startsWith('..')) { res.writeHead(404); return res.end(); }
  try {
    const body = readFileSync(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = EXT || `http://127.0.0.1:${server.address().port}/`;

const profile = mkdtempSync(join(tmpdir(), 'gla11y-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  // /edit/ asks before leaving (beforeunload); accept, or the next navigation waits forever
  else if (m.method === 'Page.javascriptDialogOpening') ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true }, sessionId: m.sessionId }));
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
// A fresh tab per view: /edit/ asks before leaving (beforeunload), and closing a tab skips that, where navigating waits.
let targetId = null, sessionId = null;
const cdp = (m, p) => send(m, p, sessionId);
async function freshTab() {
  if (targetId) await send('Target.closeTarget', { targetId });
  ({ targetId } = await send('Target.createTarget', { url: 'about:blank' }));
  ({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }));
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Page.setBypassCSP', { enabled: true }); // so the 200% <style> injected at document start applies on the build too
  await cdp('Network.enable'); await cdp('Network.setBlockedURLs', { urls: ['*open.spotify.com*', '*scdn.co*', '*youtube*', '*ytimg*'] }); // offline-fast; the player box keeps its size
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); // no fades mid-way: shots compare pixel for pixel
}
const evaluate = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
async function load(page, w, h, font) {
  await freshTab();
  (await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `{const put=()=>{const s=document.createElement('style');s.textContent='${font === 100 ? '' : `html{font-size:${font}% !important}`}';document.documentElement.appendChild(s)};if(document.documentElement)put();else new MutationObserver((m,o)=>{if(document.documentElement){o.disconnect();put()}}).observe(document,{childList:true});${INJECT ? `document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(UNDO + INJECT)};document.body.append(s)})` : ''}}` })).identifier;
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await cdp('Page.navigate', { url: BASE + page });
  for (let i = 0; i < 100; i++) { await sleep(50); if ((await evaluate('document.readyState')) === 'complete') break; }
  await evaluate('document.fonts.ready.then(()=>true)');
  await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>0)}))`);
  await evaluate(`document.querySelectorAll('.fade').forEach(n=>n.classList.add('seen'))`);
  if (page.includes('#')) await evaluate(`document.getElementById(${JSON.stringify(page.split('#')[1])})?.scrollIntoView()`);
  await sleep(200);
}

// One pass over the page. Boxes: every text run (Range rects), every control, every content picture. Pictures that are a
// ground by design (hero photo, About photo, the glow, Spotify) are left out; text over them is the design.
// W is the device width asked for, not innerWidth: in mobile emulation (as on a phone) Chrome widens the layout viewport
// to fit content that overflows, so innerWidth itself grows with the bug.
const CHECK = (W) => String.raw`(()=>{
  const W=${W}, out={sw:document.documentElement.scrollWidth, w:W, over:[], overlap:[], clip:[], small:[]};
  const skip=e=>e.closest('.vh,.hp,.skip,.defs,script,style,noscript,[hidden],.sheet,details:not([open]) > :not(summary)');
  const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false}return true};
  const name=e=>{const c=typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\s+/)[0]:'';return (e.tagName.toLowerCase()+c+':'+(e.getAttribute('aria-label')||e.textContent||e.alt||'').trim().replace(/\s+/g,' ').slice(0,18))};
  const sx=scrollX, sy=scrollY;
  const layer=e=>{for(let n=e;n;n=n.parentElement){const p=getComputedStyle(n).position;if(p==='fixed'||p==='sticky')return n}return null};
  const boxes=[];
  // text runs
  const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=tw.nextNode()){
    if(!n.textContent.trim())continue;const p=n.parentElement;if(skip(p)||p.closest('svg')||!vis(p))continue;
    const rg=document.createRange();rg.selectNodeContents(n);
    for(const r of rg.getClientRects()){if(r.width<1||r.height<1)continue;
      // shrink to the glyph band: line boxes of display type overlap by design (line-height 0.82)
      const fs=parseFloat(getComputedStyle(p).fontSize), lh=r.height, pad=Math.max(0,(lh-fs*0.7)/2);
      boxes.push({k:'text',e:p,f:layer(p),l:r.left+sx,t:r.top+sy+pad,r:r.right+sx,b:r.bottom+sy-pad,id:name(p)})}
  }
  for(const e of document.querySelectorAll('a,button,summary,input,select,textarea,img,iframe,.yt')){
    if(skip(e)||!vis(e))continue;
    if(e.matches('.hero-photo img,.push-photo,.slot img,.glow,iframe.player,.mark'))continue;
    // the row calendar glyph draws 24px inside a 48px box that reaches into padding on purpose (16c): test the glyph
    const r=(e.matches('.cal-btn')?e.querySelector('svg'):e).getBoundingClientRect();boxes.push({k:e.tagName==='IMG'?'img':'ctl',e,f:layer(e),l:r.left+sx,t:r.top+sy,r:r.right+sx,b:r.bottom+sy,id:name(e)});
  }
  // sideways: anything past the viewport (the glow, and the placeholder chip's own box, are exempt)
  for(const e of document.querySelectorAll('body *')){
    if(skip(e)||e.matches('.glow,.defs *,svg *')||!vis(e))continue;
    const r=e.getBoundingClientRect();
    if(r.right>W+1||r.left<-1){out.over.push(name(e)+' '+Math.round(r.left)+'..'+Math.round(r.right));}
  }
  out.over=[...new Set(out.over)].slice(0,8);
  // overlaps between boxes that are not nested (a box inside its own link or label is fine)
  const hit=(a,b)=>Math.min(a.r,b.r)-Math.max(a.l,b.l)>2&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>2;
  const rel=(a,b)=>a.e===b.e||a.e.contains(b.e)||b.e.contains(a.e)||(a.e.closest('a,button,label,summary')&&a.e.closest('a,button,label,summary')===b.e.closest('a,button,label,summary'));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];
    if(a.k==='text'&&b.k==='text'&&a.e===b.e)continue;
    if(rel(a,b)||!hit(a,b))continue;
    // fixed / sticky bars ride over the page as it scrolls: compare them only with their own layer
    // (except the header at the top of the page: nothing may start under it)
    if(a.f!==b.f&&!(sy===0&&[a.f,b.f].some(x=>x&&x.matches('.site-header'))&&[a.f,b.f].includes(null)))continue;
    // the tape is stuck on the picture's corner by design (14c)
    if((a.e.closest('.product-tape')&&b.k==='img')||(b.e.closest('.product-tape')&&a.k==='img'))continue;
    // the placeholder chips are prototype-only stickers
    if(a.e.closest('.ph-chip')||b.e.closest('.ph-chip'))continue;
    out.overlap.push(a.id+' x '+b.id);
  }
  out.overlap=[...new Set(out.overlap)].slice(0,10);
  // clipped: a text run that leaves an ancestor that clips (overflow hidden / clip) or leaves the viewport sideways
  for(const b of boxes){if(b.k!=='text')continue;
    if(b.r-sx>W+1||b.l-sx<-1){out.clip.push(b.id+' off-screen');continue}
    for(let a=b.e.parentElement;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);
      if(/hidden|clip/.test(s.overflowX)){const r=a.getBoundingClientRect();if(b.r-sx>r.right+1||b.l-sx<r.left-1){out.clip.push(b.id+' in '+name(a));break}}}
  }
  out.clip=[...new Set(out.clip)].slice(0,8);
  // targets: links and buttons outside running text, under 48px either way
  for(const e of document.querySelectorAll('a,button,summary,input,select,textarea')){
    if(skip(e)||!vis(e)||e.matches('input[type=radio],.ed-file-input'))continue;
    if(e.closest('p.ph-note,.product-desc'))continue;
    const r=e.getBoundingClientRect();if(r.height<47.5||r.width<47.5)out.small.push(name(e)+' '+Math.round(r.width)+'x'+Math.round(r.height));
  }
  out.small=[...new Set(out.small)].slice(0,8);
  out.h=document.documentElement.scrollHeight;out.iw=innerWidth;
  return out})()`;

async function fullShot(file, w) {
  const h = await evaluate('document.documentElement.scrollHeight');
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: Math.min(h, 16000), deviceScaleFactor: 1, mobile: w < 700 });
  await sleep(300);
  writeFileSync(join(OUT, file), Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
}
const firstScreen = async (file) => writeFileSync(join(OUT, file), Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64'));

const PROTO = [['home', 'index.html'], ['home-noshows', 'index.html?shows=none'], ['home-identity', 'index.html?era=identity-guess'], ['music', 'music.html'], ['shop', 'shop.html'],
  ['product', 'shop.html#product-sample-glucak-tee'], ['404', '404.html'], ['edit-signin', 'edit.html'], ['edit-shows', 'edit.html?view=editor&open=0'],
  ['edit-products', 'edit.html?view=editor&tab=products&open=0'], ['edit-ask', 'edit.html?view=editor&ask=1&bar=dirty']];
const BUILD = [['home', ''], ['music', 'music/'], ['shows', 'shows/'], ['about', 'about/'], ['shop', 'shop/'], ['product', 'shop/#product-sample-glucak-tee'], ['privacy', 'privacy/'], ['edit', 'edit/']];

const report = [];
const line = (s) => { report.push(s); console.log(s); };
try {
  mkdirSync(OUT, { recursive: true });
  if (args[0] === '--look') { // --look <page> <w> <font%> <selector> <file>: the screen with that element at its top
    await load(args[1], +args[2], +args[2] < 700 ? 760 : 800, +args[3]);
    await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(args[4])});if(e){const y=e.getBoundingClientRect().top+scrollY-80;document.documentElement.style.scrollBehavior='auto';scrollTo(0,Math.max(0,y))}})()`);
    await sleep(300); await firstScreen(args[5]); line(args[5]);
  } else if (args[0] === '--eval') {
    await load(args[1], +args[2], 800, +args[3]);
    line(JSON.stringify(await evaluate(args[4]), null, 1));
  } else {
    const pages = EXT ? BUILD : PROTO;
    let bad = 0;
    for (const [nm, page] of pages) for (const font of [100, 200]) for (const w of [320, 390, 1280]) {
      await load(page, w, w < 700 ? 760 : 800, font);
      const r = await evaluate(CHECK(w));
      const issues = [(r.sw > w + 1 || r.iw > w) && `scrollWidth ${r.sw}, innerWidth ${r.iw}`, r.over.length && 'past the edge: ' + r.over.join(', '), r.overlap.length && 'overlap: ' + r.overlap.join(' | '), r.clip.length && 'clipped: ' + r.clip.join(', '), r.small.length && 'under 48: ' + r.small.join(', ')].filter(Boolean);
      if (issues.length) bad++;
      line(`${nm} ${w} ${font}%: ${issues.length ? issues.join('; ') : 'ok'} (page ${r.h}px)`);
      // First screen at 200% only (full pages at 200% run to 9000px, 4 MB each); --full: full pages at both sizes.
      if (WANT_SHOTS && (font === 200 || args.includes("--full"))) {
        const file = `${nm}-${w}-${font}.png`;
        if (!args.includes("--full") || page.includes("#") || nm.startsWith("edit")) await firstScreen(file); else await fullShot(file, w);
      }
    }
    line(`${bad} views with issues`);
    writeFileSync(join(OUT, 'report.txt'), report.join('\n') + '\n');
  }
} finally {
  ws.close(); chrome.kill(); server.close();
  await sleep(300); try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
