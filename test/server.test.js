import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { connect } from 'node:net';

const dir = mkdtempSync(join(tmpdir(), 'gl-'));
mkdirSync(join(dir, 'shows'));
const page = '<!doctype html><title>t</title><ul><!--gl:shows--></ul>';
writeFileSync(join(dir, 'shows/index.html'), page);
writeFileSync(join(dir, 'index.html'), page);
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
writeFileSync(join(dir, 'shows.json'), JSON.stringify([
  { date: d(5), type: 'show', venue: '<script>alert(1)</script>', city: "' OR 1=1 --", link: 'https://example.com/t' },
  { date: d(-5), type: 'open-mic', venue: 'Gone Venue', city: 'X' },
]));
process.env.DIST_DIR = dir;
process.env.SHOWS_FILE = join(dir, 'shows.json');
process.env.DATA_DIR = join(dir, 'data'); // no saved list: the shipped file is used
const { server, clientIp } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

test('shows marker is replaced and escaped, per request', async () => {
  const body = await (await fetch(`${base}/shows/`)).text();
  assert.ok(!body.includes('gl:shows'));
  assert.ok(body.includes('&lt;script&gt;') && !body.includes('<script>'));
  assert.ok(body.includes('Tickets') && body.includes('Gone Venue')); // Shows page lists past too
  const home = await (await fetch(`${base}/`)).text();
  assert.ok(home.includes('Tickets') && !home.includes('Gone Venue')); // Home: upcoming only
});

test('security headers', async () => {
  const r = await fetch(`${base}/shows/`);
  const csp = r.headers.get('content-security-policy');
  assert.match(csp, /frame-src https:\/\/open\.spotify\.com https:\/\/www\.youtube-nocookie\.com/);
  assert.match(csp, /script-src 'self'(;|$)/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.ok(r.headers.get('referrer-policy'));
});

test('404, redirect, no path escape, POST refused', async () => {
  assert.equal((await fetch(`${base}/nope`)).status, 404);
  assert.equal((await fetch(`${base}/shows`, { redirect: 'manual' })).status, 301);
  assert.equal((await fetch(`${base}/..%2f..%2fpackage.json`)).status, 404);
  assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
});

// One raw request (fetch can't send a broken Host header); resolves with the status line.
const raw = (host) => new Promise((resolve, reject) => {
  const s = connect(server.address().port, '127.0.0.1', () => s.write(`GET / HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`));
  let out = '';
  s.on('data', (c) => { out += c; }).on('end', () => resolve(out.split('\r\n')[0])).on('error', reject);
});

test('a junk Host header is a 400, never a crash', async () => {
  for (const host of ['a b', '[', 'a<b']) assert.match(await raw(host), /^HTTP\/1\.1 400/, host);
  assert.equal((await fetch(`${base}/shows/`)).status, 200, 'still serving');
});

test('HSTS only over https: X-Forwarded-Proto counts only with TRUST_PROXY=1', async () => {
  const hsts = async (h) => (await fetch(`${base}/shows/`, { headers: h })).headers.get('strict-transport-security');
  assert.equal(await hsts({}), null, 'plain http');
  assert.equal(await hsts({ 'x-forwarded-proto': 'https' }), null, 'spoofable without TRUST_PROXY');
  process.env.TRUST_PROXY = '1';
  try {
    assert.equal(await hsts({ 'x-forwarded-proto': 'https' }), 'max-age=31536000');
    assert.equal(await hsts({ 'x-forwarded-proto': 'http' }), null);
  } finally { delete process.env.TRUST_PROXY; }
});

test('client IP: rightmost X-Forwarded-For (the proxy-added one), port stripped, only with TRUST_PROXY=1', () => {
  const req = (xff) => ({ headers: { 'x-forwarded-for': xff }, socket: { remoteAddress: '10.0.0.9' } });
  assert.equal(clientIp(req('6.6.6.6')), '10.0.0.9', 'ignored without TRUST_PROXY');
  process.env.TRUST_PROXY = '1';
  try {
    assert.equal(clientIp(req('6.6.6.6, 1.2.3.4:5678')), '1.2.3.4', 'a fake left entry is ignored');
    assert.equal(clientIp(req('1.2.3.4')), '1.2.3.4');
    assert.equal(clientIp(req('[2001:db8::1]:443')), '2001:db8::1');
    assert.equal(clientIp(req('2001:db8::1')), '2001:db8::1');
    assert.equal(clientIp(req(undefined)), '10.0.0.9');
  } finally { delete process.env.TRUST_PROXY; }
});
