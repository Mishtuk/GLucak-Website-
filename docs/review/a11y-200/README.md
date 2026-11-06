# WCAG 1.4.4 / 1.4.10 at 200% text (src/styles/global.css only)

Method: Chrome via playwright, `html{font-size:200%}` injected (harsher than real browser zoom, which also halves the viewport),
pages `/ /music/ /shows/ /about/ /shop/` at 390 and 1280. Checked: elements past the viewport edge, `document.scrollWidth`, overlapping a/button/summary boxes.

| | Before (390 x 200%) | After |
|---|---|---|
| scrollWidth / viewport | 673 / 390 on every page | 390 / 390 |
| Off-edge elements | Menu, hero Shows, show rows, Tickets, footer links | none |
| Header | brand collides with Menu | word hides, mark stays (container query, under 19rem of bar) |
| 1280 x 200% scrollWidth | 1314 (footer links) | 1280 |

Fixes: hero buttons `flex-wrap`; header-bar container query; poster and rows stack under 17rem of card; footer and About link grids
use `auto-fit` + rem min widths; phone bar columns `minmax(0,1fr)`.
Remaining overlaps are the fixed bottom phone bar over page content (also at 100%) and the off-screen skip link.
Not met: 320 wide at 200% text (stricter than the criterion) still overflows 24px on /about/ and 10px on /shop/.
100% check: /shows/ and / at 390 keep their height; the footer link columns moved up to ~4px (equal columns instead of max-content).
Shots: `before*` / `after*` `-390-200.png` (viewport) and `-390-100.png` (full page). Test: `test/a11y200.test.js` (static).
