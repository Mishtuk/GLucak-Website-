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

test('28e: the nav, Listen and the lockups switch at 700px, the Menu fallback is 42rem; nothing is left at 900 for the nav', () => {
  assert.match(css, /@media \(min-width: 700px\) \{\s*\.nav-desktop \{ display: flex; \}\s*\.header-listen \{ display: inline-flex; \}\s*\.nav-mobile \{ display: none; \}/);
  assert.match(css, /@container \(width < 42rem\)/);
  for (const m of css.matchAll(/@media \(min-width: 900px\) \{([^]*?)\n\}/g)) assert.ok(!/\.nav-desktop \{ display: flex/.test(m[1]), 'no 900px block holds the nav');
  const m700 = css.slice(css.indexOf('28e. Lockups'));
  assert.ok(m700.includes('.lock-push .ln') && m700.includes('.lock-now .ln') && m700.includes('(max-width: 899px)') && m700.includes('.hero-actions .btn'));
  assert.ok(dist('index.html').includes('phrase fit lock-now'));
  assert.match(css, /--w-now: 6\.3265;/);
});

test('28f: the .stub rules have no transition or animation and a 48px minimum', () => {
  const rules = [...css.matchAll(/(?:^|\n)(\.stub[^{\n]*)\{([^}]*)\}/g)];
  assert.ok(rules.length >= 5);
  for (const m of rules) assert.ok(!/transition|animation/.test(m[2]), m[1]);
  assert.match(css, /\.stub \{[^}]*min-height: 48px/);
});

test('28j: the new lines sit where 28j puts them (Home hero, RISE, Shows, About); .next-rel holds no btn-solid', () => {
  const home = dist('index.html');
  assert.ok(home.indexOf('<p class="sound">EDM, rap and rock. Raw lyrics, real faith, high energy.</p>') > home.indexOf('class="now"'));
  const rise = home.slice(home.indexOf('class="v2-rel"'), home.indexOf('class="quote'));
  const next = home.match(/<p class="next-rel">[^]*?<\/p>/)?.[0] ?? '';
  assert.ok(next.includes('Next: Welcome Home, Dec 18.') && next.includes('Pre-save<span class="vh">') && !next.includes('btn-solid') && rise.includes('next-rel'));
  assert.ok(dist('shows/index.html').includes('<p class="shows-intro">Mostly open mics around Horsham and Doylestown, plus a full show at Riverside on Jan 16. Come hear unreleased songs.</p>'));
  assert.ok(dist('about/index.html').includes('<p>The hours in the studio. The energetic live performances.'));
});
