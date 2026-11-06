// WCAG 1.4.4 / 1.4.10: static guards so big text can't push content off a phone (browser measurements: docs/review/a11y-200/README.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const line = (start) => css.split('\n').filter((l) => l.startsWith(start)).join(' ');

test('hero buttons wrap and have no fixed pixel width', () => {
  assert.match(line('.hero-actions {'), /flex-wrap:\s*wrap/);
  assert.doesNotMatch(line('.hero-actions .btn {'), /(?<!min-)(?<!max-)width:\s*\d+px/);
});
test('header brand word gives way to the mark when space runs out', () => {
  assert.match(css, /@container \(max-width: 19rem\) \{ \.mark \+ \.brand-word \{ display: none; \} \}/);
  assert.match(line('.header-bar {'), /container-type:\s*inline-size/);
});
test('link grids size columns in rem (they follow the text size)', () => {
  assert.match(css, /\.links \{[^}]*auto-fit, minmax\(\d/);
  assert.doesNotMatch(css, /repeat\((?:3|7), minmax\(max-content/);
});
test('narrow card stacks the poster and rows', () => {
  assert.match(css, /@container \(max-width: 17rem\) \{[\s\S]*?\.poster \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
});
