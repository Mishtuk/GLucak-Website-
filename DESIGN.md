# GLucak website design (phase 1, Laptop designer, 2026-11-02)

Spec for the coder. Sources: `docs/research/direction.md` sections 2-4, `DECISIONS.md` D2-D16, the Home prototype in
`prototype/`. Where this file and the prototype disagree, tell the designer; don't guess.

**Status (2026-11-05):** Home is designed and measured with **Gabe's real photos**, the real playlist and Logo D, on a placeholder
era (colors). Type is **locked** (section 2). Hero A vs B waits on the owner's pick (`prototype/shots/hero-pick.png`). Still
waiting on Gabe: IDENTITY colors and art, the booking email, and his OK on the two "From Gabe" quotes (R1, L2 in `docs/copy/home.md`).
Known and in the prototype: Spotify artist link `https://open.spotify.com/artist/1SxMTO4oSXDbNSNzxx7cVX` (footer Spotify link).

**Open the prototype:** `prototype/index.html` from disk. Switches: `?hero=a` `?hero=b` `?shows=none`
`?era=placeholder-b` `?identity=out` `?identity=none`. Re-check with `node prototype/check.mjs` (results in
`prototype/shots/check-report.txt`), then `node prototype/tools/hero-pick.mjs` for the owner's side-by-side.
Web copies of Gabe's files: `node prototype/tools/resize.mjs` (section 3b).

## 1. The idea
Gabe's slogan runs the page, and the page gets louder as it goes. Four things make it his and not a template:
1. **The slogan as a poster lockup.** Each phrase is set in fitted lines of heavy condensed type, full width, so the
   headings grow from RISE to LIVE IT LOUD to PUSH PAST FEAR to THE TIME IS NOW. Volume comes from size. Nothing moves to do it.
2. **Crate-divider tabs.** Each section's plain label (Music, Shows, About, Join) is a tab standing on the section's top
   edge, like a divider in a record bin. It uses the exact nav word, costs no height, and reads before the big phrase.
3. **The show as a printed poster.** The next show is a paper-colored block on the dark page, with a huge date.
4. **One era color, spent carefully.** It appears on the main button, the poster's Tickets button, the play button,
   the duotone and the glow. Everything else is `bg` and `text`.

Rap is the type, rock is the still grain and hard edges, EDM is the slow glow. No other decoration.

## 2. Type (locked 2026-11-05)
**Locked: Big Shoulders Display 900 + Atkinson Hyperlegible Next.** D14 held the type until the logo arrived, to avoid two
competing wordmarks. Logo D, the logo IDENTITY uses, is a **symbol with no lettering** (a chrome cross with grey lightning
wings), so there is no second wordmark to compete with: GLUCAK in Big Shoulders *is* the wordmark, and Logo D sits beside it
as the mark (section 3a). Checked side by side in the header and the IDENTITY block: the cross's straight arms and hard
corners match the flat-sided, square-shouldered letters, and the lightning wings' sharp diagonals echo the K and A. The
mark's chrome and bevel stay in the mark: the type never gets chrome, bevels or outlines to match it. No clash, so no switch,
and the `--w-*` measurements stand. Changing the display face from here is a reviewed change (D12): re-measure every `--w-*`
with `node prototype/check.mjs --measure`.

| Role | Face | File | License |
|---|---|---|---|
| Display: name, phrases, buttons, dates | **Big Shoulders Display 900** | `fonts/big-shoulders-display-900.woff2` (14 KB, latin) | SIL OFL 1.1 |
| Reading: body, labels, links | **Atkinson Hyperlegible Next** 200-800 variable | `fonts/atkinson-hyperlegible-next-wght.woff2` (34 KB, latin) | SIL OFL 1.1 |

Both are self-hosted (CSP `font-src 'self'`). The license text sits beside them in `prototype/fonts/OFL-*.txt` and must ship with the fonts.

**Why Big Shoulders:** I set "GLUCAK" in nine heavy condensed options. Its tall, flat-sided letters read like level meters
on a mixing desk, it stays legible down to the slogan's 21px on a 320px phone, and it isn't the usual poster Anton. Rejected:
Anton (common), Archivo condensed (wider, so a shorter name), League Gothic (too light), Anybody at 50% width (letters clog),
Bebas Neue (direction.md). **Why Atkinson:** built for legibility, with enough character to sit beside the display face.

**Fitted lines.** Every lockup line has its font size calculated from its container, so each line fills the width and wraps
the same at every screen, with no script and no reflow:
```css
.fit { container-type: inline-size; }
.ln  { display: block; width: max-content; white-space: nowrap; line-height: .82;
       text-transform: uppercase; text-box: trim-both cap alphabetic;
       font-size: calc(100cqi / var(--w-line)); }
```
`--w-*` is that string's measured width in em, times 1.003 as a safety margin. `node prototype/check.mjs --measure` prints
them. **If the display face changes, re-measure every `--w-*`; nothing else changes.** Line breaks are forced in markup, one
span per line. `text-fit` would be simpler, but it is Chrome and Edge only, and these fans are on iPhones. `text-box` is a
harmless no-op in Firefox because `line-height` stays under 1.

**Scale** (`rem`): `--step--1` 1 (the floor on phones), `--step-0` 1.125 body, `--step-1` clamp(1.25, 1.15 + .5vw, 1.5),
`--step-2` clamp(1.625, 1.4 + 1.1vw, 2.25), `--step-3` clamp(2.25, 1.8 + 2.2vw, 3.5). Fallback stack for display:
`Impact, 'Arial Narrow', sans-serif`. Preload the display face. `font-display: swap`.

## 3. Tokens and color
Same structure as Riverside's `global.css`; the serif and gold don't carry over. Copy the `:root` block from
`prototype/styles.css`: space `--space-xs` to `--space-xl`, `--section`, `--gutter`, `--container: 90rem`, `--radius-s: 2px`,
`--header-h` 60px (72px from 900px), `--tab-h` 2.125rem, `--bar-h` calc(62px + safe area) under 700px, else 0. Corners are
hard (2px) except the Spotify box (12px, matches the embed). No shadows, no cards.

Era colors load as `--bg --text --accent --accent-text --muted`. Everything else derives, so no era adds a role:
- `--bg-2`: `color-mix(in srgb, var(--text) 7%, var(--bg))`. `--line`: same at 26%.
- **Poster:** `--text` as the paper, `--bg` as the ink, both already tested as a 4.5:1 pair.
- **Accent as small text on `bg` is banned.** The era test only promises 3:1 there. Accent carries fills, with `accent-text` on top.
- **Duotone, live photos only. Covers and Dave Bahm's art are never tinted.** An SVG filter: grayscale, then a two-stop table
  from `bg` to a capped peak. **The ceiling:** the peak is `bg` mixed toward `accent`, stopping at the first mix with 4:1 against
  `text`. So text over any tinted photo passes the 3:1 large-text rule by construction, in any era, whatever the photo. Proven:
  a teal era failed at 2.77:1 before the ceiling and passes at 5.12:1 with it. Compute it at build from the era file (`peak()` in
  `prototype/app.js`) and print the filter into the layout. No extra color role needed.
- **Scrims:** only where small text sits (2026-11-05: the old full-width top band dimmed his face). Hero: a top-right ellipse,
  `bg` at 55% strength, 62% of the width by 130px, behind Menu and the nav (4.5:1); plus the bottom ramp, clear until 42% of
  the height, `bg` at 80% strength at 70%, solid `bg` at the bottom (Now line). **Hero A under 900px (2026-11-05, with the lifted
  (a) photo):** two more layers: a top-left ellipse (`bg` 45%, 40% of the width by 110px) over the brand's spot (it is hidden
  until the header goes solid, but shows there with no JS), and a light veil from 1.5rem above the strip's end to 2.5rem below
  it, then `bg` at 30% under name and slogan (the lift puts his white shirt behind the name: 3.07:1 with no veil). His face in the
  strip stays clear. Push Past Fear uses a lighter one. Exact values in `styles.css` and section 11.
- **Treatments replace the duotone on photos (D34, section 3b):** the photos are graded in the file (`class="graded"`); the
  ceiling below still applies to any untreated photo with `.duo`.
- **Real photos through the duotone (2026-11-05), the ROADMAP risk 9 verdict: no muddiness, keep the derived ceiling and the
  filter as they are.** Tested all three photos against a darker curve (gamma 1.8), a lighter one (gamma 0.7) and two
  contrast stretches. Kealey's photo is not low-light, it is high-key (a bright, blue-lit wall), so his white shirt and the wall
  both land near the capped peak; he reads by his hair, glasses, mic and arms, which is enough. The current filter is best for
  it: darker curves turn his face into a silhouette. The low-light MCCC still holds up: face, shirt and arm lift off the dark
  curtain; only his black jacket merges with it. Gamma 0.7 separates the jacket a little. **If the owner finds a low-light
  photo too dark, the smallest fix is a per-photo `lift` (one `feFuncR/G/B type="gamma" exponent="0.7"` before the table),
  for low-light photos only.** It sits below the table, so the ceiling still holds. Not built: no photo needs it yet. What
  *does* dim hero A is the ceiling itself plus the glow over the photo. That's the price of text on a photo, and the reason B
  exists.

### 3a. The mark: Logo D (IDENTITY's logo)
`assets/from-gabe/logo-d-identity.png`, 1554x495: a chrome cross with a black outline, grey lightning wings at 65% opacity, a
soft drop shadow. **The PNG has real transparency** (64.5% of pixels fully clear, 16.2% partial: the wings and the shadow), so
no redraw is needed. It is a **mark, not a wordmark: it never replaces GLUCAK in the hero or anywhere else.** It belongs to the
era (D12 amended by the boss, 2026-11-05: era file field `mark`, section 4), so the next era can bring its own or none.
- **Header:** left of the brand word, `height: 30px` (94px wide), 0.5rem gap, in the same link (one target, "GLucak home").
  **Why 30px:** GLUCAK at 28px has 23px caps (Big Shoulders' cap height is 0.81em), and at 30px the cross is 25px tall, one step
  above the caps, so it reads as a symbol at a glance and doesn't outweigh the word. The pair is 183px wide (measured at 390),
  fits at 320 beside Menu, stays inside the 60px header, and the wings still span 16px. Same 30px from 900px (the 72px
  header gives it air; going bigger would make the mark louder than the name). On Home it hides with the brand word while
  the header is see-through over the hero (it would sit on the photo, which is banned below).
- **IDENTITY block** (Join band on Home, Music page): **beside** the word IDENTITY, to its left, `height: 40px`, vertically centred on
  the word (beside, not above: it saves about 60px of phone height, boss 2026-11-05).
- **Favicon:** a square crop of the cross from the original (wing tips inside the square stay as drawn), `favicon-32.png` and
  `apple-touch-icon-180.png` (on the era `bg`, because iOS fills transparency with black). Made by `tools/resize.mjs`; no
  redrawing. A cross-only file from Gabe or Dave would be crisper at 16px; nice to have, not needed.
- **Minimum size:** 24px tall (cross 20px). Below that the wings stop reading as lightning. Never in body text.
- **Clear space:** a quarter of the mark's height on every side (the cross's arm thickness): 8px at 30px, 10px at 40px (the IDENTITY gap is 12px). No
  text, edge or other graphic inside it.
- **Backgrounds:** solid `bg` or `bg-2`, with or without the grain, **in dark eras only** (bg luminance under about 0.05). The
  wings are 65% grey, so they need a dark ground (5.7:1 on #111). **Never** on a photo, the accent, the poster paper or any light
  ground: there the wings vanish (1.2:1 on #f5f5f5). If an era has a light `bg`, that era ships its own `mark` or none.
- **Never:** recolor, tint, duotone, outline, add glow or motion, stretch, crop for layout (the favicon crop is the one
  exception), or set type in chrome to match it.
- **Credit:** CREDITS.md says the logo is Gabe's or Dave Bahm's. Ask Gabe which, for the About page credits.

### 3b. Photos (Gabe's; treatments per slot, 2026-11-05, D34)
**Privacy rule (hard): No identifiable audience member on the site, ever; crops keep only Gabe, the stage and backs of heads
(privacy, 2026-11-05).** Above all no minors: the child in Kealey's frame sits under the cross (source x 3060-3300, y 2780-3120).
So the whole Kealey frame and the Paslier still (two fans' faces) are **never used**, in any size, on any page; the prototype's
`live-kealey-*` and `live-paslier-753` files are deleted and `prototype/tools/resize.mjs` no longer makes them. A new photo gets
a crop rectangle in the Desktop's `tools/photo/run.mjs` that leaves out every face but Gabe's (or a bandmate's) before it ships.

Every photo is one of the owner-approved **treatments** (`docs/research/photo-art-direction.md`), made by the Desktop's
`tools/photo/run.mjs` from Gabe's originals (sharp, no metadata, seeded, no AI) into `docs/review/photo-treatments/`, and
copied as they are. The treatment is the grade, so **no CSS duotone on top**: the `<img>` carries `class="graded"` (`filter:
none`), not `duo`. The SVG duotone (`.duo`, section 3) stays only for a future untreated live photo; none is on Home. One
process per slot, so the page isn't a filter sampler. `alt=""`: they sit behind or beside his name. Era swap = one re-run of
`run.mjs --era` (the files bake in the era colors; the prototype's other two eras still show the placeholder renders).

| Slot | Treatment | Files (served by width) | Crop / CSS | Faces in frame |
|---|---|---|---|---|
| **Hero A** (default under 900px, D34; `?hero=a` everywhere) | **(a) era grade** | `a-era-grade-phone-800` (800x1000) under 900px; `a-era-grade-800` / `-1600` (3:2) only for `?hero=a` from 900px | Under 900px pinned by width and lifted so his eyes sit in the open strip above the name (section 5, the exact CSS in section 11) | Gabe; one back of a head at the bottom edge |
| **Hero B** (default from 900px, D34; `?hero=b` everywhere) | **(b) two-colour riso** | `b-riso-600` / `-1000` (`sizes="37vw"`, the slot is ~470px at 1280, so the 600 file at 0.78x) | `object-fit: cover; object-position: 50% 30%` (same 1.42 aspect as the slot) | Gabe; the same back of a head |
| Hero B's slot under 900px (`?hero=b` only) | **(f)** MCCC still, two inks on black | `f-mccc-240` / `-478` (`sizes="34vw"`, slot ~132px square at 390) | `44% 20%` | Gabe only (stage) |
| **Live It Loud poster** (the first booked `show`) | **(c) gig-poster cut**, torn foot | `c-poster-600` / `-1000` (600x750 alpha; `sizes="(min-width: 640px) 23rem, 50vw"`) | Square, `object-position: 50% 63%` (source rows ~95-695: above his head to under the tear), `mix-blend-mode: darken` (section 5) | Gabe; a back of a head as a solid silhouette |
| **Push Past Fear** (Home and About) | **(d) crowd tritone** | `d-crowd-phone-800` (800x371) under 753px; `d-crowd-800` / `-1600` from 753px | Under 753px `object-position: 8% 50%` (the box is taller than the file, so it loses the sides: keep Gabe, left); from 753px `50% 50%` | Gabe, the pallet cross, backs of heads only (crop stops at source y 2440) |
| **About, contact strip** (spec, section 6) | **(e) contact strip, B&W** | `e-contact-1600` (1600x339), `-phone-800` (two strips of two). **Must be regenerated first** (below); don't use the current files anywhere | As made, full column width | After the swap: Gabe, the cross, the mic stand or his shirt cross, the kit |

**Halftones (b, c, f) and moire:** each file is screened at its own size; never show one below ~0.6x of its file on a 2x+ screen.
`sizes` matches the slot, so the browser picks the file nearest it (riso 0.78x at 1280; poster 0.63x on a 2x phone at 390,
0.95x at 3x, 0.64x at 1280). Never stretch them full-bleed beyond their file.

**Exception to "one color world" (owner-approved treatments, 2026-11-05):** About's contact strip (e) is **black and white**, not
duotone and not era-graded; only its grease-pencil loop on frame 1 takes the era accent. It reads as the photographer's contact
sheet, so it stays B&W in every era.

**The video stills are never shown wider than their native size** (CREDITS.md); (f) files are at or below native.
Markup: `<picture>` with `media` sources, `srcset` with `w` descriptors, `width`/`height` set, the hero image
`fetchpriority="high"`, the rest `loading="lazy"`. **Hero by width (D34, `HERO = 'ab'`):** both heroes are in the page; each
`<picture>` serves a 1x1 data GIF (`data:image/gif;base64,R0lGODlhAQABAAAAACw=`, CSP `img-src data:` allows it) at the widths
where it is hidden, so **exactly one hero photo downloads** (measured, CHECK 2b: 320, 390, 800, 899 fetch only
`a-era-grade-phone-800`; 900 and 1280 only `b-riso-600`). Hero A's `<img>` fallback is the phone file itself, not the 3:2 one: in
Chrome's device emulation the preload scanner once fetched the `<img>` fallback (`a-era-grade-1600`) at 320 as well, and with the
phone file as fallback a slip like that can only fetch the file the phone needs anyway.

**Photo credits** go in the footer of every page, under the slogan, muted 16px, listing only the photos that page shows, in
CREDITS.md's wording: "Photo: Alexander Kealey." (every treatment above but (f) is his photo) and "Video: Montgomery County
Community College, MSP program group." only where (f) appears (`?hero=b` under 900px; never in the D34 default). Paslier's
credit goes with his still, which is no longer used. The About page repeats the full list with the photos.
- **Grain:** `era.texture` tiled on bands, footer and poster; still, never animated. If `texture` is null, use the site default
  `grain.png` (128px tile, 15 KB).

### 3c. IDENTITY guess era (2026-11-05): **a guess, not Gabe's colors**
Prototype only: `?era=identity-guess` (in `prototype/data.js`, **not** in `src/eras/`). It lets the owner see the site in
IDENTITY's light before Gabe's real art and colors arrive (about Nov 30); then this era is deleted, not promoted. In this era the
hero chip reads "IDENTITY colors: our guess from the smart-link art" and the footer note says the same.

**Source:** the og:image of `https://wingsmusic.lnk.to/IDENTITY` (Linkfire `artwork-600x315.jpg` and `-440x440.jpg`, read only,
kept out of the repo). Gabe's face and shoulders in deep blue light, a violet-magenta glow top right, white IDENTITY type, Logo D
under it. Dominant colors (k-means, 8 clusters, 440px square): black `#000001` 27%, indigo `#040243` 21%, `#090359` 17%,
ultramarine `#18078d` 10%, violet `#3b07ba` 10%, near-black blue `#02041c` 8%, the glow `#8312c8` 5%, the type `#dfdbed` /
`#f6f6f6` 2%. Hues 240-255 hold about 55% of the picture.

| Role | Value | From the art |
|---|---|---|
| `bg` | `#08044a` | The indigo field (between `#040243` and `#090359`). Luminance 0.0063: dark enough for Logo D (D25) |
| `text` | `#f6f5ff` | The white IDENTITY type, a touch cool |
| `accent` | `#a866ff` | The violet glow (`#8312c8`, hue 277, and `#3b07ba`, hue 258), lifted to hue 266 and lightened until it passes 3:1 on `bg` (the art's own violets reach only 1.7 to 2.6:1) |
| `accent-text` | `#08044a` | `bg`, as in every era |
| `muted` | `#bab6e6` | Lavender grey, between the type and the field |
| `bg-2` (derived) | `#191557` | `text` 7% into `bg` |
| `line` (derived) | `#464379` | `text` 26% into `bg` |
| Duotone dark / light (derived) | `#08044a` / `#9359e7` | `bg`; the ceiling stops at 87% toward `accent` (peak 4.01:1 against `text`) |

No new roles, ceiling rule unchanged, covers and Dave Bahm's art never tinted. **Contrast** (same maths as `app.js`, mark
composited from `mark-identity-300.webp`): text/bg 17.24, text/bg-2 15.14, muted/bg 9.69, muted/bg-2 8.51, muted on the player
box 5.40; **Listen** (accent-text on accent) 5.33, Listen's fill against the page (accent/bg) 5.33, on bg-2 4.68; **Now tag, tabs, poster
ink on paper** (bg on text, no accent involved) 17.24; **poster Tickets**: label 5.33, fill against the paper 3.23 (and its 3px
`bg` border 17.24); duotone peak 4.01 against text. **Logo D wings** (65% grey): on bg median 5.48:1 (darkest tenth 4.42), on
bg-2 5.19 (4.24), against 5.68 / 5.24 on the placeholder era; bg against black 1.13 (the D25 test allows 1.5). All pass the
era-file test (`test/eras.test.js` rules) and `prototype/check.mjs` (section 12).

**How it looks (my read of `prototype/shots/hero-pick-identity-guess.png`):** energetic, not muddy, and close to the art. The
indigo ground, white type and violet buttons read as IDENTITY at a glance, and it feels cooler and more "night" than the
red-orange placeholder. **Hero B is the stronger hero in this light:** indigo page, violet photo in the slot, white name: it is
nearly the cover. **Hero A goes flat:** the Kealey photo is high-key, so most of it lands near the capped peak, and violet at
that luminance (0.19) looks lighter and more pastel than red-orange did. Add the violet glow over it and the hero becomes a
lavender-violet field with his face as a ghost at the top. The text still passes (5.33:1), and it isn't muddy, but A has
less depth here than in the placeholder era, where the photo still read as a photo. A darker accent wouldn't help: the ceiling,
not the hue, sets the peak's lightness. If Gabe's real colors are also blue-violet, that's a point for B. A print-style two-colour
treatment (the Desktop's `docs/review/photo-treatments/`) with harder blacks would fix A's flatness better than the smooth
duotone. **Spotify's embed is always dark-themed** (`theme=0`, Spotify's dark grey) in every era (D35, amends D19). The
cover-derived colour follows Gabe's playlist cover, not the era, so it can clash with any palette; the dark theme sits on every
era's dark `bg`.

## 4. Field names (shared with the Desktop: keep this section in step with `src/`)
> **Single source for these names.** They match `src/lib/shows.js`, `src/eras/placeholder.json` and `src/data/shows.json` at
> 7a2e937. Release and IDENTITY fields below are agreed (D18) but not in `src/` yet.

**Era file** (`src/eras/<slug>.json`), matches D12:
| Field | Type | Use |
|---|---|---|
| `name` | string | Internal era name |
| `colors.bg` | #rrggbb | Page ground, duotone shadow |
| `colors.text` | #rrggbb | Main text, poster paper |
| `colors.accent` | #rrggbb | The one strong color (about a tenth of a screen) |
| `colors.accent-text` | #rrggbb | Text on accent |
| `colors.muted` | #rrggbb | Secondary text |
| `art` | path | Cover art, shown as made |
| `texture` | path or null | Still grain tile; null uses the site default |
| `word` | string | Era word, used in Join and on Music. Real era: `IDENTITY` |
| `mark` | path or null | **New 2026-11-05 (amends D12, boss ruling).** The era's logo mark, transparent PNG/WebP, shown as made (section 3a). IDENTITY: Logo D. Null: no mark anywhere, the brand word stands alone. Never replaces the word |

No extra color role is needed. The font is not in this file (D12).

**"From Gabe" quote** (D21, optional, one per band, on the band's own data; Home bands: `rise`, `live`, `now`; never `push`):
| Field | Type | Rule |
|---|---|---|
| `quote.text` | string | Required if `quote` is set. His exact words, at most 120 characters, from a post `social-content.md` marks as his own. Rendered escaped, never as HTML |
| `quote.url` | http(s) URL | Required. The post the words come from. The credit links here |
| `quote.date` | `YYYY-MM` or `YYYY-MM-DD` | Required. Shown as "Mar 2026" |
| `quote.platform` | string | Required. `Instagram`, `Threads`, `X`, `YouTube` and so on, as shown in the credit |

No `quote`, or any field missing or invalid, means nothing shows (no empty box). Gabe approves each one via the owner (D21).

**Show row** (`src/data/shows.json`):
| Field | Type | Rule |
|---|---|---|
| `date` | `YYYY-MM-DD` | Required |
| `time` | `HH:MM` 24h | Optional |
| `type` | `show` or `open-mic` | Required |
| `venue` | string | Required |
| `city` | string | Required |
| `link` | http(s) URL | Optional. `show` -> **Tickets**, `open-mic` -> **Details**, no link -> no button |
| `with` | string | Optional, renders "With Fran Carroll". Shown on the poster and the Shows page. |

**Release** (agreed, D18): `title`, `date`, `cover` (path, as made), `link` (smart link,
http(s)), `soundcloud` (optional), `type` (`single`, `ep`, `album`). Home's card uses the newest by `date`.

**IDENTITY block** (agreed, D18; not the era file): a release date and a pre-save link, both optional. The build reads them from
the IDENTITY row in `src/data/releases.json` (`date` 2027-08-13 from Gabe's own post, `link`), which serves the same purpose as
`releaseDate` / `presaveLink`. With no date, the state in section 7 applies. `tracks` waits on Gabe's answers (D10).

## 5. Home, top to bottom
Target about 5 phone screens. All heights below are measured at 390px.

**Header.** Fixed. See-through over the hero, `bg` with a 2px `--line` once scrolled (IntersectionObserver on a sentinel, as in
Riverside `Header.astro`). Brand left: the era `mark` at 30px tall, then "GLUCAK" in the display face (the wordmark; locked,
section 2), one link: `<a class="brand"><img class="mark mark-head" alt=""><span class="brand-word">GLUCAK</span></a>`. With no
`mark`, the word alone. On Home the brand stays hidden while the header is see-through over the hero, so the name never appears twice
and the mark never sits on the photo; it shows once the header is solid, and on every other page (with no JS it always shows). From
900px: nav **Music, Shows, About**, then a **Listen** button. Under 900px: **Menu** only; the bar carries Listen. `<details>` sheet
with focus moved in, Escape and link tap close it. Shop slot: one nav entry, off by a switch.

**0. Hero: A under 900px, B from 900px (D34; `html[data-hero='ab']`, the default).** Not full height. `?hero=a` / `?hero=b`
force one layout at every width (prototype test switches; the build's `HERO` constant). Holds, in order:
- `<h1 aria-label="GLucak">`, letters aria-hidden.
- **A:** GLUCAK fitted to full width over a full-bleed photo, treatment (a). **B:** G[photo]LUCAK: flex row,
  `--fs: calc(100cqi / (w-name + k + .1))`; slot width `fs × k`, height `fs × 1.56`, standing above the letters. `k` is 1.18 on phones,
  1.9 from 900px (slot height 1.34). No photo behind B. In `ab`, the slot is `display: none` under 900px and `.hero-photo` is
  `display: none` from 900px.
- **Photos (section 3b):** A uses (a)'s portrait file under 900px, **his face in the open strip above the name** (tuned
  2026-11-05; a plain cover crop hid it behind GLUCAK): the strip is `--strip` = header + 1.75rem (88px) on phones, header + 11vw
  from 700 to 899px; A gets `padding-top: var(--strip)`; the photo is pinned by width and lifted so his eyes land 2.625rem above
  the strip's end (46px on every phone, 106px at 800). Hair, glasses and eyes show; mouth and mic meet the top of the letters.
  B's slot uses (b) riso from 900px ((f) under 900px with `?hero=b`). Scrim as in section 3.
- Slogan, exact text. Phones: two fitted lines, "Rise, Live It Loud," / "Push Past Fear, The Time Is Now." From 900px: one fitted line.
- **Listen** (solid) and **Shows** (outline), 52px tall. Listen goes to the player, Shows to `#shows`.
- **Now line:** "Now" tag + one link. See section 7. No ticker: it never moves. Release wording (copy, `docs/copy/home.md`):
  **"Out now: {title}"**, the title exactly as on Spotify (today "Out now: Duck, Dodge, Jump, Fight"; the artists line sits right below in RISE, D33),
  linked to that release's `link`. Long titles wrap to two lines inside the 48px line (measured: the player stays put).

**1. RISE, tab Music.** Phrase at 3.5rem on phones; huge in a left column from 900px. The official embed at exactly **352px**,
full column width, with its height reserved, always dark-themed (`theme=0`, D35). Under it: **Play full songs on Spotify** as a real button (2026-11-05):
`btn btn-line btn-small`, 48px tall, display face 1.25rem, full width under 700px, natural width beside the link from 700px. It's
the playlist link: logged-out fans, most of them in Instagram's in-app browser, get 30-second previews in the embed, and this is
the way to full songs, so it earns a button. Outline, not solid: the accent stays on Listen. Then **Listen everywhere**, a text
link. It sits below the player, so the player's position doesn't move. Then the latest release: cover 96px
(160px wide screens) as made, title, then the **artists line** when the release has more than one artist (D33): the release's
`artists` exactly as Spotify shows them ("GLucak, J-BOY"), body face, `muted`, no "feat."; a solo release has no line. Then
"Latest release. Listen on:", two links. The title is `--step-2` (not `--step-3`), `text-wrap: balance`, so long titles take two
lines at 390. The same artists line goes under each title in the Music page's release strip.
**Every platform** and **Listen everywhere** both go to that release's `link`. Then the optional **From Gabe** quote (below).

**From Gabe (D21), the one quote style, every band that has one.** After the band's main content, never above the player:
RISE under the latest release (from 900px in the left column under it); LIVE IT LOUD after All shows; THE TIME IS NOW after the
IDENTITY block; never in PUSH PAST FEAR. Markup:
`<figure class="quote"><p class="quote-tag">From Gabe</p><blockquote class="quote-text"><p>{text}</p></blockquote><figcaption class="quote-credit"><a href="{url}">GLucak, {platform}, {Mon YYYY}</a></figcaption></figure>`.
4px left rule in `text` (same weight as band edges), 1rem left padding, 1rem above (0.5rem after All shows), max 36rem wide.
**Compact (2026-11-05):** the tag (like the Now tag: `text` ground, `bg` letters, 16px, 700) floats into the quote's first line,
so it costs no line of its own. Quote in the reading face, 700, `--step-1`, line-height 1.3, inline, curly quotes added by CSS
(`::before`/`::after`), so `text` stays exactly his words. The credit runs inline after the last word (muted 16px, a 48px link,
0.4rem before it): a short quote and its credit share a line. Static: no rotation, no carousel, no fade of its own. No accent.
**Measured at 390:** R1 (86 characters) is 3 lines plus the credit line, 132px; L2 (22 characters) is 2 lines with the credit on the
second, 76px. At 320: 163px and 107px. LIVE IT LOUD's quote is not shown when no show is booked ("Hope to see you there!"
would point at nothing).

**2. LIVE IT LOUD, tab Shows.** One fitted line. Then next shows: **first show as the poster** + up to two rows. Poster: fitted date,
place, time and `with`, button, and **the art, treatment (c)** (2026-11-05): `<picture><img class="poster-art graded" alt=""
loading="lazy" width="600" height="750"></picture>`, first in the `li`, `picture { display: contents }`. Grid areas: phones (card
under 37rem) `'date date' 'place art' 'meta art' 'btn art'`, columns `minmax(0, 1fr) 55%`, rows `auto auto auto 1fr`: the date
across the top as before, the art a square on the right bled to the card's right and bottom edges (`margin: 0 -1rem -1rem 0`,
`width: calc(100% + 1rem)`, `aspect-ratio: 1`, `align-self: end`), so the torn edge is the poster's foot; Tickets bottom-left.
Card 37rem and up (container query on `ul.shows`): `'date art' 'place art' 'meta art' 'btn art'`, columns `minmax(0, 1fr) 23rem`,
art also bled to the top (`margin-top: -1rem`), place aligned to the bottom of its row. Art: `object-fit: cover; object-position:
50% 63%; mix-blend-mode: darken` (its paper, #f5f5f5, takes the card's paper and grain in every era; only ink and the tear
show). At 390 the art is 190px and the poster 291px tall (the text-only layout measures 177px, so +114px; a full-width art band cost 360px,
so it was rejected for phones). **Shows beside the video only from 72rem (1152px)** (was 900px): below that the shows column is
under 37rem and the art would stack 500px tall. Rows: date, place, kind, button or nothing; 60px minimum. Poster rule: the first upcoming row with
`type: show` is the poster; if none in the three is a show, all rows, no poster. Then **All shows**, then the From Gabe quote
(L2, if approved), in the same column. Then **Latest video**, a 16:9
facade: no YouTube loads until tapped; the iframe uses `youtube-nocookie.com` (allowed by CSP); no JS means a plain link. From
1152px: shows left 7 columns, video right 5.

**3. PUSH PAST FEAR, tab About.** Lockup on two fitted lines (FEAR is the biggest word on the phone) over a full-bleed photo,
treatment (d), the crowd tritone (section 3b: Gabe, the cross, backs of heads); one line from 900px. Under it, **bio sentence 1
only, exact** (241 characters: "Despite facing various difficulties ... bring others to Christ."). **D23: his words go on the site
exact or not at all**, so there is no shortened or stitched second line on Home; the full bio, word for word, is on About. No
invented testimony; epilepsy appears only because his bio says it, and whether that sentence stays on Home is open for Gabe (D18).
**Patreon**, **About GLucak**. No "From Gabe" quote here (D21). The About tab stands on the band edge above the photo: `.push-head`
must not clip overflow (fixed 2026-11-05; the tab was clipped before, so check the build's port).

**4. THE TIME IS NOW, tab Join.** Lockup on two fitted lines. **Sign-up comes first:** "Get the next show and every new song first."
(proposal, Gabe reviews), one email field, **Join**. Then the **IDENTITY block**. From 900px the lockup takes the left 7 columns and the
form sits beside it, so the form is in view with the heading.

**IDENTITY block** (same classes as the build, `src/pages/index.astro`; the Music page uses it too):
```html
<div class="identity-state">
  <img class="mark mark-identity" alt="">               <!-- era mark, 40px tall, left of the word; omitted if mark is null -->
  <p class="identity">IDENTITY</p>                      <!-- display face, --step-3 -->
  <p class="identity-when"><time datetime="2027-08-13">August 13, 2027</time> &middot; 281 days to go</p>
  <a class="btn btn-line">Pre-save IDENTITY</a>
</div>
```
`.identity-state`: grid, `grid-template-columns: auto 1fr`, items centred in the row, start-aligned, gap 0.5rem by 0.75rem; mark and
word share row 1, everything else spans both columns (`grid-column: 1 / -1`). `.identity-when`: reading face 700, `--step-0`, `text` color, tabular figures.
The pre-save is `btn-line` (52px), 0.75rem above it (gap plus 0.25rem), never solid (the accent stays with Join in this band). The day count is
worked out once, New York time, at build or page load, and **never ticks**: no live counter, no seconds, no animation.
"1 day" singular. On release day and after: `<p class="identity-when">Out now. <a class="text-link">Listen</a></p>` and no
pre-save. No date: the mark and the word only. Gabe's own post settles the date, so the old "IDENTITY, 2027" line is retired.

**Footer (every page).** Closing line "Listen. Shows. Join." fitted, each word a link. Labelled links: Instagram, Threads, X,
YouTube, SoundCloud, Spotify, Patreon. Slogan. **Photo credits** for that page (`.credits`, muted 16px, section 3b). **Motion on/off**. Automatic year. Privacy. On pages other than Home, add the
sign-up above the links. The prototype's note about placeholders is removed.

**Phone bar (under 700px, every page, D8).** Always visible: never hides on scroll, so **delete Riverside's hide script**. Listen,
Shows, Watch, Join; icon plus 16px label, 60px tall plus safe area. Shop replaces Watch when the shop opens. Body gets
`padding-bottom: var(--bar-h)`, and `scroll-padding` clears both header and bar. Set `aria-current` on subpages.

## 6. Other launch pages
Same header, footer, bar, tokens and tabs. Each page opens with its one fitted phrase, tab above.
- **Music** (tab Music, RISE): the player; releases as a cover strip with listen links; the IDENTITY block, `era.word` as a fitted line
  with tracks filling in toward Scenic Route as the larger last row (slots and titles wait on Gabe, D10); SoundCloud.
- **Shows** (tab Shows, LIVE IT LOUD): table of Date, Venue, City, Tickets; on phones, stacked rows; `with` under the venue. **Played** list.
  Booking email. Empty state as in section 7.
- **About** (tab About, PUSH PAST FEAR): full bio word for word (D23: exact or not at all), photos, Patreon, socials, booking
  email, and the photo credits list (every photographer and video source on the site, plus the logo credit once Gabe says whose it is).
  Not prototyped (Home only); the build follows this:
  - **Top:** the PUSH PAST FEAR band with treatment (d), exactly as on Home (`PushPhoto`, section 3b).
  - **The photos: treatment (e), the contact strip (D34),** after the full bio, before Patreon and socials. Full column width
    (max `--container`), `alt="Four frames from one photo by Alexander Kealey: Gabe singing, the cross of pallets, the mic stand,
    the drum kit"`, `loading="lazy"`, `class="graded"` (no duotone). From 700px `e-contact-1600` (one strip of four, 1600x339,
    `sizes="(min-width: 90rem) 90rem, 100vw"`); under 700px `e-contact-phone-800` (two strips of two, 800x674). Frames are about
    190 CSS px wide on a phone: fine for a contact sheet, so no tap-to-zoom. Static: no hover, no motion.
  - **The HANDS frame (frame 3) is REPLACED before this ships.** It is an audience close-up (raised hands, right beside the
    child under the cross), which breaks the privacy rule (section 3b). **The Desktop's `tools/photo/run.mjs` must regenerate
    `e-contact-1600` and `e-contact-phone-800` with frame 3 swapped:** replace
    `['HANDS', { left: 1820, top: 2600, width: 1200, height: 800 }]` with
    `['MIC', { left: 2050, top: 1750, width: 1050, height: 700 }]` (source pixels of `live-alexander-kealey.jpg`, 6000x4000;
    3:2 like the others): the empty mic stand against the white panel, the pallets to its right, a sliver of Gabe's elbow at the
    left edge, **no audience** (checked on the original: the nearest back of a head ends at x 1977; the child is at y 2780+). If
    the owner prefers his shirt cross: `['SHIRT', { left: 1560, top: 1880, width: 450, height: 300 }]` (checked: only his shirt,
    the cross and his hand; it stops above the back of a head at y 2240), but it is soft (450px of source for a ~380px frame)
    and repeats frame 1, so MIC is the pick. The edge print keeps
    "DSC 0832 · PHOTO ALEXANDER KEALEY", the frame label reads MIC. **Don't use the current `e-contact-*` files anywhere**, not
    in a preview either.
  - **B&W, the one exception to the era colors (owner-approved treatments, 2026-11-05; section 3b):** the strip is black and
    white in every era; only the grease-pencil loop on frame 1 takes the era accent. It sits on `bg` with no scrim and no text
    over it.
  - Under it, `a-era-grade-clear-1200` (the unprinted (a), no text over it) may follow as the big photo once the Desktop
    confirms its crop: same frame as hero A, Gabe plus one back of a head, so it passes the rule.
- **From Gabe on other pages:** the same style and rules as Home (section 5), at most one per band, after the band's main content.
- **Privacy:** plain text page, footer link only. Covers email sign-up and the Spotify embed.
- **Hidden shop slot:** one nav entry and a link to the Fourthwall store, off by a switch. No shop page in phase 3.

## 7. States
| Case | Shows |
|---|---|
| **No upcoming shows** | Heading stays. "No shows booked right now" in display type, **Follow** (Instagram), **Request a show** (mailto, needs the booking email), then **Played** rows if any. Latest video stays. The LIVE IT LOUD quote is not shown. Never a blank section. |
| **No past shows either** | Omit Played. |
| **No ticket link** | No button, ever. No disabled button, no "TBA". |
| **Open mic** | Row with kind "Open mic"; Details if linked. Never the poster. |
| **Show today** | Stays upcoming through the whole New York day (`splitShows`). |
| **Now line** | Next upcoming row of either type if within 14 days (D18), labelled by its type: "Next show: Venue, City" or "Next open mic: Venue, City", linked to `#shows`. Otherwise the newest release. (Most of his gigs are open mics; the label keeps it honest.) |
| **No IDENTITY date** | Mark and "IDENTITY" only. No countdown, no pre-save, nothing broken-looking. (The date is now known, 2027-08-13 from Gabe's own post, so this is the fallback only.) Prototype: `?identity=none`. |
| **Date set** | "August 13, 2027 · 281 days to go", static per page load (no ticking digits, so no motion), plus **Pre-save IDENTITY** if linked. Section 5. |
| **Release day** | Flips to "Out now. Listen" by date, New York time; the pre-save goes. Prototype: `?identity=out`. |
| **No quote** | Nothing: no "From Gabe" box, no empty space (D21). |
| **No era mark** | The brand word alone in the header; nothing above IDENTITY. |
| **No playlist link** | Launch blocker. Never ship the empty box. |
| **Embed blocked or slow** | Box keeps 352px. A note under the iframe, seen only while it loads or if it's blocked: "Loading the Spotify player. If it doesn't appear, use Play full songs on Spotify below." No layout jump. |
| **No JS** | Page reads fully: no motion, headings visible, facade is a link, server-rendered shows. |
| **Sign-up** | Success: "You're on the list." Bad email: "Enter an email like name@example.com." Server down: "That didn't go through. Try again." All in `role="status"`. |
| **Link not known yet** | Build fails rather than ships `#`. In the prototype these are dashed links. |

## 8. Motion (hard rule)
Exactly two motions exist on Home.
1. **Glow:** one layer behind hero and player, a radial gradient painted once and moved only by `transform` and `opacity`: 24s,
   ease-in-out, alternate, opacity .68 to .88, shift about 12% of its width. Stops when hero + Rise no longer fill the bottom of the
   screen (IntersectionObserver), so it is never a second moving thing beside a heading fade.
2. **Heading fade:** LIVE IT LOUD, PUSH PAST FEAR, THE TIME IS NOW fade in once, opacity only, 0.6s, the first time they reach the
   screen. No slide. RISE doesn't fade: the glow already owns that screen.

Banned: flashing, strobe, glitch, distortion, video in the hero, tickers, carousels, parallax, pinned scroll, smooth-scroll hijacking,
hover animation on cards, any animation on `background`, `filter` or layout. A clip added later must pass a frame-level flash check first (D14).

**Spotify's embed** scrolls a long playlist title inside its cross-origin iframe. It stops under the device's reduce-motion setting
(checked 2026-11-05 with `--force-prefers-reduced-motion`); our footer Motion switch can't reach it. Accepted: small, no luminance
change, and the device setting stops it (D19).

**Off switches, both required.** CSS motion is only declared inside `@media (prefers-reduced-motion: no-preference)` **and** under
`html[data-motion='on']`, so with no JS or either switch off, nothing runs. `boot.js` sets `data-motion` before paint. Footer button:
"Motion: on / off", remembered in `localStorage` in a try/catch. Under the device setting it reads "Motion: off (device setting)" and is disabled.

## 9. Accessibility floor
Text 4.5:1. Large text and controls 3:1. Targets 48px minimum. Nothing under 16px on phones. Tabs 16px or more, exact nav word, real
content right under the heading (D6). Tab and phrase share one `<h2>`: `<span class="tab">Shows</span> <span class="phrase">Live It Loud</span>`,
so screen readers and find-in-page get both. 3px focus ring in `text`. Skip link. No autoplay sound.

## 10. Gabe's edit screen
One simple form page per thing, large fields, plain words, phone friendly. Built on Riverside's admin pattern; every field escaped on
output, http(s) links only, with the `<script>` and `' OR 1=1 --` tests.
- **Shows:** list with Add, Edit, Delete. Fields: Date (date picker), Time (optional), Type (Show / Open mic), Venue, City, Link (optional, hint:
  "Tickets or details page"), With (optional). Save shows the row as fans will see it. Past shows move to Played by themselves.
- **Releases:** Title, Date, Cover (upload, shown as made, square), Smart link, SoundCloud link (optional), Type.
- **Links:** Spotify playlist, YouTube channel, Patreon, socials, booking email.
- **Bio:** About text and the Home short version.
- **IDENTITY:** Release date, Pre-save link.
- **Not on this screen** (a reviewed change): era file, fonts, layout.

## 11. Speed and porting notes for the coder
- **Copy into `public/media` (L1):** `c-poster-600`, `f-mccc-240` and `f-mccc-478` (only `c-poster-1000` is there now). Copy the
  poster block (`.shows` container, `.poster*`, `@container (min-width: 37rem)`) from `prototype/styles.css` word for word;
  don't rebuild it from the prose in section 5.
- Prototype first load (2026-11-05, uncompressed): HTML 15 KB, CSS 32 KB, JS 13 KB (app 10, boot 1, data 2), fonts 48 KB, grain 15 KB,
  mark 5 KB, favicon 2 KB = **130 KB before photos**. **Photos (D34 default, exactly one hero photo per width, the prototype
  too):** under 900px `a-era-grade-phone-800` 29 KB (one file at every density); from 900px `b-riso-600` 25 KB (1x) or
  `b-riso-1000` 64 KB (2x). Lazy, below the fold: poster art `c-poster-600` 16 KB / `-1000` 38 KB; Push Past Fear
  `d-crowd-phone-800` 19 KB on a phone, `d-crowd-800` 12 KB / `-1600` 42 KB wider. **A phone loads about 160 KB before Spotify
  (was about 200 KB on 3x).** One live iframe (Spotify); YouTube behind the facade. Photos are the Desktop's treatment files
  (`tools/photo/run.mjs`, sharp, no metadata), copied as they are; `prototype/tools/resize.mjs` now makes only Logo D and icons.
- **Port of L1 for D4 (2026-11-05), exact values from `prototype/styles.css`:**
  - Hero A under 900px (replaces the src rule `@media (max-width: 699px) { html[data-hero='a'] .hero-inner, html[data-hero='ab']
    .hero-inner { padding-top: calc(var(--header-h) + 1.75rem); } }`, which now runs to 899px with a width-scaled strip):
    ```css
    @media (max-width: 899px) {
      :root { --strip: calc(var(--header-h) + 1.75rem); }
      html:not([data-hero='b']) .hero-inner { padding-top: var(--strip); }
      .hero-photo img {
        position: absolute; left: 0; top: 0; height: auto; margin-top: calc(var(--strip) - 2.625rem - 41.875%);
        -webkit-mask-image: linear-gradient(to bottom, #000 78%, transparent); mask-image: linear-gradient(to bottom, #000 78%, transparent);
      }
      .hero-photo::after {
        background:
          radial-gradient(ellipse 62% 130px at 100% 0, color-mix(in srgb, var(--bg) 55%, transparent), transparent),
          radial-gradient(ellipse 40% 110px at 0 0, color-mix(in srgb, var(--bg) 45%, transparent), transparent),
          linear-gradient(to bottom, transparent calc(var(--strip) - 1.5rem), color-mix(in srgb, var(--bg) 30%, transparent) calc(var(--strip) + 2.5rem)),
          linear-gradient(to bottom, transparent 42%, color-mix(in srgb, var(--bg) 80%, transparent) 70%, var(--bg));
      }
    }
    @media (min-width: 700px) and (max-width: 899px) { :root { --strip: calc(var(--header-h) + 11vw); } }
    ```
    The `.hero-photo::after` override must come after the base `::after` rule. `41.875%` = his glasses at y 335 of the 800px-wide
    file; margin-top % resolves against the width, so it holds at every width. If `run.mjs` re-crops (a)'s phone file, re-measure
    that one number.
  - Hero A markup in `ab`: the phone file serves every width under 900px and is the `<img>` fallback itself:
    `<source media="(min-width: 900px)" srcset="{GIF}"><img class="graded" src="/media/a-era-grade-phone-800.webp" width="800"
    height="1000" alt="" fetchpriority="high">` (drop the `(max-width: 699px)` source and the 3:2 `srcset` in `ab`; keep them for
    `HERO = 'a'`, where from 900px the 3:2 file takes `object-position: 50% 30%`).
  - Push Past Fear: `.push-photo { object-position: 8% 50%; } @media (min-width: 753px) { .push-photo { object-position: 50% 50%; } }`
    (src has `50% 50%` at every width, which cuts Gabe off the left on phones).
  - Poster art: section 5, item 2 (markup, grid areas, `.shows { container-type: inline-size }`, `@container (min-width: 37rem)`),
    `sizes="(min-width: 640px) 23rem, 50vw"`, and the shows/video split moving from 900px to 72rem. `src/lib/shows.js` prints the art
    in the poster `li` only (rows never get it).
  - Credits: the MCCC credit only with `HERO = 'b'` under 900px; Paslier's credit goes (his still isn't used).
- **CSP:** the prototype ran clean under the exact `server.js` CSP. **No inline scripts:** Riverside's `is:inline` scripts in `Header` and
  `MobileBar` won't run under `script-src 'self'`; move them to external files. `boot.js` must load blocking in `<head>`.
- **`filter: url(#duo)`** needs the SVG in the same document: print it in `Base` layout.
- **Sign-up form** posts to our own server (`form-action 'self'`), `POST /api/signup` (D18); **the server calls Kit**, the browser
  never does. Include the injection tests and rate limiting.
- **`src/lib/shows.js` changes needed (Desktop's file):** poster plus rows markup with the classes in `prototype/styles.css`; empty state
  from section 7 instead of "No upcoming shows yet."; "Played" instead of "Past shows".
- **Reuse:** `Header` (overlay, sheet), `MobileBar` (without the hide script), `Facade` (without the hover zoom and the sendBeacon, unless stats
  are wanted), token structure. **Don't reuse:** serif and gold, pills, shadows, rounded cards, hero video.

## 12. Measured (2026-11-05, Gabe's real photos; Chrome headless over DevTools, `Emulation.setDeviceMetricsOverride`, so 320 and 390 are true widths)
| Check | Result |
|---|---|
| **L1, treatments + hero by width (D34), re-run 2026-11-05 with `?hero=ab` added to every loop** | Player at 390x660: ab / a **90px visible**, b 80 (unchanged). No sideways scroll at 320, 390, 1280 for ab, a, b. **One hero photo per width (CHECK 2b):** 320, 390, 800, 899 fetch only `a-era-grade-phone-800`; 900 and 1280 only `b-riso-600`. **His face in the strip (A):** eyes at y 46 on phones (name starts at 88; hair top -4 at 390, chin 102), y 106 at 800 (name at 148). **Text over (a), lifted, with the phone veil:** at 390: name **4.65**, slogan **6.18**, brand 3.93 (need 3); Menu **6.82**, Now **14.18** (need 4.5). Second era 4.60 / 5.93 / 3.90 / 6.69 / 11.80; IDENTITY guess 4.76 / 6.43 / 3.95 / 6.94 / 13.86. At 320: 4.72 / 6.02 / 3.94 / 6.35 / 14.29 (second era 4.65 / 5.86, guess 4.83 / 5.81, Menu 6.26-6.48, Now 11.82-14.29). At 800x1024: 3.97 / 8.65 / 4.26 / 7.80 / 13.50. Without the veil the name was 3.07. PUSH PAST FEAR over (d): **5.39:1**. Tap targets 36, none under 48px (Tickets beside the art included). Solid pairs unchanged (lowest 5.33, IDENTITY guess). Reduced motion: no animations. Flash: 86 / 87 / 94 frames, largest change 0.0001. CSP and errors: none; opens from disk. **Home height at 390x660: ab 3938px = 5.80 screens without the note** (was 5.61): the poster art adds 114px (poster 177 to 291px). Cap 5.8 (D39) |
| Player top at 390x660, clear of the bar (before L1) | A: top 508, bar 598, **90px visible** (was 114; A gave 24px to the strip for his face). B: top 518, **80px visible** (unchanged). Holds with the real Now line "Out now: Duck, Dodge, Jump, Fight (feat. J-BOY)", which wraps to two lines inside its 48px. Box 352px, the real embed |
| Slogan and GLUCAK, no horizontal scroll | scrollWidth equals viewport at 320, 390, 1280 on both heroes. Slogan is two forced lines at 320: 41px and 21.6px |
| D6 labels at 390 | 17px, weight 700, 17.3:1, exact nav word. All four tabs show (About was clipped by `.push-head` before; fixed) |
| Text over the **real** photos, from pixels (99.5th percentile background, text hidden) (before L1) | A: name **5.39:1**, slogan **6.19:1** (need 3), Menu **10.84:1**, Now **13.63:1** (need 4.5; the real two-line Now line). B: name 16.85, slogan 15.90, Menu 17.32, Now 14.06. A on the second era: name 5.34, slogan 5.95, Menu 10.35, Now 11.37. PUSH PAST FEAR heading over the Paslier still: 7.68:1 |
| Tap targets, text size | 36 targets, none under 48px (Spotify button 48px, both quote credits 48px). Smallest text 16px. No sideways scroll at 320, 390, 1280 with the long title and quotes |
| Solid pairs, both eras | Lowest 5.71:1 |
| **IDENTITY guess era** (`?era=identity-guess`, section 3c; **a guess, not Gabe's colors**) | Text over the real photo, hero A at 390x660: name **5.33:1**, slogan **6.10**, brand 6.23 (need 3); Menu **10.53**, Now **13.43** (need 4.5). Solid pairs (CHECK 3e): lowest solid button (Listen) 5.33, Tickets on poster 5.33, muted on footer 8.49. Tabs and Now tag 17.24. Logo D wings on bg 5.48:1, on bg-2 5.19:1. Duotone peak `#9359e7`, 4.01:1 against text. All other checks unchanged (same layout). Sheet: `prototype/shots/hero-pick-identity-guess.png` (`node prototype/tools/hero-pick.mjs --era identity-guess`) |
| Home height at 390x660 | **A 3812px = 5.61 without the prototype note after D33's artists line** (3px over the cap 5.6; accepted, since the collaborator credit is never dropped; the built site measures 5.25). Before D33: A 3795px = 5.75 screens, 5.58 without the note (cap 5.6, boss 2026-11-05). B 5.84 / 5.67. Empty shows 5.60 / 5.43. With both real quotes (R1, L2), the real release title and Now line. Committed baseline was 5.21 / 5.07 (2026-11-03 report; the 5.13 in the old table was an earlier run). What added height: the IDENTITY block (date, pre-save, mark beside the word), both quotes (132 and 76px, compact style), the Spotify button and the footer credits; what took it back: D23 (mission line gone), the mark beside IDENTITY instead of above (about 60px), the compact quote (tag in the first line, credit inline) |
| Reduced motion | Emulated with `Emulation.setEmulatedMedia`: `document.getAnimations()` empty, headings visible. Footer switch: also empty. The IDENTITY count is text, not motion |
| Flash | **By construction:** the only loop is one 24s opacity and transform drift (opacity .68 to .88), so it cannot reach 3 flashes a second. Supporting sample only, too slow to detect a 3 Hz flash on its own: 87 and 95 frames over 26s, largest change in mean luminance 0.0001 against WCAG's 0.10, on both heroes with the real photos. Most moving things on screen at once, brisk scroll: 1 |
| CSP and errors | None under the real CSP (WebP served as `image/webp`). Also opens from disk |
| Real Spotify embed (CHECK 1b) | Loads logged out under the real CSP at 390 and 1280, no errors, 137 and 107 colors painted. Spotify's "Preview" badge shows (30-second previews). Title marquee stops under the device reduce-motion setting |
| Photo files | The treatment files carry no EXIF, ICC or XMP (sharp writes none; `photo-art-direction.md`). Rows above marked "before L1" were measured on the old whole-frame and Paslier files, now deleted |
| **Faces, slot by slot (2026-11-05, every image the prototype uses, at 390 and 1280 in placeholder, placeholder-b and identity-guess; the files are the same in every era, only the page colors change)** | Hero A (a) phone file: Gabe, one back of a head at the bottom (masked into bg). Hero A (a) 3:2, `?hero=a` from 900px: Gabe, the same back of a head. Hero B (b) riso: Gabe, the same back of a head as a dot silhouette. (f) MCCC, `?hero=b` phones: Gabe on stage only. Poster (c): Gabe, the back of a head as a solid ink shape. Push Past Fear (d), all three sizes: Gabe, the pallet cross, three backs of heads, no profile. Spotify embed cover: Gabe only. **No identifiable audience face anywhere.** Not on the page: (e) contact strip (its HANDS frame fails; regenerate first, section 6) |

## 13. Not verified
- **The hero is decided (D34):** A under 900px, B from 900px; `prototype/shots/hero-pick.png` and `-identity-guess.png` now show the
  live default first, then A and B alone.
- **The treatments in other eras.** The files are the placeholder era's renders; `?era=placeholder-b` and `?era=identity-guess`
  show them unchanged (the riso stays red-orange on the violet page, (d) stays red). Real look per era needs `run.mjs --era` on
  Gabe's era file. Contrast over (a) was measured in all three eras, but on the same pixels.
- **The (e) contact strip** is spec only, and its files must be regenerated with the MIC frame (section 6) before anyone looks at
  it on a page.
- **Halftone moire on 1x screens.** On a 1x phone-sized window the poster art shows at 0.32x of its 600 file (190px); real phones
  are 2x+ (0.63x at 2x, 0.95x at 3x), and 320px 2x phones get 0.51x. A 400px poster file from `run.mjs` would cover those.
- **Hero A at 700-899px** uses the 800px phone file, so a 2x tablet (iPad portrait) upsamples it about 2x: soft. A
  `a-era-grade-phone-1600` from `run.mjs` (same crop) would fix it; add it as `1600w` in a `srcset` on the `<img>` fallback.
- **The duotone on IDENTITY's real colors.** All photo tests ran on the placeholder era (and the second one). The ceiling holds by
  construction in any era, but how dark the photos look depends on the real accent. **Partly tried on the IDENTITY guess era**
  (section 3c, blue-violet from the smart-link art): it passes, but it flattens hero A. Re-run on Gabe's real colors.
- **The IDENTITY guess era is a guess.** Its colors come from a 600x315 / 440x440 JPEG of the smart link's art, not from Gabe's
  files or his palette, and the accent was lifted to pass contrast, so it is brighter than any violet in the art. Never ship it
  or copy it to `src/eras/`.
- **Logo D at 16px** (browser tab) was seen only as a 32px PNG. A cross-only file from Gabe or Dave would be crisper.
- **The "From Gabe" quotes are real words but not yet approved** (R1 and L2, marked "Pending Gabe's OK" in the prototype; the chip
  never ships). Real wrap measured (section 5): R1, 86 characters, 3 lines plus credit at 390 (132px), 4 at 320 (163px); L2, 22
  characters, 2 lines with the credit inline at 390 (76px). Credits "GLucak, Instagram, Sep 2026" and "GLucak, YouTube, Sep 2026"
  link to the posts. Not checked in Safari (the floated tag and inline credit).
- **Safari and the Instagram in-app browser were not tested.** Only Chrome ran. Check `filter: url()`, `cqi`, `text-box`, `color-mix`,
  `mask-image` (hero A's fade; `-webkit-` prefixed too), `mix-blend-mode: darken` (poster art), container queries and the safe
  areas on a real iPhone.
- The Spotify embed ran only in headless Chrome, logged out. Logged-in playback, Safari, and Instagram's in-app browser (previews? does
  the playlist link open the app?) are part of the real-phone test.
- No PEAT run. The flash result rests on the code having one 24s loop, not on the 3.4 fps sample.
- Screen readers and a keyboard-only pass were not run. Hero B's slot is thumbnail-sized on phones, as D14 predicted.
- The Music, Shows and About pages, and the footer sign-up on them, are specified here, not prototyped.
