// node tools/film/analyze.mjs -> per video: frame luma (YAVG 0-255) + scene score; prints the calmest 6s windows (no cut, no flash).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
export const FF = process.env.FFMPEG || 'C:/Users/alexm/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const D = join(import.meta.dirname, '../../.work/mv'); // yt-dlp downloads + frame data live here (not in git)
export function frames(file) {
  const meta = join(D, file.split(/[\\/]/).pop() + '.meta.txt');
  if (!existsSync(meta)) execFileSync(FF, ['-v', 'error', '-i', file, '-vf', `scale=160:-2,select='gte(scene,0)',signalstats,metadata=print:file=${meta.split(/[\\/]/).pop()}`, '-f', 'null', '-'], { cwd: D });
  const out = []; let cur = null;
  for (const l of readFileSync(meta, 'utf8').split('\n')) {
    const t = l.match(/pts_time:([\d.]+)/); if (t) { cur = { t: +t[1] }; out.push(cur); continue; }
    const y = l.match(/YAVG=([\d.]+)/); if (y) cur.y = +y[1];
    const s = l.match(/scene_score=([\d.]+)/); if (s) cur.s = +s[1];
  }
  return out;
}
// Flash check (WCAG 2.3.1 style, whole-frame proxy): count opposing luma swings >= 10% of range within any 1s; > 3 fails.
export function flashes(fr, fps = 30) {
  let worst = 0;
  for (let i = 0; i < fr.length; i++) {
    let n = 0, dir = 0, base = fr[i].y;
    for (let j = i + 1; j < fr.length && fr[j].t - fr[i].t <= 1; j++) {
      const d = fr[j].y - base;
      if (Math.abs(d) >= 25.5 && Math.sign(d) !== dir) { n++; dir = Math.sign(d); base = fr[j].y; }
      else if (Math.sign(d) === dir) base = dir > 0 ? Math.max(base, fr[j].y) : Math.min(base, fr[j].y);
    }
    worst = Math.max(worst, Math.floor(n / 2));
  }
  return worst;
}
if (process.argv[2]?.endsWith('.mp4')) { // check a built film: node tools/film/analyze.mjs public/media/film/hero-land.mp4
  const fr = frames(resolve(process.argv[2])); console.log(process.argv[2], 'flash pairs in any second', flashes(fr), '(must be 3 or fewer)');
} else if (process.argv[1].endsWith('analyze.mjs')) {
  const W = +(process.argv[2] || 6);
  for (const id of ['ZGlnFchIVVY', 'K-OZiNvQB14', 'jL3OKWeRFwg', '6SpsSt8rPzI', 'aZNW63M_C2E']) {
    const fr = frames(join(D, id + '.mp4'));
    const dur = fr.at(-1).t;
    const win = [];
    for (let s = 0; s + W < dur; s += 0.5) {
      const w = fr.filter((f) => f.t >= s && f.t < s + W);
      const cut = Math.max(...w.map((f) => f.s ?? 0));
      const dy = Math.max(...w.slice(1).map((f, k) => Math.abs(f.y - w[k].y)));
      const mean = w.reduce((a, f) => a + f.y, 0) / w.length;
      win.push({ s, cut, dy, mean });
    }
    const calm = win.filter((x) => x.cut < 0.25 && x.dy < 8 && x.mean > 35).sort((a, b) => a.dy - b.dy);
    const picked = []; for (const c of calm) if (picked.every((p) => Math.abs(p.s - c.s) > 15)) picked.push(c);
    console.log(id, 'dur', dur.toFixed(1), 'whole-video flash pairs/s max', flashes(fr), 'calm windows:', picked.slice(0, 8).map((p) => `${p.s}s(dy${p.dy.toFixed(1)},y${p.mean.toFixed(0)})`).join(' '));
  }
}
