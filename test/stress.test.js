// R1 stress guards (docs/review/r1-stress.md): messy real-world content (45-char venue, 40-char city, a long "with" line, a 40-char
// release title, a long artists credit, a 60-char video title, a three-paragraph bio, a long product name) must wrap inside its box,
// never push the page sideways or run under the next card. Browser measurements: docs/review/r1-stress/stress.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rowHtml, posterHtml } from '../src/lib/shows.js';
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const rule = (sel) => css.split(/\r?\n/).filter((l) => l.startsWith(`${sel} {`)).join(' ');

test('show rows: the text column may shrink (minmax(0, 1fr)) and long words wrap', () => {
  assert.match(css, /\.row \{\s*display: grid; grid-template-columns: 4\.5rem minmax\(0, 1fr\) auto/);
  for (const c of ['.row-place', '.row-kind']) assert.match(rule(c), /overflow-wrap:\s*anywhere/, c);
  assert.match(css, /\.poster-place, \.poster-meta \{ overflow-wrap: break-word/);
});
test('music tiles: one shrinkable column through the link and the text; artists and title wrap', () => {
  for (const c of ['.tile-link', '.tile-text']) assert.match(rule(c), /grid-template-columns:\s*minmax\(0, 1fr\)/, c);
  for (const c of ['.tile-title', '.tile-artists']) assert.match(rule(c), /overflow-wrap:\s*anywhere/, c);
});
test('video titles and bio text wrap inside their column', () => {
  assert.match(rule('.v2-vid a'), /grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(rule('.v2-vtitle'), /overflow-wrap:\s*anywhere/);
  assert.match(rule('.bio'), /grid-template-columns:\s*minmax\(0, 1fr\)[^}]*overflow-wrap:\s*anywhere/);
  assert.match(rule('.bio-lead'), /overflow-wrap:\s*anywhere/);
});
test('the long cases render as text in the classes those rules cover (escaped, one place span, one kind span)', () => {
  const r = { date: '2026-12-12', time: '19:30', type: 'show', venue: 'V'.repeat(45), city: 'C'.repeat(40), with: 'Micah Haun, J-BOY & <b>friends</b>, plus a very special guest to be announced', link: 'https://example.com/t' };
  const row = rowHtml(r), poster = posterHtml(r);
  assert.match(row, /<span class="row-place">V{45}, C{40}<\/span>/);
  assert.match(row, /<span class="row-kind">Show, 7:30 PM, With Micah Haun, J-BOY &amp; &lt;b&gt;friends&lt;\/b&gt;/);
  assert.match(poster, /<p class="poster-place">V{45}, C{40}<\/p>/);
  assert.doesNotMatch(row + poster, /<b>/);
});
