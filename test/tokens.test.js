// DESIGN 19b / D71: the --tint token. At 0% the neutrals are today's greys; at 5 and 10% text and muted still read on
// --bg-2; no colour literal may live outside the era's :root block (everything else derives from the tokens).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raw = readFileSync(join(import.meta.dirname, '../src/styles/global.css'), 'utf8');
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

// The first top-level :root block is the token block.
const rootStart = css.indexOf(':root {');
const rootEnd = css.indexOf('\n}', rootStart);
const root = css.slice(rootStart, rootEnd);
const outside = css.slice(0, rootStart) + css.slice(rootEnd + 2);
const tok = (name) => root.match(new RegExp(`${name}:\\s*([^;]+);`))[1].trim();

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp = (x) => Math.min(1, Math.max(0, x));
const to255 = (rgb) => rgb.map((c) => Math.round(clamp(c) * 255));

function srgbMix(a, pa, b) { // pa of a into b, plain sRGB
  return a.map((v, i) => v * pa + b[i] * (1 - pa));
}
function toOklab(rgb) {
  const [r, g, b] = rgb.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(toSrgb);
}
// color-mix(in oklch, accent <p>, base): L and C linear; hue of the accent when the base is a grey (powerless hue).
function oklchMix(accent, p, base) {
  const [La, aa, ba] = toOklab(accent);
  const [Lb, ab, bb] = toOklab(base);
  const Ca = Math.hypot(aa, ba), Cb = Math.hypot(ab, bb);
  const h = Math.atan2(ba, aa);
  const hb = Cb < 1e-4 ? h : Math.atan2(bb, ab);
  let dh = h - hb; if (dh > Math.PI) dh -= 2 * Math.PI; if (dh < -Math.PI) dh += 2 * Math.PI;
  const hm = hb + dh * p;
  const L = La * p + Lb * (1 - p), C = Ca * p + Cb * (1 - p);
  return fromOklab([L, C * Math.cos(hm), C * Math.sin(hm)]);
}
const lum = (rgb) => { const [r, g, b] = rgb.map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const bg = hex(tok('--bg')), text = hex(tok('--text')), accent = hex(tok('--accent')), muted = hex(tok('--muted'));
const bg2 = (pct) => oklchMix(accent, pct / 100, srgbMix(text, 0.07, bg));
const line = (pct) => oklchMix(accent, pct / 100, srgbMix(text, 0.26, bg));

test('--tint ships at 0% and --bg-2 / --line mix the accent in OKLCH over today\'s sRGB greys', () => {
  assert.equal(tok('--tint'), '0%');
  assert.equal(tok('--bg-2'), 'color-mix(in oklch, var(--accent) var(--tint), color-mix(in srgb, var(--text) 7%, var(--bg)))');
  assert.equal(tok('--line'), 'color-mix(in oklch, var(--accent) var(--tint), color-mix(in srgb, var(--text) 26%, var(--bg)))');
});

test('at 0% --bg-2 and --line are within 1/255 of today\'s greys (#212121, #4c4c4c)', () => {
  const today2 = to255(srgbMix(text, 0.07, bg)), todayL = to255(srgbMix(text, 0.26, bg));
  assert.deepEqual(today2, [0x21, 0x21, 0x21]);
  assert.deepEqual(todayL, [0x4c, 0x4c, 0x4c]);
  for (const [got, want] of [[to255(bg2(0)), today2], [to255(line(0)), todayL]]) {
    got.forEach((v, i) => assert.ok(Math.abs(v - want[i]) <= 1, `${got} vs ${want}`));
  }
});

test('text and muted on --bg-2 stay >= 4.5:1 at 0, 5 and 10% tint', () => {
  for (const pct of [0, 5, 10]) {
    const ground = to255(bg2(pct)).map((v) => v / 255);
    assert.ok(ratio(text, ground) >= 4.5, `text on bg-2 at ${pct}%: ${ratio(text, ground).toFixed(2)}`);
    assert.ok(ratio(muted, ground) >= 4.5, `muted on bg-2 at ${pct}%: ${ratio(muted, ground).toFixed(2)}`);
  }
});

test('no colour literal outside :root (a #000 mask stop is allowed)', () => {
  const bad = [];
  outside.split('\n').forEach((ln, i) => {
    const isMask = /mask/.test(ln);
    for (const m of ln.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) if (!(isMask && /^#(000|000000)$/.test(m[0]))) bad.push(`${m[0]} (line ${i + 1} outside :root)`);
    for (const m of ln.matchAll(/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g)) bad.push(`${m[0]} (line ${i + 1} outside :root)`);
  });
  assert.deepEqual(bad, []);
});
