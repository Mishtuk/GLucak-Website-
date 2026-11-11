// Round IG5 inner-page grounds (DESIGN 24): our own seeded geometry, saved as colourless SVG masks. CSS paints each one
// tone-on-tone (`--line` 50% into `--bg`, as the hero wall, DESIGN 23b item 1), from 900px only, static. Sibling of
// texture.mjs (photo slots); this file draws no photo, so no licence and nothing to crop. Same seed = same file.
//
// node tools/photo/grounds.mjs                     -> every ground into public/media/, era src/eras/placeholder.json
// node tools/photo/grounds.mjs --era path.json     -> the contrast check for another era (the SVGs carry no colour)
// node tools/photo/grounds.mjs --only=turns        -> one ground (turns, grooves)
//
// The masks are colourless (black paths on transparent; a CSS mask reads the alpha), so an era swap needs no re-draw:
// the check below re-measures the painted tone against the era's text and muted colours (WCAG 2), and fails under 4.5:1.
// Not from Book of Shapes: Truchet tiling (Smith, 1987, after Truchet, 1704) and an Archimedean spiral are plain geometry.
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
const ROOT = fileURLToPath(new URL('../../', import.meta.url)).replace(/\\/g, '/');
const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(x => x === `--${k}` || x.startsWith(`--${k}=`)); if (!a) return d; return a.includes('=') ? a.split('=').slice(1).join('=') : argv[argv.indexOf(a) + 1] ?? d; };
const ERA_FILE = arg('era', ROOT + 'src/eras/placeholder.json'), era = JSON.parse(readFileSync(ERA_FILE, 'utf8'));
const OUT = ROOT + 'public/media/';
const only = arg('only', 'turns,grooves').split(',').filter(Boolean); // --only= (empty) = the contrast check alone
mkdirSync(OUT, { recursive: true });

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const n = v => +v.toFixed(1);
function write(name, w, h, body, note) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><!-- GLucak ${note}. tools/photo/grounds.mjs, DESIGN 24. A mask: CSS paints it. --><g fill="none" stroke="#000">${body}</g></svg>\n`;
  writeFileSync(OUT + name, svg);
  console.log(`  ${name} ${w}x${h}, ${(statSync(OUT + name).size / 1024).toFixed(1)} KB`);
}

// ======================= turns: the 404 ground =======================
// Quarter-arc Truchet: each square cell holds two quarter circles joining the midpoints of its edges, turned one way or
// the other at random. Every arc meets its neighbour, so the lines run on and on, turn at every cell and never arrive:
// the page's "wrong turn" as a line. Edges always meet at midpoints, so the tile repeats with no seam (CSS repeats it on
// screens wider than the file). Stroke = the site's 4px rule; cell 96px (five rows across a 1280 band: roads, not wallpaper).
function turns() {
  const cell = 96, cols = 18, rows = 9, w = cell * cols, h = cell * rows, r = cell / 2, R = rng(404);
  let d = '';
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const X = x * cell, Y = y * cell;
    if (R() < 0.5) { // arcs round the top-left and bottom-right corners
      d += `M${X + r} ${Y}A${r} ${r} 0 0 1 ${X} ${Y + r}M${X + cell} ${Y + r}A${r} ${r} 0 0 0 ${X + r} ${Y + cell}`;
    } else {         // round the top-right and bottom-left corners
      d += `M${X + r} ${Y}A${r} ${r} 0 0 0 ${X + cell} ${Y + r}M${X} ${Y + r}A${r} ${r} 0 0 1 ${X + r} ${Y + cell}`;
    }
  }
  write('g-turns.svg', w, h, `<path stroke-width="4" d="${d}"/>`, '404 ground: quarter-arc Truchet, seed 404');
}

// ======================= grooves: Music's ground, under RISE =======================
// A record seen from above: ONE groove, a spiral (a record has one), drawn as half-turn arcs about two centres half a
// pitch apart (the classic two-centre spiral, a few KB instead of thousands of points). Tracks are bands of tight pitch;
// between them the land, where the pitch opens up for a turn (what you see on a real side). The label is left blank,
// with its edge and the spindle hole. Track lengths: seeded, 9 tracks.
function grooves() {
  const S = 1440, c = S / 2, label = 216, outer = 708, pitch = 6, land = 22, R = rng(33);
  const weights = Array.from({ length: 9 }, () => 0.6 + R()), sum = weights.reduce((a, b) => a + b, 0);
  const turnsTotal = Math.floor((outer - label - 30 - land * 9) / pitch);
  const ends = []; let acc = 0; for (const wgt of weights) { acc += wgt; ends.push(Math.round(acc / sum * turnsTotal)); }
  let r = label + 30, d = `M${c + r} ${c}`, t = 0;
  while (r < outer) {
    const step = ends.includes(t) && t < turnsTotal ? land : pitch;    // a land after each track
    const r2 = r + step / 2;                                            // one turn = two semicircles; the second is wider
    d += `A${n(r)} ${n(r)} 0 0 1 ${n(c - r)} ${c}A${n(r2)} ${n(r2)} 0 0 1 ${n(c + r + step)} ${c}`;
    r += step; t++;
  }
  write('g-grooves.svg', S, S, `<path stroke-width="2" d="${d}"/><circle cx="${c}" cy="${c}" r="${label}" stroke-width="4"/><circle cx="${c}" cy="${c}" r="9" stroke-width="4"/>`, `Music ground: one spiral groove, 9 tracks, seed 33`);
}

// ======================= check: the painted tone against the era's text (WCAG 2) =======================
// The ground is painted in color-mix(in srgb, var(--line) 50%, var(--bg)); --line is text 26% into bg (at --tint 0%),
// so every ground pixel is at most text 13% into bg (sRGB). Text sits on that worst pixel.
function check() {
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  const L = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const bg = hex(era.colors.bg), text = hex(era.colors.text), muted = hex(era.colors.muted);
  const line = bg.map((v, i) => v + (text[i] - v) * 0.26), ground = bg.map((v, i) => v + (line[i] - v) * 0.5);
  const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const toHex = c => '#' + c.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  const t = cr(text, ground), m = cr(muted, ground);
  console.log(`  era ${era.name}: ground ${toHex(ground)} on bg ${era.colors.bg}; text ${t.toFixed(2)}:1, muted ${m.toFixed(2)}:1 ${t >= 4.5 && m >= 4.5 ? 'PASS' : 'FAIL'} (4.5:1)`);
  if (t < 4.5 || m < 4.5) process.exitCode = 1;
}

const SLOTS = { turns, grooves };
console.log(`grounds -> ${OUT}`);
for (const k of only) { console.log(`(${k})`); SLOTS[k](); }
check();
