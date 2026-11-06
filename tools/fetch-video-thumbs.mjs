// Download each video's YouTube thumbnail once into public/media/videos/<id>-1280.webp and -640.webp (metadata stripped),
// so pages never ask YouTube for an image. Run: node tools/fetch-video-thumbs.mjs   (re-run when videos.json changes)
// ponytail: skips files that exist; delete a file to refetch it.
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const rows = JSON.parse(readFileSync(new URL('../src/data/videos.json', import.meta.url), 'utf8'));
const OUT = new URL('../public/media/videos/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const path = (n) => new URL(n, OUT).pathname.replace(/^\/([A-Za-z]:)/, '$1');
async function get(id) {
  for (const q of ['maxresdefault', 'hqdefault']) {
    const r = await fetch(`https://i.ytimg.com/vi/${id}/${q}.jpg`);
    if (r.ok) return Buffer.from(await r.arrayBuffer());
  }
  return null;
}
for (const { id } of rows) {
  if (!/^[\w-]{11}$/.test(id) || (existsSync(path(`${id}-1280.webp`)) && existsSync(path(`${id}-640.webp`)))) continue;
  const buf = await get(id);
  if (!buf) { console.log('skip (no thumbnail):', id); continue; }
  for (const w of [1280, 640]) await sharp(buf).resize(w, Math.round(w * 9 / 16), { fit: 'cover', withoutEnlargement: true }).webp({ quality: 78 }).toFile(path(`${id}-${w}.webp`)); // no .withMetadata(): metadata is dropped
  console.log('ok:', id);
}
