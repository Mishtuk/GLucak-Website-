// Edit history (D125, DESIGN 31f): the last 10 saved versions of each edit tab, kept in DATA_DIR/history/<kind>/ so a
// mistake can be undone after Save. Server-made names only (<UTC stamp>-<8 hex>.json); nothing a client sends ever
// becomes a path. History is not part of a backup (src/lib/backup.js reads only the four data files and uploads/).
// Server-only (node:fs).
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes, randomInt } from 'node:crypto';
import { join } from 'node:path';

/** The tabs that have a History. identity and bio are the two halves of site.json; the rest are one file each. */
export const KINDS = ['shows', 'releases', 'products', 'identity', 'bio'];
export const KEEP = 10;
export const ID = /^\d{8}T\d{9}Z-[0-9a-f]{8}$/; // 20261123T161200123Z-1a2b3c4d: sortable, never a path
const FILE = /^(\d{8}T\d{9}Z-[0-9a-f]{8})\.json$/;

const dirOf = (data, kind) => {
  if (!KINDS.includes(kind)) throw new Error('unknown history kind');
  return join(data, 'history', kind);
};
const stamp = (d) => d.toISOString().replace(/[-:.]/g, '');
const msOf = (id) => Date.parse(`${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}T${id.slice(9, 11)}:${id.slice(11, 13)}:${id.slice(13, 15)}.${id.slice(15, 18)}Z`);
const isTime = (s) => typeof s === 'string' && !Number.isNaN(Date.parse(s));

/** What a history entry keeps of a saved list: Releases without IDENTITY (its own tab owns that row), IDENTITY and Bio only their own fields. */
export function contentOf(kind, x) {
  if (kind === 'shows' || kind === 'products') return Array.isArray(x) ? x : null;
  if (kind === 'releases') return Array.isArray(x) ? x.filter((r) => r?.title !== 'IDENTITY') : null;
  if (kind === 'identity') return { identity: x?.identity && typeof x.identity === 'object' ? { date: x.identity.date, link: x.identity.link } : undefined };
  if (kind === 'bio') return { homeBio: x?.homeBio, bio: x?.bio };
  return null;
}

const ids = (dir) => {
  try { return readdirSync(dir).map((n) => FILE.exec(n)?.[1]).filter(Boolean).sort(); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
};

/** The entry's file, or { gone: true } (no such file) / { bad: true } (not a history file). Never throws for a bad id or kind. */
export function readEntry(data, kind, id) {
  if (!KINDS.includes(kind) || typeof id !== 'string' || !ID.test(id)) return { gone: true };
  let text;
  try { text = readFileSync(join(dirOf(data, kind), `${id}.json`), 'utf8'); } catch (e) { return e.code === 'ENOENT' ? { gone: true } : { bad: true }; }
  try {
    const o = JSON.parse(text);
    return o && typeof o === 'object' && isTime(o.at) && 'data' in o ? { id, at: o.at, data: o.data } : { bad: true };
  } catch { return { bad: true }; }
}

/** Newest first, at most KEEP. A damaged file is left out of the list (it can never be restored). A folder that can't be read throws. */
export function listHistory(data, kind) {
  const dir = dirOf(data, kind);
  return ids(dir).reverse().slice(0, KEEP).map((id) => readEntry(data, kind, id)).filter((e) => e.id);
}

/** Keep `content` as the newest entry (skipped when it equals the newest one: pressing Save twice adds nothing), then drop the oldest past KEEP. Atomic: temp file, rename. */
export function recordHistory(data, kind, content, at = new Date()) {
  const dir = dirOf(data, kind);
  mkdirSync(dir, { recursive: true });
  const all = ids(dir), newest = all.length ? readEntry(data, kind, all[all.length - 1]) : null;
  if (newest?.id && JSON.stringify(newest.data) === JSON.stringify(content)) return null;
  if (all.length && at.getTime() <= msOf(all[all.length - 1])) at = new Date(msOf(all[all.length - 1]) + 1); // newest stays newest, even in the same millisecond or after a clock step back
  const id = `${stamp(at)}-${randomBytes(4).toString('hex')}`;
  const tmp = join(dir, `.${id}.${process.pid}.tmp`); // never matches FILE, so never listed
  try {
    writeFileSync(tmp, JSON.stringify({ at: at.toISOString(), data: content }));
    renameSync(tmp, join(dir, `${id}.json`));
  } catch (e) { rmSync(tmp, { force: true }); throw e; }
  for (const old of [...all, id].slice(0, -KEEP)) rmSync(join(dir, `${old}.json`), { force: true });
  return id;
}

const CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // A-Z and 2-9 without O, I, 0, 1: a code he can read out over the phone
/** A 6-character code to put in a server-failure reply and in the log line for that failure. */
export const errorCode = () => Array.from({ length: 6 }, () => CODE[randomInt(CODE.length)]).join('');
