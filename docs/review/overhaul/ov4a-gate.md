# OV4a gate: IDENTITY + Bio tabs, live site.json (DESIGN 28i, D106, D112)

**APPROVED** (2026-11-18, boss). Commits 6f99e3b, 6ccb434, plus "OV4a gate fixes". `npm test` 277/277.

## Security
- Every field escaped at render: bio paragraphs and Home sentence go through `esc(curly(...))`; link `esc()` in href; date is
  `validDate` ISO before it reaches `datetime=`. `set:html` only takes `bioHtml/homeBioHtml/identityHtml` output (escaped).
- Marker spoofing: data `<` becomes `&lt;`, so a saved `<!--/gl:bio-->` can't close or open a marker; replacement is a function (no `$&`).
- Pre-save link is https-only (stricter than asked), no whitespace or control chars, 300 max. Home 400 / bio 4000 / body 32 KB caps.
- `/edit/api/site` reuses the LISTS path: session, Origin, JSON-only 415, 409 on stale version, atomic `saveList` + `.prev`.
  Check, version and save run with no await between them.
- Restore: `checkSite` with no base, so a backup site must be complete; older backups without `site` keep the saved one.
  CLI keeps `site.json` / `site.prev.json` aside before restoring.
- Tests cover script/attribute/marker payloads on /about/ and the home-bio + identity stubs on /music/, the quote-in-URL href, 401/403/415/409/413.

## Usability (12 PNGs, 390 + 1280)
- 2x2 tabs at 390, 1x4 at 1280; compact show rows; labels plain, help under each field; "On the site today" preview is right
  (268 days to Aug 13, 2027); save bar sits under the content, focus ring visible on the open row.
- Edit CSS is `is:global` in the edit page only; no edit classes reach the public pages. Built Home and About text match the seed.

## Gate fixes (one commit)
- server.js: the per-visit site is now the *normalized* `checkSite(...).rows` (a hand-edited file with padded date no longer
  reaches the IDENTITY release merge raw).
- Backup hint now says "shows, products, photos and bio" (edit page, docs/copy/backup.md, gabe-guide).
