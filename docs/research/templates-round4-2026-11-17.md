# Templates round 4: what 2026 templates and standout artist sites do that our build does not (Researcher, 2026-11-17)

Read first, not repeated: `wix-templates.md`, `artist-sites.md`, `modern-references.md`, `design-round-2.md`,
`standouts-visual.md`, `next-ideas-2026-11-11.md`, DESIGN.md headings (1-26), laptop-plan "Not doing" (no more screen-one
micro-polish, no pulses / glows / shimmer, no dithering / ASCII, no paid references, no Bandsintown sync, no textures on
covers / logo / product photos / About h1).
Our site judged from `dist/` (index, music, shows, videos, about), `docs/review/ig6/after/home-390.png` (3735px tall) and
`shows-390.png`. Method: WebSearch + WebFetch text only (no browser, nothing logged in, nothing posted).
**Limits, said straight:** fetch returns text, not pixels, so layout claims below come from page copy and structure, not
sight. Failed or blocked: Solomun (Webflow page 404), davidkushnermusic.com and lolawilde.com (TLS error), blrmusic.com (403).
The 2026 "best template" roundups are affiliate lists with no new layout idea; no brand-new Wix / Squarespace music
template launch turned up (Squarespace's set is still Vandam, Kitui, Cruz, Jasonwild, Waverly, Sidney).

## 1. Sources and what each does (new only)

| Source (URL) | Concrete patterns | Ours? |
|---|---|---|
| Framer Music category https://www.framer.com/marketplace/templates/category/music/ (Nocturne Club, Noctra, DJLR, Nexlume, Volta Sunday free; Eterlody, REYNA "Agent", Nell Voss, Lathra, Signal Event paid) | Pitch is one line: "tour dates, releases, and streaming links". Per-template feature lists are not on the page. Free ones are club / DJ look. Nothing beyond round 2's Ravevora / Noxivolt read. | no new idea |
| Squarespace 7.1 (jpkdesignco roundup) | Home carries upcoming dates with venue + ticket link (Vandam, Kitui, Cruz); **Jasonwild names its fan list a club** ("Wild Club" in nav); Sidney = one page, streaming links in nav, **Pre-save** button. | Dates yes; named club no (Patreon is a plain link); Pre-save yes |
| Webflow lists (Singer 128, Band, Noize 128) | Names only; no layout detail. | n/a |
| David Kushner, Awwwards SOTD 21 Oct 2024 https://www.awwwards.com/sites/david-kushner | Tagged **"Page Preview & Seamless Transitions"** and "Asset Parallax Scrolling", big background images, two-colour palette (#93583B + #DBCDC1), type-led. Live site would not open for me, so the look of the transition is unseen. | Two-colour yes; transition: ours is a plain 200ms root cross-fade |
| TY1 https://ty1official.com (Awwwards music list) | Release as a **physical object** (vinyl render beside the cover, Side A / B, numbered 01-15 tracklist with thumbnails); "Listen now" row of **5 platform badges** onto one smart link; **free wallpaper download** as a low-friction offer; tabs by kind (DJ set / Production / Live). Also an enter gate + sound toggle (no). | Tracklist yes (3 rows in Spotify embed); platform row no; free download no |
| Openstate https://openstatemusic.com | Same short CTA ("JOIN THE FREQUENCY_") **repeated after most sections**, plus "GET NOTIFIED FIRST" for show announcements; numbered tracklist with durations; past shows as linked post cards. Sound toggle + parallax (no). | One sign-up near the bottom; same sentence on Home and Shows |
| Daddy Yankee https://daddyyankee.com (HM 25 Oct 2026) | Full-screen **overlay menu with numbered chapters**; page as a dated timeline (1990-2000 / 2001-2016 / 2017-today), big stacked headline per era; current release block with a stat callout. Enter gate (no). | About is a text page, no dated chapters |
| Lecrae https://www.lecrae.com (faith + rap) | One-column stack: small eyebrow label, bold heading, **one CTA each**; icon tiles (Bio / Tour / Store); anchor index; newsletter with a Thank-you state; merch is one Store tile. | One CTA per band yes; thank-you state yes (DESIGN 19) |
| Illenium https://illenium.com | Header **Listen Now** button always present; "Want to see Illenium on tour?" headline over the dates; booking / press / management as mailto lines in the footer. | Listen on the bar yes; booking line yes |
| Awwwards Music & Sound https://www.awwwards.com/websites/music-sound/ | 36 sites on page 1; only Daddy Yankee is an artist with an award date. Trend is gates, loaders, sound-on: confirms `modern-references.md`. | Skipped on purpose |
| Our own HTML (`dist/`) | JSON-LD is `MusicGroup` + `WebSite` only: **no `MusicEvent`** per show, no `MusicAlbum` / `MusicRecording`. No speculation rules. No share button (`navigator.share` 0 hits). `@view-transition` is root-only, header named. | Gaps, below |

## 2. What our 390 pages show
- Home is 3735px: five full bands. Shows is one list of 13 upcoming rows, mostly "Open mic"; **the only full show
  (Riverside, Jan 16) sits at the bottom**, and that is the thing Gabe most wants more of.
- The next show row never says "Tonight / Tomorrow"; every row is a date.
- RISE has one player and one Listen; no other-platform row, no share.
- Sign-up copy on Home and Shows is the identical sentence; Shows asks about the single, not about dates.

## 3. Top 10 gaps, ranked by impact on "fans listen + come to shows; intuitive, versatile, cool"
R1 = no flashing >3/sec. R2 = motion off under `prefers-reduced-motion` and the device setting.

| # | Gap | Change, and where | Effort | Hard rules |
|---|---|---|---|---|
| 1 | **Shows are invisible to Google and the full show is buried.** | (a) `MusicEvent` JSON-LD per upcoming show from the shows data on `/shows/` (name, startDate, location, performer, url). (b) On `/shows/` put full shows first (Riverside) or give them a bigger row than open mics; needs a show-kind field (owner call if it is not in Gabe's edit screen). | S for (a), M for (b) | Static. R1 / R2 n/a |
| 2 | **"Seamless" is only a root fade.** Kushner's SOTD lists transitions as a feature. | Add a `speculationrules` block with `prefetch` (moderate eagerness) for `/music/ /shows/ /videos/ /about/`, so the next page is loaded before the fade starts (Chromium only; others ignore it). Optional, motion-on only: shared `view-transition-name` on the release cover and show poster so they hold still across Home to Music while the rest fades (no scale, no slide). Shared element needs a logged decision (DESIGN 8: opacity only). | S (prefetch), M (shared) | R1: one 200ms fade. R2: reuse existing `@view-transition{navigation:none}` off-switches; prefetch is not motion |
| 3 | **Listen is one platform.** TY1 / Illenium / Sidney show a platform row. | Under RISE's Spotify button add a quiet text row: Apple Music / YouTube Music / SoundCloud / All platforms, on his Go smart link or confirmed per-service URLs. Plain links, no outline (one outline per screen). | S | Static |
| 4 | **Dates read as dates, not "when".** | Next show only: "Tonight" / "Tomorrow" / "In 3 days" label on Home's Now line and Shows' top row, set at build time (needs the daily rebuild already planned). No live countdown (DESIGN 7). | S | Static text |
| 5 | **One sign-up, one sentence.** Openstate repeats a short CTA; Jasonwild names the club. | Per-page promise: Shows "Get new dates before they're posted", Music "Hear the next single first", Home keeps Scenic Route. Gabe picks a short name for the list. Copywriter job plus a `reason` prop on the existing block; still one form per screen. | S | Static. Input handling unchanged (no-injection rule) |
| 6 | **No share.** Calendar (.ics) exists, share does not (round 2 #8 half done). | `navigator.share` on show rows and the release block; fallback copy-link with a visible static "Copied" line. Feature-detect. | S-M | No motion |
| 7 | **About is a document.** Daddy Yankee / Openstate split the story into dated chapters. | About as 3 chapters, year as label, section word as crate divider (DESIGN 21), 1-2 of Gabe's own sentences each, only dates he stated (since 2022, Scenic Route Jan 15, IDENTITY Aug 13 2027). Gabe reviews the words. | M | Static |
| 8 | **A free thing for a sign-up.** TY1's free wallpaper is the cheapest conversion trick found. | JOIN's success state offers a phone wallpaper cut from IDENTITY art (needs Gabe's OK on art and file). | M | Static image |
| 9 | **Release as an object.** TY1's numbered tracklist with durations; Sonelle's per-song player. | Spec for the already queued release-day page (laptop plan row 4): big cover, numbered track rows with durations, one Listen, platform row (#3), share (#6). Not new work, a content spec. | M (inside existing row) | Static |
| 10 | **Add to home screen.** No peer does it; low priority, fits "app-like". | `manifest.webmanifest` (name, icons from the apple-touch icon, `theme_color`, `display: standalone`), no service worker. Check the phone bar in standalone. | S | Static |

## 4. Looked at and rejected
- Enter gates, sound toggles, loaders, WebGL (TY1, Openstate, Daddy Yankee): a gate between an Instagram tap and the
  music; R2 can't be promised.
- Parallax (Openstate, Kushner): scroll-tied motion, no off-promise.
- Merch carousels with arrows and hover-swap (TY1): carousel ban, no hover on phones.
- Numbered full-screen overlay menu (Daddy Yankee): our bottom bar + Menu sheet already works.
- "Scratch the vinyl" toys (TY1): not flash-safe without a full audit.

## 5. Not verified
- How Kushner's transition actually looks (live site failed to open).
- Any new Wix music template since Nov 2 (not re-fetched; Wix pages block bots).
- Whether `/shows/` already has a show-kind field for #1(b) (`src/` not read).
- Safari / Firefox speculation-rules support (they ignore it today, a harmless fallback).
