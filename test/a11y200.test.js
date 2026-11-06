// WCAG 1.4.4 / 1.4.10: static guards so big text can't push content off a phone (browser measurements: docs/review/a11y-200/README.md, DESIGN.md 17).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const ed = readFileSync(new URL('../src/pages/edit/index.astro', import.meta.url), 'utf8');
const line = (start) => css.split('\n').filter((l) => l.startsWith(start)).join(' ');

test('hero buttons wrap, equal halves, no fixed pixel width', () => {
  assert.match(line('.hero-actions {'), /flex-wrap:\s*wrap/);
  assert.match(line('.hero-actions .btn {'), /flex:\s*1;/);
  assert.doesNotMatch(line('.hero-actions .btn {'), /(?<!min-)(?<!max-)width:\s*\d+px/);
});
test('header: container on the site header; the word (never the mark) gives way; one-line bar', () => {
  assert.match(line('.site-header {'), /container-type:\s*inline-size/);
  assert.doesNotMatch(line('.header-bar {'), /container-type/);
  assert.match(css, /@container \(width < 19rem\) \{ \.mark \+ \.brand-word \{ display: none; \} \}/);
  assert.doesNotMatch(css, /\.mark-head \{ display: none/);
  assert.match(line('.brand {'), /line-height:\s*1;[^}]*min\(1\.75rem, 11\.5cqi\)/);
});
test('phone-bar labels are capped at 7% of the bar (one row)', () => {
  assert.match(line('.phone-bar {'), /container-type:\s*inline-size/);
  assert.match(line('.phone-bar a {'), /font-size:\s*min\(1rem, 7cqi\)/);
});
test('link grids follow text size through container queries', () => {
  assert.match(css, /@container \(width < 21rem\) \{ \.links \{ grid-template-columns: repeat\(2/);
  assert.match(css, /@container \(width < 15\.5rem\) \{ \.links \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.doesNotMatch(css, /auto-fit/);
});
test('narrow card stacks the poster and rows; the first-pass block is gone', () => {
  assert.match(css, /@container \(width < 15rem\) \{\s*\.poster \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@container \(width < 17rem\) \{\s*\.row \{/);
  assert.doesNotMatch(css, /@container \(max-width: 17rem\)/);
});
test('skip link hides above the page; gutter in px; editor tabs wrap', () => {
  assert.match(css, /\.skip \{ top: -100vh; \}/);
  assert.match(css, /--gutter: clamp\(20px, 12\.8px \+ 2vw, 40px\)/);
  assert.match(ed, /\.ed-tabs \{ display: flex; flex-wrap: wrap;/);
  assert.match(ed, /\.ed-tab \{ flex: 1 1 0%;/);
});
