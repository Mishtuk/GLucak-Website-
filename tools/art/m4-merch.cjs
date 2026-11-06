// Mockup 4: merch directions. Flat garment drawings, prints as unevenly inked plates. One or two screens each.
const L = require('./lib.cjs'), { C, T } = L;
const GW = 440, GH = 480;
const TEE_F = 'M150 30 C175 60 265 60 290 30 L400 74 L436 170 L372 192 L360 160 L360 470 L80 470 L80 160 L68 192 L4 170 L40 74 Z';
const TEE_B = 'M150 30 C175 42 265 42 290 30 L400 74 L436 170 L372 192 L360 160 L360 470 L80 470 L80 160 L68 192 L4 170 L40 74 Z';
const HOOD = 'M150 46 L40 88 L2 440 L58 446 L82 210 L80 470 L360 470 L358 210 L382 446 L438 440 L400 88 L290 46 Z';
async function garment(ox, oy, kind, fill, print) {
  // print: {svg (white shapes, garment coords), color}[] -> plates
  let g = '';
  if (kind === 'hood') g += `<path transform="translate(${ox} ${oy})" d="M140 60 C112 18 150 -12 220 -12 C290 -12 328 18 300 60 Z" fill="${fill}" stroke="#34343c" stroke-width="2"/>`;
  g += `<path transform="translate(${ox} ${oy})" d="${kind === 'hood' ? HOOD : kind === 'back' ? TEE_B : TEE_F}" fill="${fill}" stroke="#34343c" stroke-width="2" stroke-linejoin="round"/>`;
  const seam = kind === 'hood' ? 'M168 48 C190 96 250 96 272 48 M200 86 L196 150 M240 86 L244 150 M130 360 L310 360 L330 440 L110 440 Z M82 210 L80 470' : kind === 'back' ? 'M150 30 C175 42 265 42 290 30' : 'M150 30 C175 60 265 60 290 30 M158 34 C180 70 260 70 282 34';
  g += `<path transform="translate(${ox} ${oy})" d="${seam}" fill="none" stroke="#3c3c46" stroke-width="2"/>`;
  return g;
}
(async () => {
  const W = 1620, H = 760, pad = 60, top = 130, gap = (W - 2 * pad - 3 * GW) / 2;
  const sheet = Buffer.alloc(W * H * 3); for (let i = 0; i < W * H; i++) sheet.set([22, 22, 26], i * 3);
  const X = [pad, pad + GW + gap, pad + 2 * (GW + gap)];
  let base = '';
  base += await garment(X[0], top, 'front', '#121214');
  base += await garment(X[1], top, 'hood', '#1c1f3d');
  base += await garment(X[2], top, 'back', '#121214');
  const bg = await L.sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#16161a"/>${base}</svg>`)).removeAlpha().raw().toBuffer();
  // 1. slogan tee: the four phrases as fitted lines (the site's hero lockup), one white ink
  let p1 = ''; const cx = X[0] + 220, pw = 210; let y = top + 118;
  for (const line of ['RISE.', 'LIVE IT LOUD.', 'PUSH PAST FEAR.', 'THE TIME IS NOW.']) { const t = T(line, 0, 0, { fit: pw }); y += t.s * 0.81; p1 += T(line, cx - pw / 2, y, { fit: pw, fill: '#fff' }).svg; y += 9; }
  // 2. mark hoodie: one-colour mark big on the chest, GLUCAK under it
  const mk = await L.markMask(70);
  let p2 = T('GLUCAK', X[1] + 220, top + 268, { s: 30, ls: 0.12, fill: '#fff', a: 'middle' }).svg;
  // 3. tour back: name, era, dates (dates in the second ink)
  let p3w = '', p3v = ''; const bx = X[2] + 110, bw = 220;
  const nm = T('GLUCAK', 0, 0, { fit: bw }); p3w += T('GLUCAK', bx, top + 70 + nm.s * 0.81, { fit: bw, fill: '#fff' }).svg;
  let yy = top + 70 + nm.s * 0.81 + 26;
  p3w += T('IDENTITY  ·  2027', bx + bw / 2, yy, { f: 'a7', s: 13, ls: 0.14, fill: '#fff', a: 'middle' }).svg; yy += 30;
  for (let i = 0; i < 9; i++) { p3v += T(i === 0 ? '08.13' : 'MM.DD', bx, yy, { s: 19, fill: '#fff' }).svg; p3w += T(i === 0 ? 'RELEASE SHOW' : 'VENUE  ·  TOWN, ST', bx + bw, yy, { s: 19, fill: '#fff', a: 'end' }).svg; yy += 25; }
  const pl1 = await L.svgPlate(p1 + p2 + p3w, W, H, 81), pl2 = await L.svgPlate(p3v, W, H, 82, 1.5, 1);
  // mark into plate 1
  const mx = Math.round(X[1] + 220 - mk.w / 2), my = top + 150;
  for (let yy2 = 0; yy2 < mk.h; yy2++) for (let x = 0; x < mk.w; x++) { const i = (my + yy2) * W + mx + x; pl1[i] = Math.max(pl1[i], mk.cov[yy2 * mk.w + x] * 0.92); }
  // ink over the garment pixels
  const out = Buffer.from(bg), wi = [238, 236, 232], vi = [168, 102, 255];
  for (let i = 0; i < W * H; i++) for (let k = 0; k < 3; k++) { let v = out[i * 3 + k]; v = v * (1 - pl1[i] * 0.94) + wi[k] * pl1[i] * 0.94; v = v * (1 - pl2[i] * 0.94) + vi[k] * pl2[i] * 0.94; out[i * 3 + k] = v; }
  let svg = T('Merch directions: simple marks, slogan type, a tour back', pad, 62, { f: 'a7', s: 28, fill: '#f2f2f2' }).svg;
  svg += T('Flat drawings, not product photos. Each print is one or two screens, so small runs stay cheap. No chrome, no gradients: those need a one-colour redraw first.', pad, 94, { f: 'a4', s: 17, fill: '#a3a3ab' }).svg;
  svg += `<rect x="${W - pad - 92}" y="34" width="92" height="34" fill="none" stroke="#ffb020" stroke-width="2"/>` + T('MOCKUP', W - pad - 46, 58, { f: 'a7', s: 16, ls: 0.12, fill: '#ffb020', a: 'middle' }).svg;
  const cap = [['Slogan tee (front)', 'His four phrases as fitted lines, the site\u2019s hero lockup. 1 screen, white on black.'],
    ['Mark hoodie', 'One-colour mark (stand-in cut from Logo D). 1 screen, white on navy.'],
    ['Tour-back tee (back)', 'Dates in violet, the rest white. 2 screens. Sample dates only.']];
  cap.forEach(([a, b], i) => { svg += T(a, X[i], top + GH + 56, { f: 'a7', s: 18, fill: '#e6e6ea' }).svg + T(b, X[i], top + GH + 84, { f: 'a4', s: 15, fill: '#8d8d96' }).svg; });
  await L.save(out, W, H, svg, [], 'V:/GLucakWebsite/docs/research/shots/round2/art-merch.webp', 82);
})();
