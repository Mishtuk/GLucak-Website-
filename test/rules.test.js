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

import { showsHtml } from '../src/lib/shows.js';

test('28g: btn-solid only on Listen, Pre-save, Tickets, Buy (every built page but /edit/)', () => {
  for (const p of walk(join(ROOT, 'dist'))) {
    if (p.includes(`${join('dist', 'edit')}`)) continue;
    const h = readFileSync(p, 'utf8');
    for (const m of h.matchAll(/<(a|button)\b[^>]*class="[^"]*\bbtn-solid\b[^"]*"[^>]*>([^<]*)</g)) assert.match(m[2].trim(), /^(Listen|Pre-save|Tickets|Buy)$/, `${p}: btn-solid "${m[2]}"`);
  }
});

test('28g: Home at 390 has at most 3 magenta fills (not the header Listen) with a fixture of a full show with a link', () => {
  const home = dist('index.html').replace(/<!--gl:shows-->/, showsHtml([
    { date: '2026-11-18', time: '19:00', type: 'open-mic', venue: 'A', city: 'C' },
    { date: '2026-11-19', time: '19:00', type: 'show', venue: 'B', city: 'C', link: 'https://x.example/t' },
    { date: '2026-11-20', time: '19:00', type: 'open-mic', venue: 'D', city: 'C' }], new Date('2026-11-18T17:00:00Z'), { limit: 3, allLink: '/shows/' }));
  const fills = [...home.matchAll(/<a\b[^>]*class="[^"]*\bbtn-solid\b[^"]*"/g)].filter((m) => !m[0].includes('header-listen')).length;
  const tickets = (home.match(/class="btn btn-show"[^>]*>Tickets</g) || []).length;
  assert.ok(fills + tickets <= 3, `fills ${fills}, tickets ${tickets}`); // hero Listen + release Listen, + Tickets when a full show is in the first three
});

test('28g: the video play square is ink, not accent', () => {
  const rule = css.match(/\n\.yt-play \{[^}]*\}/)[0];
  assert.ok(rule.includes('background: var(--text)') && !rule.includes('--accent'));
  assert.ok(!/\.yt-play::before \{[^}]*--accent/.test(css));
});
