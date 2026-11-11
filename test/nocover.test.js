// DESIGN 22: a release with cover:null is the sleeve card (NoCover.astro), on Music and on Home, never the grey placeholder SVG.
// Home shows only the newest released row, and "released" is decided at build, so each case builds a scratch copy of the site
// (src + public, node_modules linked) with a fixture releases.json and the clock faked to Nov 13, 2026 by a preload script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');
const LONG = 'Supernatural Breakthrough (Extended Mix)'; // 40 characters, two 12-letter words
const SHORT = 'Hi'; // 2 characters

function build(rows) {
  const dir = mkdtempSync(join(tmpdir(), 'gl-nc-'));
  try {
    for (const d of ['src', 'public']) cpSync(join(ROOT, d), join(dir, d), { recursive: true });
    for (const f of ['astro.config.mjs', 'package.json']) cpSync(join(ROOT, f), join(dir, f));
    symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'junction');
    writeFileSync(join(dir, 'src/data/releases.json'), JSON.stringify(rows));
    const fake = join(dir, 'fakedate.mjs');
    writeFileSync(fake, `const R = Date, off = R.parse('2026-11-13T17:00:00Z') - R.now();
globalThis.Date = class extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } };`);
    const run = () => spawnSync(process.execPath, [join(ROOT, 'node_modules/astro/bin/astro.mjs'), 'build'], {
      cwd: dir, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: `--import ${pathToFileURL(fake).href}` },
    });
    let r = run();
    if (r.status !== 0) r = run(); // a Windows file lock (antivirus) can fail a cold build once
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const read = (f) => readFileSync(join(dir, 'dist', f), 'utf8');
    return { home: read('index.html'), music: read('music/index.html') };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const row = (title, date, cover = null, type = 'single') => ({ title, date, type, link: 'https://example.com/' + date, cover });
const real = row('Duck, Dodge, Jump, Fight', '2026-09-04', '/media/covers/duck-dodge-jump-fight.webp');
const rel = (h) => h.match(/<article class="v2-rel">[\s\S]*?<\/article>/)[0];
const tiles = (h) => [...h.matchAll(/<li class="tile"[^>]*>[\s\S]*?<\/li>/g)].map((m) => m[0]);

test('22: a cover:null latest release is the sleeve card on Home (role=img, no-art label, no chip, no placeholder SVG)', () => {
  const { home } = build([row(SHORT, '2026-11-13'), real]);
  const card = rel(home);
  assert.match(card, /<span class="nocover v2-cover" style="--nc-fs: [\d.]+cqi" role="img" aria-label="Hi: no cover art yet">/);
  assert.match(card, /<span class="nocover-title" aria-hidden="true">Hi<\/span>/);
  assert.match(card, /<span class="nocover-type" aria-hidden="true"><span>Single<\/span><\/span>/);
  assert.ok(!card.includes('<img'), 'no <img> for a null cover');
  assert.ok(!card.includes('placeholder-cover.svg') && !home.includes('Placeholder cover<'), 'no placeholder SVG, no chip');
  assert.ok(!card.includes('Placeholder for'), 'old alt gone');
  assert.match(card, /Listen to Hi/, 'Listen button still names the release');
});

test('22: a 40-character title with two 12-letter words renders on Home and Music', () => {
  const { home, music } = build([row(LONG, '2026-11-13'), real]);
  assert.ok(rel(home).includes(`role="img" aria-label="${LONG}: no cover art yet"`));
  assert.ok(rel(home).includes(`<span class="nocover-title" aria-hidden="true">${LONG}</span>`));
  const t = tiles(music).find((x) => x.includes(LONG));
  assert.match(t, /<span class="nocover tile-art" style="--nc-fs: [\d.]+cqi" aria-hidden="true">/);
  assert.ok(t.includes(`<span class="nocover-title" aria-hidden="true">${LONG}</span>`));
  const fs = (h) => Number(h.match(/--nc-fs: ([\d.]+)cqi/)[1]);
  assert.ok(fs(rel(home)) > 5 && fs(rel(home)) < 20, 'long title is set small, short ones up to 40');
});

test('22: Music tiles for cover:null releases are aria-hidden like real covers, carry the type word and the coming date, no <img>', () => {
  const { music } = build([row(SHORT, '2026-11-13'), row(LONG, '2027-01-15'), real]);
  const ts = tiles(music);
  const short = ts.find((x) => x.includes('tile-title">Hi<'));
  const long = ts.find((x) => x.includes(LONG));
  for (const t of [short, long]) {
    assert.ok(t, 'tile present');
    assert.ok(!t.includes('<img') && !t.includes('role="img"') && !t.includes('placeholder-cover'), 'decorative card, no image');
    assert.match(t, /<span class="nocover tile-art" style="--nc-fs: [\d.]+cqi" aria-hidden="true">/);
  }
  assert.match(short, /<span class="nocover-type" aria-hidden="true"><span>Single<\/span><\/span>/, 'released: type word only');
  assert.match(long, /<span class="nocover-type" aria-hidden="true"><span>Single<\/span><span>Jan 15<\/span><\/span>/, 'coming: type word and date');
  assert.match(ts.find((x) => x.includes('duck-dodge')), /<img class="tile-art" src="\/media\/covers\/duck-dodge-jump-fight\.webp" alt=""/, 'real covers unchanged');
  assert.ok(!music.includes('tile-art-none') && !music.includes('tile-when'));
});

test('22: the card has CSS, the old hatch slot is gone, and a release with a cover still gets its image on Home', () => {
  const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');
  assert.match(css, /\.nocover \{[^}]*container-type: inline-size/);
  assert.ok(!/\.tile-art-none|\.tile-when/.test(css));
  const { home } = build([row('Go On', '2026-11-13', real.cover), row(SHORT, '2026-10-01')]);
  assert.match(rel(home), /<img class="v2-cover" src="\/media\/covers\/duck-dodge-jump-fight\.webp" alt="Go On cover art"/);
  assert.ok(!rel(home).includes('nocover'));
});
