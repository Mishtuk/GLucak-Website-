// POST /api/signup over real HTTP against `node server.js` in its own process: a body that is valid JSON but not an
// object (null, [], "x", 5) must answer 400 and leave the site up (security review S1), and hostile text stays inert.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'gl-su-'));
mkdirSync(join(dir, 'dist'));
writeFileSync(join(dir, 'dist/index.html'), '<!doctype html><title>t</title><main>home</main>');
writeFileSync(join(dir, 'shows.json'), '[]');

const freePort = () => new Promise((resolve, reject) => {
  const s = createServer().once('error', reject).listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
});

let child, base, exited = false, n = 0;
before(async () => {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  const env = { ...process.env, PORT: String(port), DATA_DIR: join(dir, 'data'), DIST_DIR: join(dir, 'dist'), SHOWS_FILE: join(dir, 'shows.json'),
    RELEASES_FILE: join(dir, 'none.json'), TRUST_PROXY: '1', NODE_ENV: 'test' }; // TRUST_PROXY: a fresh X-Forwarded-For per post keeps clear of the 5-per-10-minutes limit
  delete env.KIT_API_KEY; delete env.KIT_FORM_ID; // never reach the real Kit API from a test
  child = spawn(process.execPath, [fileURLToPath(new URL('../server.js', import.meta.url))], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.on('exit', () => { exited = true; });
  child.stderr.resume();
  await new Promise((resolve, reject) => {
    child.once('exit', () => reject(new Error('server exited before it listened')));
    child.stdout.on('data', (d) => { if (String(d).includes('GLucak site on')) resolve(); });
  });
});
after(() => child?.kill());

const post = (body, headers = {}) => fetch(`${base}/api/signup`, { method: 'POST', body, redirect: 'manual',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Forwarded-For': `10.0.0.${++n}`, ...headers } });
const stillUp = async () => {
  assert.equal(exited, false, 'the server process died');
  assert.equal((await fetch(`${base}/`)).status, 200);
};

test('JSON that is not an object answers 400 and the server stays up', async () => {
  for (const body of ['null', '[]', '"x"', '5', 'true']) {
    const r = await post(body);
    assert.equal(r.status, 400, `body ${body}`);
    assert.deepEqual(await r.json(), { ok: false });
    await stillUp();
  }
});

test('broken JSON and an empty body answer 400 and the server stays up', async () => {
  assert.equal((await post('{nope')).status, 400);
  assert.equal((await post('')).status, 400); // empty body counts as {} -> no email
  await stillUp();
});

test('hostile sign-up text is inert over HTTP (JSON and form)', async () => {
  for (const evil of ['<script>alert(1)</script>@x.com', "' OR 1=1 --"]) {
    const r = await post(JSON.stringify({ email: evil }));
    assert.equal(r.status, 400);
    const text = await r.text();
    assert.equal(text, '{"ok":false}'); // nothing echoed back
    const f = await post(new URLSearchParams({ email: evil }).toString(), { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' });
    assert.equal(f.status, 303);
    assert.equal(f.headers.get('location'), '/?signup=error#join'); // no reflection, no open redirect
    const w = await post(JSON.stringify({ email: 'a@b.co', website: evil })); // the honeypot field: pretend it worked, store nothing
    assert.equal(w.status, 200);
    assert.equal(await w.text(), '{"ok":true}');
    const home = await (await fetch(`${base}/`)).text();
    assert.ok(!home.includes('alert(1)') && !home.includes('OR 1=1'));
    await stillUp();
  }
});
