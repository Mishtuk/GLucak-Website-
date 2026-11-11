// Round IG4 texture family (DESIGN 23): the hero B riso the owner liked, printed in other ways for the other photo slots.
// Sibling of run.mjs (same print model, helpers copied so run.mjs stays untouched): real photos and video stills from
// assets/, screened by hand-written code with sharp. No AI, no upscaling (load() refuses), no generative fill, static only.
//
// node tools/photo/texture.mjs                  -> every slot, era src/eras/placeholder.json, into public/media/ (new names)
// node tools/photo/texture.mjs --era path.json  -> same with another era, into docs/review/ig4/textures/<era-name>/
// node tools/photo/texture.mjs --only=night,belt -> some slots; --only=sheet re-makes the contact sheet only
//
// Every ink and paper colour comes from the era file (bg = ink and black stock, text = paper and white ink, accent = the
// spot colour), so an era swap is one re-run. The hero wall is a colourless 1-bit mask: CSS colours it with an era token.
// Seeded randomness: the same inputs give the same pixels. sharp writes no EXIF / XMP / ICC (no withMetadata()).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync, mkdirSync, statSync } from 'node:fs';
const ROOT = fileURLToPath(new URL('../../', import.meta.url)).replace(/\\/g, '/');
const require = createRequire(ROOT + 'package.json');
const sharp = require('sharp');

const KEALEY = ROOT + 'assets/from-gabe/live-alexander-kealey.jpg';
const SOCIAL = ROOT + 'assets/from-gabe/social/';
const STAGE = SOCIAL + 'yt-aZNW63M_C2E-2.webp';  // Crooked Eye, stage wide (= public/media/v2/stage-634)
const BELT = SOCIAL + 'yt-aZNW63M_C2E-4.webp';   // Crooked Eye, arm raised (= v2/belt-634)
const GARAGE = SOCIAL + 'yt-K-OZiNvQB14-1.webp'; // Duck, Dodge, Jump, Fight video, tire shop (= v2/garage-874)

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.findIndex(a => a === `--${k}` || a.startsWith(`--${k}=`)); return i < 0 ? d : argv[i].includes('=') ? argv[i].split('=').slice(1).join('=') : argv[i + 1] ?? d; };
const ERA_FILE = arg('era', ROOT + 'src/eras/placeholder.json'), era = JSON.parse(readFileSync(ERA_FILE, 'utf8'));
const DEFAULT = /placeholder\.json$/.test(ERA_FILE);
const OUT = DEFAULT ? ROOT + 'public/media/' : ROOT + 'docs/review/ig4/textures/' + era.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '/';
const SHEET_DIR = ROOT + 'docs/review/ig4/design/';
const only = arg('only', 'night,stage,garage,belt,crowd,wall,sheet').split(',');
mkdirSync(OUT, { recursive: true }); mkdirSync(OUT + 'v2/', { recursive: true }); mkdirSync(SHEET_DIR, { recursive: true });

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const BG = hex(era.colors.bg), TEXT = hex(era.colors.text), ACCENT = hex(era.colors.accent);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

// ---------- randomness (as run.mjs) ----------
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(6.2831853 * r()); }
async function noise(w, h, seed, blur = 0.6) {
  const r = rng(seed), b = Buffer.alloc(w * h);
  for (let i = 0; i < b.length; i++) b[i] = clamp(0.5 + gauss(r) * 0.15) * 255;
  const out = blur > 0.3 ? await sharp(b, { raw: { width: w, height: h, channels: 1 } }).blur(blur).extractChannel(0).raw().toBuffer() : b;
  const f = new Float32Array(w * h); let s = 0, s2 = 0;
  for (let i = 0; i < f.length; i++) { f[i] = out[i] / 255; s += f[i]; s2 += f[i] * f[i]; }
  const m = s / f.length, sd = Math.sqrt(s2 / f.length - m * m) || 1;
  for (let i = 0; i < f.length; i++) f[i] = (f[i] - m) / sd;
  return f;
}
async function cloud(w, h, seed, cell = 24) {
  const cw = Math.max(2, Math.round(w / cell)), ch = Math.max(2, Math.round(h / cell)), r = rng(seed), b = Buffer.alloc(cw * ch);
  for (let i = 0; i < b.length; i++) b[i] = r() * 255;
  const up = await sharp(b, { raw: { width: cw, height: ch, channels: 1 } }).resize(w, h, { kernel: 'cubic' }).blur(cell / 3).extractChannel(0).raw().toBuffer();
  const f = new Float32Array(w * h); for (let i = 0; i < f.length; i++) f[i] = (up[i] / 255 - 0.5) * 2.4; return f;
}

// ---------- I/O ----------
async function load(src, region, w, h) {
  let p = sharp(src); if (region) p = p.extract(region);
  const { data, info } = await p.resize(w, h, { kernel: 'lanczos3', withoutEnlargement: true, fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== w || info.height !== h) throw new Error(`refusing to upscale ${src} to ${w}x${h}`);
  const f = new Float32Array(data.length); for (let i = 0; i < f.length; i++) f[i] = data[i] / 255;
  return { w, h, d: f };
}
function levels(f, lo = 0.01, hi = 0.99) {
  const s = []; for (let i = 0; i < f.length; i += 7) s.push(f[i]); s.sort((a, b) => a - b);
  const a = s[Math.floor(lo * (s.length - 1))], b = s[Math.floor(hi * (s.length - 1))], r = new Float32Array(f.length);
  for (let i = 0; i < f.length; i++) r[i] = clamp((f[i] - a) / (b - a || 1)); return r;
}
async function blurField(f, w, h, sigma) {
  const b = Buffer.alloc(w * h); for (let i = 0; i < b.length; i++) b[i] = clamp(f[i]) * 255;
  const o = await sharp(b, { raw: { width: w, height: h, channels: 1 } }).blur(Math.max(0.3, sigma)).extractChannel(0).raw().toBuffer();
  const r = new Float32Array(w * h); for (let i = 0; i < r.length; i++) r[i] = o[i] / 255; return r;
}
const made = [];
async function save(img, name, quality = 78) { // 'lossless' for binary plates
  const ch = img.a ? 4 : 3, b = Buffer.alloc(img.w * img.h * ch);
  for (let i = 0; i < img.w * img.h; i++) { for (let c = 0; c < 3; c++) b[i * ch + c] = clamp(img.d[i * 3 + c]) * 255 + 0.5; if (img.a) b[i * 4 + 3] = clamp(img.a[i]) * 255 + 0.5; }
  const file = OUT + name + '.webp';
  await sharp(b, { raw: { width: img.w, height: img.h, channels: ch } }).webp(quality === 'lossless' ? { lossless: true, effort: 6 } : { quality, effort: 6, smartSubsample: true }).toFile(file);
  const kb = Math.round(statSync(file).size / 1024); made.push({ name, px: `${img.w}x${img.h}`, kb });
  if (kb > 150) console.warn(`  WARN ${name} is ${kb} KB (> 150)`);
  return file;
}

// ---------- screens ----------
// Clustered dot (as run.mjs): threshold = the spot function's area rank, so ink coverage equals tone density.
const RANK = (() => { const n = 400, v = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) v.push(0.5 + 0.25 * (Math.cos(6.2832 * i / n) + Math.cos(6.2832 * j / n))); v.sort((a, b) => b - a); const t = new Float32Array(1025); let k = 0; for (let q = 1024; q >= 0; q--) { const s = q / 1024; while (k < v.length && v[k] >= s) k++; t[q] = k / v.length; } return t; })();
function dotAt(x, y, pitch, ang) {
  const c = Math.cos(ang), s = Math.sin(ang), u = (x * c + y * s) * 6.2832 / pitch, v = (-x * s + y * c) * 6.2832 / pitch;
  return RANK[Math.round((0.5 + 0.25 * (Math.cos(u) + Math.cos(v))) * 1024)];
}
// Line screen: straight parallel lines whose width carries the tone (coverage = density), like a line-screen engraving.
function lineAt(x, y, pitch, ang) { const u = (x * Math.cos(ang) + y * Math.sin(ang)) / pitch; return Math.abs(u - Math.floor(u) - 0.5) * 2; }
// One binary plate. density 0..1 (1 = full ink). shift / skew = this plate's misregistration (fixed in the pixels).
async function plate(density, w, h, { pitch, angle, spot = dotAt, rough = 0.06, seed = 1, dx = 0, dy = 0, skew = 0, gain = 0.9, mott = null, floor = 0.03 }) {
  const n = await noise(w, h, seed, 0.5), ink = new Float32Array(w * h), ang = angle * Math.PI / 180;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = x - dx + skew * (y - h / 2), sy = y - dy - skew * (x - w / 2);
    const ix = Math.min(w - 1, Math.max(0, Math.round(sx))), iy = Math.min(h - 1, Math.max(0, Math.round(sy)));
    const i = y * w + x, dens = (density[iy * w + ix] ** gain) * (mott ? 1 + 0.09 * mott[i] : 1), t = spot(x, y, pitch, ang) + rough * n[i];
    ink[i] = dens > floor && dens > t && n[i] > -2.9 ? 1 : 0;
  }
  return ink;
}
// Flat stock with sparse recycled-paper flecks (as run.mjs).
async function stock(w, h, seed, base, fleck = 0.86) {
  const t = await noise(w, h, seed + 1, 0.7), d = new Float32Array(w * h * 3);
  for (let i = 0, p = 0; i < w * h; i++, p += 3) { const k = t[i] > 3.0 ? fleck : 1; d[p] = base[0] * k; d[p + 1] = base[1] * k; d[p + 2] = base[2] * k; }
  return { w, h, d };
}
// Translucent ink on paper (multiply).
function inkOn(img, ink, colour, strength = 0.95) {
  for (let i = 0, p = 0; i < ink.length; i++, p += 3) { const a = ink[i] * strength; for (let c = 0; c < 3; c++) img.d[p + c] *= 1 - a * (1 - colour[c]); }
  return img;
}
// Opaque light ink on dark stock (lays over what is there).
function inkOver(img, ink, colour, strength = 0.94) {
  for (let i = 0, p = 0; i < ink.length; i++, p += 3) { const a = ink[i] * strength; for (let c = 0; c < 3; c++) img.d[p + c] += (colour[c] - img.d[p + c]) * a; }
  return img;
}
const field = (img, fn) => { const f = new Float32Array(img.w * img.h); for (let i = 0, p = 0; i < f.length; i++, p += 3) f[i] = fn(img.d[p], img.d[p + 1], img.d[p + 2]); return f; };

// ---------- check: text over a texture, measured the way the eye sees a screen (blurred by one screen period) ----------
// WCAG 2 against `text`, on the 95th-percentile pixel of the zone. CSS scrims are NOT counted (conservative).
async function textCheck(img, name, zone, sigma, floor = 4.5) {
  const L = new Float32Array(img.w * img.h); for (let i = 0, p = 0; i < L.length; i++, p += 3) L[i] = relLum([img.d[p], img.d[p + 1], img.d[p + 2]].map(clamp));
  const B = await blurField(L.map(v => Math.sqrt(v)), img.w, img.h, sigma); // blur in sqrt space keeps 8-bit precision in the darks
  const v = []; for (let y = Math.floor(zone.y0 * img.h); y < zone.y1 * img.h; y += 2) for (let x = Math.floor(zone.x0 * img.w); x < zone.x1 * img.w; x += 2) v.push(B[y * img.w + x] ** 2);
  v.sort((a, b) => a - b); const p95 = v[Math.floor(v.length * 0.95)], cr = (relLum(TEXT) + 0.05) / (p95 + 0.05);
  console.log(`  check ${name}: text on the zone's 95th-percentile (screen-blurred) = ${cr.toFixed(2)}:1 ${cr >= floor ? 'PASS' : 'FAIL'} (${floor}:1)`);
  if (cr < floor) process.exitCode = 1;
  return cr;
}

// ======================= night: hero A on phones, the riso on black stock =======================
// The hero B riso turned over: black stock (bg), accent for the mid-tones, white ink (text) for the highlights, a fine
// screen so his face holds at phone size; the white screen lands 1.5 px off. In Kealey's frame the blue wall is brighter
// than his face, so plain tone would print the wall and lose him. Separated the way a printer cuts a mask: by colour.
// Where blue leads red (the lit wall) the tone is held at a low flat value (sparse accent on black); on Gabe (skin, hair,
// shirt, mic: red >= blue) the tone is his own, stretched to his own percentiles. Global, per pixel: no fill, no AI.
// Under the name the plates are held down (white out, accent capped) so GLUCAK and the slogan keep 4.5:1 with no scrim.
async function night() {
  const port = { left: 1290, top: 1300, width: 920, height: 1150 }, w = 800, h = 1000, pitch = 4.4;
  const img = await load(KEALEY, port, w, h);
  const wallness = await blurField(field(img, (r, g, b) => smooth(0.2, 0.5, b - r)), w, h, 2.5);
  const V = await blurField(field(img, (r, g, b) => Math.max(r, g, b)), w, h, pitch * 0.3);
  const onHim = []; for (let i = 0; i < V.length; i += 5) if (wallness[i] < 0.3) onHim.push(V[i]); onHim.sort((a, b) => a - b);
  const lo = onHim[Math.floor(onHim.length * 0.03)], hi = onHim[Math.floor(onHim.length * 0.985)];
  const T = V.map((v, i) => { const t = clamp((v - lo) / (hi - lo)) ** 0.62; return t + (0.2 - t) * wallness[i]; });
  const dA = new Float32Array(w * h), dW = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const z = smooth(355, 405, y);                                   // 0 above his mouth, 1 under the name (file y >= 405)
    for (let x = 0; x < w; x++) { const i = y * w + x, t = T[i];
      dA[i] = smooth(0.06, 0.5, t) * (0.9 - 0.36 * z);
      dW[i] = smooth(0.34, 0.85, t) * 0.92 * (1 - z); }
  }
  const out = await stock(w, h, 71, BG, 1.6), mott = await cloud(w, h, 72, 18);
  inkOver(out, await plate(dA, w, h, { pitch, angle: 15, seed: 73, rough: 0.07, mott }), ACCENT, 0.95);
  inkOver(out, await plate(dW, w, h, { pitch, angle: 45, seed: 74, rough: 0.07, dx: 1.5, dy: 1, mott }), TEXT, 0.93);
  await textCheck(out, 'a-night-phone-800 (name + slogan zone)', { x0: 0, x1: 1, y0: 0.405, y1: 1 }, pitch);
  await save(out, 'a-night-phone-800', 'lossless');
}

// ======================= stage: Live It Loud side photo (from 900px), white line screen on black stock =======================
// One ink, paper-white, on black stock, a 30-degree line screen: the stage lights and his white shirt become thick lines,
// the dark room the stock. Screened at each file's own size.
async function stageLines() {
  for (const [w, h, pitch, seed] of [[634, 1128, 3.8, 81], [360, 640, 2.8, 82]]) {
    const img = await load(STAGE, null, w, h);
    const base = await blurField(field(img, (r, g, b) => 0.3 * Math.max(r, g, b) + 0.7 * lum(r, g, b)), w, h, pitch * 0.3), wide = await blurField(base, w, h, 9 * w / 634);
    // local contrast first (his face sits in the dark beside the stage lights), then the curve, so face and glasses survive the lines
    const T = levels(base.map((v, i) => v + 0.25 * (v - wide[i])), 0.04, 0.985);
    const dW = T.map(t => smooth(0.02, 0.9, t ** 1.4) * 0.88);
    const out = await stock(w, h, seed, BG, 1.7);
    inkOver(out, await plate(dW, w, h, { pitch, angle: -30, spot: lineAt, seed: seed + 1, rough: 0.05, floor: 0.06 }), TEXT, 0.94);
    await save(out, `v2/stage-lines-${w}`, 'lossless');
  }
}

// ======================= garage: Rise side photo (from 900px), photocopy halftone =======================
// A photocopier's coarse screen, not a hard threshold: the frame is cropped to Gabe (the 874px source is cut to its right
// 640px, shipped at native size: no upscale), the pale wall is keyed toward paper by colour (blue leads red) so it prints as
// a few flecks, and local contrast is added before the curve so his glasses, face and the white shirt against the dark
// jacket keep an edge. The tone is then printed as a coarse clustered dot with a clumped toner grain on top, black (bg)
// on paper (text). Global per pixel: no fill, no AI.
async function garageToner() {
  const reg = { left: 234, top: 0, width: 640, height: 360 };
  for (const [w, h, pitch, seed] of [[640, 360, 3.2, 91], [480, 270, 2.6, 92]]) {
    const img = await load(GARAGE, reg, w, h), k = w / 640;
    const L0 = await blurField(field(img, lum), w, h, 0.5), Lb = await blurField(field(img, lum), w, h, 7 * k);
    const wallness = await blurField(field(img, (r, g, b) => smooth(0.08, 0.3, b - r) * smooth(0.35, 0.7, lum(r, g, b))), w, h, 2 * k);
    const raw = L0.map((v, i) => v + 0.9 * (v - Lb[i]));
    const T = levels(raw, 0.02, 0.995).map((t, i) => { const c = clamp(t) ** 1.25; return c + (0.93 - c) * wallness[i] * 0.95; });
    const dens = T.map(t => smooth(0.16, 0.8, 1 - t) * 0.97);
    const ink = await plate(dens, w, h, { pitch, angle: 45, seed, rough: 0.12, gain: 1, floor: 0.07 });
    const out = await stock(w, h, seed + 2, TEXT);
    inkOn(out, ink, BG, 0.97);
    await save(out, `v2/garage-toner-${w === 640 ? 874 : 480}`, 'lossless');
  }
}

// ======================= belt: Push Past Fear photo (Home), two plates pulled by hand, coarse, well off register =======================
// The hero riso's two inks on paper, but a coarse screen and a hand-pulled miss (1% of the width, a hair of skew): the
// accent plate carries the full tone, black only the shadows. A different angle pair from hero B (15 / 75 against 75 / 45).
async function beltPlates() {
  for (const [w, h, pitch, seed] of [[634, 1128, 7, 101], [320, 569, 4.4, 102]]) {
    const img = await load(BELT, null, w, h);
    const T = levels(await blurField(field(img, (r, g, b) => 0.6 * Math.max(r, g, b) + 0.4 * lum(r, g, b)), w, h, pitch * 0.3), 0.03, 0.99);
    const dA = new Float32Array(w * h), dK = new Float32Array(w * h);
    for (let i = 0; i < T.length; i++) { const t = 1 - T[i]; dA[i] = 0.04 + 0.8 * smooth(0.0, 0.8, t); dK[i] = smooth(0.55, 0.98, t) * 0.9; }
    const out = await stock(w, h, seed, TEXT), mott = await cloud(w, h, seed + 5, 22), off = w / 100;
    inkOn(out, await plate(dA, w, h, { pitch, angle: 15, seed: seed + 7, dx: off, dy: off * 0.7, skew: 0.003, rough: 0.08, mott }), ACCENT, 0.92);
    inkOn(out, await plate(dK, w, h, { pitch, angle: 75, seed: seed + 8, rough: 0.07, mott }), BG, 0.96);
    await save(out, `v2/belt-plates-${w}`, 'lossless');
  }
}

// ======================= crowd: About's Push Past Fear photo, halftone only in the shadows =======================
// The (d) tritone as before (same crops: the child and the fans' faces stay out, bottom edge at source y 2440), but its
// shadows are screened: below the mid-tone the print flattens to the mid colour and coarse ink dots carry the dark.
// Highlights and mid-tones stay continuous, with grain. The h1 sits on it: checked at 4.5:1.
function burn(img, cx, cy, strength = 0.35, top = 0.15) {
  const { w, h, d } = img;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const rx = (x / w - cx) / 0.75, ry = (y / h - cy) / 0.8, v = 1 - strength * smooth(0.3, 1.15, Math.sqrt(rx * rx + ry * ry)) - top * (1 - smooth(0, 0.4, y / h));
    const p = (y * w + x) * 3; d[p] *= v; d[p + 1] *= v; d[p + 2] *= v;
  }
  return img;
}
async function grain(img, amount, seed, blur = 0.6) {
  const n = await noise(img.w, img.h, seed, blur), d = img.d;
  for (let i = 0, p = 0; i < n.length; i++, p += 3) { const L = lum(d[p], d[p + 1], d[p + 2]), k = amount * (0.25 + 3 * L * (1 - L)) * n[i]; d[p] += k; d[p + 1] += k; d[p + 2] += k; }
  return img;
}
async function crowdScreen() {
  const wide = { left: 1000, top: 1050, width: 5000, height: 1390 }, phone = { left: 1250, top: 1050, width: 3000, height: 1390 };
  for (const [name, reg, w, h, pitch, q] of [['d-crowd-screen-1600', wide, 1600, 445, 6.5, 60], ['d-crowd-screen-800', wide, 800, 222, 4.2, 74], ['d-crowd-screen-phone-800', phone, 800, 371, 4.6, 70]]) {
    const img = await load(KEALEY, reg, w, h);
    const L = levels(field(img, lum), 0.01, 0.995), mid = mix(BG, ACCENT, 0.5), hi = mix(mix(TEXT, ACCENT, 0.1), mid, 0.38), S = 0.42;
    const dS = new Float32Array(w * h);
    for (let i = 0, p = 0; i < L.length; i++, p += 3) {
      const t = L[i] ** 1.1, flat = Math.max(t, S), c = flat < 0.45 ? mix(BG, mid, smooth(0, 0.45, flat)) : mix(mid, hi, (flat - 0.45) / 0.55);
      img.d[p] = c[0]; img.d[p + 1] = c[1]; img.d[p + 2] = c[2]; dS[i] = smooth(S, 0.0, t) * 0.97;
    }
    burn(img, 0.5, 0.5, 0.3, 0.12);
    await grain(img, w > 1000 ? 0.026 : 0.02, 111, 0.55);
    const ink = await plate(await blurField(dS, w, h, pitch * 0.3), w, h, { pitch, angle: 45, seed: 112, rough: 0.06, floor: 0.05 });
    inkOn(img, ink, BG, 0.9);
    await textCheck(img, name, { x0: 0, x1: 1, y0: 0, y1: 1 }, pitch);
    await save(img, name, q);
  }
}

// ======================= wall: the hero's texture (replaces the glow), from 900px =======================
// The pallet wall and flower cross behind Gabe at that show (Kealey, above every head: source y 1060-2100), as one coarse
// 1-bit screen. Saved as an alpha mask with no colour: CSS paints it in an era token (--line), so it is tone-on-tone,
// era-proof, and static. Cropped above the audience (the first head top is at source y ~2160).
async function wall() {
  const reg = { left: 2540, top: 1060, width: 2800, height: 1040 }, w = 1600, h = 594, pitch = 9;
  const img = await load(KEALEY, reg, w, h);
  const T = levels(await blurField(field(img, lum), w, h, pitch * 0.35), 0.02, 0.98);
  const dens = T.map(t => smooth(0.15, 0.95, t) * 0.62);           // light wood and flowers = dots, the gaps = clear
  const ink = await plate(dens, w, h, { pitch, angle: 45, seed: 121, rough: 0.08, floor: 0.06 });
  const out = { w, h, d: new Float32Array(w * h * 3), a: ink };      // colourless: white RGB, the dot is the alpha
  out.d.fill(1);
  await save(out, 'hero-wall-1600', 'lossless');
}

// ======================= contact sheet: before / after per slot =======================
async function sheet() {
  if (!DEFAULT) return console.log('  (the sheet is made by the default-era run only)');
  const M = ROOT + 'public/media/', W = 2000, pad = 40, gap = 30, items = [], esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let y = 150;
  const row = (title, cells, h) => { items.push({ text: title, x: pad, y: y - 16, size: 24, colour: '#f5f5f5', bold: true }); let x = pad; for (const c of cells) { items.push({ ...c, x, y, h }); x += c.w + gap; } y += h + 110; };
  row('1  Hero A, phones under 900px (D34). Before: era grade, no screen. After: the riso on black stock, fine screen, plates held down under the name.',
    [{ file: M + 'a-era-grade-phone-800.webp', w: 400, label: 'BEFORE', note: 'a-era-grade-phone-800' },
     { file: M + 'a-night-phone-800.webp', w: 400, label: 'AFTER', note: 'a-night-phone-800 (lossless)' },
     { file: M + 'a-night-phone-800.webp', w: 800, crop: { left: 160, top: 180, width: 480, height: 300 }, label: 'AFTER 1:1', note: 'face at file size' }], 500);
  row('2  Hero B from 900px: unchanged, the reference the owner picked ("the textured look at the very top").',
    [{ file: M + 'b-riso-1000.webp', w: 708, label: 'KEEP', note: 'b-riso-600 / -1000' },
     { file: M + 'hero-wall-1600.webp', w: 1200, mask: true, label: 'NEW', note: 'hero-wall-1600: alpha mask, painted --line on bg (replaces the glow)' }], 500);
  row('3  Live It Loud photo (900px+) and 4  Rise photo (900px+). Line screen on black stock; photocopy toner on paper.',
    [{ file: M + 'v2/stage-634.webp', w: 281, label: 'BEFORE', note: 'stage-634' },
     { file: M + 'v2/stage-lines-634.webp', w: 281, label: 'AFTER', note: 'stage-lines-634' },
     { file: M + 'v2/garage-874.webp', w: 640, label: 'BEFORE', note: 'garage-874' },
     { file: M + 'v2/garage-toner-874.webp', w: 640, label: 'AFTER', note: 'garage-toner-874' }], 500);
  row('5  Push Past Fear photo (Home, every width). Two plates, coarse, pulled 1% off register.',
    [{ file: M + 'v2/belt-634.webp', w: 281, label: 'BEFORE', note: 'belt-634' },
     { file: M + 'v2/belt-plates-634.webp', w: 281, label: 'AFTER', note: 'belt-plates-634' },
     { file: M + 'v2/belt-plates-320.webp', w: 117, label: '390', note: '117px' },
     { file: M + 'v2/stage-lines-634.webp', w: 281, crop: { left: 150, top: 230, width: 300, height: 500 }, label: '1:1', note: 'stage-lines, face' },
     { file: M + 'v2/belt-plates-634.webp', w: 281, crop: { left: 150, top: 0, width: 300, height: 500 }, label: '1:1', note: 'belt-plates, face' }], 500);
  row('6  About, Push Past Fear photo (h1 on it). Before: tritone + grain. After: the same, with the shadows screened.',
    [{ file: M + 'd-crowd-1600.webp', w: 940, label: 'BEFORE', note: 'd-crowd-1600' },
     { file: M + 'd-crowd-screen-1600.webp', w: 940, label: 'AFTER', note: 'd-crowd-screen-1600 (+ -800, -phone-800)' }], 261);
  row('Not treated: covers + IDENTITY art (never tinted); YouTube thumbnails (title cards, logos); poster art (already one ink, coarse 45 deg).',
    [{ file: M + 'videos/K-OZiNvQB14-640.webp', w: 400, label: 'KEEP', note: 'video thumbnail, as YouTube shows it' },
     { file: M + 'c-poster-600.webp', w: 225, paper: true, label: 'KEEP', note: 'c-poster-600 (Shows)' },
     { file: M + 'v2/identity-art-480.webp', w: 181, label: 'KEEP', note: 'identity-art' }], 225);
  const H = y - 40, comps = [];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><text x="${pad}" y="66" font-family="Arial" font-weight="700" font-size="40" fill="#f5f5f5">IG4 texture family: one print shop, a different screen per slot</text><text x="${pad}" y="102" font-family="Arial" font-size="22" fill="#9a9a9a">tools/photo/texture.mjs · Gabe's real photos and stills, sharp + hand-written screens, no AI · era ${esc(era.name)} (bg ${era.colors.bg}, text ${era.colors.text}, accent ${era.colors.accent})</text>`;
  for (const it of items) {
    if (it.text) { svg += `<text x="${it.x}" y="${it.y}" font-family="Arial" ${it.bold ? 'font-weight="700"' : ''} font-size="${it.size}" fill="${it.colour}">${esc(it.text)}</text>`; continue; }
    let p = sharp(it.file); if (it.crop) p = p.extract(it.crop);
    let buf;
    if (it.mask) { // paint the mask as the site does: --line (text 26% into bg) on bg
      const meta = await sharp(it.file).metadata(), a = await sharp(it.file).extractChannel(3).raw().toBuffer();
      const line = mix(BG, TEXT, 0.26), rgb = Buffer.alloc(meta.width * meta.height * 3);
      for (let i = 0; i < a.length; i++) for (let c = 0; c < 3; c++) rgb[i * 3 + c] = (BG[c] + (line[c] - BG[c]) * a[i] / 255) * 255;
      buf = await sharp(rgb, { raw: { width: meta.width, height: meta.height, channels: 3 } }).resize(it.w, it.h, { fit: 'contain', background: era.colors.bg }).png().toBuffer();
    } else buf = await p.resize(it.w, it.h, { fit: 'contain', background: it.paper ? era.colors.text : '#000000', kernel: 'lanczos3' }).flatten({ background: it.paper ? era.colors.text : '#000000' }).png().toBuffer();
    const meta = await sharp(buf).metadata();
    comps.push({ input: buf, left: it.x, top: it.y });
    svg += `<text x="${it.x}" y="${it.y + Math.min(it.h, meta.height) + 30}" font-family="Arial" font-weight="700" font-size="20" fill="${it.label.startsWith('AFTER') || it.label === 'NEW' ? era.colors.accent : '#9a9a9a'}">${esc(it.label)}</text><text x="${it.x}" y="${it.y + Math.min(it.h, meta.height) + 56}" font-family="Arial" font-size="18" fill="#c8c8c8">${esc(it.note)}</text>`;
  }
  svg += '</svg>';
  const file = SHEET_DIR + 'textures-sheet.png';
  await sharp({ create: { width: W, height: H, channels: 3, background: '#161616' } }).composite([{ input: Buffer.from(svg), left: 0, top: 0 }, ...comps]).png({ palette: true, colours: 256, quality: 90, effort: 10 }).toFile(file);
  console.log(`  textures-sheet.png ${W}x${H}, ${Math.round(statSync(file).size / 1024)} KB`);
}

const SLOTS = { night, stage: stageLines, garage: garageToner, belt: beltPlates, crowd: crowdScreen, wall, sheet };
console.log(`era: ${era.name} (bg ${era.colors.bg}, accent ${era.colors.accent}, paper ${era.colors.text}) -> ${OUT}`);
for (const k of only) { console.log(`(${k})`); await SLOTS[k](); }
if (made.length) console.table(made);
