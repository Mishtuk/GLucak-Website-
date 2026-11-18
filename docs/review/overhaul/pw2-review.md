# PW2 design review (reviewer, 2026-11-18), commits bc65ceb..276800e (Home layout)

Verdict: **PASS WITH FIXES: no P0, two P1s (Home over the D118 cap; horizontal overflow at 960-1010px and 1px on phones).** The layout works: Home now
reads staggered, not a pattern. Evidence: `.work/pw2r/` (identity 320/390/768/1280/1600 screen+full, poster and redline 390/1280 full), shipped
`src/data/shows.json` (server on :8341 with an empty temp DATA_DIR, stopped afterwards). Scripts: `.work/pw2r-shots.mjs`, `pw2r-ov*.mjs`. Spotify embed
did not load in the headless shots (grey "Player not loading" panel); ignore it.

## Measured
- **Home at 390x660, shipped data: 3980** (cap 3920, +60). 320: 4375, 768: 3938, 1280: 4904, 1600: 5428.
- 0 running animations in every shot. No `<script>` without `src` in dist/index.html. Block 30 has no `transition`/`animation`; the one new `:hover` rule
  (global.css:1497) is inside `(hover: hover) and (pointer: fine)`. D51 cover is not filtered, rotated or framed (the IDENTITY cover is plain at 390/768/1280).

## Score
- **Critique (Nielsen /40): 34.** Strong on visibility, consistency, recognition; minus for the overflow and the cap.
- **Audit (/20): 16.** A11y 4, perf 4, theming 4 (poster paper sheet inverts to a dark sheet with cream text and reads clearly; ticket on bg-2 is legible; redline fine),
  responsive 2 (P1-2), anti-pattern 2 (the Shows angle is faint in poster, P2-2).
- **Craft floor: PASS** (no gradient text, no side stripes, no glass, no new motion).

## Findings
**P1-1. Over the cap: 3980 vs 3920 (+60).** The DESIGN 30e trims sum to only -28, so they are not enough alone. Do these, in order, then re-measure:
1. `global.css:1487` `.ticket` padding block `var(--space-s)` to `0.5rem` (-8; footer ticket too).
2. `global.css:1548` phone sheet padding `var(--space-m)` top/bottom to `0.75rem` (-8).
3. `global.css:1545` `.band-push.v2-push` bottom padding `var(--space-xl)` to `var(--space-l)` (-12).
4. `global.css:594` `.band-push .prose { margin-top: var(--space-xl) }` to `var(--space-l)` (about -12).
5. `global.css:595` `.identity-state:has(.identity-lg) { margin-top: var(--space-xl) }` to `var(--space-l)` (about -12, check it is the Join IDENTITY row).
That is about -52; if still above 3920, the last 8-10 come from `.band-live` phone padding-bottom or the Shows `Today, Open mic` block gap. If the boss prefers,
accept ~3960 and raise the cap (the shipped shows added the height, not PW2). I did not apply any of this.

**P1-2. Horizontal overflow.**
- **960-~1010px: scrollWidth 996 at 960, 1015 at 1000, 1040 ok** (the word "IDENTITY", `p.identity` in `.band-now .v2-identity`, 50px type, overflows its 244px column;
  the container is 438-482px wide so the `@container (width < 26rem)` stack at `global.css:1099` never fires). Fix: raise that query to `30rem` (line 1099) or add
  `overflow-wrap: anywhere; min-width: 0` on `.v2-identity .identity`; or drop the `margin-left: 4rem` (line 1559) below 1100px. Re-test 900/960/1000/1040.
- **320 and 390: 1px (scrollWidth 321/391).** Source is the About sheet's tape: hiding `.band-push` gives 390. `.taped::after { right: -1rem }` (line 1483) pokes 1px past the
  viewport next to the 16px right margin (line 1548). Fix: on phones `.v2-push > .wrap.is-paper::after { right: -0.9rem }` or `overflow-x: clip` on `.band-push`.

**P2-1. 768 About sheet: the belt print is a thin strip beside the "PUSH PAST FEAR" heading** (30% column, `global.css:1131`). It reads as a banner, not a photo, and sits tight to
the heading. Fix: give it `aspect-ratio: 4/3` and `grid-row: span 2`, or move it under the heading at 700-899.

**P2-2. Poster (light): the Shows `edge-angle` is barely visible** (bg-2 `#e5dccb`-ish vs cream) and the section break reads as a plain tint change. The sheet below carries the stagger, so not
blocking. Fix: darken `--bg-2` by 3-4% for Gig Poster in `src/palettes.json`, or add a 2px rule on the angle.

**P2-3. Join at 768: ticket and IDENTITY stacked the wrong way round.** The cover sits above the countdown and top-right while the ticket is lower-left; the pair looks unaligned (`global.css:1556`).
Fix: `align-items: start` on `.now-grid` at 700-899 so both tops line up.

**P3-1.** Phone hero print is hidden by design (<900); the hero is the old composition, fine. **P3-2.** "Colours" pill covers the Spotify card corner at 390 (owner tool, fans never see it).
**P3-3.** At 1280 the Rise band's RISE word and print stagger well, but the empty right half under the garage print is dead space (about 280px); optional: nudge the Spotify card height.

## Stagger / rhythm
1280: hero (print right) > Rise mirrored (card left, RISE right) > Shows angled banner with the stage print bled right > Watch row > About sheet inset left, photo left > Join (phrase left,
ticket right, IDENTITY stepped in) > torn footer. No two neighbours alike; the sheet overlap and tape look intentional in all three palettes I shot. No clipping or overlap found at 768/1280/1600.

## How verified
Headless Chrome CDP at 320/390/768/1280/1600 identity, 390/1280 poster and redline; height via scrollHeight at 390x660; overflow via scrollWidth and element rects at 320/390/900-1100;
hide-section bisect for the 1px; grep for transitions/animations/hover/inline scripts. No tracked source edited, nothing committed; server stopped.
