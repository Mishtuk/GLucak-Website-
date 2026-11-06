// Backup and restore of DATA_DIR (shows.json, products.json, uploads/*.webp) as one JSON file, shared by the edit
// screen's download (GET /edit/api/backup) and tools/backup.mjs. A backup coming back in is untrusted: every row is
// re-validated and every photo re-encoded by sharp exactly like the upload route, all before anything is written.
// Server-only (node:fs).
import { lstatSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { checkShows, readList, saveList } from './store.js';
import { checkProducts } from './products.js';
import { MAX_BYTES, UPLOAD_NAME, toWebp } from './upload.js';

export const FORMAT = 'glucak-backup', VERSION = 1;
export const MAX_FILE = 50 * 1024 * 1024;
export const MAX_UPLOADS = 1000; // ponytail: only photos the products use; the 50 MB cap is the real limit
export const TOO_BIG = 'This backup is too big for one file. Tell the person who runs the site.';
const B64 = /^[A-Za-z0-9+/]*={0,2}$/;
const uploadsDir = (data) => join(data, 'uploads');
const photoOf = (image) => String(image ?? '').match(/^\/media\/uploads\/(.+)$/)?.[1];

/** The live data as a backup object, with only the photos the products use (orphan uploads are never shown).
 * `fallback`: { shows, products } shipped files, used until Gabe has saved. */
export function makeBackup(data, fallback) {
  let products = readList(data, fallback.products, 'products.json'); // first: every photo it names is on disk by now
  if (!Array.isArray(products)) products = [];
  const uploads = {};
  for (const name of [...new Set(products.map((p) => photoOf(p?.image)))].filter((n) => n && UPLOAD_NAME.test(n)).sort()) {
    const f = join(uploadsDir(data), name);
    if (lstatSync(f, { throwIfNoEntry: false })?.isFile()) uploads[name] = readFileSync(f).toString('base64'); // not a symlink or folder
  }
  return { format: FORMAT, version: VERSION, created: new Date().toISOString(),
    shows: readList(data, fallback.shows, 'shows.json'), products, uploads };
}
/** makeBackup as the bytes of one file. Callers refuse it over MAX_FILE (restore would): TOO_BIG. */
export const backupBytes = (data, fallback) => Buffer.from(JSON.stringify(makeBackup(data, fallback)));

const label = (name) => JSON.stringify(String(name).slice(0, 80)); // quoted and escaped: a hostile name can't drive the terminal

/** Check a backup file's text. `data`: DATA_DIR, where a product's photo may already be. Returns
 * { shows, products, uploads: Map<name, webp>, warnings: [message] } or { errors: [{ row, message }] }. */
export async function checkBackup(text, data) {
  const fail = (message) => ({ errors: [{ row: null, message }] });
  if (Buffer.byteLength(text) > MAX_FILE) return fail('The backup is bigger than 50 MB.');
  let b;
  try { b = JSON.parse(text); } catch { return fail('That file is not a backup (not JSON).'); }
  if (b?.format !== FORMAT || b.version !== VERSION) return fail('That file is not a GLucak backup (wrong format or version).');
  if (!b.uploads || typeof b.uploads !== 'object' || Array.isArray(b.uploads)) return fail('The backup has no photo list.');
  const names = Object.keys(b.uploads);
  if (names.length > MAX_UPLOADS) return fail(`The backup has more than ${MAX_UPLOADS} photos.`);
  const s = checkShows(b.shows), p = checkProducts(b.products);
  const errors = [...(s.errors ?? []), ...(p.errors ?? [])], uploads = new Map();
  for (const name of names) {
    const v = b.uploads[name];
    const bad = (why) => errors.push({ row: null, message: `Photo ${label(name)}: ${why}` });
    if (!UPLOAD_NAME.test(name)) { bad('bad name (must be 32 hex characters + .webp).'); continue; }
    if (typeof v !== 'string' || v.length % 4 || !B64.test(v)) { bad('not base64.'); continue; }
    const buf = Buffer.from(v, 'base64');
    if (buf.length > MAX_BYTES) { bad('over 5 MB.'); continue; }
    try { uploads.set(name, await toWebp(buf)); } catch (e) { bad(e.message === 'too_many_pixels' ? 'over 40 megapixels.' : 'not a photo.'); }
  }
  const onDisk = (name) => { try { return statSync(join(uploadsDir(data), name)).isFile(); } catch { return false; } };
  const warnings = []; // a photo missing from the file and the disk: that product shows without it, the rest restores
  (p.rows ?? []).forEach((r, i) => {
    const up = photoOf(r.image);
    if (up && !uploads.has(up) && !onDisk(up)) warnings.push(`Product ${i + 1}: its photo ${label(up)} is not in the backup, so it will be missing on the Shop page.`);
  });
  return errors.length ? { errors } : { shows: s.rows, products: p.rows, uploads, warnings };
}

/** Write a checked backup: photos first (temp + rename), then shows.json and products.json (atomic, old one kept as .prev). */
export function writeBackup(data, r, fallback) {
  mkdirSync(uploadsDir(data), { recursive: true });
  for (const [name, buf] of r.uploads) {
    const tmp = join(uploadsDir(data), `${name}.${randomBytes(4).toString('hex')}.tmp`); // never matches UPLOAD_NAME, so never served
    try { writeFileSync(tmp, buf); renameSync(tmp, join(uploadsDir(data), name)); } catch (e) { rmSync(tmp, { force: true }); throw e; }
  }
  saveList(data, r.shows, fallback.shows, 'shows.json');
  saveList(data, r.products, fallback.products, 'products.json');
}
