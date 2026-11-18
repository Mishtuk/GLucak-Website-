# OV2 + OV3 design review (DESIGN 28a-28h, 28j, 28k trim; D98-D112)
Reviewer: advisor, 2026-11-18. Evidence: `.work/ov23-after/` (+ re-shot `trim/`: Home 390/700/768/899/1280 from `npm run build`),
`npm test` 260/260 (as reported), sloplint `.work/ov23-sloplint.txt`.

**Verdict: PASS WITH FIXES** (one P1: the Share button is unstyled). **Score 33/40** (before 29/40; +4 hierarchy/shows/nav).
Rubric: visibility 3, match 3, control 4, consistency 3, error prevention 4, recognition 4, flexibility 4, aesthetic/minimal 4
(accent rule + ticket stub clean), error recovery 3 (share copy fallback), help 3 -> normalised 33. Share defect costs 2-3 points.

## 28x against spec
- 28a/28b OK: date order, lead big, "Next full show" link (Home foot row, Shows above list), Played folds. Home lists lead + 1 (28k trim).
- 28c **FAIL visually, safe in code.** `.share-btn` / `.share-stamp` get no `background` / `border` reset (global.css:102 is only
  `cursor`), so Chrome draws the grey button face: the 1280 Shows stamp reads white "Share" on light grey (about 1.1:1), the
  390 glyph is invisible, and in rows it sits over the date ("NOV 19" clipped, home-390 / shows-1280). See P1.
- 28d OK: Request a show -> Instagram + hint; cost escaped, 40 chars, newline refused, tested (shows.test.js:152).
- 28e OK: nav + Listen show at 700 / 768 / 899 / 1280 (`display:flex`), no horizontal overflow (xs false at every width).
  Home 700 3748, 768 3870, 899 4042, 1280 4332 (1280 was 4392). Lockups one line.
- 28f OK: Now stub 52px, a single link, Today dated. 28g OK: magenta only on Listen (and Pre-save, Buy); Patreon, Full bio, Join are ink.
- 28h OK: player first at 390/1280 (Music, Home), heading fades gone. 28j OK (placement only; "Next:" line, sound line).
- Hard rules: **0 running animations on every page** (`anim:0`), rm shots match, nothing flashes. No third-party script; share uses
  `navigator.share` / clipboard only. **Injection: PASS.** `6e7908f`: every `data-*` value goes through `esc(curly())`, the url is
  `new URL('/shows/#s-<showId>')` same-origin, the message is `textContent`, never `innerHTML`. `117607d`: cost is typed, trimmed,
  control chars refused, <= 40, rendered via `esc`; test feeds `<script>` + `' OR 1=1 --`; store has no SQL.

## Anti-slop gate (evidence)
Block 2 (R-09..R-22) no capsule badges, glass, glow, or template cards: PASS. Block 3 dials: one accent (D98), motif = the stacked
condensed lockup + paper ticket: PASS. Block 4: C-2 **FAIL while P1 stands** (Share control present, no visible label/glyph);
C-4 PASS at 390/700/768/899/1280. Gate: **clean once P1 is fixed**. Linter: no new item except rule 50 below; all other hits are
standing triage (`dr1/sloplint-notes.md`).

## Home 390: 3859 vs D39 cap 3828 (+31)
- **A (my pick), trim 31px by file:line:** `.sound` (global.css:1430) is 2 lines at 390 (about 54px). Set `font-size: var(--step--1)` and
  `max-width: none` so "EDM, rap and rock. Raw lyrics, real faith, high energy." fits one 350px line: about -27px; add the
  `.next-rel` `margin-top: 0` (RiseBand.astro:46 sits after the release block) for the last ~4px. Re-measure; no copy change, no ruling.
- **B, raise the cap:** 5.85 x 660 = 3861 (D39 amendment). Reason: the +31 is exactly the two lines the owner asked for in 28j and
  the 28k pre-decided trim is already spent; 5.85 is still under 6 screens. Cost: the cap becomes a moving number. Use B only if A
  lands over 3828 or the sound line must stay at step 0 for legibility.

## Triage (review-triage table)
| Finding | Evidence | Conf. | Decision | Why |
|---|---|---|---|---|
| Share button unstyled / overlaps date | home-390 crop, shows-1280, css:102,811,1402 | high | act P1 | broken control on the new feature |
| Rule 50 `.idn>.identity-state` bare 1fr | sloplint line 87 | medium | act P2 | the DR1 fix (`minmax(0,1fr)`) is missing here |
| Home 390 +31 | measured 3859 | high | act P2 | options above |
| 24a/24b/20/34/48/67/41, F4, F6, F15 | standing notes | high | skip no reply | house style / false positive / D-ruled |
| `.h-go` / `.next-rel a` 10px pad | css:1432 | high | skip | intentional 48px tap target, 0 height |

## Fix list
- **P1** global.css:811 + 1402: add `background: none; border: 0; font: inherit` to `.share-btn`; give `.share-stamp` `background: none; font: inherit`
  (the 3px border already exists at :792). Check ink / paper colours on `.poster` and `.is-plain`.
- **P1** global.css:798-811 (rows): at 390 the row's share button shares the date cell and covers "NOV 19": give `.row` a
  second `cal` column (`'date text btn' 'cal cal2 ...'`) or set `.row .share-btn { margin-left: 36px }` so the two glyphs sit side by side.
- **P2** the `.idn > .identity-state` track: `grid-template-columns: auto minmax(0, 1fr)` (same as DR1).
- **P2** Home 390 height: option A above (global.css:1430), re-measure <= 3828.
- **P3** edit `docs/review/dr1/sloplint-notes.md`: add rule 50 to "fixed" after the P2.
- **P3** add a shows test that the share `<button>` is `hidden` in markup and has an `aria-label` (28c is only checked by eye).
Fix round 1 of 2.
