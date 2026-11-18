# OV6 design review (advisor, 2026-11-18), commits 1aa5c31..f84bbc0

Verdict: **PASS (no P0, no P1).** Three P2s and three P3s, none blocking. Evidence: `.work/ov6/` and `.work/ov6-before/` shots
(all present, nothing re-shot), the owner's `ov6-sheet.png`, a fresh `npm run build` + `npm test` (307/307 pass), sharp measurements, the
built `dist/` HTML, hallmark sloplint static.

## Score
- **Critique (Nielsen 0-4, /40): 33.** Visibility 3, match 3, control 3, consistency 4 (one photo language now reads as one world), error
  prevention 3, recognition 4, flexibility 3, minimalist 4, errors 3, help 3. Before: 30. The About header and the gallery are the gain; the
  one-ink prints make the hero less loud and more owned.
- **Audit (/20): 17.** A11y 4 (alt on every gallery img, h1 > h2 order, global focus ring), perf 4 (all new files small, width/height set, no CLS),
  theming 3 (Print files use only bg/text; About photo is Gabe's violet), responsive 3 (the 1280 About gap, P2-1), anti-pattern 3 (nothing new
  from sloplint). Before: 15.
- **Craft floor: PASS.** Contrast, type, states, browser surfaces unchanged or better; no kicker, no gradient text, no side stripe added, no
  glass. Better than the "before" side on all six sheet rows; rows 1, 2 and 5 are the D98 reversal points and stay reversible (R7).

## Findings
**P2-1. About at 1280: a ~400px dead gap under the bio.** `src/styles/global.css:1435-1439` (`.about-body > .bio { grid-row: span 2 }`,
`.gallery { grid-column: 2 }`). The bio ends at about y 1215 and Book GLucak starts at about y 1617 (about-1280-rm-full.png) because the
row is as tall as the gallery. Fix: let `.bio` span 3 rows and move `.gallery` to start at row 2 so ForVenues rises beside it, or drop the
`grid-row: span 2` and put the gallery in the right column under the actions with `align-self: start`, and put `.prose` in the same grid. Pick
whichever keeps the bio level with the setlist (the `align-items: start` at 1436 is right).

**P2-2. "Magenta in no photo", owner call needed on the About header.** `public/media/cd-live-{640,1280,2400}.webp`. Measured: magenta
share (hue 285-330, s > 0.4, v > 0.35) 0.0%, but 86% of pixels fall in hue 255-285. Hue of saturated pixels: median 274, p99 281, max 290;
mean RGB (116, 8, 201). The accent is hue 289 (`#d93cfb`). I looked at it at 390, 768 and 1280: to a person it reads **vivid violet-purple**,
not magenta, but it is a full-bleed 427px band of saturated purple and sits next to the pink-magenta LISTEN button (hue 289), so the page's
two purples compete at the top. It passes the rule as written (D116 accepts Gabe's own grade, D51). If the owner means "any saturated purple
photo", it fails; the fix is to crop tighter (not to re-grade, D51), or move the band to Clean's studio frame. Recommend: keep, tell the owner.

**P2-3. Credits are one list, not tied to photos.** `src/pages/about/index.astro:52-54`. It prints all seven values, including "Photo:
Alexander Kealey" and "Video still: Joseph Lucak" although neither frame is on About (they are on Home). Matches 29d item 4 and prints each once
(verified: `credit-list` count 1, `class="credits"` count 0), and the wording matches `CREDITS.md` (MCCC, Kealey, Vladd, Joseph) and
`INDEX.md`, but a reader cannot tell which credit is which photo. Fix when convenient: add a short lead line ("Credits for every photo on
this site:"). Also `INDEX.md` still lists the Crooked Eye clip's videographer as "unknown"; `CREDITS.md` and `gabe-answers` row 13 say the
Scenic Route live clip is Vladd, and `DESIGN.md:2676` ties `aZNW63M_C2E` to Scenic Route, so the Vladd credit (deviation 6) is supported. Update
`INDEX.md` to say so (docs only).

**P3-1. Dead CSS from the removed hero variants.** `global.css:263, 321-329, 522-523, 562-563, 714-724` still carry `data-hero='b'` / `.credit-b`
rules. Base still prints `data-hero="a"` on About and "ab" on Home. Delete `html[data-hero='b']` and `.credit-b` blocks (the spec allowed it).

**P3-2. Gallery links open the bare .webp.** `about/index.astro:36-38`. No page chrome, Back returns. By spec (no lightbox, no script). The link name
is only the alt; fine for screen readers, but a keyboard user gets no hint it opens the image. Optional: `title`-less, so leave as is, or add
"(opens the photo)" in a visually hidden span in each `<a>`. The studio link serves the 154KB 960 file.

**P3-3. Home hero A at 390 shows only forehead and glasses.** `home-390-rm-screen.png`: the face is cut by the header under the sticky bar and the
photo is mostly dark halftone; GLUCAK reads fine (white on navy, 16.9:1) but the photo is nearly a texture. Same crop as before (before also
cropped him), so not a regression. If wanted: `object-position` / crop lower in `a-print-phone-800`.

## Verified (how)
- **Magenta, new webp files** (sharp, 300px, hue 285-330, s > 0.4, v > 0.35): a-print-phone-800 0.0, b-print-600/1000 0.0, poster-print-600 0.0,
  belt-print-320/634 0.0, stage-lines 0.0, garage-toner 0.0, cd-live-1280/2400 0.0, cd-studio-960 0.0, photo-mccc-478 0.7, photo-crooked-eye-634 0.1.
  All under 1%. Print files hit 99.6-100% two-colour (the test covers it).
- **Real photos, one place each:** grepped every non-exempt `/media/` in `dist/**/index.html`: About has cd-live, cd-studio, mccc, crooked-eye-1;
  Home has a/b-print (hero slot), belt, garage, stage; Shows' poster art `poster-print-600` is rendered by `showsHtml` (client) and only on the first
  full show (`shows.js:84,95`). No frame twice. No stock, no AI.
- **Motion:** the 29 CSS block (`global.css:1422-1439`) has no animation, transition, transform, filter or hover; only `:active`. Shot report: 0 running
  animations on Home, Shows, About, motion on and reduced, at 390 and 1280; no horizontal overflow.
- **CSP:** `git diff 1aa5c31..f84bbc0 -- public/js server.js` empty; About has only `app.js` and `boot.js`; no `gallery` string in `public/js`.
- **Gallery:** 3 `<li>`, each `<a href=/media/...webp>` wrapping an img with non-empty alt; no `target`, no `data-*`.
- **Readability:** `--muted #b7b2e3` on `--bg #05024c` 9.4:1, text on bg 17.0:1 (both pass 4.5). No text sits on any photo: About's lockup is under the
  header photo (768 and 1280 shots checked), Shows' poster text is navy on paper (about 15:1) beside the art, Home hero text is on bg ink.
- **Weight:** a-print-phone 38KB, b-print-600 9KB, b-print-1000 23KB, belt 11/36KB, poster 25KB, cd-live 7.6/17.9/32.8KB, mccc 21KB, crooked-eye 42KB,
  cd-studio 45/154KB. About LCP is `fetchpriority=high`, no lazy, `2400w` in srcset, 2400x1200 attrs plus CSS aspect-ratio (no shift). Gallery imgs
  `loading=lazy`, width/height set; the studio img has srcset+sizes.
- **A11y:** h1 (About) > h2 Photos > h2 Book / Credits, no skipped level; global `:focus-visible` 3px ring (`global.css:121`) reaches the gallery links.
- **Sloplint** (`node .work/hallmark/sloplint.mjs dist --genre atmospheric --scope page`): 74 FAIL / 36 REFLEX / 105 WARN, all rule ids (20, 24a, 24b, 34,
  48, 67, 41, 3, 58, F4, F6, F7, F15, F23) are standing in `dr1/sloplint-notes.md`; none points at `.push-photo`, `.gallery`, `.poster-art` or `.credit-list`.
  Rule 3 (`.quote`, `.yt-play`) and F4/F7/F23 are not in the notes; they are older rules, not OV6 (not changed in this range).

Side effects: I ran `npm run build` (rewrote `dist/`); no tracked source edited, nothing committed, no server started.
