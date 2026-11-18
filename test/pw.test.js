// DESIGN 30h-1..3 (Round 1 of the poster wall): palettes, no flash / no effect on fans, the top bar.
// The browser half of 30h-2 and 30h-3 (first-paint colour, clicks, overlaps at 700..1600, condense) is .work/pw1-check.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const pals = JSON.parse(read('src/palettes.json'));
const identity = JSON.parse(read('src/eras/identity.json'));
const home = read('dist/index.html');
const css = read('src/styles/global.css');
const ROLES = ['bg', 'text', 'muted', 'accent', 'accent-text', 'muted-inv', 'mark-ground'];

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// color-mix(in srgb, <a> pct%, <b>): the CSS the derived bg-2 and line use
const mix = (a, pct, b) => '#' + rgb(a).map((c, i) => Math.round(c * pct + rgb(b)[i] * (1 - pct)).toString(16).padStart(2, '0')).join('');

test('30h-1: 5-6 palettes, first is IDENTITY as in identity.json, every role a #rrggbb', () => {
  assert.ok(pals.length >= 5 && pals.length <= 6);
  assert.equal(pals[0].id, 'identity');
  for (const k of ['bg', 'text', 'muted', 'accent', 'accent-text']) assert.equal(pals[0].colors[k], identity.colors[k], `identity ${k}`);
  assert.equal(pals[0].colors['muted-inv'], identity.colors['muted-inv']);
  assert.equal(pals[0].colors['mark-ground'], identity.colors['mark-ground']);
  assert.equal(new Set(pals.map((p) => p.id)).size, pals.length);
  for (const p of pals) {
    assert.match(p.id, /^[a-z]+$/);
    assert.ok(p.name && p.mood, `${p.id}: name and mood`);
    for (const r of ROLES) assert.match(p.colors[r], /^#[0-9a-f]{6}$/, `${p.id}.${r}`);
  }
});

test('30h-1: every palette passes the contrast floors (text 7, muted 4.5, accent-text 4.5, accent shape 3, muted-inv 4.5)', () => {
  for (const p of pals) {
    const c = p.colors, bg2 = mix(c.text, 0.07, c.bg);
    const at = (name, v, min) => assert.ok(v >= min, `${p.id} ${name} ${v.toFixed(2)} < ${min}`);
    at('text/bg', ratio(c.text, c.bg), 7); at('text/bg-2', ratio(c.text, bg2), 7);
    at('muted/bg', ratio(c.muted, c.bg), 4.5); at('muted/bg-2', ratio(c.muted, bg2), 4.5);
    at('accent-text/accent', ratio(c['accent-text'], c.accent), 4.5);
    at('accent/bg', ratio(c.accent, c.bg), 3); at('accent/bg-2', ratio(c.accent, bg2), 3);
    at('muted-inv/text', ratio(c['muted-inv'], c.text), 4.5);
    assert.equal(c['mark-ground'], p.light ? c.text : c.bg, `${p.id}: Logo D's plate is the dark one`);
  }
});

test('30h-1: both era files carry muted-inv and mark-ground', () => {
  for (const f of ['identity', 'placeholder']) {
    const e = JSON.parse(read(`src/eras/${f}.json`));
    assert.match(e.colors['muted-inv'], /^#[0-9a-f]{6}$/); assert.match(e.colors['mark-ground'], /^#[0-9a-f]{6}$/);
  }
});

test('30h-2: built Home has one palette rule and one Print filter per non-identity palette; #pal is hidden', () => {
  for (const p of pals.slice(1)) {
    assert.equal(home.split(`html:root[data-palette='${p.id}']{`).length - 1, 1, `${p.id} rule`);
    assert.equal(home.split(`<filter id="print-${p.id}"`).length - 1, 1, `${p.id} filter`);
    assert.ok(home.includes(`img.print{filter:url(#print-${p.id})}`));
  }
  assert.ok(!home.includes("data-palette='identity'"), 'identity is the no-key default');
  assert.match(home, /<details class="pal" id="pal" hidden>/);
  assert.ok(pals.find((p) => p.light) && home.includes(".poster-art{mix-blend-mode:lighten}"));
});

test('30h-2: boot.js reads only localStorage; app.js unhides #pal only on ?palettes or a stored key; no inline script', () => {
  const boot = read('public/js/boot.js'), app = read('public/js/app.js');
  assert.match(boot, /localStorage\.getItem\('palette'\)/);
  assert.ok(!/palettes|location|URLSearchParams/.test(boot.replace(/\/\/.*$/gm, '')), 'boot.js never reads ?palettes');
  assert.ok(/try \{[^\n]*getItem\('palette'\)[^\n]*\} catch/.test(boot), 'storage wrapped in try/catch');
  assert.equal((app.match(/pal\.hidden = false/g) ?? []).length, 1);
  assert.match(app, /has\('palettes'\) \|\| read\(\)\) \{ pal\.hidden = false/);
  assert.match(app, /pal-reset/);
  for (const m of home.matchAll(/<script\b([^>]*)>/g)) if (!m[1].includes('application/ld+json')) assert.match(m[1], /\bsrc="/, 'every script has src (JSON-LD is data)');
  assert.ok(!/\son(click|load|error)=/i.test(home), 'no inline handlers');
});

test('30h-3: top bar markup and CSS (static half)', () => {
  assert.match(home, /<span class="brand-tag">Producer-rapper and DJ<\/span>/);
  assert.match(home, /<a class="btn btn-solid btn-small header-listen"[^>]*><svg class="btn-ico"/);
  assert.match(home, /<div class="sentinel"/);
  for (const p of ['music', 'shows', 'videos', 'about']) assert.match(read(`dist/${p}/index.html`), /<div class="sentinel"/, `${p} has the sentinel`);
  assert.match(home, /<summary><span class="m-word">Menu<\/span><span class="m-word m-close">Close<\/span><\/summary>/);
  assert.match(home, /<p class="sheet-slogan">Rise, Live It Loud, Push Past Fear, The Time Is Now\.<\/p>/);
  assert.ok(!/\.nav-desktop a:hover \{ text-decoration/.test(css), 'the underline hover is deleted');
  assert.match(read('public/js/app.js'), /classList\.toggle\('is-condensed'/);
  const block = css.slice(css.indexOf('30. Poster wall'));
  assert.ok(!/\b(transition|animation)\s*:/.test(block.replace(/\/\*[\s\S]*?\*\//g, '')), 'no transition or animation in block 30');
  const bar = css.slice(css.indexOf('/* ---------- Header ---------- */'), css.indexOf('/* ---------- Top: hero + Rise'));
  assert.ok(!/transition|animation/.test(bar), 'no motion on the header');
  assert.match(css, /\.is-condensed \.mark-head \{ height: 24px; \}/);
});

// ---- Round 2 (Home). The browser half of 30h-4 / 30h-5 (band signatures at 768 and 1280, the 390 sheet and card, Home height, running animations) is .work/pw2-check.mjs.
const blk = css.slice(css.indexOf('30. Poster wall'));
const stripC = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

test('30h-4: Home bands take the poster-wall classes; the old hero slot and the ab block are gone', () => {
  assert.match(home, /class="band band-live edge-angle"/);
  assert.match(home, /class="wrap v2-split is-paper taped"/);
  assert.match(home, /<form class="signup ticket"/);
  assert.match(home, /<footer class="site-footer edge-tear"/);
  assert.match(home, /<figure class="hero-print taped" aria-hidden="true">/);
  assert.ok(!/class="slot"|class="n-g">G<\/span><span class="slot"/.test(home), 'no .slot in the name');
  assert.ok(!/\.slot\b/.test(css) && !/data-hero='ab'\]/.test(css), 'the ab slot CSS is deleted, not overridden');
  assert.equal((home.match(/<h1\b/g) ?? []).length, 1);
  const hp = home.match(/<figure class="hero-print[^]*?<\/figure>/)[0];
  assert.match(hp, /srcset="\/media\/b-print-600\.webp 600w, \/media\/b-print-1000\.webp 1000w"/);
  assert.match(hp, /alt=""/);
});

test('30h-4: Home layout rules (mirror, banner, sheet, ticket) are in block 30e; the mirror is shared with Music', () => {
  assert.match(css, /\.band-rise > \.wrap\.v2-split \{ grid-template-columns: minmax\(0, 7fr\) minmax\(0, 5fr\); \}/);
  assert.ok(!/html\[data-home\] \.band-rise/.test(css), 'Rise is unscoped');
  assert.match(css, /html\[data-home\] \.band-live > \.wrap\.v2-split \{ display: grid; grid-template-columns: repeat\(12, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.band-push\.v2-push > \.wrap\.v2-split \{[^}]*'p1 side' 'p1 bio' 'p1 act'/);
  assert.match(css, /\.is-paper \.tab \{ left: var\(--space-m\); color: var\(--page-text\); \}/);
  assert.match(css, /\.footer-join \.ticket \{ background-color: var\(--bg\); \}/);
  assert.match(css, /\.v2-push > \.wrap\.is-paper \{ width: auto; margin: 0\.75rem var\(--space-m\) 0 0;/);
});

test('30h-5: block 30 has no transition or animation; any .rise-in rule sits under data-motion=on and no-preference; no hard-coded colour but the mask stops', () => {
  const b = stripC(blk);
  assert.ok(!/\b(transition|animation)\s*:/.test(b), 'no transition or animation');
  assert.ok(!/@keyframes|scroll-timeline|animation-timeline/.test(b));
  for (const m of b.matchAll(/[^{}]*\.rise-in[^{]*\{/g)) assert.match(m[0], /data-motion='on'/);
  if (/\.rise-in/.test(b)) assert.match(b, /@media \(prefers-reduced-motion: no-preference\)/);
  for (const ln of b.split('\n')) for (const m of ln.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) assert.ok(/mask/.test(ln) && /^#(0000|000)$/.test(m[0]), `colour literal ${m[0]}`);
});

test('30h-5: every block-30 :hover rule is inside (hover: hover) and (pointer: fine)', () => {
  const b = stripC(blk);
  const at = [...b.matchAll(/:hover/g)].map((m) => m.index);
  assert.ok(at.length >= 1);
  for (const i of at) {
    const open = b.lastIndexOf('@media (hover: hover) and (pointer: fine) {', i);
    assert.ok(open >= 0, `a :hover at ${i} has no (hover: hover) and (pointer: fine) media`);
    // the media block must still be open at i: brace depth from `open` stays > 0
    let depth = 0; for (let k = b.indexOf('{', open); k < i; k++) { if (b[k] === '{') depth++; else if (b[k] === '}') depth--; }
    assert.ok(depth > 0, `a :hover at ${i} sits outside the hover media block`);
  }
});

test('30h-5: every img.print is a Print file; no filter on covers, Clean .graded or .mark; CSP script-src stays self', () => {
  const PRINT = /(data:image\/gif|a-print-phone|b-print|poster-print|poster-art|garage-toner|stage-lines|belt-print)/;
  for (const page of ['index', 'music/index', 'shows/index', 'about/index', 'videos/index']) {
    const h = read(`dist/${page}.html`);
    for (const m of h.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0], cls = (tag.match(/class="([^"]*)"/) ?? [])[1] ?? '';
      if (/\bprint\b/.test(cls)) assert.match(tag, PRINT, `${page}: img.print is not a Print file: ${tag.slice(0, 120)}`);
      if (/covers\//.test(tag) || /\bmark\b/.test(cls)) assert.ok(!/\bprint\b|\bduo\b/.test(cls), `${page}: filter class on a cover or mark`);
    }
  }
  assert.ok(!/\.(mark|v2-cover|cover|idn-cover|tile-art)[^{]*\{[^}]*filter\s*:/.test(stripC(blk)), 'no filter on covers or the mark');
  assert.match(read('server.js'), /script-src 'self'; style-src 'self' 'unsafe-inline'/);
});

// ---- Round 3 (30f): the other pages ----
const page = (n) => read(`dist/${n}/index.html`);

test('30f: page classes (Music sheet, Videos torn band, About credits sheet, Book GLucak sheet) and the deleted 72rem Shows rule', () => {
  assert.match(page('music'), /<div class="idn is-paper" id="identity">/);
  assert.match(page('videos'), /<div class="tabs" role="tablist" aria-label="Videos" hidden>/); // owner 2026-11-18: tabs over two reels
  assert.match(page('about'), /<div class="wrap prose is-paper">/);
  assert.ok(!/class="venues[^"]*is-paper/.test(page('about')), 'About: the credits sheet is the one sheet (no paper inside paper)');
  assert.match(page('shows'), /class="venues is-paper taped"/);
  assert.ok(!/@media \(min-width: 72rem\) \{\s*\.shows-grid \{/.test(css), '72rem .shows-grid rule deleted');
  assert.match(css, /@media \(min-width: 700px\) \{ \.shows-grid \{ grid-template-columns: minmax\(0, 7fr\) minmax\(0, 5fr\)/);
  assert.match(read('src/lib/products.js'), /class="shop-banner taped"/);
});

test('30f: Music cover is never rotated, framed or filtered (D51); crate and Shop stagger; About album and Videos reels (owner 2026-11-18)', () => {
  const r3 = css.slice(css.indexOf('Round 3 (DESIGN 30f)'));
  assert.ok(!/\.idn-cover[^{]*\{[^}]*(rotate|transform|filter|border|outline|box-shadow)/.test(r3), 'idn-cover touched only for its margin');
  assert.match(r3, /\.idn\.is-paper \.idn-cover \{ margin-top: calc\(-1 \* var\(--space-xl\) - 2\.5rem\); \}/);
  assert.match(r3, /\.crate > :nth-child\(even\) \{ margin-top: 3rem; \}/);
  assert.match(r3, /\.shop-grid > :nth-child\(3n\+2\) \{ margin-top: 2\.5rem; \}/);
  assert.match(r3, /\.about-actions \{ grid-column: 9 \/ -1; position: sticky;/);
  assert.match(r3, /\.reel-track \{[^}]*scroll-snap-type: x mandatory;/);
  assert.ok(!/\.reel[^{]*\{[^}]*(transition|animation)/.test(r3), 'reels are static; a flip is a scroll');
  assert.equal(page('about').split('class="reel-slide"').length - 1, 8, 'About: 8 album pages');
  assert.equal(page('videos').split('data-reel').length - 1, 2, 'Videos: Music videos and Live reels');
  assert.match(r3, /\.shop-banner \{ rotate: -1\.5deg; \}/);
});

// Owner 2026-11-18: the Home film. Plays only while Motion is on; no autoplay attribute, nothing preloads, the still hero stays
// until a frame plays. The flash check on the files themselves is tools/film/analyze.mjs (ffmpeg, not in npm test).
test('film: video is muted, inline, preload none, no autoplay; app.js plays it only through runFilm(on); CSS shows it only with .film-on', () => {
  const v = home.match(/<video[^>]*>/)[0];
  assert.ok(/\bmuted\b/.test(v) && /\bplaysinline\b/.test(v) && /preload="none"/.test(v) && !/autoplay/.test(v));
  assert.match(home, /src="\/media\/film\/hero-port\.mp4"/); assert.match(home, /src="\/media\/film\/hero-land\.mp4"/);
  const app = read('public/js/app.js');
  assert.equal(app.split('film.play()').length - 1, 2, 'play() only in runFilm(on) and the visitor\'s Play button');
  assert.match(app, /function showMotion\(\) \{\n[^]*?runFilm\(on\);/);
  assert.match(css, /\.hero-film \{ visibility: hidden;/); assert.match(css, /\.hero\.film-on \.hero-film \{ visibility: visible; \}/);
});
test('film: the brightest film ink keeps large text at 3:1 in every palette (before the veil)', () => {
  for (const p of pals) {
    const c = p.colors;
    const ink = p.id === 'poster' ? mix(c.text, 0.42, c.bg) : mix(c.accent, 0.2, mix(c.text, 0.45, c.bg));
    assert.ok(ratio(c.text, ink) >= 3, `${p.id}: ${ratio(c.text, ink).toFixed(2)}`);
  }
});
