// Photo treatments for the GLucak site: real photos, graded and "printed" by hand-written code.
// node tools/photo/run.mjs                 -> every option with the era in src/eras/placeholder.json
// node tools/photo/run.mjs --era path.json -> same, another era (era swap = re-run); also --era=path.json.
//   Every colour (grade tint, duotone/tritone, both print inks, paper, the grease pencil) comes from the era file.
//   A non-default era writes to docs/review/photo-treatments/<era-name>/ so runs never overwrite each other.
// node tools/photo/run.mjs --only=a,c      -> some options
// Seeded randomness: same inputs, same pixels. No generative fill, no upscaling: every output is <= its source crop.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, statSync, rmSync } from 'node:fs';
const require = createRequire(import.meta.url);
const sharp = require('V:/GLucakWebsite/node_modules/sharp');

const ROOT = 'V:/GLucakWebsite/';
const KEALEY = ROOT + 'assets/from-gabe/live-alexander-kealey.jpg';
const MCCC = ROOT + 'assets/from-gabe/live-mccc-msp.png';
const PASLIER = ROOT + 'assets/from-gabe/live-sylvain-paslier.png';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.findIndex(a => a === `--${k}` || a.startsWith(`--${k}=`)); return i < 0 ? d : argv[i].includes('=') ? argv[i].split('=').slice(1).join('=') : argv[i + 1] ?? d; };
const ERA_FILE = arg('era', ROOT + 'src/eras/placeholder.json'), era = JSON.parse(readFileSync(ERA_FILE, 'utf8'));
const OUT = ROOT + 'docs/review/photo-treatments/' + (/placeholder.json$/.test(ERA_FILE) ? '' : era.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '/');
const only = arg('only', 'a,b,c,d,e,f,s').split(',');
mkdirSync(OUT, { recursive: true });

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const BG = hex(era.colors.bg), TEXT = hex(era.colors.text), ACCENT = hex(era.colors.accent);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// ---------- randomness: seeded, so a re-run gives identical files ----------
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(6.2831853 * r()); }

// White noise at the output's own pixel grid, clumped by a small blur (film grain is clusters, not single pixels),
// renormalised to unit spread. Never tiled, never resized: that is what keeps it from looking like a filter pattern.
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
// Low-frequency mottling (uneven ink, paper cloud): coarse noise scaled up smoothly. Range about -1..1.
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
// Stretch a tone field so its lo..hi percentiles become 0..1. Each photo is lit differently (Kealey's "white" shirt
// is darker than the blue wall in G and B), so fixed thresholds don't travel; percentiles do.
function levels(f, lo = 0.01, hi = 0.99) {
  const s = []; for (let i = 0; i < f.length; i += 7) s.push(f[i]); s.sort((a, b) => a - b);
  const a = s[Math.floor(lo * (s.length - 1))], b = s[Math.floor(hi * (s.length - 1))], r = new Float32Array(f.length);
  for (let i = 0; i < f.length; i++) r[i] = clamp((f[i] - a) / (b - a || 1)); return r;
}
const sizes = [];
async function save(img, name, quality = 74) { // quality 'lossless' for binary plates
  const ch = img.a ? 4 : 3, b = Buffer.alloc(img.w * img.h * ch);
  for (let i = 0; i < img.w * img.h; i++) { for (let c = 0; c < 3; c++) b[i * ch + c] = clamp(img.d[i * 3 + c]) * 255 + 0.5; if (img.a) b[i * 4 + 3] = clamp(img.a[i]) * 255 + 0.5; }
  const file = OUT + name + '.webp';
  // sharp writes no EXIF/XMP/ICC unless asked (no withMetadata), so nothing from the camera survives.
  await sharp(b, { raw: { width: img.w, height: img.h, channels: ch } }).webp(quality === 'lossless' ? { lossless: true, effort: 6 } : { quality, effort: 6, smartSubsample: true, alphaQuality: 90 }).toFile(file);
  const kb = Math.round(statSync(file).size / 1024); sizes.push([name, `${img.w}x${img.h}`, kb]);
  if (kb > 150) console.warn(`  WARN ${name} is ${kb} KB (> 150)`);
  return file;
}

// ---------- grain: luminance only, strongest in the mid-tones, weakest in crushed black and paper white ----------
async function grain(img, amount, seed, blur = 0.6) {
  const n = await noise(img.w, img.h, seed, blur), d = img.d;
  for (let i = 0, p = 0; i < n.length; i++, p += 3) {
    const L = lum(d[p], d[p + 1], d[p + 2]), k = amount * (0.25 + 3 * L * (1 - L)) * n[i];
    d[p] += k; d[p + 1] += k; d[p + 2] += k;
  }
  return img;
}

// ---------- halftone: a rotated clustered-dot screen, the way a RIP screens a plate ----------
// Threshold t(x,y) is the spot function's area rank, so ink coverage equals tone density exactly.
const RANK = (() => { const n = 400, v = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) v.push(0.5 + 0.25 * (Math.cos(6.2832 * i / n) + Math.cos(6.2832 * j / n))); v.sort((a, b) => b - a); const t = new Float32Array(1025); let k = 0; for (let q = 1024; q >= 0; q--) { const s = q / 1024; while (k < v.length && v[k] >= s) k++; t[q] = k / v.length; } return t; })();
function screenAt(x, y, pitch, ang) {
  const c = Math.cos(ang), s = Math.sin(ang), u = (x * c + y * s) * 6.2832 / pitch, v = (-x * s + y * c) * 6.2832 / pitch;
  return RANK[Math.round((0.5 + 0.25 * (Math.cos(u) + Math.cos(v))) * 1024)];
}
// density: Float32Array 0..1 (1 = full ink). Returns ink coverage 0..1 per pixel.
// rough: noise on the threshold (ragged dot edges, paper tooth). shift/skew: misregistration of this plate.
// Plates are binary, like a real plate or screen: ink or no ink. mott (uneven inking) changes dot size, and the
// rare deepest noise drops ink where the paper's tooth skipped it. Binary also keeps the files small (lossless).
async function halftone(density, w, h, { pitch, angle, rough = 0.05, seed = 1, dx = 0, dy = 0, skew = 0, gain = 0.9, mott = null }) {
  const n = await noise(w, h, seed, 0.5), ink = new Float32Array(w * h), ang = angle * Math.PI / 180;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = x - dx + skew * (y - h / 2), sy = y - dy - skew * (x - w / 2); // sample the tone where this plate landed
    const ix = Math.min(w - 1, Math.max(0, Math.round(sx))), iy = Math.min(h - 1, Math.max(0, Math.round(sy)));
    const i = y * w + x, dens = (density[iy * w + ix] ** gain) * (mott ? 1 + 0.09 * mott[i] : 1), t = screenAt(x, y, pitch, ang) + rough * n[i];
    ink[i] = dens > 0.03 && dens > t && n[i] > -2.9 ? 1 : 0; // below 3% a screen holds no dot: clean blacks/paper
  }
  return ink;
}
async function blurField(f, w, h, sigma) {
  const b = Buffer.alloc(w * h); for (let i = 0; i < b.length; i++) b[i] = clamp(f[i]) * 255;
  const o = await sharp(b, { raw: { width: w, height: h, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer();
  const r = new Float32Array(w * h); for (let i = 0; i < r.length; i++) r[i] = o[i] / 255; return r;
}
// Paper: era "text" colour as flat stock with recycled-paper flecks: sparse grey specks from the tail of real noise.
// Flat between them, which is what lets the binary plates stay lossless and small.
async function paper(w, h, seed, base = TEXT) {
  const t = await noise(w, h, seed + 1, 0.7), d = new Float32Array(w * h * 3);
  for (let i = 0, p = 0; i < w * h; i++, p += 3) { const k = t[i] > 3.0 ? 0.86 : 1; d[p] = base[0] * k; d[p + 1] = base[1] * k; d[p + 2] = base[2] * k; }
  return { w, h, d };
}
// Continuous-tone paper (cloud, fibres, tooth). Not used: it costs 3-6x the bytes on a halftone. Kept for print files.
async function paperCloudy(w, h, seed, base = TEXT) {
  const c = await cloud(w, h, seed, 40), t = await noise(w, h, seed + 1, 0.4);
  const fb = Buffer.alloc(w * h), r = rng(seed + 2); for (let i = 0; i < fb.length; i++) fb[i] = r() * 255;
  const fib = await sharp(fb, { raw: { width: w, height: h, channels: 1 } }).convolve({ width: 9, height: 3, kernel: [...Array(9).fill(0), ...Array(9).fill(1), ...Array(9).fill(0)] }).extractChannel(0).raw().toBuffer();
  const d = new Float32Array(w * h * 3);
  for (let i = 0, p = 0; i < w * h; i++, p += 3) {
    const k = 0.018 * c[i] + 0.012 * t[i] + 0.02 * (fib[i] / 255 - 0.5);
    d[p] = base[0] + k; d[p + 1] = base[1] + k; d[p + 2] = base[2] + k * 1.15;
  }
  return { w, h, d };
}
// Overprint translucent ink on paper (multiply), with uneven inking from a cloud field.
function inkOn(img, ink, colour, mott = null, strength = 0.95) {
  const d = img.d;
  for (let i = 0, p = 0; i < ink.length; i++, p += 3) {
    const a = ink[i] * strength * (1 + 0.07 * (mott ? mott[i] : 0));
    for (let c = 0; c < 3; c++) d[p + c] *= 1 - a * (1 - colour[c]);
  }
  return img;
}
const lumaOf = (img, wR = 0.2126, wG = 0.7152, wB = 0.0722) => { const f = new Float32Array(img.w * img.h); for (let i = 0, p = 0; i < f.length; i++, p += 3) f[i] = wR * img.d[p] + wG * img.d[p + 1] + wB * img.d[p + 2]; return f; };

// ---------- check: text over a photo must keep 3:1 (large text) against `text`, per DESIGN 3 ----------
function textCheck(img, name, zone = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
  const v = [];
  for (let y = Math.floor(zone.y0 * img.h); y < zone.y1 * img.h; y += 2) for (let x = Math.floor(zone.x0 * img.w); x < zone.x1 * img.w; x += 2) { const p = (y * img.w + x) * 3; v.push(relLum([img.d[p], img.d[p + 1], img.d[p + 2]].map(clamp))); }
  v.sort((a, b) => a - b); const p95 = v[Math.floor(v.length * 0.95)], cr = (relLum(TEXT) + 0.05) / (p95 + 0.05);
  console.log(`  check ${name}: 95th-percentile pixel vs text = ${cr.toFixed(2)}:1 ${cr >= 3 ? 'PASS' : 'FAIL'} (3:1 large text)`);
  if (cr < 3) process.exitCode = 1;
}

// ======================= (a) era grade ("IDENTITY blue" in a blue era) =======================
// A colourist's grade, not a gradient map: black and white points from this crop's own percentiles, an S-curve, then
// per-channel curves steered by the era accent (channels the accent is strong in open up, the others close down; in
// a blue era the stage's cyan-blue goes ultramarine and red's toe crushes), blacks sink into bg tinted by the accent
// (never RGB 0), highlights roll off. His skin and the orange cross on his shirt keep their own colour.
const EXP = ACCENT.map(a => 1 + 0.45 * (0.6 - a)), GAIN = ACCENT.map(a => 0.9 + 0.1 * a), SINK = mix(BG, ACCENT, 0.3).map(v => v * 0.9);
function gradeBlue(img, { ceiling = 0.9 } = {}) {
  const d = img.d, n = img.w * img.h, Lf = new Float32Array(n);
  for (let i = 0; i < n; i++) Lf[i] = lum(d[i * 3], d[i * 3 + 1], d[i * 3 + 2]);
  const s = Array.from(Lf.filter((_, i) => i % 9 === 0)).sort((a, b) => a - b), lo = s[Math.floor(s.length * 0.01)], hi = s[Math.floor(s.length * 0.995)];
  const S = x => 0.55 * x + 0.45 * x * x * (3 - 2 * x);                    // S-curve
  const roll = x => x < 0.8 ? x : 0.8 + (1 - Math.exp(-(x - 0.8) * 4)) * 0.2 * ceiling / 0.9; // soft shoulder
  for (let i = 0, p = 0; i < n; i++, p += 3) {
    const r = clamp((d[p] - lo) / (hi - lo)), g = clamp((d[p + 1] - lo) / (hi - lo)), b = clamp((d[p + 2] - lo) / (hi - lo));
    const R = S(r) ** EXP[0] * GAIN[0], G = S(g) ** EXP[1] * GAIN[1], B = S(b) ** EXP[2] * GAIN[2], sink = (1 - lum(R, G, B)) ** 4;
    d[p] = roll(R + SINK[0] * sink); d[p + 1] = roll(G + SINK[1] * sink); d[p + 2] = roll(B + SINK[2] * sink);
  }
  return img;
}
// Print it down: one exposure change in linear light so the 95th-percentile pixel keeps cr:1 against the era text
// (the 3:1 large-text floor plus margin). Uniform, so the grade's look survives, a stop or so darker.
function printDown(img, cr) {
  const v = []; for (let p = 0; p < img.d.length; p += 15) v.push(relLum([img.d[p], img.d[p + 1], img.d[p + 2]].map(clamp))); v.sort((a, b) => a - b);
  const p95 = v[Math.floor(v.length * 0.95)], want = (relLum(TEXT) + 0.05) / cr - 0.05, k = Math.min(1, want / p95);
  const enc = c => c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  for (let p = 0; p < img.d.length; p++) img.d[p] = enc(lin(clamp(img.d[p])) * k);
  return img;
}
// Darkroom-style burn: darken toward the edges and the top (where the name and nav sit), centre stays.
function burn(img, cx, cy, strength = 0.35, top = 0.15) {
  const d = img.d, { w, h } = img;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const rx = (x / w - cx) / 0.75, ry = (y / h - cy) / 0.8, v = 1 - strength * smooth(0.3, 1.15, Math.sqrt(rx * rx + ry * ry)) - top * (1 - smooth(0, 0.4, y / h));
    const p = (y * w + x) * 3; d[p] *= v; d[p + 1] *= v; d[p + 2] *= v;
  }
  return img;
}
async function optA() {
  // Gabe singing. Landscape for hero A (desktop), 4:5 portrait for phones. Bottom edge stops above the fan in front.
  const land = { left: 900, top: 1250, width: 1800, height: 1200 }, port = { left: 1290, top: 1300, width: 920, height: 1150 };
  for (const [name, reg, w, h, q] of [['a-era-grade-1600', land, 1600, 1067, 64], ['a-era-grade-800', land, 800, 533, 72], ['a-era-grade-phone-800', port, 800, 1000, 68]]) {
    const img = printDown(burn(gradeBlue(await load(KEALEY, reg, w, h)), 0.5, 0.45), 3.3);
    await grain(img, w > 1000 ? 0.024 : 0.019, 11, w > 1000 ? 0.55 : 0.45);
    textCheck(img, name); await save(img, name, q);
  }
  // The same grade at full brightness, for slots with no text on the photo (hero B's slot, About).
  const img = burn(gradeBlue(await load(KEALEY, { left: 950, top: 1250, width: 1700, height: 1200 }, 1200, 847)), 0.5, 0.45, 0.25, 0);
  await save(await grain(img, 0.02, 12, 0.5), 'a-era-grade-clear-1200', 70);
}

// Tone for printing: green-weighted (the wall is brightest in G and B, the shirt and skin are mid, hair is black),
// blurred to the screen's own resolution, then stretched to this crop's percentiles.
// Under Kealey's blue light his skin is pink (low G) and the wall is saturated blue (high B), so plain luma sinks his
// face. Mostly the brightest channel (HSV value) instead: wall, skin and shirt light; hair, glasses and mic dark.
async function printTone(img, pitch, mixV = 0.7) {
  const f = new Float32Array(img.w * img.h), d = img.d;
  for (let i = 0, p = 0; i < f.length; i++, p += 3) f[i] = mixV * Math.max(d[p], d[p + 1], d[p + 2]) + (1 - mixV) * lum(d[p], d[p + 1], d[p + 2]);
  return levels(await blurField(f, img.w, img.h, pitch * 0.3), 0.02, 0.985);
}

// ======================= (b) two-colour riso: era accent + ink black =======================
// Separated like a riso master: accent carries the full tone, black only the deep shadows. Two screen angles,
// the accent drum lands a few pixels off and a hair rotated (a real drum misses by 1-2 mm). Multiply on paper.
async function riso(src, reg, w, h, pitch, seed) {
  const img = await load(src, reg, w, h), L = await printTone(img, pitch);
  const dA = new Float32Array(w * h), dK = new Float32Array(w * h);
  for (let i = 0; i < L.length; i++) { const t = 1 - L[i]; dA[i] = 0.05 + 0.82 * smooth(0.0, 0.85, t); dK[i] = smooth(0.5, 0.97, t) * 0.95; }
  const pap = await paper(w, h, seed), mott = await cloud(w, h, seed + 5, 30), off = Math.max(2, w / 320);
  inkOn(pap, await halftone(dA, w, h, { pitch, angle: 75, seed: seed + 7, dx: off, dy: -off * 0.6, skew: 0.0015, rough: 0.07, mott }), ACCENT, null, 0.92);
  inkOn(pap, await halftone(dK, w, h, { pitch, angle: 45, seed: seed + 8, rough: 0.06, mott }), BG, null, 0.96);
  return pap;
}
async function optB() {
  const reg = { left: 950, top: 1250, width: 1700, height: 1200 }; // the hero B slot crop (DESIGN 3b)
  await save(await riso(KEALEY, reg, 1000, 706, 6.2, 21), 'b-riso-1000', 'lossless');
  await save(await riso(KEALEY, reg, 600, 424, 4.4, 22), 'b-riso-600', 'lossless');
}

// ======================= (c) gig-poster cut =======================
// One ink, coarse screen, contrast pushed so the blue wall falls to paper and his hair, glasses, mic and arms carry
// the figure. Bottom edge torn: a random walk with fibres, a white rim where the printed skin tore away, a soft
// shadow where the pasted paper lifts. Below the tear is transparent, so it sits on the poster or the page.
async function poster(w, h, pitch, seed) {
  const img = await load(KEALEY, { left: 1210, top: 1330, width: 1080, height: 1350 }, w, h), L = await printTone(img, pitch);
  const dK = new Float32Array(w * h); for (let i = 0; i < L.length; i++) dK[i] = 1 - smooth(0.1, 0.78, L[i]);
  const pap = await paper(w, h, seed), mott = await cloud(w, h, seed + 3, 20);
  const ink = await halftone(dK, w, h, { pitch, angle: 45, seed: seed + 4, rough: 0.09, gain: 0.85, mott });
  const r = rng(seed + 6), edge = new Float32Array(w), rim = new Float32Array(w), base = h * 0.88; let y0 = base, vel = 0, fib = 0;
  for (let x = 0; x < w; x++) {
    vel = vel * 0.94 + (r() - 0.5) * 0.7; y0 += vel * 0.5 + (base - y0) * 0.008;
    fib = r() < 0.03 ? (1 + r() * 3) * w / 600 : fib * 0.6;                 // fibres: short tapered spikes, not 1px lines
    edge[x] = y0 + (r() - 0.5) * 1.4 + fib; rim[x] = (1.2 + r() * 1.4 + Math.max(0, Math.sin(x / 37) * 1.5)) * w / 600;
  }
  const a = new Float32Array(w * h).fill(1);
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
    const i = y * w + x; if (y > edge[x] - rim[x]) ink[i] = 0;              // white torn rim
    if (y > edge[x]) { const t = (y - edge[x]) / (w / 120); a[i] = t < 1 ? Math.round(4 * 0.22 * (1 - t)) / 4 : 0; for (let c = 0; c < 3; c++) pap.d[i * 3 + c] = 0; } // lift shadow, then clear
  }
  inkOn(pap, ink, BG, null, 0.97); pap.a = a;
  return pap;
}
async function optC() {
  await save(await poster(1000, 1250, 8.5, 31), 'c-poster-1000', 'lossless');
  await save(await poster(600, 750, 6, 32), 'c-poster-600', 'lossless');
}

// ======================= (d) the crowd: Push Past Fear panorama =======================
// Wide band: Gabe left, the pallet cross centre, the crowd as backs of heads facing it. Bottom stops at y 2440,
// above the child and above the profile of the fan front-left: backs of heads only. Tritone print (ink -> era-tinted mid -> warm paper ceiling), burned edges, grain.
function tritone(img, ceiling = 0.8) {
  const d = img.d, n = img.w * img.h, Lf = new Float32Array(n);
  for (let i = 0; i < n; i++) Lf[i] = lum(d[i * 3], d[i * 3 + 1], d[i * 3 + 2]);
  const L = levels(Lf, 0.01, 0.995), mid = mix(BG, ACCENT, 0.5), hi = mix(mix(TEXT, ACCENT, 0.1), mid, 1 - ceiling);
  for (let i = 0, p = 0; i < n; i++, p += 3) {
    const t = L[i] ** 1.1, c = t < 0.45 ? mix(BG, mid, smooth(0, 0.45, t)) : mix(mid, hi, (t - 0.45) / 0.55);
    d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2];
  }
  return img;
}
async function optD() {
  const wide = { left: 1000, top: 1050, width: 5000, height: 1390 }, phone = { left: 1250, top: 1050, width: 3000, height: 1390 };
  for (const [name, reg, w, h, q] of [['d-crowd-1600', wide, 1600, 445, 70], ['d-crowd-800', wide, 800, 222, 76], ['d-crowd-phone-800', phone, 800, 371, 74]]) {
    const img = burn(tritone(await load(KEALEY, reg, w, h), 0.62), 0.5, 0.5, 0.3, 0.12);
    await grain(img, w > 1000 ? 0.03 : 0.024, 41, 0.55);
    textCheck(img, name); await save(img, name, q);
  }
}

// ======================= (e) contact sheet / film strip =======================
// Four crops of the one frame (DSC_0832), printed as a black-and-white strip: rebate, sprocket holes, white edge
// print that carries the real credit, and a grease-pencil loop on the pick drawn as one wobbly open stroke.
const FRAMES = [
  ['GABE', { left: 1150, top: 1450, width: 1500, height: 1000 }],
  ['CROSS', { left: 3200, top: 1100, width: 1500, height: 1000 }],
  ['MIC', { left: 2050, top: 1750, width: 1050, height: 700 }],
  ['KIT', { left: 50, top: 2050, width: 1425, height: 950 }],
];
function silver(img) { // neutral B&W print from this frame's own black and white points, a touch warm, gentle shoulder
  const d = img.d, n = img.w * img.h, Lf = new Float32Array(n);
  for (let i = 0; i < n; i++) Lf[i] = lum(d[i * 3], d[i * 3 + 1], d[i * 3 + 2]);
  const L = levels(Lf, 0.005, 0.995);
  for (let i = 0, p = 0; i < n; i++, p += 3) { let t = L[i] ** 1.1; t = t < 0.85 ? t : 0.85 + (t - 0.85) * 0.6; d[p] = t; d[p + 1] = t * 0.985; d[p + 2] = t * 0.95; }
  return img;
}
function wobble(cx, cy, rx, ry, r) { // one hand-drawn loop: starts and ends past each other, radius drifts
  let s = ''; const a0 = -0.6 + r() * 0.3, turns = 1.07, n = 60;
  for (let i = 0; i <= n; i++) { const a = a0 + turns * 6.2832 * i / n, k = 1 + 0.05 * Math.sin(i * 0.31 + r()) + (r() - 0.5) * 0.015 + 0.06 * i / n; s += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`; }
  return s;
}
async function strip(frames, W, first, seed) {
  const n = frames.length, fw = Math.floor(W / (n + 0.04 * (n + 1))), gap = Math.floor((W - n * fw) / (n + 1)), fh = Math.round(fw * 2 / 3);
  const reb = Math.round(fh * 0.17), H = fh + reb * 2, base = { w: W, h: H, d: new Float32Array(W * H * 3).fill(0.085) };
  for (let k = 0; k < n; k++) {
    const img = silver(await load(KEALEY, frames[k][1], fw, fh));
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const rx = x / fw - 0.5, ry = y / fh - 0.5, v = 1 - 0.3 * (rx * rx + ry * ry), p = (y * fw + x) * 3; img.d[p] *= v; img.d[p + 1] *= v; img.d[p + 2] *= v; } // enlarger fall-off
    const X = gap + k * (fw + gap);
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const s = (y * fw + x) * 3, t = ((y + reb) * W + X + x) * 3; base.d[t] = img.d[s]; base.d[t + 1] = img.d[s + 1]; base.d[t + 2] = img.d[s + 2]; }
  }
  await grain(base, 0.03, seed, 0.55);
  const r = rng(seed + 1), hole = Math.round(reb * 0.4), pitch = hole * 1.9, fs = Math.round(reb * 0.29);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  for (let x = pitch * 0.4; x < W - hole; x += pitch) for (const y of [reb * 0.12, H - reb * 0.12 - hole]) svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(hole * 0.72).toFixed(1)}" height="${hole}" rx="${(hole * 0.14).toFixed(1)}" fill="#020202"/>`;
  const edge = (wt = 700) => `font-family="Arial" font-weight="${wt}" font-size="${fs}" fill="#d9d6cf" fill-opacity=".8"`;
  const topY = reb * 0.12 + hole + fs * 1.1, botY = H - reb * 0.12 - hole - fs * 0.35;
  for (let k = 0; k < n; k++) {
    const X = gap + k * (fw + gap), no = first + k;
    svg += `<text x="${X + fw * 0.03}" y="${botY}" ${edge()}>${no}</text><text x="${X + fw * 0.11}" y="${botY}" ${edge()}>&#9656;${no}A</text>`;
    svg += `<text x="${X + fw * 0.97}" y="${botY}" text-anchor="end" ${edge(400)}>${frames[k][0]}</text>`;
  }
  svg += `<text x="${gap}" y="${topY}" ${edge(400)}>DSC 0832 · PHOTO ALEXANDER KEALEY</text><text x="${W - gap}" y="${topY}" text-anchor="end" ${edge(400)}>GLUCAK · LIVE</text>`;
  if (frames[0][0] === 'GABE') { // the pick, circled once in the era accent, the way an editor marks a sheet
    const [a1, a2, a3] = ACCENT.map(v => Math.round(v * 255));
    svg += `<path d="${wobble(gap + fw * 0.52, reb + fh * 0.44, fw * 0.3, fh * 0.42, r)}" fill="none" stroke="rgb(${a1},${a2},${a3})" stroke-width="${(fw / 85).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;
  }
  svg += '</svg>';
  const b = Buffer.alloc(base.d.length); for (let i = 0; i < b.length; i++) b[i] = clamp(base.d[i]) * 255;
  const { data } = await sharp(b, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(svg) }]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const f = new Float32Array(data.length); for (let i = 0; i < f.length; i++) f[i] = data[i] / 255;
  return { w: W, h: H, d: f };
}
async function optE() {
  await save(await strip(FRAMES, 1600, 1, 51), 'e-contact-1600', 72);              // one strip of four
  const top = await strip(FRAMES.slice(0, 2), 800, 1, 52), bot = await strip(FRAMES.slice(2), 800, 3, 53);
  const both = { w: top.w, h: top.h + bot.h, d: new Float32Array(top.w * (top.h + bot.h) * 3) };
  both.d.set(top.d, 0); both.d.set(bot.d, top.d.length);
  await save(both, 'e-contact-phone-800', 74);                                      // two strips of two
}

// ======================= (f) the two small video stills =======================
// Their low resolution becomes the screen: two opaque inks on black stock (accent for the mid-tones, paper white for
// the highlights, the white screen a touch off-register), coarse dots, at native size or smaller. Never upscaled.
async function lightPrint(src, reg, w, h, pitch, seed) {
  const img = await load(src, reg, w, h), L = await printTone(img, pitch, 0); // plain luma: these stills have purple-blue curtains that max-channel would flatten
  const dA = new Float32Array(w * h), dW = new Float32Array(w * h);
  for (let i = 0; i < L.length; i++) { dA[i] = smooth(0.08, 0.6, L[i]) * 0.95; dW[i] = smooth(0.5, 0.98, L[i]) * 0.9; }
  const mott = await cloud(w, h, seed + 2, 16);
  const inkA = await halftone(dA, w, h, { pitch, angle: 15, seed, rough: 0.08, mott }), inkW = await halftone(dW, w, h, { pitch, angle: 45, seed: seed + 1, rough: 0.08, dx: 1.2, dy: 0.8, mott });
  const out = { w, h, d: new Float32Array(w * h * 3) };
  for (let i = 0, p = 0; i < w * h; i++, p += 3) {
    const a = inkA[i], b = inkW[i] * 0.94; // white ink a touch translucent over the accent
    for (let c = 0; c < 3; c++) { const v = BG[c] + (ACCENT[c] - BG[c]) * a; out.d[p + c] = v + (TEXT[c] - v) * b; }
  }
  return out;
}
async function optF() {
  const mccc = { left: 0, top: 0, width: 478, height: 477 }, pas = { left: 170, top: 10, width: 440, height: 300 }; // Paslier: stage only, no fan faces
  await save(await lightPrint(MCCC, mccc, 478, 477, 4.4, 61), 'f-mccc-478', 'lossless');
  await save(await lightPrint(MCCC, mccc, 240, 240, 3.2, 62), 'f-mccc-240', 'lossless');
  await save(await lightPrint(PASLIER, pas, 440, 300, 4.4, 63), 'f-paslier-440', 'lossless');
  await save(await lightPrint(PASLIER, pas, 300, 205, 3.2, 64), 'f-paslier-300', 'lossless');
}

// ======================= (s) review sheet =======================
// Every option with its letter, name and slot, beside the current plain duotone; plus the test-blue era row if that
// era has been rendered (node tools/photo/run.mjs --era tools/photo/eras/test-blue.json).
async function optS() {
  if (OUT !== ROOT + 'docs/review/photo-treatments/') return console.log('  (sheet is made by the default-era run only)');
  const T = ROOT + 'docs/review/photo-treatments/', BLUE = T + 'test-blue/';
  const W = 2000, pad = 40, items = [], esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let y = 150;
  const row = (cells, h, title) => { let x = pad; if (title) items.push({ text: title, x, y: y - 14, size: 22, colour: '#9a9a9a' }); for (const c of cells) { items.push({ ...c, x, y, h }); x += c.w + 30; } y += h + 120; };
  row([{ file: T + 'a-era-grade-1600.webp', w: 800, label: 'A', name: 'Era grade, printed down for text', slot: 'Hero A (desktop 1600/800)' },
       { file: T + 'a-era-grade-phone-800.webp', w: 320, label: 'A', name: 'Phone crop', slot: 'Hero A under 700px' }], 533, 'PLACEHOLDER ERA (bg #111, accent #ff4d2e). Every colour below comes from the era file.');
  row([{ file: T + 'b-riso-1000.webp', w: 755, label: 'B', name: 'Two-colour riso, off-register', slot: 'Hero B slot (G[photo]LUCAK)' },
       { file: T + 'c-poster-600.webp', w: 427, label: 'C', name: 'Gig-poster cut, torn edge', slot: 'Live It Loud poster', paper: true },
       { file: T + 'f-mccc-478.webp', w: 380, label: 'F', name: 'MCCC still, 2 inks on black', slot: 'Hero B slot under 900px' },
       { file: T + 'f-paslier-440.webp', w: 300, label: 'F', name: 'Paslier still', slot: 'Push Past Fear under 753px' }], 533);
  row([{ file: T + 'd-crowd-1600.webp', w: 1600, label: 'D', name: 'The crowd: tritone panorama, burned edges', slot: 'Push Past Fear band (phone crop: d-crowd-phone-800)' }], 445);
  row([{ file: T + 'e-contact-1600.webp', w: 1600, label: 'E', name: 'Contact strip, B&W, credit in the edge print', slot: 'About (phone: two strips of two)' }], 339);
  let hasBlue = true; try { statSync(BLUE + 'a-era-grade-1600.webp'); } catch { hasBlue = false; }
  if (hasBlue) row([{ file: BLUE + 'a-era-grade-1600.webp', w: 600, label: 'A', name: 'Era grade', slot: 'Hero A' },
                    { file: BLUE + 'b-riso-1000.webp', w: 566, label: 'B', name: 'Riso', slot: 'Hero B slot' },
                    { file: BLUE + 'd-crowd-phone-800.webp', w: 647, label: 'D', name: 'Crowd (phone crop)', slot: 'Push Past Fear' }], 400, 'SAME SCRIPT, TEST-BLUE ERA (tools/photo/eras/test-blue.json, a stand-in, not an era): the era swap is one re-run.');
  const H = y - 40, comps = [];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><text x="${pad}" y="70" font-family="Arial" font-weight="700" font-size="40" fill="#f5f5f5">Photo treatments: Gabe's real photos, no AI</text><text x="${pad}" y="104" font-family="Arial" font-size="22" fill="#9a9a9a">tools/photo/run.mjs · sharp + hand-written code · every option re-runs per era · files in docs/review/photo-treatments/</text>`;
  for (const it of items) {
    if (it.text) { svg += `<text x="${it.x}" y="${it.y}" font-family="Arial" font-size="${it.size}" fill="${it.colour}">${esc(it.text)}</text>`; continue; }
    const img = sharp(it.file).resize(it.w, it.h, { fit: 'contain', background: it.paper ? era.colors.text : '#000000' }).flatten({ background: it.paper ? era.colors.text : '#000000' });
    comps.push({ input: await img.png().toBuffer(), left: it.x, top: it.y });
    svg += `<text x="${it.x}" y="${it.y + it.h + 34}" font-family="Arial" font-weight="700" font-size="26" fill="${it.label === 'NOW' ? '#9a9a9a' : era.colors.accent}">${it.label}</text><text x="${it.x + (it.label.length > 1 ? 70 : 30)}" y="${it.y + it.h + 34}" font-family="Arial" font-weight="700" font-size="22" fill="#f5f5f5">${esc(it.name)}</text><text x="${it.x}" y="${it.y + it.h + 64}" font-family="Arial" font-size="20" fill="#9a9a9a">${esc(it.slot)}</text>`;
  }
  svg += '</svg>';
  await sharp({ create: { width: W, height: H, channels: 3, background: '#161616' } }).composite([{ input: Buffer.from(svg), left: 0, top: 0 }, ...comps]).png({ palette: true, quality: 95, colours: 256, effort: 10 }).toFile(T + 'sheet.png');
  console.log(`  sheet.png ${W}x${H}, ${Math.round(statSync(T + 'sheet.png').size / 1024)} KB`);
}

const OPTS = { a: optA, b: optB, c: optC, d: optD, e: optE, f: optF, s: optS };
console.log(`era: ${era.name} (bg ${era.colors.bg}, accent ${era.colors.accent}, paper ${era.colors.text}); poster ink/paper ${contrast(BG, TEXT).toFixed(1)}:1`);
for (const k of only) { console.log(`(${k})`); await OPTS[k](); }
console.table(sizes.map(([name, px, kb]) => ({ name, px, kb })));
