// Backup download (GET /edit/api/backup) and the owner's CLI restore (tools/backup.mjs): shape, strict photo names,
// dry run, the pre-restore safety copy, and every way a hostile backup file is refused.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { hashPassword } from '../src/lib/auth.js';
import { etDay } from '../src/lib/shows.js';

const dir = mkdtempSync(join(tmpdir(), 'gl-backup-'));
const data = join(dir, 'data'), ups = join(data, 'uploads');
mkdirSync(join(dir, 'shows'));
mkdirSync(ups, { recursive: true });
writeFileSync(join(dir, 'shows/index.html'), '<!doctype html><title>t</title><ul><!--gl:shows--></ul>');
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const hex = 'ab'.repeat(16), other = 'cd'.repeat(16), orphan = '0f'.repeat(16);
const product = (o = {}) => ({ id: 'tee', name: 'Tee', type: 'shirt', price: 2500, image: '/media/shop/tee.webp', status: 'available', link: 'https://example.com/p', order: 0, ...o });
writeFileSync(join(dir, 'shipped-shows.json'), JSON.stringify([{ date: d(10), type: 'show', venue: 'Shipped Venue', city: 'PA' }]));
const shipped = product({ image: `/media/uploads/${hex}.webp` });
writeFileSync(join(dir, 'shipped-products.json'), JSON.stringify([shipped]));
const ENV = { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped-shows.json'), PRODUCTS_FILE: join(dir, 'shipped-products.json') };
Object.assign(process.env, ENV, { SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `alex:${hashPassword('alexs long password')}` });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const png = () => sharp({ create: { width: 40, height: 30, channels: 3, background: '#ff4d2e' } }).png().toBuffer();
const webp = await sharp(await png()).webp().toBuffer();
writeFileSync(join(ups, `${hex}.webp`), webp);
writeFileSync(join(ups, `${orphan}.webp`), webp); // a server-made name no product uses: never in a backup
writeFileSync(join(ups, 'evil.webp'), 'x'); // not a server-made name: never in a backup
writeFileSync(join(ups, `${hex}.png`), 'x');
mkdirSync(join(ups, `${'12'.repeat(16)}.webp`)); // a folder with an upload's name is not a file

const cliAt = (dataDir, ...args) => spawnSync(process.execPath, [join(import.meta.dirname, '../tools/backup.mjs'), ...args], { env: { ...process.env, ...ENV, DATA_DIR: dataDir }, encoding: 'utf8', cwd: dir });
const cli = (...args) => cliAt(data, ...args);
// A fresh DATA_DIR for one restore test: { 'relative/path': contents }.
const freshData = (files = {}) => {
  const p = mkdtempSync(join(dir, 'd-'));
  mkdirSync(join(p, 'uploads'));
  for (const [k, v] of Object.entries(files)) writeFileSync(join(p, k), v);
  return p;
};
const tmps = (p) => readdirSync(p, { recursive: true }).filter((x) => String(x).endsWith('.tmp'));
let cookie;
// Run `fn` with DATA_DIR's products.json pointing at one extra upload of `bytes`, then put everything back.
const withPhoto = async (bytes, fn) => {
  const name = `${'9a'.repeat(16)}.webp`, list = join(data, 'products.json'), was = existsSync(list) ? readFileSync(list) : null;
  writeFileSync(join(ups, name), bytes);
  writeFileSync(list, JSON.stringify([product({ image: `/media/uploads/${name}` })]));
  try { await fn(); } finally {
    rmSync(join(ups, name));
    if (was) writeFileSync(list, was); else rmSync(list);
  }
};
// Everything in DATA_DIR (names and bytes), to prove a refused or dry-run restore touched nothing.
const snapshot = (p = data) => readdirSync(p, { withFileTypes: true }).map((f) => [f.name, f.isFile() ? readFileSync(join(p, f.name)).toString('base64') : snapshot(join(p, f.name))]);
let n = 0;
const backupFile = async (o = {}) => {
  const f = join(dir, `in-${++n}.json`);
  const b = { format: 'glucak-backup', version: 1, created: new Date().toISOString(),
    shows: [{ date: d(3), type: 'show', venue: '<script>alert(1)</script> & Co', city: 'Doylestown, PA' }],
    products: [product({ image: `/media/uploads/${other}.webp` })], uploads: { [`${other}.webp`]: (await png()).toString('base64') }, ...o };
  writeFileSync(f, typeof o === 'string' ? o : JSON.stringify(b));
  return f;
};

test('download: 401 signed out; signed in it is one attachment of the live data with only server-named photos', async () => {
  assert.equal((await fetch(`${base}/edit/api/backup`)).status, 401);
  assert.equal((await fetch(`${base}/edit/api/backup`, { headers: { cookie: 'gl_edit=forged.value' } })).status, 401);
  const login = await fetch(`${base}/edit/login`, { method: 'POST', headers: { origin: base, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ username: 'alex', password: 'alexs long password' }) });
  cookie = login.headers.get('set-cookie').split(';')[0];
  const r = await fetch(`${base}/edit/api/backup`, { headers: { cookie } });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-disposition'), `attachment; filename="glucak-backup-${etDay()}.json"`);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  const b = await r.json();
  assert.deepEqual(Object.keys(b), ['format', 'version', 'created', 'shows', 'products', 'uploads']);
  assert.equal(b.format, 'glucak-backup');
  assert.equal(b.version, 1);
  assert.ok(!Number.isNaN(Date.parse(b.created)));
  assert.equal(b.shows[0].venue, 'Shipped Venue', 'falls back to the shipped list');
  assert.deepEqual(b.products, [shipped]);
  assert.deepEqual(Object.keys(b.uploads), [`${hex}.webp`], 'only the photos the products use: strict names, no orphan');
  assert.deepEqual(Buffer.from(b.uploads[`${hex}.webp`], 'base64'), webp, 'base64 round-trips');
});

test('export: same format as the download', () => {
  const r = cli('export', 'out.json');
  assert.equal(r.status, 0, r.stderr);
  const b = JSON.parse(readFileSync(join(dir, 'out.json'), 'utf8'));
  assert.equal(b.format, 'glucak-backup');
  assert.deepEqual(Object.keys(b.uploads), [`${hex}.webp`], 'no orphan');
});

test('download: not compressed even when br is accepted; refused with 403 from a cross-site request', async () => {
  await withPhoto(Buffer.alloc(64 * 1024), async () => { // big and very compressible: send() would brotli it
    const r = await fetch(`${base}/edit/api/backup`, { headers: { cookie, 'accept-encoding': 'br', 'sec-fetch-site': 'same-origin' } });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-encoding'), null);
    assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.match(r.headers.get('content-disposition'), /^attachment; filename="glucak-backup-/);
    const body = await r.text();
    assert.ok(body.length > 80 * 1024, 'sent whole');
    assert.equal(JSON.parse(body).format, 'glucak-backup');
  });
  const x = await fetch(`${base}/edit/api/backup`, { headers: { cookie, 'sec-fetch-site': 'cross-site', origin: 'https://evil.example' } });
  assert.equal(x.status, 403);
});

test('restore refuses a hostile or broken backup and changes nothing', async () => {
  const before = JSON.stringify(snapshot());
  const big = join(dir, 'big.json');
  writeFileSync(big, Buffer.alloc(50 * 1024 * 1024 + 1, 32));
  const cases = [ // [backup file, the reason it must give]
    [await backupFile({ format: 'other' }), /wrong format or version/],
    [await backupFile({ version: 2 }), /wrong format or version/],
    [await backupFile('{nope'), /not JSON/],
    [await backupFile({ shows: [{ date: 'nope', type: 'show', venue: 'V', city: 'C' }] }), /Show 1: Pick a real date/],
    [await backupFile({ products: [product({ link: 'javascript:alert(1)' })] }), /Product 1: The link has to start with https/],
    [await backupFile({ products: [product()], uploads: { '../x.webp': webp.toString('base64') } }), /Photo "\.\.\/x\.webp": bad name/],
    [await backupFile({ products: [product()], uploads: { 'x.png': webp.toString('base64') } }), /Photo "x\.png": bad name/],
    [await backupFile({ products: [product()], uploads: { [`${other}.webp`]: Buffer.from('<html><script>alert(1)</script></html>').toString('base64') } }), /not a photo/],
    [await backupFile({ shows: Array(201).fill({ date: d(3), type: 'show', venue: 'V', city: 'C' }) }), /more than 200 shows/],
    [big, /bigger than 50 MB/],
  ];
  for (const [f, why] of cases) {
    const r = cli('restore', f, '--yes');
    assert.equal(r.status, 1, String(why));
    assert.match(r.stderr, /Not restored/);
    assert.match(r.stderr, why);
  }
  assert.equal(JSON.stringify(snapshot()), before, 'nothing written');
});

test('restore dry run changes nothing; --yes saves the current data first, then replaces it', async () => {
  const f = await backupFile();
  const before = JSON.stringify(snapshot());
  const dry = cli('restore', f);
  assert.equal(dry.status, 0, dry.stderr);
  assert.match(dry.stdout, /Shows: 1 now, 1 in the backup[\s\S]*Photos: 1 in the backup \(1 new[\s\S]*Dry run: nothing was changed/);
  assert.equal(JSON.stringify(snapshot()), before);

  const r = cli('restore', f, '--yes');
  assert.equal(r.status, 0, r.stderr);
  const safety = readdirSync(data).filter((x) => /^pre-restore-.+\.json$/.test(x));
  assert.equal(safety.length, 1);
  const pre = JSON.parse(readFileSync(join(data, safety[0]), 'utf8'));
  assert.equal(pre.shows[0].venue, 'Shipped Venue', 'the safety copy is the data from before');
  assert.deepEqual(Object.keys(pre.uploads), [`${hex}.webp`]);
  assert.match(JSON.parse(readFileSync(join(data, 'shows.json'), 'utf8'))[0].venue, /^<script>/);
  assert.equal(JSON.parse(readFileSync(join(data, 'products.json'), 'utf8'))[0].image, `/media/uploads/${other}.webp`);
  const m = await sharp(readFileSync(join(ups, `${other}.webp`))).metadata(); // the PNG in the backup was re-encoded
  assert.equal(m.format, 'webp');
  assert.ok(!m.exif && !m.icc && !m.xmp);
  assert.ok(!readdirSync(ups).some((x) => x.endsWith('.tmp')), 'no temp files left');

  const html = await (await fetch(`${base}/shows/`)).text(); // the hostile venue stays text on the public page
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; Co'));
  assert.ok(!html.includes('<script>alert'));
  assert.equal((await fetch(`${base}/media/uploads/${other}.webp`)).status, 200);
});

test('restore: a product photo missing from the file but already on disk restores', async () => {
  const p = freshData({ [`uploads/${other}.webp`]: webp });
  const r = cliAt(p, 'restore', await backupFile({ uploads: {} }), '--yes');
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /will be missing/);
  assert.equal(JSON.parse(readFileSync(join(p, 'products.json'), 'utf8'))[0].image, `/media/uploads/${other}.webp`);
});

test('restore: a product photo missing from the file and the disk is a warning; the rest restores', async () => {
  const p = freshData(), f = await backupFile({ uploads: {} });
  const warn = `Product 1: its photo "${other}.webp" is not in the backup, so it will be missing on the Shop page.`;
  const dry = cliAt(p, 'restore', f);
  assert.equal(dry.status, 0, dry.stderr);
  assert.ok(dry.stdout.includes(warn), dry.stdout);
  const r = cliAt(p, 'restore', f, '--yes');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes(warn), r.stdout);
  assert.match(JSON.parse(readFileSync(join(p, 'shows.json'), 'utf8'))[0].venue, /^<script>/);
  assert.equal(JSON.parse(readFileSync(join(p, 'products.json'), 'utf8')).length, 1);
});

test('restore: a failure partway leaves no .tmp and no stack trace, and tells the owner how to go on', async () => {
  const p = freshData();
  mkdirSync(join(p, 'products.prev.json')); // the products save can't keep its .prev copy, so it fails after shows.json is written
  const r = cliAt(p, 'restore', await backupFile(), '--yes');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^Restore stopped partway \(.+\)\. Run the same restore again, or restore .+pre-restore-.+\.json to go back\.$/m);
  assert.doesNotMatch(r.stderr, /\n\s+at /);
  assert.deepEqual(tmps(p), []);
});

test('restore over a damaged list keeps its raw bytes aside and never overwrites the last good .prev with them', async () => {
  const p = freshData({ 'shows.json': '[{"date":', 'shows.prev.json': 'LAST-GOOD' });
  const r = cliAt(p, 'restore', await backupFile(), '--yes');
  assert.equal(r.status, 0, r.stderr);
  const aside = readdirSync(p).filter((x) => x.startsWith('pre-restore-'));
  assert.equal(readFileSync(join(p, aside.find((x) => x.endsWith('.shows.json'))), 'utf8'), '[{"date":');
  assert.equal(readFileSync(join(p, aside.find((x) => x.endsWith('.shows.prev.json'))), 'utf8'), 'LAST-GOOD');
  assert.equal(readFileSync(join(p, 'shows.prev.json'), 'utf8'), 'LAST-GOOD');
  assert.match(JSON.parse(readFileSync(join(p, 'shows.json'), 'utf8'))[0].venue, /^<script>/);
});

test('a backup over the restore cap is refused at download (413) and at export (exit 1)', () =>
  withPhoto(Buffer.alloc(40 * 1024 * 1024), async () => { // 40 MB in base64 is over 50 MB
    const msg = 'This backup is too big for one file. Tell the person who runs the site.';
    const r = await fetch(`${base}/edit/api/backup`, { headers: { cookie } });
    assert.equal(r.status, 413);
    assert.equal((await r.json()).message, msg);
    const x = cli('export', 'too-big.json');
    assert.equal(x.status, 1);
    assert.equal(x.stderr.trim(), msg);
    assert.ok(!existsSync(join(dir, 'too-big.json')));
  }));
