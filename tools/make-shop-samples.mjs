// Makes the SAMPLE product images for the temporary shop (D36): flat silhouettes in the placeholder era colours,
// labelled SAMPLE. Not merch art, on purpose. Run: node tools/make-shop-samples.mjs -> public/media/shop/sample-*.webp
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const { colors: c } = JSON.parse(readFileSync(join(ROOT, 'src/eras/placeholder.json'), 'utf8'));
const OUT = join(ROOT, 'public/media/shop');
mkdirSync(OUT, { recursive: true });

const shapes = {
  tee: `<path d="M220 170 L330 120 Q400 170 470 120 L580 170 L660 300 L570 340 L560 300 L560 680 L240 680 L240 300 L230 340 L140 300 Z" fill="${c.muted}"/>`,
  hoodie: `<path d="M250 230 L140 600 L200 625 L260 380 L260 690 L540 690 L540 380 L600 625 L660 600 L550 230 Z" fill="${c.muted}"/>
    <path d="M290 250 Q290 110 400 110 Q510 110 510 250 Z" fill="${c.muted}"/><path d="M330 245 Q330 160 400 160 Q470 160 470 245 Z" fill="${c.bg}"/>
    <path d="M310 520 H490 L520 610 H280 Z" fill="none" stroke="${c.bg}" stroke-width="12"/>`,
  'identity-cd': `<rect x="170" y="170" width="460" height="460" rx="14" fill="none" stroke="${c.muted}" stroke-width="14"/>
    <circle cx="400" cy="400" r="190" fill="${c.muted}"/><circle cx="400" cy="400" r="60" fill="${c.bg}"/><circle cx="400" cy="400" r="22" fill="${c.muted}"/>`,
  'identity-vinyl': `<circle cx="400" cy="400" r="280" fill="#000"/>${[250, 220, 190, 160].map((r) => `<circle cx="400" cy="400" r="${r}" fill="none" stroke="#2a2a2a" stroke-width="3"/>`).join('')}
    <circle cx="400" cy="400" r="100" fill="${c.accent}"/><circle cx="400" cy="400" r="10" fill="${c.bg}"/>`,
  sticker: `<path d="M200 200 H600 V520 L520 600 H200 Z" fill="${c.muted}"/><path d="M600 520 L520 520 L520 600 Z" fill="${c.text}"/>`,
};

for (const [name, shape] of Object.entries(shapes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="${c.bg}"/>${shape}
    <rect x="40" y="40" width="250" height="80" fill="${c.accent}"/>
    <text x="165" y="98" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="52" text-anchor="middle" fill="${c['accent-text']}">SAMPLE</text>
    <text x="400" y="760" font-family="Arial, Helvetica, sans-serif" font-size="30" text-anchor="middle" fill="${c.text}">Placeholder, not real merch</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(join(OUT, `sample-${name}.webp`));
  console.log(`public/media/shop/sample-${name}.webp`);
}
