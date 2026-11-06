// Mockup 1: IDENTITY single-cover template, three tracks as one series, plus the 64px thumbnail test.
const L = require('./lib.cjs'), { C, T } = L;
const K = 'V:/GLucakWebsite/assets/from-gabe/live-alexander-kealey.jpg', M = 'V:/GLucakWebsite/assets/from-gabe/live-mccc-msp.png';
const S = 470; // cover size in the sheet; the MCCC still is 478 native, so nothing is upscaled
const TRACKS = [
  { n: '01', t: 'IDENTITY', src: K, reg: { left: 1100, top: 1180, width: 1150, height: 1150 }, g: 1.1, seed: 11 },
  { n: '07', t: 'LIGHT', src: K, reg: { left: 3270, top: 1080, width: 1220, height: 1220 }, g: 1.3, seed: 17, mix: [-1.1, 1.6, -0.2] },
  { n: '10', t: 'TRENCHES', src: M, reg: { left: 0, top: 0, width: 477, height: 477 }, g: 0.8, seed: 23 },
];
async function cover(tr) {
  const m = 34, win = S - 2 * m, ph = Math.round(win * 0.70); // photo window, then a solid band for type + mark
  const tone = await L.grey(tr.src, tr.reg, win, ph, tr.g, tr.mix);
  const cov = (f, pitch, ang, seed, dx, dy) => { const t = tone.map(v => f(v)); return L.plate(t, win, ph, pitch, ang, seed, dx, dy); };
  const vi = cov(v => L.smooth(0.08, 0.75, v), 5.2, 15, tr.seed), wh = cov(v => L.smooth(0.5, 1, v) * 0.95, 5.2, 45, tr.seed + 1, 1.6, 1.1);
  // paste the window plates into the full cover
  const full = (p) => { const o = new Float32Array(S * S); for (let y = 0; y < ph; y++) for (let x = 0; x < win; x++) o[(y + m) * S + x + m] = p[y * win + x]; return o; };
  const raw = L.paint(S, S, C.bg, [{ cov: full(vi), color: C.accent }, { cov: full(wh), color: C.text }], tr.seed, 4);
  // frame text: his own device (title repeated round the edge), redrawn: one face, reads clockwise, + at the corners
  let svg = ''; const fs = 13.5, inset = m / 2 + fs * 0.36, len = S - 2 * m - 12;
  const unit = T(tr.t + '.  ', 0, 0, { s: fs, ls: 0.06 }).w, n = Math.max(1, Math.floor(len / unit)), rep = (tr.t + '.  ').repeat(n).trimEnd();
  const run = (x, y, rot) => T(rep, x, y, { fit: len, ls: 0.06, fill: C.muted, rot }).svg; // whole words only, justified to the edge
  svg += `<clipPath id="ct"><rect x="${m}" y="0" width="${S - 2 * m}" height="${m}"/></clipPath><clipPath id="cr"><rect x="${S - m}" y="${m}" width="${m}" height="${S - 2 * m}"/></clipPath><clipPath id="cb"><rect x="${m}" y="${S - m}" width="${S - 2 * m}" height="${m}"/></clipPath><clipPath id="cl"><rect x="0" y="${m}" width="${m}" height="${S - 2 * m}"/></clipPath>`;
  svg += `<g clip-path="url(#ct)">${run(m + 6, inset, 0)}</g><g clip-path="url(#cr)">${run(S - inset, m + 6, 90)}</g><g clip-path="url(#cb)">${run(S - m - 6, S - inset, 180)}</g><g clip-path="url(#cl)">${run(inset, S - m - 6, 270)}</g>`;
  for (const [x, y] of [[m / 2, m / 2], [S - m / 2, m / 2], [S - m / 2, S - m / 2], [m / 2, S - m / 2]]) svg += `<path d="M${x - 1.6} ${y - 6}h3.2v4.4h4.4v3.2h-4.4v4.4h-3.2v-4.4h-4.4v-3.2h4.4z" fill="${C.text}"/>`;
  // band: big number (accent, large text 5.33:1), title, era word, mark
  const by = m + ph, bh = win - ph;
  const num = T(tr.n, m + 10, by + bh - 14, { s: bh * 0.92, fill: C.accent });
  svg += num.svg;
  const tx = m + 18 + num.w;
  const tw = T(tr.t, 0, 0, { s: 44 }).w, avail = S - m - 12 - tx; svg += T(tr.t, tx, by + bh - 16, { s: Math.min(44, 44 * avail / tw), fill: C.text }).svg;
  svg += T('GLUCAK  ·  IDENTITY', tx + 1, by + 28, { f: 'a7', s: 12.5, ls: 0.12, fill: C.muted }).svg;
  svg += `<rect x="${m}" y="${by}" width="${win}" height="1.5" fill="${C.text}" opacity=".9"/>`;
  const mk = await L.logoD(26), mw = (await L.sharp(mk).metadata()).width;
  return { raw, svg, comps: [{ input: mk, left: S - m - 10 - mw, top: by + 16 }] };
}
(async () => {
  const W = 1590, H = 790, pad = 60, gap = 40, top = 108;
  const sheet = Buffer.alloc(W * H * 3); const g = [22, 22, 26]; for (let i = 0; i < W * H; i++) sheet.set(g, i * 3);
  const comps = []; let svg = '';
  svg += T('IDENTITY single-cover template', pad, 58, { f: 'a7', s: 30, fill: '#f2f2f2' }).svg;
  svg += T('One system for 12 tracks: same frame, same two inks, his frame-text device, the number as the series ID. Real photos (Kealey, MCCC), halftoned; no AI.', pad, 88, { f: 'a4', s: 16.5, fill: '#a3a3ab' }).svg;
  svg += `<rect x="${W - pad - 92}" y="30" width="92" height="34" fill="none" stroke="#ffb020" stroke-width="2"/>` + T('MOCKUP', W - pad - 46, 54, { f: 'a7', s: 16, ls: 0.12, fill: '#ffb020', a: 'middle' }).svg;
  for (let i = 0; i < 3; i++) {
    const c = await cover(TRACKS[i]), x = pad + i * (S + gap) + (W - 2 * pad - 3 * S - 2 * gap) / 2;
    const png = await L.sharp(c.raw, { raw: { width: S, height: S, channels: 3 } }).composite([...c.comps, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${c.svg}</svg>`) }]).png().toBuffer();
    comps.push({ input: png, left: Math.round(x), top });
    const th = await L.sharp(png).resize(64, 64).png().toBuffer();
    comps.push({ input: th, left: Math.round(x), top: top + S + 34 });
    svg += T(`${TRACKS[i].n} ${TRACKS[i].t}: ${['Kealey photo, Gabe-only crop', 'Kealey photo, the pallet cross (green filter)', 'MCCC video still, native size'][i]}`, x + 80, top + S + 58, { f: 'a4', s: 15, fill: '#c9c9d1' }).svg;
    svg += T('64 px, a Spotify list row: the number still reads', x + 80, top + S + 82, { f: 'a4', s: 15, fill: '#8d8d96' }).svg;
  }
  svg += T('Track titles from his Oct 24 tracklist post (spelling to confirm). Dave Bahm makes the real covers; this is a proposal for him. Logo D sits only on the solid band, never on the photo.', pad, H - 34, { f: 'a4', s: 15, fill: '#8d8d96' }).svg;
  await L.save(sheet, W, H, svg, comps, 'V:/GLucakWebsite/docs/research/shots/round2/art-single-series.webp', 84);
})();
