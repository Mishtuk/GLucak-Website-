// Gabe's answers (email 2026-11-06, docs/research/gabe-answers-2026-11-06.md): flashing videos never show; Welcome Home is listed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const src = readFileSync(join(root, 'src/components/content.js'), 'utf8');
const FLASHING = new RegExp(src.match(/export const FLASHING = \/(.+)\/i;/)[1], 'i');

test('the two videos Gabe flagged as flashing are blocked; the Earned Your Stripes music video is not', () => {
  assert.ok(FLASHING.test('Running The Gauntlet (Official Lyric Video)'));
  assert.ok(FLASHING.test('Earned Your Stripes (Official Visualizer)'));
  assert.ok(!FLASHING.test('Earned Your Stripes (Official Music Video)'));
  assert.ok(!FLASHING.test('Duck, Dodge, Jump, Fight! (Official Music Video)'));
});

test('no flagged video is on any built page', () => {
  const vids = JSON.parse(readFileSync(join(root, 'src/data/videos.json'), 'utf8'));
  const rows = Array.isArray(vids) ? vids : vids.items ?? vids.videos ?? [];
  const bad = rows.filter((v) => FLASHING.test(v.title ?? '')).map((v) => v.id);
  for (const page of ['index.html', 'shows/index.html', 'music/index.html']) {
    const html = readFileSync(join(root, 'dist', page), 'utf8');
    for (const id of bad) assert.ok(!html.includes(id), `${page} shows flashing video ${id}`);
  }
});

test('Welcome Home is listed for Dec 18, 2026', () => {
  const r = JSON.parse(readFileSync(join(root, 'src/data/releases.json'), 'utf8'));
  assert.equal(r.find((x) => x.title === 'Welcome Home')?.date, '2026-12-18');
});
