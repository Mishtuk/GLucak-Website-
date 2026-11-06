// Live shows storage for the edit screen. Gabe's saved list lives in DATA_DIR (outside the build), so the public pages
// pick it up on the next request. Server-only (node:fs): never import this from an Astro page.
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { validateShow } from './shows.js';

export const MAX_SHOWS = 200;
const FIELDS = ['date', 'time', 'type', 'venue', 'city', 'with', 'link'];
const OPTIONAL = new Set(['time', 'with', 'link']);
const MAX_LEN = 300;

const PLAIN = {
  'bad date': 'Pick a real date.', 'bad time': 'Pick a time, or leave it empty.', 'bad type': 'Pick Show or Open mic.',
  'bad venue': 'Add the venue.', 'bad city': 'Add the city.', 'bad link': 'The link has to start with https:// (or http://), or leave it empty.',
  'bad with': 'Leave "With" empty or add a name.', 'show must be an object': 'This row is broken. Delete it and add it again.',
};

/** The live file if Gabe has saved, else the shipped list. `name`: shows.json or products.json. */
export const liveFile = (dataDir, fallback, name = 'shows.json') => (existsSync(join(dataDir, name)) ? join(dataDir, name) : fallback);
export const readList = (dataDir, fallback, name) => JSON.parse(readFileSync(liveFile(dataDir, fallback, name), 'utf8'));
/** Content hash of the live list: the edit screen sends it back on save, so a save over someone else's newer save is refused. */
export const listVersion = (dataDir, fallback, name) => createHash('sha256').update(readFileSync(liveFile(dataDir, fallback, name))).digest('hex').slice(0, 16);
export const readShows = (dataDir, fallback) => readList(dataDir, fallback, 'shows.json');
export const showsVersion = (dataDir, fallback) => listVersion(dataDir, fallback, 'shows.json');

/** Keep only the known fields; empty optional fields are dropped. Returns { rows } or { errors: [{ row, message }] }. */
export function checkShows(list) {
  if (!Array.isArray(list)) return { errors: [{ row: null, message: 'Nothing to save.' }] };
  if (list.length > MAX_SHOWS) return { errors: [{ row: null, message: `That's more than ${MAX_SHOWS} shows. Delete some old ones first.` }] };
  const rows = [], errors = [];
  list.forEach((r, i) => {
    const clean = {};
    if (r && typeof r === 'object' && !Array.isArray(r)) {
      for (const k of FIELDS) {
        let v = r[k];
        if (typeof v === 'string') v = v.trim();
        if (OPTIONAL.has(k) && (v === '' || v == null)) continue;
        clean[k] = v;
      }
    }
    try {
      if (FIELDS.some((k) => typeof clean[k] === 'string' && clean[k].length > MAX_LEN)) throw new Error('too long');
      rows.push(validateShow(r && typeof r === 'object' && !Array.isArray(r) ? clean : null));
    } catch (e) {
      errors.push({ row: i, message: `Show ${i + 1}: ${PLAIN[e.message] ?? `Keep each field under ${MAX_LEN} characters.`}` });
    }
  });
  return errors.length ? { errors } : { rows };
}

/** Atomic save: write a temp file, keep the current list as <name>.prev.json, then rename over <name>.json. */
export function saveList(dataDir, rows, fallback, name = 'shows.json') {
  mkdirSync(dataDir, { recursive: true });
  const file = join(dataDir, name);
  const tmp = join(dataDir, `${name}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`);
  writeFileSync(tmp, `${JSON.stringify(rows, null, 2)}\n`);
  const current = liveFile(dataDir, fallback, name);
  if (current && existsSync(current)) copyFileSync(current, join(dataDir, name.replace(/\.json$/, '.prev.json')));
  renameSync(tmp, file);
}
export const saveShows = (dataDir, rows, fallback) => saveList(dataDir, rows, fallback, 'shows.json');
