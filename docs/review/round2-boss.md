# Boss review: round 2 (designer spec + prototype, copy, the Desktop's bf6704b)

Laptop boss, 2026-11-06. Judged against `docs/review/round2-verdict.md`, D43-D53, CONTEXT.md's hard rules (no flashing, no
injection, easy to find) and the goal: fans listen first, come to shows second, merch third; Intuitive, Versatile, Cool.
Rulings: D55 (design), D57 (copy), D59 (bf6704b).

| Item | Verdict |
|---|---|
| 1. Designer: DESIGN.md 16 + `prototype/` (Music crate, link grid, Add to calendar, 404, `:active`) | **Approved with 3 small fixes, made here** (D55) |
| 2. Copywriter: `docs/copy/round2.md` | **Approved with changes**, marked "Boss (D57)" in the file |
| 3. Desktop: bf6704b (D45 Now line, F1, F2, D47, D49) | **Approved**, stays live for Nov 13; 3 small follow-ups (D59) |

## 1. Design round 2 (DESIGN.md 16)

Checked from the designer's shots and my own (Chrome headless, true 320 / 390 / 1280 widths, real CSP), and
`node prototype/tools/round2.mjs` re-run after my fixes: no sideways scroll, no target under 48px, 16px minimum, contrast passes
in all three eras at rest and pressed, 0 animations on Music and 404 (normal and reduced motion), no pressed state has a
transition, no CSP errors. Home **5.78 screens** at 390x660 (D39 cap 5.8). Shots: `docs/review/round2-design/`.

What works: the crate is the right call. Covers are Gabe's most eye-catching material and they now carry the Music page, as made
(D51). Coming singles lead with a hatched "NOV 13" sleeve instead of a fake cover, which is honest and looks good. The link grid
fixes the orphaned "X". The 404 keeps a dead link selling the music. The pressed rule (ground and ink swap, once per tap) adds
feedback with no motion, which suits Gabe.

### Rulings on the two open calls
**(a) Hide "Listen everywhere" under 700px: approved, Home only.** On Home the release block 150px lower has the same smart link
("every platform"), so it's a real duplicate. But the prototype's rule (`.under-player .under-link`) also hid it on **Music**,
which has no release block (the shot `music-390-full.png` showed only the Spotify button). Fixed:
`@media (max-width: 699px) { .rise-player:has(~ .release) .under-link { display: none; } }`. Browsers without `:has()` just show
the link. Home stays 5.78.

**(b) Glyph-only Add to calendar: approved on rows and the phone poster, with the words where they cost nothing.**
Is an icon alone clear enough? For this action, yes, and here is why. A calendar with a plus, in a bordered square beside the
date it saves, is a widely used sign, and saving to a calendar is a convenience, not a main path. Every main action (Listen,
Shows, Tickets, Join) keeps its words, so nothing a fan *needs* depends on reading an icon. A fan who misses it loses nothing.
Words on the phone poster cost **44px** (I measured it: the left column then outgrows the art), which would put Home over the cap
for a secondary action. But a poster card 37rem and wider (tablets, desktop) has empty space under the date, so it now shows
**glyph + "Add to calendar"** on its own line there, at no height cost (`span.cal-word`, a container query; poster still 384px at
1280). Accessible name everywhere: **"Add to calendar: {venue}, {Mon D}"**. It starts with the visible words, so it meets WCAG 2.5.3 where
the words show.
The bigger "intuitive" risk is what the tap *does*, not the icon. iPhone Safari opens an `.ics` as "Add to Calendar", but
Android Chrome downloads it as a file. **Add to the owner's real-phone test:** tap the calendar on an iPhone and an Android
phone. If Android only shows a download, we decide then (no new feature now).

### Other fixes and checks
- **Link grid (fixed):** with equal columns, "SoundCloud" ran **11px** past its rule at 390 (the spec said 3-6px). The fix is that columns from
  380px are `repeat(3, minmax(max-content, 1fr))`: every word ends inside its rule from 380 to 699px, same height.
- **No "Single" tag: approved.** Singles are most of the grid; tagging Album / EP marks the exception, no new words.
- **`alt=""` on grid covers: approved.** The title is the tile link's text, so an alt would read the title twice (same rule
  as D41's product cards). Home's release block keeps its alt.
- Hard rules: nothing new moves; `:active` is one colour swap per tap, far under WCAG 2.3.1's area limit, so it stays on under
  reduced motion. The prototype has no injection surface. The build's `.ics` route and `aria-label`s must escape (16h item 5
  tests). Every page is still one click from the nav; the 404 adds Listen / Shows / Home.

Files changed: `prototype/styles.css` (16b, 16c, 16f), `prototype/app.js` (calendar name + `cal-word`), DESIGN.md 16a / 16b /
16c / 16f / 16h (items 5, 9, and new 10 and 11).

## 2. Copy (docs/copy/round2.md)

**The show state keeps a kind word.** The copywriter's "Nov 20: The Rail, Philadelphia" is shorter, but a fan has to guess what
it is: a venue name doesn't always sound like a venue, and open mics would read the same as shows. Ruling: **"Show Nov 20:
{venue}, {city}"**, **"Open mic Nov 20: ..."**, and on the day **"Show today: ..."** / **"Open mic today: ..."**. It is the same
pattern as "Out Nov 13: Who I Am" (a kind word, when, a colon, the name), so the line reads as one component in every state.
"Next" is dropped because the Now tag already says it. The link goes to `#shows`, as built (D18), not to the ticket page: the
poster right below has Tickets and Add to calendar.

**No `aria-label` on the Now link.** Every proposed label changed the words or their order ("Who I Am, out Nov 13. Opens the
release link" against the visible "Out Nov 13: Who I Am"). That fails WCAG 2.5.3: a voice-control user saying "click Out Nov 13"
gets no match. The visible text is clear on its own.

**Calendar name:** "Add to calendar: {venue}, {date}" (see D55).

**"Pre-save" on the coming tiles is true.** I checked both smart links: `wingsmusic.lnk.to/WhoIAm` and `/ScenicRoute` are real
pre-save / pre-add pages (Spotify, Apple Music, YouTube Music, Amazon, Tidal, Deezer). Both also carry a 440px artwork. The Desktop's
`fetch-covers.mjs` may use it only if it is the cover as made (D51, DESIGN 16a).

Approved as written: the 404 copy ("Wrong turn." / "That page isn't here. The music is." / Listen, Shows, Home and their names),
the `.ics` fields and file name, "Add to calendar" (never "Save the date"). The asks for Gabe (show start times, his OK on the
404 line and "GLucak at an open mic.") go on the merged question list (verdict task 8).

New string (admin, D57): **"Wait for the photo to finish uploading, then press Save."** (see 3).

## 3. The Desktop's bf6704b

`npm test` (it builds first): **105/105**. Read the diff of `shows.js`, `products.js`, `server.js`, `edit.js`, `app.js`, `global.css`.

**Now line on fixed dates** (real `releases.json` and `shows.json`, `nowHtml` called directly):

| Time (UTC) | New York | Line |
|---|---|---|
| Oct 29 16:00 | Oct 29 (15 days out) | Out now: Duck, Dodge, Jump, Fight |
| Oct 30 16:00 | Oct 30 (14 days out) | Out Nov 13: Who I Am |
| Nov 6 16:00 | Nov 6 | Out Nov 13: Who I Am |
| Nov 13 04:30 | Nov 12, 23:30 | Out Nov 13: Who I Am |
| Nov 13 05:30 | Nov 13, 00:30 | Out today: Who I Am |
| Nov 14 04:59 | Nov 13, 23:59 | Out today: Who I Am |
| Nov 14 16:00 / Nov 20 / Nov 21 | | Out now: Who I Am |
| Jan 1 2027 / Jan 15 2027 | | Out Jan 15: Scenic Route / Out today: Scenic Route |
| Jul 30 2027 / Aug 13 2027 | | Out Aug 13: IDENTITY / Out today: IDENTITY |

All right, New York day boundaries included. A show with `<b>` and `' OR 1=1 --` in venue / city is escaped in text and label;
a `javascript:` release link is skipped. **F1** (`buyable()` for the bar) and **D49** (sold-out last) are right and tested.
**D47** (only below-the-fold headings wait, print shows all) is right.

**Follow-ups (small, none show with today's data):**
1. **Release day must beat a coming release.** `nowHtml` checks A (1-14 days ahead) before B (today). If one release is out today
   and another is due within 14 days, Home says "Out Nov 18: Next One" on the first one's release day. Check `b` first:
   `if (b) ...; if (a) ...; if (c) ...`, plus a test. (Today the next two releases are 63 days apart.)
2. **D57 copy:** show state "Show {Mon D}: ..." / "Open mic {Mon D}: ..." / "Show today: ..." / "Open mic today: ...", and drop
   the `aria-label`s on the Now link (WCAG 2.5.3). Update the fixed-date tests.
3. **F2's guard message goes stale.** Pressing Save mid-upload refuses (good, nothing is lost) but leaves "Uploading…" in the
   Save message after the upload ends, and never says to press Save again. Use "Wait for the photo to finish uploading, then
   press Save." and clear that message when the upload ends. The F2 test reads source text; fine for now.
4. When porting 16e, **remove the interim `:active` rules** this push added (`.btn-line` / `.btn-show` in accent, the product
   card's `brightness(0.85)` filter, `.sheet a`), so one pressed rule set exists and pictures are never changed (16h item 10).
5. **Seen in 7aa6844 (pushed during this review):** `RiseBand`'s `aria-label="Listen to {title} everywhere"` on the visible
   "Listen everywhere" splits the visible words, so it fails 2.5.3 the same way. Use `"Listen everywhere: {title}"`. The other new
   labels ("Listen to Go" on "Listen", "Listen to Go on every platform", "Pre-save {title}", "{title} on SoundCloud") contain
   their visible words in order and are fine. The crate tiles need no label (the title is in the link text).

## For the Desktop: what to port (verdict task 7 + the above)
1. DESIGN 16h items 1-11 (the Round 2 CSS block word for word, including the D55 fixes; Icons sprite; footer + About link grid;
   Music crate with `RiseBand release={false}`; calendar links on upcoming poster / rows with the D55 name and `cal-word`;
   `.ics` route; `404.astro` with status 404; the `touchstart` line; the Home-only trim; remove interim `:active`).
2. bf6704b follow-ups 1-3 and 5 above (release day first; D57 Now-line copy, no aria-labels; F2 message; "Listen everywhere: {title}").
3. Then the boss reviews the port at 390 + 1280.
