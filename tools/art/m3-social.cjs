// Mockup 3: social templates. Story 9:16 (show tonight) at half scale, and the square tracklist reveal.
const L = require('./lib.cjs'), { C, T } = L;
const M = 'V:/GLucakWebsite/assets/from-gabe/live-mccc-msp.png';
function frame(S, m, word, fs = 13) { // the covers' frame-text device, reused so posts read as the same series
  const len = S - 2 * m - 12, unit = T(word + '.  ', 0, 0, { s: fs, ls: 0.06 }).w, n = Math.floor(len / unit), rep = (word + '.  ').repeat(n).trimEnd(), ins = m / 2 + fs * 0.36;
  const run = (x, y, rot) => T(rep, x, y, { fit: len, ls: 0.06, fill: C.muted, rot }).svg;
  let s = `<clipPath id="f${S}"><path d="M0 0H${S}V${S}H0z M${m} ${m}V${S - m}H${S - m}V${m}z" clip-rule="evenodd"/></clipPath><g clip-path="url(#f${S})">`;
  s += run(m + 6, ins, 0) + run(S - ins, m + 6, 90) + run(S - m - 6, S - ins, 180) + run(ins, S - m - 6, 270) + '</g>';
  for (const [x, y] of [[m / 2, m / 2], [S - m / 2, m / 2], [S - m / 2, S - m / 2], [m / 2, S - m / 2]]) s += `<path d="M${x - 1.6} ${y - 6}h3.2v4.4h4.4v3.2h-4.4v4.4h-3.2v-4.4h-4.4v-3.2h4.4z" fill="${C.text}"/>`;
  return s;
}
async function story() {
  const W = 540, H = 960, m = 32, top = 125, bot = 170; // Instagram UI covers ~250px top / ~340px bottom at 1080x1920
  let svg = '';
  const tn = T('TONIGHT', m, 0, { fit: W - 2 * m }); const cap = tn.s * 0.81, ty = top + 14 + cap;
  svg += T('TONIGHT', m, ty, { fit: W - 2 * m, fill: C.text }).svg;
  const py = Math.round(ty + 18), pw = W - 2 * m, ph = 250;
  const tone = await L.grey(M, { left: 0, top: 40, width: 477, height: 251 }, pw, ph, 0.8);
  const vi = L.plate(tone.map(v => L.smooth(0.08, 0.75, v)), pw, ph, 5.2, 15, 61), wh = L.plate(tone.map(v => L.smooth(0.5, 1, v) * 0.95), pw, ph, 5.2, 45, 62, 1.6, 1.1);
  const place = p => { const o = new Float32Array(W * H); for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) o[(py + y) * W + m + x] = p[y * pw + x]; return o; };
  const raw = L.paint(W, H, C.bg, [{ cov: place(vi), color: C.accent }, { cov: place(wh), color: C.text }], 63, 4);
  const y2 = py + ph + 62;
  svg += T('VENUE NAME', m, y2, { s: 58, fill: C.text }).svg;
  svg += T('TOWN, PA  ·  7 PM  ·  FREE', m, y2 + 34, { f: 'a7', s: 19, ls: 0.06, fill: C.muted }).svg;
  svg += T('Playing IDENTITY tracks early.', m, y2 + 66, { f: 'a4', s: 19, fill: C.text }).svg;
  const ly = y2 + 92; // link sticker spot
  svg += `<rect x="${m}" y="${ly}" width="250" height="44" rx="10" fill="none" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="5 5"/>` + T('link sticker: RSVP / tickets', m + 125, ly + 28, { f: 'a4', s: 15, fill: C.muted, a: 'middle' }).svg;
  // guides (not part of the post)
  for (const y of [top, H - bot]) svg += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#ffb020" stroke-width="1.5" stroke-dasharray="7 6"/>`;
  svg += T('UI zone: guide only, keep clear', W - 10, top - 10, { f: 'a7', s: 12, fill: '#ffb020', a: 'end' }).svg + T('UI zone: guide only, keep clear', W - 10, H - bot + 20, { f: 'a7', s: 12, fill: '#ffb020', a: 'end' }).svg;
  const mk = await L.logoD(26);
  return { raw, svg, comps: [{ input: mk, left: m, top: H - bot - 40 }], W, H, extra: T('Rise. Live It Loud.', W - m, H - bot - 20, { f: 'a7', s: 15, ls: 0.08, fill: C.muted, a: 'end' }).svg };
}
async function tracklist() {
  const S = 720, m = 30;
  const raw = L.paint(S, S, C.bg, [], 71, 4);
  let svg = frame(S, m, 'IDENTITY');
  const id = T('IDENTITY', 0, 0, { fit: S - 2 * m - 60 }), cap = id.s * 0.81;
  svg += T('IDENTITY', m + 30, m + 30 + cap, { fit: S - 2 * m - 60, fill: C.text }).svg;
  const y0 = m + 30 + cap + 40;
  svg += T('GLUCAK  ·  THE ALBUM  ·  08.13.27', m + 31, y0, { f: 'a7', s: 16, ls: 0.12, fill: C.muted }).svg;
  svg += `<rect x="${m + 30}" y="${y0 + 18}" width="${S - 2 * m - 60}" height="2" fill="${C.text}"/>`;
  const tr = ['IDENTITY', 'CHURCHBOY', 'SINGLE KIDS', 'WYLD LOVE', 'LIFE BLOOD', 'MAYDAY MAYDAY', 'LIGHT', 'MERE REFLECTION', 'ANOTHER DIMENSION', 'TRENCHES', 'FINISH STRONG', 'SCENIC ROUTE'];
  const cw = (S - 2 * m - 60) / 2, lh = 46;
  tr.forEach((t, i) => {
    const x = m + 30 + (i < 6 ? 0 : cw + 10), y = y0 + 70 + (i % 6) * lh, n = String(i + 1).padStart(2, '0');
    svg += T(n, x, y, { s: 32, fill: C.accent }).svg;
    const tw = T(t, 0, 0, { s: 32 }).w, room = cw - 56;
    svg += T(t, x + 46, y, { s: Math.min(32, 32 * room / tw), fill: C.text }).svg;
  });
  const mk = await L.logoD(30), mw = (await L.sharp(mk).metadata()).width;
  return { raw, svg, comps: [{ input: mk, left: Math.round((S - mw) / 2), top: S - m - 30 - 44 }], W: S, H: S };
}
(async () => {
  const W = 1420, H = 1170, pad = 60, top = 118;
  const sheet = Buffer.alloc(W * H * 3); for (let i = 0; i < W * H; i++) sheet.set([22, 22, 26], i * 3);
  const st = await story(), tl = await tracklist(), comps = [];
  const pngOf = async (o, extra = '') => L.sharp(o.raw, { raw: { width: o.W, height: o.H, channels: 3 } }).composite([...o.comps, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${o.W}" height="${o.H}">${o.svg}${extra}</svg>`) }]).png().toBuffer();
  comps.push({ input: await pngOf(st, st.extra), left: pad, top });
  comps.push({ input: await pngOf(tl), left: pad + 540 + 60, top });
  let svg = T('Social templates: story 9:16 and square', pad, 60, { f: 'a7', s: 28, fill: '#f2f2f2' }).svg;
  svg += T('Same ground, inks, type and frame device as the covers. Story shown at half size (real: 1080 x 1920); square at 720 (real: 1080).', pad, 92, { f: 'a4', s: 17, fill: '#a3a3ab' }).svg;
  svg += `<rect x="${W - pad - 92}" y="32" width="92" height="34" fill="none" stroke="#ffb020" stroke-width="2"/>` + T('MOCKUP', W - pad - 46, 56, { f: 'a7', s: 16, ls: 0.12, fill: '#ffb020', a: 'middle' }).svg;
  const nx = pad + 600, ny = top + 720 + 44;
  [['Tracklist reveal (square, also 4:5 by adding 135 px above and below).', '#c9c9d1'], ['Titles as read from his Oct 24 post: spelling to confirm with Gabe.', '#8d8d96'],
   ['Story: one swap per show (day word, venue, town, time, price).', '#c9c9d1'], ['Photo: MCCC MSP video still, native size. Venue and town are sample data.', '#8d8d96'],
   ['Orange dashed lines are guides, never posted.', '#8d8d96']].forEach(([t, c], i) => { svg += T(t, nx, ny + i * 28, { f: 'a4', s: 16, fill: c }).svg; });
  await L.save(sheet, W, H, svg, comps, 'V:/GLucakWebsite/docs/research/shots/round2/art-social.webp', 82);
})();
