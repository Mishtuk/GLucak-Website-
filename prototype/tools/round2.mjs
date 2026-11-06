// Round 2 checks (DESIGN.md section 16): Music cover grid, link grid, Add to calendar, 404, :active.
//   node prototype/tools/round2.mjs             checks + shots -> docs/review/round2-design/ (report: round2-report.txt)
//   node prototype/tools/round2.mjs --height    only the Home height (CHECK 4's measure, 390x660)
//   node prototype/tools/round2.mjs --eval <page> <width> <js>   print one expression (debugging)
//   node prototype/tools/round2.mjs --measure   em widths of the new fitted lines (for --w-* tokens)
// Same harness as prototype/check.mjs: serves prototype/ with the site's real CSP, drives headless Chrome over the
// DevTools Protocol, exact widths via Emulation.setDeviceMetricsOverride (so 320 and 390 are true widths).
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, '..', 'docs', 'review', 'round2-design');
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

const profile = mkdtempSync(join(tmpdir(), 'glr2-'));
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
const homeHeight = async (q = '?hero=ab') => {
  await load('index.html' + q, 390, 660);
  return evaluate(`(()=>{const s=['.top','#shows','#about','#join','.site-footer'].map(x=>Math.round(document.querySelector(x).getBoundingClientRect().height));const n=document.querySelector('.ph-note');return {total:document.documentElement.scrollHeight,s,note:n?n.getBoundingClientRect().height+16:0}})()`);
};

try {
  mkdirSync(OUT, { recursive: true });
  if (mode === '--measure') {
    await load('404.html', 1280, 800);
    line(JSON.stringify(await evaluate(`(()=>{const c=document.createElement('canvas').getContext('2d');c.font='900 100px "Big Shoulders Display"';return Object.fromEntries(['Wrong turn.','Wrong','turn.','Nov 13','Jan 15','MMM 00'].map(t=>[t,(c.measureText(t.toUpperCase()).width/100*1.003).toFixed(4)]))})()`)));
  } else if (mode === '--eval') {
    await load(process.argv[3], +process.argv[4] || 390, 660);
    line(JSON.stringify(await evaluate(process.argv[5])));
  } else if (mode === '--height') {
    for (const q of ['?hero=ab', '?shows=none']) {
      const h = await homeHeight(q);
      line(`Home ${q}: ${h.total}px = ${(h.total / 660).toFixed(2)} screens, ${((h.total - h.note) / 660).toFixed(2)} without the note (top ${h.s[0]}, shows ${h.s[1]}, about ${h.s[2]}, join ${h.s[3]}, footer ${h.s[4]})`);
    }
  } else {
    const PAGES = [['home', 'index.html'], ['home no shows', 'index.html?shows=none'], ['music', 'music.html'], ['music identity-guess', 'music.html?era=identity-guess'], ['404', '404.html'], ['shop', 'shop.html']];

    line('R2-1: no sideways scroll at 320, 390, 1280');
    for (const [name, page] of PAGES) {
      const out = [];
      for (const w of [320, 390, 1280]) {
        await load(page, w, 700);
        const r = await evaluate(`(()=>{const over=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.vh,.sheet,.skip')).slice(0,4).map(e=>(typeof e.className==='string'?e.className:e.tagName)+':'+Math.round(e.getBoundingClientRect().right));return {s:document.documentElement.scrollWidth,w:innerWidth,over}})()`);
        out.push(`${w}: ${r.s}/${r.w}${r.over.length ? ' OVERFLOW ' + r.over.join(' ') : ''}`);
      }
      line(`  ${name}: ${out.join(', ')}`);
    }

    line('R2-2: tap targets at 320 and 390 (every link and button; under 48px listed)');
    for (const [name, page] of PAGES) for (const w of [320, 390]) {
      await load(page, w, 700);
      const all = await evaluate(`[...document.querySelectorAll('a,button,input,summary')].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed').filter(e=>!e.closest('.skip,.sheet,.player-box')).map(e=>{const b=e.getBoundingClientRect();return {t:(e.getAttribute('aria-label')||e.textContent.trim()||e.type||e.tagName).slice(0,22),h:Math.round(b.height),w:Math.round(b.width)}})`);
      const bad = all.filter((s) => s.h < 48 || s.w < 48);
      line(`  ${name} at ${w}: ${all.length} targets, under 48px: ${bad.length ? JSON.stringify(bad) : 'none'}`);
    }

    line('R2-3: smallest text at 320 and 390');
    for (const [name, page] of PAGES) for (const w of [320, 390]) {
      await load(page, w, 700);
      line(`  ${name} at ${w}: ` + JSON.stringify(await evaluate(`(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const m={};let n;while(n=w.nextNode()){if(!n.textContent.trim())continue;const p=n.parentElement;if(p.closest('script,style,svg,.sheet,.skip,.vh'))continue;if(p.offsetParent===null&&getComputedStyle(p).position!=='fixed')continue;const s=parseFloat(getComputedStyle(p).fontSize);m[s]=m[s]||(typeof p.className==='string'&&p.className||p.tagName)}return Object.entries(m).sort((a,b)=>a[0]-b[0]).slice(0,3)})()`)));
    }

    line('R2-4: contrast of the new pieces, every era, normal and pressed (:active forced over CDP); text 4.5:1, glyphs and display 3:1');
    const PAIRS = `[['tile title','.tile-title'],['tile meta','.tile-meta'],['tile artists','.tile-artists'],['tile action','.tile-go'],['type tag','.tile-tag'],['no-art date','.tile-when'],['link cell word','.links a span'],['link icon','.links a svg','fill'],['calendar on poster','.poster .cal-link'],['calendar icon in row','.row .cal-btn svg','stroke'],['404 line','.lost-line'],['404 Home link','.lost .text-link'],['404 heading','.lost-title .ln'],['blank tab hatch (exempt)','.tab-blank']]`;
    const contrastOf = `(()=>{const x=document.createElement('canvas').getContext('2d',{willReadFrequently:true});const rgb=c=>{x.clearRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);return [...x.getImageData(0,0,1,1).data]};
      const bgOf=e=>{for(let n=e;n;n=n.parentElement){const c=rgb(getComputedStyle(n).backgroundColor);if(c[3]>0)return c}return rgb(getComputedStyle(document.documentElement).backgroundColor)};
      const out=[];for(const [n,s,prop] of ${PAIRS}){const e=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().height>0);if(!e)continue;const cs=getComputedStyle(e);out.push([n,rgb(prop==='fill'?cs.fill:prop==='stroke'?cs.stroke:cs.color).slice(0,3),bgOf(e instanceof SVGElement?e.parentElement:e).slice(0,3)])}return out})()`;
    const pressAll = async (sel) => {
      const doc = await cdp('DOM.getDocument', { depth: -1 });
      const { nodeIds } = await cdp('DOM.querySelectorAll', { nodeId: doc.root.nodeId, selector: sel });
      await cdp('CSS.enable');
      for (const nodeId of nodeIds) await cdp('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['active'] });
    };
    await cdp('DOM.enable');
    for (const era of ['placeholder', 'placeholder-b', 'identity-guess']) for (const pressed of [false, true]) {
      const all = [];
      for (const page of [`index.html?era=${era}`, `music.html?era=${era}`, `404.html?era=${era}`]) {
        await load(page, 390, 700);
        if (pressed) await pressAll('.tile-link, .links a, .cal-link, .lost .text-link'); // .cal-btn pressed paints a 36px gradient square (text) under a bg glyph: 17:1 by construction, not readable as a background-color here
        for (const [n, a, b] of await evaluate(contrastOf)) if (!all.some((p) => p[0] === n)) all.push([n, ratio(lum(...a), lum(...b))]);
      }
      all.sort((a, b) => a[1] - b[1]);
      const need = (n) => (/icon|heading|date|title|exempt/.test(n) ? 3 : 4.5);
      const fails = all.filter(([n, r]) => r < need(n) && !/exempt/.test(n));
      line(`  ${era}${pressed ? ' pressed' : ''}: ${all.length} pairs, lowest ${all.slice(0, 4).map(([n, r]) => `${n} ${r.toFixed(2)}:1`).join(', ')}; under the floor: ${fails.length ? fails.map(([n, r]) => `${n} ${r.toFixed(2)}`).join(', ') : 'none'}`);
    }

    line('R2-5: :active on every button and card: pressed colours differ from rest, and no transition anywhere');
    for (const page of ['index.html', 'music.html', '404.html', 'shop.html']) {
      await load(page, 390, 700);
      const sel = '.btn, .tile-link, .links a, .cal-link, .cal-btn, .text-link, .under-link, .listen-on a, .now a, .product-link, .ln-close a, .legal a, .motion-btn, .phone-bar a';
      const before = await evaluate(`[...document.querySelectorAll('${sel}')].filter(e=>e.getBoundingClientRect().height>0).map(e=>{const t=e.matches('.tile-link,.product-link')?e.querySelector('.tile-text,.product-name'):e;const c=getComputedStyle(t);return [c.backgroundColor,c.color,getComputedStyle(e).transitionDuration]})`);
      await pressAll(sel);
      const after = await evaluate(`[...document.querySelectorAll('${sel}')].filter(e=>e.getBoundingClientRect().height>0).map(e=>{const t=e.matches('.tile-link,.product-link')?e.querySelector('.tile-text,.product-name'):e;const c=getComputedStyle(t);return [c.backgroundColor,c.color]})`);
      const same = before.filter((b, i) => b[0] === after[i][0] && b[1] === after[i][1]).length;
      const trans = before.filter((b) => b[2] !== '0s').length;
      line(`  ${page}: ${before.length} pressables, unchanged when pressed: ${same}, with a transition: ${trans}`);
    }

    line('R2-6: animations (normal and reduced motion) on the new pages');
    for (const page of ['music.html', '404.html']) for (const media of [[], [{ name: 'prefers-reduced-motion', value: 'reduce' }]]) {
      await load(page, 390, 700, media);
      line(`  ${page}${media.length ? ' reduced' : ''}: ${await evaluate('document.getAnimations().length')} animations`);
    }

    line('R2-7: Home height at 390x660 (D39 cap 5.8 without the note) and the poster');
    for (const q of ['?hero=ab', '?shows=none']) {
      const h = await homeHeight(q);
      line(`  ${q}: ${h.total}px = ${(h.total / 660).toFixed(2)} screens, ${((h.total - h.note) / 660).toFixed(2)} without the note (top ${h.s[0]}, shows ${h.s[1]}, about ${h.s[2]}, join ${h.s[3]}, footer ${h.s[4]})`);
    }
    await load('index.html', 390, 660);
    line('  poster / rows: ' + JSON.stringify(await evaluate(`(()=>{const p=document.querySelector('.poster').getBoundingClientRect(),r=[...document.querySelectorAll('.shows .row')].map(e=>Math.round(e.getBoundingClientRect().height));return {poster:Math.round(p.height),rows:r}})()`)));

    line('R2-8: Music page at 390x844 and 1280x800: where the grid starts, tiles in the first screen, page length');
    for (const [w, h] of [[390, 844], [1280, 800]]) {
      await load('music.html', w, h);
      const r = await evaluate(`(()=>{const t=[...document.querySelectorAll('.tile-art')].map(e=>e.getBoundingClientRect());const g=document.querySelector('.crate').getBoundingClientRect();return {gridTop:Math.round(g.top),tile:Math.round(t[0].width),cols:new Set(t.map(b=>Math.round(b.left))).size,h:document.documentElement.scrollHeight,gridH:Math.round(g.height)}})()`);
      line(`  ${w}x${h}: grid top ${r.gridTop}px, ${r.cols} columns, cover ${r.tile}px, grid ${r.gridH}px, page ${r.h}px = ${(r.h / h).toFixed(2)} screens`);
    }

    line('R2-9: shots');
    const SHOTS = [['music-390-full.png', 'music.html', 390, 844, 1], ['music-1280-full.png', 'music.html', 1280, 800, 1], ['music-320-full.png', 'music.html', 320, 640, 1],
      ['music-identity-guess-390.png', 'music.html?era=identity-guess#releases', 390, 844, 0],
      ['404-390.png', '404.html', 390, 844, 0], ['404-1280.png', '404.html', 1280, 800, 0], ['404-320.png', '404.html', 320, 640, 0], ['404-390-full.png', '404.html', 390, 844, 1],
      ['home-390-full.png', 'index.html', 390, 660, 1], ['home-1280-full.png', 'index.html', 1280, 800, 1], ['home-320-full.png', 'index.html', 320, 640, 1],
      ['home-identity-guess-390-full.png', 'index.html?era=identity-guess', 390, 660, 1], ['shop-390-full.png', 'shop.html', 390, 844, 1]];
    for (const [file, page, w, h, full] of SHOTS) { await load(page, w, h); if (full) await fullShot(file); else await firstScreen(file); line('  ' + file); }
    // Close-ups: the shows block and footer at 390, normal and pressed.
    for (const [file, page, sel, press, w] of [['shows-390.png', 'index.html', '#shows .shows-main', '', 390], ['shows-1280.png', 'index.html', '#shows .shows-grid', '', 1280], ['footer-390.png', 'index.html', '.site-footer', '', 390], ['footer-1280.png', 'index.html', '.site-footer', '', 1280], ['pressed-390.png', 'music.html', '.crate', '.crate .tile:nth-child(3) .tile-link, .site-footer .links li:nth-child(2) a', 390], ['pressed-buttons-390.png', 'index.html', '#shows .shows-main', '.poster .btn-show, .row:nth-of-type(2) .cal-btn, .poster .cal-link', 390]]) {
      await load(page, w, 900);
      if (press) await pressAll(press);
      const b = await evaluate(`(()=>{const e=document.querySelector('${sel}');e.scrollIntoView({block:'start'});const r=e.getBoundingClientRect();return {x:0,y:Math.max(0,r.top+scrollY-8),width:innerWidth,height:Math.min(r.height+16,3000)}})()`);
      await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: await evaluate('document.documentElement.scrollHeight'), deviceScaleFactor: 1, mobile: w < 700 });
      await sleep(250);
      writeFileSync(join(OUT, file), Buffer.from((await cdp('Page.captureScreenshot', { format: 'png', clip: { ...b, scale: 1 } })).data, 'base64'));
      line('  ' + file);
    }

    line('Page errors and CSP (real CSP; Spotify\'s own frame noise ignored):');
    line(problems.length ? [...new Set(problems)].map((p) => '  ' + p).join('\n') : '  none');
    writeFileSync(join(OUT, 'round2-report.txt'), report.join('\n') + '\n');
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  ws.close(); chrome.kill(); server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome can hold the folder briefly */ }
}
