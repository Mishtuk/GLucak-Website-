// The Home film (owner 2026-11-18): served as video/mp4 with byte ranges (Safari plays video only with them).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'film-'));
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

test('film: mp4 is video/mp4 with Accept-Ranges; a-b, a- and -n ranges give 206 with the right bytes; a bad range gives 416', async () => {
  const size = statSync(join(ROOT, 'dist/media/film/hero-land.mp4')).size;
  const url = () => `${base}/media/film/hero-land.mp4`;
  const full = await fetch(url());
  assert.equal(full.status, 200); assert.equal(full.headers.get('content-type'), 'video/mp4'); assert.equal(full.headers.get('accept-ranges'), 'bytes');
  const all = Buffer.from(await full.arrayBuffer());
  for (const [h, a, b] of [['bytes=0-99', 0, 99], [`bytes=${size - 10}-`, size - 10, size - 1], ['bytes=-50', size - 50, size - 1], [`bytes=100-${size + 999}`, 100, size - 1]]) {
    const r = await fetch(url(), { headers: { range: h } });
    assert.equal(r.status, 206, h); assert.equal(r.headers.get('content-range'), `bytes ${a}-${b}/${size}`, h);
    assert.ok(Buffer.from(await r.arrayBuffer()).equals(all.subarray(a, b + 1)), h);
  }
  const bad = await fetch(url(), { headers: { range: `bytes=${size}-` } });
  assert.equal(bad.status, 416); await bad.arrayBuffer();
});
