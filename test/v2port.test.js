// v2 items ported into the real Home (owner picked them): release card, video row, one photo per slot, phrase grid, header switch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const home = () => readFileSync(join(ROOT, 'dist/index.html'), 'utf8');
const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');

test('release card: cover, Listen and the player in one panel; the player leads on phones (CSS order under 900px)', () => {
  const h = home();
  const card = h.slice(h.indexOf('class="v2-card"'));
  assert.ok(card.indexOf('v2-cover') < card.indexOf('class="player"'), 'DOM: cover row first (desktop reading order)');
  assert.ok(card.includes('>Listen<'));
  assert.match(css, /@media \(max-width: 899px\) \{ \.v2-card > \.rise-play \{ order: -1; \} \}/);
});

test('video row: latest + 2 featured, local thumbnails that exist, facade kept, 3 across from 700px', () => {
  const h = home();
  const row = h.match(/<ul class="v2-vrow">[^]*?<\/ul>/)[0];
  assert.equal((row.match(/<li class="v2-vid">/g) ?? []).length, 3);
  assert.equal((row.match(/data-yt="[\w-]{11}"/g) ?? []).length, 3);
  const thumbs = [...row.matchAll(/src="(\/media\/videos\/[\w-]+-640\.webp)"/g)].map((m) => m[1]);
  assert.equal(thumbs.length, 3);
  for (const t of thumbs) assert.ok(existsSync(join(ROOT, 'public', t)), t);
  assert.ok(!/ytimg\.com/.test(h));
  assert.match(css, /@media \(min-width: 700px\) \{ \.v2-vrow \{[^}]*repeat\(3, minmax\(0, 1fr\)\)/);
});

test('Home: no image src repeats, and the credits cover the photos shown', () => {
  const h = home();
  const srcs = [...h.matchAll(/<img [^>]*?\bsrc="([^"]+)"/g)].map((m) => m[1]).filter((s) => !s.startsWith('data:') && !s.endsWith('.svg') && !/mark-identity/.test(s));
  assert.equal(new Set(srcs).size, srcs.length, `repeats: ${srcs.join(' ')}`);
  assert.ok(h.includes('Photo: Alexander Kealey.') && h.includes('Video still: Joseph Lucak.'));
  assert.ok(!h.includes('d-crowd'), 'the crowd photo is gone from Home');
});

test('HEADER_STYLE: one switch in content.js, default solid, read by Base, with a CSS rule per style', () => {
  assert.match(readFileSync(join(ROOT, 'src/components/content.js'), 'utf8'), /export const HEADER_STYLE = 'solid'/);
  assert.match(readFileSync(join(ROOT, 'src/layouts/Base.astro'), 'utf8'), /data-header=\{HEADER_STYLE\}/);
  assert.match(home(), /<html [^>]*data-header="solid"/);
  assert.match(css, /html\[data-header='solid'\] \.site-header/);
});

test('phrase beside its content: 5 : 7 grid from 900px, phones stacked', () => {
  assert.match(css, /@media \(min-width: 900px\) \{\s*\.band > \.wrap\.v2-split \{ grid-template-columns: minmax\(0, 5fr\) minmax\(0, 7fr\)/);
  assert.match(css, /\.v2-split \{ display: grid; grid-template-columns: minmax\(0, 1fr\)/);
});
