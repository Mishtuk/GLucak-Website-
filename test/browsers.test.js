// R1 cross-browser pass (docs/review/r1-browsers.md): the fallbacks for engines that lack a feature are in the source and
// survive the minifier (it drops a plain declaration written before its modern twin, so they must be @supports rules).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8').replace(/\r\n/g, '\n');
const built = readFileSync(join(ROOT, 'dist/index.html'), 'utf8');
const fallbacks = css.slice(css.indexOf('Other browsers (R1 cross-browser pass'));

test('every fitted line (font-size from cqi) has a viewport-based fallback for browsers without container units', () => {
  const fitted = new Set([...css.matchAll(/\n\s*(?:html\[[^\]]*\] )?(\.[\w-]+(?: \.[\w-]+)?)[^{\n]*\{[^}\n]*font-size: calc\(100cqi \/ /g)].map((m) => m[1]));
  assert.ok(fitted.size >= 12, `found ${fitted.size} fitted selectors`);
  for (const sel of fitted) assert.ok(fallbacks.includes(sel), `no cqi fallback for ${sel}`);
  assert.match(fallbacks, /@supports not \(width: 1cqi\)/);
});

test('fallbacks are @supports rules that Chrome never reaches, and they are still in the build', () => {
  for (const q of ['(min-height:100dvh)', '(overflow:clip)', '(color:color-mix(in srgb, red, blue))', '(width:1cqi)']) {
    assert.ok(built.includes(`@supports not ${q}`), `built CSS lost @supports not ${q}`);
  }
  assert.match(fallbacks, /--bg-2: var\(--bg\); --line: var\(--muted\)/);
});

test('the header rules are not one :has() selector list (an engine without :has would drop the solid header too)', () => {
  assert.match(css, /\n\.site-header\.is-solid \{[^}]*\}\n\.site-header:has\(details\[open\]\) \{/);
  assert.doesNotMatch(css, /\.site-header\.is-solid, /);
});
