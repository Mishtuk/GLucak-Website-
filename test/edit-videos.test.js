// Admin round A3 (DESIGN 31h, 31j; D123, D127): the Videos tab, its check, the live Records block (byte for byte against the build),
// the thumbnail fetch (one fixed host), History's "what changed", Sec-Fetch-Site. Over real HTTP against server.js with a temp DATA_DIR.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { _resetLimits, hashPassword } from '../src/lib/auth.js';
import { checkBackup, makeBackup } from '../src/lib/backup.js';
import { externalize } from '../src/lib/ext.js';
import { describeChange } from '../src/lib/changes.js';
import { FLASHING, ID, checkVideos, displayOrder, fillVideos, layoutFor, nowShowingHtml, parseYouTubeLink, recordsHtml, shownRows, styleFor } from '../src/lib/videos.js';
import { THUMB_HOST, fetchThumb, makeSleeve, thumbUrl } from '../src/lib/sleeve.js';

const root = (f) => fileURLToPath(new URL(`../${f}`, import.meta.url));
const seed = JSON.parse(readFileSync(root('src/data/videos.json'), 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'gl-vid-'));
const data = join(dir, 'data');
const PAGE = '<!doctype html><title>t</title><main>x<!--gl:records-->BUILT<!--/gl:records--><!--gl:vnow-->BUILT NOW<!--/gl:vnow--></main>';
for (const p of ['shows', 'edit', 'videos']) mkdirSync(join(dir, p));
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>e</title>');
writeFileSync(join(dir, 'shows/index.html'), '<!doctype html><title>t</title><ul><!--gl:shows--></ul><!--gl:records-compact-->BUILT<!--/gl:records-compact-->');
writeFileSync(join(dir, 'videos/index.html'), PAGE);
writeFileSync(join(dir, 'index.html'), PAGE.replace('records', 'records-more').replace('/gl:records', '/gl:records-more'));
const shipped = seed.filter((v) => v.kind !== 'other').map((v) => v.id);
mkdirSync(join(dir, 'media/sleeves'), { recursive: true });
mkdirSync(join(dir, 'media/videos'), { recursive: true });
for (const id of shipped) for (const w of [320, 640]) writeFileSync(join(dir, `media/sleeves/${id}-${w}.webp`), 'x'); // the shipped stills are in dist
for (const id of shipped) writeFileSync(join(dir, `media/videos/${id}-640.webp`), 'x');
writeFileSync(join(dir, 'shipped-shows.json'), '[]');
writeFileSync(join(dir, 'shipped-products.json'), '[]');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped-shows.json'), PRODUCTS_FILE: join(dir, 'shipped-products.json'),
  SITE_FILE: root('src/data/site.json'), RELEASES_FILE: root('src/data/releases.json'), SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `gabe:${hashPassword('gabes long password')}` });
delete process.env.DEV_EDITOR;
const { server, hooks } = await import('../server.js');
let base, cookie;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST', redirect: 'manual',
  headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const getJson = async (p) => { const r = await fetch(`${base}${p}`, { headers: { cookie } }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
const vids = async () => (await getJson('/edit/api/videos')).body;
const saveVideos = async (videos, headers = {}) => post('/edit/api/videos', { version: (await vids()).version, videos }, { cookie, ...headers });
const page = async (p) => (await fetch(`${base}${p}`)).text();
const live = () => JSON.parse(readFileSync(join(data, 'videos.json'), 'utf8'));
const ids = (html) => [...html.matchAll(/data-yt="([\w-]{11})"/g)].map((m) => m[1]);
const GOOD = 'abcdefghijk', GOOD2 = 'zyxwvutsrqp';
const SHORTS = seed.filter((v) => v.kind === 'other').length;
const link = (id) => `https://www.youtube.com/watch?v=${id}`;
const row = (o = {}) => ({ link: link(GOOD), title: 'Duck Dodge', kind: 'music-video', noFlash: true, ...o });
const jpeg = await sharp({ create: { width: 480, height: 360, channels: 3, background: '#000' } })
  .composite([{ input: await sharp({ create: { width: 480, height: 270, channels: 3, background: { r: 200, g: 60, b: 40 } } }).jpeg().toBuffer(), top: 45, left: 0 }]).jpeg().toBuffer();
const calls = [];
const okFetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response(jpeg, { status: 200, headers: { 'content-type': 'image/jpeg' } }); };
hooks.fetch = okFetch;

test('sign in', async () => {
  const r = await post('/edit/login', { username: 'gabe', password: 'gabes long password' });
  assert.equal(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];
});

// ---------- the link rule ----------
test('the link parser takes watch, youtu.be and Shorts links and refuses everything else', () => {
  for (const ok of [`https://www.youtube.com/watch?v=${GOOD}`, `https://youtube.com/watch?v=${GOOD}&t=30s`, `https://m.youtube.com/watch?feature=share&v=${GOOD}`, `http://www.youtube.com/watch?v=${GOOD}`,
    `https://youtu.be/${GOOD}`, `https://youtu.be/${GOOD}?si=abc`, `https://www.youtube.com/shorts/${GOOD}`, `  https://youtu.be/${GOOD}  `]) assert.equal(parseYouTubeLink(ok), GOOD, ok);
  assert.equal(parseYouTubeLink('https://youtu.be/-_AZaz09-_x'), '-_AZaz09-_x');
  for (const bad of ['', '   ', null, undefined, 5, {}, 'abcdefghijk', '../', '../../etc/passwd', '<script>alert(1)</script>', 'javascript:alert(1)', 'data:text/html,<script>1</script>',
    'https://evil.example/?v=abcdefghijk', 'http://evil/?v=abcdefghijk', 'https://youtube.com.evil.com/watch?v=abcdefghijk', 'https://www.youtube.com@evil.com/watch?v=abcdefghijk',
    'https://user:pw@www.youtube.com/watch?v=abcdefghijk', 'https://www.youtube.com:8080/watch?v=abcdefghijk', 'ftp://www.youtube.com/watch?v=abcdefghijk',
    'https://www.youtube.com/watch?v=abcdefghijkl', 'https://www.youtube.com/watch?v=abcdefghij', 'https://youtu.be/abcdefghijkl', 'https://youtu.be/<script>',
    'https://www.youtube.com/embed/abcdefghijk', 'https://www.youtube.com/playlist?list=abcdefghijk', 'https://www.youtube.com/watch?v=abcdefghijk/../x',
    'https://www.youtube.com/watch?v=abc\ndefghijk', 'https://youtu.be/abcdefghijk/extra']) assert.equal(parseYouTubeLink(bad), null, JSON.stringify(bad));
});

test('the id regex refuses ../, 12 characters and <script>; the thumbnail URL is built from the id on one fixed host', () => {
  for (const bad of ['../', '..%2f..%2fx', 'abcdefghijkl', 'abcdefghij', '<script>', 'abc def ghi', 'abcdefghij/', '']) assert.ok(!ID.test(bad), bad);
  assert.ok(ID.test('abcdefghijk') && ID.test('-_AZaz09-_x'));
  assert.equal(THUMB_HOST, 'i.ytimg.com');
  assert.equal(thumbUrl(GOOD), `https://i.ytimg.com/vi/${GOOD}/hqdefault.jpg`);
  for (const bad of ['../', 'abcdefghijkl', '<script>', 'a/../b/../cde', '', undefined, null, 5, 'aaaaaaaaaa?']) assert.throws(() => thumbUrl(bad), /bad_id/, String(bad));
});

// ---------- the thumbnail fetch ----------
test('fetchThumb asks the fixed host only, never follows a redirect, and refuses a non-JPEG, a big body, an off-host answer and a slow one', async () => {
  const seen = [];
  const mk = (res) => async (url, init) => { seen.push({ url: String(url), init }); return typeof res === 'function' ? res(init) : res; };
  const buf = await fetchThumb(GOOD, mk(new Response(jpeg, { status: 200 })));
  assert.ok(Buffer.isBuffer(buf) && buf.equals(jpeg));
  assert.equal(seen[0].url, `https://i.ytimg.com/vi/${GOOD}/hqdefault.jpg`);
  assert.equal(seen[0].init.redirect, 'error', 'a redirect is an error, not followed');
  assert.equal(await fetchThumb(GOOD, mk(new Response('<html>nope</html>', { status: 200 }))), null, 'not a JPEG');
  assert.equal(await fetchThumb(GOOD, mk(new Response(jpeg, { status: 404 }))), null);
  assert.equal(await fetchThumb(GOOD, mk(new Response(jpeg, { status: 302, headers: { location: 'https://evil.example/x.jpg' } }))), null);
  assert.equal(await fetchThumb(GOOD, mk(new Response(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(2 * 1024 * 1024)]), { status: 200 }))), null, 'over 2 MB');
  assert.equal(await fetchThumb(GOOD, mk(new Response(jpeg, { status: 200, headers: { 'content-length': String(5 * 1024 * 1024) } }))), null, 'a big declared length');
  const off = new Response(jpeg, { status: 200 });
  Object.defineProperty(off, 'url', { value: 'https://evil.example/x.jpg' });
  assert.equal(await fetchThumb(GOOD, mk(off)), null, 'answered from another host');
  const slow = (url, init) => new Promise((_, no) => init.signal.addEventListener('abort', () => no(new Error('aborted'))));
  const t0 = Date.now();
  assert.equal(await fetchThumb(GOOD, slow, 60), null, 'timeout');
  assert.ok(Date.now() - t0 < 2000);
  assert.equal(await fetchThumb(GOOD, async () => { throw new Error('offline'); }), null);
  assert.equal(await fetchThumb('../x', mk(new Response(jpeg))), null, 'a bad id never reaches the network');
  assert.ok(seen.every((s) => s.url.startsWith('https://i.ytimg.com/vi/') && s.url.endsWith('/hqdefault.jpg')));
});

test('makeSleeve: a grey 320 and 640 square WebP with the letterbox cut off, in each print look', async () => {
  for (const style of ['print', 'toner', 'mono']) {
    const out = await makeSleeve(jpeg, style);
    for (const w of [320, 640]) {
      const m = await sharp(out[w]).metadata();
      assert.deepEqual([m.format, m.width, m.height], ['webp', w, w], style);
      const { channels } = await sharp(out[w]).stats();
      assert.ok(channels.length === 1 || channels.every((c, i, a) => Math.abs(c.mean - a[0].mean) < 1), 'grey');
    }
    const top = await sharp(out[320]).extract({ left: 150, top: 2, width: 20, height: 10 }).stats(); // would be the black bar if it were not cut
    assert.ok(top.channels[0].mean > 10, `${style}: no black bar at the top`);
  }
  await assert.rejects(() => makeSleeve(Buffer.from('not an image'), 'mono'));
});

// ---------- the check ----------
test('checkVideos: a visible row needs noFlash === true, whatever the page sent; hidden rows may leave it off', () => {
  assert.ok(checkVideos([row()]).rows);
  for (const noFlash of [false, undefined, null, 'true', 1, 'yes', [], {}]) {
    const r = checkVideos([row({ noFlash })]);
    assert.ok(r.errors, JSON.stringify(noFlash));
    assert.match(r.errors[0].message, /^Video 1: Tick the box once you’ve watched it\./);
  }
  const { noFlash, ...bare } = row();
  assert.ok(checkVideos([bare]).errors);
  const hidden = checkVideos([row({ noFlash: false, hidden: true })]);
  assert.ok(hidden.rows && hidden.rows[0].hidden === true && hidden.rows[0].noFlash === false);
  assert.ok(checkVideos([row({ hidden: 'true', noFlash: false })]).errors, 'hidden has to be the boolean true');
  assert.ok(checkVideos([row(), row({ link: link(GOOD2), noFlash: false })]).errors.some((e) => e.row === 1 && /^Video 2:/.test(e.message)));
});

test('checkVideos: id, title, kind, flashing titles, duplicates, size', () => {
  assert.match(checkVideos([row({ link: 'https://example.com/x' })]).errors[0].message, /isn’t a YouTube link/);
  assert.match(checkVideos([row({ link: '' })]).errors[0].message, /Add the YouTube link/);
  assert.match(checkVideos([row({ id: '../etc/pass', link: undefined })]).errors[0].message, /isn’t a YouTube link/);
  assert.match(checkVideos([row({ id: 'abcdefghijkl', link: undefined })]).errors[0].message, /isn’t a YouTube link/);
  assert.match(checkVideos([row({ title: '   ' })]).errors[0].message, /Add the title/);
  assert.match(checkVideos([row({ title: 'x'.repeat(121) })]).errors[0].message, /under 120/);
  assert.match(checkVideos([row({ kind: 'other' })]).errors[0].message, /Pick Music video or Live/);
  assert.match(checkVideos([row({ kind: undefined })]).errors[0].message, /Pick Music video or Live/);
  assert.match(checkVideos([row({ title: 'Running The Gauntlet (Lyric Video)' })]).errors[0].message, /can’t go on this site/);
  assert.match(checkVideos([row({ title: 'ok', name: 'Earned Your Stripes Visualizer' })]).errors[0].message, /can’t go on this site/);
  assert.match(checkVideos([row(), row()]).errors[0].message, /already in the list/);
  assert.ok(checkVideos('nope').errors && checkVideos(null).errors);
  assert.ok(checkVideos(Array.from({ length: 81 }, (_, i) => row({ link: link(`aaaaaaaaa${String(i).padStart(2, '0')}`) }))).errors);
  const r = checkVideos([row({ layout: 'z', style: 'pink', first: true }), row({ link: link(GOOD2), first: true })]).rows;
  assert.equal(r[0].layout, layoutFor(GOOD), 'a layout or style outside the lists is replaced by the fixed hash of the id');
  assert.equal(r[0].style, styleFor(GOOD));
  assert.equal(r.filter((v) => v.first).length, 1, 'one row is put first');
  assert.equal(r[0].first, true);
});

test('layout and style for a new video are a fixed hash of its id: stable, from the lists, spread over all four letters', () => {
  assert.equal(layoutFor(GOOD), layoutFor(GOOD));
  const letters = new Set(), looks = new Set();
  for (let i = 0; i < 200; i++) { letters.add(layoutFor(`id${String(i).padStart(9, '0')}`)); looks.add(styleFor(`id${String(i).padStart(9, '0')}`)); }
  assert.deepEqual([...letters].sort(), ['a', 'b', 'c', 'd']);
  assert.deepEqual([...looks].sort(), ['mono', 'print', 'toner']);
});

test('the site shows music (newest first, lyric after), the lead live clip, other live; a put-first row goes above all; hidden and unticked rows never show', () => {
  const rows = checkVideos([
    row({ link: link('aaaaaaaaa01'), title: 'Old music', date: '2026-01-01' }), row({ link: link('aaaaaaaaa02'), title: 'New music', date: '2026-05-01' }),
    row({ link: link('aaaaaaaaa03'), title: 'Lyric', kind: 'lyric-video', date: '2026-09-01' }), row({ link: link('aaaaaaaaa04'), title: 'Live one', kind: 'live', date: '2026-02-01' }),
    row({ link: link('aaaaaaaaa05'), title: 'Hidden', hidden: true, noFlash: false, date: '2026-12-01' }),
  ]).rows;
  assert.deepEqual(shownRows(rows).map((v) => v.title), ['New music', 'Old music', 'Lyric', 'Live one']);
  assert.deepEqual(displayOrder(rows).map((v) => v.title), ['Hidden', 'New music', 'Old music', 'Lyric', 'Live one'], 'the tab lists every row, hidden ones in place');
  const pinned = checkVideos(rows.filter((v) => v.title !== 'Hidden').map((v) => (v.title === 'Live one' ? { ...v, first: true } : v))).rows;
  assert.equal(shownRows(pinned)[0].title, 'Live one');
  assert.deepEqual(shownRows([{ ...rows[0], noFlash: undefined }, { ...rows[1], noFlash: 'true' }, { ...rows[2], noFlash: false }]), [], 'render also needs the strict true');
  assert.deepEqual(shownRows([{ ...rows[0], id: '../../x' }, { ...rows[1], kind: 'other' }, { ...rows[2], title: 'Running the Gauntlet' }]), []);
});

test('FLASHING here is the same pattern as content.js (the build\'s filter)', () => {
  const src = readFileSync(root('src/components/content.js'), 'utf8');
  const m = src.match(/export const FLASHING = (\/.+\/i);/);
  assert.ok(m, 'content.js still declares FLASHING');
  assert.equal(String(FLASHING), m[1]);
});

// ---------- the Records block: today's data, byte for byte ----------
const built = { home: readFileSync(root('dist/index.html'), 'utf8'), videos: readFileSync(root('dist/videos/index.html'), 'utf8'), shows: readFileSync(root('dist/shows/index.html'), 'utf8') };
const has = { sleeve: (id) => ID.test(id) && existsSync(root(`public/media/sleeves/${id}-640.webp`)), wide: (id) => ID.test(id) && existsSync(root(`public/media/videos/${id}-640.webp`)) };
const region = (html, name) => { const m = html.match(new RegExp(`<!--gl:${name}-->([\\s\\S]*?)<!--/gl:${name}-->`)); assert.ok(m, `${name} marker in the build`); return m[1]; };

test('byte for byte: today\'s videos.json renders the build\'s Records block on Home, /videos/ and the /shows/ watch row, and /videos/\'s Now showing', () => {
  const home = region(built.home, 'records-more'), vids = region(built.videos, 'records'), shows = region(built.shows, 'records-compact'), now = region(built.videos, 'vnow');
  assert.ok(home.includes('class="rec rec-a"') && vids.includes('rec-img') && shows.includes('records-static') && now.includes('now-showing'), 'the build has real content to compare');
  assert.equal(externalize(recordsHtml(seed, { more: true }, has.sleeve)), home);
  assert.equal(externalize(recordsHtml(seed, {}, has.sleeve)), vids);
  assert.equal(externalize(recordsHtml(seed, { compact: true }, has.sleeve)), shows);
  assert.equal(externalize(nowShowingHtml(seed, (id) => ({ wide: has.wide(id), sleeve: has.sleeve(id) }))), now);
  for (const [name, html] of Object.entries(built)) assert.equal(externalize(fillVideos(html, seed, has)), html, `${name}: the whole page is unchanged by the live fill`);
});

test('byte for byte: the same through the server (the page is served with the Records block filled from the shipped list)', async () => {
  const body = await page('/videos/'), home = await page('/'), shows = await page('/shows/');
  const recs = (html) => html.match(/<ul class="records[^"]*">[\s\S]*?<\/ul>/)[0];
  assert.equal(recs(body), externalize(region(built.videos, 'records').match(/<ul class="records">[\s\S]*?<\/ul>/)[0]));
  assert.equal(recs(home), externalize(region(built.home, 'records-more').match(/<ul class="records">[\s\S]*?<\/ul>/)[0]));
  assert.equal(recs(shows), externalize(region(built.shows, 'records-compact').match(/<ul class="records records-static">[\s\S]*?<\/ul>/)[0]));
  assert.ok(!body.includes('BUILT') && !home.includes('BUILT') && !shows.includes('BUILT'));
});

test('put first changes only the order: each video keeps its own layout letter, the numbers follow the new order', () => {
  const letters = (html) => Object.fromEntries([...html.matchAll(/<li class="rec rec-([abcd])"><a class="rec-link"[^>]*data-yt="([\w-]{11})"/g)].map((m) => [m[2], m[1]]));
  const order = (html) => [...html.matchAll(/data-yt="([\w-]{11})"/g)].map((m) => m[1]);
  const before = recordsHtml(seed, {}, has.sleeve), lastLive = 'OOGT3GxlQJk';
  const moved = seed.map((v) => (v.id === lastLive ? { ...v, first: true } : v));
  const after = recordsHtml(moved, {}, has.sleeve);
  assert.deepEqual(letters(after), letters(before), 'every video keeps its letter');
  assert.deepEqual(order(after), [lastLive, ...order(before).filter((id) => id !== lastLive)], 'only the order changed');
  assert.ok(after.includes('<span class="rec-label">01</span></span><span class="rec-sleeve" aria-hidden="true"><img class="rec-img" src="/media/sleeves/OOGT3GxlQJk-320.webp"'), 'No. 01 is the one put first');
  assert.ok(nowShowingHtml(moved, () => ({ wide: true })).includes('data-yt="OOGT3GxlQJk"'), 'and it is Now showing');
  // hide one: gone from all three, the rest renumber, the others keep their letters
  const hid = seed.map((v) => (v.id === 'K-OZiNvQB14' ? { ...v, hidden: true } : v));
  for (const o of [{}, { more: true }, { compact: true }]) assert.ok(!recordsHtml(hid, o, has.sleeve).includes('K-OZiNvQB14'));
  assert.equal(letters(recordsHtml(hid, {}, has.sleeve)).jL3OKWeRFwg, letters(before).jL3OKWeRFwg);
  assert.ok(!nowShowingHtml(seed.map((v) => (v.id === 'ZGlnFchIVVY' ? { ...v, hidden: true } : v)), () => ({})).includes('ZGlnFchIVVY'));
});

test('a video with no picture yet shows the plain sleeve (no img), and Now showing falls back to the square sleeve', () => {
  const rows = [{ ...seed[8], id: GOOD }];
  assert.ok(!recordsHtml(rows, {}, () => false).includes('<img'));
  assert.ok(recordsHtml(rows, {}, () => true).includes(`src="/media/sleeves/${GOOD}-320.webp"`));
  assert.ok(nowShowingHtml(rows, () => ({ sleeve: true })).includes(`src="/media/sleeves/${GOOD}-640.webp"`));
  assert.ok(!nowShowingHtml(rows, () => ({})).includes('<img'));
  assert.ok(nowShowingHtml([], () => ({})).includes('GLucak on YouTube'));
});

test('injection stays inert: <script>, \' OR 1=1 -- and marker text in a title are data in the tab, the Records block and Now showing', () => {
  const evil = ['<script>alert(1)</script>', "' OR 1=1 --", '"><img src=x onerror=alert(1)>', '<!--/gl:records--><b>x</b>', '</li></ul><script>1</script>', 'javascript:alert(1)'];
  for (const t of evil) {
    const rows = checkVideos([row({ title: t, name: t, with: t, place: t })]).rows;
    assert.ok(rows, t);
    for (const o of [{}, { more: true }, { compact: true }]) {
      const h = recordsHtml(rows, o, () => true);
      assert.ok(!/<script|<img src=x|<b>x<\/b>/.test(h.replace(/<img class="rec-img"[^>]*>/g, '')), `${t}: ${JSON.stringify(o)}`);
      assert.ok(!h.includes('<!--'), 'no comment from a title');
    }
    const n = nowShowingHtml(rows, () => ({}));
    assert.ok(!/<script|<b>x|<img src=x/.test(n) && !n.includes('<!--'), t);
  }
});

// ---------- over HTTP ----------
test('GET /edit/api/videos: signed out 401; signed in the shipped list in the site\'s order, no Shorts, every row ticked with its layout and look', async () => {
  assert.equal((await fetch(`${base}/edit/api/videos`)).status, 401);
  const b = await vids();
  assert.deepEqual(b.videos.map((v) => v.id), ['ZGlnFchIVVY', 'K-OZiNvQB14', 'jL3OKWeRFwg', '6SpsSt8rPzI', 'LBQ4fqLVHSI', 'aZNW63M_C2E', 'OOGT3GxlQJk']);
  assert.ok(b.videos.every((v) => v.noFlash === true && 'abcd'.includes(v.layout) && ['toner', 'print', 'mono'].includes(v.style)));
  assert.deepEqual(b.videos.map((v) => v.layout), ['a', 'b', 'c', 'd', 'a', 'b', 'c'], 'seeded with today\'s letters');
  assert.equal(b.fileSavedAt, null);
});

test('the public pages are filled from the saved list per visit, in the shipped order, with the shipped stills', async () => {
  const body = await page('/videos/');
  const recs = body.match(/<ul class="records">[\s\S]*?<\/ul>/)[0];
  assert.deepEqual(ids(recs), ['ZGlnFchIVVY', 'K-OZiNvQB14', 'jL3OKWeRFwg', '6SpsSt8rPzI', 'LBQ4fqLVHSI', 'aZNW63M_C2E', 'OOGT3GxlQJk']);
  assert.ok(body.includes('id="now-showing"') && body.includes('target="_blank"'), 'links are externalized like every page');
  assert.ok((await page('/')).includes('class="records"') && (await page('/shows/')).includes('records-static'));
});

test('add a video: saved at once, the sleeve is fetched from i.ytimg.com only, written under DATA_DIR and served; no write into dist', async () => {
  calls.length = 0;
  const shippedBefore = readdirSync(join(dir, 'media/sleeves')).sort().join();
  const r = await saveVideos([...(await vids()).videos, row()]);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.videos[0].id, GOOD, 'newest music video first');
  assert.equal(b.videos[0].layout, layoutFor(GOOD));
  assert.match(b.videos[0].date, /^\d{4}-\d\d-\d\d$/);
  assert.equal(b.message, 'Saved. It’s on the site now.');
  assert.equal(b.changes, 'Added: Duck Dodge.');
  assert.deepEqual(calls.map((c) => c.url), [`https://i.ytimg.com/vi/${GOOD}/hqdefault.jpg`], 'one fetch, for the new id only');
  assert.equal(calls[0].init.redirect, 'error');
  for (const w of [320, 640]) {
    const f = join(data, 'sleeves', `${GOOD}-${w}.webp`);
    assert.ok(existsSync(f));
    assert.equal((await sharp(f).metadata()).width, w);
    const img = await fetch(`${base}/media/sleeves/${GOOD}-${w}.webp`);
    assert.equal(img.status, 200);
    assert.equal(img.headers.get('content-type'), 'image/webp');
  }
  assert.equal(readdirSync(join(dir, 'media/sleeves')).sort().join(), shippedBefore, 'nothing was written into the served build');
  assert.ok(!existsSync(join(dir, 'media/sleeves', `${GOOD}-640.webp`)));
  assert.equal(readdirSync(join(data, 'sleeves')).filter((n) => n.endsWith('.tmp')).length, 0);
  const body = await page('/videos/'), recs = body.match(/<ul class="records">[\s\S]*?<\/ul>/)[0];
  assert.equal(ids(recs)[0], GOOD, 'No. 01 on the public page');
  assert.ok(recs.includes(`/media/sleeves/${GOOD}-320.webp`) && recs.includes('rec-' + layoutFor(GOOD)));
  assert.ok(body.includes(`data-yt="${GOOD}" data-title="Duck Dodge"`), 'Now showing is the new first video');
  assert.equal(live().filter((v) => v.kind === 'other').length, SHORTS, 'the Shorts stay in the file');
  assert.equal((await fetch(`${base}/media/sleeves/${GOOD}-999.webp`)).status, 404);
  assert.equal((await fetch(`${base}/media/sleeves/..%2f..%2fserver-${'x'.repeat(2)}-320.webp`)).status, 404);
});

test('a second save fetches nothing: the sleeve is already there', async () => {
  calls.length = 0;
  assert.equal((await saveVideos((await vids()).videos)).status, 200);
  assert.equal(calls.length, 0);
});

test('a picture that cannot be fetched saves the row anyway and says so in plain words; the next save tries again', async () => {
  hooks.fetch = async () => new Response('gone', { status: 404 });
  const r = await saveVideos([...(await vids()).videos, row({ link: link(GOOD2), title: 'No picture', kind: 'live' })]);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.message, 'Saved. We couldn’t get YouTube’s picture, so it shows with a plain card for now.');
  assert.ok(b.videos.some((v) => v.id === GOOD2), 'the row is saved');
  assert.ok(!existsSync(join(data, 'sleeves', `${GOOD2}-640.webp`)));
  const html = await page('/videos/');
  assert.ok(html.includes(`data-yt="${GOOD2}"`) && !html.includes(`/media/sleeves/${GOOD2}`), 'plain sleeve');
  hooks.fetch = async () => { throw new Error('offline'); };
  assert.equal((await (await saveVideos((await vids()).videos)).json()).message, 'Saved. We couldn’t get YouTube’s picture, so it shows with a plain card for now.');
  calls.length = 0; hooks.fetch = okFetch;
  const again = await (await saveVideos((await vids()).videos)).json();
  assert.deepEqual(calls.map((c) => c.url), [`https://i.ytimg.com/vi/${GOOD2}/hqdefault.jpg`]);
  assert.equal(again.message, 'Saved. It’s on the site now.');
  assert.ok(existsSync(join(data, 'sleeves', `${GOOD2}-640.webp`)));
});

test('never fetched on GET; the picture routes answer only for names in our own pattern', async () => {
  calls.length = 0;
  await vids(); await getJson('/edit/api/history/videos'); await page('/videos/'); await page('/'); await page('/shows/');
  assert.equal(calls.length, 0);
  for (const bad of ['/media/sleeves/abc-320.webp', '/media/sleeves/abcdefghijk-100.webp', '/media/sleeves/abcdefghijkl-320.webp', '/media/sleeves/../../server.js']) assert.equal((await fetch(`${base}${bad}`)).status, 404, bad);
});

test('noFlash bypass attempts are refused on save: unticked, missing, a string, null; the file does not change', async () => {
  const before = readFileSync(join(data, 'videos.json'), 'utf8'), cur = (await vids()).videos;
  for (const noFlash of [false, undefined, null, 'true', 1]) {
    const r = await saveVideos([...cur, row({ link: link('zzzzzzzzzz1'), title: 'Sneaky', noFlash })]);
    assert.equal(r.status, 400, JSON.stringify(noFlash));
    const e = (await r.json()).errors[0];
    assert.equal(e.row, cur.length);
    assert.match(e.message, /Tick the box once you’ve watched it/);
  }
  const edited = cur.map((v, i) => (i === 2 ? { ...v, noFlash: false } : v)); // un-tick a video that is already on the site
  assert.equal((await saveVideos(edited)).status, 400);
  assert.equal(readFileSync(join(data, 'videos.json'), 'utf8'), before, 'nothing was written');
  assert.equal((await saveVideos([...cur, row({ link: link('zzzzzzzzzz1'), title: 'Hidden is fine', noFlash: false, hidden: true })])).status, 200);
  assert.ok(!(await page('/videos/')).includes('zzzzzzzzzz1'), 'hidden: not on the public page');
});

test('the same check guards History: a restore that would put an unticked video on the site is refused', async () => {
  const dirH = join(data, 'history', 'videos');
  mkdirSync(dirH, { recursive: true });
  const plant = (id, rows) => writeFileSync(join(dirH, `${id}.json`), JSON.stringify({ at: new Date().toISOString(), data: rows }));
  const cur = (await vids()).videos;
  const BAD = '20200101T000000000Z-badbadba', GOODID = '20200101T000000001Z-600d600d';
  plant(BAD, [...cur, { ...row({ link: undefined }), id: 'qqqqqqqqqq1', layout: 'a', style: 'mono', kind: 'music-video', noFlash: false }]);
  plant(GOODID, cur.map((v, i) => (i === 0 ? { ...v, title: 'Restored title' } : v)));
  const before = readFileSync(join(data, 'videos.json'), 'utf8');
  const r = await post(`/edit/api/history/videos/${BAD}`, { version: (await vids()).version }, { cookie });
  assert.equal(r.status, 422);
  assert.equal(readFileSync(join(data, 'videos.json'), 'utf8'), before, 'refused: nothing written');
  const ok = await post(`/edit/api/history/videos/${GOODID}`, { version: (await vids()).version }, { cookie });
  assert.equal(ok.status, 200);
  const restored = (await ok.json()).videos;
  assert.equal(restored.length, cur.length);
  assert.equal(restored[0].title, 'Restored title');
  assert.equal(live().filter((v) => v.kind === 'other').length, SHORTS, 'a restore keeps the Shorts');
  // a hand-edited file cannot put an unticked video on the page either
  const f = JSON.parse(readFileSync(join(data, 'videos.json'), 'utf8'));
  f.push({ id: 'hhhhhhhhhh1', title: 'Planted', date: '2026-11-01', kind: 'music-video', featured: false, layout: 'a', style: 'mono' }, { id: 'hhhhhhhhhh2', title: 'Planted 2', date: '2026-11-01', kind: 'music-video', noFlash: 'true' });
  writeFileSync(join(data, 'videos.json'), JSON.stringify(f));
  const html = await page('/videos/');
  assert.ok(!html.includes('hhhhhhhhhh1') && !html.includes('hhhhhhhhhh2') && !html.includes('Planted'), 'Show refuses rows without noFlash === true');
  writeFileSync(join(data, 'videos.json'), JSON.stringify(f.slice(0, -2)));
});

test('History lists videos with counts only; a hidden row, Put first, and the "what changed" line', async () => {
  const cur = (await vids()).videos;
  const edit = (id, o) => cur.map((v) => (v.id === id ? { ...v, ...o } : v));
  const hide = await saveVideos(edit('K-OZiNvQB14', { hidden: true }));
  assert.equal((await hide.json()).changes, 'Hid: Duck, Dodge, Jump, Fight!');
  const back = await saveVideos(edit('K-OZiNvQB14', { hidden: false }));
  assert.equal((await back.json()).changes, 'Put back: Duck, Dodge, Jump, Fight!');
  const first = await saveVideos(edit('6SpsSt8rPzI', { first: true }));
  const fb = await first.json();
  assert.equal(fb.changes, 'Put first: Earned Your Stripes.');
  assert.equal(fb.videos[0].id, '6SpsSt8rPzI', 'stored at the top');
  const h = (await getJson('/edit/api/history/videos')).body.entries;
  assert.ok(h.length >= 3 && h.every((e) => Number.isInteger(e.count)));
  assert.equal(h[0].what, 'Put 1 video first.', 'History carries counts, never row names');
  assert.ok(!JSON.stringify(h).includes('Earned') && !JSON.stringify(h).includes('Duck'));
  assert.equal(h.filter((e) => e.live).length, 1);
  assert.equal((await saveVideos(cur)).status, 200); // put back the way it was
});

test('injection through the Videos tab: titles stay text everywhere', async () => {
  const cur = (await vids()).videos;
  const t = '<script>alert(1)</script>';
  const r = await saveVideos([...cur, row({ link: link('yyyyyyyyyy1'), title: t, with: "' OR 1=1 --", place: '"><img src=x onerror=alert(1)>' })]);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.videos.find((v) => v.id === 'yyyyyyyyyy1').title, t, 'kept as text');
  for (const p of ['/videos/', '/', '/shows/']) {
    const html = await page(p);
    assert.ok(!html.includes('<script>alert(1)') && !html.includes('<img src=x onerror') && html.includes('&lt;script&gt;'), p);
  }
  assert.ok(!JSON.stringify((await getJson('/edit/api/history/videos')).body).includes('script'), 'History has no row text');
});

test('edit POSTs (Videos save, Go back, other tabs, sign-in, sign-out) refuse a request a browser says is cross-site or same-site; Origin is still required', async () => {
  const cur = (await vids()).videos;
  const go = (site) => saveVideos(cur, site === undefined ? {} : { 'sec-fetch-site': site });
  assert.equal((await go('cross-site')).status, 403);
  assert.equal((await go('same-site')).status, 403);
  assert.equal((await go('')).status, 200, 'an empty header is no header');
  assert.equal((await go('same-origin')).status, 200);
  assert.equal((await go('none')).status, 200);
  assert.equal((await go()).status, 200);
  const noOrigin = await fetch(`${base}/edit/api/videos`, { method: 'POST', headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify({ version: (await vids()).version, videos: cur }) });
  assert.equal(noOrigin.status, 403, 'Origin is still required');
  const e = (await getJson('/edit/api/history/videos')).body.entries[1];
  assert.equal((await post(`/edit/api/history/videos/${e.id}`, { version: (await vids()).version }, { cookie, 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal((await post('/edit/api/shows', { version: 'x', shows: [] }, { cookie, 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal((await post('/edit/login', { username: 'gabe', password: 'gabes long password' }, { 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal((await post('/edit/logout', {}, { cookie, 'sec-fetch-site': 'same-site' })).status, 403);
});

test('History: only the NEWEST entry equal to the live file is "on the site now"', async () => {
  const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const s = (venue) => [{ date: d(9), type: 'show', venue, city: 'PA' }];
  const save = async (shows) => post('/edit/api/shows', { version: (await getJson('/edit/api/shows')).body.version, shows }, { cookie });
  for (const v of ['One', 'Two', 'One']) assert.equal((await save(s(v))).status, 200);
  const e = (await getJson('/edit/api/history/shows')).body.entries;
  assert.deepEqual(e.map((x) => x.live), [true, ...Array(e.length - 1).fill(false)]);
  assert.ok(e.length >= 3);
  assert.equal(e[0].what, 'Changed 1 show.', 'One -> Two -> One: each row says what changed from the one before');
  assert.equal((await (await save(s('Three'))).json()).changes, 'Changed: Three.');
  assert.equal((await (await save([...s('Three'), ...s('Four')])).json()).changes, 'Added: Four.');
});

test('what changed: counts, names, the order, IDENTITY and Bio', () => {
  const a = { date: '2026-12-01', type: 'show', venue: 'A' }, b = { date: '2026-12-02', type: 'show', venue: 'B' }, c = { date: '2026-12-03', type: 'show', venue: 'C' };
  assert.equal(describeChange('shows', [a], [a]), '');
  assert.equal(describeChange('shows', [a], [a, b]), 'Added: B.');
  assert.equal(describeChange('shows', [a], [a, b], { names: false }), 'Added 1 show.');
  assert.equal(describeChange('shows', [a, b, c], [a]), 'Removed 2.');
  assert.equal(describeChange('shows', [a, b], [{ ...a, venue: 'A2' }, { ...b, city: 'X' }, c]), 'Added 1 show, changed 2.');
  assert.equal(describeChange('shows', [a, b], [b, a]), 'Changed the order.');
  assert.equal(describeChange('shows', null, [a]), '');
  assert.equal(describeChange('videos', [{ id: 'aaaaaaaaaaa', title: 'T', name: 'Duck Dodge' }], [{ id: 'aaaaaaaaaaa', title: 'T', name: 'Duck Dodge' }, { id: 'bbbbbbbbbbb', title: 'Other' }]), 'Added: Other.');
  assert.equal(describeChange('shows', [], [{ ...a, venue: 'x'.repeat(200) }]).length < 90, true, 'a long name is cut');
  assert.equal(describeChange('identity', { identity: { date: '2027-01-01', link: 'https://a.example' } }, { identity: { date: '2027-02-01', link: 'https://a.example' } }), 'Changed the release date.');
  assert.equal(describeChange('bio', { homeBio: 'a', bio: 'b' }, { homeBio: 'a2', bio: 'b2' }), 'Changed the Home sentence and the About bio.');
});

test('the Videos tab in the edit screen: no Delete, Hide and Put first, the ticked box is required, Fans will tap, Copy this show (static checks of edit.js and the page)', () => {
  const js = readFileSync(root('public/js/edit.js'), 'utf8'), pg = readFileSync(root('src/pages/edit/index.astro'), 'utf8');
  const videoRow = js.slice(js.indexOf('function videoRow('), js.indexOf('function markVideos('));
  assert.ok(!videoRow.includes('box.delBar') && !videoRow.includes('removeRow') && !/Delete this video/.test(js + pg), 'no Delete on Videos');
  assert.ok(videoRow.includes("'Hide from site'") && videoRow.includes("'Put back on site'") && videoRow.includes("'Put first'"));
  assert.ok(videoRow.includes('No fast flashing lights in this video') && videoRow.includes('Watch it first. If anything flashes quickly, leave it off the site.'));
  assert.ok(/checked: v\.noFlash === true/.test(videoRow) && !/checked: true/.test(videoRow), 'never pre-ticked on a new row');
  assert.ok(videoRow.includes('FLASH_LINE') && /if \(state\.hidden && !flash\.checked\)/.test(videoRow), 'Put back refuses an unticked box');
  assert.ok(videoRow.includes("'Change the link by adding a new video.'") && videoRow.includes('Picture comes after you save.'));
  assert.ok(js.includes('Fans will tap: ${t}') && js.includes("field('Link (optional)', link, 'Tickets or details page', true)") && js.includes("'Your smart link (like wingsmusic.lnk.to/…) or the Spotify link.', true)") && js.includes("'Where fans buy it: the product page on your store. Needed for the Buy button.', true)"));
  assert.ok(pg.includes('id="i-link-fans"') && js.includes("fansFor(F.link, $('i-link-fans'))") && js.includes('(val) => { const id = ytId(val)'), 'the Pre-save and video link fields too');
  assert.ok(js.includes("textContent: 'Copy this show'") && js.includes("'Copied. Pick the new date.'") && js.includes("date: ''"));
  assert.ok(!js.includes('innerHTML') && !js.includes('insertAdjacentHTML') && !js.includes('confirm('));
  assert.ok(js.includes("videos: ['v-save', 'v-add']") && pg.includes('id="panel-videos"') && pg.includes('Save videos'));
  assert.ok(/\.ed-fans\[hidden\] \{ display: none; \}/.test(pg), 'hidden wins over the hint look');
  assert.ok(js.includes("typeof changes === 'string' && changes"), 'the save line says what changed');
});

test('the picture fetch is rate-limited like uploads: 30 tries in 10 minutes, then none (the row still saves, with the plain-card line)', async () => {
  _resetLimits();
  calls.length = 0;
  hooks.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response('gone', { status: 404 }); };
  const cur = (await vids()).videos;
  let last;
  for (let i = 0; i < 33; i++) last = await (await saveVideos([...cur, row({ link: link('rrrrrrrrr01'), title: 'Limited', kind: 'live' })])).json();
  assert.equal(calls.length, 30, 'one try per save until the limit, then none');
  assert.ok(calls.every((c) => c.url === 'https://i.ytimg.com/vi/rrrrrrrrr01/hqdefault.jpg'));
  assert.ok(last.videos.some((v) => v.id === 'rrrrrrrrr01') && /plain card/.test(last.message));
  hooks.fetch = okFetch;
});

test('backups carry the videos (not the Shorts); a restore refuses a visible video without the ticked box, and one that is not a link', async () => {
  const fb = { shows: join(dir, 'shipped-shows.json'), products: join(dir, 'shipped-products.json'), site: root('src/data/site.json'), releases: root('src/data/releases.json'), videos: root('src/data/videos.json') };
  const b = makeBackup(data, fb);
  assert.ok(Array.isArray(b.videos) && b.videos.length > 7 && b.videos.every((v) => ['music-video', 'lyric-video', 'live'].includes(v.kind)));
  assert.ok(!(await checkBackup(JSON.stringify(b), data)).errors, 'a backup of the live data restores');
  const unticked = structuredClone(b); unticked.videos[0].noFlash = false;
  assert.match((await checkBackup(JSON.stringify(unticked), data)).errors[0].message, /Tick the box/);
  const bad = structuredClone(b); bad.videos[1].id = '../../x';
  assert.ok((await checkBackup(JSON.stringify(bad), data)).errors);
  const old = structuredClone(b); delete old.videos;
  assert.equal((await checkBackup(JSON.stringify(old), data)).videos, undefined, 'an older backup leaves the saved videos alone');
});

test('hand-edited videos.json: a bad id or a flashing name never reaches a public page (advisor A3)', () => {
  const ok = { id: 'ZGlnFchIVVY', title: 'Safe', kind: 'music-video', date: '2026-01-01', noFlash: true, layout: 'a', style: 'mono' };
  const badId = { ...ok, id: 'x" onmouseover="alert(1)', title: 'Bad id' };
  const flashName = { ...ok, id: 'K-OZiNvQB14', title: 'Fine title', name: 'Running The Gauntlet (Lyric Video)' };
  const odd = { ...ok, id: 'jL3OKWeRFwg', title: 12345 };
  const rows = shownRows([ok, badId, flashName, odd]);
  assert.deepEqual(rows.map((r) => r.id).sort(), ['ZGlnFchIVVY', 'jL3OKWeRFwg'].sort());
  assert.equal(rows.find((r) => r.id === 'jL3OKWeRFwg').title, '12345');
  const html = recordsHtml([ok, badId, flashName], {}, () => false);
  assert.ok(!html.includes('onmouseover') && !html.includes('Gauntlet'));
});
