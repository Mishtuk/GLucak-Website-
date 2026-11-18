// OV4a: the Bio and IDENTITY tabs. site.json saves live (no rebuild): validation, injection, auth, Origin, 409, backup, fallback.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../src/lib/auth.js';
import { checkSite, fillSite, identityHtml } from '../src/lib/site.js';
import { checkBackup, makeBackup, writeBackup } from '../src/lib/backup.js';

const SEED = fileURLToPath(new URL('../src/data/site.json', import.meta.url));
const seed = JSON.parse(readFileSync(SEED, 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'gl-site-'));
const data = join(dir, 'data');
for (const p of ['about', 'music', 'edit']) mkdirSync(join(dir, p));
writeFileSync(join(dir, 'about/index.html'), '<!doctype html><title>t</title><div class="bio"><!--gl:bio--><p>built bio</p><!--/gl:bio--></div>');
writeFileSync(join(dir, 'music/index.html'), '<!doctype html><title>t</title><div><!--gl:identity--><p>built identity</p><!--/gl:identity--></div><p><!--gl:home-bio-->built home<!--/gl:home-bio--></p>');
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>e</title>');
writeFileSync(join(dir, 'shipped.json'), '[]');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped.json'), PRODUCTS_FILE: join(dir, 'shipped.json'), SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `gabe:${hashPassword('gabes long password')}` });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base, cookie;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST', redirect: 'manual',
  headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const get = async (p) => (await fetch(`${base}${p}`)).text();
const site = async () => (await (await fetch(`${base}/edit/api/site`, { headers: { cookie } })).json());
const save = async (part, v) => post('/edit/api/site', { version: v === undefined ? (await site()).version : v, site: part }, { cookie });
const future = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

test('fallback: no site.json -> the shipped seed is what is served and what the editor loads', async () => {
  assert.ok(!existsSync(join(data, 'site.json')));
  const about = await get('/about/');
  assert.ok(!about.includes('built bio') && about.includes('Reforged and ready'), 'markers are filled from the seed');
  assert.ok((await get('/music/')).includes('Pre-save'));
  const r = await post('/edit/login', { username: 'gabe', password: 'gabes long password' });
  cookie = r.headers.get('set-cookie').split(';')[0];
  assert.deepEqual((await site()).site, seed);
});

test('auth: no cookie is 401, a forged cookie is 401, a wrong or missing Origin is 403, non-JSON is 415', async () => {
  assert.equal((await fetch(`${base}/edit/api/site`)).status, 401);
  assert.equal((await post('/edit/api/site', { site: {} })).status, 401);
  assert.equal((await post('/edit/api/site', { site: {} }, { cookie: 'gl_edit=forged.value' })).status, 401);
  const body = { version: (await site()).version, site: { bio: 'x' } };
  assert.equal((await post('/edit/api/site', body, { cookie, origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('/edit/api/site', body, { cookie, origin: '' })).status, 403);
  assert.equal((await fetch(`${base}/edit/api/site`, { headers: { cookie, 'sec-fetch-site': 'cross-site' } })).status, 403);
  assert.equal((await post('/edit/api/site', 'bio=x', { cookie, 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
  assert.deepEqual((await site()).site, seed, 'nothing was saved');
});

test('validation: too long, javascript: and other schemes, bad date, control characters, empty', () => {
  const bad = (part, re) => { const r = checkSite(part, seed); assert.ok(r.errors, JSON.stringify(part).slice(0, 80)); assert.match(r.errors[0].message, re); };
  bad({ homeBio: 'x'.repeat(401) }, /too long/);
  bad({ bio: 'x'.repeat(4001) }, /too long/);
  bad({ homeBio: 'one\ntwo' }, /one line/);
  bad({ homeBio: '' }, /Add the Home/);
  bad({ bio: 'a\x00b' }, /character/);
  bad({ bio: 'a\x1bb' }, /character/);
  bad({ homeBio: 'a b' }, /character/);
  bad({ identity: { date: '2027-02-30', link: seed.identity.link } }, /real release date/);
  bad({ identity: { date: 'soon', link: seed.identity.link } }, /real release date/);
  bad({ identity: { date: '2027-08-13', link: 'javascript:alert(1)' } }, /https/);
  bad({ identity: { date: '2027-08-13', link: ' JaVaScRiPt:alert(1)' } }, /https/);
  bad({ identity: { date: '2027-08-13', link: 'http://insecure.example' } }, /https/);
  bad({ identity: { date: '2027-08-13', link: 'data:text/html,<script>' } }, /https/);
  bad({ identity: { date: '2027-08-13', link: 'https://x.example/a b' } }, /https/);
  bad({ identity: { date: '2027-08-13', link: `https://x.example/${'a'.repeat(300)}` } }, /too long/);
  bad({ identity: { date: '2027-08-13' } }, /https/);
  bad({ bio: 5 }, /Add the About/);
  assert.ok(checkSite(null).errors && checkSite([]).errors);
  const ok = checkSite({ bio: 'a\r\n\r\nb ', extra: 'dropped' }, seed);
  assert.equal(ok.rows.bio, 'a\n\nb');
  assert.deepEqual(Object.keys(ok.rows), ['homeBio', 'bio', 'identity']);
});

test('saves are live: Bio then IDENTITY on the version from each reply (no 409 on his own save), no rebuild', async () => {
  const a = await save({ homeBio: 'Home line, new.', bio: 'First para.\n\nSecond para, the lead.\n\nThird' });
  assert.equal(a.status, 200);
  const ab = await a.json();
  assert.match(ab.message, /on the site now/);
  assert.ok((await get('/about/')).includes('<p>First para.</p><p class="bio-lead">Second para, the lead.</p><p>Third</p>'));
  assert.ok((await get('/music/')).includes('Home line, new.'));
  const b = await save({ identity: { date: future(10), link: 'https://example.com/pre' } }, ab.version);
  assert.equal(b.status, 200, 'the IDENTITY tab saves on the Bio tab’s version');
  const m = await get('/music/');
  assert.ok(m.includes('10 days to go') && m.includes('href="https://example.com/pre"') && m.includes('>Pre-save<'));
  assert.ok((await get('/about/')).includes('First para.'), 'the IDENTITY save kept the bio');
  assert.ok(existsSync(join(data, 'site.prev.json')), 'the last good file is kept');
  const c = await save({ identity: { date: future(-1), link: 'https://example.com/out' } }, (await b.json()).version);
  assert.equal(c.status, 200);
  const out = await get('/music/');
  assert.ok(out.includes('Out now.') && out.includes('>Listen<') && !out.includes('Pre-save'));
});

test('stale save is 409 and changes nothing', async () => {
  const v = (await site()).version;
  assert.equal((await save({ homeBio: 'Newer.' }, v)).status, 200);
  const stale = await save({ homeBio: 'Older, from another tab.' }, v);
  assert.equal(stale.status, 409);
  assert.match((await stale.json()).message, /^Someone else saved the site just now/);
  assert.equal((await site()).site.homeBio, 'Newer.');
  assert.equal((await save({ homeBio: 'No version.' }, null)).status, 409, 'a missing version is stale too');
});

test('a refused save is 400 with plain messages and writes nothing; the size cap is 413', async () => {
  const before = await site();
  const r = await save({ identity: { date: '2027-08-13', link: 'javascript:alert(1)' } });
  assert.equal(r.status, 400);
  assert.match((await r.json()).errors[0].message, /https:\/\//);
  assert.equal((await post('/edit/api/site', '{nope', { cookie })).status, 400);
  assert.equal((await save({ bio: 'x'.repeat(5000) })).status, 400);
  assert.equal((await post('/edit/api/site', JSON.stringify({ version: 'x', site: { bio: 'y'.repeat(40000) } }), { cookie })).status, 413);
  assert.deepEqual(await site(), before);
});

test('injection renders inert on the public pages, field by field', async () => {
  const evil = ['<script>alert(1)</script>', '" onmouseover="alert(1)', "' OR 1=1 --", '</p><img src=x onerror=alert(1)>', '<!--/gl:bio--><b>x</b>'];
  for (const t of evil) {
    const r = await save({ homeBio: t, bio: `${t}\n\n${t}\n\n${t}` });
    assert.equal(r.status, 200, t);
    for (const page of ['/about/', '/music/']) {
      const h = await get(page);
      assert.ok(!h.includes('<script>alert') && !h.includes('<img src=x') && !h.includes('<b>x</b>') && !/<[^>]* onmouseover=/.test(h), `${page}: ${t}`);
    }
  }
  const about = await get('/about/');
  assert.ok(about.includes('&lt;b&gt;x&lt;/b&gt;') && !about.includes('built bio'));
  // the link field: a quote inside a valid https URL cannot break out of href
  assert.equal((await save({ identity: { date: future(5), link: 'https://x.example/?a="onmouseover="alert(1)' } })).status, 200);
  const m = await get('/music/');
  assert.ok(m.includes('href="https://x.example/?a=&quot;onmouseover=&quot;alert(1)"'));
  assert.ok(!/<[^>]* onmouseover=/.test(m));
});

test('days to go are computed per request, not at build', () => {
  const s = { ...seed, identity: { date: '2027-08-13', link: 'https://x.example/i' } };
  assert.match(identityHtml(s, '2027-08-12'), /1 day to go/);
  assert.match(identityHtml(s, '2027-08-10'), /3 days to go/);
  assert.match(identityHtml(s, '2027-08-13'), /Out now/);
  assert.match(fillSite('<!--gl:identity--><!--/gl:identity-->', s, '2027-08-03'), /10 days to go/);
  assert.equal(fillSite('<p>x</p>', { bio: '' }), '<p>x</p>', 'an invalid site leaves the page as built');
});

test('backup includes site.json; restore validates it', async () => {
  const fb = { shows: join(dir, 'shipped.json'), products: join(dir, 'shipped.json'), site: SEED, releases: join(import.meta.dirname, '../src/data/releases.json') };
  const live = JSON.parse(readFileSync(join(data, 'site.json'), 'utf8'));
  const dl = await (await fetch(`${base}/edit/api/backup`, { headers: { cookie } })).json();
  assert.deepEqual(dl.site, live);
  const file = (o) => JSON.stringify({ format: 'glucak-backup', version: 1, shows: [], products: [], uploads: {}, ...o });
  const good = await checkBackup(file({ site: seed }), data);
  assert.deepEqual(good.site, seed);
  for (const bad of [{ ...seed, identity: { date: seed.identity.date, link: 'javascript:alert(1)' } }, { ...seed, identity: { date: 'nope', link: seed.identity.link } },
    { ...seed, bio: 'x'.repeat(4001) }, { bio: 'only a bio' }, 'text', null]) {
    assert.ok((await checkBackup(file({ site: bad }), data)).errors, JSON.stringify(bad).slice(0, 60));
  }
  assert.equal((await checkBackup(file({}), data)).site, undefined, 'an older backup without a site keeps the saved one');
  const p = mkdtempSync(join(tmpdir(), 'gl-site-restore-'));
  writeBackup(p, { shows: [], products: [], uploads: new Map(), site: good.site }, fb);
  assert.deepEqual(JSON.parse(readFileSync(join(p, 'site.json'), 'utf8')), seed);
  assert.deepEqual(makeBackup(p, fb).site, seed);
});
