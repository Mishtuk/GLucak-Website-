# Inner-page audit: where the print shop has not reached, leftover clichés, function gaps (advisor, Laptop, 2026-11-11)

Repo at origin/main 1ce9d61 (IG4 shipped, eval 4.33). Read-only: no code edited, nothing committed.
Method: own build (`astro build --outDir` in the scratchpad), `node server.js` on 8941 (empty `DATA_DIR`, shipped shows),
8942 (`SHOP_ENABLED=1`), 8943 (a `shows.json` I swapped between `[]`, one show, one open mic, open mic + show). Spotify, YouTube and
ytimg blocked at the resolver (the grey box on Music is the blocked embed). Chrome headless CDP at 390x660 and 1280x800, viewport and
full page, reduced motion. Pages: /music/, /shows/ (0, 1 show, 1 open mic, 3 rows), /about/, /404, /privacy/, /shop/ (5 samples and 0
products). Shots: `C:\Users\alexm\AppData\Local\Temp\claude\29abb69cf93759cc\9bcf59e3-5d65-4720-88d2-c7f991fa7795\scratchpad\ia\shots\`.
Not run: the test suite, and the contrast of any proposed ground (the tone-on-tone numbers below are DESIGN 23's measure of the
hero wall, 12.3:1 or better; re-measure each ground with the `under()` helper in `scratchpad\shoot2.mjs` before building).
Heights seen (390 / 1280): Music 3224 / 2867, Shows (shipped list) 1812 / 1587, Shows empty 1453 / 1330, About 2159 / 1906,
404 1225 / 1080, Privacy 1241 / 1016, Shop 1894 / 1712, Shop empty 1081 / 1029.

## Top 6, ranked (value to the two main actions first, then print language)
| # | Idea | Page | Effort | Rule 1 | Home height |
|---|---|---|---|---|---|
| 1 | Empty Shows becomes a paper "blank poster" with one real action (join the list), not an unlabeled FOLLOW | Shows | M | none (static) | none (scoped to `.shows-grid`) |
| 2 | The poster is the first full show, not the first row; Directions from the address Gabe already types; a no-link show gets a warning in the editor | Shows | M | none | none with the shipped list (see S2) |
| 3 | A booker block on About: Booking above Find GLucak, one filled button | About | M | none | none |
| 4 | One shared tone-on-tone "ground" (static mask, 900px and up only): 404 = Truchet "wrong turn", Music = record-groove rings, Shows = the hero wall flipped | 404, Music, Shows | M | none (stills) | none (classes only on inner pages) |
| 5 | Kill the periods in titles and the blank 404 ledge | 404, Shop | S | none | none |
| 6 | "New here? Start with Go" line on Music | Music | S | none | none |

---

## 1. Shows (`/shows/`, the second main action)
What I saw. With the three shipped rows it is the strongest inner page: paper poster, one filled TICKETS, DETAILS rows.
The weak states are the ones Gabe will live in for a while.
- **0 shows** (390 and 1280): "NO SHOWS BOOKED RIGHT NOW" then one full-width orange FOLLOW. It goes to Instagram (`src/lib/shows.js` 81,
  `INSTAGRAM`) but the word does not say so, and the footer join form is never mentioned. At 1280 the left column under the
  button is ~500px of black next to the Watch row. The page has lost its anchor (the poster) at the moment it needs one.
- **1 show**: fine (poster alone, Add to calendar, TICKETS), 1399px high at 1280.
- **1 open mic only**: one bare row, 1391px; reads as a stub (a poster is only for `type: 'show'`).
- **Open mic first, full show second** (I built this list): no poster at all, both are rows. `upcomingHtml` (`shows.js` 74-77) tests only
  `first.type === 'show'`, so an open mic on the nearest date hides the poster for the real show behind it. Gabe plays mostly open mics, so this will happen.
- **The address is never shown.** `address` is validated and saved by the edit screen (`shows.js` 21-26, `store.js` FIELDS) but only goes into
  the `.ics` and JSON-LD (I checked the rendered rows: venue and city only). A fan cannot see where the venue is without leaving the site.
- **A show with no link has no action at all** (`action()` returns `''`, `shows.js` 55). I built one: a row with a time and nothing to press.
- "Book GLucak:" is a 16px muted line under the list with the placeholder chip: the quietest thing on the page for a venue booker.

### Ranked ideas
**S1. Empty state = a blank poster and a real action (M).**
Files: `src/lib/shows.js` 81 (`emptyHtml`), `src/styles/global.css` 423-425 (`.empty-line`, `.empty-actions`), `test/shows.test.js` 99 (asserts `>Follow<`).
Change: `emptyHtml` returns
`<div class="empty"><p class="empty-line">No shows booked yet</p><p class="empty-sub">Be first to hear when one is.</p><div class="empty-actions"><a class="btn btn-solid" href="#join">Get the next show first</a><a class="go" href="${INSTAGRAM}" rel="noopener">Instagram</a></div>${playedHtml(played)}</div>`
(`#join` is the footer sign-up on every inner page, `Footer.astro` 10; the words are the footer's own phrase; confirm with the copywriter). CSS, scoped so Home is untouched:
```css
.shows-grid .empty { padding: var(--space-m); background: var(--text); color: var(--bg); background-image: var(--texture); } /* the paper of .poster (388) */
.shows-grid .empty .btn-solid { border-color: var(--bg); }
.shows-grid .empty .go { color: var(--bg); }   /* .go sets color: var(--text): paper on paper otherwise */
.shows-grid .empty .played { color: var(--text); margin: var(--space-m) calc(-1 * var(--space-m)) calc(-1 * var(--space-m)); padding: var(--space-m); background: var(--bg); }
```
Why: print language reaches the empty state (paper stock, ink, the page's one filled button) without a photo (no repeat of the Kealey crops), the page
height lands near the 1-show state, and the main action becomes "get told", not an unnamed follow. Risk: ink on paper is the tested poster pair (no new colour);
the accent button on paper is the existing `.poster .btn-show` pair. Check `.go` hover and the 16e pressed swap on paper. Home: scoped selector, so Home's own empty state keeps its look.
If the Played override looks fussy, drop Played from the empty state on this page (nice-to-have).

**S2. Poster = first full show; Directions; honest no-link (M; `src/lib` is Desktop's).**
Files: `src/lib/shows.js` 55 (`action`), 58-63 (`posterHtml`, `rowHtml`), 74-77 (`upcomingHtml`), `global.css` near 401-420, `test/shows.test.js`, `src/lib/store.js` (editor warning).
1. `upcomingHtml`: `const i = list.findIndex((r) => r.type === 'show')`; render that row as the poster and every other row after it in date order. A later full show jumps above an earlier open mic: say so in the comment; the poster is the page's anchor.
2. `Directions` when `r.address` exists: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([r.venue, r.address, r.city].join(', '))}` as `<a class="go go-small" ...>Directions</a>` under the place line. http(s) only, `encodeURIComponent` plus `esc`, new tab like the other outbound links (owner note 4). Hard rule 2: add the `<script>` and `' OR 1=1 --` address to the existing show tests. Nothing loads from the map host (no iframe), so the privacy page stays true. Owner call: Google vs Apple/OSM (it names a provider). `.go-small`: `.go` at `font-size: var(--step-0)`, `min-height: 48px`.
3. No ticket link on a full show: do not point "Tickets" at Instagram and do not invent "tickets at the door". Smallest honest fix: the edit screen warns "This show has no ticket link" (S). The poster still has Add to calendar.
Why: "come to shows" needs when, where, how. When and how are there; where is half there (no street).
Home risk: Home's block uses the same `showsHtml`. With the shipped list the first row is already a show, so nothing moves; with an open mic first, Home's poster appears one row later in its list. That state is not in the 3601 budget, so re-measure once.

**S3. Page-header ground (M, after the shared mechanism, section 10).** `.band-live` at 900px and up: the hero wall mask (`/media/hero-wall-1600.webp`, already cached from Home, 31 KB, zero new bytes) flipped (`transform: scaleX(-1)`), `--ground-h: 24rem`, behind the h1 and the empty left column. Caveat: same wall as the Home hero (CONTEXT note 6, "not the same image repeated"); tone-on-tone at 50% and mirrored is a ground, not a photo, but the owner may still notice. If so, cut a second mask in `tools/photo/texture.mjs` `wall()` from another region of the Kealey frame (above every head). Phones get nothing.

**S4. Book GLucak as a `.go` link, not muted text (S).** `src/pages/shows/index.astro` 14: once `BOOKING_EMAIL` is set, `<a class="go" href="mailto:...">Book GLucak</a>`; until then keep the chip (a placeholder). One filled button per screen stays true.

Where NOT: the poster's paper side (text sits on it), `c-poster-*` (already the family's coarse 45 degree one-ink member), the YouTube thumbnails in Watch (his title cards with other artists' names, DESIGN 23).

---

## 2. Music (`/music/`, the first main action)
What I saw. First screen at 390: RISE, the Spotify box, and the `Play full songs on Spotify` outline button just above the phone bar (held per D81).
Below: nine tiles, the first two unreleased with generated title cards, then covers. IDENTITY with its countdown is at the very bottom, ~3000px down.
At 1280 the left column under RISE is ~330px of empty black (Home fills it with the garage toner photo; `RiseBand release={false}` has none).
- A new fan has no "where do I start". The nearest thing is the player (the playlist); the first tile is a Pre-save for a single not out yet.
- The two NoCover tiles are plain dark boxes; `Who I Am` is out in two days (Nov 13) and they vanish when covers exist. Do not invest in them.
- The IDENTITY block has no picture; Home shows the IDENTITY art (`index.astro` 67), Music shows only the mark and a date.

### Ranked ideas
**M1. "New here? Start with Go" (S).** Files: `src/pages/music/index.astro` after line 14, `src/components/content.js` (a `start()` helper returning the first release with `start: true` in `src/data/releases.json`), `global.css` (`.start-line { margin-top: var(--space-xs); }`).
Change: `{start && <p class="start-line">New here? <a class="go go-small" href={start.link} rel="noopener">Start with {start.title}</a></p>}` using the DESIGN 23 arrow link (a word and an arrow, not a pill or button). Which release: CONTEXT lists Go (https://wingsmusic.lnk.to/370407-Go), One And Done and the Deluxe as the current highlights; the owner picks (Gabe's call, so via the owner, hard rule 4). Do not reorder the crate: newest first is what a returning fan expects. Risk: none; one 52px line.

**M2. Ground under RISE at 1280 (M, shared mechanism).** `RiseBand.astro`: add class `band-rise-music` when `!release` (Home never gets it, so Home cannot change). Ground: record-groove rings (concentric, off-centre, one 2px stroke, no text) as `public/media/g-grooves-1600.svg`, tone-on-tone as the hero wall. Subject-derived (a record), not a template pattern. Source: Book of Shapes' Concentric Noise Rings (the pattern in the reel), or ~40 lines of our own script in `tools/photo/` (rings are plain geometry, no licence at all). Text on it: RISE and the player; check 12:1.

**M3. IDENTITY block gets its art (S).** `music/index.astro` 34-42: put the `identity-art-240/480` img in the existing `.v2-identity` layout (`global.css` 1090-1092 already styles it for Home). Cached when the fan came from Home. Do NOT treat it. Pre-existing flaw on both pages: the 480 file has the Instagram carousel's two pagination dots baked into its bottom edge; crop them off at the source. Rank low until Dave's final art exists.

Where NOT: every cover (`.tile-art`), the winged-cross mark, `mark-identity`, the NoCover cards (placeholder), the Spotify box. A ground stays behind the h1 and left column, never behind tiles.

---

## 3. About (`/about/`)
What I saw. At 390 and 1280 the h1 PUSH PAST FEAR lies across a red tritone crowd strip. At neither size can you tell who is on stage: the photo is a texture band behind a very large word.
The page has no face of Gabe. The bio is the verbatim Spotify bio (D23, correct). Below: Find GLucak (7 rows, 2px rules), Booking (placeholder), Photo credits.
- **For a venue booker the page does not say what he does live.** CONTEXT: "open mics plus some full-length shows, wants more"; "often performs with guitarist Fran Carroll". Neither is on About. The only booking line is the muted placeholder after the social list, in the same weight as "Photo credits".
- Patreon appears three times (about-set at 900px, Find list, footer; at 390 a solid button, Find list, footer). Rules stack in three lists (about-set, Find, footer): mild "overused dividers" (slop #8).

### Ranked ideas
**A1. Booker block (M, needs the owner's yes on wording).** Files: `src/pages/about/index.astro` 31-37, `global.css` (a `.book` block), `test/build.test.js` 112 (expects 'Find GLucak', 'Booking', 'Photo credits' present; check whether order or the word "Booking" is asserted).
Change: move Booking above Find GLucak and make it the page's one filled button. `<h2>Book GLucak</h2><p>Open mics and full shows. Often with guitarist Fran Carroll.</p>` then `BOOKING_EMAIL ? <a class="btn btn-solid" href="mailto:...?subject=Show%20request">Request a show</a> : <a class="go" href={INSTAGRAM}>Message on Instagram</a>`, the placeholder chip under it while the address is pending. The words come from the brief (CONTEXT "The job"); they name Fran, a third party, and go public, so the owner approves them (hard rule 4) and the copywriter files them in `docs/copy/about.md`. Same `BOOKING_EMAIL` switch the Shows empty state uses.
Risk: none to rule 1 or Home; About 390 gets ~120px taller (update the 2159 figure).

**A2. A face (M, depends on Gabe).** The strip is the "(d) crowd" plate; privacy crops stop above every audience face, so it cannot be the portrait. Ask Gabe, via the owner (it contacts him), for one portrait or press photo (already on the "still needed from Gabe" list, item 2). Until then do not reuse a Kealey crop a fourth time (hero B riso, night riso, poster, crowd all come from that frame). When it arrives: add a slot to `tools/photo/texture.mjs` (one-ink riso on paper, the poster's process), ~360x450 at 900px and up in the free right column under the about-set (~330px free at 1280). Not behind the h1.

**A3. Dividers (S).** Drop the 2px `.about-set li` rules (`global.css` 464); keep the Find list's.

Where NOT: more texture on the About strip. The IG4 eval has the h1 at a 3.0:1 worst pixel (`docs/review/ig4/eval.md` fix 4); anything more under the word makes it worse. Not the bio (body copy, 4.5:1), not the muted credit.

---

## 4. 404 (`/nope/`)
What I saw. WRONG TURN. in the display face, a line, LISTEN and SHOWS ->, a Home link, on flat grain. The best-written empty page on the site and the plainest.
- The title ends in a period: IG slop #20 "periods in titles" (`docs/research/ig-design-tips.md` 4d; the slogan's period is Gabe's wording, this one is ours).
- A white ledge nub with no word sits top-left (`404.astro` 8, `.tab-blank`): reads as a stray chip. Privacy has no ledge at all; the other pages have a word.
- At 1280 the right half and the lower third of the band are empty.

### Ranked ideas
**N1. No period, no blank ledge (S).** Files: `src/pages/404.astro` 8 (delete the `tab-blank` span) and 11 (`turn.` -> `turn`); `global.css` 801 (`--w-lost 5.2211`, `--w-lost1 2.8179`, `--w-lost2 2.1825` were measured with the period: re-measure, `TURN` gets narrower so `--w-lost2` rises and `--w-lost` falls), 1187-1188 and 1199 (the old-Safari fitted copies use the same vars), 804 (`.tab-blank`). Tests: `test/build.test.js` 171, `test/round2.test.js` 42 and 51 assert "Wrong turn"; confirm none asserts the period. Risk: a mis-measure overflows at 320px; check 320 / 390 / 1280.
Same sweep: `src/lib/products.js` 103 ("Nothing in the shop yet.") and 118 ("Shop.", already a Desktop follow-up in DESIGN 23).

**N2. Truchet "wrong turn" ground, 900px and up (M, section 10).** Book of Shapes lists "Quarter Arc Truchet" (on its front page today): quarter arcs on a grid, each tile rotated at random, so the lines turn and never arrive. It is the page's joke in line form and comes from the subject, which is the reels' own advice. Static `public/media/g-turns-1600.svg` (one path, 2px stroke, a few KB), `.band-lost` ground tone-on-tone. Nothing on phones. A seeded generator in `tools/photo/` is ~40 lines and removes any licence question.
Where NOT: no photo on the 404 (DESIGN 23), nothing brighter than the tone-on-tone value (the `.lost-line` sentence and buttons need their contrast), nothing at phone width.

---

## 5. Privacy (`/privacy/`)
Plain and right. Legal text stays plain: no ground, no photo.
- **P1 (S, optional).** Give it the ledge word so the pages match: `privacy/index.astro` 7, `<h1 id="h-privacy" class="spine"><span class="tab">Privacy</span> ...`. Polish, not value.
- **P2 (owner decision).** The page does not mention server logs. `docs/research/ig-security-reels.md` 4b #3 notes the host and our audit lines log IPs and asks that the privacy page cover them. Not design, but the only real content gap on an inner page.

---

## 6. Shop (`SHOP_ENABLED=1`, `/shop/`)
What I saw. MERCH, a hazard-stripe "preview" banner on paper (a printed notice: good), five sample tiles on a diagonal hatch with dashed wireframe icons and a rotated SAMPLE tag. Four columns at 1280 leave the fifth tile alone and ~500px of black below.
Empty (`products.json = []`, 390): MERCH, then a dashed bordered box "NOTHING IN THE SHOP YET." (period, `products.js` 103), no action but the footer.
- The sample tile ground is `--hatch` (`global.css` 72, 619): a perfectly tiling diagonal stripe, the "tiling texture is the AI tell" that DESIGN 23 retired on the hero. A placeholder; it goes with the samples. Do not spend time on it.

### Ranked ideas
**H1. Product photos stay true to colour (a rule, no work now).** When merch photos arrive: no halftone, riso or toner on the product (a fan must see the real shirt colour; same reason covers are never treated, DESIGN 3a). Print language goes on the frame: the tile ground on poster paper (`--text` with `--texture`, as `.poster`). Add one sentence to DESIGN.md 23.
**H2. Shop empty state = the same blank-poster card as Shows (S).** `products.js` 103 and the `.shop-empty` rule in `global.css`: paper card, "Nothing in the shop yet" (no period), "Get the next drop first" -> `#join`. One shared `.empty` look for Shows and Shop (S1). `test/products.test.js` 92 matches `/Nothing in the shop yet/`, so the words stay.
Where NOT: no ground on the grid; tile text sits on the page ground at 4.5:1.

---

## 7. Where the print language should and should not go
**Should (static, 900px and up, tone-on-tone, same paint as the hero wall):** Shows header (S3), Music left column (M2), 404 (N2). **Paper-stock card, no photo:** the Shows and Shop empty states (S1, H2). **Photo, when Gabe sends one:** About portrait (A2).
**Should not:**
- Covers (`.tile-art`, `.v2-cover`), the IDENTITY art, the winged-cross mark, Logo D (DESIGN 3, 3a, D51). The two NoCover cards are placeholders.
- Anything with text over it below 4.5:1: the About h1 (worst pixel 3.0:1), `.tile-artists`, `.tile-meta`, `.row-kind`, `.muted`, the footer slogan, the SAMPLE tag.
- Product photos (true colour), the YouTube thumbnails, the Spotify box, the sign-up field, every button.
- Privacy text.
- Nothing may animate: every new ground is a still (hard rule 1). No shifting or "breathing" layer, and no CSS dot or stripe grid (a perfect tile is the tell).

## 8. Remaining clichés from the IG lists on these pages (lists in `ig-design-tips.md` 4d)
| Cliché | Where | Fix |
|---|---|---|
| Periods in titles (#20) | 404 "Wrong turn." (`404.astro` 11); Shop empty (`products.js` 103); footer "Shop." with the shop on (`products.js` 118) | N1. The slogan's period is Gabe's; leave it |
| Containers with borders (#6) | shop empty dashed box (`.shop-empty`); `.ph-chip` placeholders (dashed, temporary) | H2; chips go when real |
| Overused dividers (#8) | About: about-set rules + Find rules + footer rules | A3 |
| Tiling pattern / stripe (DESIGN 23 table) | `--hatch` on shop tiles (`global.css` 72, 619) and the frozen v2 slot (1087) | goes with the samples |
| Decorative diagram | dashed wireframe icons on sample tiles | goes with the samples |
| Redundant text (#11) | About "Photo credits" repeats the footer line; kept on purpose (credits must be complete, `docs/copy/about.md` 2) | optional size demotion |
| Tags and pills (#1) | SAMPLE tag (functional: stops anyone thinking a sample is for sale; keep); `.tile-type` "Album" is plain bold | none |
| Section numbers, eyebrows, italics, Instrument Serif, mono, gradients, pulse dots, sparkles, liquid glass | none on these six pages | none |

Flat but not a list item: the page-wide `--texture` grain on every band (`global.css` 309, 511). It is the paper; leave it.
Not a cliché: the all-caps display headings (the IG4 eval accepted them as the brand).

## 9. Book of Shapes (licence page read today)
- Allowed: "Commercial or not, modified or as it comes, in print, on screen, on products"; attribution not required (optional "Pattern from bookofshapes.com"). Not allowed: redistributing the patterns as patterns, and letting others choose patterns inside an app, builder or template ("even when nobody can download the files"). Three patterns recreate other works and may not be published or sold, "least of all on a record sleeve or a poster": **Joy Division, Joy Division Mesh, Brockmann Beethoven Arcs**.
- For us: static SVG exported once per page and committed as our own asset (not a library, not the generator); `/edit/` must never offer a pattern picker (that is "inside an app"); one-line credit in the SVG comment; never the three derivative ones; never on a cover or IDENTITY art.
- Pattern names on its front page today: Cell Shift, Corner Grid, Pixel Field, Sweep, Sliced Word, Hex Strands, Ribbon Grid, Woven Grid, Flow Dots, Flow Lines, Flow Poles, Chevron Blocks, Triangular Mosaic, Node Garden, Interference Mesh, Spiral Morph, Broken Ring, Quarter Arc Truchet. The per-pattern pages returned 404 to my fetch, so I have not seen how each looks; I rely on the names and on Truchet being the well-known quarter-arc tiling.
- **Fits:** Quarter Arc Truchet on the 404 (N2); record-groove rings under RISE on Music (M2). Flow Lines is close to the Live It Loud line screen already on Home: skip.
- **Avoid:** Pixel Field, Corner Grid and anything pixel, dither or square-dot (on the IG lists: pixel mosaics, square-dot grids, blueprint grids); gradients; the site's animated versions (hard rule 1).
- Truchet and rings are plain geometry: a seeded script in `tools/photo/` costs ~40 lines each, sidesteps the licence, and re-runs for an era swap. Prefer that unless the owner wants the library.

## 10. The shared mechanism (idea 4, exact)
One rule, one variable per page, no new colour, no new font, 900px and up only (phones get nothing and no extra request):
```css
/* DESIGN 24 (inner grounds): a still mask painted tone-on-tone, as the hero wall (DESIGN 23b item 1). Not on phones. */
.has-ground { position: relative; isolation: isolate; }
@media (min-width: 900px) {
  .has-ground::before {
    content: ''; position: absolute; inset: 0 0 auto 0; height: var(--ground-h, 24rem); z-index: -1; pointer-events: none;
    background-color: color-mix(in srgb, var(--line) 50%, var(--bg));
    -webkit-mask: var(--ground) 50% 0 / 100% auto no-repeat; mask: var(--ground) 50% 0 / 100% auto no-repeat;
  }
}
.band-live { --ground: url('/media/hero-wall-1600.webp'); }   /* mirror with transform: scaleX(-1) on its ::before */
.band-lost { --ground: url('/media/g-turns-1600.svg'); --ground-h: 100%; }
.band-rise-music { --ground: url('/media/g-grooves-1600.svg'); --ground-h: 100%; }
```
Add `has-ground` to those three sections. Old Safari without `color-mix`: the declaration is dropped and the page stays plain `bg` (same as the hero wall). `.band` is already `z-index: 2`; `isolation: isolate` keeps the ground behind `.wrap`. The Home hero's own `.hero-wall` is untouched and no Home element carries `has-ground`, so Home height and look cannot change. `100%` height needs the band's own height, so check `.band-lost` and the Music band at 900 and 1280.

## Not done / limits
- I did not run the test suite or any proposed CSS; every "exact change" is from reading the source and the screenshots. Each needs a CDP pass at 320 / 390 / 900 / 1280 and a contrast pass before it ships.
- Spotify and the YouTube row were blocked (as in earlier evals), so the real embed and the live Watch thumbnails were not seen.
- My scratch servers (ports 8941, 8942, 8943) and the scratch build (`...\scratchpad\ia\`) are still present; a broad `pkill` was refused by the permission system, so they were left for the caller to stop.
