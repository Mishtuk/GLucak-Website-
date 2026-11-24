// W1: the public pages with data Gabe could create. Each test pins one fix found by the edge-data pass.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nowShowingHtml, recordsHtml } from '../src/lib/videos.js';
import { posterHtml } from '../src/lib/shows.js';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('all videos hidden: /videos/ says so and still links to YouTube', () => {
  const hidden = [{ id: 'ZGlnFchIVVY', title: 'x', date: '2026-09-30', kind: 'music-video', noFlash: true, hidden: true }];
  for (const rows of [[], hidden]) {
    const h = nowShowingHtml(rows);
    assert.match(h, /No videos here right now\./);
    assert.match(h, /href="https:\/\/www\.youtube\.com\/channel\//);
    assert.ok(!recordsHtml(rows, {}).includes('class="records"'), 'no empty Records shelf');
  }
});

test('a long unbroken address wraps instead of widening the page', () => {
  const h = posterHtml({ date: '2026-12-05', type: 'show', venue: 'V', city: 'C', address: 'A'.repeat(120) }, { today: '2026-11-23' });
  assert.match(h, /class="map-link"/);
  assert.match(css, /\.map-link \{[^}]*overflow-wrap: anywhere/);
});

test('a full show without the photo takes the whole card (no empty 55% column)', () => {
  const h = posterHtml({ date: '2026-12-05', type: 'show', venue: 'V', city: 'C' }, { today: '2026-11-23' });
  assert.ok(!h.includes('<picture>'), 'only the first full show carries the photo');
  assert.match(css, /\.poster:not\(\.is-plain\):not\(:has\(> picture\)\) \{ grid-template-columns: minmax\(0, 1fr\)/);
});
