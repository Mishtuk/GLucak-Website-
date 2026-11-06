# Boss verdict: research round 2 (design-round-2.md, art-system.md)

Laptop boss, 2026-11-06. Judged by the goal: the best site for Gabe, where people **listen first, come to shows second, and
buy merch third**; Intuitive, Versatile, straight-up Cool; nothing flashes. The question for each proposal is whether it
moves one of those three actions on a phone, now, with what we actually have. Rulings are logged as D45-D53.

Both files are good research. The campaign table (Sleep Token, Lorde) and the merch-store table are exactly the outside
evidence we lacked. The art read of Gabe's covers is honest and specific. Most of the art system belongs to Gabe and Dave,
not to the website, so most of it becomes rules and offers rather than tasks.

## design-round-2.md: the 10 improvements

| # | Proposal | Verdict | Why |
|---|---|---|---|
| 1 | Phrases never blank | **Change** (D47) | The risk is real: if `app.js` fails after `boot.js` sets `data-motion='on'`, LIVE IT LOUD / PUSH PAST FEAR / THE TIME IS NOW stay at opacity 0, and the slogan is the brand. But we keep the IntersectionObserver fade instead of moving it to `animation-timeline: view()`: that would add a scroll-linked motion type, behave differently by browser, and reopen DESIGN 8. Fix: `app.js` itself adds the waiting class, only to `.fade` headings below the first screen at load, and `@media print` shows them all. No JS = visible |
| 2 | Now line names the next release inside 14 days | **Adopt, urgent** (D45) | Listen is action 1, and Who I Am is out **Nov 13, 7 days from today**, yet Home doesn't say so. A dated state of a layout we already have is the cheapest win in the file. Must ship before Nov 13 |
| 3 | 14-day "drop moment" (bigger cover, credits, Gabe's note) | **Change: no new layout** | The RISE release block already flips to the newest released title by date (built). That's the drop moment. A note from Gabe goes in the existing quote slot only when he has posted whole sentences about that song (D23/D29); nothing is invented. No bigger-cover variant: it would fight the D39 5.8-screen cap for 14 days at a time |
| 4 | Shop: pre-order + `shipsBy`, ship-time line, trust lines, size chart, swatches, "Listen first" | **Mostly hold** (D49) | Merch is third, and every product is a sample. A ship time, a print guarantee or a size chart written before Gabe has a supplier and a Fourthwall account would be untrue (D37: every message must be true). A new status is a schema change with no product to use it. **Adopt now: sold-out sorts last** (one line, IDLES's pattern). The rest is parked in this table for when real products exist |
| 5 | Music as a cover grid, coming singles with art and date | **Adopt** | DESIGN 6 already says "cover strip", and the build is a list. Covers are the most eye-catching thing he has, and this page serves action 1. Coming singles show their art **as made** (from Spotify or the smart link, never repainted) plus "Out Nov 13". If no art exists yet, the slot shows the placeholder cover |
| 6 | Instant `:active` feedback on every button | **Adopt** | Free "it responded" feel on phones; no transition, so it adds no motion |
| 7 | Footer and About link lists as a grid | **Adopt** | "X" orphaned on its own line looks unfinished. 2 columns at 390 with 48px rows, in step with the 48px target rule |
| 8 | Shows: Add to calendar + Share | **Adopt calendar, drop Share** | A saved date serves action 2 directly. Share adds a second button to every row, `navigator.share` support varies, and fans already share his Instagram posts. A server-made `.ics` per show, escaped, from data Gabe already edits |
| 9 | Cross-fade between pages (View Transitions) | **Drop** (D47) | DESIGN 8: exactly two motions exist. For Gabe the bar is "is it needed", not "is it under 3 flashes". A full-screen opacity change on every tap is not needed; the site is fast enough that pages don't feel like reloads |
| 10 | 404 page; share cards per release and per show | **Adopt the 404; per-release cards later; drop per-show cards** | A 404 with Listen / Shows keeps a dead link selling the music (Puck Live lesson). Per-release OG cards can follow the cover grid (covers as made). Per-show cards depend on a poster pipeline we haven't agreed (art 3.6) |

Also from that file:
- **Campaign states (section 1): adopt as the principle.** One layout, dated states, one thing per week, in his words.
  D45 is the first state. The album's T-14 count and its release-day flip are already built.
- **Typography lesson (section 3): confirmed.** Big type is the art, plain small words are the actions. That is D6; nothing
  changes.
- **Not recommended list: agreed in full.** No live countdown, poster-as-image, cart, puzzles, audio-reactive visuals or burger.

## art-system.md

| Section | Proposal | Verdict | Why |
|---|---|---|---|
| 3.1 | IDENTITY colour world (= our identity-guess era, contrast-checked; violet on paper large only; glow never text) | **Adopt as a rule for any art we make; still a guess** | Same four roles as D35, so the site and the art stay one world. It stays prototype-only (D35) until Gabe's real colours arrive (about Nov 30), then everything is re-tested |
| 3.2 | Only our two fonts in art; no chrome / bevel / glow type | **Adopt** (for our own work) | Matches DESIGN 2 and 3a. We never apply it to Gabe's or Dave's existing art |
| 3.3 | Logo D only for IDENTITY, on dark solid ground only; one-colour vector needed | **Adopt** | Already agreed on #1. The one-colour mark goes on the Gabe question list (posters, merch and stickers can't print chrome) |
| 3.4 | Single-cover template (frame text, two-ink photo, track number) | **Change: an offer, not a task** | It's strong work (the 64px number test is the right test), but covers are Dave's job and Gabe's call. The owner decides whether to show it to them. We never repaint Who I Am or Scenic Route. **The "homemade vs designed" notes stay internal**: never in those words to Gabe or Dave |
| 3.5 | Tracklist reveal post + the Music "sleeve" (12 slots filling in by date) | **Hold** | The sleeve is the IDENTITY block DESIGN 6 already plans, and it waits on Gabe for the final order, spelling, whether Who I Am / Welcome Home are on it, and his OK to show the list before his own reveal. The social post is off-site work: offer it via the owner |
| 3.6 | Two-ink show poster | **Adopt as the reference for the site's poster card in the identity-guess era; printing is not scheduled** | It matches our paper/ink card. Printing costs money (Hard rule 4: the owner decides) |
| 3.7 | Social story / post templates | **Hold: owner asks Gabe** | Useful, but Gabe didn't ask for it and may make his own. One question on the list |
| 3.8 | Merch graphics (slogan tee, mark hoodie, tour back) | **Hold** | Nice and cheap to print, but they wait for Gabe's answer on items and supplier. **Not as shop samples**: they would read as real products (D36) |
| 5 | Questions for Gabe and Dave | **Adopt, merged** | Into one deduped list with the home.md and social-content.md questions, launch-critical first, for the owner to send |

## Next tasks, in order

| # | Owner | Task | Done when |
|---|---|---|---|
| 1 | **Laptop copywriter** | Now-line words for an upcoming release (D45): "Out Nov 13: Who I Am" plus the link label. Check what `wingsmusic.lnk.to/WhoIAm` really offers before the label says "Pre-save". Add to `docs/copy/home.md` | The boss approves the line, and it fits the existing 48px Now line in two lines at 320 |
| 2 | **Desktop coder** | D45 in `nowHtml()`: a release dated from today to 14 days ahead shows "Out {Mon D}: {title}"; from its day to 7 days after, "Out now: {title}"; otherwise the next show within 14 days; otherwise the newest release. Fixed-date tests for Nov 6, Nov 13, Nov 20, Nov 21. Publish the preview | **Before Nov 13.** Tests pass, and a 390 Home shot dated Nov 6 shows Who I Am |
| 3 | **Desktop coder** | L2 review fixes: F1 (bar uses `buyable`, plus a test with no link), F2 (rows inert while saving, Save waits for uploads, plus a test), sold-out sorted last (D49) | `npm test` is green with the three new tests. The D42 state from the review shows Watch |
| 4 | **Desktop coder** | D47: `app.js` hides only `.fade` headings below the first screen at load, `@media print` shows all, and instant `:active` on `.btn`, `.ed-btn`, product cards, sheet and bar links (no transition) | With `app.js` blocked every phrase is visible. Scrolling still fades each phrase once. 0 animations under reduced motion and with the switch off |
| 5 | **Laptop designer** | DESIGN.md + prototype: Music cover grid (2 columns at 390, 4 from 900; coming singles with their art as made, or the placeholder, and the date), footer and About link grid (2 columns, 48px rows), Add-to-calendar on the poster and the rows, and the 404 layout. Copy-word-for-word CSS block + a port list in section 11 | Shots at 320 / 390 / 1280; no sideways scroll; 48px targets; 16px minimum; Home still at or under 5.8 screens (D39); 0 new animations |
| 6 | **Laptop copywriter** | 404 text (site copy, not Gabe's words), the "Add to calendar" label, and any new Music words, in `docs/copy/` | Boss-approved, no invented facts |
| 7 | **Desktop coder** | Port 5 + 6: Music grid, link grid, an `.ics` per show (shows have no id: the server derives one from date + venue; RFC 5545 text escaping; CRLF; only http(s) URLs; past shows 404), and `404.astro` served with status 404 for unknown paths | Tests: an `.ics` with `<script>`, `' OR 1=1 --`, commas, semicolons and a newline in the venue stays inert and valid; an unknown path returns 404 with the page; the boss reviews at 390 + 1280 |
| 8 | **Laptop boss** | Merge art-system 5, social-content's 10 and home.md's 9 into one deduped list for the owner to send Gabe (launch-critical first: real IDENTITY colours, booking email, show list, tracklist order, one-colour mark, merch items and supplier) | One list in HANDOFF "Waiting on", and the owner has it |

**Not scheduled (owner's call):** sending Dave the cover template (3.4); printed posters (3.6, costs money); social
templates (3.7); merch print files (3.8); pre-order, ship-time and trust lines in the shop (D49) until real products and a
provider exist.
