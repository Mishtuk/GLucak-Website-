// Mockup 2: IDENTITY show poster, two inks (indigo + violet) on warm white stock. The site's poster card uses the same layout.
const L = require('./lib.cjs'), { C, T } = L;
const K = 'V:/GLucakWebsite/assets/from-gabe/live-alexander-kealey.jpg';
(async () => {
  const PW = 900, PH = 1200, m = 46, inner = PW - 2 * m;
  // type (all one ink: indigo). Hierarchy: name, date, venue, details, slogan.
  let ty = '';
  const name = T('GLUCAK', m - 4, 0, { fit: inner + 8, fill: '#fff' }); const capH = name.s * 0.81;
  ty += T('GLUCAK', m - 4, m + capH, { fit: inner + 8, fill: '#fff' }).svg;
  const y1 = m + capH + 30;
  ty += `<rect x="${m}" y="${y1}" width="${inner}" height="5" fill="#fff"/>`;
  ty += T('LIVE  ·  THE IDENTITY SHOWS', m, y1 + 40, { f: 'a7', s: 22, ls: 0.14, fill: '#fff' }).svg;
  ty += T('ALBUM 08.13.27', PW - m, y1 + 40, { f: 'a7', s: 22, ls: 0.14, fill: '#fff', a: 'end' }).svg;
  const py = Math.round(y1 + 66), ph = 520; // photo box
  // date block knocked out of the photo, bottom left, set in the ink
  const db = { x: m, y: py + ph - 200, w: 300, h: 200 };
  ty += `<rect x="${db.x}" y="${db.y}" width="${db.w}" height="${db.h}" fill="#fff"/>`;
  const by = py + ph + 30;
  ty += T('VENUE NAME', m, by + 84, { s: 96, fill: '#fff' }).svg;
  ty += T('TOWN, PA   ·   7 PM   ·   ALL AGES   ·   FREE', m, by + 128, { f: 'a7', s: 24, ls: 0.06, fill: '#fff' }).svg;
  ty += `<rect x="${m}" y="${PH - m - 62}" width="${inner}" height="2" fill="#fff"/>`;
  ty += T('Rise. Live It Loud. Push Past Fear. The Time Is Now.', m, PH - m - 22, { f: 'a4', s: 21, fill: '#fff' }).svg;
  const ink1 = await L.svgPlate(ty, PW, PH, 5);
  // knock the date figures out of the indigo block (paper shows through)
  const dateKO = T('FRI', db.x + 22, db.y + 62, { s: 56, fill: '#fff' }).svg + T('DEC 04', db.x + 20, db.y + 178, { fit: db.w - 40, fill: '#fff' }).svg;
  const ko = await L.svgPlate(dateKO, PW, PH, 6);
  for (let i = 0; i < ink1.length; i++) ink1[i] = Math.max(0, ink1[i] - ko[i] * 1.15);
  // photo: violet plate carries the tone, indigo plate only the deep shadows, off-register by 3px
  const tone = await L.grey(K, { left: 1170, top: 1400, width: 1000, height: 643 }, inner, ph, 1.15);
  const vi = L.plate(tone.map(v => 1 - L.smooth(0.25, 1, v)), inner, ph, 6.5, 15, 41), sh = L.plate(tone.map(v => (1 - L.smooth(0, 0.42, v)) * 0.9), inner, ph, 6.5, 45, 42, 3, 2);
  const place = (p) => { const o = new Float32Array(PW * PH); for (let y = 0; y < ph; y++) for (let x = 0; x < inner; x++) { const i = (py + y) * PW + m + x; o[i] = p[y * inner + x]; } return o; };
  const viP = place(vi), shP = place(sh);
  // the date block sits on top: clear the photo inks under it
  for (let y = db.y; y < db.y + db.h; y++) for (let x = db.x; x < db.x + db.w; x++) { viP[y * PW + x] = 0; shP[y * PW + x] = 0; }
  for (let i = 0; i < ink1.length; i++) ink1[i] = Math.min(1, ink1[i] + shP[i]);
  // one-colour mark stand-in (from Logo D's alpha) in violet, bottom right of the venue line
  const mk = await L.markMask(64);
  for (let y = 0; y < mk.h; y++) for (let x = 0; x < mk.w; x++) { const i = (by + 40 + y) * PW + (PW - m - mk.w + x); viP[i] = Math.max(viP[i], mk.cov[y * mk.w + x] * 0.95); }
  const poster = L.paint(PW, PH, C.paper, [{ cov: viP, color: C.accent, op: 0.92 }, { cov: ink1, color: C.bg, op: 0.96 }], 9, 7);
  // sheet: the print lying on a dark surface, soft shadow
  const W = 1080, H = 1420, ox = 90, oy = 120;
  const sheet = Buffer.alloc(W * H * 3); for (let i = 0; i < W * H; i++) sheet.set([22, 22, 26], i * 3);
  const shadow = await L.sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${ox + 6}" y="${oy + 12}" width="${PW}" height="${PH}" fill="#000" opacity=".55"/></svg>`)).blur(14).png().toBuffer();
  const pp = await L.sharp(poster, { raw: { width: PW, height: PH, channels: 3 } }).png().toBuffer();
  let svg = T('Show poster template: 18 x 24 in, two-ink screen print', ox, 62, { f: 'a7', s: 28, fill: '#f2f2f2' }).svg;
  svg += T('Indigo + violet on warm white stock. Sample data. The site\u2019s poster card is this layout with the era colours.', ox, 94, { f: 'a4', s: 17, fill: '#a3a3ab' }).svg;
  svg += `<rect x="${W - ox - 92}" y="34" width="92" height="34" fill="none" stroke="#ffb020" stroke-width="2"/>` + T('MOCKUP', W - ox - 46, 58, { f: 'a7', s: 16, ls: 0.12, fill: '#ffb020', a: 'middle' }).svg;
  svg += T('Photo: Alexander Kealey (Gabe-only crop). Mark: a one-colour stand-in cut from Logo D\u2019s alpha; Dave or Gabe draws the real one.', ox, H - 40, { f: 'a4', s: 16, fill: '#8d8d96' }).svg;
  await L.save(sheet, W, H, svg, [{ input: shadow, left: 0, top: 0 }, { input: pp, left: ox, top: oy }], 'V:/GLucakWebsite/docs/research/shots/round2/art-show-poster.webp', 72);
})();
