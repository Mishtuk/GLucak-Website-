// Overhaul OV3 rules (DESIGN 28e-28h): nav from 700, the accent rule, the stub, player first, no fades.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const css = read('src/styles/global.css');
const dist = (f) => read(join('dist', f));
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });

test('28h: no .fade / fade-wait anywhere, no order: -1 on .v2-rel, the player comes before the release row', () => {
  assert.ok(!/\.fade\b|fade-wait/.test(css) && !/\bfade(-wait)?\b/.test(read('public/js/app.js')));
  for (const p of walk(join(ROOT, 'dist'))) assert.ok(!/class="[^"]*\bfade\b/.test(readFileSync(p, 'utf8')), `${p}: no fade class`);
  assert.ok(!/\.v2-rel\s*\{[^}]*order:\s*-1/.test(css) && !/v2-card > \.v2-rel/.test(css));
  const h = dist('index.html');
  assert.ok(h.indexOf('class="player-box"') > -1 && h.indexOf('class="player-box"') < h.indexOf('class="v2-rel"'));
});
