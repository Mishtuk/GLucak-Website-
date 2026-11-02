import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
const { server } = await import('../server.js');
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
