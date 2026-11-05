// Fetch release covers once into public/media/covers/<slug>.webp from Spotify oEmbed thumbnails (released only;
// upcoming art comes from Gabe), up to 640px webp (never enlarged) with no metadata. Sets "cover" in src/data/releases.json. Run: node tools/fetch-covers.mjs
// ponytail: one-off helper, run again when a new release lands; no retries, prints what it skipped.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const FILE = new URL('../src/data/releases.json', import.meta.url);
const OUT = new URL('../public/media/covers/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Spotify album pages for releases whose link is a smart link (looked up on Spotify, 2026-11-05).
const SPOTIFY = { 'Duck, Dodge, Jump, Fight': 'https://open.spotify.com/album/2iqCg8nP9pG9LdJMDzSBQl', Go: 'https://open.spotify.com/album/7xGNoJG3cbvBbiCueRqgNs' };

async function imageUrl(r) {
  const src = SPOTIFY[r.title] ?? r.link;
  // Spotify only: smart-link og:images are wide, blurry promo cards whose square crop cuts the title off.
  if (src.includes('open.spotify.com')) return (await (await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(src)}`)).json()).thumbnail_url;
  return null;
}

const rows = JSON.parse(readFileSync(FILE, 'utf8'));
for (const r of rows) {
  try {
    const url = await imageUrl(r);
    if (!url || !/^https:\/\//.test(url)) { console.log('skip (no image):', r.title); continue; }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const name = `${slug(r.title)}.webp`;
    await sharp(buf).resize(640, 640, { fit: 'cover', withoutEnlargement: true }).webp({ quality: 80 }).toFile(new URL(name, OUT).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
    r.cover = `/media/covers/${name}`;
    console.log('ok:', r.title, '<-', url);
  } catch (e) { console.log('skip:', r.title, e.message); }
}
writeFileSync(FILE, '[\n' + rows.map((r) => '  ' + JSON.stringify(r)).join(',\n') + '\n]\n');
