// Gabe's edit screen over real HTTP: sign-in, Origin check, 401s, saving, validation, injection, size cap, atomic write.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashPassword } from '../src/lib/auth.js';

const dir = mkdtempSync(join(tmpdir(), 'gl-edit-'));
const data = join(dir, 'data');
mkdirSync(join(dir, 'shows'));
mkdirSync(join(dir, 'edit'));
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>Edit shows</title>');
writeFileSync(join(dir, 'shows/index.html'), '<!doctype html><title>t</title><ul><!--gl:shows--></ul>');
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
writeFileSync(join(dir, 'shipped.json'), JSON.stringify([{ date: d(10), type: 'show', venue: 'Shipped Venue', city: 'PA' }]));
Object.assign(process.env, {
  DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped.json'), SESSION_SECRET: 's'.repeat(48),
  EDITOR_USERS: `gabe:${hashPassword('gabes long password')},alex:${hashPassword('alexs long password')}`,
});
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base, origin;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = origin = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST', redirect: 'manual',
  headers: { origin, 'content-type': 'application/json', accept: 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const page = async () => (await fetch(`${base}/shows/`)).text();
let cookie;
const signIn = async (username = 'alex', password = 'alexs long password') => {
  const r = await post('/edit/login', { username, password });
  if (r.ok) cookie = r.headers.get('set-cookie').split(';')[0];
  return r;
};
const version = async () => (await (await fetch(`${base}/edit/api/shows`, { headers: { cookie } })).json()).version;
const save = async (shows, headers = {}, v) => post('/edit/api/shows', { version: v === undefined ? await version() : v, shows }, { cookie, ...headers });
// Pretend to be behind the host's proxy, coming from `ip` (the rightmost X-Forwarded-For entry is the one that counts).
const proxied = async (ip, fn) => { process.env.TRUST_PROXY = '1'; try { return await fn({ 'x-forwarded-for': `6.6.6.6, ${ip}:4321` }); } finally { delete process.env.TRUST_PROXY; } };
const row = (o = {}) => ({ date: d(5), time: '', type: 'show', venue: 'The Venue', city: 'Doylestown, PA', with: '', link: '', ...o });

test('not signed in: API is 401, public page shows the shipped list', async () => {
  assert.equal((await fetch(`${base}/edit/api/shows`)).status, 401);
  assert.equal((await post('/edit/api/shows', { shows: [row()] })).status, 401);
  assert.equal((await post('/edit/logout', {})).status, 401);
  assert.equal((await fetch(`${base}/edit/api/shows`, { headers: { cookie: 'gl_edit=forged.value' } })).status, 401);
  assert.ok((await page()).includes('Shipped Venue'));
});

test('sign in: cookie is HttpOnly, SameSite=Strict, Path=/edit; wrong password is 401', async () => {
  assert.equal((await signIn('alex', 'wrong password!')).status, 401);
  assert.equal((await signIn('nobody', 'alexs long password')).status, 401);
  const r = await signIn();
  assert.equal(r.status, 200);
  const sc = r.headers.get('set-cookie');
  assert.match(sc, /^gl_edit=[\w-]+\.[\w-]+; Path=\/edit; HttpOnly; SameSite=Strict; Max-Age=\d+$/, 'no Secure over plain http');
  assert.equal(r.headers.get('strict-transport-security'), null, 'no HSTS over plain http');
  const me = await (await fetch(`${base}/edit/api/shows`, { headers: { cookie } })).json();
  assert.equal(me.editor, 'alex');
  assert.equal(me.shows[0].venue, 'Shipped Venue', 'falls back to the shipped list');
});

test('same-origin: cross-site or missing Origin is refused on every POST', async () => {
  for (const path of ['/edit/login', '/edit/logout', '/edit/api/shows']) {
    assert.equal((await post(path, { shows: [row()] }, { cookie, origin: 'https://evil.example' })).status, 403, path);
    const r = await fetch(`${base}${path}`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 403, `${path} without Origin`);
  }
  assert.equal((await post('/edit/api/shows', 'shows=x', { cookie, 'content-type': 'application/x-www-form-urlencoded' })).status, 415, 'JSON only');
});

test('valid save: on the public page at the next request, old list kept as .prev, no temp files left', async () => {
  const r = await save([row({ venue: 'Brand New Venue', time: '19:30', with: 'Fran Carroll', link: 'https://example.com/t' })]);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.message, "Saved. It's on the site now.");
  assert.deepEqual(b.shows[0], { date: d(5), time: '19:30', type: 'show', venue: 'Brand New Venue', city: 'Doylestown, PA', with: 'Fran Carroll', link: 'https://example.com/t' });
  const html = await page();
  assert.ok(html.includes('Brand New Venue') && html.includes('With Fran Carroll') && !html.includes('Shipped Venue'));
  assert.ok(JSON.parse(readFileSync(join(data, 'shows.prev.json'), 'utf8'))[0].venue === 'Shipped Venue', 'prev = the shipped list');
  assert.equal((await save([row({ venue: 'Second Save' })])).status, 200);
  assert.equal(JSON.parse(readFileSync(join(data, 'shows.prev.json'), 'utf8'))[0].venue, 'Brand New Venue', 'prev = the last saved list');
  assert.deepEqual(readdirSync(data).sort(), ['shows.json', 'shows.prev.json']);
  const stored = JSON.parse(readFileSync(join(data, 'shows.json'), 'utf8'));
  assert.deepEqual(Object.keys(stored[0]), ['date', 'type', 'venue', 'city'], 'empty optional fields dropped');
});

test('invalid rows: whole save rejected, one plain message per bad row, nothing written', async () => {
  const before = readFileSync(join(data, 'shows.json'), 'utf8');
  const r = await save([row(), row({ date: '2026-02-30' }), row({ link: 'javascript:alert(1)' }), row({ venue: '  ' }), row({ type: 'party' }), row({ time: '25:00' }), 'junk']);
  assert.equal(r.status, 400);
  const { errors } = await r.json();
  assert.deepEqual(errors.map((e) => e.row), [1, 2, 3, 4, 5, 6]);
  assert.match(errors[0].message, /^Show 2: Pick a real date/);
  assert.match(errors[1].message, /^Show 3: The link has to start with https:\/\//);
  assert.equal(readFileSync(join(data, 'shows.json'), 'utf8'), before, 'nothing saved');
  assert.equal((await save(Array.from({ length: 201 }, () => row()))).status, 400, 'more than 200 shows');
  assert.equal((await save([row({ venue: 'x'.repeat(301) })])).status, 400, 'field too long');
  assert.equal((await post('/edit/api/shows', '{not json', { cookie })).status, 400);
});

test('injection: <script> and SQL text are stored as plain text and rendered escaped', async () => {
  const evil = row({ venue: '<script>alert(1)</script>', city: "' OR 1=1 --", with: '"><img src=x onerror=alert(1)>', link: 'https://x.com/?a="><script>' });
  assert.equal((await save([evil])).status, 200);
  const stored = JSON.parse(readFileSync(join(data, 'shows.json'), 'utf8'))[0];
  assert.equal(stored.venue, '<script>alert(1)</script>');
  assert.equal(stored.city, "' OR 1=1 --");
  const html = await page();
  assert.ok(!html.includes('<script>') && !html.includes('<img'), 'no live markup');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && html.includes('&#39; OR 1=1 --') && html.includes('&quot;&gt;&lt;img'));
  const api = await (await fetch(`${base}/edit/api/shows`, { headers: { cookie } })).json();
  assert.equal(api.shows[0].city, "' OR 1=1 --", 'the editor gets the exact text back');
});

test('body over 32 KB is 413 and nothing is written', async () => {
  const before = readFileSync(join(data, 'shows.json'), 'utf8');
  const r = await save([row({ venue: 'x'.repeat(33 * 1024) })]);
  assert.equal(r.status, 413);
  assert.equal(readFileSync(join(data, 'shows.json'), 'utf8'), before);
  assert.equal((await post('/edit/login', { username: 'x'.repeat(40 * 1024) })).status, 413);
});

test('lockout: 5 wrong passwords lock that name for 15 minutes, even with the right one', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await signIn('gabe', `wrong guess ${i}`)).status, 401);
  const r = await signIn('gabe', 'gabes long password');
  assert.equal(r.status, 429);
  assert.match((await r.json()).message, /Wait 15 minutes/);
  // the lock is per name + IP: a stranger's bad guesses don't lock Gabe out from his own IP
  const other = await proxied('203.0.113.7', (h) => post('/edit/login', { username: 'gabe', password: 'gabes long password' }, h));
  assert.equal(other.status, 200, 'same name, other IP');
});

test('rate limit: the 11th sign-in try from one IP in 15 minutes is 429', async () => {
  // earlier tests made 9 tries from 127.0.0.1 (3 in sign in, 6 in lockout); refused posts (Origin, 413) don't count
  assert.equal((await signIn()).status, 200, '10th try');
  assert.equal((await signIn()).status, 429, '11th try, right password');
});

test('save conflict: a save based on an older list is 409, nothing written, the newer save kept', async () => {
  const v1 = await version();
  assert.match(v1, /^[0-9a-f]{16}$/);
  const first = await save([row({ venue: 'Tab One' })], {}, v1);
  assert.equal(first.status, 200);
  const v2 = (await first.json()).version;
  assert.notEqual(v2, v1);
  const stale = await save([row({ venue: 'Tab Two' })], {}, v1);
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).message, "Someone else saved the shows just now, so yours didn't save. Reloading shows their changes but clears yours, so write down what you changed first.");
  assert.equal((await save([row({ venue: 'Tab Two' })], {}, null)).status, 409, 'no version sent');
  assert.equal(JSON.parse(readFileSync(join(data, 'shows.json'), 'utf8'))[0].venue, 'Tab One');
  assert.equal((await save([row({ venue: 'Tab Two' })], {}, v2)).status, 200, 'with the new version it saves');
});

test('sign out clears the cookie; the edit page path is never cached', async () => {
  const r = await post('/edit/logout', {}, { cookie });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('set-cookie'), /^gl_edit=; Path=\/edit; .*Max-Age=0/);
  assert.equal((await fetch(`${base}/edit/api/shows`, { headers: { cookie } })).headers.get('cache-control'), 'no-store');
  const shell = await fetch(`${base}/edit/`);
  assert.equal(shell.headers.get('cache-control'), 'no-store');
  assert.equal(shell.headers.get('x-robots-tag'), 'noindex');
});

test('Secure cookie behind an https proxy (X-Forwarded-Proto with TRUST_PROXY=1), plus HSTS', async () => {
  const r = await proxied('203.0.113.8', (h) => post('/edit/login', { username: 'alex', password: 'alexs long password' }, { ...h, 'x-forwarded-proto': 'https' }));
  assert.equal(r.status, 200);
  assert.match(r.headers.get('set-cookie'), /; Secure$/);
  assert.equal(r.headers.get('strict-transport-security'), 'max-age=31536000');
});

test('injection on the login form (JSON and form-encoded): a plain 401 that echoes nothing back', async () => {
  let n = 0;
  for (const evil of ['<script>alert(1)</script>', "' OR 1=1 --"]) {
    for (const [username, password] of [[evil, 'whatever password'], ['gabe', evil]]) {
      for (const form of [false, true]) {
        const body = form ? new URLSearchParams({ username, password }).toString() : { username, password };
        const r = await proxied(`198.51.100.${++n}`, (h) => post('/edit/login', body, form ? { ...h, 'content-type': 'application/x-www-form-urlencoded' } : h));
        const text = await r.text();
        assert.equal(r.status, 401, `${evil} form=${form}`);
        assert.equal(r.headers.get('set-cookie'), null);
        assert.ok(!text.includes(evil) && !text.includes('<script') && !text.includes('OR 1=1'), text);
        assert.equal(JSON.parse(text).error, 'wrong');
      }
    }
  }
});

// Last: it uses up the global sign-in budget for the rest of this minute.
test('global cap: rotating IPs still hit 30 sign-in tries a minute', async () => {
  const statuses = [];
  for (let i = 1; i <= 31; i++) statuses.push((await proxied(`192.0.2.${i}`, (h) => post('/edit/login', { username: 'alex', password: 'wrong guess' }, h))).status);
  assert.ok(statuses.includes(429), 'capped even though every try came from a new IP');
  assert.ok(statuses.slice(statuses.indexOf(429)).every((s) => s === 429), 'stays capped');
});
