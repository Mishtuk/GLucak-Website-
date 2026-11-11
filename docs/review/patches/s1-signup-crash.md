# S1 patch: one POST must not kill the server (ready to apply, Desktop)

Prepared 2026-11-11 by the Laptop coder for finding S1 in `docs/review/security-2026-11-10.md`. Written against HEAD 40418d2 in a
throwaway worktree; the main tree was not touched. `server.js` and `src/lib/` are Desktop-claimed, so this is a patch, not a commit.

## What and why
`curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -d null /api/signup` made `server.js` parse `null`,
then `signup.js` read `fields.website` inside an async `'end'` callback: an uncaught TypeError that ends the Node process. Anyone
could keep the site down with a loop.

The patch changes four things:
1. `server.js` (sign-up body): JSON that is not a plain object (`null`, `[]`, `"x"`, `5`, `true`) becomes `{}`, so it ends as the normal "no email" 400.
2. `src/lib/signup.js`: `fields?.website` and `fields?.email`, so the function is safe if called with a non-object.
3. `server.js` (defence in depth): a new `fail()` answers a generic 500 (JSON `{"ok":false}` when the caller sent `Accept: json`, plain text otherwise, no error text, `no-store`). It wraps the whole request handler (so a throwing `readFileSync` at the page and upload routes is covered) and the sign-up `'end'` callback. The route already had its own `.catch` for `/edit/*`; this covers the rest.
4. `server.js`: `process.on('unhandledRejection', ...)` logs the message, only when run as `node server.js` (tests that import the file are unaffected). `uncaughtException` is deliberately not swallowed.

New `test/signup-http.test.js` starts `node server.js` as a child process on a free port with a temp `DATA_DIR` and `DIST_DIR`
(no Kit keys, so no outside call), then checks over real HTTP:
- `null`, `[]`, `"x"`, `5`, `true` as `application/json` -> 400 `{"ok":false}`, and a following `GET /` is still 200 and the process has not exited.
- broken JSON and an empty body -> 400.
- Owner hard rule: `<script>alert(1)</script>@x.com` and `' OR 1=1 --` as the email (JSON and form post) -> 400 / 303 to `/?signup=error#join`, nothing echoed back; the same text in the honeypot `website` field -> 200 and nothing shown on Home.

The test sends a distinct `X-Forwarded-For` per post (`TRUST_PROXY=1` in the child) so the 5-per-10-minutes sign-up limit does not turn later posts into 429s.

## Test evidence
- Unpatched code, new test file only: all 3 new tests fail (`ECONNRESET`, then `ECONNREFUSED`: the server died on the first `null`).
- With only the safety net (no coercion, no `?.`): `null` answers 500 instead of 400 and the server stays up, so each layer holds on its own.
- Full `npm test` in the worktree (builds its own `dist`): **before 171 tests, 171 pass, 0 fail. After 174 tests, 174 pass, 0 fail** (+3, the new file).
- The `.diff` was checked with `git apply --check` against a fresh checkout of HEAD (line endings: the repo is LF in git, CRLF on Windows checkouts; `git apply` handles both).

## Apply (Desktop, repo root, clean `server.js` / `signup.js`)
```
git apply docs/review/patches/s1-signup-crash.diff && npm test
```
It adds the test file too. Then tick the S1 rows in HANDOFF / the checklist and run launch item "POST `null` and `[]`" once against the real host.
The raw patch is `docs/review/patches/s1-signup-crash.diff`.

## Full diff (includes the new test file)
```diff
diff --git a/server.js b/server.js
index 63c4e77..8eb94a1 100644
--- a/server.js
+++ b/server.js
@@ -108,7 +108,7 @@ function handleSignup(req, res) {
   let raw = '', big = false;
   req.setEncoding('utf8');
   req.on('data', (c) => { if (!big) raw += c; if (raw.length > 2048) { big = true; raw = ''; } }); // keep reading, drop the excess, then answer 413
-  req.on('end', async () => {
+  const finish = async () => {
     const reply = (status, body) => {
       if (/json/.test(req.headers.accept ?? '')) return send(req, res, status, 'application/json', Buffer.from(JSON.stringify(body)), { 'Cache-Control': 'no-store' });
       res.writeHead(303, { ...baseHeaders(req), Location: `/?signup=${body.ok ? 'ok' : 'error'}#join`, 'Cache-Control': 'no-store' });
@@ -117,9 +117,11 @@ function handleSignup(req, res) {
     if (big) return reply(413, { ok: false });
     let fields = {};
     try { fields = /json/.test(req.headers['content-type'] ?? '') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw)); } catch { return reply(400, { ok: false }); }
+    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fields = {}; // valid JSON that isn't an object (null, [], "x", 5): no email, so 400
     const r = await signup(fields, { ip: clientIp(req), headers: req.headers, host: req.headers.host });
     reply(r.status, r.body);
-  });
+  };
+  req.on('end', () => finish().catch((e) => fail(req, res, e))); // a throw in here must answer 500, never end the process
 }
 
 // X-Forwarded-* only when TRUST_PROXY=1 (behind the host's proxy); otherwise anyone could spoof them.
@@ -264,6 +266,15 @@ async function handleEdit(req, res, url) {
   return json(404, { error: 'not_found' });
 }
 
+/** A generic 500 (JSON when the caller asked for JSON); nothing from the error reaches the client. */
+function fail(req, res, e) {
+  console.error(new Date().toISOString(), 'request failed:', req.method, e?.message ?? e);
+  if (res.headersSent) return res.destroy();
+  const json = /json/.test(req.headers.accept ?? '');
+  res.writeHead(500, { ...baseHeaders(req), 'Content-Type': json ? 'application/json' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
+  res.end(json ? '{"ok":false}' : 'Something went wrong.');
+}
+
 function handle(req, res) {
   let url;
   try { url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`); } catch { // a junk Host header ('a b', '[')
@@ -313,6 +324,9 @@ function handle(req, res) {
   send(req, res, 200, type, readFileSync(file), { 'Cache-Control': p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400' });
 }
 
-export const server = createServer(handle);
+export const server = createServer((req, res) => { try { handle(req, res); } catch (e) { fail(req, res, e); } });
 // Tests import this file without listening; `node server.js` listens.
-if (process.argv[1] && import.meta.filename === process.argv[1]) server.listen(PORT, () => console.log(`GLucak site on :${PORT}`));
+if (process.argv[1] && import.meta.filename === process.argv[1]) {
+  process.on('unhandledRejection', (e) => console.error(new Date().toISOString(), 'unhandled rejection:', e?.message ?? e));
+  server.listen(PORT, () => console.log(`GLucak site on :${PORT}`));
+}
diff --git a/src/lib/signup.js b/src/lib/signup.js
index 561f6c2..94908b8 100644
--- a/src/lib/signup.js
+++ b/src/lib/signup.js
@@ -30,8 +30,8 @@ export function sameOrigin(headers, host) {
 export async function signup(fields, { ip, headers, host, env = process.env, fetchImpl = fetch, now = Date.now() }) {
   if (!sameOrigin(headers, host)) return { status: 403, body: { ok: false } };
   if (limited(ip, now)) return { status: 429, body: { ok: false } };
-  if (fields.website) return { status: 200, body: { ok: true } }; // a bot filled the hidden field: pretend it worked
-  const email = String(fields.email ?? '').trim();
+  if (fields?.website) return { status: 200, body: { ok: true } }; // a bot filled the hidden field: pretend it worked
+  const email = String(fields?.email ?? '').trim();
   if (!validEmail(email)) return { status: 400, body: { ok: false } };
   const { KIT_API_KEY: key, KIT_FORM_ID: form } = env;
   if (!key || !/^\d+$/.test(form ?? '')) return { status: 503, body: { ok: false } };
diff --git a/test/signup-http.test.js b/test/signup-http.test.js
new file mode 100644
index 0000000..dd8af78
--- /dev/null
+++ b/test/signup-http.test.js
@@ -0,0 +1,76 @@
+// POST /api/signup over real HTTP against `node server.js` in its own process: a body that is valid JSON but not an
+// object (null, [], "x", 5) must answer 400 and leave the site up (security review S1), and hostile text stays inert.
+import { test, before, after } from 'node:test';
+import assert from 'node:assert/strict';
+import { spawn } from 'node:child_process';
+import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
+import { createServer } from 'node:net';
+import { tmpdir } from 'node:os';
+import { join } from 'node:path';
+import { fileURLToPath } from 'node:url';
+
+const dir = mkdtempSync(join(tmpdir(), 'gl-su-'));
+mkdirSync(join(dir, 'dist'));
+writeFileSync(join(dir, 'dist/index.html'), '<!doctype html><title>t</title><main>home</main>');
+writeFileSync(join(dir, 'shows.json'), '[]');
+
+const freePort = () => new Promise((resolve, reject) => {
+  const s = createServer().once('error', reject).listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
+});
+
+let child, base, exited = false, n = 0;
+before(async () => {
+  const port = await freePort();
+  base = `http://127.0.0.1:${port}`;
+  const env = { ...process.env, PORT: String(port), DATA_DIR: join(dir, 'data'), DIST_DIR: join(dir, 'dist'), SHOWS_FILE: join(dir, 'shows.json'),
+    RELEASES_FILE: join(dir, 'none.json'), TRUST_PROXY: '1', NODE_ENV: 'test' }; // TRUST_PROXY: a fresh X-Forwarded-For per post keeps clear of the 5-per-10-minutes limit
+  delete env.KIT_API_KEY; delete env.KIT_FORM_ID; // never reach the real Kit API from a test
+  child = spawn(process.execPath, [fileURLToPath(new URL('../server.js', import.meta.url))], { env, stdio: ['ignore', 'pipe', 'pipe'] });
+  child.on('exit', () => { exited = true; });
+  child.stderr.resume();
+  await new Promise((resolve, reject) => {
+    child.once('exit', () => reject(new Error('server exited before it listened')));
+    child.stdout.on('data', (d) => { if (String(d).includes('GLucak site on')) resolve(); });
+  });
+});
+after(() => child?.kill());
+
+const post = (body, headers = {}) => fetch(`${base}/api/signup`, { method: 'POST', body, redirect: 'manual',
+  headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Forwarded-For': `10.0.0.${++n}`, ...headers } });
+const stillUp = async () => {
+  assert.equal(exited, false, 'the server process died');
+  assert.equal((await fetch(`${base}/`)).status, 200);
+};
+
+test('JSON that is not an object answers 400 and the server stays up', async () => {
+  for (const body of ['null', '[]', '"x"', '5', 'true']) {
+    const r = await post(body);
+    assert.equal(r.status, 400, `body ${body}`);
+    assert.deepEqual(await r.json(), { ok: false });
+    await stillUp();
+  }
+});
+
+test('broken JSON and an empty body answer 400 and the server stays up', async () => {
+  assert.equal((await post('{nope')).status, 400);
+  assert.equal((await post('')).status, 400); // empty body counts as {} -> no email
+  await stillUp();
+});
+
+test('hostile sign-up text is inert over HTTP (JSON and form)', async () => {
+  for (const evil of ['<script>alert(1)</script>@x.com', "' OR 1=1 --"]) {
+    const r = await post(JSON.stringify({ email: evil }));
+    assert.equal(r.status, 400);
+    const text = await r.text();
+    assert.equal(text, '{"ok":false}'); // nothing echoed back
+    const f = await post(new URLSearchParams({ email: evil }).toString(), { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' });
+    assert.equal(f.status, 303);
+    assert.equal(f.headers.get('location'), '/?signup=error#join'); // no reflection, no open redirect
+    const w = await post(JSON.stringify({ email: 'a@b.co', website: evil })); // the honeypot field: pretend it worked, store nothing
+    assert.equal(w.status, 200);
+    assert.equal(await w.text(), '{"ok":true}');
+    const home = await (await fetch(`${base}/`)).text();
+    assert.ok(!home.includes('alert(1)') && !home.includes('OR 1=1'));
+    await stillUp();
+  }
+});
```
