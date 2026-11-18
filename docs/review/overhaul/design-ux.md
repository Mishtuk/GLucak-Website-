# Overhaul review: design + UX + information architecture (Desktop designer, 2026-11-18)

Scope: look, feel, UX and IA of every page. Copy and technical reviews are separate. No site files were edited.
Evidence: 126 shots of the running server (localhost:8095), `docs/review/overhaul/shots/` (`node .work/overhaul-shots.mjs`):
9 pages (/, /music/, /shows/, /about/, /videos/, /shop/, /edit/, /nope, /v2/) at 320x640, 390x844, 768x1024, 1280x800,
1600x900, plus 390 and 1280 with `prefers-reduced-motion: reduce`. Each has `-screen` (first screen) and `-full`. Heights,
animation counts and overflow are in `shots.txt`: 0 running animations and no sideways scroll in all 63 page loads. Read against CONTEXT, the email digest (promises), DESIGN 1-27, D2-D96, the
IG tips (rounds 1 and 2), templates round 4, design repos A and B, and Oversight.

## 1. Verdict in one paragraph
The bones are good and worth keeping: the poster lockups in Big Shoulders, the slogan running down Home, the indigo +
magenta IDENTITY era, the Music crate, the Videos page, the phone bar and the Now line. A fan from Instagram on a 390 phone
sees **Listen, Shows and today's open mic on screen one, and Spotify's Play just above the bar**, so the core promise holds.
What keeps it from "straight-up cool" is that the system has frayed at the edges after 27 rounds of small fixes. The shows
lists are out of date order (a Jan 16 poster sits above **today's** open mic). Magenta is spent on photos, Join, Patreon and
six play squares, so Listen no longer owns it. The photos come in five treatments on one page. The 700-899px band has no
Listen or Shows at all. The edit screen keeps only half of what Gabe was promised. The overhaul is mostly **subtraction and
discipline**, plus three promised features (an edit screen for releases and the bio, a photo gallery, a real booking action).

## 2. Score
**Critique rubric: 29/40** (DR1 after-review: 31). This review saw more (768, 1600, /edit/, /shop/, /v2/), so the drop is
mostly new evidence, not new damage.
| Heuristic | Score | Why (evidence) |
|---|---|---|
| 1 Visibility of status | 3 | Today / Tomorrow and the Now line are excellent; but on Home and Shows the big "JAN 16" poster reads as "next" above the row that says Today (`shows-390-screen`) |
| 2 Match real world | 3 | Slogan headings plus the nav-word tab work; "Book GLucak" ends on **LISTEN →** (Shows, About), not a way to book |
| 3 User control | 3 | Back, Menu, the Motion switch and all-shows links are fine; the edit rows put Delete at the same weight as Edit |
| 4 Consistency | 2 | RISE puts the player first on phones but the release card first from 900px; About's "Find GLucak" grid repeats the footer grid; 5 photo treatments; the accent sits on 4 kinds of things; Spotify's maroon card is a third colour |
| 5 Error prevention | 3 | Sign-up guard and the shop's buyable rule are good; the sticky Save bar covers a row on /edit/ at 320 |
| 6 Recognition | 2 | 700-899px (tablet portrait, **phones in landscape**): no bar, no nav, no Listen in the header, only "Menu" (`*-768-screen`) |
| 7 Flexibility | 3 | Prefetch, .ics, platform row; no share on shows (fans come from Instagram) |
| 8 Aesthetic + minimal | 3 | Strong type and hard edges; noise: 8 Played rows as heavy as upcoming ones, the shop's triple "Sample" notice, About's empty left column at 1280 |
| 9 Errors | 3 | Sign-up and edit messages name the fix (DESIGN 7, 15h) |
| 10 Help | 4 | Edit hints are plain and in place; the Spotify loading note; 404 points to the music |

**Cognitive load:** Home passes (0-1 fails). Shows fails 2 (hierarchy: the poster out of date order; chunking: 8 upcoming + 8
Played rows at one weight) = moderate. /edit/ fails 2 (17 tall cards with no grouping; Played mixed into one list).
**Personas:** *Casey* (phone, Instagram): wins on screen one; loses at Shows when "JAN 16" outshouts "Today". *Jordan*
(first-timer, tablet): opens /music/ at 768 and has to find Menu to do anything. *Gabe as editor* (a Jordan): can add a show
in under a minute; cannot change a release link, the bio, the Now line or the IDENTITY date at all (promised Nov 3 and Nov 6).

### Craft floor
| Check | Result |
|---|---|
| Contrast | PASS (era tests, D93) |
| Depth | PASS (no shadows; surfaces lighter) |
| Spacing | **FAIL at 1280**: About's left column leaves ~250px of void under the bio; RISE's left column ends ~170px before the right; the Shows right column ends ~430px above the Played list (carried from DR1) |
| Type | PASS on measure and scale steps; the fitted lockups run far above 6rem (THE TIME IS NOW is ~300px tall at 768). That is D-ruled (DESIGN 1, D14), so a conflict to report, not a fail. At 768 it is too much: see CHANGE H3 |
| Motion | PASS on rules (0 running animations at rest, reduced = same layout, "Motion: off (device setting)"); **craft fail on taste**: three identical heading fades are "one entrance on every section", not one authored moment (ADD M1) |
| States | PASS (empty shows, no-cover sleeve, embed loading note, sign-up states, shop Coming soon) |
| Browser surfaces | PASS (DR1 27f) |
| Copy (controls name their action) | **FAIL**: "Book GLucak ... LISTEN →" (`ForVenues.astro`) |
| Coverage (every brief item findable) | **FAIL**: photo gallery, booking or contact form, editing releases and the bio (email digest checklist) are missing |
Refuse list: the section word above each phrase is an eyebrow (D79 / D87 conflict, ruled KEEP in 4 below); the quote's 4px
left rule is a side stripe (D-ruled, text colour, KEEP); no gradient text, glass, glow halos, mono, emoji icons or section numbers.

## 3. Page by page and component by component: KEEP / CHANGE / REMOVE / ADD

### Global
- **KEEP** the type pair (Big Shoulders 900 + Atkinson Hyperlegible Next, D25) and fitted lockups: the strongest thing on the site.
- **KEEP** the IDENTITY era (indigo `#05024c` cool ground + warm magenta `#d93cfb`, opposite temperature, D93) and era tokens.
- **KEEP** the phone bar (D8) and its four labels; the footer's giant LISTEN / SHOWS / JOIN; the grain; 2px corners; no shadows.
- **CHANGE G1, one tap at every width.** 700-899px shows only "Menu" (global.css 199, 214-217, 543). Show `.nav-desktop` and
  `.header-listen` from **700px**: brand ~200 + 4 links ~330 + Listen ~100 fit in 700. Hard rule 3 and "both actions one tap from every page".
- **CHANGE G2, accent discipline (IG round 2 N3/N5: "the accent goes on whatever you're selling").** Today `.btn-solid` paints
  Listen, Join, Patreon and Pre-save-style buttons, and `.yt-play` paints every video's play square (global.css 141, 442).
  Rule: magenta fills only **Listen, Tickets, Pre-save, Buy**. Join and Patreon become `btn-line`; the play square becomes
  `--text` with a `--bg` triangle. On Home 390 that takes magenta fills from 6 to 2 or 3, and Listen wins the eye again.
- **CHANGE G3, Spotify in our palette.** The embed has no `theme=0` (content.js 37), so Spotify paints a maroon card from the
  playlist cover: the biggest block of colour on Home screen one, and a third hue. DESIGN 5 already says "always
  dark-themed (theme=0, D35)": the build drifted. Add `?theme=0`.
- **CHANGE G4, one photo language.** Home at 1280 shows magenta riso (hero B, Push), one-ink halftone (RISE, Shows), raw purple
  CD photos and clean video stills. Two treatments only: **print** (one-ink halftone in `--text` on `--bg`, or ink on paper in
  the poster) for live photos used as art, and **clean** for covers, CD photos and video stills. Magenta leaves the photos: it is
  the accent, and on photos it decorates. This overturns part of **D34 / DESIGN 3b** (hero B's riso (b), Push's tint). Argument:
  with the IDENTITY era, magenta in the hero photo plus two magenta Listens give screen one at 1600 three equal magenta
  masses. The riso was picked on the placeholder era, before magenta was the accent. Show the owner a 2-up sheet first.
- **CHANGE G5, never repeat a photo.** Hero B's slot and the Shows poster art are the same Kealey Riverside frame (b-riso vs
  `c-poster`, shows.js 66). Owner note 6 (2026-11-06). Give the poster another frame or the next show's own flyer (ADD S3).
- **REMOVE `/v2/`.** A dead second Home (an older order: release card over the player) that still builds and can be found.
  Delete `src/pages/v2/index.astro` and `src/styles/v2.css` once the classes it shares are moved (the coder checks; global.css
  uses several `v2-*` names).

### Home
- **KEEP** screen one at 390: name, slogan, Listen (solid) + Shows (text), Now line ("Open mic today: Chambers 19..."). It passes
  the Instagram test at 320 and 390. KEEP the slogan bands (the owner's Nov 3 promise) and the Home cap discipline (D39 / D67).
- **CHANGE H1, the Now line becomes a ticket stub.** Today it is an underlined body-size link; it is the most useful line on the
  site. Make it a paper-coloured stub (the poster's `--text` paper, `--bg` ink) under the buttons: date in the display face on the
  left ("TODAY" / "NOV 18"), venue and city, an arrow, the whole stub one link to `#shows`. When the Now line is a release,
  the same stub shows "OUT NOW" plus the title. Same height as today's two-line wrap at 320 (~56px). Static. Hero.astro, global.css.
- **CHANGE H2, the player comes first at every width.** From 900px RISE shows the release card (a type-only "WHO I AM" sleeve)
  above the player (`home-1280-full`), so on desktop the first thing in Music is a placeholder. Player first, card under,
  matching phones. RiseBand.astro order + global.css grid.
- **CHANGE H3, scale down the lockups from 700 to 899px.** At 768 the fitted phrases run ~300px tall (THE TIME IS NOW), Home is
  4539px (taller than 390's 3782), and the Listen button stretches across the full width. Use the 900px one-line split from 700px, or cap the fit at ~22vw. global.css.
- **CHANGE H4, LIVE IT LOUD in date order** (see Shows S1): the first item is the next date; a full show keeps its poster weight
  in its own place.
- **KEEP** PUSH PAST FEAR with bio sentence 1 (D23) and THE TIME IS NOW with sign-up + IDENTITY countdown and Pre-save.

### Music
- **KEEP** the crate (cover grid): the best component on the site at 1280 (real covers, honest no-cover sleeves, Listen /
  Pre-save under each). KEEP the IDENTITY CD block with the tracklist ending big on Scenic Route; KEEP the platform row (D96).
- **CHANGE M2, the three no-cover sleeves.** Scenic Route, Welcome Home and Who I Am lead the grid as three identical
  type-only squares. They read as "missing", at the spot that should feel newest. Ask Gabe (via the owner) for the single art.
  Until then, give the three one row of their own, "Coming up", under IDENTITY, with dates. Real covers then start the grid.
- **KEEP** "New here? Start with Go".

### Shows
- **CHANGE S1, date order wins.** `upcomingHtml` takes "the first full show" as the poster, ahead of earlier open mics
  (shows.js 82-86). The page then shows JAN 16 huge, with "Nov 18, Today" under it. Rule: rows always in date order. The
  **next date** (Today / Tomorrow / soonest) gets the big date treatment. A full show gets a **"Full show" flag** and a taller
  row with its art wherever it falls, plus one line above the list: "Next full show: Jan 16, Riverside". That serves Gabe's
  "more full shows" without lying about what's next. shows.js, global.css, shows/index.astro.
- **CHANGE S2, Played gets smaller.** 8 past rows at the same weight as upcoming double the page. Show the last 3, then
  `<details>` "All played (n)". Muted dates. shows.js 88 (`playedHtml`).
- **CHANGE S4, Book GLucak ends in a way to book.** The block's only action is "LISTEN →". It becomes **"Email to book"**
  (mailto to the glucak.com booking address, CONTEXT 2026-11-06), with the photo kept. ForVenues.astro (also on About).
- **ADD S3, share a show.** `navigator.share` on each upcoming row and the poster (fallback: copy the link, then a static
  "Link copied"). Fans arrive from Instagram and share back. **Overturns D96's rejection** ("later"): it is the cheapest thing
  that grows show turnout, with no motion and no third party. app.js, shows.js, global.css.
- **KEEP** Today / Tomorrow, Add to calendar, the empty state, the 1280 lead + two video layout.

### About
- **KEEP** the full bio word for word (D23), the Epilepsy survivor line pending Gabe, and the 1280 right column's
  LISTEN / SHOWS / PATREON list (D77): good wayfinding.
- **CHANGE A1, the header photo.** At 768 and 1280 PUSH PAST FEAR sits on a halftone so dense the photo is gone (just purple
  dots, `about-768-screen`). Either a print-treated photo that reads (G4) or the plain era ground. PushPhoto.astro.
- **REMOVE A2, "Find GLucak".** The same 7 links as the footer grid, 200px above it. Delete the section; the footer carries them.
- **CHANGE A3, credits** go once, in the footer (today they print twice on About).
- **ADD A4, Photos** (Gabe asked for a gallery on Nov 2): a section on About, not a new nav item (nav stays at 4 + Shop).
  A static collage of his cleared photos in the print / clean treatments, hairline-tied (Oversight "Collage" as structure only),
  a tap opens the full image (a plain link to the file, no lightbox script). Fills the 1280 void.
- **ADD A5, chapters (later, Gabe's words only).** Since 2022 / Scenic Route on Montco Radio / IDENTITY Aug 13 2027, as dated
  steps (templates round 4 #7). Waits on the copywriter and Gabe; D96 deferred it, still the right call for launch.

### Videos
- **KEEP** the page whole: lead (Scenic Route live) + Riverside + music videos, facades with no YouTube until tapped (D64),
  credits. The best-proportioned page at every width. Only change: play squares in `--text` (G2).

### Shop (hidden at launch)
- **KEEP** the grid, the dashed wireframe samples and D41 / D42 / D43 / D49 (no new shop work until real products).
- **CHANGE Sh1, one notice.** "Preview" chip + striped banner + "SAMPLE" tag + "SAMPLE:" in every title = 4 notices.
  Keep the banner and the tag; drop the chip and the title prefix.
- **Readiness before switch-on (checklist, not work now):** real product photos (Fourthwall), a price line in tabular figures,
  a catalog line ("Tee, S-XL") and a format chip (CD / Tee / Vinyl), from ecm-records and dr-strange-records (repos B). The
  Buy button is the accent (G2). Today the shop is **not ready**: no prices, no photos.

### Edit screen (/edit/)
- **KEEP** the sign-in, the big plain fields, the dashed Add, the save bar idea, the backup download, the help line.
- **CHANGE E1, keep the promise.** Only **Shows** and **Products** exist. Promised (owner, Nov 3 / Nov 6; DESIGN 10): add shows,
  **update release links, change the bio**; also the IDENTITY date + pre-save. Add tabs **Releases** (title, date, cover upload,
  smart link, type), **Now + IDENTITY** (date, pre-save link) and **Bio** (About text, the Home sentence). Same row / form /
  save-bar components as Shows. The **largest gap** in the review: without it Gabe emails us for every release, which is the
  Puck Live failure.
- **CHANGE E2, compact rows.** Each row is a ~150px card with two equal buttons ("Show 1" label, Edit, Delete). Make it one
  line, date + venue + kind + Edit; Delete moves inside the open form with its confirm. Played goes under a `<details>`
  ("Played (8)"). 17 cards at 320 = 4,200px today; about 900 after.
- **CHANGE E3, the sticky Save bar** must not cover a row: reserve its height at the end of the list (`padding-bottom`). Add a
  "See it on the site" link after a save.

### 404
- **KEEP**: "Wrong turn / That page isn't here. The music is." + Listen + Shows. On brand and useful.

## 4. D-rulings: keep or overturn
| Ruling | Call | Argument |
|---|---|---|
| D25 type, D93 IDENTITY era, D8 phone bar, D23 exact words, D41-D43 / D49 shop | KEEP | Load-bearing and right |
| D79 / D87 section word above the phrase (craft floor calls it an eyebrow) | KEEP | The phrase is never the nav word ("Live It Loud" = Shows); under 900px the word is the only "you are here". It is wayfinding, not decoration: the Puck Live lesson beats the floor here |
| D34 + DESIGN 3b hero B riso, Push tint | **OVERTURN (owner sheet)** | Magenta is now the accent (D93 came after D34). G4 |
| Shows poster rule (DESIGN 5 "first full show is the poster"; shows.js 82) | **OVERTURN** | Breaks date order; Today hides under Jan 16. S1 |
| D47 / DESIGN 8 "exactly two motions" (glow + 3 heading fades) | **AMEND** | Keep the glow; replace the 3 identical fades with **one authored moment**: on first load only, the hero name GLUCAK wipes in left to right (`clip-path` inset 100% to 0, 700ms, exponential ease-out, once, no luminance change, no repeat). Inside `prefers-reduced-motion: no-preference` AND `html[data-motion='on']`; visible by default with no JS. One change, well under 3 per second |
| D96 rejected share | **OVERTURN** | S3 |
| D39 Home cap 5.8 screens | KEEP | H1 stays within today's height; H2 / H4 move content, they don't add it |

## 5. Hard rules check for everything above
No proposal flashes or loops. The only new motion is the one-time name wipe (M1), gated by both switches. Real photos only:
the gallery and the poster frames come from Gabe's cleared files; no generated or stock images. No third-party scripts:
share is `navigator.share`, Spotify `theme=0` is the same iframe, the gallery is plain links. No new inputs except the edit
tabs, which reuse the escaped, tested pattern (no-injection tests per form, `<script>` and `' OR 1=1 --`).

## 6. Not verified
- Home's Spotify iframe at 768 painted half-loaded under its loading note, and at 1280 it was still loading in the full-page
  capture (Music 1280 loaded fine). Likely headless lazy-load timing, not a defect. Check on a real tablet before calling it.
- The Menu sheet and the edit form open were not shot (closed states only). Real iPhone Safari was not checked.

## 7. The overhaul direction
GLucak.com becomes **the gig poster that is always current**: one printed sheet in IDENTITY ink and paper, where the
next date, the newest song and the slogan are the only loud things.
- **Loud by type, not by colour.** Big Shoulders lockups and paper-and-ink posters carry the energy; magenta is a light
  switch you only flip on Listen, Tickets, Pre-save and Buy.
- **Time-true.** Everything sorts by date; "Today", "Tomorrow" and "Out now" are the headlines; the past shrinks by itself.
- **One photo language.** Gabe's real photos as one-ink prints or clean, never tinted for decoration; no frame used twice.
- **Same two actions at every width.** Listen and Shows are one tap at 320, 768 and 1600.
- **Gabe runs it.** Shows, releases, the Now line, IDENTITY and the bio are his to change from the edit screen, so the site
  never goes stale between our visits.
- **One authored moment.** The name prints itself once on arrival; everything else is still.
Kept from today: the slogan bands, the crate, Videos, the phone bar, the footer words, the era system, the hard rules.

## 8. Top 12 changes, ranked (impact on "fans listen and come to shows" + "intuitive, versatile, straight-up cool")
| # | Change | Effort | Files |
|---|---|---|---|
| 1 | **Shows in date order**: the next date gets the big treatment, full shows flagged in place, a "Next full show" line (S1, H4) | M | `src/lib/shows.js` (82-86, `posterHtml`), `src/pages/shows/index.astro`, `src/pages/index.astro`, `src/styles/global.css`, `test/*shows*` |
| 2 | **Edit screen keeps the promise**: Releases, Now + IDENTITY and Bio tabs; compact rows; Played folded; Save bar clear (E1-E3) | L | `src/pages/edit/index.astro`, `public/js/edit.js`, `server.js`, `src/lib/store.js`, `src/data/releases.json`, `src/components/content.js`, tests |
| 3 | **Listen + Shows one tap at 700-899px** (G1) | S | `src/styles/global.css` 199, 214-217, 543; `src/components/Header.astro` |
| 4 | **Now line as a ticket stub** on the hero (H1) | S | `src/components/Hero.astro`, `src/lib/shows.js` (now line), `src/styles/global.css` |
| 5 | **Accent discipline**: magenta only on Listen / Tickets / Pre-save / Buy; Join, Patreon outline; play squares in text colour (G2) | S | `src/styles/global.css` 141, 442; `src/components/Signup.astro`; `src/pages/index.astro` 51; `src/pages/about/index.astro` |
| 6 | **Spotify `theme=0` + player first in RISE at every width** (G3, H2) | S | `src/components/content.js` 37; `src/components/RiseBand.astro`; `src/styles/global.css` |
| 7 | **"Email to book"** replaces LISTEN in Book GLucak; booking mailto on Shows + About (S4) | S | `src/components/ForVenues.astro`, `src/components/content.js` (BOOKING_EMAIL) |
| 8 | **Share a show** (navigator.share, copy-link fallback) (S3; overturns D96) | S-M | `public/js/app.js`, `src/lib/shows.js`, `src/styles/global.css` |
| 9 | **One photo language + no repeats**: print / clean only, magenta out of photos, new poster frame (G4, G5, A1; owner sheet first) | M | `tools/photo/run.mjs`, `public/media/v2/*`, `public/media/c-poster-*`, `src/components/Hero.astro`, `src/components/PushPhoto.astro`, `src/lib/shows.js` 66, DESIGN 3b |
| 10 | **Photos on About + About cleanup**: gallery section, remove "Find GLucak", credits once (A2-A4) | M | `src/pages/about/index.astro`, `src/styles/global.css`, `public/media/photos/*` (new, cleared files only) |
| 11 | **Played folds, /v2/ goes, shop shows one notice, coming-up row for no-cover singles** (S2, REMOVE v2, Sh1, M2) | S | `src/lib/shows.js` 88, `src/pages/v2/index.astro`, `src/styles/v2.css`, `src/pages/shop/index.astro`, `src/pages/music/index.astro` |
| 12 | **One authored moment**: the hero name wipes in once; the 3 heading fades go (amends D47); lockups scaled down at 700-899 (H3) | S | `src/styles/global.css` (motion block, `.fade`), `public/js/app.js` 49, `src/components/Hero.astro` |
