// Shop products: validation per field, escaping, button rules per status, sample banner, SHOP_ENABLED links.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { actionHtml, checkProducts, productsHtml, shopLinks, validateProduct } from '../src/lib/products.js';

const good = (o = {}) => ({ id: 'glucak-tee', name: 'GLucak tee', type: 'shirt', price: 2500, image: '/media/shop/sample-tee.webp', status: 'available', order: 0, ...o });
const bad = (o, field) => assert.throws(() => validateProduct(good(o)), new RegExp(`^Error: ${field}$`), JSON.stringify(o));

test('a valid product passes, optional fields included', () => {
  assert.ok(validateProduct(good()));
  assert.ok(validateProduct(good({ description: 'Soft.', link: 'https://shop.fourthwall.com/p/tee', sizes: ['S', 'M'], image: `/media/uploads/${'a'.repeat(32)}.webp` })));
});

test('each field is checked', () => {
  for (const id of ['', 'Glucak', 'a b', '-tee', 'tee-', 'a--b', 'x'.repeat(61), 7, '<b>']) bad({ id }, 'id');
  for (const name of ['', '   ', 'x'.repeat(121), 5, null]) bad({ name }, 'name');
  for (const type of ['hat', '', 'SHIRT', undefined]) bad({ type }, 'type');
  for (const price of [-1, 100001, 25.5, '2500', NaN, null, Infinity]) bad({ price }, 'price');
  for (const description of ['x'.repeat(601), 9]) bad({ description }, 'description');
  for (const status of ['open', '', 'Available']) bad({ status }, 'status');
  for (const sizes of ['S,M', [''], ['x'.repeat(13)], Array(13).fill('S'), [1]]) bad({ sizes }, 'sizes');
  for (const order of [-1, 1.5, '1', null]) bad({ order }, 'order');
  assert.equal(validateProduct(good({ price: 0 })).price, 0);
  assert.equal(validateProduct(good({ price: 100000 })).price, 100000);
});

test('links: http(s) only; javascript:, data: and friends refused', () => {
  for (const link of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', ' javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', 'file:///etc/passwd', '//evil.example', 'shop.fourthwall.com', '', `https://${'x'.repeat(500)}.com`]) bad({ link }, 'link');
  assert.ok(validateProduct(good({ link: 'http://example.com/a' })));
});

test('images: only /media/shop/ or a server-named /media/uploads/ file, no climbing out', () => {
  for (const image of ['/media/shop/../../server.js', '/media/uploads/../products.json', '/media/shop/..%2fx.webp', '/media/other/a.webp', 'https://evil.example/a.webp',
    'javascript:alert(1)', '/media/uploads/abc.webp', `/media/uploads/${'a'.repeat(32)}.png`, `/media/uploads/${'A'.repeat(32)}.webp`, '/media/shop/a.svg', '/media/shop/a.webp?x', '//evil/a.webp', '', null]) bad({ image }, 'image');
});

test('checkProducts: trims, drops empty optionals, duplicate IDs rejected, 200 cap, plain messages', () => {
  const ok = checkProducts([{ ...good(), name: '  Tee  ', description: '', link: '', sizes: [' S ', ''], extra: 'dropped' }]);
  assert.deepEqual(ok.rows[0], { ...good(), name: 'Tee', sizes: ['S'] });
  const dup = checkProducts([good(), good({ name: 'Other' })]);
  assert.deepEqual(dup.errors.map((e) => e.row), [1]);
  assert.match(dup.errors[0].message, /^Product 2: Another product already uses the short name glucak-tee. Each one needs its own./);
  const many = checkProducts([good({ link: 'javascript:x' }), 'junk', good({ id: 'b', price: -5 })]);
  assert.deepEqual(many.errors.map((e) => e.row), [0, 1, 2]);
  assert.match(many.errors[0].message, /^Product 1: The link has to start with https:\/\//);
  assert.equal(checkProducts(Array.from({ length: 201 }, (_, i) => good({ id: `p${i}` }))).errors[0].row, null);
  assert.ok(checkProducts(null).errors);
});

test('the shipped sample file is valid: 5 marked samples with images that exist', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
  assert.ok(checkProducts(rows).rows, JSON.stringify(checkProducts(rows).errors));
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((r) => r.type).sort(), ['cd', 'hoodie', 'shirt', 'sticker', 'vinyl']);
  for (const r of rows) {
    assert.equal(r.status, 'sample');
    assert.match(r.name, /^Sample: /);
    assert.ok(readFileSync(new URL(`../public${r.image}`, import.meta.url)).length > 0, r.image);
  }
});

test('escaping: <script> and SQL text in name and description render inert', () => {
  const html = productsHtml([good({ name: '<script>alert(1)</script>', description: "' OR 1=1 -- \"><img src=x onerror=alert(1)>", sizes: ['<b>'], link: 'https://x.com/?a="><script>' })]);
  assert.ok(!html.includes('<script') && !html.includes('<img src=x') && !html.includes('<b>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && html.includes('&#39; OR 1=1 --') && html.includes('&quot;&gt;&lt;img'));
  assert.ok(html.includes('href="https://x.com/?a=&quot;&gt;&lt;script&gt;"'));
});

test('button rules: Buy only when available with a link; otherwise a plain label', () => {
  const buy = actionHtml(good({ link: 'https://shop.example/tee' }));
  assert.match(buy, /^<a class="btn btn-solid product-buy" href="https:\/\/shop\.example\/tee" rel="noopener">Buy<\/a><p class="product-note">You pay on the store's own page\. We never see your card details\.<\/p>$/);
  for (const status of ['sample', 'coming-soon']) {
    const h = actionHtml(good({ status, link: 'https://shop.example/tee' }));
    assert.equal(h, '<p class="product-status is-coming-soon">Coming soon</p>', status);
  }
  assert.equal(actionHtml(good({ status: 'available' })), '<p class="product-status is-coming-soon">Coming soon</p>', 'available but no link yet');
  assert.equal(actionHtml(good({ status: 'sold-out', link: 'https://shop.example/tee' })), '<p class="product-status is-sold-out">Sold out</p>');
  for (const s of ['sample', 'coming-soon', 'sold-out']) assert.ok(!/<button|<a /.test(actionHtml(good({ status: s, link: 'https://x.com' }))), s);
});

test('banner only while any product is a sample; Preview chip only when asked; order, price, empty state', () => {
  const banner = "This shop is a preview. Everything here is a sample and can't be bought.";
  assert.ok(!productsHtml([good(), good({ id: 'b', status: 'sample' })]).includes(banner), 'one real product -> no banner');
  assert.ok(productsHtml([good({ status: 'sample' }), good({ id: 'b', status: 'sample' })]).includes(banner));
  assert.ok(!productsHtml([good(), good({ id: 'b', status: 'sold-out' })]).includes(banner));
  assert.ok(productsHtml([good()], { preview: true }).includes('Preview'));
  assert.ok(!productsHtml([good()]).includes('ph-chip'));
  const html = productsHtml([good({ id: 'second', name: 'Second', order: 2 }), good({ id: 'first', name: 'First', order: 1, price: 0 }), good({ id: 'broken', price: -1 })]);
  assert.ok(html.indexOf('First') < html.indexOf('Second') && !html.includes('broken'), 'sorted by order, invalid rows skipped');
  assert.ok(html.includes('href="#product-first"') && html.includes('id="product-first"') && html.includes('>Free<') && html.includes('>$25.00<'));
  assert.match(productsHtml([]), /Nothing in the shop yet/);
});

test('samples show no price; real products do', () => {
  const html = productsHtml([good({ status: 'sample', price: 4500 }), good({ id: 'b', status: 'coming-soon', price: 1200 })]);
  assert.ok(!html.includes('$45.00') && html.includes('$12.00'));
  assert.equal((html.match(/product-price/g) ?? []).length, 2, 'card + detail for the real one only');
});

test('buying note only under a Buy button', () => {
  const note = "You pay on the store's own page. We never see your card details.";
  assert.ok(actionHtml(good({ link: 'https://shop.example/t' })).includes(note));
  for (const s of ['sample', 'coming-soon', 'sold-out']) assert.ok(!actionHtml(good({ status: s, link: 'https://x.com' })).includes(note), s);
  assert.ok(!actionHtml(good()).includes(note), 'available without a link');
});

test('shopLinks: nav + footer follow enabled; the bar swaps Watch for Shop only when enabled AND something is available (D42)', () => {
  const page = '<nav class="nav-desktop"><a href="/music/">Music</a><!--gl:nav-shop--></nav><nav class="sheet"><!--gl:nav-shop--></nav>'
    + '<nav class="phone-bar"><a href="/shows/">Shows</a><!--gl:watch--><a href="/#shows-video"><span>Watch</span></a><!--/gl:watch--></nav>'
    + '<p class="closing"><a href="/shows/">Shows.</a><!--gl:footer-shop--> <a href="#join">Join.</a></p>';
  const samples = [good({ status: 'sample' }), good({ id: 'b', status: 'coming-soon' }), good({ id: 'c', status: 'sold-out' })];
  const one = [...samples, good({ id: 'd', status: 'available' })];
  const off = shopLinks(page, { enabled: false, path: '/', rows: one });
  assert.ok(!off.includes('/shop/') && off.includes('<span>Watch</span>') && !off.includes('gl:nav-shop'), 'off: nothing, even with an available product');
  const only = shopLinks(page, { enabled: true, path: '/shop/', rows: samples });
  assert.equal(only.match(/<a href="\/shop\/" aria-current="page">Shop<\/a>/g).length, 2, 'desktop nav + menu sheet');
  assert.ok(only.includes('<span>Watch</span>') && !only.includes('<span>Shop</span>'), 'enabled, nothing buyable: Watch stays');
  assert.ok(only.includes('<a href="/shop/">Shop.</a>'));
  const on = shopLinks(page, { enabled: true, path: '/shop/', rows: one });
  assert.ok(on.includes('<span>Shop</span>') && !on.includes('Watch'), 'enabled + one available: Shop replaces Watch');
  assert.ok(shopLinks(page, { enabled: true, path: '/shop/', rows: [good({ status: 'available', price: -1 })] }).includes('Watch'), 'an invalid row does not count');
  assert.ok(!shopLinks(page, { enabled: true, path: '/music/', rows: one }).includes('aria-current'));
});

test('L2 markup: status classes + words, tape only for sample / sold-out, card img alt empty, detail img alt the name', () => {
  const html = (status, o = {}) => productsHtml([good({ status, name: 'Tee "x"', ...o })]);
  for (const [status, cls, word] of [['coming-soon', 'is-coming-soon', 'Coming soon'], ['sample', 'is-coming-soon', 'Coming soon'], ['sold-out', 'is-sold-out', 'Sold out']]) {
    const h = html(status);
    assert.equal((h.match(new RegExp('<p class="product-status ' + cls + '">' + word + '</p>', 'g')) ?? []).length, 2, status + ': card + detail');
    assert.ok(h.includes('data-status="' + status + '"'), status);
  }
  assert.ok(html('available', { link: 'https://shop.example/t' }).includes('<p class="product-status is-available">Available</p>'), 'card says Available');
  assert.ok(html('available').includes('product-status is-coming-soon'), 'available without a link reads Coming soon');
  const tapes = (h) => [...h.matchAll(/<span class="product-tape" aria-hidden="true">([^<]*)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(tapes(html('sample')), ['Sample', 'Sample']);
  assert.deepEqual(tapes(html('sold-out')), ['Sold out', 'Sold out']);
  assert.deepEqual(tapes(html('coming-soon')), []);
  assert.deepEqual(tapes(html('available')), []);
  assert.deepEqual(tapes(html('sample', { name: '<b>x</b>' })), ['Sample', 'Sample'], 'tape text is fixed, never data');
  const h = html('coming-soon');
  assert.match(h, /<li class="product-card"[^>]*><a class="product-link" href="#product-glucak-tee"><img class="product-media" src="[^"]+" alt=""/);
  assert.match(h, /<article class="product-detail"[^>]*><img class="product-media" src="[^"]+" alt="Tee &quot;x&quot;"/);
});
