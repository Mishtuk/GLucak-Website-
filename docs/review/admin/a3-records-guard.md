# A3 step 1: Records guard (mediator, 2026-11-23)

Scope: the Records block on Home (`<Records more />`), /videos/ (`<Records />`) and /shows/ (`<Records compact />`). Source: `src/components/Records.astro`, `src/components/videos.js` (groupVideos), `src/components/content.js` (videosPage, CREDIT_FOR), `tools/film/build.mjs` (SLEEVES), `src/data/videos.json`.

## 1. Must not change
- Markup: `section.band.band-crate[data-hs=row][aria-labelledby=h-crate] > div.wrap > h2.crate-h#h-crate > a.h-go[href=/videos/]` (Home); `p.crate-sub`; `ul.records > li.rec.rec-{a|b|c|d}`; inside: `a.rec-link[data-yt][data-title][data-meta]`, `span.rec-disc > span.rec-label`, `span.rec-sleeve > img.rec-img` + `span.rec-type > rec-artist, rec-name > span, rec-no > rec-no-l`, `span.rec-cap > v2-vtitle + vid-meta`; `p.start-line.vid-more > a.go`.
- Compact (/shows/): `div.records-watch#shows-video > h2 > a.h-go`, `ul.records.records-static`, no `crate-sub`, no footer line.
- Attribute order and values the tests read: `width/height 640`, `loading=lazy`, `alt=""`, `srcset 320w/640w`, `sizes`, `rel=noopener`, `data-yt`, `data-title`, `data-meta`.
- Dialog: `dialog.rec-open#rec-open[aria-labelledby=ro-title]` with `#ro-title`, `.ro-meta`, `.ro-close`, `.ro-screen`, `.ro-disc`. app.js binds to these ids and to `.ro-extra`.
- Sleeve layouts: `rec-a` (index 0 mod 4) to `rec-d` by **position in the list**, not per video. Layout a = plain; b = accent foot band; c = paper print inset; d = outlined number. Inks: CSS only, from palette tokens (`--ink-light`, `--ink-dark`, `--accent`, poster palette flips). The per-video grey treatment (toner / print / mono) is baked into each still by `tools/film/build.mjs`, not in CSS.
- Order: music (newest first, lyric videos after), then lead live clip, then other live (`groupVideos`). Now showing on /videos/ = first of that list (`all[0]`), not the lead.
- Full-bleed row: `.band-crate` container-type inline-size; `.records` margin `calc(50% - 50cqi)`, padding `calc(50cqi - rec-w/2)`; `--rec-w: min(58vw, 21rem)`; gap clamp; 62deg tilt at 0.68 scale; `rec-flow`/`rec-out` keyframes; pinned `is-pinned` path.
- View-transition names `rec-open` (set in app.js on sleeve and screen); `data-hs=row` pinned scroll.
- Home heading "Records" linking to /videos/ with "all videos" hidden text; footer "All videos" link (Home only; Videos page shows the Shorts line).
- Meta separator: ", " on Home and /shows/, " · " on /videos/ (test 20d).
- Flashing filter `FLASHING` and the `ok()` id check run before any row renders.

## 2. Data each sleeve needs, and where it comes from today
- Video row (`videos.json`): `id`, `title`, `kind` (music-video / lyric-video / live / other), `name?`, `with?`, `place?`, `lead?`, `featured`, `date`. No layout, no ink, no still field.
- Still: `public/media/sleeves/{id}-320.webp` and `-640.webp`, found by `existsSync` at build time; missing = plain sleeve (no img). Seven exist today (ZGlnF, K-OZ, jL3O, 6Sps, LBQ4, aZNW, OOGT).
- Layout: `'abcd'[position % 4]`, so it depends on list order, not the video.
- Ink: the still's baked style (`SLEEVES` entry 4th field) plus palette tokens.
- Credit: `CREDIT_FOR` in content.js matches `sleeves/<id>-` by regex; a new id needs an entry or the credits test fails.
- **New video from Gabe, no designer:** the server (not Gabe) fetches `https://i.ytimg.com/vi/{id}/hqdefault.jpg` (fixed host, id checked against `^[\w-]{11}$`), resizes to 320 and 640 squares by centre crop, writes `public/media/sleeves/{id}-*.webp` (server-side; no ffmpeg needed for the resize). Layout: add a stored field `sleeve` to the row, seeded for the seven shipped videos with today's letter (`a`-`d` by today's position), and for a new row use `hash(id) % 4` so it is stable across reorders. Ink: new rows get `mono`; the baked grey style is a deliberate deviation for YouTube's colour frame, so the owner decides before it ships. Failed fetch: plain sleeve, as today.
- Caution: today's layout moves when a row is put first or hidden (index rule). Storing the letter keeps today's look exactly; a rule that moves letters on Put first is a visible change and needs the owner.

## 3. Byte-for-byte test (proposed, not written)
1. On the Desktop, build the current tree (`npm run build`), copy `dist/index.html`, `dist/videos/index.html`, `dist/shows/index.html` to the scratchpad as the baseline.
2. Slice each file's Records block: from `<section class="band band-crate"` (Home, Videos) or `<div class="records-watch"` (Shows) through the matching `</dialog>`.
3. Render today's `src/data/videos.json` through the new live renderer with the same three option sets (`more`, default, `compact`) and the same `existsSync` view of `public/media/sleeves`.
4. `assert.equal(rendered, slice)` for each of the three. Any whitespace or attribute-order diff fails.
5. Then a second case: move one row to the top in a copy of the JSON and check only the layout letters the stored field dictates change.

## Not touched
Nothing else edited. No commit. Files named here are read-only references for the coder.
