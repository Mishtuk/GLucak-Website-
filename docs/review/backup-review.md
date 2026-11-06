# Backup + restore review (Laptop boss, 2026-11-06): Desktop 9e3a633

Scope: `GET /edit/api/backup` (server.js), `src/lib/backup.js`, `tools/backup.mjs`, `test/backup.test.js`, the link in
`src/pages/edit/index.astro`. Ruling and words: **D65**, `docs/copy/round2.md` section 5.

**Verdict: approved, safe to keep live.** No security defect. One real correctness defect (F1: the download can outgrow
what restore accepts) and two small ones; plus the page message for a failed download (F4, from D65). None blocks Nov 13,
but F1 and F4 should land before Gabe is told the backup exists.

## How it was checked

- Read every changed line, plus `auth.js` (`allow`, cookie), `store.js` (`readList`, `saveList`), `upload.js` (`toWebp`).
- `npm test`: **136/136**.
- Live: `node server.js` with `DEV_EDITOR=1`, a temp `DATA_DIR`, `PORT=8791` / `8792`; only those PIDs killed. Probe scripts
  in the scratchpad (not in the repo). Restore probes ran `tools/backup.mjs restore <file> --yes` against the temp `DATA_DIR`.

## What holds (measured)

| Check | Result |
|---|---|
| Auth | 401 signed out and with a forged cookie (tests). `DEV_EDITOR` only off production, localhost URL, loopback socket. |
| Same-origin | GET has no Origin check, and needs none: the cookie is `SameSite=Strict; Path=/edit`, so a cross-site link or `<img>` arrives signed out (401); no CORS header (`Access-Control-Allow-Origin` absent), `application/json` + `nosniff`, so another site can't read or script-include it. The only side effect is the rate-limit count. |
| No caching | `Cache-Control: no-store` on the 200 and on the 401 / 429 (`json()`); `X-Robots-Tag: noindex`; no service worker. |
| Rate limit | Live: 10 downloads, then 429 `Too many backups. Wait an hour, then try again.` HEAD is 405 and doesn't count. Per editor name, 1 hour sliding. |
| Filename | `glucak-backup-${etDay()}.json`: `etDay()` is `en-CA` `YYYY-MM-DD`, server-made, no user input. Safe. |
| No secrets | The body is only `shows` + `products` (the same lists `GET /edit/api/shows` / `products` already return) + photos named `^[a-f0-9]{32}\.webp$`. Live probe: `SESSION_SECRET` and the `EDITOR_USERS` hash not in the body; a `secret.json`, an upper-case-hex name, a full-width-hex name, a `.webp.tmp` and a **symlink** with a valid name pointing at a secret file were all left out (`isFile()` is false for a symlink). Rate-limit state is never read. |
| Restore name allowlist | Same regex as the upload route (JS `$` without `m` does not match before a trailing `\n`). Refused live: `../x.webp`, `x.png` (tests); full-width hex, a trailing `\n`, a trailing NUL, `C:\x\<hex>.webp`, `__proto__`. Names are printed through `JSON.stringify`, so a hostile name can't drive the terminal. |
| Bombs | Size checked from `stat` before reading (50 MB), again on the text. Each photo: base64 shape, 5 MB decoded, then `toWebp` (format allowlist, 40 MP cap from the header before decoding, `limitInputPixels`). Live: a 30000 x 30000 PNG refused in 0.4 s without decoding; GIF and SVG-with-script refused; `[` nested 200,000 deep refused cleanly ("This row is broken"); `shows` as an object refused. |
| All-or-nothing | Every row and photo is checked before the first write; the refused set left `DATA_DIR` byte-identical (test snapshot + live listing). |
| Pre-restore snapshot | Written with `wx` to `DATA_DIR/pre-restore-<time>.json` before anything is replaced; any failure other than a corrupt current list aborts the restore; `shows.prev.json` / `products.prev.json` are kept too. |
| Re-encode | Live: a PNG carrying an EXIF `Copyright: GPS-SECRET` came back as a WebP with no EXIF and without that string in the bytes. |
| Atomic writes | Photos via temp + rename (temp names never match the allowlist, so never served); lists via `saveList`. |
| Injection | A `<script>` venue restored stays text on `/shows/` (test). |

## Findings for the Desktop

**F1 (medium): the download can be a file restore refuses.** The backup holds every upload ever made, including orphans
(photos uploaded and then replaced, or uploaded and never saved; nothing deletes uploads), and nothing checks its size against
`MAX_FILE`. Measured: 160 photo-sized uploads (250 KB each, about one 1200px phone photo) gave a **52.1 MB** download and a
52.1 MB `export`; `node tools/backup.mjs restore` on it: `Not restored: the backup is bigger than 50 MB.` Gabe would get a
file that looks fine and only fails on the day it's needed. Fix:
1. `makeBackup` reads `products` first and includes only the photos the products use (orphans are never shown on the site;
   restore never deletes photos, so orphans on disk are untouched). This also closes a small race: today the uploads folder
   is listed before `products.json` is read, so a photo uploaded and saved between the two is referenced but missing.
2. If the built backup is still over `MAX_FILE`, don't send it: log it and answer 413 JSON with
   `This backup is too big for one file. Tell the person who runs the site.` (the page shows it, F4); the CLI `export`
   prints the same and exits 1.
3. Tests: an orphan upload is not in the backup; a backup over the cap is refused at download.

**F2 (low): one missing photo blocks the whole restore.** `checkBackup` refuses the file when a product's
`/media/uploads/<name>` isn't in the backup, even when that photo is already in `DATA_DIR/uploads`. Concrete: an upload file
lost from disk (a partial copy during a host move, a hand-deleted file) makes every later backup unrestorable, shows
included. Fix: accept it when the photo is in the backup **or** already on disk; otherwise print a warning in the dry run and
in the `--yes` output (`Product 3: its photo "<name>" is not in the backup, so it will be missing on the Shop page.`) and restore the
rest. Bad photos *inside* the file stay hard errors.

**F3 (low, do with F1): the download blocks the public site while it's built.** `send()` brotli-compresses the body
synchronously. Measured on the 52 MB backup: a public request waited **1.46 s** with `br` (0.68 s without). Base64 WebP only
saves its base64 overhead. Fix: skip compression for this one response (an option on `send`, or write it directly). F1's
smaller backup shrinks the rest.

**F4 (build, from D65): a failed download says nothing on the page.** Today the link is a plain `download` link, so a
signed-out session, the 10-an-hour limit or a dropped connection gives at most a "Failed" line in the browser's download
list, or the error JSON saved as a file (browser-dependent), and nothing on the edit screen. The sign-in check on page load
doesn't cover a tab left open past the 7 days, or a password change. Spec in `docs/copy/round2.md` section 5.

## Nits (no change needed)

- A PNG over sharp's own 268 MP header limit says "not a photo" rather than "over 40 megapixels". Refused either way.
- Restoring onto the same server re-encodes photos it already has (a second lossy pass). Skipping a name that is already on
  disk would avoid it; F2's on-disk check is the natural place, but it's optional.
- `pre-restore-*.json` files pile up in `DATA_DIR`; the owner deletes old ones. A disk filling mid-restore leaves each file
  whole but the set mixed; the snapshot covers it.

## Done when (Desktop)

F1-F4 built; `npm test` green with the new tests (orphan left out, over-cap download refused, missing-photo warning, page
messages for 401 / 429 / 413 / offline); the boss re-checks with the 160-upload probe.
