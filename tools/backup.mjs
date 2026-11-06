// Back up or restore the site's live data (DATA_DIR: shows, products, uploaded photos). For the owner, on the server.
//   node tools/backup.mjs export [out-file]       one JSON file, same as the edit screen's download
//   node tools/backup.mjs restore <file> [--yes]  without --yes: a dry run that changes nothing
// Restore treats the file as untrusted (src/lib/backup.js checks every row and photo first). With --yes it saves the
// current data as DATA_DIR/pre-restore-<time>.json before replacing anything. Same env as server.js: DATA_DIR,
// SHOWS_FILE, PRODUCTS_FILE.
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { MAX_FILE, TOO_BIG, backupBytes, checkBackup, writeBackup } from '../src/lib/backup.js';
import { etDay } from '../src/lib/shows.js';
import { liveFile } from '../src/lib/store.js';

const ROOT = join(import.meta.dirname, '..');
const env = process.env;
const DATA = resolve(env.DATA_DIR || join(ROOT, '.data'));
const FALLBACK = { shows: env.SHOWS_FILE || join(ROOT, 'src/data/shows.json'), products: env.PRODUCTS_FILE || join(ROOT, 'src/data/products.json') };
const args = process.argv.slice(2), yes = args.includes('--yes');
const [cmd, file] = args.filter((a) => a !== '--yes');
const die = (msg) => { console.error(msg); process.exit(1); };
const exportTo = (out, body = backupBytes(DATA, FALLBACK)) => { writeFileSync(out, body, { flag: 'wx' }); return out; };

if (cmd === 'export') {
  const body = backupBytes(DATA, FALLBACK);
  if (body.length > MAX_FILE) die(TOO_BIG); // restore would refuse it
  console.log(`Backup written: ${exportTo(resolve(file || `glucak-backup-${etDay()}.json`), body)}`);
} else if (cmd === 'restore' && file) {
  const st = existsSync(file) ? statSync(file) : null;
  if (!st?.isFile()) die(`No such file: ${file}`);
  if (st.size > MAX_FILE) die('Not restored: the backup is bigger than 50 MB.');
  const r = await checkBackup(readFileSync(file, 'utf8'), DATA);
  if (r.errors) die(`Not restored. Nothing was changed. Problems:\n${r.errors.map((e) => `  - ${e.message}`).join('\n')}`);
  const now = (name) => { try { return JSON.parse(readFileSync(liveFile(DATA, FALLBACK[name], `${name}.json`), 'utf8')).length; } catch { return 0; } };
  const fresh = [...r.uploads.keys()].filter((n) => !existsSync(join(DATA, 'uploads', n))).length;
  console.log([`Data folder: ${DATA}`,
    `Shows: ${now('shows')} now, ${r.shows.length} in the backup (replaces ${liveFile(DATA, FALLBACK.shows, 'shows.json')})`,
    `Products: ${now('products')} now, ${r.products.length} in the backup (replaces ${liveFile(DATA, FALLBACK.products, 'products.json')})`,
    `Photos: ${r.uploads.size} in the backup (${fresh} new, ${r.uploads.size - fresh} overwrite a photo with the same name; other photos are kept)`,
    ...r.warnings].join('\n'));
  if (!yes) {
    console.log('Dry run: nothing was changed. Run again with --yes to restore.');
  } else {
    mkdirSync(DATA, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    let back; // how to go back if the restore stops partway
    try {
      const pre = exportTo(join(DATA, `pre-restore-${stamp}.json`));
      console.log(`Current data saved first: ${pre}`);
      back = `restore ${pre} to go back`;
    } catch (e) {
      if (!(e instanceof SyntaxError)) die(`Not restored. Nothing was changed. The current data couldn't be saved first (${e.message}).`);
      // a damaged list is a reason to restore: keep its raw bytes (and the .prev copies) aside before anything is written
      let kept;
      try {
        kept = ['shows.json', 'products.json', 'shows.prev.json', 'products.prev.json']
          .filter((n) => lstatSync(join(DATA, n), { throwIfNoEntry: false })?.isFile())
          .map((n) => { const to = join(DATA, `pre-restore-${stamp}.${n}`); copyFileSync(join(DATA, n), to, 1); return to; }); // 1: COPYFILE_EXCL
      } catch (e2) { die(`Not restored. Nothing was changed. The current lists couldn't be copied first (${e2.message}).`); }
      console.warn(`The current lists can't be read (${e.message}); their files are copied first to:\n${kept.map((k) => `  ${k}`).join('\n')}`);
      back = `copy back the files from before (${kept.join(', ') || 'none could be read'})`;
    }
    try {
      writeBackup(DATA, r, FALLBACK);
    } catch (e) {
      die(`Restore stopped partway (${e.message}). Run the same restore again, or ${back}.`);
    }
    console.log('Restored. The site shows it on the next page load.');
  }
} else {
  die('Usage: node tools/backup.mjs export [out-file]\n       node tools/backup.mjs restore <file> [--yes]');
}
