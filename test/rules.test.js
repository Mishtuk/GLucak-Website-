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
    for (const m of h.matchAll(/<(a|button)\b[^>]*class="[^"]*\bbtn-solid\b[^"]*"[^>]*>(?:<svg[^>]*>.*?<\/svg>)?([^<]*)</g)) assert.match(m[2].trim(), /^(Listen|Pre-save|Tickets|Buy)$/, `${p}: btn-solid "${m[2]}"`);
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

test('28e: the nav, Listen and the lockups switch at 700px, the Menu fallback is 48rem (30b); nothing is left at 900 for the nav', () => {
  assert.match(css, /@media \(min-width: 700px\) \{\s*\.nav-desktop \{ display: flex; \}\s*\.header-listen \{ display: inline-flex; \}\s*\.nav-mobile \{ display: none; \}/);
  assert.match(css, /@container \(width < 48rem\)/);
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
  assert.ok(dist('about/index.html').includes('<p>Reforged and ready for the next era'));
});

test('C18: the Home records band has the Videos page records, and no Short leads it', () => {
  const vids = JSON.parse(read('src/data/videos.json'));
  const short = vids.filter((v) => v.kind === 'other').sort((a, b) => b.date.localeCompare(a.date))[0];
  const ids = (h) => [...h.matchAll(/class="rec-link" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/g)].map((m) => m[1]);
  const home = ids(dist('index.html'));
  assert.ok(home.length > 0);
  assert.deepEqual(home, ids(dist('videos/index.html')));
  assert.notEqual(home[0], short.id);
});

test('C19: player fallback and the Shorts line are the content.md strings', () => {
  assert.ok(dist('index.html').includes('<p class="player-note">Player not loading? Play it on Spotify below.</p>'));
  const v = dist('videos/index.html');
  assert.equal((v.match(/>New shorts most weeks on YouTube\.</g) ?? []).length, 1);
  assert.ok(!v.includes('Shorts most weeks:') && !v.includes('>On YouTube<'));
});

test('C19: the shop samples say "once the merch is ready"', () => {
  const rows = JSON.parse(read('src/data/products.json'));
  assert.equal(rows.filter((r) => r.description.endsWith('go here once the merch is ready.')).length, 2);
  assert.ok(rows.every((r) => !/Gabe/.test(r.description)));
});

test('R5: 404 and Shop have no sign-up band (their Join links go to Home); every other page keeps it', () => {
  for (const f of ['404.html', 'shop/index.html']) {
    const h = dist(f);
    assert.ok(!h.includes('class="footer-join"') && !h.includes('id="signup"'), `${f}: no sign-up band`);
    assert.ok(h.includes('<a href="/#join"') && !h.includes('<a href="#join"'), `${f}: Join goes to Home`);
  }
  for (const f of ['music/index.html', 'shows/index.html', 'about/index.html', 'videos/index.html']) assert.ok(dist(f).includes('class="footer-join"'), `${f}: keeps the band`);
  assert.ok(dist('404.html').includes('class="btn btn-solid" href="/music/"'), '404 ends on Listen');
});

test('C19: the footer credits are one line (content.md 2); the full list is on About once', () => {
  const line = '<p class="credits">Credits: Alexander Kealey, Joseph Lucak, GLucak, Dave Bahm</p>';
  for (const f of ['index.html', 'music/index.html', 'shows/index.html', 'videos/index.html']) assert.equal(dist(f).split(line).length - 1, 1, f);
  assert.ok(!dist('about/index.html').includes('class="credits"'), 'DESIGN 29d: About prints the list once, no footer line');
  const list = dist('about/index.html').match(/class="credit-list">([^]*?)<\/ul>/)[1];
  for (const c of ['Alexander Kealey', 'Joseph Lucak', 'GLucak on YouTube', 'Vladd', 'Gabriel Lucak', 'Emily Mae', 'Dave Bahm', 'Montgomery County']) assert.ok(list.includes(c), c);
});

// ---------- Overhaul OV6 (DESIGN 29g): one photo language ----------
import sharp from 'sharp';
const ERA = JSON.parse(read('src/eras/identity.json')).colors;
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const FRAMES = { 'a-print-phone-800': 'kealey', 'b-print-': 'kealey', 'v2/garage-toner-': 'garage', 'v2/stage-lines-': 'ce2', 'v2/belt-print-': 'ce4',
  'poster-print-': 'ce3', 'cd-live-': 'cdlive', 'cd-studio-': 'studio', 'photo-mccc-': 'mccc', 'photo-crooked-eye-': 'ce1',
  'stills/eys-arm-': 'eys2', 'stills/yna-floor-': 'yna1', 'stills/yna-mic-': 'yna2', 'stills/rl-room-': 'rl1', 'stills/ddjf-garage-': 'ddjf1',
  'sleeves/': 'sleeve' }; // the About album's video stills (owner 2026-11-18)
const NOT_PHOTO = /^(covers|videos|og|mark-|shop|uploads|placeholder-cover|favicon|apple-touch|g-|hero-wall)/; // 29b: covers, video thumbs, logos, shop samples
const frameOf = (f) => Object.entries(FRAMES).find(([k]) => f.startsWith(k))?.[1];
const fixture = (d, v) => ({ date: d, type: 'show', venue: v, city: 'X' });
const shows2 = showsHtml([fixture('2030-01-01', 'A'), fixture('2030-01-02', 'B')], new Date('2029-12-01T12:00:00Z'));
const DIST = join(ROOT, 'dist');
const pages29 = Object.fromEntries(walk(DIST).filter((p) => !p.includes(join('dist', 'edit'))).map((p) => [p.slice(DIST.length + 1).replace(/\\/g, '/'), readFileSync(p, 'utf8')]));
pages29['shows/index.html'] += shows2; // the fixture's poster art stands in for the injected shows
const mediaRefs = (h) => [...h.matchAll(/(?:src|href|srcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((x) => x.trim().split(/\s+/)[0]))
  .filter((u) => u.startsWith('/media/')).map((u) => u.slice(7)).filter((f) => !NOT_PHOTO.test(f) && /\.(webp|avif)$/.test(f));
const used = new Map(); // frame -> Set of pages
const files29 = new Set();
for (const [p, h] of Object.entries(pages29)) for (const f of mediaRefs(h)) {
  const fr = frameOf(f); assert.ok(fr, `${p}: unknown photo ${f}`); files29.add(f);
  used.set(fr, (used.get(fr) ?? new Set()).add(p));
}

test('29g-1: every photo is a named frame; each frame is on one page only; the fixture prints poster-art once', () => {
  for (const [fr, set] of used) {
    if (fr === 'sleeve') { assert.deepEqual([...set].sort(), ['index.html', 'shows/index.html', 'videos/index.html']); continue; } // owner 2026-11-18: records on Home, Shows and Videos
    assert.equal(set.size, 1, `${fr} is on ${[...set].join(', ')}`);
  }
  assert.equal(shows2.split('poster-art').length - 1, 1, 'two full shows: art on the first only');
  assert.ok(used.size >= 9, `frames in use: ${[...used.keys()].join(', ')}`);
});

const magenta = async (file, flat) => {
  const { data } = await sharp(join(ROOT, 'public/media', file)).flatten({ background: flat }).resize(300, null, { withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255], mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
    if (!d || d / mx <= 0.4 || mx <= 0.35) continue;
    const h = 60 * (mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4);
    if (h >= 285 && h <= 330) n++;
  }
  return n / (data.length / 3);
};

test('29g-2: Print files hold two colours (99% within RGB 40 of bg or text); magenta is in no photo (hue 285-330, under 1%)', async () => {
  const [bg, tx] = [rgb(ERA.bg), rgb(ERA.text)], near = (px, c) => Math.hypot(px[0] - c[0], px[1] - c[1], px[2] - c[2]) <= 40;
  for (const f of files29) {
    if (/^(a-print-|b-print-|v2\/belt-print-|poster-print-|v2\/stage-lines-|v2\/garage-toner-)/.test(f)) {
      const { data } = await sharp(join(ROOT, 'public/media', f)).flatten({ background: { r: tx[0], g: tx[1], b: tx[2] } }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let ok = 0; for (let i = 0; i < data.length; i += 3) { const px = [data[i], data[i + 1], data[i + 2]]; if (near(px, bg) || near(px, tx)) ok++; }
      assert.ok(ok / (data.length / 3) >= 0.99, `${f}: ${(100 * ok / (data.length / 3)).toFixed(1)}% in the two inks`);
    }
    const m = await magenta(f, { r: tx[0], g: tx[1], b: tx[2] }); assert.ok(m < 0.01, `${f}: ${(100 * m).toFixed(1)}% magenta`);
  }
});

test('29g-3: Clean files are never upscaled; the new files carry no exif, icc or xmp', async () => {
  const wide = async (f) => (await sharp(join(ROOT, 'public/media', f)).metadata()).width;
  assert.ok(await wide('photo-mccc-478.webp') <= 478 && await wide('photo-crooked-eye-634.webp') <= 634 && await wide('cd-live-2400.webp') <= 4000 && await wide('poster-print-600.webp') <= 634);
  for (const f of ['a-print-phone-800', 'b-print-600', 'b-print-1000', 'v2/belt-print-320', 'v2/belt-print-634', 'poster-print-600', 'cd-live-2400', 'photo-mccc-478', 'photo-crooked-eye-634']) {
    const m = await sharp(join(ROOT, 'public/media', `${f}.webp`)).metadata();
    assert.ok(!m.exif && !m.icc && !m.xmp, `${f} carries metadata`);
  }
});

test('29g-4: About has the header photo, 3 plain-link gallery photos, the credits once and no script of its own', () => {
  const h = dist('about/index.html');
  const credits = [...read('src/components/content.js').match(/export const PHOTO_CREDITS = \{([^]*?)\n\};/)[1].matchAll(/(\w+): '([^']*)'/g)].map((m) => m[2]);
  assert.ok(credits.length >= 7);
  assert.ok(!h.includes('Find GLucak'));
  assert.equal(h.split('class="credit-list"').length - 1, 1);
  const list = h.match(/class="credit-list">([^]*?)<\/ul>/)[1];
  for (const v of credits) assert.equal(list.split(`<li>${v.replace(/\.$/, '')}</li>`).length - 1, 1, v);
  assert.ok(!h.includes('class="credits"'));
  const img = h.match(/<img[^>]*class="[^"]*push-photo[^"]*"[^>]*>/)[0];
  assert.match(img, /alt="[^"]+"/); assert.ok(img.includes('fetchpriority="high"') && !img.includes('loading="lazy"') && img.includes('2400w'));
  // owner 2026-11-18: the gallery is a photo album reel. Every page: one photo with alt and a caption, a real file.
  const pages = h.match(/<ol class="hs-track">([^]*?)<\/ol>/)[1].split('</li>').filter((x) => x.includes('hs-item'));
  assert.equal(pages.length, 8);
  for (const li of pages) {
    const src = li.match(/<img src="(\/media\/[^"]+\.webp)"[^>]*alt="[^"]+"/)?.[1];
    assert.ok(src && /<figcaption>.*<\/span> [A-Z][^<]+<\/figcaption>/.test(li), `one img with alt and a caption: ${li}`); assert.ok(statSync(join(ROOT, 'public', src)).isFile());
  }
  const scripts = [...h.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]).filter((s) => !s.includes('application/ld+json'));
  assert.ok(scripts.every((s) => /src="\/js\/(boot|app)\.js"/.test(s)), `no script beyond Base: ${scripts}`);
  for (const f of readdirSync(join(ROOT, 'public/js'))) assert.ok(!/gallery/.test(read(join('public/js', f))), `${f}: nothing touches .gallery`);
});

test('29g-5: the 29 CSS block moves nothing (no animation, transition, transform, filter, :hover, --accent) and .push-head::after is gone', () => {
  const from29 = css.lastIndexOf('/*', css.indexOf('DESIGN 29. One photo language'));
  const block = css.slice(from29, css.indexOf('30. Poster wall', from29) > 0 ? css.lastIndexOf('/*', css.indexOf('30. Poster wall', from29)) : undefined).replace(/\/\*[^]*?\*\//g, '');
  assert.ok(block.length > 300);
  for (const w of ['animation', 'transition', 'transform', 'filter', ':hover', '--accent']) assert.ok(!block.includes(w), w);
  assert.ok(!/\.push-head::after/.test(css));
});

test('29g-6: the old photos are off every page and the fixture', () => {
  for (const [p, h] of Object.entries(pages29)) for (const w of ['cd-live-portrait', 'v2-jump', 'belt-plates', 'b-riso', 'a-night', 'c-poster', 'venues-photo']) assert.ok(!h.includes(w), `${p}: ${w}`);
  assert.ok(!pages29['shows/index.html'].includes('cd-live'));
});
