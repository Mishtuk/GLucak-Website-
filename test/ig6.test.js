// Round IG6 (DESIGN 25, D93): the IDENTITY era reaches the page, Gabe's photos and the CD block are in, the copy is the approved copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..');
const page = (p) => readFileSync(join(ROOT, 'dist', p), 'utf8');
const src = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const era = JSON.parse(src('src/eras/identity.json'));

test('25a: the era style wins over global.css :root (html:root is more specific), on every page and /edit/', () => {
  assert.ok(src('src/layouts/Base.astro').includes('`html:root{${eraCss}}`') && src('src/pages/edit/index.astro').includes('`html:root{${eraCss}}`'));
  for (const f of ['index.html', 'music/index.html', 'shows/index.html', 'about/index.html', '404.html']) {
    const h = page(f);
    assert.ok(h.includes(`html:root{--bg:${era.colors.bg};`), `${f}: era declared as html:root`);
    assert.ok(h.includes(`--accent:${era.colors.accent}`) && h.includes(`--text:${era.colors.text}`), `${f}: accent and text`);
    assert.ok(h.includes(`<meta name="theme-color" content="${era.colors.bg}"`), `${f}: theme-color follows the era`);
    // A bare :root (0,1,0) can never beat html:root (0,1,1), whichever comes later in the page.
    assert.ok(!/<style>:root\{--bg:/.test(h), `${f}: no bare :root era style`);
  }
});

test('25a: the site era is IDENTITY: no Placeholder chip, no placeholder colours', () => {
  assert.match(src('src/components/content.js'), /import era from '\.\.\/eras\/identity\.json'/);
  for (const f of ['index.html', 'music/index.html', 'about/index.html']) {
    const h = page(f);
    assert.ok(!h.includes('Placeholder colors') && !h.includes('class="ph-chip footer-chip"'), f);
    assert.ok(!h.includes('html:root{--bg:#111'), f);
  }
});

test('25e: Music has the CD block: cover, 12 tracks in CD-back order, Scenic Route the one linked row, heading and credit', () => {
  const m = page('music/index.html');
  assert.ok(m.includes('covers/identity'), 'cover');
  assert.equal((m.match(/<li class="track[ "]/g) ?? []).length, 12);
  assert.equal((m.match(/class="track track-fav"/g) ?? []).length, 1);
  const names = [...m.matchAll(/<li class="track[^"]*"><span class="track-n">(\d+)<\/span>(?:<span class="track-title">([^<]*)<\/span>|<a [^>]*>([^<]*)(?:<span class="vh">[^<]*<\/span>)?<\/a>)/g)].map((x) => `${x[1]} ${x[2] ?? x[3]}`);
  assert.deepEqual(names, ['1 IDENTITY', '2 ChurchBoy', '3 Single Kids', '4 WYLD LOVE', '5 Life Blood', '6 Mayday Mayday', '7 Light', '8 Mere Reflection', '9 Another Dimension', '10 Trenches', '11 Finish Strong', '12 Scenic Route']);
  assert.match(m, /<a class="go" href="https:\/\/wingsmusic\.lnk\.to\/ScenicRoute"[^>]*>Scenic Route<span class="vh">[^<]*<\/span><\/a><span class="track-note">Out Jan 15<\/span>/);
  assert.equal((m.match(/<ol class="tracks"[^>]*>[\s\S]*?<\/ol>/)[0].match(/<a /g) ?? []).length, 1, 'only Scenic Route is a link');
  assert.ok(m.includes('IDENTITY tracklist') && m.includes('All songs written, recorded, produced, mixed and mastered by Gabriel Lucak</p>'));
  assert.ok(m.includes('IDENTITY cover: GLucak. Logo: Dave Bahm.'), 'credit');
  assert.match(m, /alt="IDENTITY cover art[^"]+"/);
  assert.ok(src('src/data/releases.json').includes('"cover":"/media/covers/identity.webp"'));
});

test('25e: the CD block CSS never uses the accent (2 + 1 rule) and adds no motion', () => {
  const css = src('src/styles/global.css');
  const block = css.slice(css.indexOf('/* 25e: Music: IDENTITY as the CD'), css.indexOf('/* IG6 copy:'));
  assert.ok(block.length > 800);
  assert.ok(!/--accent/.test(block) && !/animation|transition|(?<!text-)transform/.test(block));
});

test("25b-d: Gabe's photos and the re-printed images are wired; every new file has no EXIF", async () => {
  const home = page('index.html');
  assert.match(home, /class="v2-photo v2-wide-only v2-jump" src="\/media\/cd-jump-352\.webp"[^>]*alt="GLucak mid-jump under a park shelter"/);
  assert.ok(!home.includes('Photo slot: crowd shot'), 'the empty slot is gone');
  assert.match(page('about/index.html'), /class="about-photo" src="\/media\/cd-studio-480\.webp"[^>]*alt="GLucak in his home studio/);
  const shows = page('shows/index.html');
  assert.match(shows, /class="venues-photo" src="\/media\/cd-live-640\.webp"[^>]*alt="GLucak singing live in purple light"/);
  assert.ok(!/class="[^"]*(has-ground|ground-wall)/.test(shows), 'Shows drops the Kealey wall strip');
  assert.ok(!page('about/index.html').includes('<img class="venues-photo"'), 'About keeps the plain booking block');
  assert.ok(home.includes('b-riso-identity-600.webp') && !home.includes('/media/b-riso-600.webp'));
  const files = [...readdirSync(join(ROOT, 'public/media')).filter((f) => /^cd-.*\.webp$/.test(f)).map((f) => `public/media/${f}`),
    ...readdirSync(join(ROOT, 'public/media/covers')).filter((f) => /^identity.*\.webp$/.test(f)).map((f) => `public/media/covers/${f}`)];
  assert.ok(files.length >= 9, `found ${files.length} files`);
  for (const f of files) {
    const meta = await sharp(join(ROOT, f)).metadata();
    assert.ok(!meta.exif && !meta.icc && !meta.xmp, `${f} carries metadata`);
  }
});

test('copy ig6: sign-up now wording, About lines, Patreon line, credits heading', () => {
  const home = page('index.html');
  assert.ok(home.includes('Join the list. Scenic Route is coming Jan 15, and the first listen will be yours.'));
  assert.match(home, /data-ok="You(&#39;|')re in\. We(&#39;|')ll tell you the day Scenic Route lands\."/);
  assert.ok(!/free download|check your inbox/i.test(home), 'no promise Kit cannot keep yet');
  assert.ok(src('public/js/app.js').includes('form.dataset.ok'));
  const about = page('about/index.html');
  assert.match(about, /<span class="epi-head">Epilepsy survivor<\/span> <span class="epi-sub">Healed by Christ since 2009<\/span>/);
  assert.ok(about.includes('>Credits</h2>') && !about.includes('Photo credits'));
  for (const h of [home, about]) assert.ok(h.includes('Back my projects and merch. Get early access to songs only the inner circle knows exist.'));
});

test('copy ig6: the remix album is labelled; a coming release with no smart link never says Pre-save', () => {
  const m = page('music/index.html');
  assert.match(m, /<h3 class="tile-title">Fall Down 7, Stand Up 8<\/h3>[\s\S]*?<span class="tile-type">Remix album<\/span>/);
  const tile = (title) => [...m.matchAll(/<li class="tile"[^>]*>[\s\S]*?<\/li>/g)].map((x) => x[0]).find((t) => t.includes(`<h3 class="tile-title">${title}</h3>`));
  const wh = tile('Welcome Home');
  assert.ok(wh.includes('data-state') || m.includes('data-state="coming"'));
  assert.ok(wh.includes('tile-go">Follow on Spotify<') && !wh.includes('Pre-save'), 'Welcome Home links to his Spotify artist page');
  assert.ok(tile('Who I Am').includes('tile-go">Pre-save<') && tile('Scenic Route').includes('tile-go">Pre-save<'), 'smart links keep Pre-save');
});

test('D67 with QUOTES_APPROVED: Home keeps ONE quote (RISE), the live quote is gone; Music carries one lyric quote from his own post', () => {
  assert.match(src('src/components/content.js'), /QUOTES_APPROVED = true/);
  assert.ok(!src('src/pages/index.astro').includes('band="live"'));
  const home = page('index.html');
  assert.equal((home.match(/<figure class="quote/g) ?? []).length, 1);
  assert.ok(home.includes('God will always be with you') && !home.includes('Hope to see you there'));
  const music = page('music/index.html');
  assert.equal((music.match(/<figure class="quote/g) ?? []).length, 1);
  assert.ok(music.includes('WHO I AM should depend on the one who came for me') && music.includes('href="https://www.instagram.com/p/DehP5uyihwM/"'));
});
