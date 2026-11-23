// Admin round A2 (DESIGN 31f, 31g; D125): History (the last 10 saves per tab, go back through the normal save), "Last saved",
// the error code, drafts parsed defensively. Over real HTTP against server.js with a temp DATA_DIR.
import { test, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { _resetLimits, hashPassword } from '../src/lib/auth.js';
import { makeBackup } from '../src/lib/backup.js';
import { ID, KEEP, errorCode, recordHistory, listHistory, readEntry } from '../src/lib/history.js';

const seedOf = (f) => fileURLToPath(new URL(`../src/data/${f}`, import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'gl-hist-'));
const data = join(dir, 'data');
for (const p of ['shows', 'edit']) mkdirSync(join(dir, p));
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>e</title>');
writeFileSync(join(dir, 'shows/index.html'), '<!doctype html><title>t</title><ul><!--gl:shows--></ul>');
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
writeFileSync(join(dir, 'shipped-shows.json'), JSON.stringify([{ date: d(10), type: 'show', venue: 'Shipped Venue', city: 'PA' }]));
writeFileSync(join(dir, 'shipped-products.json'), '[]');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped-shows.json'), PRODUCTS_FILE: join(dir, 'shipped-products.json'),
  SITE_FILE: seedOf('site.json'), RELEASES_FILE: seedOf('releases.json'), SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `gabe:${hashPassword('gabes long password')}` });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base, cookie;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST', redirect: 'manual',
  headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const getJson = async (p, headers = {}) => { const r = await fetch(`${base}${p}`, { headers: { cookie, ...headers } }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
const api = (k) => getJson(`/edit/api/${k === 'identity' || k === 'bio' ? 'site' : k}`);
const ver = async (k) => (await api(k)).body.version;
const row = (o = {}) => ({ date: d(5), type: 'show', venue: 'The Venue', city: 'Doylestown, PA', ...o });
const saveShows = async (shows, v) => post('/edit/api/shows', { version: v ?? await ver('shows'), shows }, { cookie });
const saveSite = async (part, v) => post('/edit/api/site', { version: v ?? await ver('site'), site: part }, { cookie });
const hist = async (k) => (await getJson(`/edit/api/history/${k}`)).body.entries;
const go = async (k, id, v, headers = {}) => post(`/edit/api/history/${k}/${id}`, { version: v ?? await ver(k) }, { cookie, ...headers });
const histDir = (k) => join(data, 'history', k);
const live = (f) => JSON.parse(readFileSync(join(data, f), 'utf8'));
const FAKE = '20200101T000000000Z-deadbeef';
const plant = (k, o, id = FAKE) => { mkdirSync(histDir(k), { recursive: true }); writeFileSync(join(histDir(k), `${id}.json`), typeof o === 'string' ? o : JSON.stringify(o)); return id; };

test('sign in', async () => {
  const r = await post('/edit/login', { username: 'gabe', password: 'gabes long password' });
  assert.equal(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];
});

test('GET replies carry savedAt (newest of the data files) and fileSavedAt; null before anything is saved', async () => {
  const first = (await getJson('/edit/api/shows')).body;
  assert.equal(first.savedAt, null);
  assert.equal(first.fileSavedAt, null);
  assert.equal((await saveShows([row({ venue: 'S0' })])).status, 200);
  const r = (await getJson('/edit/api/shows')).body;
  assert.equal(r.fileSavedAt, statSync(join(data, 'shows.json')).mtime.toISOString());
  assert.equal(r.savedAt, r.fileSavedAt, 'the newest of the four files is the one just saved');
  assert.equal((await getJson('/edit/api/products')).body.fileSavedAt, null, 'products.json was never saved');
  assert.equal((await getJson('/edit/api/products')).body.savedAt, r.savedAt, 'Last saved is the same for every tab');
  const saved = await (await saveShows([row({ venue: 'S0b' })])).json();
  assert.match(saved.savedAt, /^\d{4}-\d\d-\d\dT[\d:.]+Z$/);
});

test('11 saves keep 10: newest first, the oldest pruned, each entry is times and counts only', async () => {
  for (let i = 1; i <= 11; i++) assert.equal((await saveShows(Array.from({ length: i }, (_, j) => row({ venue: `S${i}-${j}` })))).status, 200);
  const e = await hist('shows');
  assert.equal(e.length, KEEP);
  assert.deepEqual(e.map((x) => x.count), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'S1 and the older ones are gone');
  assert.equal(readdirSync(histDir('shows')).length, KEEP, 'the folder holds exactly 10 files');
  assert.ok(e.every((x) => ID.test(x.id) && Number.isFinite(Date.parse(x.at))));
  assert.deepEqual(Object.keys(e[0]).sort(), ['at', 'count', 'id', 'live'], 'no row data in the list');
  assert.equal(e[0].live, true, 'the newest is what the site shows now');
  assert.ok(e.slice(1).every((x) => x.live === false));
  assert.ok([...e.map((x) => x.id)].every((id, i, a) => !i || id < a[i - 1]), 'ids sort newest first');
});

test('the very first save keeps what it replaced (so even that save can be undone)', async () => {
  // a tab nobody has saved: products ship as []
  assert.equal((await getJson('/edit/api/history/products')).body.entries.length, 0);
  const p = { id: 'tee', name: 'Tee', type: 'shirt', price: 2500, image: '/media/shop/sample-tee.webp', status: 'coming-soon', order: 0 };
  assert.equal((await post('/edit/api/products', { version: await ver('products'), products: [p] }, { cookie })).status, 200);
  const e = await hist('products');
  assert.deepEqual(e.map((x) => x.count), [1, 0], 'the saved list and the shipped one it replaced');
  assert.equal((await go('products', e[1].id)).status, 200);
  assert.deepEqual((await api('products')).body.products, [], 'back to the shipped list');
});

test('Go back: restored through the normal save (listed, .prev kept, undoable); the list stays at 10', async () => {
  const before = await hist('shows');
  const target = before.find((x) => x.count === 5);
  const prevLive = readFileSync(join(data, 'shows.json'), 'utf8');
  const r = await go('shows', target.id);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.shows.length, 5);
  assert.equal(b.shows[0].venue, 'S5-0');
  assert.equal(live('shows.json').length, 5);
  assert.equal(readFileSync(join(data, 'shows.prev.json'), 'utf8'), prevLive, '.prev is what the restore replaced');
  assert.ok(b.savedAt && b.fileSavedAt && b.version);
  assert.match(readFileSync(join(data, 'shows.json'), 'utf8'), /S5-0/);
  const after = await hist('shows');
  assert.equal(after.length, KEEP);
  assert.equal(after[0].count, 5, 'the restore itself is the newest entry');
  assert.equal(after[0].live, true);
  assert.equal(after[1].count, 11, 'what the site showed before is one tap away');
  assert.equal((await go('shows', after[1].id)).status, 200, 'undo the go-back');
  assert.equal(live('shows.json').length, 11);
});

test('stale version -> 409, nothing written, no history added', async () => {
  const e = await hist('shows'), staleV = await ver('shows');
  assert.equal((await saveShows([row({ venue: 'Someone else' })])).status, 200);
  const files = readdirSync(histDir('shows')).sort(), bytes = readFileSync(join(data, 'shows.json'), 'utf8');
  const r = await go('shows', e[3].id, staleV);
  assert.equal(r.status, 409);
  assert.equal(readFileSync(join(data, 'shows.json'), 'utf8'), bytes, 'a 409 never overwrites');
  assert.deepEqual(readdirSync(histDir('shows')).sort(), files);
  assert.equal((await post(`/edit/api/history/shows/${e[3].id}`, {}, { cookie })).status, 409, 'a missing version is stale too');
});

test('unknown kind or id, ../, absolute and encoded paths, other methods: 404 (signed in)', async () => {
  const e = (await hist('shows'))[1];
  const gone = '20200202T000000000Z-0badc0de';
  for (const p of ['/edit/api/history/nope', '/edit/api/history/', '/edit/api/history', '/edit/api/history/shows/', '/edit/api/history/SHOWS', '/edit/api/history/site',
    `/edit/api/history/shows/${e.id}`, '/edit/api/history/shows%2f..%2f..', '/edit/api/history/..%2fshows', '/edit/api/history/shows%00', '/edit/api/history/shows.prev']) {
    assert.equal((await getJson(p)).status, 404, p);
  }
  for (const p of ['/edit/api/historyshows', '/edit/api/historyFOO', '/edit/api/historyFOO/shows', '/edit/api/history.json', '/edit/api/history-x/shows']) { // not the history route at all
    const r = await getJson(p);
    assert.ok([404, 405].includes(r.status) && !r.body.entries, `${p} -> ${r.status}`);
  }
  for (const p of ['/edit/api/historyFOO/shows/' + e.id, '/edit/api/history_/shows/' + e.id, '/edit/api/historyshows/' + e.id]) assert.equal((await post(p, { version: await ver('shows') }, { cookie })).status, 404, p);
  for (const id of [gone, '..', '../shows', '..%2f..%2fshows.json', '%2e%2e%2f', '/etc/passwd', 'C:\\Windows\\win.ini', '..\\..\\x', `${e.id}.json`, `${e.id}/x`, `${e.id}%00`, e.id.toUpperCase(), 'x'.repeat(5000), `${FAKE}x`]) {
    const r = await post(`/edit/api/history/shows/${id}`, { version: await ver('shows') }, { cookie });
    assert.equal(r.status, 404, `${id.slice(0, 40)} -> ${r.status}`);
  }
  for (const k of ['nope', '..', 'shows.prev', 'site', 'videos', '%2e%2e', 'SHOWS', 'shows/x/y']) assert.equal((await post(`/edit/api/history/${k}/${e.id}`, { version: 'x' }, { cookie })).status, 404, k);
  assert.equal((await getJson(`/edit/api/history/shows`)).status, 200, 'the real route still works');
  assert.equal((await fetch(`${base}/edit/api/history/shows`, { method: 'DELETE', headers: { cookie, origin: base } })).status, 405);
  assert.equal((await fetch(`${base}/edit/api/history/shows`, { method: 'PUT', headers: { cookie, origin: base } })).status, 405);
});

test('signed out: 401 on both routes, whatever the kind or id; forged cookie too', async () => {
  const e = (await hist('shows'))[1];
  for (const c of [undefined, 'gl_edit=forged.value']) {
    const h = c ? { cookie: c } : {};
    assert.equal((await fetch(`${base}/edit/api/history/shows`, { headers: h })).status, 401);
    assert.equal((await fetch(`${base}/edit/api/history/nope`, { headers: h })).status, 401, 'no clue about which kinds exist');
    assert.equal((await post(`/edit/api/history/shows/${e.id}`, { version: 'x' }, h)).status, 401);
    assert.equal((await post('/edit/api/history/nope/..%2f', { version: 'x' }, h)).status, 401);
  }
});

test('cross-site: a wrong or missing Origin is 403, so is Sec-Fetch-Site: cross-site on the list; non-JSON is 415', async () => {
  const e = (await hist('shows'))[1], v = await ver('shows'), bytes = readFileSync(join(data, 'shows.json'), 'utf8');
  assert.equal((await post(`/edit/api/history/shows/${e.id}`, { version: v }, { cookie, origin: 'https://evil.example' })).status, 403);
  assert.equal((await post(`/edit/api/history/shows/${e.id}`, { version: v }, { cookie, origin: '' })).status, 403);
  assert.equal((await fetch(`${base}/edit/api/history/shows`, { headers: { cookie, 'sec-fetch-site': 'cross-site' } })).status, 403);
  assert.equal((await post(`/edit/api/history/shows/${e.id}`, `version=${v}`, { cookie, 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
  assert.equal((await post(`/edit/api/history/shows/${e.id}`, `version=${v}`, { cookie, 'content-type': 'text/plain' })).status, 415);
  assert.equal((await post(`/edit/api/history/shows/${e.id}`, 'not json', { cookie })).status, 400);
  assert.equal((await post(`/edit/api/history/shows/${e.id}`, JSON.stringify({ version: v, pad: 'x'.repeat(5000) }), { cookie })).status, 413);
  assert.equal(readFileSync(join(data, 'shows.json'), 'utf8'), bytes, 'nothing was written');
});

test('a go-back re-checks what was stored: a damaged file, bad rows, javascript: links are refused and nothing is written', async () => {
  _resetLimits();
  const bytes = () => readFileSync(join(data, 'shows.json'), 'utf8'), prev = () => readFileSync(join(data, 'shows.prev.json'), 'utf8');
  const b0 = bytes(), p0 = prev();
  const cases = {
    'not json': 'this is { not json',
    'no data': { at: new Date().toISOString() },
    'no time': { data: [row()] },
    'not a list': { at: new Date().toISOString(), data: { evil: true } },
    'javascript link': { at: new Date().toISOString(), data: [row({ link: 'javascript:alert(1)' })] },
    'bad date': { at: new Date().toISOString(), data: [row({ date: '2026-02-30' })] },
    'a string row': { at: new Date().toISOString(), data: ['<script>alert(1)</script>'] },
    'too many rows': { at: new Date().toISOString(), data: Array.from({ length: 201 }, () => row()) },
  };
  let n = 0;
  for (const [name, body] of Object.entries(cases)) {
    const id = `20200101T0000000${String(n++).padStart(2, '0')}Z-deadbeef`;
    plant('shows', body, id);
    const r = await go('shows', id);
    assert.equal(r.status, 422, name);
    assert.equal((await r.json()).error, 'bad_version', name);
    assert.equal(bytes(), b0, `${name}: shows.json untouched`);
    assert.equal(prev(), p0, `${name}: .prev untouched`);
  }
  const listed = await hist('shows');
  assert.ok(listed.every((x) => Number.isFinite(x.count)), 'a damaged file is not listed');
  assert.ok(!readdirSync(histDir('shows')).some((f) => f.endsWith('.tmp')));
  for (const f of readdirSync(histDir('shows')).filter((f) => f.startsWith('2020'))) rmSync(join(histDir('shows'), f));
});

test('injection stays inert through history: <script>, \' OR 1=1 -- and javascript: are data, never markup or a link', async () => {
  const evil = row({ venue: '<script>alert(1)</script>', city: "' OR 1=1 --", with: '"><img src=x onerror=alert(1)>' });
  assert.equal((await saveShows([evil])).status, 200);
  assert.equal((await saveShows([row({ venue: 'Clean' })])).status, 200);
  const e = await hist('shows');
  assert.ok(!JSON.stringify(e).includes('script') && !JSON.stringify(e).includes('OR 1=1'), 'the list never carries row text');
  const r = await go('shows', e.find((x) => x.count === 1 && !x.live).id);
  assert.equal(r.status, 200);
  const html = await (await fetch(`${base}/shows/`)).text();
  assert.ok(!html.includes('<script>alert(1)') && !html.includes('<img src=x') && html.includes('&lt;script&gt;'), 'escaped on the public page');
  assert.equal(live('shows.json')[0].city, "' OR 1=1 --", 'kept as text');
  assert.equal((await go('shows', FAKE.replace('2020', '2021'))).status, 404);
  plant('shows', { at: new Date().toISOString(), data: [row({ link: 'javascript:alert(1)' })] }, '20210101T000000000Z-aaaaaaaa');
  assert.equal((await go('shows', '20210101T000000000Z-aaaaaaaa')).status, 422);
  rmSync(join(histDir('shows'), '20210101T000000000Z-aaaaaaaa.json'));
});

test('IDENTITY and Bio: each has its own History; going back restores only that tab\'s fields and keeps the merge rule', async () => {
  _resetLimits();
  const seed = JSON.parse(readFileSync(seedOf('site.json'), 'utf8'));
  const id1 = { identity: { date: d(100), link: 'https://example.com/one' } }, id2 = { identity: { date: d(200), link: 'https://example.com/two' } };
  assert.equal((await saveSite(id1)).status, 200);
  assert.equal((await saveSite({ homeBio: 'Home one.', bio: 'Bio one.' })).status, 200);
  assert.equal((await saveSite(id2)).status, 200);
  assert.equal((await saveSite({ homeBio: 'Home two.', bio: 'Bio two.' })).status, 200);
  const ie = await hist('identity'), be = await hist('bio');
  assert.deepEqual(ie.map((x) => x.count), [undefined, undefined, undefined].slice(0, ie.length), 'no count on IDENTITY');
  assert.equal(ie.length, 3, 'the shipped one, id1, id2: Bio saves are not in IDENTITY\'s list');
  assert.equal(be.length, 3, 'the shipped one, Bio one, Bio two');
  // go back on IDENTITY to id1: Bio stays as it is
  const r = await go('identity', ie[1].id);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.deepEqual(b.site.identity, id1.identity);
  assert.equal(b.site.bio, 'Bio two.');
  assert.equal(b.site.homeBio, 'Home two.');
  assert.deepEqual(live('site.json').identity, id1.identity);
  assert.equal(live('site.json').bio, 'Bio two.');
  assert.deepEqual(Object.keys(live('site.json')).sort(), ['bio', 'homeBio', 'identity']);
  // go back on Bio to the shipped text: IDENTITY stays at id1
  const r2 = await go('bio', (await hist('bio'))[2].id);
  assert.equal(r2.status, 200);
  const s2 = live('site.json');
  assert.equal(s2.bio, seed.bio);
  assert.equal(s2.homeBio, seed.homeBio);
  assert.deepEqual(s2.identity, id1.identity);
  assert.equal((await hist('identity'))[0].at !== undefined, true);
  assert.equal((await hist('identity'))[0].id > ie[0].id, true, 'the IDENTITY restore is the newest IDENTITY entry');
});

test('a tampered Bio entry that also carries identity (or an IDENTITY entry that carries bio) changes only its own fields', async () => {
  _resetLimits();
  const before = live('site.json');
  plant('bio', { at: new Date().toISOString(), data: { homeBio: 'Planted home.', bio: 'Planted bio.', identity: { date: '2999-01-01', link: 'https://evil.example/' } } }, '20210202T000000000Z-bbbbbbbb');
  assert.equal((await go('bio', '20210202T000000000Z-bbbbbbbb')).status, 200);
  assert.equal(live('site.json').bio, 'Planted bio.');
  assert.deepEqual(live('site.json').identity, before.identity, 'identity untouched');
  plant('identity', { at: new Date().toISOString(), data: { identity: { date: d(300), link: 'https://example.com/planted' }, bio: 'EVIL BIO', homeBio: 'EVIL HOME' } }, '20210202T000000000Z-cccccccc');
  assert.equal((await go('identity', '20210202T000000000Z-cccccccc')).status, 200);
  assert.equal(live('site.json').bio, 'Planted bio.', 'bio untouched');
  assert.equal(live('site.json').identity.link, 'https://example.com/planted');
  // refused: an IDENTITY entry that fails the site check (date), a Bio entry with javascript text is only text but an empty bio is refused
  plant('identity', { at: new Date().toISOString(), data: { identity: { date: 'soon', link: 'javascript:alert(1)' } } }, '20210202T000000000Z-dddddddd');
  assert.equal((await go('identity', '20210202T000000000Z-dddddddd')).status, 422);
  plant('bio', { at: new Date().toISOString(), data: { homeBio: '', bio: '' } }, '20210202T000000000Z-eeeeeeee');
  assert.equal((await go('bio', '20210202T000000000Z-eeeeeeee')).status, 422);
  plant('bio', { at: new Date().toISOString(), data: { homeBio: 'x' } }, '20210202T000000000Z-ffffffff');
  assert.equal((await go('bio', '20210202T000000000Z-ffffffff')).status, 422, 'a half entry is refused, never merged');
  assert.equal(live('site.json').bio, 'Planted bio.');
  assert.ok(!existsSync(join(data, 'site.json.tmp')));
});

test('Releases: History never holds the IDENTITY row; a go-back keeps IDENTITY exactly as it is now', async () => {
  _resetLimits();
  const rel = (o = {}) => ({ title: 'New Song', type: 'single', date: '2026-01-01', link: 'https://example.com/new', artists: '', cover: null, ...o });
  const rv = async () => (await api('releases')).body;
  const saveRel = async (rows) => post('/edit/api/releases', { version: (await rv()).version, releases: rows }, { cookie });
  assert.equal((await saveRel([rel({ title: 'One' })])).status, 200);
  assert.equal((await saveRel([rel({ title: 'One' }), rel({ title: 'Two' })])).status, 200);
  const e = await hist('releases');
  assert.ok(!JSON.stringify(readdirSync(histDir('releases')).map((f) => readFileSync(join(histDir('releases'), f), 'utf8'))).includes('IDENTITY'));
  assert.equal(e[0].count, 2);
  const newDate = d(400);
  assert.equal((await saveSite({ identity: { date: newDate, link: 'https://example.com/id' } })).status, 200);
  const r = await go('releases', e[1].id);
  assert.equal(r.status, 200);
  const rows = (await rv()).releases;
  assert.deepEqual(rows.filter((x) => x.title !== 'IDENTITY').map((x) => x.title), ['One']);
  const idRow = JSON.stringify(rows.find((x) => x.title === 'IDENTITY'));
  assert.ok(idRow, 'the IDENTITY row is still in releases.json');
  plant('releases', { at: new Date().toISOString(), data: [rel({ title: 'Planted' }), { ...rel({ title: 'IDENTITY', date: '2999-01-01' }), link: 'https://evil.example/' }] }, '20210303T000000000Z-aaaaaaaa');
  assert.equal((await go('releases', '20210303T000000000Z-aaaaaaaa')).status, 200, 'an IDENTITY row inside an entry is dropped, not applied');
  const after = (await rv()).releases;
  assert.deepEqual(after.filter((x) => x.title !== 'IDENTITY').map((x) => x.title), ['Planted']);
  assert.equal(JSON.stringify(after.find((x) => x.title === 'IDENTITY')), idRow, 'IDENTITY is exactly as it was');
  plant('releases', { at: new Date().toISOString(), data: [rel({ title: 'identity' })] }, '20210303T000000000Z-bbbbbbbb');
  assert.equal((await go('releases', '20210303T000000000Z-bbbbbbbb')).status, 422, 'the reserved name in any case is refused');
});

test('a history that cannot be written never blocks a save; a history that cannot be read is a 500 with a code that is also in the log', async () => {
  const spy = mock.method(console, 'error', () => {});
  try {
    rmSync(histDir('products'), { recursive: true, force: true });
    writeFileSync(histDir('products'), 'in the way'); // a file where the folder should be
    const p = { id: 'tee', name: 'Tee two', type: 'shirt', price: 2500, image: '/media/shop/sample-tee.webp', status: 'coming-soon', order: 0 };
    assert.equal((await post('/edit/api/products', { version: await ver('products'), products: [p] }, { cookie })).status, 200, 'the save itself went through');
    assert.equal((await api('products')).body.products[0].name, 'Tee two');
    const r = await getJson('/edit/api/history/products');
    assert.equal(r.status, 500);
    assert.deepEqual(Object.keys(r.body).sort(), ['code', 'error']);
    assert.match(r.body.code, /^[A-HJ-NP-Z2-9]{6}$/);
    const lines = spy.mock.calls.map((c) => c.arguments.join(' '));
    assert.ok(lines.some((l) => l.includes(`[${r.body.code}]`)), 'the same code is in the log line');
    assert.ok(lines.some((l) => l.includes('history not kept for products')));
    const line = lines.find((l) => l.includes(`[${r.body.code}]`));
    assert.ok(!line.includes('gabes long password') && !line.includes(cookie) && !line.includes('SESSION'), 'no secret in the log');
  } finally { spy.mock.restore(); rmSync(histDir('products'), { force: true }); }
});

test('error codes: 6 characters, A-Z 2-9 without O I 0 1, different each time', () => {
  const codes = new Set(Array.from({ length: 300 }, errorCode));
  assert.ok(codes.size > 290);
  for (const c of codes) assert.match(c, /^[A-HJ-NP-Z2-9]{6}$/);
});

test('history stays OUT of backups: not in the download, not in makeBackup, and src/lib/backup.js knows nothing of it', async () => {
  const marker = 'OnlyInHistory-Venue-X7';
  assert.equal((await saveShows([row({ venue: marker })])).status, 200);
  assert.equal((await saveShows([row({ venue: 'Replaced it' })])).status, 200);
  assert.ok(readdirSync(histDir('shows')).some((f) => readFileSync(join(histDir('shows'), f), 'utf8').includes(marker)), 'it is in History');
  const r = await fetch(`${base}/edit/api/backup`, { headers: { cookie } });
  assert.equal(r.status, 200);
  const text = await r.text();
  assert.ok(!text.includes(marker) && !text.includes('history'), 'not in the downloaded file');
  const b = makeBackup(data, { shows: process.env.SHOWS_FILE, products: process.env.PRODUCTS_FILE, site: process.env.SITE_FILE, releases: process.env.RELEASES_FILE });
  assert.deepEqual(Object.keys(b).sort(), ['created', 'format', 'shows', 'site', 'products', 'releases', 'uploads', 'version'].sort());
  assert.ok(!JSON.stringify(b).includes(marker));
  assert.ok(!readFileSync(fileURLToPath(new URL('../src/lib/backup.js', import.meta.url)), 'utf8').includes('history'));
});

test('history.js on its own: cap, no duplicate of the newest, newest stays newest in the same millisecond, atomic (no temp files), bad kind throws', () => {
  const t = mkdtempSync(join(tmpdir(), 'gl-h2-'));
  const at = new Date('2026-11-23T16:12:00.123Z');
  for (let i = 0; i < 14; i++) recordHistory(t, 'shows', [{ i }], at); // the same millisecond every time
  const e = listHistory(t, 'shows');
  assert.equal(e.length, 10);
  assert.deepEqual(e.map((x) => x.data[0].i), [13, 12, 11, 10, 9, 8, 7, 6, 5, 4], 'in the order saved');
  assert.equal(recordHistory(t, 'shows', [{ i: 13 }]), null, 'saving the same thing twice adds nothing');
  assert.equal(listHistory(t, 'shows').length, 10);
  assert.ok(!readdirSync(join(t, 'history', 'shows')).some((f) => !/^\d{8}T\d{9}Z-[0-9a-f]{8}\.json$/.test(f)));
  assert.throws(() => recordHistory(t, '../x', []));
  assert.throws(() => recordHistory(t, 'site', []), 'site is not a history kind (identity and bio are)');
  assert.deepEqual(readEntry(t, 'shows', '../../etc/passwd'), { gone: true });
  assert.deepEqual(readEntry(t, 'nope', e[0].id), { gone: true });
  assert.ok(readEntry(t, 'shows', e[0].id).data);
  rmSync(t, { recursive: true });
});

test('Save pressed with nothing changed does not push real history out', async () => {
  const same = [row({ venue: 'Same again' })];
  assert.equal((await saveShows(same)).status, 200);
  const n = (await hist('shows')).map((x) => x.id);
  for (let i = 0; i < 12; i++) assert.equal((await saveShows(same)).status, 200);
  assert.deepEqual((await hist('shows')).map((x) => x.id), n);
});

test('rate limit: Go back is capped per editor (429), then lifts', async () => {
  _resetLimits();
  const e = (await hist('shows')).find((x) => !x.live);
  let last;
  for (let i = 0; i < 21; i++) last = await go('shows', e.id, 'stale-on-purpose');
  assert.equal(last.status, 429);
  assert.match((await last.json()).message, /Too many tries/);
  _resetLimits();
  assert.equal((await go('shows', e.id, 'stale-on-purpose')).status, 409);
});

// ---- the page: markup, and the client's draft handling (pure part of edit.js run on its own) ----
const src = (f) => readFileSync(fileURLToPath(new URL(`../${f}`, import.meta.url)), 'utf8');
const js = src('public/js/edit.js'), page = src('src/pages/edit/index.astro');

test('31f: every tab has a History fold (the Played fold look) before its save bar; no confirm(), no innerHTML', () => {
  for (const k of ['shows', 'releases', 'identity', 'bio', 'products']) {
    assert.match(page, new RegExp(`<details id="hist-${k}" class="ed-played ed-history"><summary class="ed-btn ed-plain">History</summary><div class="ed-hist"></div></details>\\s*<div class="ed-bar">`), k);
  }
  assert.ok(!/\bconfirm\(/.test(js) && !js.includes('innerHTML') && !js.includes('insertAdjacentHTML'));
  for (const t of ['Go back to this', 'Go back', 'Stay', 'Keep them', 'Throw away', 'Nothing to go back to yet. Each time you save, the old version is kept here.', 'Couldn’t load the history. Try again.',
    'What is on the site now stays in History, so you can undo this.', 'Your unsaved changes here will be lost.', 'That version isn’t there any more. Pick another.', 'Send this code to the person who runs the site: ',
    'This was saved from another screen or tab, so yours didn’t save. Your changes are kept.', 'Reload', 'Last saved: ', 'Unsaved changes waiting in ']) assert.ok(js.includes(t), t);
  assert.ok(!js.includes('Copy code') && !js.includes('clipboard'), 'amendment 8: the code is text, no Copy button');
  assert.ok(!js.includes('Someone else saved'), 'amendment 5 words only');
});

test('P2-5: a failed Save puts focus on the message and lists each bad row as a link', () => {
  assert.ok(js.includes('tabIndex = -1') && js.includes('.focus({ preventScroll: true })'));
  assert.match(js, /slot\(bar\(kind\), 'ul', 'ed-fix'\)/);
  assert.match(page, /\.ed-fix a \{ display: flex; align-items: center; min-height: 48px;/);
});

const drafts = js.match(/\/\/ <drafts>([\s\S]*?)\/\/ <\/drafts>/)?.[1];
const run = (store = new Map(), over = {}) => {
  const ls = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k), ...over };
  return { ...new Function('localStorage', `${drafts}; return { cleanDraft, readDraft, dropDraft, DRAFT };`)(ls), store };
};

test('drafts: bad JSON, wrong shape, a script in a field are ignored or cut down; bad ones are removed from storage', () => {
  assert.ok(drafts, 'the drafts block is in edit.js');
  const { readDraft, DRAFT, store } = run();
  const put = (k, v) => store.set(DRAFT(k), typeof v === 'string' ? v : JSON.stringify(v));
  for (const bad of ['{ not json', '[]', 'null', '"x"', '42', '{"v":2,"at":1,"data":[]}', '{"v":1,"at":"now","data":[]}', '{"v":1,"at":1,"data":"<script>"}', '{"v":1,"at":1,"data":[1,2]}', '{"v":1,"at":1,"data":[[]]}', '', 'x'.repeat(900000)]) {
    put('shows', bad);
    assert.equal(readDraft('shows'), null, bad.slice(0, 30));
    assert.equal(store.has(DRAFT('shows')), false, `removed: ${bad.slice(0, 30)}`);
  }
  assert.equal(readDraft('shows'), null, 'no draft is just null');
  put('shows', { v: 1, at: 5, base: null, data: Array.from({ length: 301 }, () => ({})) });
  assert.equal(readDraft('shows'), null, 'over 300 rows is not ours');
  put('bio', { v: 1, at: 5, base: null, data: [] });
  assert.equal(readDraft('bio'), null, 'a list where an object belongs');
  const evil = { v: 1, at: 123, base: '2026-11-23T00:00:00.000Z', data: [{ venue: '<script>alert(1)</script>', city: "' OR 1=1 --", link: 'javascript:alert(1)', date: 5, extra: '<img onerror=x>', __proto__: { x: 1 } }] };
  put('shows', evil);
  const got = readDraft('shows');
  assert.deepEqual(got.data, [{ venue: '<script>alert(1)</script>', city: "' OR 1=1 --", link: 'javascript:alert(1)' }], 'only known string fields; text is left as text; a number where a string belongs is dropped');
  assert.equal(got.at, 123);
  put('products', { v: 1, at: 1, base: null, data: [{ name: 'T', price: '25', order: 'x', sizes: ['S', 5, { a: 1 }], status: 'available' }] });
  assert.deepEqual(run(store).readDraft('products').data, [{ name: 'T', status: 'available', sizes: ['S'] }], 'a string price and order are dropped, sizes keep strings only');
  put('releases', { v: 1, at: 1, base: null, data: [{ title: 'R', remix: 'yes' }, { title: 'S', remix: true }] });
  assert.deepEqual(run(store).readDraft('releases').data, [{ title: 'R' }, { title: 'S', remix: true }]);
  put('identity', { v: 1, at: 1, base: null, data: { date: '2027-08-13', link: 'https://x.example/', bio: 'EVIL' } });
  assert.deepEqual(run(store).readDraft('identity').data, { date: '2027-08-13', link: 'https://x.example/' }, 'only IDENTITY\'s fields');
  assert.ok(!js.includes('eval(') && !js.includes('new Function'));
});

test('drafts: storage that throws (private window, blocked) is no problem', () => {
  const boom = () => { throw new Error('denied'); };
  const { readDraft, dropDraft } = run(new Map(), { getItem: boom, setItem: boom, removeItem: boom });
  assert.equal(readDraft('shows'), null);
  dropDraft('shows');
});

test('drafts: the base savedAt travels with the draft; the offer words and the wiring are in the client', () => {
  assert.match(js, /base: baseOf\(kind\), at, data: snapshot\(kind\)/);
  assert.ok(js.includes('This was saved again since. Keep yours or throw it away?') && js.includes('Keep them, or throw them away?') && js.includes('that were never saved.'));
  assert.match(js, /dropDraft\(kind\); t\.render\(b\[kind\]\)/, 'a successful Save clears that tab\'s draft');
  assert.match(js, /if \(r\.status === 409\) return stale\(kind\)/, 'a 409 keeps the changes as a draft');
  assert.match(js, /function stale\(kind\) \{\s*writeDraft\(kind\);/);
});

test('drafts keep every field the validators keep: a full valid row of each kind survives cleanDraft unchanged', async () => {
  const { cleanDraft } = run();
  const { checkShows } = await import('../src/lib/store.js'), { checkReleases } = await import('../src/lib/releases.js'), { checkProducts } = await import('../src/lib/products.js');
  const show = { date: '2027-03-04', time: '19:30', type: 'show', venue: 'The Venue', city: 'Doylestown, PA', address: '12 Main St', with: 'Fran Carroll', link: 'https://example.com/t', cost: '$10' };
  const release = { title: 'New Song', type: 'album', remix: true, date: '2027-01-01', link: 'https://example.com/r', artists: 'GLucak, J-BOY', cover: `/media/uploads/${'ab'.repeat(16)}.webp` };
  const product = { id: 'real-tee', name: 'Real tee', type: 'shirt', price: 2500, image: `/media/uploads/${'cd'.repeat(16)}.webp`, description: 'Soft.', link: 'https://shop.example/tee', status: 'available', sizes: ['S', 'M', 'L'], order: 3 };
  for (const [kind, row, check] of [['shows', show, checkShows], ['releases', release, (l) => checkReleases(l)], ['products', product, checkProducts]]) {
    assert.deepEqual(check([row]).rows, [row], `${kind}: the row is valid as written`);
    const kept = cleanDraft(kind, { v: 1, at: 1, base: null, data: [row] }).data;
    assert.deepEqual(kept, [row], `${kind}: nothing dropped`);
  }
  const site = { identity: { date: '2027-08-13', link: 'https://x.example/' }, bio: { homeBio: 'Home.', bio: 'Bio.\n\nMore.' } };
  assert.deepEqual(cleanDraft('identity', { v: 1, at: 1, base: null, data: site.identity }).data, site.identity);
  assert.deepEqual(cleanDraft('bio', { v: 1, at: 1, base: null, data: site.bio }).data, site.bio);
  const long = 'x'.repeat(4000);
  assert.equal(cleanDraft('bio', { v: 1, at: 1, base: null, data: { homeBio: 'h', bio: long } }).data.bio.length, 4000, 'the longest bio the server takes fits');
});

test('go back and Save never overlap; a second browser tab\'s newer draft is not overwritten', () => {
  assert.ok(js.includes("if (saving[kind] || siteSaving[kind]) return say(h.msg,"));
  assert.ok(js.includes('for (const c of still) c.inert = true;') && js.includes('for (const c of still) c.inert = false; }'));
  assert.ok(js.includes('if (saving[kind]) return; // no second save while one is on its way\n    if (H[kind]?.busy) return;'));
  assert.ok(js.includes('if (siteSaving[kind] || H[kind]?.busy) return;'));
  assert.ok(js.includes('stored.at > (wrote[kind] ?? loadedAt)'));
});
