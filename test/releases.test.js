// OV4b: the Releases tab. releases.json saves live (no rebuild): validation per field, injection, auth, Origin, 409, the Music crate,
// Home's newest release and the Now line all follow the saved list. IDENTITY is kept out of the tab and kept in the file.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../src/lib/auth.js';
import { checkReleases, crateHtml, fillReleases, latestHtml, listenHtml, MAX_ARTISTS, MAX_LINK, MAX_RELEASES, MAX_TITLE } from '../src/lib/releases.js';

const SEED = fileURLToPath(new URL('../src/data/releases.json', import.meta.url));
const seed = JSON.parse(readFileSync(SEED, 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'gl-rel-'));
const data = join(dir, 'data');
for (const p of ['music', 'edit']) mkdirSync(join(dir, p));
writeFileSync(join(dir, 'music/index.html'), '<!doctype html><title>t</title><!--gl:listen--><a>built listen</a><!--/gl:listen--><!--gl:crate--><ul class="crate"><li>built crate</li></ul><!--/gl:crate-->');
writeFileSync(join(dir, 'index.html'), '<!doctype html><title>t</title><p class="now"><!--gl:now--><a class="stub">built now</a><!--/gl:now--></p><!--gl:latest--><article>built latest</article><!--/gl:latest-->');
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>e</title>');
writeFileSync(join(dir, 'shipped.json'), '[]');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped.json'), PRODUCTS_FILE: join(dir, 'shipped.json'), RELEASES_FILE: SEED, SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `gabe:${hashPassword('gabes long password')}` });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base, cookie;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST', redirect: 'manual',
  headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const get = async (p) => (await fetch(`${base}${p}`)).text();
const list = async () => (await (await fetch(`${base}/edit/api/releases`, { headers: { cookie } })).json());
const save = async (rows, v) => post('/edit/api/releases', { version: v === undefined ? (await list()).version : v, releases: rows }, { cookie });
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const rel = (o = {}) => ({ title: 'New Song', type: 'single', date: day(-3), link: 'https://example.com/new', artists: '', cover: null, ...o });
const tiles = (h) => [...h.matchAll(/<li class="tile"[^>]*>[\s\S]*?<\/li>/g)].map((m) => m[0]);
const live = () => JSON.parse(readFileSync(join(data, 'releases.json'), 'utf8'));

test('fallback: no saved file -> the shipped list fills the crate and the editor loads it, IDENTITY included in the file', async () => {
  assert.ok(!existsSync(join(data, 'releases.json')));
  const m = await get('/music/');
  assert.ok(!m.includes('built crate') && tiles(m).length === seed.filter((r) => r.title !== 'IDENTITY').length);
  const r = await post('/edit/login', { username: 'gabe', password: 'gabes long password' });
  cookie = r.headers.get('set-cookie').split(';')[0];
  assert.deepEqual((await list()).releases, seed);
});

test('auth: no cookie 401, forged 401, wrong or missing Origin 403, non-JSON 415', async () => {
  assert.equal((await fetch(`${base}/edit/api/releases`)).status, 401);
  assert.equal((await post('/edit/api/releases', { releases: [] })).status, 401);
  assert.equal((await post('/edit/api/releases', { releases: [] }, { cookie: 'gl_edit=forged.value' })).status, 401);
  const body = { version: (await list()).version, releases: [] };
  assert.equal((await post('/edit/api/releases', body, { cookie, origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('/edit/api/releases', body, { cookie, origin: '' })).status, 403);
  assert.equal((await post('/edit/api/releases', 'x=1', { cookie, 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
  assert.deepEqual((await list()).releases, seed, 'nothing was saved');
});

test('each field: refused with a plain message, nothing written', () => {
  const bad = (o, re) => { const r = checkReleases([rel(o)]); assert.ok(r.errors, JSON.stringify(o).slice(0, 80)); assert.match(r.errors[0].message, re); assert.equal(r.errors[0].row, 0); };
  bad({ title: '' }, /Add the title/);
  bad({ title: '   ' }, /Add the title/);
  bad({ title: 'x'.repeat(MAX_TITLE + 1) }, /Add the title/);
  bad({ title: 'a\x00b' }, /Add the title/);
  bad({ title: 'a\nb' }, /Add the title/);
  bad({ title: 'identity' }, /own tab/);
  bad({ title: 5 }, /Add the title/);
  bad({ type: 'podcast' }, /Pick Single/);
  bad({ type: undefined }, /Pick Single/);
  bad({ date: '' }, /real release date/);
  bad({ date: '2026-02-30' }, /real release date/);
  bad({ date: 'soon' }, /real release date/);
  bad({ link: '' }, /https/);
  bad({ link: 'javascript:alert(1)' }, /https/);
  bad({ link: ' JaVaScRiPt:alert(1)' }, /https/);
  bad({ link: 'http://insecure.example' }, /https/);
  bad({ link: 'data:text/html,<script>alert(1)</script>' }, /https/);
  bad({ link: "' OR 1=1 --" }, /https/);
  bad({ link: 'https://x.example/a b' }, /https/);
  bad({ link: `https://x.example/${'a'.repeat(MAX_LINK)}` }, /too long/);
  bad({ artists: 'x'.repeat(MAX_ARTISTS + 1) }, /one line/);
  bad({ artists: 'a\nb' }, /one line/);
  bad({ cover: 'javascript:alert(1)' }, /cover/);
  bad({ cover: 'https://evil.example/x.webp' }, /cover/);
  bad({ cover: '/media/uploads/../../server.js' }, /cover/);
  bad({ cover: '/media/uploads/abc.webp' }, /cover/);
  bad({ cover: '"><img src=x onerror=alert(1)>' }, /cover/);
  bad({ cover: "' OR 1=1 --" }, /cover/);
  assert.ok(checkReleases(null).errors && checkReleases({}).errors && checkReleases('x').errors);
  assert.ok(checkReleases(['text']).errors && checkReleases([null]).errors && checkReleases([[]]).errors);
  assert.ok(checkReleases(Array.from({ length: MAX_RELEASES + 1 }, () => rel())).errors, 'row cap');
  const ok = checkReleases([rel({ cover: `/media/uploads/${'a'.repeat(32)}.webp`, extra: '<b>' })]);
  assert.deepEqual(Object.keys(ok.rows[0]), ['title', 'date', 'type', 'link', 'cover'], 'unknown fields dropped, empty artists dropped');
  const remix = checkReleases([rel({ type: 'album', remix: true })]).rows[0];
  assert.equal(remix.type, 'album'); assert.equal(remix.remix, true);
  assert.equal(checkReleases([rel({ type: 'single', remix: true })]).rows[0].remix, undefined, 'remix is only for albums');
});

test('a save is live: the crate, the sleeve, Coming, the Next line and the Now line follow, IDENTITY stays in the file', async () => {
  const r = await save([rel({ title: 'Brand New', date: day(-2), artists: 'GLucak, J-BOY' }), rel({ title: 'Soon Song', date: day(9), link: 'https://wingsmusic.lnk.to/soon' }),
    rel({ title: 'Old Remix', type: 'album', remix: true, date: '2024-05-01', cover: `/media/uploads/${'b'.repeat(32)}.webp` })]);
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.match(body.message, /on the site now/);
  assert.ok(live().some((x) => x.title === 'IDENTITY' && x.date === '2027-08-13'), 'IDENTITY kept, unchanged');
  assert.ok(existsSync(join(data, 'releases.prev.json')), 'the last good file is kept');
  const m = await get('/music/'), t = tiles(m);
  assert.equal(t.length, 3);
  assert.ok(!t.join('').includes('Scenic Route') && !m.includes('IDENTITY'), 'removed releases are gone, IDENTITY is not a tile');
  const soon = t.find((x) => x.includes('Soon Song'));
  assert.ok(soon.includes('data-state="coming"') && soon.includes('class="nocover tile-art"') && soon.includes('tile-go">Pre-save<') && !soon.includes('<img'), 'coming, plain sleeve, Pre-save');
  const brand = t.find((x) => x.includes('Brand New'));
  assert.ok(brand.includes('tile-artists">GLucak, J-BOY<') && brand.includes('nocover') && brand.includes('Single</span>'), 'artists, honest sleeve, type');
  const old = t.find((x) => x.includes('Old Remix'));
  assert.ok(old.includes('tile-type">Remix album<') && old.includes(`src="/media/uploads/${'b'.repeat(32)}.webp"`) && !old.includes('nocover'));
  assert.ok(m.includes('aria-label="Listen everywhere: Brand New'), 'the external-link pass adds its own words after the name');
  const home = await get('/');
  assert.ok(home.includes('<h3>Brand New</h3>') && home.includes('Latest single') && home.includes('class="nocover v2-cover"') && home.includes('role="img" aria-label="Brand New: no cover art yet"'));
  assert.ok(home.includes('Next: Soon Song,') && home.includes('aria-label="Pre-save Soon Song'));
  assert.ok(home.includes('<span class="stub-place">Soon Song</span>') || home.includes('Brand New'), 'the Now line names a saved release');
  assert.ok(!home.includes('built now') && !home.includes('built latest'));
});

test('the Now line: a release out today says so', async () => {
  assert.equal((await save([rel({ title: 'Today Song', date: day(0) })])).status, 200);
  const today = await get('/');
  // the date is New York's day; UTC and New York can differ by one near midnight, so accept either wording
  assert.match(today, /<span class="stub-when">Out (today|now)<\/span> <span class="stub-what"><span class="stub-place">Today Song<\/span>/);
});

test('with no cover the plain sleeve names the title and type; a hand-edited bad cover never becomes an img src', () => {
  const h = crateHtml([{ title: 'Hi', type: 'ep', date: '2026-01-01', link: 'https://x.example/', cover: null }], '2026-06-01');
  assert.match(h, /<span class="nocover tile-art" style="--nc-fs: [\d.]+cqi" aria-hidden="true"><span class="nocover-title" aria-hidden="true">Hi<\/span><span class="nocover-type" aria-hidden="true"><span>EP<\/span><\/span><\/span>/);
  const evil = crateHtml([{ title: 'Hi', type: 'single', date: '2026-01-01', link: 'https://x.example/', cover: '" onerror="alert(1)' }], '2026-06-01');
  assert.ok(!evil.includes('<img') && !evil.includes('onerror'));
  assert.ok(!latestHtml([{ title: 'Hi', type: 'single', date: '2026-01-01', link: 'https://x.example/', cover: 'javascript:alert(1)' }], '2026-06-01').includes('javascript'));
  assert.equal(crateHtml([], '2026-06-01'), '<!--gl:crate--><!--/gl:crate-->');
  assert.equal(fillReleases('<p>x</p>', seed), '<p>x</p>', 'no marker, no change');
  assert.ok(listenHtml([{ title: 'A', date: '2026-01-01', link: 'https://x.example/a' }, { title: 'B', date: '2026-02-01', link: 'https://x.example/b' }], '2026-06-01').includes('href="https://x.example/b"'));
});

test('stale save is 409 and changes nothing; a missing version is stale too', async () => {
  const v = (await list()).version;
  assert.equal((await save([rel({ title: 'Newer' })], v)).status, 200);
  const stale = await save([rel({ title: 'Older, from another tab' })], v);
  assert.equal(stale.status, 409);
  assert.match((await stale.json()).message, /^Someone else saved the releases just now/);
  assert.equal(live().find((x) => x.title !== 'IDENTITY').title, 'Newer');
  assert.equal((await save([rel()], null)).status, 409);
});

test('a refused save is 400 and writes nothing; the size cap is 413; an empty list is allowed (IDENTITY stays)', async () => {
  const before = await list();
  for (const bad of [rel({ link: 'javascript:alert(1)' }), rel({ link: 'http://x.example' }), rel({ title: '<script>' , type: 'x' }), rel({ cover: '/etc/passwd' })]) {
    const r = await save([rel(), bad]);
    assert.equal(r.status, 400);
    assert.equal((await r.json()).errors[0].row, 1, 'the bad row is the one marked');
  }
  assert.equal((await post('/edit/api/releases', '{nope', { cookie })).status, 400);
  assert.equal((await post('/edit/api/releases', JSON.stringify({ version: 'x', releases: [rel({ title: 'y'.repeat(200 * 1024) })] }), { cookie })).status, 413);
  assert.deepEqual(await list(), before);
  assert.equal((await save([])).status, 200);
  assert.deepEqual(live().map((x) => x.title), ['IDENTITY']);
});

test('injection renders inert on the public pages, field by field', async () => {
  const evil = ['<script>alert(1)</script>', '" onmouseover="alert(1)', "' OR 1=1 --", '</li><img src=x onerror=alert(1)>', '<!--/gl:crate--><b>x</b>'];
  for (const t of evil) {
    const r = await save([rel({ title: t, artists: t, date: day(-1) }), rel({ title: `${t} 2`, date: day(4), link: `https://x.example/?a=${encodeURIComponent(t)}&q="onmouseover="alert(1)` })]);
    assert.equal(r.status, 200, t);
    for (const page of ['/music/', '/']) {
      const h = await get(page);
      assert.ok(!h.includes('<script>alert') && !h.includes('<img src=x') && !h.includes('<b>x</b>') && !h.includes('" onmouseover='), `${page}: ${t}`);
    }
  }
  const m = await get('/music/');
  assert.ok(m.includes('&lt;b&gt;x&lt;/b&gt;') && !m.includes('built crate'));
  assert.ok(m.includes('q=&quot;onmouseover=&quot;alert(1)'), 'a quote inside a valid https link cannot break out of href');
});

test('the edit screen loads Releases without IDENTITY and keeps the five tabs in order (static check)', () => {
  const js = readFileSync(new URL('../public/js/edit.js', import.meta.url), 'utf8');
  assert.ok(js.includes("r.title !== 'IDENTITY'"), 'the tab never lists IDENTITY');
  assert.ok(js.includes("const tabs = ['shows', 'releases', 'identity', 'bio', 'products']"));
  assert.ok(js.includes("uploader('releases'") && js.includes("uploader('products'") && (js.match(/async function upload\(/g) ?? []).length === 1, 'one uploader for both');
});
