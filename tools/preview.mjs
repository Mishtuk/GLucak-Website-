// Static preview for GitHub Pages (https://mishtuk.github.io/GLucak-Website-/), for the owner to look at.
// Builds the site, runs the real server, saves each page as served (shows / Now line / shop filled in at that moment),
// rewrites root paths to the Pages base, swaps the edit screen for a notice, and writes it all to .preview/.
// Publish: node tools/preview.mjs --publish  (pushes .preview/ to the gh-pages branch).
// ponytail: a snapshot. Past shows drop off only when it's re-run; the edit screen and sign-up don't work on Pages.
import { execSync, spawn } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, '.preview');
const BASE = '/GLucak-Website-/';
const PORT = 8899;
// Every built page (a hand list missed /videos/, so its Shop link stayed an empty marker). /edit/ is swapped for a notice below.
const PAGES = () => ['/', ...readdirSync(join(ROOT, 'dist'), { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'edit' && statSync(join(ROOT, 'dist', d.name, 'index.html'), { throwIfNoEntry: false })).map((d) => `/${d.name}/`)];
const sh = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });

sh('npm run build');
rmSync(OUT, { recursive: true, force: true });
cpSync(join(ROOT, 'dist'), OUT, { recursive: true });

const server = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SHOP_ENABLED: '1' }, stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i++) { try { await fetch(`http://localhost:${PORT}/`); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
  for (const p of PAGES()) {
    const r = await fetch(`http://localhost:${PORT}${p}`);
    if (!r.ok) { console.log('skip', p, r.status); continue; }
    mkdirSync(join(OUT, p), { recursive: true });
    writeFileSync(join(OUT, p, 'index.html'), await r.text());
  }
} finally { server.kill(); }

// The edit screen needs the server; on Pages it's a notice.
rmSync(join(OUT, 'edit'), { recursive: true, force: true });
mkdirSync(join(OUT, 'edit'), { recursive: true });
writeFileSync(join(OUT, 'edit', 'index.html'), '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Edit | GLucak preview</title><body style="font:18px system-ui;background:#111;color:#f5f5f5;padding:2rem"><h1>Preview only</h1><p>The edit screen works on the real site, not on this preview.</p><p><a style="color:#ff4d2e" href="' + BASE + '">Back to the site</a></p>');

// Root-absolute paths -> the Pages base. Only our own paths ("/x", not "//host").
const fix = (s) => s.replace(/((?:href|src|action|srcset|content|data-[\w-]+)=["'])\/(?!\/)/g, `$1${BASE}`) // data-* too: data-cover feeds the release dialog
  .replace(/(,\s*)\/(?!\/)(?=[\w-]+\/)/g, `$1${BASE}`)
  .replace(/url\((["']?)\/(?!\/)/g, `url($1${BASE}`);
const walk = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? walk(f) : [f]; });
for (const f of walk(OUT)) if (/\.(html|css|js|webmanifest)$/.test(f)) {
  let s = readFileSync(f, 'utf8');
  // The preview is the owner's: the Colors button always shows there (the real site still needs ?palettes).
  if (f.endsWith('app.js')) s = s.replace("new URLSearchParams(location.search).has('palettes')", 'true');
  if (f.endsWith('.js')) s = s.replace(/(['"`]|,\s*)\/(media|edit|shows|shop|api)\//g, `$1${BASE}$2/`); // and the 2nd+ entries of a srcset list (the 1280 stills broke on the preview)
  else s = fix(s);
  if (f.endsWith('.html')) s = s.replace('<head>', `<head><meta name="robots" content="noindex">`);
  writeFileSync(f, s);
}
writeFileSync(join(OUT, '.nojekyll'), '');
console.log('preview written to .preview/');

if (process.argv.includes('--publish')) {
  // A normal (fast-forward) push: the new snapshot is committed on top of the existing gh-pages history, never forced.
  const msg = `Preview ${new Date().toISOString().slice(0, 16)}`;
  // In CI (GITHUB_TOKEN set, contents: write) the clone/push carry the token; locally it uses the stored git credentials as before.
  const T = process.env.GITHUB_TOKEN, REPO = `https://${T ? 'x-access-token:' + T + '@' : ''}github.com/Mishtuk/GLucak-Website-.git`;
  const WT = join(ROOT, '.preview-git');
  rmSync(WT, { recursive: true, force: true });
  const exists = execSync(`git ls-remote --heads ${REPO} gh-pages`, { cwd: ROOT }).toString().trim() !== '';
  if (exists) sh(`git clone -q --depth 1 --branch gh-pages ${REPO} .preview-git`);
  else sh('git init -q -b gh-pages .preview-git');
  for (const n of readdirSync(WT)) if (n !== '.git') rmSync(join(WT, n), { recursive: true, force: true });
  cpSync(OUT, WT, { recursive: true });
  sh(`git -C .preview-git add -A && git -C .preview-git -c user.name="Alex Mishtuk" -c user.email=113945444+Mishtuk@users.noreply.github.com commit -q --allow-empty -m "${msg}" && git -C .preview-git push -q ${REPO} gh-pages`);
  console.log(`published: https://mishtuk.github.io${BASE}`);
}
