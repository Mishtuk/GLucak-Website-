# Boss review: the 18h port (a3c504a)

Laptop boss, 2026-11-06. Reviewed against DESIGN.md 18g / 18h, `docs/review/v2-port-review.md` (F1-F5 and the Now-line
fix), CONTEXT.md's hard rules and D39. Board post: `node tools/board.mjs read 2` (2026-11-06T23:22Z). Shots in
`docs/review/18h-port/` (`a11y/` is the `prototype/tools/a11y200.mjs --url` run, with its `report.txt`).

**Verdict: approved, nothing to fix.** The 18h CSS is the prototype's DELTAS block word for word, both extra fixes are
right, and the 200% "About over the Now line" is not on screen: it is a box inside the closed Menu, measured but never
painted. Quotes: one quote on Home (D67), not two.

## How it was checked

- `git pull --rebase` (at 22df541). `npm test`: build OK, **164/164**.
- `node server.js` with a temp `DATA_DIR`, port 8827. A second build with `QUOTES_APPROVED = true` went to a temp `--outDir`
  (`src/` restored right after; `git status` clean) and was served on 8828 with `DIST_DIR`. Both servers stopped (my PIDs only).
- Headless Chrome over DevTools at exact widths, reduced motion on, Spotify / YouTube blocked (the player box keeps its
  size). Text at 200% is the a11y200.mjs root-font injection. The a11y200 checker ran on the build's 8 routes (Home, Music,
  Shows, About, Shop, product, Privacy, edit) at 320 / 390 / 1280, 100% and 200%. The v2picks.mjs measures (Home height,
  player top, pictures per page, swipe row) ran as small scripts against the build, since v2picks.mjs serves only `prototype/`.

## What passes

| Check | Result |
|---|---|
| 18h D1, D2, D4, D7 | `global.css`'s new block is the prototype's DELTAS (`prototype/styles.css` 1086-1121) word for word, less the prototype-only chip line and the Now-line rule (already built). |
| D1 video row | Home 900: latest 301px wide, two stacked at 151px. Home 1280: 443 + 222 (the 18f numbers). 700-899px stays three across. First card `sizes="(min-width: 900px) 34vw, 82vw"`. Shot: `home-watch-1280.png`. |
| D2 FEAR lock | `class="phrase fit lock-push"`. One line from 900px, with the still under it. Belt `sizes="(min-width: 900px) 40vw, 30vw"`. |
| D4 phones | The still stands beside the lockup at the lockup's height, and the bio runs full width (6 lines at 390). Shots: `home-390-push.png`, and `home-390-200-push.png` at 200%. |
| Item 5, kicker date | `Sep&#xA0;4,&#xA0;2026` in the built HTML (U+00A0, bytes `C2 A0`). It goes through Astro `{}`, so no `set:html`. |
| Item 7, dead rules | `.rise-grid .release, .quote { grid-column: 1 }` and the 16f under-link line are gone. Music still shows "Listen everywhere" at 390 (`music-390-first.png`). |
| **Extra fix 1: /shows/ `grid-row: auto` from 72rem** | **Right.** Without it, at 1152 and 1280 the first card spans 2 rows inside the swipe row: the row is 501 / 548px tall with two cards stacked in column 2. With it, there are 3 swipe cards of 357 / 399px in one 257 / 280px row. At 900-1151 (the row runs full width, under the list) the D1 big + two stacked applies, as 18h item 1 asked (`shows-watch-1000.png`). |
| **Extra fix 2: `.quote-credit { display: block }`** | **Right, keep it.** With the old `display: inline`, the credit link (an `inline-flex`, which can't break) runs past the quote's right edge even at **320 / 100%** (link 120-329 in a quote that ends at 299), and at 200% at every width (up to 502 at 390). Block costs 28px per quote at 390, and that is part of why quotes-on came out 35-40px over (18f expected 5.85). The `margin-left: 0.4rem` left on a block credit is a small indent; harmless. |
| Text at 200% / sideways | a11y200: **0 views with issues in 48** (8 routes x 3 widths x 2 sizes). No sideways scroll, no overlap, no clipped text, no target under 48px. |
| Pictures | 7 on Home at 320 / 390, none repeated (quotes on or off). |
| Player top | 556 at 390x660 and 524 at 320x660, unchanged from 18f. |
| Injection / motion | No new `set:html` or `innerHTML`: the two on Home are the existing JSON-LD and the shows mount. No new animation or transition. |

## The open question: "About" over the Now line at 200%, scroll 0

**Not on screen. Nothing covers the Now line, and the phone bar is clear of it.** Measured at 200%, scroll 0, across
320 / 360 / 375 / 390 / 414 wide and 568 / 640 / 660 / 740 tall, with both header styles:

| View (200%) | Now link | Phone bar top | Painted on top of the link |
|---|---|---|---|
| 390x660 solid | 354-450 | 598 | nothing (`elementFromPoint` over the whole link) |
| 320x660 solid | 322-466 | 598 | nothing |
| 320x568 solid | 322-466 | 506 | nothing (40px clear) |
| 390x660 scrim | 310-406 | 598 | nothing |

These are the same numbers as the prototype after the boss fix (18f: 354 at 390; v2-port-review: 322-466 at 320). The
fix is built and working. Shots: `now-build-390x660-200.png`, `now-build-320x660-200.png`, `a11y/home-390-200.png`.

**Cause of the report.** The "About" is the third link of the phone **Menu sheet**: `header .nav-mobile` (a `<details>`)
> `nav.sheet` > `a` "About". The sheet is `position: absolute` under the header. While the menu is closed, Chrome hides
`<details>` content with `::details-content { content-visibility: hidden }`. That skips painting, but it still lays the
content out, so `getBoundingClientRect()` returns a box. At 200% that box is 269-465 x 297-405 at 390: right where the
Now line is. A probe that collects rects (box intersection) reports "About x Now". A painted check (`elementFromPoint`,
or a screenshot) finds nothing there: the stack at that point is slogan > hero photo. The scrim header shows a second
phantom, the sheet's "Shows" at 189-297. a11y200.mjs gets this right because it skips
`details:not([open]) > :not(summary)`. The coder's probe didn't. Opened, the sheet is full width at 200% (0-390 x 60-458;
each link 349px wide, nothing overflowing): `build-menu-390-200.png`, `build-menu-320-200.png`. The prototype has the same
markup, so it has the same phantom box. It was "clear" there only because the prototype's checker skips closed details.

**CSS:** no visual fix is needed. If the Desktop wants the phantom gone for every tool, this one line is safe (no
transition runs on the sheet, and opening it sets `[open]`):
```css
.nav-mobile:not([open]) > .sheet { display: none; }
```
Optional, not blocking. The better fix is in the probe: skip closed `<details>` content, as a11y200.mjs does.

## Quotes vs D39 (ruled in D67)

Raw `scrollHeight` at x660, from the build plus the quotes-on build (my quotes-off 390 baseline is 49px taller than the
Desktop's 3584 at the same commit, probably the shows data in its `DATA_DIR`; the 320 figures and every delta agree):

| Home | 390 (Desktop baseline) | 390 (mine) | 320 |
|---|---|---|---|
| Quotes off | 3584 = 5.43 | 3633 = 5.50 | 3814 = 5.78 |
| Both quotes | 3868 = **5.86** | 3917 = 5.93 | 4126 = **6.25** |
| **RISE quote only** | 3756 = **5.69** | 3805 = **5.77** | 4014 = **6.08** |
| LIVE quote only | 3696 = 5.60 | 3745 = 5.67 | 3926 = 5.95 |

The RISE quote is 160px at 390 (188 at 320). LIVE's is 104 + 8. Shots: `home-on-390-full.png` (both),
`home-quote-rise-only-390-full.png`.

**Ruling: one quote on Home, the RISE one.** "God will always be with you, and will never leave you in the valley. Trust
me, I know." is the faith-and-survival voice the whole site is built on, and it sits in the release card beside the song.
"Hope to see you there!" is a promo sign-off, and the shows list right under it already says that. Dropping LIVE puts
Home at 5.69 by the D39 measure, 0.11 under the cap with room to spare, even on my taller baseline (5.77). The cap stays
5.8 at 390. The quote's layout stays as built (the inline credit overflows, see above).

## For the Desktop

1. When Gabe OKs the quotes: remove `<Quote band="live" class="quote-live" />` from `src/pages/index.astro`, and drop or
   keep the `live` entry in `QUOTES` (unused). Then flip `QUOTES_APPROVED`, re-measure (expect 5.69 at 390), and update
   the content.js comment to cite D67. The RISE quote needs his OK just like before.
2. Optional: the closed-sheet line above, or teach your probe to skip closed `<details>`.
3. Nothing else: 18h is done.
