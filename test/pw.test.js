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
