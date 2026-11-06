// Backup download (GET /edit/api/backup) and the owner's CLI restore (tools/backup.mjs): shape, strict photo names,
// dry run, the pre-restore safety copy, and every way a hostile backup file is refused.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const product = (o = {}) => ({ id: 'tee', name: 'Tee', type: 'shirt', price: 2500, image: '/media/shop/tee.webp', status: 'available', link: 'https://example.com/p', order: 0, ...o });
writeFileSync(join(dir, 'shipped-shows.json'), JSON.stringify([{ date: d(10), type: 'show', venue: 'Shipped Venue', city: 'PA' }]));
writeFileSync(join(dir, 'shipped-products.json'), JSON.stringify([product()]));
const ENV = { DIST_DIR: dir, DATA_DIR: data, SHOWS_FILE: join(dir, 'shipped-shows.json'), PRODUCTS_FILE: join(dir, 'shipped-products.json') };
Object.assign(process.env, ENV, { SESSION_SECRET: 's'.repeat(48), EDITOR_USERS: `alex:${hashPassword('alexs long password')}` });
delete process.env.DEV_EDITOR;
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

const hex = 'ab'.repeat(16), other = 'cd'.repeat(16);
const png = () => sharp({ create: { width: 40, height: 30, channels: 3, background: '#ff4d2e' } }).png().toBuffer();
const webp = await sharp(await png()).webp().toBuffer();
writeFileSync(join(ups, `${hex}.webp`), webp);
writeFileSync(join(ups, 'evil.webp'), 'x'); // not a server-made name: never in a backup
writeFileSync(join(ups, `${hex}.png`), 'x');
mkdirSync(join(ups, `${'12'.repeat(16)}.webp`)); // a folder with an upload's name is not a file

const cli = (...args) => spawnSync(process.execPath, [join(import.meta.dirname, '../tools/backup.mjs'), ...args], { env: { ...process.env, ...ENV }, encoding: 'utf8', cwd: dir });
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
  const cookie = login.headers.get('set-cookie').split(';')[0];
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
  assert.deepEqual(b.products, [product()]);
  assert.deepEqual(Object.keys(b.uploads), [`${hex}.webp`], 'strict names only');
  assert.deepEqual(Buffer.from(b.uploads[`${hex}.webp`], 'base64'), webp, 'base64 round-trips');
});

test('export: same format as the download', () => {
  const r = cli('export', 'out.json');
  assert.equal(r.status, 0, r.stderr);
  const b = JSON.parse(readFileSync(join(dir, 'out.json'), 'utf8'));
  assert.equal(b.format, 'glucak-backup');
  assert.deepEqual(Object.keys(b.uploads), [`${hex}.webp`]);
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
    [await backupFile({ products: [product({ image: `/media/uploads/${'ef'.repeat(16)}.webp` })] }), /Product 1: its photo "ef.+" is not in the backup/],
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
