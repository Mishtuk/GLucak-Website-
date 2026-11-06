// The shop and the edit screen's Products tab + image upload, over real HTTP against the built site in dist/.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import sharp from 'sharp';
import { hashPassword } from '../src/lib/auth.js';

const data = join(mkdtempSync(join(tmpdir(), 'gl-shop-')), 'data');
Object.assign(process.env, { DATA_DIR: data, SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `alex:${hashPassword('alexs long password')}` });
for (const k of ['DIST_DIR', 'SHOWS_FILE', 'PRODUCTS_FILE', 'DEV_EDITOR', 'SHOP_ENABLED']) delete process.env[k];
const { server } = await import('../server.js');
let base, cookie;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', async () => {
  base = `http://127.0.0.1:${server.address().port}`;
  const s = await post('/edit/login', { username: 'alex', password: 'alexs long password' });
  cookie = s.headers.get('set-cookie').split(';')[0];
  r();
})));
after(() => server.close());

const post = (path, body, headers = {}) => fetch(`${base}${path}`, { method: 'POST',
  headers: { origin: base, 'content-type': 'application/json', accept: 'application/json', cookie, ...headers }, body: typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body) });
const get = (path, headers = {}) => fetch(`${base}${path}`, { headers });
const shop = async () => (await get('/shop/')).text();
const withShop = async (fn) => { process.env.SHOP_ENABLED = '1'; try { return await fn(); } finally { delete process.env.SHOP_ENABLED; } };
const version = async () => (await (await get('/edit/api/products', { cookie })).json()).version;
const product = (o = {}) => ({ id: 'real-tee', name: 'Real tee', type: 'shirt', price: 2500, image: '/media/shop/sample-tee.webp', status: 'available', link: 'https://shop.example/tee', order: 0, ...o });
const save = async (products, v) => post('/edit/api/products', { version: v === undefined ? await version() : v, products });
const upload = (body, type = 'image/png', headers = {}) => post('/edit/api/upload', body, { 'content-type': type, ...headers });

test('/shop/ is filled per visit from the shipped samples: banner, Coming soon, Preview chip, noindex', async () => {
  const r = await get('/shop/');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  const html = await r.text();
  assert.ok(!html.includes('<!--gl:shop-->'));
  assert.ok(html.includes("This shop is a preview. Everything here is a sample and can't be bought.") && html.includes('Sample: GLucak tee') && !html.includes('class="product-price"') && html.includes('Preview'));
  assert.equal((html.match(/<article class="product-detail"/g) ?? []).length, 5);
  assert.ok(!html.includes('>Buy<'), 'samples are never buyable');
});

test('Shop links: none without SHOP_ENABLED (Watch stays); with it nav + footer get Shop, the bar swaps Watch for Shop', async () => {
  for (const p of ['/', '/music/', '/shows/', '/about/', '/shop/']) {
    const html = await (await get(p)).text();
    assert.ok(!html.includes('href="/shop/"'), `${p} off`);
    assert.match(html.match(/<nav class="phone-bar"[\s\S]*?<\/nav>/)[0], /<span>Watch<\/span>/, `${p} bar keeps Watch`);
  }
  await withShop(async () => {
    for (const p of ['/', '/music/', '/shop/']) {
      const html = await (await get(p)).text();
      assert.match(html.match(/<nav class="nav-desktop"[\s\S]*?<\/nav>/)[0], />Shop<\/a>/, `${p} nav`);
      assert.match(html.match(/<nav class="sheet"[\s\S]*?<\/nav>/)[0], />Shop<\/a>/, `${p} menu`);
      const bar = html.match(/<nav class="phone-bar"[\s\S]*?<\/nav>/)[0];
      assert.ok(bar.includes('<span>Shop</span>') && !bar.includes('Watch'), `${p} bar`);
      assert.match(html.match(/<p class="closing[\s\S]*?<\/p>/)[0], /href="\/shop\/">Shop\.<\/a>/, `${p} footer`);
    }
    const r = await get('/shop/');
    assert.equal(r.headers.get('x-robots-tag'), null, 'indexable once open');
    const html = await r.text();
    assert.ok(!html.includes('ph-chip inline">Preview'), 'no Preview chip once open');
    assert.match(html, /<a href="\/shop\/" aria-current="page">Shop<\/a>/);
  });
});

test('products API: 401 signed out, 403 cross-site, 415 not JSON', async () => {
  assert.equal((await get('/edit/api/products')).status, 401);
  assert.equal((await post('/edit/api/products', { products: [] }, { cookie: '' })).status, 401);
  assert.equal((await post('/edit/api/products', { products: [] }, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('/edit/api/products', 'x=1', { 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
});

test('products save: on /shop/ at the next visit, Buy for available + link, prev kept; bad rows rejected', async () => {
  const r = await save([product(), product({ id: 'gone', name: 'Gone hoodie', status: 'sold-out', order: 1 })]);
  assert.equal(r.status, 200);
  const html = await shop();
  assert.ok(html.includes('Real tee') && !html.includes('Sample: GLucak tee'));
  assert.match(html, /<a class="btn btn-solid product-buy" href="https:\/\/shop\.example\/tee" rel="noopener">Buy<\/a>/);
  assert.ok(html.includes('Sold out') && !html.includes('This shop is a preview.'), 'no samples, no banner');
  assert.equal(JSON.parse(readFileSync(join(data, 'products.prev.json'), 'utf8'))[0].status, 'sample', 'prev = the shipped samples');
  const bad = await save([product(), product({ link: 'javascript:alert(1)' }), product({ id: 'x', image: '/media/uploads/../products.json' })]);
  assert.equal(bad.status, 400);
  assert.deepEqual((await bad.json()).errors.map((e) => e.row), [1, 2]);
  assert.equal((await save(Array.from({ length: 201 }, (_, i) => product({ id: `p${i}` })))).status, 400, '200 cap');
});

test('products save: says the shop is not open to fans while SHOP_ENABLED is off, plain message when on', async () => {
  const off = await (await save([product()])).json();
  assert.equal(off.message, "Saved. The shop isn't open to fans yet, so they won't see it until it's switched on.");
  await withShop(async () => {
    const on = await (await save([product()])).json();
    assert.equal(on.message, "Saved. It's on the site now.");
  });
});

test('products: <script> and SQL text stored as text, rendered inert', async () => {
  assert.equal((await save([product({ name: '<script>alert(1)</script>', description: "' OR 1=1 --" })])).status, 200);
  const html = await shop();
  assert.ok(!html.includes('<script>alert(1)') && html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && html.includes('&#39; OR 1=1 --'));
  const api = await (await get('/edit/api/products', { cookie })).json();
  assert.equal(api.products[0].description, "' OR 1=1 --");
});

test('products: stale version is 409 and nothing written; over 256 KB is 413', async () => {
  const v1 = await version();
  assert.equal((await save([product({ name: 'Tab one' })], v1)).status, 200);
  const stale = await save([product({ name: 'Tab two' })], v1);
  assert.equal(stale.status, 409);
  assert.match((await stale.json()).message, /^Someone else saved the products just now, so yours didn't save. Reloading shows their changes but clears yours/);
  assert.equal(JSON.parse(readFileSync(join(data, 'products.json'), 'utf8'))[0].name, 'Tab one');
  assert.equal((await save([product({ description: 'x'.repeat(300 * 1024) })])).status, 413);
});

// ---------- Uploads ----------
const png = (w = 64, h = 48) => sharp({ create: { width: w, height: h, channels: 3, background: '#ff4d2e' } }).png().toBuffer();
// A real PNG of w x h 1-bit pixels: tiny on disk, huge in pixels (the decompression-bomb shape).
function bigPng(w, h) {
  const chunk = (type, body) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
    const td = Buffer.concat([Buffer.from(type), body]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 1; ihdr[9] = 0;
  const raw = Buffer.alloc((1 + Math.ceil(w / 8)) * h);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('upload: 401 signed out, 403 cross-site, 415 for a non-image type', async () => {
  const img = await png();
  assert.equal((await upload(img, 'image/png', { cookie: '' })).status, 401);
  assert.equal((await upload(img, 'image/png', { origin: 'https://evil.example' })).status, 403);
  for (const t of ['text/html', 'image/svg+xml', 'image/gif', 'application/octet-stream', '']) assert.equal((await upload(img, t)).status, 415, t);
});

test('upload: refuses non-images, polyglots, SVG/GIF in disguise, oversize and too many pixels', async () => {
  const refused = [
    ['text', Buffer.from('hello, not an image')],
    ['html with a PNG header', Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.from('<html><script>alert(1)</script></html>')])],
    ['html with a JPEG header', Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('<script>alert(1)</script>')])],
    ['svg as png', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>')],
    ['gif as png', await sharp({ create: { width: 8, height: 8, channels: 3, background: '#000' } }).gif().toBuffer()],
  ];
  for (const [name, body] of refused) {
    const r = await upload(body);
    assert.equal(r.status, 400, name);
    assert.equal((await r.json()).error, 'not_image', name);
  }
  const bomb = bigPng(8000, 6000);
  assert.ok(bomb.length < 1024 * 1024, 'small file');
  const r = await upload(bomb);
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'too_many_pixels');
  assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
  assert.ok(!existsSync(join(data, 'uploads')) || !readdirSync(join(data, 'uploads')).length, 'nothing saved');
});

test('upload: a real PNG and JPEG come back as a resized, metadata-free WebP served with nosniff', async () => {
  const jpg = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: '#123456' } })
    .jpeg().withMetadata({ orientation: 6 }).withExif({ IFD0: { Artist: 'Secret Person', Copyright: 'GPS home address' } }).toBuffer();
  assert.ok((await sharp(jpg).metadata()).exif, 'fixture has EXIF');
  const tail = Buffer.concat([await png(), Buffer.from('<html><script>alert(1)</script></html>')]); // valid PNG + HTML after IEND
  for (const [type, body] of [['image/jpeg', jpg], ['image/png', await png()], ['image/png', tail]]) {
    const r = await upload(body, type);
    assert.equal(r.status, 200, type);
    const { path } = await r.json();
    assert.match(path, /^\/media\/uploads\/[a-f0-9]{32}\.webp$/);
    const img = await get(path);
    assert.equal(img.status, 200);
    assert.equal(img.headers.get('content-type'), 'image/webp');
    assert.equal(img.headers.get('x-content-type-options'), 'nosniff');
    const out = Buffer.from(await img.arrayBuffer());
    const m = await sharp(out).metadata();
    assert.equal(m.format, 'webp');
    for (const k of ['exif', 'icc', 'xmp', 'iptc', 'orientation']) assert.equal(m[k], undefined, `${type}: ${k} stripped`);
    assert.ok(!out.includes('Secret Person') && !out.includes('<script'), 'nothing carried over');
    if (type === 'image/jpeg') assert.deepEqual([m.width, m.height], [800, 1200], 'turned upright, then fit in 1200px');
  }
  const prod = await save([product({ image: (await (await upload(await png())).json()).path })]);
  assert.equal(prod.status, 200, 'an uploaded path is a valid product image');
});

test('/media/uploads/: only server-made names; traversal and junk 404', async () => {
  for (const p of ['/media/uploads/..%2f..%2fpackage.json', '/media/uploads/..%2fproducts.json', '/media/uploads/%2e%2e/products.json',
    '/media/uploads/../products.json', `/media/uploads/${'a'.repeat(32)}.webp`, `/media/uploads/${'A'.repeat(32)}.webp`, '/media/uploads/x.html', '/media/uploads/']) {
    assert.equal((await get(p)).status, 404, p);
  }
});
