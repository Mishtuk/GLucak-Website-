// Share cards: each page's og:image points at a real 1200x630 PNG; twitter card and canonical are present.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const pages = { home: 'index.html', music: 'music/index.html', shows: 'shows/index.html', about: 'about/index.html', shop: 'shop/index.html' };

for (const [name, file] of Object.entries(pages)) {
  test(`share card: ${name}`, () => {
    const h = readFileSync(join(ROOT, 'dist', file), 'utf8');
    const img = h.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(img?.startsWith('https://'), 'absolute og:image');
    const png = join(ROOT, 'public', new URL(img).pathname);
    assert.ok(existsSync(png), `missing ${png}`);
    const b = readFileSync(png);
    assert.equal(b.readUInt32BE(16), 1200); assert.equal(b.readUInt32BE(20), 630);
    assert.ok(statSync(png).size < 300 * 1024, 'under 300 KB');
    assert.match(h, /<meta name="twitter:card" content="summary_large_image"/);
    assert.match(h, /<link rel="canonical" href="https:\/\/[^"]+"/);
    assert.match(h, /og:image:width" content="1200"/);
  });
}
