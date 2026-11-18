# DR1 before-review (designer, 2026-11-17)

Evidence: `docs/review/dr1/before/` (5 pages x 390x844 / 1280x800 x motion on / `prefers-reduced-motion: reduce`, full page plus
`-screen` first screen; heights in `shots.txt`). Shot script `.work/dr1-shots.mjs` (git-excluded; `node .work/dr1-shots.mjs after`
re-shoots into `after/`). Single-context run (design-review override 1: no impeccable tooling; Assessment B = these shots).
Full-page captures use `captureBeyondViewport`, so the fixed phone bar appears once mid-page at y 784: a capture artefact, not a bug.
At 1280 the Home Spotify box shows its "Loading" note in the full-page capture only (lazy iframe outside the real viewport); the
first-screen and Music shots show the player.

## Heuristics (0-4)
| # | Heuristic | Score | Why (seen in the shots) |
|---|---|---|---|
| 1 | Visibility of status | 3 | Current page marked (nav underline, phone-bar rule); a show **tonight** (M.O.M's, Nov 17) reads as just "NOV 17" and the Now line says "Out now: Who I Am" |
| 2 | Match real world | 3 | Plain words; dates not "when" (no Today / Tomorrow) |
| 3 | Control | 3 | Skip link before the player, Motion switch, no traps |
| 4 | Consistency | 3 | "Book GLucak" ends on LISTEN (D91, until BOOKING_EMAIL) |
| 5 | Error prevention | 3 | Sign-up states exist (DESIGN 19) |
| 6 | Recognition | 3 | Everything labelled; Shows 1280 Watch hides 2 of 3 videos behind a sideways scroll |
| 7 | Efficiency | 2 | Every page change waits on the network, then the 200ms fade; no prefetch |
| 8 | Aesthetic | 3 | Strong poster type and one accent; Shows 1280 right column clipped row + empty space |
| 9 | Error recovery | 3 | Copy names the fix ("Try again") |
| 10 | Help | 3 | n/a for a fan site; empty states written |
| | **Total** | **29/40** | |

Cognitive load: 1 fail (footer 7 links in one group, accepted D-ruled). Personas (Casey, Jordan, Sam): Casey taps Shows on the phone
bar and sees the whole bar fade with the page; Jordan can't tell tonight's open mic from next week's; Sam's selected text is the
browser's default blue on indigo.

## Craft floor
- Contrast: PASS (D93 era measured). Type: PASS (display max, measure ok). Motion: PASS (0 animations at rest, both motion states;
  root fade 200ms, off under reduce). States: PASS.
- **Browser surfaces: FAIL.** No `::selection`, `caret-color` or `scrollbar-color` anywhere in `src/styles` (grep): selection,
  the sign-up caret and the Shows row scrollbar ship browser defaults.
- **Copy: FAIL (minor).** Straight apostrophes in visible text: 404 "isn't", "You're Not Alone" (Home, Shows, Videos), sign-up
  "You're on the list." / "That didn't go through.", Gabe's venue "M.O.M's", ~20 edit-screen messages (`.work/quotes.mjs`).
- Refuse list, conflicts for the boss (override 4, not changed): the section word above each band reads as an eyebrow (craft floor
  ban) but is D79 / D87; the magenta Play square on every video poster is accent on a non-selling element (DESIGN 26, D95).

## The 5 weakest things
1. **A show tonight is invisible** (Home 390 screen one + Shows rows): Nov 17 open mic shows as "NOV 17"; the Now line prefers a
   4-day-old release. Main action 2 loses on its own day.
2. **Page changes are not seamless** (owner note 1, 2026-11-06): no prefetch, so each tap waits; on phones the bottom bar fades
   with the page while the header holds still.
3. **Listen is Spotify-only where people listen** (Home RISE under the player; Music has one generic "Listen everywhere").
4. **Shows 1280: the Watch row is a clipped sideways scroll** in a 487px column (second card cut at "You're No"), with ~600px
   of empty column under Book GLucak.
5. **Browser surfaces and straight quotes** (craft floor FAILs above).

Fixes: DESIGN 27 (DR1), D96. P0: none. P1: 1, 2. P2: 3, 4. P3: 5.
