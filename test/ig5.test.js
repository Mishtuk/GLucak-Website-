// Round IG5 (DESIGN 24): inner grounds (900px+, static), For venues, Start with Go, the 404 heading.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = join(import.meta.dirname, '..');
const page = (f) => readFileSync(join(ROOT, 'dist', f), 'utf8');
const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8').replace(/\r\n/g, '\n');
const block24a = css.slice(css.indexOf('/* ---------- DESIGN 24a.'), css.indexOf('DESIGN 24b.'));
const venues = (h) => h.match(/<div class="venues">[^]*?<\/p>\s*<\/div>/)?.[0] ?? '';

test('24b: For venues on Shows and About with no address = no button, no chip, no period in the heading', () => {
  for (const f of ['shows/index.html', 'about/index.html']) {
    const v = venues(page(f));
    assert.ok(v, `${f}: block present`);
    assert.match(v, /<h2>Book GLucak<\/h2>/);
    assert.ok(!/Request a show|btn-line|mailto:/.test(v), `${f}: no button without the booking email`);
    assert.ok(!/ph-chip|coming soon/i.test(v), `${f}: no chip`);
    assert.match(v, /<a class="go" href="\/music\/">Listen<\/a>/);
    for (const h of v.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)) assert.ok(!h[1].includes('.'), `title has no period: ${h[1]}`);
    assert.ok(!/Placeholder: booking email/.test(page(f)), `${f}: old placeholder line gone`);
  }
  const about = page('about/index.html');
  assert.ok(about.indexOf('class="venues"') > -1 && about.indexOf('class="venues"') < about.indexOf('Find GLucak'), 'About: before Find GLucak');
  assert.ok(!/<h2>Booking<\/h2>/.test(about));
  assert.match(page('shows/index.html'), /<div class="shows-side">[^]*<div class="venues">/);
});

test('24b: the button exists only when BOOKING_EMAIL is set (component source)', () => {
  const src = readFileSync(join(ROOT, 'src/components/ForVenues.astro'), 'utf8');
  assert.match(src, /\{BOOKING_EMAIL && <a class="btn btn-line"/);
  assert.match(src, /\{BOOKING_EMAIL && <p class="venues-addr">/);
  assert.match(src, /import \{ BOOKING_EMAIL \} from '\.\.\/lib\/shows\.js'/);
});

test('24c: Music has New here? Start with Go on the Releases row; the crate order is unchanged', () => {
  const m = page('music/index.html');
  assert.match(m, /class="start-line"/);
  assert.ok(m.includes('wingsmusic.lnk.to/370407-Go'));
  assert.match(m, /<a class="go"[^>]*aria-label="Start with Go, on all platforms[^"]*"/);
  assert.match(m, /New here\? /);
});

test('24d: the 404 heading reads Wrong turn with no period and no blank ledge', () => {
  const h = page('404.html');
  assert.match(h, /<span class="ln ln-lost2">turn<\/span>/);
  assert.ok(!h.includes('turn.') && !h.includes('tab-blank'));
  assert.ok(!/\.tab-blank/.test(css));
  assert.match(css, /--w-lost2: 1\.9318/);
});

test('24a: grounds are on 404, Music and Shows only; Home carries none of the new classes', () => {
  assert.match(page('404.html'), /class="band band-lost lost has-ground ground-turns"/);
  assert.match(page('music/index.html'), /class="band band-rise has-ground ground-grooves"/);
  assert.match(page('shows/index.html'), /class="band band-live"/);
  assert.ok(!/class="[^"]*has-ground/.test(page('shows/index.html')), 'D93: Shows drops the Kealey wall strip');
  assert.ok(!/class="[^"]*has-ground/.test(page('about/index.html')), 'no ground on About');
  const home = page('index.html');
  for (const w of ['has-ground', 'venues', 'start-line']) assert.ok(!new RegExp(`class="[^"]*\\b${w}\\b`).test(home), `Home has no ${w} element`);
  assert.match(home, /class="band band-rise"/);
});

test('24a: the ground paints only from 900px and is static', () => {
  assert.match(css, /\.has-ground \{ isolation: isolate; \}/);
  // every .has-ground::before / mask url sits inside the min-width: 900px query; nothing before it
  const outside = block24a.replace(/@media \(min-width: 900px\) \{[^]*?\n\}\n/, '');
  assert.ok(!/::before|url\(|mask/.test(outside.replace(/\/\*[^]*?\*\//g, '')), 'no ground rule outside the 900px query');
  assert.match(block24a, /@media \(min-width: 900px\) \{\s*\.has-ground::before \{/);
  assert.ok(!/animation|transition|@keyframes|scroll-timeline|animation-timeline/.test(block24a.replace(/\/\*[^]*?\*\//g, '')), 'no motion in the 24a block');
});

test('24a: ground files stay small; the contrast check exits 0', () => {
  assert.ok(statSync(join(ROOT, 'public/media/g-turns.svg')).size < 12 * 1024);
  assert.ok(statSync(join(ROOT, 'public/media/g-grooves.svg')).size < 4 * 1024);
  const r = spawnSync(process.execPath, ['tools/photo/grounds.mjs', '--only='], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
