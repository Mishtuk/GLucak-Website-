// Look-around mode (owner 2026-11-24): with EDIT_READONLY=1 an editor can sign in and read every tab, but every
// write route answers 403 'readonly' and nothing lands in DATA_DIR. Over real HTTP against server.js with a temp DATA_DIR.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../src/lib/auth.js';

const seedOf = (f) => fileURLToPath(new URL(`../src/data/${f}`, import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'gl-ro-'));
const data = join(dir, 'data');
for (const p of ['shows', 'edit']) mkdirSync(join(dir, p));
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>e</title>');
writeFileSync(join(dir, 'shows/index.html'), '<!doctype html><title>t</title><ul><!--gl:shows--></ul>');
writeFileSync(join(dir, 'shipped-shows.json'), '[]');
writeFileSync(join(dir, 'shipped-products.json'), '[]');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped-shows.json'), PRODUCTS_FILE: join(dir, 'shipped-products.json'),
  SITE_FILE: seedOf('site.json'), RELEASES_FILE: seedOf('releases.json'), SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `gabe:${hashPassword('gabes long password')}`,
  EDIT_READONLY: '1' });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base, cookie;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => { server.close(); delete process.env.EDIT_READONLY; });

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST', redirect: 'manual',
  headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', ...headers }, body: JSON.stringify(body) });
const written = () => (existsSync(data) ? readdirSync(data, { recursive: true }).filter((f) => !String(f).startsWith('signouts')) : []);

test('sign in still works in look-around mode', async () => {
  const r = await post('/edit/login', { username: 'gabe', password: 'gabes long password' });
  assert.equal(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];
});

test('every tab reads', async () => {
  for (const k of ['shows', 'site', 'products', 'releases', 'videos']) {
    const r = await fetch(`${base}/edit/api/${k}`, { headers: { cookie } });
    assert.equal(r.status, 200, k);
  }
});

test('saves, go-back and uploads answer 403 readonly with a plain message, and nothing is written', async () => {
  const v = (await (await fetch(`${base}/edit/api/shows`, { headers: { cookie } })).json()).version;
  const tries = [
    ['/edit/api/shows', { version: v, shows: [{ date: '2030-01-01', type: 'show', venue: 'X', city: 'Y' }] }],
    ['/edit/api/site', { version: 'x', site: {} }],
    ['/edit/api/videos', { version: 'x', videos: [] }],
    ['/edit/api/history/shows/20200101T000000000Z-deadbeef', { version: 'x' }],
    ['/edit/api/upload', {}],
  ];
  for (const [path, body] of tries) {
    const r = await post(path, body, { cookie });
    const b = await r.json();
    assert.equal(r.status, 403, path);
    assert.equal(b.error, 'readonly', path);
    assert.match(b.message, /nothing is saved/);
    assert.equal(b.errors[0].message, b.message, `${path}: the tabs show errors[0].message`);
  }
  assert.deepEqual(written(), [], 'DATA_DIR holds no saved file');
});
