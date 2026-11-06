// Backup and restore of DATA_DIR (shows.json, products.json, uploads/*.webp) as one JSON file, shared by the edit
// screen's download (GET /edit/api/backup) and tools/backup.mjs. A backup coming back in is untrusted: every row is
// re-validated and every photo re-encoded by sharp exactly like the upload route, all before anything is written.
// Server-only (node:fs).
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { checkShows, readList, saveList } from './store.js';
import { checkProducts } from './products.js';
import { MAX_BYTES, UPLOAD_NAME, toWebp } from './upload.js';

export const FORMAT = 'glucak-backup', VERSION = 1;
export const MAX_FILE = 50 * 1024 * 1024;
export const MAX_UPLOADS = 1000; // ponytail: orphan uploads count too; the 50 MB cap is the real limit
const B64 = /^[A-Za-z0-9+/]*={0,2}$/;
const uploadsDir = (data) => join(data, 'uploads');

/** The live data as a backup object. `fallback`: { shows, products } shipped files, used until Gabe has saved. */
export function makeBackup(data, fallback) {
  let files = [];
  try { files = readdirSync(uploadsDir(data), { withFileTypes: true }); } catch { /* no uploads yet */ }
  const uploads = {};
  for (const f of files.filter((f) => f.isFile() && UPLOAD_NAME.test(f.name)).sort((a, b) => a.name.localeCompare(b.name))) {
    uploads[f.name] = readFileSync(join(uploadsDir(data), f.name)).toString('base64');
  }
  return { format: FORMAT, version: VERSION, created: new Date().toISOString(),
    shows: readList(data, fallback.shows, 'shows.json'), products: readList(data, fallback.products, 'products.json'), uploads };
}

const label = (name) => JSON.stringify(String(name).slice(0, 80)); // quoted and escaped: a hostile name can't drive the terminal

/** Check a backup file's text. Returns { shows, products, uploads: Map<name, webp> } or { errors: [{ row, message }] }. */
export async function checkBackup(text) {
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
  (p.rows ?? []).forEach((r, i) => {
    const up = r.image.match(/^\/media\/uploads\/(.+)$/)?.[1];
    if (up && !uploads.has(up)) errors.push({ row: i, message: `Product ${i + 1}: its photo ${label(up)} is not in the backup.` });
  });
  return errors.length ? { errors } : { shows: s.rows, products: p.rows, uploads };
}

/** Write a checked backup: photos first (temp + rename), then shows.json and products.json (atomic, old one kept as .prev). */
export function writeBackup(data, r, fallback) {
  mkdirSync(uploadsDir(data), { recursive: true });
  for (const [name, buf] of r.uploads) {
    const tmp = join(uploadsDir(data), `${name}.${randomBytes(4).toString('hex')}.tmp`); // never matches UPLOAD_NAME, so never served
    writeFileSync(tmp, buf);
    renameSync(tmp, join(uploadsDir(data), name));
  }
  saveList(data, r.shows, fallback.shows, 'shows.json');
  saveList(data, r.products, fallback.products, 'products.json');
}
