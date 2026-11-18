# PW3 design review (reviewer, 2026-11-18), commits 7d13f93..072258b (other pages)

Verdict: **PASS WITH FIXES: no P0, one P1 (Music IDENTITY wordmark breaks into stacked letters at 390), four P2s.** The pages now read staggered and
consistent with Home. Evidence: `.work/pw3r/` (all pages 390/1280 identity + poster; Music and Shows in amber/green/steel at 1280), scripts
`.work/pw3r-shots.mjs`, `pw3r-sticky.mjs`; fresh loads (no resize) at 320/390/700/768/900/1024/1280/1600 on all 7 pages. Server on :8351 with an empty DATA_DIR, killed afterwards.
There is no ForVenues route: it is the Book GLucak sheet on Shows (checked there). `for-venues` in my script is a 404 page, ignore its shots.

## Measured
- **Home 390x660, shipped data: 3905** (cap 3920, OK). 1280: 4884.
- Fresh-load overflow: **none** at any of the 8 widths on Home, Music, Shows, About, Videos, Shop (scrollWidth == innerWidth; the only elements past the edge are the Home swipe row and the off-screen honeypot).
- 0 running animations on every page/palette shot. No inline `<script>` in dist. No `transition`/`animation` in the PW blocks (block 30 has only the 30b comment). The one new `:hover` rule (global.css:~1489) is in `(hover: hover) and (pointer: fine)`. No entrance code (30g not built, as specified).
- D51: the IDENTITY cover `img.idn-cover` and all its ancestors have no transform, rotate, filter, opacity or blend; it only lifts over the sheet's top edge. Pass.
- Sticky (About, 900 and 1280): `.about-actions` pins at top 88px under the 58px condensed header; at page bottom it scrolls away with the grid (top -661 / footer top 260), never overlaps the footer or the Credits sheet. Pass.

## Score
- **Critique (Nielsen /40): 34.** **Audit (/20): 16** (a11y 4, perf 4, theming 4, responsive 2, anti-pattern 2). **Craft floor: PASS.**
- Palettes: Music IDENTITY sheet is paper on identity (ink text, cover pops) and inverts to a dark sheet with cream text on Gig Poster; both legible. Shows next-show ticket and Book GLucak sheet legible in identity and poster; amber/green/steel shots show no clipped or low-contrast text.

## Findings
**P1-1. Music, phones: "IDENTITY" wraps to stacked letters (ID / EN / TI / TY) next to the mark, 390 (and 320).** The sheet's `.identity-state` row is mark + word in a 190px column; `overflow-wrap: anywhere` (global.css:1280) breaks the word. It looks broken on the first screen of the sheet. Fix: at max-width 699 make the state row stack, `.idn > .identity-state { grid-template-columns: 1fr; }` (global.css:1279 or a phone rule near 1572) so the mark sits above the word, or span the state area across both columns under the cover (`grid-template-areas: 'cover cover' 'state state' ...` at 699 down, as 1308 already does for narrow containers). Check it did not predate PW3; the sheet made it prominent either way.

**P2-1. Shows 900+: the right column ends ~1300px above the list's end.** Watch plus Book GLucak finish at about y=680 while the show list runs to 1480, leaving a big empty right half. Fix: make `.shows-side` sticky (`position: sticky; top: calc(var(--header-h) + 1rem); align-self: start`, global.css:~1604) so it follows the list; position only, not motion.

**P2-2. Videos 1280: dead gap under "You're Not Alone" (about 250px, left) before the Earned Your Stripes row, and the mosaic's 4/5 cards float.** It reads staggered but a little sparse. Fix: `.vid-grid > :nth-child(4)` `margin-top: -4rem` (global.css:~1644) or make card 1 `grid-row: span 3`.

**P2-3. Shop 1280: 4 across then the fifth product orphaned alone, leaving ~700px empty above the footer.** Fix: 5 products across 3 columns at 1100+ (`.shop-grid { grid-template-columns: repeat(3, 1fr) }` with the stagger on `3n+2`), or accept; D49 says no more shop work.

**P2-4. Shows 390: Book GLucak sheet and Played panel sit after a very long list; the Watch row is between them.** Fine structurally; consider collapsing the 28-row list (owner call, not PW3).

**P3.** About (1280): the staggered collage and sheet work; the sheet's left offset and the bio column stack tightly under the "PUSH PAST FEAR" heading (about 20px). Optional `margin-top` on `.about-body`.

## Stagger / rhythm
Music: mirrored Rise, paper sheet with the cover breaking its top, crate dropping columns 2 and 4. Shows: angled ticket for the next show, poster breaking out, 7/5 columns. About: 7/4 split with sticky actions, 5/3/4 collage, inset sheet. Videos: torn bg-2 band, 7/5 mosaic. Shop: crooked taped notice, dropped even cards. No two neighbours alike and no clipping or overlap seen at 768/1280/1600.

## How verified
Headless Chrome CDP, fresh navigations, full-page screenshots, getAnimations(), element-rect overflow, sticky position sampling at scroll steps, computed-style check of the cover chain, greps for transition/hover/inline script. No tracked source edited, nothing committed.
