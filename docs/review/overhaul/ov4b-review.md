# OV4b review: the edit screen's Releases tab (e34b89e..4ab7011)

Reviewer: advisor (read-only). Verdict: **go with changes**. No P0. One P1 (backups), one P1-ish craft item on phones (clipped Coming tag).
Evidence: `npm run build` OK; `node --test test/releases.test.js test/edit.test.js test/backup.test.js` = 38 pass; live server on :8110
(DEV_EDITOR=1, temp DATA_DIR `.work/ov4b-data`), curl probes, headless Chrome CDP shots in `.work/ov4b/` (script `.work/ov4b-shots.mjs`, `ov4b-shots2.mjs`). Server stopped (nothing on :8110).

## Findings

### P1
1. **Backups omit releases.json and release covers (the coder's known gap, confirmed).** `src/lib/backup.js` `makeBackup` (lines ~21-33) returns
   `{format, version, created, shows, products, site, uploads}`; I ran it against the live data dir and the key list has no `releases`.
   `uploads` is built only from `products[].image` (`photoOf`), so a release cover uploaded to `/media/uploads/<hex>.webp` is not in the file either.
   `server.js:223` (`backupBytes(DATA, {shows, products, site})`) and `tools/backup.mjs:~9-23` pass no releases fallback. Restoring never touches releases.
   Fix (keep FORMAT/VERSION 1, `releases` optional like `site` was):
   - `makeBackup`: add `releases: readList(data, fallback.releases, 'releases.json')`; build the photo set from `[...products.map(p=>p.image), ...releases.map(r=>r.cover)]` (UPLOAD_NAME filter stays).
   - `checkBackup`: `const rl = b.releases === undefined ? null : checkReleases(b.releases.filter(r=>r?.title!=='IDENTITY'), b.releases.filter(r=>r?.title==='IDENTITY'))` (checkReleases rejects the IDENTITY title, so split it out and pass it as `keep`); add its errors; add an on-disk/in-file warning for each cover under `/media/uploads/`; return `releases: rl?.rows`.
   - `writeBackup`: `if (r.releases) saveList(data, r.releases, fallback.releases, 'releases.json')`.
   - Pass `releases: RELEASES` in `server.js:223` and the `FALLBACK` in `tools/backup.mjs`; add a round-trip test in `test/backup.test.js` (release with an upload cover survives export, wipe, restore).
2. **Coming tag clipped on phones.** `public/js/edit.js:185` puts the tag after the type/date text in `.ed-row-meta` (`src/pages/edit/index.astro:215`, `overflow:hidden; text-overflow:ellipsis; nowrap`). At 390px "Single, Jan 15, 2027" + tag shows "Com" cut off (`.work/ov4b/releases-390.png`, rows 1 and 2). It is the one thing the row exists to flag. Fix: let `.ed-row-meta` wrap (`flex-wrap: wrap`, drop nowrap on the meta, keep it on the title), or shorten the meta on narrow widths (drop the year when it is the current year), or put the tag before the date text.

### P2
3. **A corrupt or empty releases.json locks Gabe out of the Releases tab.** `server.js:163`: `check` calls `readList(...)` to get IDENTITY; on corrupt/empty JSON it throws, so POST returns 500 (`{"error":"server"}`), and GET `/edit/api/releases` is also 500 (verified with `{bad` and a 0-byte file). Public pages are fine (they fall back to the built list, verified `/` and `/music/` 200). Missing file is fine (falls back to shipped list, GET and save work). Fix: in `check`, wrap the IDENTITY lookup in try/catch and fall back to `readList(DATA-less, RELEASES)` i.e. `JSON.parse(readFileSync(RELEASES))` filtered to IDENTITY; and make `readList` failure on GET return the shipped list (or 409-style "file damaged, restore .prev" message). Note the same GET 500 already exists for the other tabs; the save path is the new part.
4. **Cover path is shape-checked, not existence-checked.** `src/lib/releases.js:12,58`: a well-formed `/media/uploads/<32hex>.webp` that does not exist saves, then the Music crate shows a broken image (no fallback to the sleeve). Low risk (Gabe can only type/paste; the field is not truly hidden) but cheap to close: in `checkReleases` accept `uploads/` covers only if the file exists, or render the sleeve on `<img onerror>`-free CSS by checking existence in `crateHtml`'s caller.
5. **Date hint is wrong for Spotify links.** `public/js/edit.js:177`: "Until then the site shows Pre-save." `tileAction` (src/lib/releases.js:21) gives Pre-save only for `lnk.to`; a Spotify link shows "Follow on Spotify". Reword: "Until then the site shows it as Coming."
6. **Upload guard is global.** `public/js/edit.js` `uploads` counter: an upload on the Releases tab makes Save on Products say "wait" and vice versa (`waitFor` holds one tab). Harmless, slightly confusing. Fix: per-tab counter.

### P3
7. The Cover field is a raw path text box (`/media/uploads/...`) for a non-technical owner, same pattern as Products. Consider read-only plus a "Remove cover" button (the hint "Empty it to remove" is correct but fiddly).
8. `src/lib/releases.js` `shown()` accepts http: links at render time while save requires https (fine for the shipped Spotify/lnk.to rows; just note the two rules differ).
9. Saving drops fields the form does not know (`checkReleases` keeps title/date/type/remix/link/cover/artists). The shipped file has no other fields, so no loss today; a future hand-added field would vanish on first save.

## What I verified (and how)

Security, all via live POSTs to `/edit/api/releases` (DEV_EDITOR):
- Link: `javascript:`, `data:`, `http:` all 400 "has to start with https://". Whitespace/control chars refused (`CTRL`, `\s`). Max 300.
- Cover: `/media/covers/../../server.js`, `/media/uploads/../x.webp`, `https://evil/x.webp` all 400; the regex `COVER` allows only `/media/covers/<slug>.webp` or `/media/uploads/<32hex>.webp`.
- Title: IDENTITY / identity refused (reserved); object-typed title refused; control chars and >120 refused. Date: `2026-02-30` refused (`validDate` round-trips). Type: unknown refused; Remix album maps to album + remix.
- Caps: 201 rows 400; 200 KB body 413 (cap 128 KB); count 200.
- 409: stale version returns 409 with the message. Atomic write + `.prev`: `releases.json` and `releases.prev.json` both present after saves (`saveList` temp + rename, `.prev` only if current parses).
- Auth/Origin/CSRF: bad Origin 403; `text/plain` 415 (JSON only); the route sits behind `editor()`; cross-site GET refused (code `server.js:~213`); POST without a session 401 (code path; DEV_EDITOR bypass is localhost + loopback + non-PROD only).
- IDENTITY: tab never sends it; `check` re-adds the saved IDENTITY row; file still has exactly 1 IDENTITY row after saves. IDENTITY title cannot be sent as a normal row.
- Injection: saved a title `Go (OV4b <b>test</b>)` through the UI; `/music/` rendered it as literal text, 0 `<b>` elements. Every injected value in `crateHtml`/`latestHtml`/`listenHtml` goes through `esc()` (title, artists, link href, cover src, dateLine, type tag); marker swaps use a replacer function (no `$&` expansion); `nowHtml` escapes in `relStub`. `fillReleases` order cannot be re-entered because `<` is escaped in data.
- Fallbacks: corrupt / empty / missing releases.json: `/` and `/music/` 200 with the built list; see P2-3 for the API side.
- Time: server `etDay()` (America/New_York) drives Coming; client `today()` at `public/js/edit.js:7` uses the same zone; the "Who I Am" (Nov 13) vs "Welcome Home" (Dec 18) split on Nov 18 matches.
- `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`: none in `public/js/edit.js` (grep).
- Shared `uploader()`: Products tests pass (`test/shop.test.js`, `test/edit.test.js`); the Products row still builds the photo block from `uploader('products', ...)`; upload route code untouched.

Browser (390x844 and 1280x800): Releases tab open, one row open, `/music/` (top and crate), `/` (top and latest block). No horizontal scroll at either width. A real UI save of a changed title showed "Saved. It's on the site now." plus "See it on the site", and `/music/` showed the new title on the next load. Home "latest" block rendered "Who I Am" with the sleeve and "Next: Welcome Home, Dec 18. Pre-save."

Not run: reduced-motion shots (OV4b adds no motion; the edit screen has none; public pages unchanged in motion).

## Design review (scoped to OV4b)

Nielsen /20: Visibility of status 3 (dirty ring, Saved line, Coming tag; tag clipped on phones), Match to real world 3 (plain words, Remix album as a type; cover path field and Pre-save hint wording), Consistency 4 (same row/shell/save bar as Shows and Products, five-tab bar reads as one system), Error prevention/recovery 3 (per-row messages, delete confirm that says it waits for Save; corrupt-file lockout), Aesthetic/minimal 3 (clean, calm; no big cover preview in the row beyond a 48px thumb). **Total 16/20.**

Craft floor: PASS. Tap targets 52px tabs, Edit and Save buttons large; focus ring visible on the open Title field; contrast fine on the navy ground; five tabs sit as 3+2 on phones and one row at 1280 with no overflow; hit targets and labels are real labels. Sleeve for coverless releases is on-brand and legible at both widths (music-crate shots).

Design P-list: P1 Coming tag clipped at 390 (finding 2). P2 date hint copy (5). P3 raw cover path field (7). P3 at 1280 the form's lower half (Upload a cover) sits under the sticky save bar until scrolled, same as Products; acceptable.

## Gate suggestion
Pass after: (1) backup fix with round-trip test, (2) wrap the Coming tag. P2 3-6 can ride the next round.
