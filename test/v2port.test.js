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
  assert.ok(card.indexOf('class="player"') < card.indexOf('v2-cover'), 'DOM: player first, so Tab reaches it before Listen on phones');
  assert.ok(card.indexOf('class="player"') < card.indexOf('>Listen<'));
  assert.match(css, /@media \(min-width: 900px\) \{ \.v2-card > \.v2-rel \{ order: -1; \} \}/);
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
  assert.ok(h.includes('Photo: Alexander Kealey.') && h.includes('Video still: Joseph Lucak.') && h.includes('Video stills: GLucak on YouTube.') && h.includes('IDENTITY cover: GLucak.') && h.includes('Photos: from the IDENTITY CD.'));
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

test('credits match the images each page shows; clamp gone; focusin handler; 200% Now-line rule', () => {
  const content = readFileSync(join(ROOT, 'src/components/content.js'), 'utf8');
  const CREDIT_FOR = [[/\/media\/v2\/(belt|stage)-|videos\/OOGT3GxlQJk-/, 'Video stills: GLucak on YouTube.'], [/videos\/aZNW63M_C2E-/, 'Video still: Vladd (Vladdtime).'],[/covers\/identity/, 'IDENTITY cover: GLucak.'], [/\/media\/cd-/, 'Photos: from the IDENTITY CD.'], [/\/media\/v2\/garage-|videos\/K-OZiNvQB14-/, 'Video still: Joseph Lucak.'], [/a-era-grade/, 'Photo: Alexander Kealey.']];
  assert.ok(content.includes('CREDIT_FOR'));
  for (const page of ['index.html', 'shows/index.html', 'about/index.html', 'music/index.html', 'videos/index.html']) {
    const h = readFileSync(join(ROOT, 'dist', page), 'utf8');
    const credits = h.match(/class="credits">([^<]*)</)?.[1] ?? '';
    const srcs = [...h.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
    for (const [re, c] of CREDIT_FOR) {
      if (c.startsWith('Photo:')) continue; // Kealey art on /shows/ is injected at serve time, not in the static HTML
      assert.equal(srcs.some((s) => re.test(s)), credits.includes(c), `${page}: ${c}`);
    }
  }
  assert.ok(readFileSync(join(ROOT, 'dist/shows/index.html'), 'utf8').includes('Photo: Alexander Kealey.'));
  assert.ok(!/line-clamp/.test(css.match(/\.v2-vtitle \{[^}]*\}/)[0]));
  assert.match(readFileSync(join(ROOT, 'public/js/app.js'), 'utf8'), /focusin[^]*scrollIntoView\(\{ block: 'nearest', inline: 'nearest' \}\)/);
  assert.match(css, /@media \(max-width: 699px\) \{ @container \(width < 16rem\) \{ \.hero-actions \{ display: none; \} \} \}/);
});

test('18h: D1 video grid from 900px, lock-push on FEAR, no-break kicker date, dead 16f rules gone', () => {
  assert.match(css, /@media \(min-width: 900px\) \{\s*\.v2-vrow \{ grid-template-columns: minmax\(0, 2fr\) minmax\(0, 1fr\); \}\s*\.v2-vid:first-child \{ grid-row: 1 \/ span 2; \}/);
  const h = home();
  assert.match(h, /<span class="phrase fit lock-push"><span class="ln ln-push1">Push Past/);
  assert.match(h, /sizes="\(min-width: 900px\) 34vw, 82vw"/);
  assert.match(h, /sizes="\(min-width: 900px\) 40vw, 30vw"/);
  const k = h.match(/<p class="v2-kicker">([^]*?)<\/p>/)[1];
  assert.match(k, /[A-Z][a-z]{2} \d{1,2}, \d{4}/, 'the date has no breaking spaces');
  assert.ok(!css.includes('.rise-player:has(~ .release)') && !/\.release, \.quote \{ grid-column: 1/.test(css));
});
