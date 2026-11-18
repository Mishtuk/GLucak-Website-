// node tools/film/build.mjs -> public/media/film/hero-{land,port}.mp4. Gabe's own music videos, fetched with yt-dlp into .work/mv
// (owner OK 2026-11-18): V:\tools\yt-dlp\yt-dlp.exe -f "bv*[height<=720][ext=mp4]" -o .work/mv/<id>.mp4 <url> (Scenic Route: height<=1280 as scenic-hi.mp4).
// Rapping Like (Oh Yeah) is left out: 4 flash pairs in a second (analyze.mjs). Run analyze.mjs on the outputs after every change.
// Each shot: a calm 4s window (no cut, no flash: analyze.mjs/win.mjs), slowed to 6s, gray, one print style each; 1s crossfades,
// and the loop point is a crossfade too (the film ends on the frame it starts with). The colours come from CSS (two inks).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { FF } from './analyze.mjs';
const D = join(import.meta.dirname, '../../.work/mv'), OUT = join(import.meta.dirname, '../../public/media/film'); mkdirSync(OUT, { recursive: true });
const STYLE = {
  print: 'gblur=sigma=1.2,eq=contrast=1.45,lutyuv=y=floor(val/64)*85',
  toner: 'gblur=sigma=1.5,eq=contrast=2.1:brightness=0.04',
  soft: 'eq=contrast=0.85,gblur=sigma=2.5',
  mono: 'eq=contrast=1.25',
};
function film(name, w, h, shots, crf = 27) {
  const args = ['-v', 'error', '-y'];
  const parts = [];
  shots.forEach(([file, s]) => args.push('-ss', String(s), '-t', '4', '-i', join(D, file)));
  // A' (shot 0 from 1s), B, C, D, then E = shot 0's first 1s, so the last frame is the first frame.
  const seg = (i, st, trim) => `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},format=gray,${STYLE[st]},setpts=1.5*(PTS-STARTPTS),fps=24${trim},format=yuv420p,settb=1/24`;
  const st = shots.map((x) => x[2]);
  parts.push(`${seg(0, st[0], '')},split[a0][e0]`);
  parts.push(`[a0]trim=start=1,setpts=PTS-STARTPTS[A]`);
  parts.push(`[e0]trim=end=1,setpts=PTS-STARTPTS[E]`);
  for (let i = 1; i < shots.length; i++) parts.push(`${seg(i, st[i], '')}[S${i}]`);
  let cur = 'A', len = 5;
  for (let i = 1; i < shots.length; i++) { parts.push(`[${cur}][S${i}]xfade=transition=fade:duration=1:offset=${len - 1}[X${i}]`); cur = `X${i}`; len += 5; }
  parts.push(`[${cur}][E]xfade=transition=fade:duration=1:offset=${len - 1}[out]`);
  args.push('-filter_complex', parts.join(';'), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(OUT, `${name}.mp4`));
  execFileSync(FF, args);
}
// Owner 2026-11-18: album covers for the videos. One square still per video (Gabe in frame; Riverside cropped to the stage, no
// audience), gray, a print style each; the cover design and its two inks are CSS (Videos page). node tools/film/build.mjs sleeves
export const SLEEVES = [ // id, second, crop w:h:x:y (source px), style
  ['ZGlnFchIVVY', 61, '720:720:280:0', 'toner'], ['K-OZiNvQB14', 27, '720:720:300:0', 'print'], ['jL3OKWeRFwg', 121, '720:720:180:0', 'mono'],
  ['6SpsSt8rPzI', 41.5, '720:720:280:0', 'mono'], ['LBQ4fqLVHSI', 21.5, '720:720:330:0', 'toner'], ['aZNW63M_C2E', 80, '720:720:0:250', 'toner'],
  ['OOGT3GxlQJk', 5, '360:360:150:20', 'mono'],
];
function sleeves() {
  const out = join(import.meta.dirname, '../../public/media/sleeves'); mkdirSync(out, { recursive: true });
  for (const [id, s, crop, st] of SLEEVES) {
    const src = id === 'aZNW63M_C2E' ? 'scenic-hi.mp4' : `${id}.mp4`;
    for (const w of [640, 320]) execFileSync(FF, ['-v', 'error', '-y', '-ss', String(s), '-i', join(D, src), '-frames:v', '1', '-vf', `crop=${crop},scale=${w}:${w},format=gray,${STYLE[st]}`, '-c:v', 'libwebp', '-quality', '74', join(out, `${id}-${w}.webp`)]);
  }
}
if (process.argv[2] === 'sleeves') { sleeves(); console.log('sleeves done'); process.exit(0); }
film('hero-land', 1280, 720, [['ZGlnFchIVVY.mp4', 21, 'print'], ['K-OZiNvQB14.mp4', 58, 'toner'], ['ZGlnFchIVVY.mp4', 167.5, 'soft'], ['K-OZiNvQB14.mp4', 24, 'mono']]);
film('hero-port', 720, 1280, [['scenic-hi.mp4', 106.5, 'print'], ['scenic-hi.mp4', 34, 'toner'], ['scenic-hi.mp4', 165.5, 'soft'], ['scenic-hi.mp4', 56, 'mono']], 31);
console.log('done');
