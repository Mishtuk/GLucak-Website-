# Boss review: the Desktop's round-2 port (7c0e6b5) and D61 (cfab6a9)

Laptop boss, 2026-11-06. Spec: DESIGN.md 16 / 16h, D55, D57, D59, D61, `docs/copy/round2.md`, `docs/review/round2-boss.md` section 3.
Screenshots and the three `.ics` files I downloaded: `docs/review/round2-port/`. Ruling logged as **D63**.

## Verdict
**Approved, with five small fixes. None of them blocks anything.** F1 and F2 should land before launch. F3 to F5 can ride
along with the next push. Nothing wrong shows with today's data. The calendar files, the 404 status, the Now line, the
F2 message and D61 are all right.

## How it was checked
- `npm ci`, then `npm test` (it builds first): **127/127** at 7c0e6b5 and **131/131** after pulling cfab6a9.
- `server.js` ran with its own random port, a temp `DATA_DIR`, `DEV_EDITOR=1` and a 40-character `SESSION_SECRET`, and was
  stopped by its PID. Headless Chrome (also stopped by its PID) was driven over DevTools with true viewports of 320x640,
  390x844 and 1280x800 (`Emulation.setDeviceMetricsOverride`, so no iframe was needed under 512px). I also measured the link
  grids at 17 widths from 320 to 1280, and the footer every 10px from 880 to 1100.
- **Hostile data went in through the editor's own save API** (`POST /edit/api/shows`, the same validation as the edit
  screen):
  - Show 1: venue `The Rail; "Live", <b>Bar</b> \ & Grill`, with address `1 Main St; Apt "2", <script>alert(1)</script> \ end`
    and a link `https://example.com/t?a=1&b=<x>"y`, at 20:00.
  - Show 2: an open mic with venue `</script><img src=x onerror=alert(1)> Café Ünïcode Lounge…` (long enough to force folding),
    no time and no link.
  - Show 3: Dec 31 at 23:30 (its end time crosses into the new year).
  - Show 4: a past show that has an address.
- **The Round 2 CSS is word for word.** The prototype's block and `global.css`, diffed with whitespace ignored, differ only by
  the Desktop's added `links-lg` rule (see the About links row in the table).

| Check | Result |
|---|---|
| Sideways scroll | 0 on Home, Music, Shows, About and 404 at 320, 390 and 1280 |
| Smallest text | 16px everywhere |
| Contrast | Lowest at rest: 5.71:1 (accent buttons). Lowest when pressed: none under 4.5, on every tappable on 7 pages |
| Targets under 48px | None. The row calendar box is 48x48 and the poster square is 48x48 (198x48 with its words at 1280) |
| Motion | Music, Shows, About and 404 run 0 animations. Home runs only its fades (at most 4 at once while scrolling). **Under reduced motion every page runs 0, including while scrolling** |
| Pressed (16e) | Every tappable has `transition-duration: 0s`. With `:active` forced, every one changes colour, except the Music SoundCloud line (F2) and the header brand (F4). Tiles keep their covers: a 4px outline plus inverted words |
| Music crate | 2 / 2 / 3 / 4 / 4 columns at 320 / 390 / 700 / 900 / 1280. Covers are 132 / 166 / 199 / 192 / 283px. Newest first: Scenic Route, then Who I Am (coming, hatched "Jan 15" / "Nov 13", "Out …", Pre-save), Duck… down to Time is at the Essence. One link per tile, `alt=""`. Album tag on albums only. No release block on Music. IDENTITY comes after the crate |
| Footer links | 2 columns under 380px, then 3 columns with Patreon on its own row, then 7 in one row from 900px. Rows are 48px. **SoundCloud runs past its cell from 900 to 970px (F1)** |
| About links (`links-lg`) | **The Desktop's 380-519px rule is right.** It gives 2 columns with 56px rows, and nothing runs past its rule anywhere from 380 to 519. From 520 the list is 474px wide, more than the 423px three columns need, and nothing overflows. Under 380, SoundCloud runs 3.6px past its rule at 320 (F3) |
| Add to calendar | On the poster and every upcoming row, never on Played rows. The 1280 poster shows the words "Add to calendar". No `download` attribute. Accessible names follow "Add to calendar: {venue}, {Mon D}", escaped (`&lt;b&gt;…`, `&quot;`) |
| `.ics` | `text/calendar; charset=utf-8`, an attachment with a `glucak-{id}.ics` name, CRLF only (no bare LF or CR), ends in CRLF, longest line 75 octets, folding never splits a UTF-8 character. `\; \, \\ \n` escaped; `<script>` and `<b>` are inert text. All-day uses `VALUE=DATE` with the next day as DTEND. Timed uses `TZID=America/New_York` and a VTIMEZONE, and 23:30 ends at `20270101T013000`. URL is the percent-encoded href (`%3Cx%3E%22y`), and there is no URL line when the row has no link. Open mic uses "GLucak open mic at …" / "GLucak at an open mic." |
| `.ics` 404s | Past show, unknown id, a wrong hash and `/shows/../server.js.ics` all return 404 |
| 404 page | `/nope`, `/404/` and `/music/nope` return **status 404** with `X-Robots-Tag: noindex` and the meta noindex. HEAD returns 404. Title "Page not found - GLucak". "Wrong turn." takes 2 lines on phones and 1 at 1280. Listen (`/music/`), Shows and Home use the round2.md labels. Nothing is marked current. At 390x844 everything sits above the bar (footer at 584); at 320x640 Home ends at 518 and the bar starts at 578 |
| Now line | Today it reads "Out Nov 13: Who I Am" with no `aria-label`. On fixed dates with the real releases: Nov 13 "Out today", Nov 14 "Out now", Jan 1 "Out Jan 15: Scenic Route", Aug 13 2027 "Out today: IDENTITY". Release day still wins with another release due 5 days later. Shows: "Open mic Feb 10: Pub, Philly", and "Open mic today: …" on the day, linking `#shows` |
| F2 message | With the upload held, Save shows "Wait for the photo to finish uploading, then press Save.". After the upload ends that message is gone (the bar shows "Not saved yet.", the dirty state) and the photo line reads "Uploaded. Press Save to keep it." |
| "Listen everywhere" | `aria-label="Listen everywhere: Duck, Dodge, Jump, Fight"`. Hidden on Home under 700px; shown on Music and on Home at 1280 |
| Home height | 5.74 screens at 390x660 (D39 cap 5.8) |
| Injection (page + JSON-LD) | No raw `<script>alert`, `<img src=x` or `<b>Bar` on `/` or `/shows/`. The JSON-LD parses, and the `</script>` venue arrives as data (`<` is `<`) |
| Console | No CSP errors and no exceptions on any page |

**D61 (cfab6a9)** against D61 and round2.md section 4:
- The admin words are exact: "Street address (optional)", the hint, the placeholder "12 Main St", and both errors. The field
  sits after City.
- Through the API, these are refused: `\n` and `\r` ("Put the address on one line."), a tab, U+2028, and 121 characters
  ("That address is too long. 120 letters at most."). 120 characters are accepted. Spaces only is stored as absent.
- The address **never shows on a page**. The visible text of `/` and `/shows/` holds neither test address. It appears only
  in the JSON-LD `streetAddress` (upcoming shows only; the past show's address is nowhere) and in the `.ics` `LOCATION`
  ("{venue}, {address}, {city}"), escaped in both. On the edit screen it is an input value, so it stays plain text.
- One gap: see F5.

## Findings (ranked)

### F1. Footer from 900 to 970px: SoundCloud runs into Patreon (`global.css`, 16b's 900px rule)
At 900px, `.site-footer .links { grid-template-columns: repeat(7, minmax(0, 1fr)) }` gives cells narrower than
"SoundCloud", which needs 116px.
**Failure:** at 900px wide, SoundCloud ends 10.3px past its rule. The overrun is 8.9 / 7.5 / 6.2 / 4.8 / 3.4 / 2.1 / 0.7px at
910 to 970px. In `footer-links-900.webp` its "d" sits about 2px from Patreon's glyph. This is the same defect D55 (c) fixed
for the 3-column grid. The prototype has it too, so it is a design miss that was copied faithfully.
**Fix:** `repeat(7, minmax(max-content, 1fr))` in that 900px rule. The seven words plus the gaps need about 700px, and the
list is 838px at 900. Fix it in `prototype/styles.css` as well, so the two stay word for word.

### F2. Music's "Hear more on SoundCloud" lost its `text-link` class (`src/pages/music/index.astro:42`)
The prototype has `<a class="text-link" …>` (`prototype/music.html:128`). The port has a bare `<a>`.
**Failure:** with `:active` forced on `/music/`, that link's colours don't change (the only link on the page that doesn't).
It also renders at weight 400 instead of the text-link 700.
**Fix:** add `class="text-link"`.

### F3. About `links-lg` under 380px: SoundCloud 3.6px past its rule
The Desktop's 380-519px rule is right, and it stays. Below 380px the base 2 x `minmax(0, 1fr)` columns apply.
**Failure:** at 320px, SoundCloud (24px glyph, 0.65rem gap, `--step-0`) ends 3.6px past its cell's rule. It runs into the
page gutter, not into another link (`about-links-320.webp`).
**Fix (no new look):** `@media (max-width: 379px) { .links-lg a { gap: 0.4rem; } }`, the footer's gap, which saves 4px.
Don't use `max-content` columns here: at 320 they would need about 289px and the list is 280px.

### F4. The header brand gives no feedback when tapped (16e gap; logged D63)
16e sets `-webkit-tap-highlight-color: transparent` on every `a`. The brand (GLUCAK, a link to Home on every subpage) is
not in the pressed rule set, in the prototype or in the build.
**Failure:** with `:active` forced, `.brand` changes nothing on Music, Shows, About, Privacy and 404. On a phone, tapping
it now gives no feedback at all, where the browser used to flash grey.
**Fix:** add `.brand:active .brand-word { background: var(--text); color: var(--bg); }`, the text-link swap, on the word only.
The logo mark stays as made. Add it to the prototype block too.

### F5. D61 lets C1 control characters through, including U+0085 NEL (`src/lib/shows.js:24`)
`/[\x00-\x1f\x7f  ]/` misses `\x80-\x9f`. D61 says "no line breaks or control characters (reject, do not strip)",
and U+0085 is a line break.
**Failure:** saving `{ address: "12 Main\u0085St" }` returns 200 and the character is stored. It reaches the `.ics` LOCATION
and the JSON-LD unchanged. It stays inert (escaped, not markup, and not a CRLF to RFC 5545), so this is a validation gap,
not an injection. Some calendar apps may still break the line there.
**Fix:** `/[\x00-\x1f\x7f-\x9f  ]/` and one test.

### Not defects (noted so nobody re-opens them)
- `/404.html` requested directly answers 200. It carries the meta noindex, is not in the sitemap, and nothing links to it.
  Every real unknown path returns 404.
- A non-string `address` (only possible through a hand-written API call) gets "Put the address on one line.". The edit
  screen always sends a string.
- The rows grow taller than 60px when a venue wraps ("Late Night, Horsham, PA" takes 2 lines at 390). That is the row
  layout from before this port, not the calendar glyph: Played rows with the same text wrap the same way.
- The calendar's 48px boxes overlap only the fixed phone bar and the closed menu sheet in the capture. Those are artifacts
  of measuring a scrolled page, not real overlaps.
- The Desktop's About rule comment says "two columns until 520px". As measured, that is exactly where 3 columns start to fit.

## What's good
- A faithful port. The CSS is word for word, and the markup follows 16h item by item: the Icons sprite once in Base,
  `RiseBand release={false}`, the D55 calendar name and `cal-word`, the interim `:active` rules removed, the `touchstart`
  line, and the Home-only trim.
- The `.ics` work is careful: octet-true folding, percent-encoded URLs, a VTIMEZONE only when timed, an id that can't carry
  path characters, and past or unknown shows answering 404 instead of an empty file.
- The 404 page is served through `inject()`, so its shop links behave like every other page, with both a header and a
  meta noindex.
- D61 is exactly the size it should be: one field, never on a page, and escaped on both machine outputs.

## For the Desktop (next push, none blocking)
1. F1: `minmax(max-content, 1fr)` in the footer's 900px rule (also in `prototype/styles.css`).
2. F2: `class="text-link"` on Music's SoundCloud line.
3. F3: `.links-lg a { gap: 0.4rem }` under 380px.
4. F4: `.brand:active .brand-word` text swap (D63), in both CSS files.
5. F5: add `\x80-\x9f` to the address regex, plus a test.

## Screenshots (`docs/review/round2-port/`)
- Full pages: `home`, `music`, `shows`, `about` and `404`, each at `-320`, `-390` and `-1280`.
- Close-ups:
  - `music-crate-top-390`
  - `shows-poster-{320,390,1280}` and `shows-rows-{320,390,1280}` (hostile data)
  - `footer-links-{320,390,900,1280}` (F1 at 900)
  - `about-links-{320,390,520,1280}` (F3 at 320)
  - `pressed-tile-390` and `pressed-cal-390`
  - `edit-f2-wait-390`
  - `edit-address-field-390`
- The three `.ics` files as served.
