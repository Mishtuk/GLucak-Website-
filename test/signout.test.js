// Sign-out ends the session on the server: a copied cookie dies, a fresh sign-in works, the state survives a restart,
// and a corrupt signouts.json never stops the server.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashPassword, signSession, verifySession, SESSION_DAYS } from '../src/lib/auth.js';
import { readSignouts } from '../src/lib/store.js';

const dir = mkdtempSync(join(tmpdir(), 'gl-so-'));
const data = join(dir, 'data');
mkdirSync(join(dir, 'edit'));
writeFileSync(join(dir, 'edit/index.html'), '<!doctype html><title>Edit</title>');
writeFileSync(join(dir, 'shipped.json'), '[]');
const H = hashPassword('gabes long password');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped.json'), SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `gabe:${H}` });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());
const post = (path, body, cookie) => fetch(`${base}${path}`, { method: 'POST', headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', ...(cookie && { cookie }) }, body: JSON.stringify(body ?? {}) });
const signIn = async () => (await post('/edit/login', { username: 'gabe', password: 'gabes long password' })).headers.get('set-cookie').split(';')[0];
const works = async (cookie) => (await fetch(`${base}/edit/api/shows`, { headers: { cookie } })).status === 200;

test('a cookie copied before sign-out is refused after it; a new sign-in works', async () => {
  const copied = await signIn();
  assert.ok(await works(copied));
  assert.equal((await post('/edit/logout', {}, copied)).status, 200);
  assert.ok(!(await works(copied)), 'copied cookie is dead');
  const fresh = await signIn();
  assert.ok(await works(fresh), 'signing in again works');
  assert.ok(!(await works(copied)));
});

test('the sign-out time is saved and read back after a restart', () => {
  const saved = JSON.parse(readFileSync(join(data, 'signouts.json'), 'utf8'));
  assert.ok(Number.isFinite(saved.gabe));
  const reloaded = readSignouts(data); // what a fresh server start loads
  const users = new Map([['gabe', H]]);
  const old = signSession('gabe', saved.gabe - 1000 + SESSION_DAYS * 864e5, 'k'.repeat(40), H);
  const next = signSession('gabe', saved.gabe + 1000 + SESSION_DAYS * 864e5, 'k'.repeat(40), H);
  assert.equal(verifySession(old, 'k'.repeat(40), users, saved.gabe, reloaded), null);
  assert.equal(verifySession(next, 'k'.repeat(40), users, saved.gabe, reloaded), 'gabe');
});

test('missing or corrupt signouts.json signs nobody out and does not crash', () => {
  assert.equal(readSignouts(join(dir, 'nope')).size, 0);
  const bad = join(dir, 'bad'); mkdirSync(bad);
  for (const junk of ['{not json', 'null', '[1,2]', '{"gabe":"x"}', '']) {
    writeFileSync(join(bad, 'signouts.json'), junk);
    assert.equal(readSignouts(bad).size, 0, junk);
  }
});

test('server with a corrupt signouts.json in DATA_DIR starts fresh and still signs out', async () => {
  writeFileSync(join(data, 'signouts.json'), '{corrupt');
  const c = await signIn();
  assert.ok(await works(c));
  assert.equal((await post('/edit/logout', {}, c)).status, 200);
  assert.ok(!(await works(c)));
});
