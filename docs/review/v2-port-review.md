# Boss review: Home gets the v2 picks (3ee444d)

Laptop boss, 2026-11-06. Reviewed against the owner's picks (`docs/review/v2-compare/README.md` items 1-4, with the release
card's player first on phones, plus the solid header behind `HEADER_STYLE`), CONTEXT.md's hard rules, and D25 / D39 / D51.
The board post is from `node tools/board.mjs read 2`. Shots and raw numbers are in `docs/review/v2-port/` (`report.json`;
`a11y/` holds the `prototype/tools/a11y200.mjs --url` run).

**Verdict: approved with fixes.** The port matches the picks and breaks no hard rule. Before the next push, fix F1 (credits)
and F3 (keyboard in the swipe row). F2 blocks only the `QUOTES_APPROVED` flip. F4 and F5 are small.

## How it was checked

- `npm test`: build OK, **162/162**.
- `node server.js` with a temp `DATA_DIR` on port 8817. Headless Chrome over DevTools at exact widths 320 / 390 / 1280,
  with 390x660 and 320x660 for phones and 1280x800 for desktop. Root font at 100% and 200%, using the same injection as
  a11y200.mjs. Reduced motion was on unless a check says otherwise.
- D39 was also measured on a temp copy of the build with `QUOTES_APPROVED = true`, served on port 8818. `src/` was not changed.

## What passes

| Check | Result |
|---|---|
| Item 1, release card | One `bg-2` panel holds the cover, kicker, title, credit, **Listen** and the player. Under 900px the player comes first (CSS `order`). From 900px the cover row leads. |
| Player on the first phone screen | The player top is at **556** at 390x660 (the bar starts at 598), so **42px** shows. At 320x660 it's at 524 (**74px**). That's on the first screen as picked. Before the solid header it was 90px: the band's +52px is the cost. |
| Item 2, video row | Latest plus 2 featured, all three with local thumbnails. It's a still swipe row on phones and 3 across from 700px. `/shows/` gets it too. |
| Item 3, one photo per slot | **No image repeated** on Home, Shows, Music or About at any width or text size (the logo mark aside, as D25 allows). The Kealey poster art and the crowd photo are gone from Home. |
| Item 4, phrase beside content | 5:7 grid from 900px. Phones stay stacked. |
| Solid header (D25) | `#f5f5f5` on `#111`: **17.3:1**. Logo D sits on a solid dark ground from the first paint. |
| 'scrim' still works | With `data-header="scrim"`: a gradient at the top, `is-solid` (`#111`) after scrolling, and `--strip` back to 88px. Shots: `scrim-390-first.png`, `scrim-1280-first.png`. |
| Text over photos | Hero G / LUCAK: lowest pixel **4.05:1** at 100% and **3.80:1** at 200% (large text, needs 3). Slogan 4.38+, Now link 12+. Hero **Shows** button: worst case (white photo under a 62% `bg`) is **4.9:1**. Now tag 17.3:1. No new text sits on a photo (the slot label has its own `bg`). |
| Video facade | Before a tap, with no blocking and the whole page scrolled through, the only hosts are `127.0.0.1` and `open.spotify.com`. There are **0 YouTube / ytimg requests**. A tap loads only `youtube-nocookie.com/embed/<id>?autoplay=1`, and the iframe is titled and focused. Autoplay starts only after the fan's own tap. |
| Motion | **0 running animations**, with reduced motion and without. No `video`, `marquee` or `[autoplay]`. `scroll-behavior: auto`. Scroll-snap moves only when the user does. Nothing flashes. |
| Swipe row reachable / no trap | Tab goes through all 3 cards and on to Patreon. Shift+Tab goes back out to "All shows". There's a 3px outline on each card. But see F3. |
| Alt text | Every `img` has `alt`. The garage, stage, belt and IDENTITY art have descriptive alt. Thumbnails are `alt=""` inside links named by the title. The empty slot is `role="img"` with a label. |
| Home height (D39) | **3801px = 5.76 screens** at 390x660 with quotes off. But see F2. |
| 200% text / sideways scroll | scrollWidth equals the width on every view of the 4 pages. The a11y200 "past the edge / clipped" lines for Home and Shows are the swipe row's own cards: the tool exempts `.vrow` (the prototype's class), but the build's class is `.v2-vrow`. These are false positives. Its "overlap vtitle x bio-lead" at 1280/200% is the clamped, hidden title lines, which also aren't visible. |
| Injection | Video titles go out through Astro `{}` and `data-title`, and the iframe takes them through the `f.title` property. Ids pass `/^[\w-]{11}$/` before any URL or file path. Credits are literals rendered with `{}`. No new `set:html` or `innerHTML`. |
| D51 | The IDENTITY art is shown as is (no tint, no filter). Only our two fonts are used. |

## Findings

**F1. Photo credits are missing and one is misleading (Home, plus a gap on /shows/ from before this push).** Home shows the
Crooked Eye belt still at every width and the stage still from 900px. Both are "credit unknown" in
`assets/from-gabe/social/INDEX.md` (rights Q1). It also shows the IDENTITY art (rights Q2). None of these has a credit. The
only still credit is "Video still: Joseph Lucak.", and he is the camera on the Duck, Dodge, Jump, Fight garage still only,
which is hidden under 900px. **Concrete failure:** at 390 the only still on the page is the Crooked Eye belt shot, and the
footer reads "Video still: Joseph Lucak.", which credits it to someone not known to have shot it.
**Fix:** pass credits that name each picture's source:
- "Garage still: Joseph Lucak."
- "Live stills: from GLucak's Crooked Eye video."
- "IDENTITY art: from GLucak's Instagram."

Change these when Gabe answers Q1 and Q2. Also, `/shows/` shows the Kealey poster art with **no credits line at all**
(`dist/shows/index.html`). Give that page `credits={[C.kealey]}`.

**F2. D39 is measured with both quotes in, and with them Home is over the cap.** On a temp build with
`QUOTES_APPROVED = true` (quotes 132px + 76px), Home is **4045px = 6.13 screens** at 390x660, against the 5.8 cap. The 5.76
in the commit is the quotes-off number, and so are the 5.79 and 5.45 figures in the v2 compare. **Concrete failure:** the
day Gabe OKs the quotes, flipping the one switch puts Home 0.33 screens (about 220px) over D39.
**Fix:** don't flip `QUOTES_APPROVED` until Home loses about 220px at 390, or the cap is re-ruled in a logged decision
(D39). Candidates for the designer's section 18:
- show one quote on Home, not two;
- keep the IDENTITY block (159px) text-only under 700px.

This doesn't block this push.

**F3. In the swipe row, a focused card can stay almost fully off-screen.** At 390 and at 320, one Tab from "Latest" lands on
"You're Not Alone". The row's `scrollLeft` stays 0, and the card sits at x 323-609 on a 390 screen. **Concrete failure:**
only about 46px of the focused card and its outline show, and its title is cut off (`kbd-row-390-second.png`). Chrome
doesn't scroll a card that is already partly visible. The next Tab jumps to the end (`scrollLeft` 541).
**Fix (one line in `public/js/app.js`):**
`document.querySelectorAll('.v2-vrow').forEach((r) => r.addEventListener('focusin', (e) => e.target.closest('.v2-vid')?.scrollIntoView({ block: 'nearest', inline: 'start' })));`
It's instant, not smooth, so it is safe under reduced motion. It also covers `/shows/` from 72rem.

**F4. Video titles are cut off at 200% text (WCAG 1.4.4, F69).** `.v2-vtitle` is clamped to 2 lines.
**Concrete failure:** at 100% "You're Not Alone (Official Music Video)" fits (42/42px), but at 200% it is cut: at 1280 it
reads "You're Not Alone…" (83 of 166px shown) and "Duck, Dodge, Jump, Figh…" (83 of 291px). At 390 it is 83 of 125px.
See `watch-1280-200.png`. **Fix:** drop the `-webkit-line-clamp`. These are three short titles, the longest 4 lines at 100%.

**F5 (minor). On phones the Tab order doesn't follow what's on screen in the release card.** The DOM puts the cover row
first, and `order: -1` moves the player up only visually. **Concrete failure:** at 390, Tab from the Now link goes to
**Listen** at page y 1120 (under the player), then back up to "Skip the Spotify player" at y 556. **Fix:** put `.rise-play`
first in the markup and give `.v2-rel` `order: -1` from 900px. Then the jump happens only on desktop, where fewer fans arrive.

## Known issue: the phone bar covers the hero Now line at 200%

Measured at scroll 0, with the bar at y 598:
- At 390, the Now line runs from 569 to 665, so **67px** of it is under the bar.
- At 320, it runs from 537 to 681, so **83px** is under the bar.

At 200% the cause is the two hero buttons. They wrap to two full-width rows (about 170px), and they are the same two links
as the bar's **Listen** and **Shows**, which are always on screen under 700px. Focus is already safe:
`scroll-padding-bottom` clears the bar.

**Simplest fix (CSS only, tested):**
```css
.hero-inner { container-type: inline-size; }
@media (max-width: 699px) { @container (width < 16rem) { .hero-actions { display: none; } } }
```
`rem` in a container query is the root size, so this matches only when the text is enlarged. The hero column is 17.5rem or
more at 100% even at 320, and 10.9rem at 390 with 200% text. Results:
- **Now line:** 354-450 at 390/200%, 322-466 at 320/200%, and also clear at 150%. It is untouched at 100%, and at 768 (no bar).
- **Sideways scroll:** none.

Shot: `nowline-390-200-fixed.png`, before it: `nowline-390-200.png`. No function is lost, because the bar holds both links.

## For the Desktop

Next push: F1, F3, F4, and the Now-line CSS above. F5 is optional. Hold `QUOTES_APPROVED` until F2 is trimmed or re-ruled.
Tool note for the designer (`prototype/tools/a11y200.mjs`): its swipe-row exemption should also match `.v2-vrow`.
