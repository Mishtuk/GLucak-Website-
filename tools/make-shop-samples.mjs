// Renders the placeholder line-art SVGs (prototype/assets/shop/sample-*.svg, L2) as they are to transparent WebP in
// public/media/shop/ (same names). No era colours and no text in the image: the hatch ground and the tape come from CSS.
// Run: node tools/make-shop-samples.mjs
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'prototype/assets/shop');
const OUT = join(ROOT, 'public/media/shop');
mkdirSync(OUT, { recursive: true });

for (const f of readdirSync(SRC).filter((n) => /^sample-.*\.svg$/.test(n))) {
  const out = f.replace(/\.svg$/, '.webp');
  await sharp(join(SRC, f)).webp({ quality: 90, alphaQuality: 100 }).toFile(join(OUT, out));
  console.log(`public/media/shop/${out}`);
}
