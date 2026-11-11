// Round IG4 (DESIGN 23): the texture family, the hero glow gone, SHOWS as an arrow link, grey band rules, footer words
// without periods, the Menu sheet's open / close transition only with motion on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const page = (f) => readFileSync(join(ROOT, 'dist', f), 'utf8');
const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8').replace(/\r\n/g, '\n');
const js = readFileSync(join(ROOT, 'public/js/app.js'), 'utf8');
const PAGES = ['index.html', 'music/index.html', 'shows/index.html', 'about/index.html', '404.html'];

test('23b.1: the hero glow and its drift animation are gone; the wall is a static mask from 900px', () => {
  assert.ok(!/\.glow\b|@keyframes drift|glow-away/.test(css), 'no .glow / drift in the CSS');
  assert.ok(!/glow/.test(js), 'app.js no longer toggles glow-away');
  const home = page('index.html');
  assert.ok(!/class="glow"/.test(home), 'no glow element on Home');
  assert.match(home, /<div class="hero-wall" aria-hidden="true"><\/div>/);
  const wall = css.match(/@media \(min-width: 900px\) \{\s*\.hero-wall \{([^}]*)\}/)[1];
  assert.ok(/mask: url\('\/media\/hero-wall-1600\.webp'\)/.test(wall) && !/animation|transition/.test(wall));
  assert.ok(existsSync(join(ROOT, 'public/media/hero-wall-1600.webp')));
});

test('23b.2: the SHOWS link in the hero (and 404, Full bio) is a .go arrow link, not a .btn', () => {
  const hero = page('index.html').match(/<div class="hero-actions">([^]*?)<\/div>/)[1];
  assert.match(hero, /<a class="go" href="#shows" aria-label="See upcoming shows">Shows<\/a>/);
  assert.ok(!/btn-line/.test(hero), 'no outlined button in the hero');
  assert.match(page('index.html'), /<a class="go" href="\/about\/">Full bio<\/a>/);
  assert.match(page('404.html'), /<a class="go" href="\/shows\/" aria-label="See upcoming shows">Shows<\/a>/);
  assert.ok(!/class="btn btn-line"/.test(page('404.html')));
  const go = css.match(/\n\.go \{([^}]*)\}/)[1];
  assert.ok(/min-height: 52px/.test(go) && !/animation|transition/.test(go));
  assert.match(css, /\.go:active,/);
});

test('23b.3 / 23b.4: band and footer rules are --line; the word is a 20px display label over a ledge that covers the rule', () => {
  assert.match(css, /\.band \{[^}]*border-top: 4px solid var\(--line\)/);
  assert.match(css, /\.site-footer \{[^}]*border-top: 4px solid var\(--line\)/);
  const ledge = css.match(/\n\.tab::before \{([^]*?)\n\}/)[1];
  assert.ok(/bottom: -4px; height: 0\.5rem/.test(ledge));
});

test('23b.5: footer words have no periods, on every page', () => {
  for (const f of PAGES) {
    const h = page(f);
    const close = h.match(/<span class="ln ln-close">([^]*?)<\/span>/)[1];
    const words = [...close.matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((m) => m[1]);
    assert.ok(words.length >= 3, `${f}: Listen, Shows, Join`);
    for (const w of words.filter((x) => /^(Listen|Shows|Join)/.test(x))) assert.ok(!/\./.test(w), `${f}: "${w}" has no period`);
  }
  assert.match(css, /\.ln-close \{ font-size: calc\(100cqi \/ var\(--w-close\)\); word-spacing: 0\.375em; \}/);
  assert.match(css, /\.footer-chip \{[^}]*border: 0;/);
});

test('23a: the new photo files are what the pages serve, once per slot, and the old files stay', () => {
  const home = page('index.html');
  for (const f of ['v2/stage-lines-360', 'v2/stage-lines-634', 'v2/belt-plates-320', 'v2/belt-plates-634', 'v2/garage-toner-480', 'v2/garage-toner-874', 'a-night-phone-800']) {
    assert.ok(home.includes(`/media/${f}.webp`), `${f} on Home`);
    assert.ok(existsSync(join(ROOT, 'public/media', `${f}.webp`)));
  }
  assert.ok(!/a-era-grade-phone-800|v2\/(stage|belt|garage)-\d/.test(home), 'Home serves no old file');
  assert.ok(page('about/index.html').includes('d-crowd-screen-phone-800') && !/d-crowd-(phone-)?\d/.test(page('about/index.html')));
  for (const f of ['a-era-grade-phone-800', 'v2/belt-320', 'v2/stage-360', 'v2/garage-480', 'd-crowd-800']) assert.ok(existsSync(join(ROOT, 'public/media', `${f}.webp`)), `${f} stays in the repo`);
  assert.match(home, /alt="GLucak singing on stage at Crooked Eye Brewery"/);
});

test('23c: the Menu sheet transition exists only under no-preference AND data-motion on (none under reduced motion)', () => {
  const at = css.indexOf('23c. Menu sheet');
  assert.ok(at > 0);
  const block = css.slice(at, css.indexOf('/* ---------- DESIGN 24a.')); // the IG5 blocks after it have their own tests (ig5.test.js)
  assert.match(block, /@media \(prefers-reduced-motion: no-preference\) \{/);
  // outside that media block the sheet has no transition or animation anywhere in the file
  const stripped = css.replace(block.slice(block.indexOf('@media (prefers-reduced-motion: no-preference)')), '');
  assert.ok(!/\.sheet\b[^{}]*\{[^}]*(transition: (?!none)|animation)/.test(stripped), 'no sheet transition outside the gated block');
  assert.ok(!/::details-content/.test(stripped));
  for (const line of block.slice(block.indexOf('@media')).split('\n').filter((l) => /\.sheet|details-content/.test(l))) assert.match(line, /html\[data-motion='on'\]/);
  assert.ok(!/animation/.test(block.slice(block.indexOf('@media'))), 'only transitions of opacity and scale');
});
