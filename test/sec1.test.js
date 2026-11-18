import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { connect } from 'node:net';

const dir = mkdtempSync(join(tmpdir(), 'gl-sec1-'));
writeFileSync(join(dir, 'index.html'), '<!doctype html><title>t</title>');
mkdirSync(join(dir, 'sub'));
writeFileSync(join(dir, 'sub/index.html'), 'x');
writeFileSync(join(dir, 'a.txt'), 'hello');
Object.assign(process.env, { DIST_DIR: dir, DATA_DIR: join(dir, 'data'), SESSION_SECRET: 's'.repeat(48), BODY_IDLE_MS: '300' });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base, port;
before(() => new Promise((r) => server.listen(0, () => { port = server.address().port; base = `http://127.0.0.1:${port}`; r(); })));
after(() => server.close());

const NEED = ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'x-frame-options', 'permissions-policy',
  'cross-origin-opener-policy', 'cross-origin-resource-policy', 'x-permitted-cross-domain-policies', 'origin-agent-cluster'];
const full = (get, label) => {
  for (const h of NEED) assert.ok(get(h), `${label}: missing ${h}`);
  assert.equal(get('cross-origin-opener-policy'), 'same-origin', label);
  assert.equal(get('cross-origin-resource-policy'), 'same-origin', label);
  assert.equal(get('x-permitted-cross-domain-policies'), 'none', label);
  assert.equal(get('origin-agent-cluster'), '?1', label);
};
const viaFetch = async (label, status, path, init) => {
  const r = await fetch(base + path, { redirect: 'manual', ...init });
  assert.equal(r.status, status, label);
  full((h) => r.headers.get(h), label);
  return r;
};
const raw = (text, wait = 0) => new Promise((res) => {
  const s = connect(port, '127.0.0.1', () => s.write(text));
  let out = '';
  s.on('data', (c) => { out += c; });
  s.on('close', () => res(out));
  setTimeout(() => s.destroy(), wait || 2000);
});
const rawHeaders = (out) => Object.fromEntries(out.split('\r\n\r\n')[0].split('\r\n').slice(1).map((l) => [l.slice(0, l.indexOf(':')).toLowerCase(), l.slice(l.indexOf(':') + 1).trim()]));

test('every reply path carries the full header set', async () => {
  await viaFetch('200 page', 200, '/');
  const r = await viaFetch('200 asset', 200, '/a.txt');
  await viaFetch('304', 304, '/a.txt', { headers: { 'If-None-Match': r.headers.get('etag') } });
  await viaFetch('404', 404, '/nope');
  await viaFetch('301', 301, '/sub');
  await viaFetch('405', 405, '/', { method: 'DELETE' });
  await viaFetch('signup 303', 303, '/api/signup', { method: 'POST', body: 'x=1', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  await viaFetch('edit 4xx', 403, '/edit/api/shows', { headers: { 'sec-fetch-site': 'cross-site' } });
  await viaFetch('edit POST error', 403, '/edit/login', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json', origin: 'https://evil.example' } });
  const bad = await raw('GET / HTTP/1.1\r\nHost: a b\r\n\r\n');
  assert.match(bad, /^HTTP\/1\.1 400/);
  full((h) => rawHeaders(bad)[h], 'junk Host 400');
});

test('upgrade-insecure-requests only over https', async () => {
  assert.ok(!(await fetch(base)).headers.get('content-security-policy').includes('upgrade-insecure-requests'));
  process.env.TRUST_PROXY = '1';
  try {
    const r = await fetch(base, { headers: { 'x-forwarded-proto': 'https' } });
    assert.ok(r.headers.get('content-security-policy').includes('upgrade-insecure-requests'));
  } finally { delete process.env.TRUST_PROXY; }
});

test('a stalled body gets 408 with the full headers, not a hang', async () => {
  const out = await raw(`POST /edit/login HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nOrigin: http://127.0.0.1:${port}\r\nContent-Type: application/json\r\nContent-Length: 100\r\n\r\n{"a"`, 3000);
  assert.match(out, /^HTTP\/1\.1 408/);
  full((h) => rawHeaders(out)[h], '408');
});

test('server timeouts are set', () => {
  assert.ok(server.requestTimeout > 0 && server.headersTimeout > 0 && server.headersTimeout <= server.requestTimeout);
});
