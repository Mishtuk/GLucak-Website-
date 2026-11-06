# Backup + restore security review (Desktop boss, 2026-11-06): 9e3a633, checked at HEAD 70b95f3

Second, independent pass focused on security, done while the Laptop is out of tokens. The Laptop boss's review (aca19dd)
is kept below, unchanged. `src/lib/backup.js` and `tools/backup.mjs` are unchanged since 9e3a633, so **F1-F4 below are
still open**.

**Verdict: approve with fixes.** No auth bypass, no data leak, no traversal, no injection path, no polyglot survives.
The fixes are about restore failing safely (S1, S2) and the Laptop's F1 / F3, which are the only items with real
operational weight. Nothing blocks Nov 13.

How it was checked: `npm test` 142/142. Live: `node server.js` on port 8795 with `DIST_DIR` / `DATA_DIR` in the
scratchpad (stopped afterwards); restore probes ran `node tools/backup.mjs restore <file> [--yes]` against temporary
`DATA_DIR`s in the scratchpad. Probe scripts: `scratchpad/probe.mjs`, `restore-probe.mjs`, `half-probe.mjs` (not in the repo).

## Findings, worst first

**S1 (low): a restore that dies halfway leaves mixed data, a stack trace and no way forward.** `writeBackup` writes
photos, then `shows.json`, then `products.json`, with nothing catching an error between them.
Evidence (`half-probe.mjs`): `products.prev.json` made a folder so the products write fails, then
`restore half.json --yes` gave exit 1, a raw `Error: EPERM ... copyfile` trace, `shows.json` = NEW, `products.json` = OLD,
and a leftover `products.json.<pid>.<hex>.tmp`. The state is consistent (photos go first and restore never deletes
any, so no product points at a missing photo) and the pre-restore file exists, but the owner isn't told either.
Where: `tools/backup.mjs:46`, `src/lib/backup.js:61-70`.
Fix: wrap `writeBackup` in try/catch and print `Restore stopped partway (<error>). Run the same restore again, or restore <pre-restore file> to go back.`

**S2 (low): a restore over a damaged list loses the last good `.prev` copy.** When `shows.json` won't parse, the
pre-restore snapshot is skipped (SyntaxError branch) and `saveList` then copies the damaged bytes over `shows.prev.json`,
which was the last good list. Evidence: `shows.json` = truncated JSON, `shows.prev.json` = `LAST-GOOD`;
`restore c.json --yes` printed "they are kept as shows.prev.json", and afterwards `shows.prev.json` held the truncated
bytes, `LAST-GOOD` was gone and no `pre-restore-*.json` was written.
Where: `tools/backup.mjs:42-44`, `src/lib/store.js:60`.
Fix: in that catch, copy each existing `shows*.json` / `products*.json` in `DATA_DIR` to `pre-restore-<time>.<name>` before `writeBackup`.

**S3 (info): the download relies only on the browser's SameSite.** A valid cookie sent with `Origin: https://evil.example`
and `Sec-Fetch-Site: cross-site` gets 200 (no Origin check on GETs). That's not exploitable: a browser never sends a
`SameSite=Strict` cookie cross-site, and there's no `Access-Control-Allow-Origin`, so another page can't read the body.
Where: `server.js:184-186`. Optional fix: refuse `Sec-Fetch-Site: cross-site` with 403 on GET `/edit/api/*`.

**Still open from the Laptop review: F1 (medium) and F3 (low)** below. F3 is the one with security weight: a signed-in
editor's download runs `JSON.stringify` and synchronous brotli on the event loop (`server.js:188-190`). Since uploads
are never deleted (F1), the download keeps growing, and the public site stalls while one is built. F1's fix (only the
photos the products use, refuse over `MAX_FILE`) plus no compression on this response closes both.

## What passed (measured)

| Check | Request / probe | Result |
|---|---|---|
| Auth | GET `/edit/api/backup` with: no cookie; `gl_edit=Zm9v.YmFy`; a correctly signed cookie that expired 1 s ago; one signed with another secret; one for a removed editor (`bob`); one from an old password hash; a valid cookie + `.x`; `Host: localhost` without `DEV_EDITOR` | all **401** `signed_out` |
| Cross-site | valid cookie + cross-site `Origin`; `OPTIONS` preflight | 200 with no `Access-Control-*` header, `application/json` + `nosniff`; preflight **405**, no ACAO. Cookie is `HttpOnly; SameSite=Strict; Path=/edit` (`auth.js:37-38`) |
| Rate limit | 11 downloads in a row as `alex` | 10 x 200, then **429**. The 401 path isn't limited, but it costs one HMAC. |
| Leaks | planted `pre-restore-*.json`, `shows.prev.json`, `.env` with a secret, `<hex>.webp.tmp`, an upper-case-hex `.webp` in `DATA_DIR` | none of the markers appear in the backup; it holds only `shows`, `products` and `^[a-f0-9]{32}\.webp$` photos (`backup.js:19-28`). A symlink couldn't be planted on Windows (EPERM); the Laptop's Linux-style probe showed `isFile()` skips one. Everything in the backup is already public on the site (shows incl. Played, products on the `/shop/` preview). |
| Public reach of `DATA_DIR` | GET `/media/uploads/pre-restore-...json`, `/media/uploads/..%2fpre-restore...`, `/media/uploads/%2e%2e/shows.prev.json`, `/../.data/...`, `/%2e%2e/.data/...`, `/..%2f.data%2f...`, `/..%5c.data%5c...`, `/media/uploads/<hex>.webp.tmp` | all **404**; only `/media/uploads/<32 hex>.webp` is 200 `image/webp` (`server.js:280-285`, `UPLOAD_NAME`). Pre-restore files sit in `DATA_DIR`, outside `dist/`, and are never served. They're written with the default mode (0644 under a usual umask) but only hold public data. |
| Prototype pollution | top-level `"__proto__":{"format":...}`; `uploads.__proto__`; a show row with `__proto__` + `constructor.prototype` | refused (wrong format); refused (bad name); restored row is exactly `{date,type,venue,city}`: `checkShows` / `checkProducts` copy only known fields, and `JSON.parse` makes `__proto__` an own key |
| Polyglots | PNG + HTML/script tail; PNG `tEXt` chunk with script; JPEG `COM` segment with script; WebP with XMP holding script | each re-encoded by sharp to a fresh WebP (80-86 B), no EXIF/XMP, payload bytes absent. Served as `image/webp` + `nosniff` under a `script-src 'self'` CSP |
| Bombs | 1001 photo entries; one 6 MB photo; shows nested 1,000,000 deep; a 10 MB venue; 40 x 36 MP PNGs | refused in under 0.2 s (1000-photo cap; over 5 MB; "row is broken"; 300-char cap); the 40 x 36 MP set decoded serially in 3.4 s (CLI only, owner-run). The 50 MB cap is checked from `stat` before reading |
| Injection on the public site | restored rows go through `validateShow` / `validateProduct`; output via `esc()`; product `image` locked to `IMAGE`; links http(s) only; JSON-LD escapes `<` | holds (plus the test `<script>` venue stays text on `/shows/`) |
| All-or-nothing check | every refused file above | `Not restored. Nothing was changed.`; the test snapshot proves `DATA_DIR` is byte-identical |

Nit: on a case-insensitive disk (Windows dev) an upper-case-hex upload is served but left out of the backup; server
names are always lower case and production is Linux, so no change is needed.

---

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
