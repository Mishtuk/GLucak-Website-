// Repeatable checks for the Home prototype. Node 22+ and Chrome, no dependencies.
//   node prototype/check.mjs            all checks and screenshots
//   node prototype/check.mjs --measure  print fitted-line widths in em, for the --w-* tokens in styles.css
//   node prototype/check.mjs --shots    screenshots only
// Serves prototype/ on localhost with the site's real CSP, drives Chrome over the DevTools Protocol, and sets exact
// viewport sizes with Emulation.setDeviceMetricsOverride, so 320 and 390 are true widths, not a window-size guess.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { inflateSync } from 'node:zlib';

const ROOT = import.meta.dirname;
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src https://open.spotify.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'";
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const mode = process.argv[2] || '--all';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- small PNG reader, for pixel measurements ---------- */
function readPng(buf) {
  let p = 8, w, h, bpp; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('latin1', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bpp = d[9] === 6 ? 4 : 3; }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], rowIn = y * (stride + 1) + 1, rowOut = y * stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[rowIn + x], a = x >= bpp ? px[rowOut + x - bpp] : 0, b = y ? px[rowOut - stride + x] : 0, c = x >= bpp && y ? px[rowOut - stride + x - bpp] : 0;
      let add = 0;
      if (f === 1) add = a; else if (f === 2) add = b; else if (f === 3) add = (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[rowOut + x] = (v + add) & 255;
    }
  }
  return { w, h, bpp, px };
}
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const meanLum = ({ w, h, bpp, px }) => { let s = 0; for (let i = 0; i < w * h; i++) s += lum(px[i * bpp], px[i * bpp + 1], px[i * bpp + 2]); return s / (w * h); };
function brightest({ w, bpp, px }, r, dpr = 1) { // worst background under text: 99.5th percentile, so one stray pixel doesn't decide it
  const v = [];
  for (let y = Math.floor(r.y * dpr); y < (r.y + r.h) * dpr; y += 2) for (let x = Math.floor(r.x * dpr); x < (r.x + r.w) * dpr; x += 2) { const i = (y * w + x) * bpp; if (i >= 0 && i + 2 < px.length) v.push(lum(px[i], px[i + 1], px[i + 2])); }
  v.sort((a, b) => a - b);
  return v[Math.floor(v.length * 0.995)] ?? 0;
}

/* ---------- static server with the real CSP ---------- */
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[\\/]+/, '') || 'index.html';
  if (path.startsWith('..')) { res.writeHead(404); return res.end(); } // an encoded ../ must not leave prototype/
  try {
    const body = readFileSync(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;

/* ---------- Chrome over DevTools Protocol ---------- */
const profile = mkdtempSync(join(tmpdir(), 'glcheck-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); });
  setTimeout(() => rej(new Error('no DevTools URL')), 15000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map(); const listeners = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  else listeners.forEach((f) => f(m));
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p) => send(m, p, sessionId);
await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
const problems = [];
listeners.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') problems.push('JS error: ' + m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description ?? ''));
  if (m.method === 'Log.entryAdded' && /Content Security Policy|Failed to load/i.test(m.params.entry.text)) problems.push(m.params.entry.text);
});
const evaluate = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
async function load(url, w, h, media = []) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await cdp('Emulation.setEmulatedMedia', { features: media });
  await cdp('Page.navigate', { url });
  for (let i = 0; i < 100; i++) { await sleep(50); if ((await evaluate('document.readyState')) === 'complete') break; }
  await evaluate('document.fonts.ready.then(()=>true)');
  await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>0)}))`);
  await sleep(150);
}
const shot = async (clip) => Buffer.from((await cdp('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) })).data, 'base64');
const fullShot = async (file) => { // grows the viewport to the page height, so the fixed bar lands at the true bottom
  await evaluate(`document.querySelectorAll('.fade').forEach(n=>n.classList.add('seen'))`);
  await sleep(750);
  const [w, h] = await evaluate('[innerWidth, document.documentElement.scrollHeight]');
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await sleep(200);
  writeFileSync(join(ROOT, 'shots', file), await shot());
};
const firstScreen = async (file) => writeFileSync(join(ROOT, 'shots', file), await shot());

const report = [];
const line = (s) => { report.push(s); console.log(s); };
mkdirSync(join(ROOT, 'shots'), { recursive: true });

try {
  if (mode === '--measure') {
    await load(BASE, 1280, 800);
    const out = await evaluate(`(()=>{const c=document.createElement('canvas').getContext('2d');c.font='900 1000px "Big Shoulders Display"';
      const m=s=>(c.measureText(s).width/1000).toFixed(4);
      return {name:m('GLUCAK'),g:m('G'),lucak:m('LUCAK'),sl1:m('RISE, LIVE IT LOUD,'),sl2:m('PUSH PAST FEAR, THE TIME IS NOW.'),slogan:m('RISE, LIVE IT LOUD, PUSH PAST FEAR, THE TIME IS NOW.'),live:m('LIVE IT LOUD'),push1:m('PUSH PAST'),push2:m('FEAR'),push:m('PUSH PAST FEAR'),now1:m('THE TIME'),now2:m('IS NOW'),rise:m('RISE'),date:m('MMM 00'),close:m('LISTEN. SHOWS. JOIN.')}})()`);
    console.log(out);
  } else {
    const shotsOnly = mode === '--shots';
    for (const [name, q] of [['hero-ab', '?hero=ab'], ['hero-a', '?hero=a'], ['hero-b', '?hero=b']]) {
      await load(BASE + q, 390, 844); await firstScreen(`${name}-390-first.png`); await fullShot(`${name}-390-full.png`);
      await load(BASE + q, 1280, 800); await firstScreen(`${name}-1280-first.png`); await fullShot(`${name}-1280-full.png`);
    }
    await load(BASE + '?shows=none', 390, 844); await fullShot('empty-shows-390-full.png');
    await load(BASE + '?shows=none', 390, 844); await evaluate(`document.querySelector('#shows').scrollIntoView();document.querySelectorAll('.fade').forEach(n=>n.classList.add('seen'))`); await sleep(800); await firstScreen('empty-shows-390.png');
    await load(BASE, 390, 844); await evaluate(`document.querySelector('.nav-mobile').open=true`); await sleep(100); await firstScreen('menu-open-390.png');
    await load(BASE + '?era=placeholder-b', 390, 844); await firstScreen('era-swap-390-first.png');
    for (const q of ['?hero=ab', '?hero=a', '?hero=b']) { await load(BASE + q, 390, 660); await firstScreen(`${q.slice(1).replace('=', '-')}-390x660-first.png`); }

    if (!shotsOnly) {
      line('CHECK 1: player top on the first phone screen (390x660), clear of the bar');
      for (const q of ['?hero=ab', '?hero=a', '?hero=b']) {
        await load(BASE + q, 390, 660);
        const r = await evaluate(`(()=>{const p=document.querySelector('.player').getBoundingClientRect(),b=document.querySelector('.phone-bar').getBoundingClientRect();return {top:p.top,bar:b.top,h:p.height}})()`);
        line(`  ${q}: player top ${r.top.toFixed(0)}px, bar top ${r.bar.toFixed(0)}px, ${(r.bar - r.top).toFixed(0)}px of player visible, player height ${r.h}px`);
      }

      line('CHECK 1b: the real Spotify embed, under the real CSP, logged out (fresh profile)');
      for (const [w, h] of [[390, 844], [1280, 800]]) {
        const before = problems.length;
        await load(BASE, w, h);
        await evaluate(`document.querySelector('.player-box').scrollIntoView({block:'center'})`);
        let frame; // cross-origin, so it runs as its own iframe target, not in this page's frame tree
        for (let i = 0; i < 40 && !frame; i++) { await sleep(250); frame = (await send('Target.getTargets')).targetInfos.find((t) => t.type === 'iframe' && t.url.startsWith('https://open.spotify.com/')); }
        await sleep(5000); // let the embed paint its tracklist
        const box = await evaluate(`(()=>{const b=document.querySelector('.player').getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height}})()`);
        const png = await shot({ x: box.x, y: box.y, width: box.w, height: box.h });
        writeFileSync(join(ROOT, 'shots', `player-${w}.png`), png);
        const { px, bpp } = readPng(png); const seen = new Set();
        for (let i = 0; i < px.length; i += bpp * 37) seen.add(px[i] >> 4 << 8 | px[i + 1] >> 4 << 4 | px[i + 2] >> 4);
        const csp = problems.slice(before).filter((p) => /spotify|frame/i.test(p));
        line(`  ${w}px: frame ${frame ? frame.url.split('?')[0] : 'NOT loaded'}, box ${box.w.toFixed(0)}x${box.h}px, ${seen.size} distinct colors painted (the bare box is 1), CSP/load errors: ${csp.length ? csp.join(' | ') : 'none'}`);
      }

      line('CHECK 2: slogan wrap and no horizontal scroll');
      for (const w of [320, 390, 1280]) for (const q of ['?hero=ab', '?hero=a', '?hero=b']) {
        await load(BASE + q, w, 660);
        const r = await evaluate(`(()=>{const de=document.documentElement,box=document.querySelector('.hero-inner').getBoundingClientRect();
          const name=document.querySelector('.name-row'),nr=[...name.children].filter(c=>getComputedStyle(c).display!=='none').map(c=>c.getBoundingClientRect());
          const lines=[...document.querySelectorAll('.sl')].map(s=>{const b=s.getBoundingClientRect();return {w:+b.width.toFixed(1),h:+b.height.toFixed(1),fs:parseFloat(getComputedStyle(s).fontSize).toFixed(1),rects:s.getClientRects().length}});
          const limit=${w};const over=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>limit+1&&!e.closest('.defs,.glow,.sheet')&&!e.matches('.glow')).slice(0,6).map(e=>(e.className&&e.className.baseVal===undefined?e.className:e.tagName)+':'+e.textContent.trim().slice(0,14)+':'+Math.round(e.getBoundingClientRect().right));
          const scrollW=de.scrollWidth;return {scrollW,inner:innerWidth,nameL:+Math.min(...nr.map(b=>b.left)).toFixed(1),nameR:+Math.max(...nr.map(b=>b.right)).toFixed(1),contentR:+(box.right-parseFloat(getComputedStyle(document.querySelector('.hero-inner')).paddingRight||0)).toFixed(1),lines,over}})()`);
        line(`  ${w}px ${q}: scrollWidth ${r.scrollW}/${r.inner}, GLUCAK x ${r.nameL} to ${r.nameR}, slogan ${r.lines.map((l) => `${l.w}px wide at ${l.fs}px`).join(' + ')}${r.over.length ? ', OVERFLOW: ' + r.over.join(' ') : ''}`);
      }

      line('CHECK 2b: D34 default (?hero=ab) downloads exactly one hero photo; his face sits in the open strip above the name (A)');
      for (const [w, h] of [[320, 660], [390, 660], [800, 1024], [899, 1024], [900, 800], [1280, 800]]) {
        await load(BASE, w, h);
        const r = await evaluate(`(()=>{const got=performance.getEntriesByType('resource').map(e=>e.name.split('/').pop()).filter(n=>/^(a-era-grade|b-riso|f-mccc)/.test(n));
          const ph=document.querySelector('.hero-photo'),img=ph.querySelector('img'),shown=getComputedStyle(ph).display!=='none';const i=img.getBoundingClientRect(),n=document.querySelector('.name-row').getBoundingClientRect();
          return {got:[...new Set(got)],shown,eyes:shown?Math.round(i.top+i.width*335/800):null,strip:Math.round(n.top)}})()`);
        line(`  ${w}x${h}: hero photos downloaded: ${r.got.join(', ') || 'none'} (${r.got.length === 1 ? 'one' : 'NOT ONE'})${r.shown ? `; A: his eyes at y ${r.eyes}, name starts at y ${r.strip} (${r.eyes < r.strip - 20 ? 'face in the strip' : 'FACE BEHIND THE NAME'})` : '; B'}`);
      }

      line('CHECK 3: D6 labels at 390');
      await load(BASE, 390, 660);
      const labels = await evaluate(`[...document.querySelectorAll('.tab')].map(t=>{const c=getComputedStyle(t),h=t.closest('.spine').querySelector('.phrase'),b=t.getBoundingClientRect();return {t:t.textContent,size:c.fontSize,weight:c.fontWeight,fg:c.color,bg:c.backgroundColor,h:b.height,phrase:h.textContent.replace(/\\s+/g,' ').trim(),phraseSize:getComputedStyle(h.querySelector('.ln')||h).fontSize}})`);
      const parse = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
      for (const l of labels) { const f = parse(l.fg), b = parse(l.bg); line(`  ${l.t}: ${l.size} weight ${l.weight}, ${ratio(lum(...f), lum(...b)).toFixed(1)}:1, tab ${l.h}px tall, above "${l.phrase}" at ${parseFloat(l.phraseSize).toFixed(0)}px; nav word ${await evaluate(`[...document.querySelectorAll('.sheet a')].some(a=>a.textContent===${JSON.stringify(l.t)})||[...document.querySelectorAll('.phone-bar span')].some(a=>a.textContent===${JSON.stringify(l.t)})`) ? 'matches' : 'NOT in nav'}`); }

      line('CHECK 3b: text over photos, measured from pixels with the text hidden (99.5th percentile background)');
      for (const [q, w = 390, h = 660] of [['?hero=a'], ['?hero=b'], ['?hero=a&era=placeholder-b'], ['?hero=a&era=identity-guess'],
        ['?hero=ab'], ['?hero=ab&era=placeholder-b'], ['?hero=ab&era=identity-guess'], ['?hero=ab', 320], ['?hero=ab&era=placeholder-b', 320], ['?hero=ab&era=identity-guess', 320], ['?hero=ab', 800, 1024]]) {
        line(`  ${q}${w !== 390 ? ` at ${w}x${h}` : ''}`);
        await load(BASE + q, w, h);
        const rects = await evaluate(`(()=>{const out={};for(const [k,s] of [['brand','.brand'],['menu','.nav-mobile summary'],['name','.name-row'],['slogan','.slogan'],['now','.now a']]){const b=document.querySelector(s).getBoundingClientRect();out[k]={x:b.x,y:b.y,w:b.width,h:b.height}}return out})()`);
        await evaluate(`(()=>{const s=document.createElement('style');s.id='hide';s.textContent='.brand,.nav-mobile summary,.name-row,.slogan,.now a{visibility:hidden}';document.head.append(s)})()`);
        const png = readPng(await shot());
        const tl = await evaluate(`(()=>{const c=getComputedStyle(document.body).color.match(/\\d+/g).map(Number);return c})()`);
        for (const [k, r] of Object.entries(rects)) { const bg = brightest(png, r); line(`    ${k}: text ${ratio(lum(...tl), bg).toFixed(2)}:1 against the brightest background (need ${['now', 'menu'].includes(k) ? '4.5' : '3'}:1)`); }
      }
      await load(BASE, 390, 660);
      const pr = await evaluate(`(()=>{document.querySelector('.push-head').scrollIntoView({block:'center'});return new Promise(r=>requestAnimationFrame(()=>{document.querySelectorAll('.fade').forEach(n=>n.classList.add('seen'));setTimeout(()=>{const b=document.querySelector('#h-push .phrase').getBoundingClientRect();r({x:b.x,y:b.y,w:b.width,h:b.height})},750)}))})()`);
      await evaluate(`(()=>{const s=document.createElement('style');s.textContent='#h-push .phrase{visibility:hidden}';document.head.append(s)})()`);
      { const png = readPng(await shot()); const tl = await evaluate(`getComputedStyle(document.body).color.match(/\\d+/g).map(Number)`); line(`  PUSH PAST FEAR heading: ${ratio(lum(...tl), brightest(png, pr)).toFixed(2)}:1 (need 3:1)`); }

      line('CHECK 3c: tap targets at 390 (every link, button and field)');
      for (const q of ['?hero=ab', '?hero=a', '?shows=none']) {
        await load(BASE + q, 390, 660);
        const small = await evaluate(`[...document.querySelectorAll('a,button,input,summary')].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed').filter(e=>!e.closest('.skip')&&!e.classList.contains('skip')&&!e.closest('.sheet')).map(e=>{const b=e.getBoundingClientRect();return {t:e.textContent.trim().slice(0,18)||e.placeholder,h:Math.round(b.height),w:Math.round(b.width)}})`);
        const bad = small.filter((s) => s.h < 48 || s.w < 48);
        line(`  ${q}: ${small.length} targets, under 48px: ${bad.length ? JSON.stringify(bad) : 'none'}`);
      }
      line('CHECK 3d: smallest text at 390');
      await load(BASE, 390, 660);
      line('  ' + JSON.stringify(await evaluate(`(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const m={};let n;while(n=w.nextNode()){if(!n.textContent.trim())continue;const p=n.parentElement;if(p.closest('script,style,svg,.sheet,.skip'))continue;const c=getComputedStyle(p);if(c.display==='none')continue;const s=parseFloat(c.fontSize);m[s]=m[s]||p.className||p.tagName}return Object.entries(m).sort((a,b)=>a[0]-b[0]).slice(0,3)})()`)));

      line('CHECK 3e: solid text pairs at 390, computed colors, every era (text 4.5:1; large display and controls 3:1)');
      for (const q of ['?hero=a', '?era=placeholder-b', '?era=identity-guess']) {
        await load(BASE + q, 390, 660);
        const pairs = await evaluate(`(()=>{const x=document.createElement('canvas').getContext('2d',{willReadFrequently:true});const rgb=c=>{x.clearRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);return [...x.getImageData(0,0,1,1).data].slice(0,3)};
          const cs=(s,p)=>getComputedStyle(document.querySelector(s))[p];
          return [['muted on footer','.legal','color','.site-footer'],['slogan on footer','.footer-slogan','color','.site-footer'],['player note','.player-note','color','.player-box'],['video note','.yt-note','color','.yt'],['row kind','.row-kind','color','body'],['poster meta','.poster-meta','color','.poster'],['tab','.tab','color','.tab'],['Now tag','.now-tag','color','.now-tag'],['solid button','.hero-actions .btn-solid','color','.hero-actions .btn-solid'],['chip','.ph-chip','color','.ph-chip'],['Tickets on poster','.poster .btn-show','color','.poster .btn-show'],['Details button','.row .btn-show','color','.row .btn-show'],['bar','.phone-bar a','color','.phone-bar']].map(([n,a,p,b])=>[n,rgb(cs(a,p)),rgb(cs(b,'backgroundColor'))])})()`);
        const out = pairs.map(([n, a, b]) => [n, ratio(lum(...a), lum(...b))]);
        line(`  ${q}: lowest ${out.sort((a, b) => a[1] - b[1]).slice(0, 3).map(([n, r]) => `${n} ${r.toFixed(2)}:1`).join(', ')}`);
      }

      line('CHECK 4: Home height in phone screens at 390x660');
      for (const q of ['?hero=ab', '?hero=a', '?hero=b', '?shows=none']) {
        await load(BASE + q, 390, 660);
        const h = await evaluate(`(()=>{const s=['.top','#shows','#about','#join','.site-footer'].map(x=>Math.round(document.querySelector(x).getBoundingClientRect().height));return {total:document.documentElement.scrollHeight,s,note:document.querySelector('.ph-note').getBoundingClientRect().height+16}})()`);
        line(`  ${q}: ${h.total}px = ${(h.total / 660).toFixed(2)} screens, ${((h.total - h.note) / 660).toFixed(2)} without the prototype-only note (top ${h.s[0]}, shows ${h.s[1]}, about ${h.s[2]}, join ${h.s[3]}, footer ${h.s[4]})`);
      }

      line('CHECK 5: reduced motion and the Motion switch');
      const anims = `document.getAnimations().map(a=>({n:a.animationName||a.transitionProperty,s:a.playState,d:a.effect.getTiming().duration}))`;
      await load(BASE, 390, 660);
      line(`  normal: ${JSON.stringify(await evaluate(anims))}`);
      await load(BASE, 390, 660, [{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      line(`  Emulation.setEmulatedMedia prefers-reduced-motion=reduce: animations ${JSON.stringify(await evaluate(anims))}, switch "${await evaluate(`document.querySelector('#motion').textContent`)}", fade headings opacity ${await evaluate(`getComputedStyle(document.querySelector('#h-now .phrase')).opacity`)}`);
      await load(BASE, 390, 660);
      await evaluate(`document.querySelector('#motion').click()`); await sleep(100);
      line(`  footer switch clicked: animations ${JSON.stringify(await evaluate(anims))}, switch "${await evaluate(`document.querySelector('#motion').textContent`)}"`);
      await evaluate(`document.querySelector('#motion').click(); localStorage.clear()`);

      line('CHECK 6: flash');
      for (const [label, q] of [['hero ab', '?hero=ab'], ['hero a', '?hero=a'], ['hero b', '?hero=b']]) {
        await load(BASE + q, 390, 660);
        const frames = []; const t0 = Date.now();
        while (Date.now() - t0 < 26000) { frames.push({ t: Date.now() - t0, l: meanLum(readPng(await shot())) }); await sleep(120); }
        const d = frames.slice(1).map((f, i) => Math.abs(f.l - frames[i].l));
        const ls = frames.map((f) => f.l);
        line(`  ${label}: ${frames.length} frames over ${(frames.at(-1).t / 1000).toFixed(1)}s, mean relative luminance ${Math.min(...ls).toFixed(4)} to ${Math.max(...ls).toFixed(4)}, largest frame-to-frame change ${Math.max(...d).toFixed(4)} (WCAG flash needs a change of 0.10)`);
      }
      const scan = await evaluate(`(()=>{const a=document.getAnimations();const out=[];for(const s of document.styleSheets){for(const r of s.cssRules){if(r.cssRules)for(const k of r.cssRules)if(k.style&&(k.style.animationName&&k.style.animationName!=='none'))out.push(k.selectorText+' '+k.style.animationDuration);}}return {rules:out}})()`);
      line(`  every CSS animation rule: ${JSON.stringify(scan.rules)}`);
      await load(BASE, 390, 660);
      let most = 0;
      const H = await evaluate('document.documentElement.scrollHeight');
      const movers = new Set();
      for (let y = 0; y < H; y += 150) { // a brisk scroll: 150px every 150ms
        await evaluate(`scrollTo(0,${y})`);
        await sleep(150);
        const on = await evaluate(`document.getAnimations().filter(a=>{if(a.playState!=='running')return false;const r=a.effect.target.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}).map(a=>a.effect.target.closest('h2')?.id||a.effect.target.className)`);
        most = Math.max(most, on.length); if (on.length > 1) movers.add(on.join('+') + ' at y=' + y);
      }
      if (movers.size) line('  overlaps: ' + [...movers].join('; '));
      line(`  most animations running on the visible screen, brisk scroll, sampled every 150px: ${most}`);

      line('Page errors and CSP (served with the real CSP):');
      line(problems.length ? problems.map((p) => '  ' + p).join('\n') : '  none');
      const fileUrl = 'file:///' + ROOT.replaceAll('\\', '/') + '/index.html?hero=b';
      await load(fileUrl, 390, 660);
      line(`Opens from disk: ${await evaluate(`document.querySelector('.poster-place')?.textContent`)} rendered, font ${await evaluate(`document.fonts.check('900 40px "Big Shoulders Display"')`)}`);
      writeFileSync(join(ROOT, 'shots', 'check-report.txt'), report.join('\n') + '\n');
    }
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  ws.close(); chrome.kill(); server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome can hold the folder briefly on Windows */ }
}
