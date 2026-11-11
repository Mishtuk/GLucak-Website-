// Round V1 (DESIGN 26, D95): the Videos page, the Play button, the nav link, the poster crop, and the three IG6 eval fixes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { groupVideos } from '../src/components/videos.js';

const ROOT = join(import.meta.dirname, '..');
const page = (p) => readFileSync(join(ROOT, 'dist', p), 'utf8');
const src = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const FLASHING = new RegExp(src('src/components/content.js').match(/export const FLASHING = \/(.+)\/i;/)[1], 'i');
const vids = page('videos/index.html');
const ids = [...vids.matchAll(/data-yt="([\w-]{11})"/g)].map((m) => m[1]);
const js = src('public/js/app.js');
const PAGES = ['index.html', 'music/index.html', 'shows/index.html', 'about/index.html', 'videos/index.html', 'privacy/index.html', '404.html'];

test('26g-1: /videos/ has no player, no autoplay and no YouTube image before a press; autoplay=1 is set only when a card is pressed', () => {
  assert.ok(!/<iframe/i.test(vids) && !/autoplay/i.test(vids) && !vids.includes('youtube.com/embed') && !vids.includes('i.ytimg.com'));
  assert.equal(js.split('autoplay=1').length - 1, 1, 'autoplay=1 appears once');
  assert.ok(js.indexOf('autoplay=1') > js.indexOf('function play('), 'inside play()');
  assert.match(js, /addEventListener\('click', \(\) => play\(b\)\)/, 'play() runs only from the click handler');
  assert.equal(js.split('play(').length - 1, 2, 'play( is defined once and called once');
  for (const f of ['index.html', 'shows/index.html']) assert.ok(!/<iframe[^>]*youtube/i.test(page(f)), `${f}: no YouTube iframe`);
});

test('26g-2: the player is youtube-nocookie everywhere', () => {
  assert.ok(js.includes('https://www.youtube-nocookie.com/embed/'));
  assert.ok(!js.includes('www.youtube.com/embed'));
  for (const f of PAGES) assert.ok(!page(f).includes('www.youtube.com/embed'), f);
});

test('26g-3: FLASHING videos come out of every group, by title or by name; the Earned Your Stripes music video stays', () => {
  const rows = [
    { id: 'aaaaaaaaaaa', title: 'Running The Gauntlet (Official Lyric Video)', kind: 'music-video', date: '2026-01-01' },
    { id: 'bbbbbbbbbbb', title: 'Earned Your Stripes (Official Visualizer)', kind: 'lyric-video' },
    { id: 'ccccccccccc', title: 'Something clean', name: 'Earned Your Stripes (Official Visualizer)', kind: 'live', lead: true },
    { id: 'ddddddddddd', title: 'Earned Your Stripes (Official Music Video)', name: 'Earned Your Stripes', kind: 'music-video' },
    { id: 'short', title: 'bad id', kind: 'music-video' },
    null,
  ];
  const g = groupVideos(rows, FLASHING);
  const all = [g.lead, ...g.live, ...g.music].filter(Boolean).map((v) => v.id);
  assert.deepEqual(all, ['ddddddddddd'].filter((id) => g.music.some((v) => v.id === id)));
  assert.equal(g.lead, null);
  assert.deepEqual(groupVideos(undefined, FLASHING), { lead: null, live: [], music: [] });
  for (const id of ['aaaaaaaaaaa', 'bbbbbbbbbbb']) assert.ok(!vids.includes(id));
  assert.ok(vids.includes('6SpsSt8rPzI'), 'the music video is on the page');
  assert.ok(!/running the gauntlet|visuali[sz]er/i.test(vids));
});

test('26c: lead is the flagged live row (else the newest live); music videos newest first, undated and lyric videos last', () => {
  const g = groupVideos([
    { id: 'LLLLLLLLLL1', kind: 'live', date: '2026-02-01', title: 'newer live' },
    { id: 'LLLLLLLLLL2', kind: 'live', date: null, title: 'lead live', lead: true },
    { id: 'MMMMMMMMMM1', kind: 'music-video', date: '2026-01-01', title: 'old' },
    { id: 'MMMMMMMMMM2', kind: 'music-video', date: '2026-03-01', title: 'new' },
    { id: 'MMMMMMMMMM3', kind: 'music-video', date: null, title: 'undated' },
    { id: 'YYYYYYYYYY1', kind: 'lyric-video', date: '2026-04-01', title: 'lyric' },
    { id: 'OOOOOOOOOO1', kind: 'other', date: '2026-05-01', title: 'a Short' },
  ], FLASHING);
  assert.equal(g.lead.id, 'LLLLLLLLLL2');
  assert.deepEqual(g.live.map((v) => v.id), ['LLLLLLLLLL1']);
  assert.deepEqual(g.music.map((v) => v.id), ['MMMMMMMMMM2', 'MMMMMMMMMM1', 'MMMMMMMMMM3', 'YYYYYYYYYY1']);
  assert.equal(groupVideos([{ id: 'LLLLLLLLLL1', kind: 'live', title: 'x' }], FLASHING).lead.id, 'LLLLLLLLLL1', 'no flag = the newest live');
});

test('26g-4: order and scope on /videos/; Shorts are not listed, one link goes to the Shorts tab', () => {
  assert.equal(ids[0], 'aZNW63M_C2E');
  assert.equal(ids[1], 'OOGT3GxlQJk');
  assert.ok(ids.indexOf('ZGlnFchIVVY') < ids.indexOf('K-OZiNvQB14'));
  assert.equal(ids.at(-1), 'LBQ4fqLVHSI');
  const rows = JSON.parse(src('src/data/videos.json'));
  const kinds = Object.fromEntries(rows.map((v) => [v.id, v.kind]));
  for (const id of ids) assert.ok(kinds[id] && kinds[id] !== 'other', `${id} is not a Short`);
  assert.equal(new Set(ids).size, ids.length, 'no card twice');
  assert.match(vids, /href="https:\/\/www\.youtube\.com\/channel\/UCha7GtkOI9A0dzbTG3igbLg\/shorts"/);
});

test("names: a 'with' line only where the name is in the video's own title", () => {
  const rows = JSON.parse(src('src/data/videos.json'));
  for (const v of rows.filter((r) => r.with)) {
    const who = v.with.replace(/^(with|feat\.?)\s+/i, '').toLowerCase();
    assert.ok(v.title.toLowerCase().includes(who), `${v.id}: "${v.with}" is not in "${v.title}"`);
  }
  assert.ok(!rows.find((r) => r.id === 'ZGlnFchIVVY').with, "You're Not Alone: Emily Mae is not in its title, so no line");
});

test('26g-5: credits on /videos/: the Vladd still, Joseph Lucak, GLucak on YouTube; the Riverside poster maps to the YouTube credit', () => {
  const credits = vids.match(/class="credits">([^<]*)</)[1];
  for (const c of ['Video still: Vladd (Vladdtime).', 'Video still: Joseph Lucak.', 'Video stills: GLucak on YouTube.']) assert.ok(credits.includes(c), c);
  const content = src('src/components/content.js');
  assert.ok(content.includes('videos\\/OOGT3GxlQJk-/, PHOTO_CREDITS.yt'));
  assert.ok(content.includes('videos\\/aZNW63M_C2E-/, PHOTO_CREDITS.vladd'));
});

test('26g-6: every card has a name, every poster is alt="" with size and a file, only the lead is eager, one h1; the button is real and labelled', () => {
  const cards = [...vids.matchAll(/<(?:li|div) class="v2-vid[^"]*"[\s\S]*?<\/(?:li|div)>/g)].map((m) => m[0]);
  assert.equal(cards.length, ids.length);
  cards.forEach((c, i) => {
    assert.match(c, /<span class="v2-vtitle">[^<]+<\/span>/, 'name');
    const img = c.match(/<img[^>]*>/)?.[0];
    assert.ok(img, 'poster');
    assert.ok(img.includes('alt=""') && img.includes('width="1280"') && img.includes('height="720"'));
    const file = img.match(/src="([^"]+)"/)[1];
    assert.ok(existsSync(join(ROOT, 'public', file)), file);
    assert.equal(/loading="eager"/.test(img), i === 0, 'only the lead is eager');
  });
  assert.equal(vids.split('<h1').length - 1, 1);
  assert.match(js, /b\.type = 'button'/);
  assert.match(js, /setAttribute\('aria-label', `Play /);
  assert.match(js, /f\.title = `\$\{b\.dataset\.title \|\| 'Video'\}: video`/);
  assert.match(js, /f\.focus\(\)/);
  assert.match(js, /for \(const \[f, old\] of buttons\)/, 'one player at a time');
});

test("26g-7: Videos is in every page's nav and menu; the phone bar Watch goes to /videos/; Home and Shows headings link to it; sitemap lists it", () => {
  for (const f of PAGES) {
    const h = page(f);
    const nav = h.match(/<nav class="nav-desktop"[\s\S]*?<\/nav>/)[0];
    const sheet = h.match(/<nav class="sheet"[\s\S]*?<\/nav>/)[0];
    for (const n of [nav, sheet]) assert.match(n, /<a href="\/videos\/"[^>]*>Videos<\/a>/, f);
    assert.ok(nav.indexOf('>Shows<') < nav.indexOf('>Videos<') && nav.indexOf('>Videos<') < nav.indexOf('>About<'), `${f}: Music, Shows, Videos, About`);
    const bar = h.match(/<nav class="phone-bar"[\s\S]*?<\/nav>/)[0];
    assert.match(bar, /<a href="\/videos\/"[^>]*><svg[^>]*>[\s\S]*?<\/svg><span>Watch<\/span><\/a>/, `${f}: bar Watch`);
    assert.ok(bar.includes('<!--gl:watch--><a href="/videos/"') && bar.includes('</a><!--/gl:watch-->'), `${f}: the shop swap markers still wrap Watch`);
  }
  assert.match(vids.match(/<nav class="phone-bar"[\s\S]*?<\/nav>/)[0], /<a href="\/videos\/" aria-current="page">/);
  assert.match(vids.match(/<nav class="nav-desktop"[\s\S]*?<\/nav>/)[0], /<a href="\/videos\/" aria-current="page">Videos/);
  assert.match(page('index.html'), /id="shows-video"[^>]*>\s*<h3><a class="h-go" href="\/videos\/">Watch/);
  assert.match(page('shows/index.html'), /id="shows-video"[^>]*>\s*<h2><a class="h-go" href="\/videos\/">Watch/);
  assert.ok(readFileSync(join(ROOT, 'dist/sitemap.xml'), 'utf8').includes('/videos/'));
});

test('26g-8: the Riverside poster files exist, are the privacy crop (800x450 from a 16:9 frame), and carry no metadata', async () => {
  for (const [f, w] of [['640', 640], ['1280', 800]]) {
    const meta = await sharp(join(ROOT, `public/media/videos/OOGT3GxlQJk-${f}.webp`)).metadata();
    assert.equal(meta.width, w);
    assert.equal(meta.height, Math.round(w * 9 / 16));
    assert.ok(!meta.exif && !meta.xmp && !meta.icc, `${f}: no EXIF / XMP / ICC`);
  }
  const row = JSON.parse(src('src/data/videos.json')).find((v) => v.id === 'OOGT3GxlQJk');
  assert.deepEqual(row.crop, [0, 0, 0.625, 0.625]);
  assert.match(src('tools/fetch-video-thumbs.mjs'), /crop needs a 16:9 source/);
});

test('26e: the CSS is static, the nav breakpoint is 44rem, the Watch heading link and the scrolling sheet are in', () => {
  const css = src('src/styles/global.css');
  const block = css.slice(css.indexOf('/* ---------- DESIGN 26. Videos page')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(block.length > 1500);
  assert.ok(!/animation|transition|@keyframes|--accent/.test(block));
  assert.match(css, /@container \(width < 44rem\) \{/);
  assert.match(css, /\.go::after, \.h-go::after \{/);
  assert.match(css, /--w-watch: 2\.5775;/);
  assert.match(block, /\.sheet \{ max-height: calc\(100dvh - var\(--header-h\) - var\(--bar-h, 0px\)\); overflow-y: auto;/);
});

test('og: videos share image exists and is wired; the apple-touch icon sits on the IDENTITY ground', async () => {
  assert.ok(existsSync(join(ROOT, 'public/media/og/videos.png')));
  assert.ok(vids.includes('/media/og/videos.png'));
  assert.match(src('tools/og.mjs'), /videos: \{ word: 'VIDEOS'/);
  assert.match(src('prototype/tools/resize.mjs'), /apple-touch-icon-180\.png'.*bg: '#05024c'/);
  const { data } = await sharp(join(ROOT, 'public/media/apple-touch-icon-180.png')).raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([...data.subarray(0, 3)], [0x05, 0x02, 0x4c], 'the corner pixel is #05024c');
});

test('IG6 eval 2: Music shows the IDENTITY block before the Releases grid', () => {
  const m = page('music/index.html');
  const idn = m.indexOf('class="idn"');
  assert.ok(idn > 0 && idn < m.indexOf('id="h-releases"') && idn < m.indexOf('class="crate"'));
  assert.equal((m.match(/<li class="track/g) ?? []).length, 12, 'the 12 tracks');
  assert.equal((m.match(/<h1/g) ?? []).length, 1);
  assert.ok(!/<h3 class="tracks-h"/.test(m), 'no skipped heading level');
});

test("IG6 eval 3: Home's jump slot shows his face (live portrait), as graded, no metadata, old jump files gone", async () => {
  const h = page('index.html');
  assert.match(h, /class="v2-photo v2-wide-only v2-jump" src="\/media\/cd-live-portrait-352\.webp"[^>]*alt="GLucak singing live in purple light"/);
  assert.ok(!h.includes('cd-jump-'));
  for (const f of ['352', '704']) {
    const meta = await sharp(join(ROOT, `public/media/cd-live-portrait-${f}.webp`)).metadata();
    assert.equal(meta.width, Number(f));
    assert.equal(meta.height, Number(f) * 1.25);
    assert.ok(!meta.exif && !meta.xmp && !meta.icc);
  }
  assert.ok(!existsSync(join(ROOT, 'public/media/cd-jump-352.webp')));
  assert.ok(h.includes('Photos: from the IDENTITY CD.'), 'the CD credit still covers it');
});
