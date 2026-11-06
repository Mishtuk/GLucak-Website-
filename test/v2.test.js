// /v2/ (the variant Home for the side-by-side) builds, stays out of search and out of the sitemap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '../dist');

test('/v2/ builds, is noindex, keeps the shows marker, and is not in the sitemap', () => {
  const h = readFileSync(join(DIST, 'v2/index.html'), 'utf8');
  assert.match(h, /<meta name="robots" content="noindex">/);
  assert.ok(h.includes('<!--gl:shows-->'), 'server fills the shows');
  assert.ok(!/<iframe[^>]*youtube/i.test(h), 'no YouTube iframe on load');
  assert.ok(!readFileSync(join(DIST, 'sitemap.xml'), 'utf8').includes('/v2/'));
  assert.ok(!readFileSync(join(DIST, 'index.html'), 'utf8').includes('href="/v2/"'), 'Home does not link it');
});
