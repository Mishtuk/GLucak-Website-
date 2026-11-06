// v2 picks checks (DESIGN.md section 18): Home height, where the player sits, photo per slot, header, shots.
//   node prototype/tools/v2picks.mjs            measures + shots -> docs/review/v2-picks/ (report: v2picks-report.txt)
//   node prototype/tools/v2picks.mjs --eval <page> <width> <js>   print one expression (debugging)
//   (harness copied from round2.mjs: the real CSP, headless Chrome over DevTools, exact widths)
//
// Same harness as prototype/check.mjs: serves prototype/ with the site's real CSP, drives headless Chrome over the
// DevTools Protocol, exact widths via Emulation.setDeviceMetricsOverride (so 320 and 390 are true widths).
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, '..', 'docs', 'review', 'v2-picks');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src https://open.spotify.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'";
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ics': 'text/calendar; charset=utf-8' };
const mode = process.argv[2] || '--all';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

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
const BASE = `http://127.0.0.1:${server.address().port}/`;

const profile = mkdtempSync(join(tmpdir(), 'glv2-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let log = ''; chrome.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
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
  if (m.method === 'Log.entryAdded' && /Content Security Policy|Failed to load/i.test(m.params.entry.text) && !/spotify|scdn/i.test(m.params.entry.url ?? '')) problems.push(m.params.entry.text + (m.params.entry.url ? ' ' + m.params.entry.url : ''));
});
const evaluate = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
async function load(page, w, h, media = []) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await cdp('Emulation.setEmulatedMedia', { features: media });
  await cdp('Page.navigate', { url: BASE + page });
  for (let i = 0; i < 100; i++) { await sleep(50); if ((await evaluate('document.readyState')) === 'complete') break; }
  await evaluate('document.fonts.ready.then(()=>true)');
  await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>0)}))`);
  await sleep(150);
}
const shot = async () => Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64');
async function fullShot(file) {
  await evaluate(`document.querySelectorAll('.fade').forEach(n=>n.classList.add('seen'))`);
  await sleep(750);
  const [w, h] = await evaluate('[innerWidth, document.documentElement.scrollHeight]');
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await sleep(250);
  writeFileSync(join(OUT, file), await shot());
}
const firstScreen = async (file) => writeFileSync(join(OUT, file), await shot());

const report = [];
const line = (s) => { report.push(s); console.log(s); };
const homeHeight = async (q = '') => {
  await load('index.html' + q, 390, 660);
  return evaluate(`(()=>{const s=['.top','#shows','#about','#join','.site-footer'].map(x=>Math.round(document.querySelector(x).getBoundingClientRect().height));const n=document.querySelector('.ph-note');return {total:document.documentElement.scrollHeight,s,note:n?n.getBoundingClientRect().height+16:0}})()`);
};
// Every picture you can see on the page, by file family (the -NNN width suffix stripped), so a repeat shows up.
const PHOTOS = `(()=>{const seen=[];for(const i of document.querySelectorAll('main img')){const b=i.getBoundingClientRect();if(!b.width||!b.height||i.closest('.mark')||i.matches('.mark'))continue;let hidden=false;for(let n=i;n;n=n.parentElement)if(getComputedStyle(n).display==='none')hidden=true;if(hidden)continue;const f=(i.currentSrc||i.src).split('/').pop().replace(/-(phone-)?\\d+\\.webp$/,'').replace(/\\.webp$/,'');seen.push(f)}return seen})()`;
const CONTRAST = `(()=>{const x=document.createElement('canvas').getContext('2d',{willReadFrequently:true});const rgb=c=>{x.clearRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);return [...x.getImageData(0,0,1,1).data]};
  const bgOf=e=>{for(let n=e;n;n=n.parentElement){const c=rgb(getComputedStyle(n).backgroundColor);if(c[3]>0)return c}return rgb(getComputedStyle(document.documentElement).backgroundColor)};
  const P=[['card kicker','.v2-kicker'],['card artists','.v2-rel .credit'],['card title','.v2-rel h3'],['card Listen','.v2-rel .btn'],['Spotify button','.v2-card .under-player .btn'],['video title','.v2-vtitle'],['Latest tag','.v2-tag'],['Watch heading','.v2-videos h3'],['waiting slot label','.v2-slot span'],['header brand','.brand-word'],['Menu','.nav-mobile summary'],['poster date','.ln-date'],['poster place','.poster-place']];
  const out=[];for(const [n,s] of P){const e=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().height>0);if(!e)continue;out.push([n,rgb(getComputedStyle(e).color).slice(0,3),bgOf(e).slice(0,3)])}return out})()`;

try {
  mkdirSync(OUT, { recursive: true });
  if (mode === '--eval') {
    await load(process.argv[3], +process.argv[4] || 390, 660);
    line(JSON.stringify(await evaluate(process.argv[5])));
  } else {
    line('V2-1: Home height at 390x660 (D39 cap 5.8 screens without the note; both quotes in, one poster show)');
    for (const q of ['', '?shows=none', '?header=scrim']) {
      const h = await homeHeight(q);
      line(`  index.html${q}: ${h.total}px = ${(h.total / 660).toFixed(2)} screens, ${((h.total - h.note) / 660).toFixed(2)} without the note (top ${h.s[0]}, shows ${h.s[1]}, about ${h.s[2]}, join ${h.s[3]}, footer ${h.s[4]})`);
    }

    line('V2-2: the Spotify player, px from the top of the page (phone bar top = height - 62)');
    for (const [w, h, q] of [[390, 660, ''], [390, 844, ''], [320, 568, ''], [390, 660, '?header=scrim'], [1280, 800, ''], [900, 800, '']]) {
      await load('index.html' + q, w, h);
      const r = await evaluate(`(()=>{const p=document.querySelector('.player-box').getBoundingClientRect();const c=document.querySelector('.v2-cover').getBoundingClientRect();return {top:Math.round(p.top+scrollY),cover:Math.round(c.top+scrollY)}})()`);
      const fold = w < 700 ? h - 62 : h;
      line(`  ${w}x${h}${q}: player top ${r.top}, ${Math.max(0, fold - r.top)}px of it on the first screen${w < 700 ? ' above the bar' : ''}; release cover top ${r.cover}`);
    }

    line('V2-3: one photo per slot, none repeated (visible pictures in <main>, the mark left out)');
    for (const w of [320, 390, 899, 900, 1280]) {
      await load('index.html', w, 800);
      const p = await evaluate(PHOTOS);
      const dup = p.filter((f, i) => p.indexOf(f) !== i);
      line(`  ${w}: ${p.length} pictures, ${new Set(p).size} distinct${dup.length ? ', REPEATED ' + dup.join(' ') : ''}: ${p.join(', ')}`);
    }

    line('V2-4: pictures a phone actually downloads (no forced loading; page scrolled through slowly)');
    for (const w of [390, 1280]) {
      await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: 800, deviceScaleFactor: 1, mobile: w < 700 });
      await cdp('Emulation.setEmulatedMedia', { features: [] });
      await cdp('Page.navigate', { url: BASE + 'index.html' });
      await sleep(800);
      const H = await evaluate('document.documentElement.scrollHeight');
      for (let y = 0; y < H; y += 300) { await evaluate(`scrollTo(0,${y})`); await sleep(120); }
      await sleep(500);
      const got = await evaluate(`[...new Set(performance.getEntriesByType('resource').filter(e=>/\\.(webp|png|svg)$/.test(e.name)).map(e=>e.name.split('/').pop()))]`);
      line(`  ${w}: ${got.join(', ')}`);
    }

    line('V2-5: header from the first paint (Home, scrolled to 0)');
    for (const [w, q] of [[390, ''], [1280, ''], [390, '?header=scrim']]) {
      await load('index.html' + q, w, 800);
      line(`  ${w}${q}: ` + JSON.stringify(await evaluate(`(()=>{const h=getComputedStyle(document.querySelector('.site-header'));const s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--strip'))||0;return {background:h.backgroundColor,image:h.backgroundImage.slice(0,40),strip:getComputedStyle(document.documentElement).getPropertyValue('--strip').trim(),eyesFromTop:Math.round(document.querySelector('.hero-inner').getBoundingClientRect().top+parseFloat(getComputedStyle(document.querySelector('.hero-inner')).paddingTop)-42)}})()`)));
    }

    line('V2-6: phrase sizes in the 5 : 7 split (font-size px; FEAR as two fitted lines would be the column / 1.7743)');
    for (const w of [900, 1280, 1440]) {
      await load('index.html', w, 800);
      line(`  ${w}: ` + JSON.stringify(await evaluate(`(()=>{const f=s=>Math.round(parseFloat(getComputedStyle(document.querySelector(s)).fontSize));const col=document.querySelector('#h-push .phrase').getBoundingClientRect().width;return {column:Math.round(col),RISE:f('.phrase-rise'),LIVE:f('.ln-live'),PUSH_PAST_FEAR_one_line:f('.ln-push1'),FEAR_if_two_lines:Math.round(col/1.7743),THE_TIME:f('.ln-now1'),IS_NOW:f('.ln-now2')}})()`)));
    }

    line('V2-7: the swipe row at 390 / 320 (scrolls inside itself, the page never scrolls sideways) and the 900px+ grid');
    for (const w of [320, 390, 1280]) {
      await load('index.html', w, 800);
      line(`  ${w}: ` + JSON.stringify(await evaluate(`(()=>{const r=document.querySelector('.v2-vrow');const c=[...r.children].map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.width),Math.round(b.height)]});return {page:document.documentElement.scrollWidth,row:[r.clientWidth,r.scrollWidth],overflowX:getComputedStyle(r).overflowX,cards:c}})()`)));
    }

    line('V2-8: contrast of the new pieces, three eras (text 4.5:1, display type 3:1)');
    for (const era of ['placeholder', 'placeholder-b', 'identity-guess']) for (const w of [390, 1280]) {
      await load('index.html?era=' + era, w, 800);
      const all = (await evaluate(CONTRAST)).map(([n, a, b]) => [n, ratio(lum(...a), lum(...b))]).sort((a, b) => a[1] - b[1]);
      const need = (n) => (/title|date|heading|brand/.test(n) ? 3 : 4.5);
      const fails = all.filter(([n, r]) => r < need(n));
      line(`  ${era} ${w}: lowest ${all.slice(0, 3).map(([n, r]) => `${n} ${r.toFixed(2)}`).join(', ')}; under the floor: ${fails.length ? fails.map(([n, r]) => `${n} ${r.toFixed(2)}`).join(', ') : 'none'}`);
    }

    line('V2-9: tap targets in the new pieces at 320 and 390 (under 48px listed)');
    for (const w of [320, 390]) {
      await load('index.html', w, 800);
      line(`  ${w}: ` + JSON.stringify(await evaluate(`(()=>{const t=[...document.querySelectorAll('.v2-card a, .v2-vid a, .push-actions a, .v2-identity a, .site-header a, .site-header summary')].filter(e=>e.getBoundingClientRect().height>0&&!e.closest('.skip,.sheet')&&!e.matches('.skip'));return {count:t.length,small:t.filter(e=>{const b=e.getBoundingClientRect();return b.height<48||b.width<48}).map(e=>e.textContent.trim().slice(0,20))}})()`)));
    }

    line('V2-10: animations, reduced motion (must be 0) and normal (glow + heading fades only)');
    for (const media of [[{ name: 'prefers-reduced-motion', value: 'reduce' }], []]) {
      await load('index.html', 390, 800, media);
      line(`  ${media.length ? 'reduced' : 'normal'}: ` + JSON.stringify(await evaluate(`(()=>{const a=document.getAnimations().map(x=>x.animationName||x.transitionProperty||'?');const s=getComputedStyle(document.querySelector('.v2-vrow'));return {count:a.length,names:[...new Set(a)],rowScrollBehavior:s.scrollBehavior}})()`)));
    }

    line('V2-11: shots');
    const SHOTS = [['home-390-first.png', 'index.html', 390, 660, 0], ['home-390-full.png', 'index.html', 390, 660, 1], ['home-320-full.png', 'index.html', 320, 568, 1],
      ['home-1280-first.png', 'index.html', 1280, 800, 0], ['home-1280-full.png', 'index.html', 1280, 800, 1], ['home-900-full.png', 'index.html', 900, 800, 1],
      ['home-390-scrim-first.png', 'index.html?header=scrim', 390, 660, 0], ['home-identity-guess-1280-full.png', 'index.html?era=identity-guess', 1280, 800, 1],
      ['home-noshows-390-full.png', 'index.html?shows=none', 390, 660, 1]];
    for (const [file, page, w, h, full] of SHOTS) { await load(page, w, h); if (full) await fullShot(file); else await firstScreen(file); line('  ' + file); }
    // The swipe row swiped one card along (by the test, as a finger would), to show the peek on both sides.
    await load('index.html', 390, 900);
    await evaluate(`(()=>{const v=document.querySelector('.v2-videos');v.scrollIntoView({block:'start'});scrollBy(0,-90);document.querySelector('.v2-vrow').scrollLeft=document.querySelector('.v2-vid:nth-child(2)').offsetLeft-document.querySelector('.v2-vrow').offsetLeft})()`);
    await sleep(300); await firstScreen('videos-390-swiped.png'); line('  videos-390-swiped.png');

    line('Page errors and CSP (real CSP; Spotify\'s own frame noise ignored):');
    line(problems.length ? [...new Set(problems)].map((p) => '  ' + p).join('\n') : '  none');
    writeFileSync(join(OUT, 'v2picks-report.txt'), report.join('\n') + '\n');
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  ws.close(); chrome.kill(); server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome can hold the folder briefly */ }
}
