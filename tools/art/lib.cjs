// Shared bits for the art-system mockups. sharp + hand SVG only; text is real font outlines (fontTools), no AI.
const sharp = require('V:/GLucakWebsite/node_modules/sharp');
const { execFileSync } = require('child_process');
const path = require('path');
const HERE = __dirname, FONT = { bsd: path.join(HERE, 'fonts/bsd900.ttf'), a4: path.join(HERE, 'fonts/ahn400.ttf'), a7: path.join(HERE, 'fonts/ahn700.ttf') };
const C = { bg: '#08044a', text: '#f6f5ff', accent: '#a866ff', muted: '#bab6e6', glow: '#8312c8', paper: '#f1eee6' };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// text -> outline path. Batch to one python call.
function shape(reqs) {
  const out = execFileSync('python', ['-I', path.join(HERE, 'textpath.py')], { input: JSON.stringify(reqs.map(r => ({ font: FONT[r.f], text: r.t, size: r.s, ls: r.ls || 0 }))) });
  return JSON.parse(out);
}
// one text item -> {svg, w}; anchor 'start' | 'middle' | 'end'; fit: width to fill (sets size)
function T(t, x, y, o = {}) {
  const f = o.f || 'bsd'; let s = o.s || 40;
  if (o.fit) { const [m] = shape([{ f, t, s: 100, ls: o.ls }]); s = 100 * o.fit / m.w; }
  const [r] = shape([{ f, t, s, ls: o.ls }]);
  const dx = o.a === 'middle' ? -r.w / 2 : o.a === 'end' ? -r.w : 0;
  const tr = o.rot ? `translate(${x} ${y}) rotate(${o.rot}) translate(${dx} 0)` : `translate(${(x + dx).toFixed(1)} ${y})`;
  return { svg: `<path transform="${tr}" d="${r.d}" fill="${o.fill || C.text}"${o.op ? ` opacity="${o.op}"` : ''}/>`, w: r.w, s };
}
function rng(seed) { let s = seed >>> 0; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
// greyscale crop -> Float32 0..1, levels from its own 2nd/98th percentiles. Refuses to upscale.
// mix = channel weights, like a colour filter on B&W film (a green filter lightens greens). Default: luminance.
async function grey(file, region, W, H, gamma = 1, mix) {
  let p = sharp(file); if (region) p = p.extract(region);
  const m = region || await sharp(file).metadata();
  if (W > m.width || H > m.height) throw new Error('refusing to upscale');
  let { data } = await p.resize(W, H).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const [wr, wg, wb] = mix || [0.2126, 0.7152, 0.0722], d = new Float32Array(W * H);
  for (let i = 0; i < d.length; i++) d[i] = wr * data[i * 3] + wg * data[i * 3 + 1] + wb * data[i * 3 + 2];
  data = d;
  const sorted = Float32Array.from(data).sort(), lo = sorted[Math.floor(data.length * 0.02)], hi = sorted[Math.floor(data.length * 0.98)];
  const g = new Float32Array(W * H); for (let i = 0; i < g.length; i++) g[i] = Math.min(1, Math.max(0, (data[i] - lo) / (hi - lo))) ** gamma;
  return g;
}
// smooth value noise 0..1 (uneven inking, paper)
function vnoise(W, H, cell, r) {
  const gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2, g = Float32Array.from({ length: gw * gh }, r), o = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fx = x / cell, fy = y / cell, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
    o[y * W + x] = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  return o;
}
// AM halftone plate: tone 0..1 -> ink coverage 0..1. Dots grow from cell centres, rough edges, uneven ink.
function plate(tone, W, H, pitch, angle, seed, dx = 0, dy = 0) {
  const r = rng(seed), a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), un = vnoise(W, H, 60, r), out = new Float32Array(W * H), k = pitch * 0.55;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = Math.min(W - 1, Math.max(0, Math.round(x - dx))), sy = Math.min(H - 1, Math.max(0, Math.round(y - dy))), t0 = tone[sy * W + sx];
    const u = (x * ca + y * sa) / pitch, v = (-x * sa + y * ca) / pitch, th = 0.5 - 0.25 * (Math.cos(2 * Math.PI * u) + Math.cos(2 * Math.PI * v));
    const t = t0 * (0.88 + 0.16 * un[y * W + x]) + (r() - 0.5) * 0.09;
    out[y * W + x] = t0 < 0.02 ? 0 : Math.min(1, Math.max(0, (t - th) * k + 0.5)) * (0.9 + 0.1 * un[y * W + x]);
  }
  return out;
}
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
// paint layers [{cov, color}] over a ground colour, with clumped paper grain. -> raw RGB buffer
function paint(W, H, ground, layers, seed = 1, grain = 5) {
  const r = rng(seed), gn = vnoise(W, H, 1.7, r), out = Buffer.alloc(W * H * 3), g = hex(ground), Ls = layers.map(l => ({ cov: l.cov, c: hex(l.color), op: l.op ?? 1 }));
  for (let i = 0; i < W * H; i++) {
    let p = [...g]; for (const l of Ls) { const al = l.cov[i] * l.op; for (let k = 0; k < 3; k++) p[k] = p[k] * (1 - al) + l.c[k] * al; }
    const n = (gn[i] - 0.5) * grain * 2; for (let k = 0; k < 3; k++) out[i * 3 + k] = Math.max(0, Math.min(255, p[k] + n));
  }
  return out;
}
// one-colour stand-in of Logo D: its alpha minus its dark outline (so the cross separates from the wings). Not a redraw.
async function markMask(h) {
  const f = 'V:/GLucakWebsite/assets/from-gabe/logo-d-identity.png', m = await sharp(f).metadata(), w = Math.round(m.width * h / m.height);
  const { data } = await sharp(f).resize(w, h).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cov = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) { const a = data[i * 4 + 3] / 255, l = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 765; cov[i] = smooth(0.5, 0.7, a) * smooth(0.2, 0.35, l); }
  return { cov, w, h };
}
async function logoD(h) { return sharp('V:/GLucakWebsite/assets/from-gabe/logo-d-identity.png').resize({ height: h }).png().toBuffer(); }
async function save(raw, W, H, svg, comps, file, q = 82) {
  const buf = await sharp(raw, { raw: { width: W, height: H, channels: 3 } }).composite([...(comps || []), { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`), left: 0, top: 0 }]).webp({ quality: q, effort: 6 }).toBuffer();
  require('fs').writeFileSync(file, buf); console.log(path.basename(file), (buf.length / 1024).toFixed(0) + ' KB');
  await sharp(buf).png().toFile(path.join(HERE, 'art', path.basename(file).replace('.webp', '.png')));
}
module.exports = { sharp, C, cr, lum, T, shape, rng, grey, plate, paint, smooth, vnoise, markMask, logoD, save };
if (require.main === module) {
  const P = [['text', 'bg'], ['muted', 'bg'], ['accent', 'bg'], ['bg', 'accent'], ['bg', 'text'], ['bg', 'paper'], ['accent', 'paper'], ['glow', 'bg'], ['text', 'glow'], ['muted', 'glow'], ['accent', 'text']];
  for (const [a, b] of P) console.log(`${a} on ${b}: ${cr(C[a], C[b]).toFixed(2)}`);
  for (const [n, h] of [['riso purple', '#765ba7'], ['riso medium blue', '#3255a4'], ['riso fl pink', '#ff48b0'], ['riso violet', '#9d7ad2']]) console.log(n, 'on paper', cr(h, C.paper).toFixed(2), 'paper on it', cr(C.paper, h).toFixed(2), 'on bg', cr(h, C.bg).toFixed(2));
}
// SVG (white shapes) -> coverage plate, inked unevenly with a few skips, like a pulled screen print
async function svgPlate(inner, W, H, seed, dx = 0, dy = 0) {
  const { data } = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/><g transform="translate(${dx} ${dy})">${inner}</g></svg>`)).greyscale().raw().toBuffer({ resolveWithObject: true });
  const r = rng(seed), un = vnoise(W, H, 45, r), fine = vnoise(W, H, 2.2, r), o = new Float32Array(W * H);
  for (let i = 0; i < o.length; i++) { const c = data[i] / 255; o[i] = c * (0.84 + 0.16 * un[i]) * (fine[i] > 0.93 ? 0.55 : 1); }
  return o;
}
module.exports.svgPlate = svgPlate;
