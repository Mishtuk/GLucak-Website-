# DR1 after-review (advisor, 2026-11-17)

Verdict: **PASS WITH FIXES** (no P0/P1, no craft-floor FAIL). Score **31/40** (before 29): Visibility 3->4 (Today / Tomorrow in rows,
poster, Now line "Open mic today: M.O.M's"), Efficiency 2->3 (speculation rules + still phone bar); the rest unchanged (Aesthetic stays 3:
Shows 1280 right column still ends ~430px above the Played list).
Evidence: `after/` shots viewed (Home 390 on + reduced, Music 1280, Shows 1280, heights in shots.txt). npm test 245/245 per caller.

## 27a-27h vs spec
- 27a built: global.css 881-882 phone-bar name + animation none; reduced switches (883-886) cover it via `(*)`; Home 390 reduced shot shows a static bar. Prefetch is not motion.
- 27b built: Today / Tomorrow visible on Shows rows ("Today, Open mic, 7:00 PM"), Now line reads "Open mic today: M.O.M's".
- 27c built; **deviation**: Music 1280 +56 (3365 -> 3421). Cause: button 266 + 3 links (~90/64/90) + 24px gaps = ~585px, plus "Listen everywhere" (~137 + gap) = ~746 > 681px column, so it wraps (seen in after/music-1280-on-screen.png). Spec's "+0" was a mis-measure. **Accept**: listen is main action 1, +56 is on one page at one width, no overflow; log it in D96. (If the owner wants +0: on Music drop the "Listen everywhere" link, the three platform links replace it; not recommended, it is the smart link to Amazon/Tidal etc.)
- 27d built; Home/Shows/Videos quotes curly in shots. 27e built: lead + two under it at 1280, no sideways scroll, height 2393 kept. 27f built (global.css 103-105, tokens only). 27g heights match (Home 390 3782, Music 390 4412). 27h untouched.

## Hard rules
- Flash: none new, 0 animations at rest in all 40 shots. Motion: only change is one fewer fading thing; reduced == on heights (+48 reduced is the old Motion label wrap).
- Injection: `curly()` (shows.js 8-10) only swaps quote chars for non-ASCII; every call site runs it on plain text BEFORE `esc()` (shows.js 62, 69, 125, posterHtml/rowHtml) or into Astro's auto-escaped text (VideoBlock 12, VideoCard 10, v2 76, content.js 85). It never emits markup, so safe. Not applied to JSON-LD/.ics/inputs, as specified.

## Sloplint triage
Real (P3, cheap):
- global.css:503 `.identity-state { grid-template-columns: auto 1fr }` holds the mark image: use `auto minmax(0, 1fr)` (rule 50; the `.idn` and other grids already use minmax(0,1fr)).
- Rule 24a/24b `.btn` .4rem/1.5rem, `.btn-show` 1rem, `.h-go` 10px: hallmark spacing scale, ignore except nothing to do.
- WARN F23 (one page lacks meta description): Base.astro:42 always writes it, so check which dist page (probably 404/edit); ignore if 404.
House-style noise: 20 stamp (hallmark brand); 24a/24b own spacing scale; 41 dark surface no text colour (text inherits paper from body, contrast measured D93); F6 tabular figures on product price (shop not open; add `font-variant-numeric: tabular-nums` if wanted, not needed); 58 hero paragraph length; F7/F15 recipe/gap counts; 3 side stripes (`.quote` 4px rule and the `.yt-play` triangle drawn with a border, not a stripe).
Checked and not issues: 34: body already uses `overflow-x: clip` (global.css 96), which does not break sticky; `overflow-x: hidden` exists only in `@supports not (overflow: clip)` (line 1170) for old browsers (that fallback is what the linter sees); header sticks. 48: `#000` at global.css 265/482-483 is an alpha mask value, not a colour painted. 62: `.fade-wait` is added by app.js only to below-fold headings (app.js 49; CSS 340-342 comment), so without JS the phrase is visible and D47's no-JS rule holds; print rule at 344.
D-conflicts: 67 `.tracks-h` uppercase tracked display label (global.css 1316): house type system (D79/D87 section-word and poster type); leave, report to boss only if they want it changed. Eyebrow section word: D79/D87. Play square accent: D95. "Book GLucak" ending LISTEN: D91.

## Fixes
1. P2 D96 (DECISIONS.md): record Music 1280 +56 as accepted (3421) with the cause above; no code change.
2. P3 global.css:503 `.identity-state` -> `grid-template-columns: auto minmax(0, 1fr)`.
3. P3 Shows 1280: right column ends ~430px above Played list (after/shows-1280-on.png); content, accept or add later.
4. P3 sloplint noise stays unfixed; add a one-line note in docs/review/dr1 so the next run is not re-triaged.
