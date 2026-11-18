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
film('hero-land', 1280, 720, [['ZGlnFchIVVY.mp4', 21, 'print'], ['K-OZiNvQB14.mp4', 58, 'toner'], ['ZGlnFchIVVY.mp4', 167.5, 'soft'], ['K-OZiNvQB14.mp4', 24, 'mono']]);
film('hero-port', 720, 1280, [['scenic-hi.mp4', 106.5, 'print'], ['scenic-hi.mp4', 34, 'toner'], ['scenic-hi.mp4', 165.5, 'soft'], ['scenic-hi.mp4', 56, 'mono']], 31);
console.log('done');
