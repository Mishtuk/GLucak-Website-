// The record sleeve for a video Gabe adds (A3, D127). The still is YouTube's own thumbnail, fetched from ONE fixed host
// (i.ytimg.com) at a path built from a checked 11-character id, never from anything he typed. It is read with a timeout and a
// size cap, must start with JPEG bytes, is cut to the centre square and given the site's grey print look with sharp (an
// approximation of tools/film/build.mjs's ffmpeg filters), then written as <id>-320.webp and <id>-640.webp under DATA_DIR/sleeves.
// Server-only (node:fs). Never throws to the caller: a failure just means the video shows with the plain sleeve.
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { ID, STYLES } from './videos.js';

export const THUMB_HOST = 'i.ytimg.com';
export const MAX_THUMB = 2 * 1024 * 1024, THUMB_MS = 5000, SIZES = [320, 640];

/** The one URL we ever fetch. Throws for an id that is not 11 characters of letters, digits, - and _. */
export function thumbUrl(id) {
  if (typeof id !== 'string' || !ID.test(id)) throw new Error('bad_id');
  return `https://${THUMB_HOST}/vi/${id}/hqdefault.jpg`;
}
export const isJpeg = (b) => Buffer.isBuffer(b) && b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

/** The thumbnail's bytes, or null (timeout, redirect, wrong status, over the cap, not a JPEG). A redirect is never followed. */
export async function fetchThumb(id, fetchImpl = fetch, ms = THUMB_MS) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
  try {
    const timedOut = new Promise((_, no) => ctl.signal.addEventListener('abort', () => no(new Error('timeout'))));
    const r = await Promise.race([fetchImpl(thumbUrl(id), { redirect: 'error', signal: ctl.signal, headers: { Accept: 'image/jpeg' } }), timedOut]);
    if (r.status !== 200 || !r.body) return null;
    if (r.url && new URL(r.url).host !== THUMB_HOST) return null;
    if (Number(r.headers.get('content-length')) > MAX_THUMB) return null;
    const parts = [];
    let size = 0;
    for await (const c of r.body) { size += c.length; if (size > MAX_THUMB) { ctl.abort(); return null; } parts.push(c); }
    const buf = Buffer.concat(parts);
    return isJpeg(buf) ? buf : null;
  } catch { return null; } finally { clearTimeout(timer); }
}

// ffmpeg eq: out = (in - 0.5) * contrast + 0.5 + brightness; print also steps to four greys (lutyuv floor(val/64)*85). Blur sigma as build.mjs.
const LOOK = { print: { sigma: 1.2, contrast: 1.45, brightness: 0, steps: true }, toner: { sigma: 1.5, contrast: 2.1, brightness: 0.04 }, mono: { sigma: 0, contrast: 1.25, brightness: 0 } };
const lut = ({ contrast, brightness, steps }) => Uint8Array.from({ length: 256 }, (_, v) => {
  const o = Math.max(0, Math.min(255, Math.round(((v / 255 - 0.5) * contrast + 0.5 + brightness) * 255)));
  return steps ? Math.floor(o / 64) * 85 : o;
});

/** { 320: Buffer, 640: Buffer } (WebP, grey, square) from a JPEG. Throws on anything sharp cannot read. */
export async function makeSleeve(jpeg, style) {
  const { default: sharp } = await import('sharp');
  const look = LOOK[STYLES.includes(style) ? style : 'mono'], map = lut(look), opts = { limitInputPixels: 16e6, failOn: 'error' };
  let src = jpeg;
  try { // hqdefault is letterboxed (black bars): cut them off first, unless that leaves too little
    const t = await sharp(jpeg, opts).trim({ threshold: 24 }).toBuffer({ resolveWithObject: true });
    if (t.info.width >= 120 && t.info.height >= 120) src = t.data;
  } catch { /* keep the whole frame */ }
  const out = {};
  for (const w of SIZES) {
    let p = sharp(src, opts).resize(w, w, { fit: 'cover', position: 'centre' }).grayscale();
    if (look.sigma) p = p.blur(look.sigma);
    const { data, info } = await p.toColourspace('b-w').raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i++) data[i] = map[data[i]];
    out[w] = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).webp({ quality: 74 }).toBuffer();
  }
  return out;
}

/** Fetch, make and write both sleeve files for `id` under `dir`. True when both are there; false on any failure (logged without the id's content). */
export async function saveStill({ id, style, dir, fetchImpl = fetch }) {
  try {
    const jpeg = await fetchThumb(id, fetchImpl);
    if (!jpeg) return false;
    const files = await makeSleeve(jpeg, style);
    mkdirSync(dir, { recursive: true });
    for (const w of SIZES) {
      const tmp = join(dir, `.${id}-${w}.${randomBytes(4).toString('hex')}.tmp`); // never matches a served name
      try { writeFileSync(tmp, files[w]); renameSync(tmp, join(dir, `${id}-${w}.webp`)); } catch (e) { rmSync(tmp, { force: true }); throw e; }
    }
    return true;
  } catch (e) { console.error(new Date().toISOString(), 'sleeve not made:', e?.name, e?.code ?? ''); return false; }
}
