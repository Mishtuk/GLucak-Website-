# R1 stress test: messy content on every page (ig-round3 eval fix 1)

Coder, Laptop, 2026-11-11, repo at d4fbfe3. Throwaway worktree with fixtures (removed; nothing of it is in the repo), build there,
`node server.js` (PORT 887x, temp DATA_DIR, SHOP_ENABLED=1), headless Chrome over CDP. `stress.mjs` here is
`prototype/tools/a11y200.mjs` with the same overflow / overlap / clipped checks plus three more: fitted phrases (`.fit`, `.ln`) that
leave their box, text that spills a box (or sits in one that clips it), and text under the fixed phone bar at the end of the page.
Views: /, /music/, /shows/, /about/, /shop/, /shop/#product-long-name at 320x568, 390x660, 1280x800, root font 100% and 200%
(36 views per data set), reduced motion. Re-run: `fixtures.mjs` + `fixtures-bio.mjs` in a worktree, then
`BASE=http://localhost:PORT TAG=x node docs/review/r1-stress/stress.mjs` (needs Node 24 and Chrome; `--look <page> <w> <font%> <selector> <file>` for a crop).

## Fixture set
| Where | Fixture |
|---|---|
| shows (temp `DATA_DIR/shows.json`) | 15 upcoming (Dec 12 to Dec 26: shows and open mics, some without a link) + 1 played. First two: 45-char venue ("The Crooked Eye Brewery and Taproom Pennsylva"), 40-char city ("West Bumblesville-on-the-Delaware, Penns"), and a 125-char `with` line. Also a 49-char unbroken venue word. Runs with 0, 1 and 15 upcoming. Run twice: "spaced" (real words) and "unbroken" (strings with no spaces) |
| releases.json | newest (Nov 10): 40-char title, artists "GLucak, J-BOY, Micah Haun, Emily Mae, The Crooked Eye Brewery House Band", `cover: null` (so it is Home "Latest single" with the placeholder). Nov 9: 42-char title with a 34-char word, a cover, a 46-char unbroken artist. Nov 8: no cover. One coming release with a 44-char title |
| videos.json | newest: 60-char title; next: 70-char title with no spaces (both featured, so both in the Watch row) |
| bio (About and the Home lead) | three paragraphs of about 530, 800 and 530 chars; the lead also ends in a 118-char pasted URL (About only) |
| products (temp `DATA_DIR/products.json`) | about 100-char name with 8 sizes and a 500-char description; 61-char unbroken name |

## Breakages found (before the fix) and what fixed them
All fixes are CSS in `src/styles/global.css` (10 lines edited, no new rules, no look change at today's content).

| # | Page | Width | What broke | Shot | Fixed? How |
|---|---|---|---|---|---|
| 1 | /, /shows/ | 320 (100%, both) | Show row: the text column was `1fr` (= `minmax(auto, 1fr)`), so a long word in venue / city / with line (here "Bumblesville-on-the-Delaware,") set the row's minimum width. The Tickets / Details button ran 18px past the edge, the page scrolled sideways (338 wide). Also at 1280 and 200% when the word is unbroken. | `before-shows-row-320.png` / `after-shows-row-320.png` | Yes. `.row` columns `4.5rem minmax(0, 1fr) auto`; `.row-place`, `.row-kind` `overflow-wrap: anywhere`. |
| 2 | /music/ | 320, 390, 1280 (100% and 200%) | A long unbroken artists credit ("GLucak, Supercalifragilisticexpialidociousartist") made the tile wider than its column: the title and credit ran over the next tile and onto its cover. At 200% the tile reached 571px (page scroll). The 40-char title with spaces was fine (balanced, 3 lines). | `before-music-tile-320.png` / `after-music-tile-320.png` | Yes. `.tile-link` and `.tile-text` get `grid-template-columns: minmax(0, 1fr)`; `.tile-artists` `overflow-wrap: anywhere` (`.tile-title` had it already). |
| 3 | /, /shows/ | 1280 and 200% (also any width at 200%) | A video title with no spaces made the Watch card's grid track as wide as the word: the card ran 540px past the screen and the page scrolled sideways. The 60-char title with spaces wraps to two lines and is fine. | `before-home-video-1280.png` / `after-home-video-1280.png` | Yes. `.v2-vid a` `grid-template-columns: minmax(0, 1fr)`; `.v2-vtitle` `overflow-wrap: anywhere`. |
| 4 | /about/ | 320 to 1280 (page 522px at 320, 1681px at 1280 / 200%) | A long bio paragraph or a pasted URL: `.bio` was a one-column grid with an `auto` track, so the unbroken URL set the column width. At 1280 the bio ran under the Listen / Shows / Patreon list (text over text). | `before-about-1280.png` / `after-about-1280.png` | Yes. `.bio` `grid-template-columns: minmax(0, 1fr)` and `overflow-wrap: anywhere`; `.bio-lead` `overflow-wrap: anywhere` (also covers the Home lead). |

Held up with no change (data set, view, shot):
- 45-char venue, 40-char city and a 125-char `with` line on the poster and on rows at 320 / 390 / 1280, 100% and 200%: wrap, no collision. The poster at 390 keeps the picture at 55%, so the text column is about 130px: that venue takes 7 lines, the note 8 (`after-shows-poster-390.png`). Intact, not pretty (see leftovers).
- 0 shows ("No shows booked right now" + Follow, `after-shows-zero-390.png`), 1 show, 15 shows plus Played: no overflow; Home takes only the first 3 (server `limit: 3`).
- 40-char release title with a long credit and no cover as Home "Latest single": kicker, title (3 lines), credit (4 lines), Listen, "Placeholder cover" chip all inside the card at 320 / 390 / 1280 (`after-home-latest-nocover-390.png`).
- 104-char product name and 61-char unbroken name on the shop grid and the product detail at all sizes (`after-shop-390.png`): the name classes already had `overflow-wrap: anywhere`.
- Three-paragraph bio on About and the 540-char lead on Home: wraps, heights grow, nothing collides.
- Fitted phrases (`LIVE IT LOUD`, `PUSH PAST FEAR`, `THE TIME IS NOW`, `MERCH`, the Rise word): these are fixed strings in the templates, not data, so no fixture reaches them; no clip in any view. The only flag was `p.slogan` 2px wide at 1280 / 200% on Home (1205 vs 1203); the real a11y200 does not report it and I left it.
- Text under the fixed phone bar: none at the end of any page (the body padding clears it); the check ran on every view, including the shortest pages (/shows/ with 0 shows).

## After the fix
| Check | Result |
|---|---|
| Stress set, spaced (15 shows) at 36 views | 0 issues (before: 15) |
| Stress set, unbroken (15 shows) | 0 issues (before: 36) |
| 0 shows, 1 show | 0 issues each |
| Real build, `a11y200.mjs --url` (all 8 routes x 3 widths x 100/200%) | 0 views with issues |
| Real build Home 390x660, quotes off, reduced motion | 3601px (unchanged) |
| Animations | none added (CSS is `overflow-wrap` and track sizes only) |
| `node --test` | 181 pass, 0 fail (4 of them new: `test/stress.test.js`) |

`test/stress.test.js` pins the CSS (shrinkable `minmax(0, 1fr)` tracks, `overflow-wrap: anywhere` on the six classes) and renders the 45 / 40-char
show through `rowHtml` and `posterHtml` (one place span, one kind span, `<b>` in the note stays escaped). No browser in the test, so the pixels are checked by
`stress.mjs`, not by `node --test`.

## Leftovers for the Desktop (not fixed here)
1. **`src/lib/shows.js` markup.** The shows have no hard limit on how much text lands in the poster / row. The poster is the weak spot: from 15rem
   up it keeps the picture beside the text (55% art), so a long venue plus a note leaves a 130px text column at 390. A fix is the renderer's
   (`posterHtml`) or a shorter `MAX_LEN`: for example cap `venue` at about 60 and `city` / `with` at about 80 in `store.js` `checkShows`, with a
   plain message in `PLAIN`, so Gabe's edit screen refuses what the page cannot hold. Today the cap is 300 characters per field (`MAX_LEN`).
2. **Edit-screen field limits for the other lists** (Not tested here: /edit/ is outside the task.) Product names allow 120 chars (`products.js`),
   which is fine on the grid now, but a hint on the field would match what the page shows well.
3. **Release titles and artists** come from `src/data/releases.json` (no validation of length). They wrap now at any length; nothing to change.
4. **hyphens: auto** does not hyphenate in headless Chrome (no dictionary), so a word longer than the poster column breaks mid-word ("Bumblesvill / e-on-the-"). Real Chrome and Safari download the dictionary; not verified here.
5. The `.row` button stays at `auto` width. At a 280px card (320 phones) it takes about 100px and the text 70 to 80px. Fine for real venues; a very long venue shows as a narrow, tall column.
