# Modern references: what "modern" means for an artist site in 2026, and how ours gets there (Desktop designer, 2026-11-06)

Owner, 2026-11-06 (CONTEXT "Owner's notes" 7-8): more in-depth research on website design and modern templates; flesh the site
out; a from-scratch site only if absolutely beneficial. This builds on `wix-templates.md`, `artist-sites.md` (Squarespace,
Bandzoogle, Framer, Webflow), `genre-and-standouts.md`, `standouts-visual.md` (Kalkbrenner, Inherited, Gaga, Alcest, Karma) and
`design-round-2.md` (Sleep Token, Lorde, Turnstile, Fred again.., stores). It doesn't repeat them. WebSearch / WebFetch / raw HTML
only (no browser this round). Our site judged from `docs/review/build-shots/*.png` (Nov 5-6) and the live preview HTML.

## 1. What reads as "modern" in 2026

**Where the galleries are now (new since our earlier rounds):**
- **Framer, Music category:** 55 templates now (was ~50), pitched as "releases, shows and the identity behind the sound in one
  place"; some ship as "Agent Templates" an AI agent can edit. Raw HTML of three live demos: **Ravevora** (`ravevora.framer.website`,
  free): 26 marquee/ticker matches, 7 `grid-template`, `backdrop-filter` (glass) 4; **Noxivolt** (`noxivolt.framer.website`): 16
  ticker, grid, a sticky element, grain; **Sonelle** (`sonelle.framer.website`): 12 native `<audio>` players, one per song, under
  "Latest Songs". Gigfolio, Nightwave and Loudroom demos are now "Site not found".
- **Wix Studio:** "Sound Soul" (forum launch 27 Mar 2026), built in Wix Studio + CMS, for solo artists, bands and event pros
  (forum page refused our fetch; marketplace listing only).
- **Squarespace 7.1:** music templates sit under *Entertainment*; the same free set (Vandam, Kitui, Cruz, Jasonwild, Waverly)
  plus paid ones (Lora, $189). Nothing new in layout since `artist-sites.md` 1a.
- **Bandzoogle:** newest theme named in its showcase is "Prismatic"; 13 blank theme styles; no 2026 theme launch found.
- **Shopify for artists:** themes (Publisher free, Icon, Creator) are store-first. The telling one is the **Roadie** app ($4.99/mo):
  it adds "album release hero, discography grid, artist bio, tour dates, **marquee header**, **audio previews**, streaming links".
  That list is the 2026 template checklist in one line.
- **Awards:** Webby 2026 Music winner **Lady Gaga** (ladygaga.com: hero video, then a horizontal "Scroll" strip of ~35 covers).
  Awwwards Oct 2026 music picks: **Avara** (avara.band, HM 11 Oct: WebGL, loader, full-page scroll), EDOLUS, Overworld Audio
  (SOTD); Van Morrison (vanmorrison.com, HM 10 Jul: video page transition, micro-interactions, timeline, "Concert Vault").
  Daddy Yankee (daddyyankee.com): "Enter" gate, chapters as scroll-story. Inherited's EP site (mms.inherited.band): age gate,
  "turn on audio", a case-file puzzle. **Award sites trend to gates, loaders, WebGL and sound: the opposite of our rules.**
- **Trend writing** (agency blogs, opinion): bento grids lead (sweet spot 6-9 tiles), dark mode as a full identity, glass sticky
  headers; a May 2026 "reality check" notes anti-grid brutalism as the counter-move.

**The patterns, judged against our rules** (no flashing, intuitive, phones first, Gabe edits small things):

| Pattern | Example | Why it reads modern | Fits us? | Effort |
|---|---|---|---|---|
| **Bento / tile grid** for "the latest" | Ravevora, Noxivolt; trend posts | Many current things on one screen with a rhythm of sizes, instead of one band per thing | **Yes, from 900px** (phones stack anyway). DESIGN 3 says "no cards": needs a ruling | M |
| **Media inside type** | Kalkbrenner (`standouts-visual.md`) | The name is the art | **Have it** (hero B, 900px+). Use once; a second instance would cheapen it | done |
| **Sticky mini player / now playing** | Kalkbrenner's corner "Now playing"; Spotify/Bandcamp apps | Music keeps playing while you browse | **No.** We're multi-page: the Spotify iframe restarts on every page. Would need an SPA router (`transition:persist`), risking edit/shop/tests. The phone bar's Listen is our version | L |
| **Seamless page transitions** | Van Morrison (video transition); native `@view-transition` | Pages feel like one app | **Yes, opacity only** (D64; already in `global.css:845`). Firefox has no cross-document support yet (Interop 2026 target): plain loads there | S |
| **Scroll-snapping full-screen sections** | Avara (full-page scroll) | Each section is a "slide" | **No.** Scroll hijack is banned (DESIGN 8) and fights phone thumbs and find-in-page | - |
| **Horizontal release / video strip** | Lady Gaga cover strip; Ella Mai, NF release carousels | Catalog in one glance, app-like swipe | **Only as a static swipe row** (CSS `scroll-snap`, no autoplay, no arrows needed, visible edge of the next item, keyboard reachable). DESIGN 8 bans "carousels": rule that a non-moving row isn't one. Our 2-column Music grid beats a strip for the catalog | S |
| **Image-led page headers** | Bandzoogle picks: Moonfruits, Fox and Bones (art of the current release on every page) | Every page has its own picture and mood | **Yes**, limited by our 3 photos (owner note 6) | M (content) |
| **Micro-interactions** | Van Morrison (tagged "Microinteractions") | The page answers every touch | **Instant states only** (D47 `:active`, no animated hovers) | S |
| **Rich dark surfaces** | Trend posts; Bad Omens store; Sleep Token | Depth from 2-3 surface tones and tinted grounds, not flat black | **Yes**, derived from era colours (D12: no new roles) | S |
| **Grain / riso / halftone texture** | Inherited, Noxivolt (grain) | Print feel against "AI-smooth" sites | **Have it** (grain, hero B riso, poster). Keep | done |
| **Marquee / ticker** | Bad Omens (`LOW STOCK •` tickers, 261 matches), Ravevora, Roadie's "marquee header" | The default "energy" device of 2025-26 templates | **Moving: no** (DESIGN 8, hard rule spirit). A **still** slogan tape gives the look | S |
| **Glass sticky header** | Ravevora (`backdrop-filter`); trend posts | Header always there without a heavy bar | **Solid, not glass:** D25 puts Logo D only on solid dark ground, and D64 keeps the mark always visible, so the header band is solid `bg` | S |
| **Player card: cover + tracklist** | Sonelle (one `<audio>` per song), Bandcamp album pages | The release is an object you can play, not a word next to an embed | **Yes**: our release cover is the smallest image on Home today | M |
| **Video grid with real thumbnails** | Turnstile's video tracklist; Bad Omens hero video still + STREAM | Video is where fans live; a grey box reads unbuilt | **Yes** (owner note 3, D64) | S-M |
| **Gates, loaders, WebGL, sound-on** | Avara, Inherited MMS, Daddy Yankee, Karma | Award-bait | **No**: slow on phones, motion we can't promise, a gate between an Instagram tap and the music | - |

**Summary:** "modern" for a working artist site in 2026 = dark rich surfaces, a grid with rhythm on big screens, the current
release as a playable object, real video thumbnails, seamless page changes, and the artist's own imagery on every page. The
moving parts most templates use for energy (tickers, carousels, scroll-jacking, loaders) are exactly what Gabe's site can't
use, and don't need to be: none of them is what makes the good ones look current.

## 2. Our site: what already looks modern, what looks dated or plain

**Already modern (keep):**
- **Hero B at 1280** (`home-1280-first.png`): G[riso photo]LUCAK with the slogan fitted under it is the most current-looking thing
  on the site, and no template does it. The halftone/riso photo reads 2026-editorial, not stock.
- **Fitted poster type + grain + crate-divider tabs**: distinctive; Framer's music templates use a similar heavy type, ours is better fitted.
- **The show poster** (paper DEC 12 on dark, `shows-1280.png`): reads like a real gig poster, not an event widget.
- **Music cover grid at 390** (`music-390.png`): two columns of Dave Bahm's covers is the strongest screen on phones.
- **Phone bottom bar**: app-like, and no peer has one. No cookie wall. Light pages.

**Dated or plain (be specific):**
1. **One rhythm, five times.** Home is "giant word, then content" in full-bleed bands, top to bottom: RISE, LIVE IT LOUD, PUSH PAST
   FEAR, THE TIME IS NOW, then the footer's LISTEN. SHOWS. JOIN. (`home-1280.png`). At 1280 the words take ~40% of each band and
   the content sits in one or two plain columns under them. No grid rhythm, no change of scale between items: it reads as a
   long scroll of posters, which is 2015-landing-page structure in 2026 type.
2. **The RISE band is a big word + an embed box.** The release (Duck, Dodge, Jump, Fight) gets a ~95px cover at 1280 and ~100px on
   phones, the smallest image on the page, beside a word. Modern artist sites put the current release in a card: big cover,
   title, artists, Listen, with the player or tracklist attached. Under RISE at 1280 the left column is empty space.
3. **Latest video is a grey box with a play button** (`home-1280.png`, `shows-1280.png`, `home-390.png`): reads unbuilt (owner note 3).
   One video, no thumbnail, no duration; video is where his fans actually are.
4. **One photo repeated.** Three of Gabe's photos fill five slots (hero A, hero B, Push Past Fear, Shows poster, About), and the
   Kealey shot carries the hero at both widths. Every page opens on the same man at the same mic (owner note 6).
5. **About is a document** (`about-390.png`): photo, three paragraphs, then plain headings (FIND GLUCAK, BOOKING AND SHOWS, PHOTO
   CREDITS) with loose underlined words and a dashed placeholder. No photos after the first, no facts at a glance.
6. **Flat black everywhere.** Every band is the same `bg` separated by a 1px line; depth comes only from grain. The Spotify embed
   (maroon in the Nov 5 shot, now `theme=0` dark grey) is the only other surface.
7. **Full-page captures show blank bands** (`home-390.png` Nov 6: LIVE IT LOUD, PUSH PAST FEAR, THE TIME IS NOW invisible). D47 keeps
   them visible without JS, but any tall-viewport screenshot, share preview tool or print-to-PDF still catches the waiting state.
8. **Footer at 1280** is one row of underlined words spread across the width (the round-2 link grid, D53, is designed but this
   shot predates the port).
9. **Every action is the same rectangle** (filled or outlined, Big Shoulders caps). Fine for consistency; nothing tells "play"
   from "go to a page" from "leaves the site" (D64(4) needs a new-tab sign anyway).

## 3. Twelve "flesh it out" improvements, ranked

Ranked by what a fan from Instagram notices first, then by cost. Every height change on Home answers to D39 (5.8 phone screens).

| # | What | Why | Example | Effort | Owner | Conflicts with DECISIONS / DESIGN |
|---|---|---|---|---|---|---|
| 1 | **Release card in RISE**: one `bg-2` panel with the cover as made (half the width on phones, ~40% of the column at 1280), title, artists line (D33), date state (D45), Listen; the Spotify embed docks under it as the card's second half; "Listen everywhere" folds into the card | Turns the band from "word + embed box" into a playable object; his covers are the best art he has | Bandcamp album page; Sonelle's song list; Sleep Token's album-as-hero | M | Laptop design, Desktop build | DESIGN 3 "no shadows, no cards" (amend to "no shadows; panels allowed, 2px corners"); D39 cap: pays for itself by merging the release block and the player (two blocks become one) and D55a's link; D35 `theme=0` kept |
| 2 | **Real video thumbnails, plus a row**: latest video big with its real thumbnail (saved locally, D64(3)), title and length; from 700px two more beside it; on phones only the latest on Home, the row on Shows/Videos as a static swipe row | Owner note 3; a grey box is the single most "unfinished" thing on the site | Turnstile's video list; Bad Omens' video still + STREAM | S (thumb), M (row) | Desktop build (RSS + thumbs), Laptop layout | D64(3) (asked for); DESIGN 8 bans carousels: rule that a static, non-autoplay swipe row isn't one; D39 cap: no added height on phones |
| 3 | **A different picture in every slot** (owner note 6): stills from his own YouTube uploads and his own Instagram photos, one per band and page; About gets a 3-6 photo grid; each through the D34 treatments | Ends "same man, same mic"; image-led pages are what makes artist sites feel alive | Bandzoogle picks (Moonfruits: the release's imagery on every page); Lady Gaga era imagery | M | Desktop (finds, screenshots, credits), Laptop (crops, treatments) | D27 (WebP size caps), D34 treatment per slot, CREDITS.md; owner note 6: his content only, fans' faces checked, Gabe's OK where not already cleared; stills are static, so hard rule 1 holds |
| 4 | **Grid rhythm from 900px**: keep fitted full-width words on phones; on wide screens set each phrase beside its content in an asymmetric 12-column grid (e.g. LIVE IT LOUD as the band's left column, poster + next show + video as three tiles of different sizes) | Breaks the "word, content" x5 stack where it looks most dated (desktop); phones are unchanged | Ravevora / Noxivolt tile grids; Fred again..'s quarter grid (`design-round-2.md` 3) | M | Laptop design, Desktop build | DESIGN 1 ("each phrase full width"): amend to phones-only; DESIGN 3 "no cards"; D6 (label + real content right under the heading still holds) |
| 5 | **Header band, always there, solid** (D64(2)): Logo D + GLUCAK left, nav right, on a solid `bg` band over the hero too; not glass | The always-visible header is the 2026 norm, and D25 forbids the mark on a photo | Trend posts (sticky header); Bad Omens' persistent menu bar | S | Desktop build (in progress), Laptop spec | D64 overrides the hero's hidden header; **D25** (mark only on solid dark ground) rules out glass; DESIGN 3 hero scrims shrink (no top-left ellipse needed) |
| 6 | **Finish the seamless page change**: header and phone bar get their own `view-transition-name` with no animation so only `<main>` fades (200 ms, opacity); nothing on Firefox (plain load) | The owner's note 1; a still frame around a fading middle is what makes it feel like one app | Van Morrison; Chrome's cross-document docs | S | Desktop build | D64(1) overrides D47's "no page transitions"; DESIGN 8 off-switches (both) still apply |
| 7 | **Rich dark surfaces**: alternate band grounds (`bg`, `bg-2`, and a deep `bg` mixed ~8% toward `accent`), a static cover-tinted glow behind the release card; lines become changes of ground | Depth without motion; the site stops being one flat black | Sleep Token; Bad Omens store; trend posts | S | Laptop tokens, Desktop build | D12 (derive from era colours, no new role); D35 (never tint covers: the glow sits behind, the cover stays as made); era contrast test must cover the new ground |
| 8 | **About as a profile**: photo grid (from #3), the full bio exact, a facts strip only from verified facts (Producer-rapper/DJ, Montco Radio play of Scenic Route), the link grid with icons, a booking card (email when Gabe sends it) | Fans and venues scan a profile; a wall of text after one photo reads like a CV | Daddy Yankee's chapters (as layout, not gate); Bandzoogle EPK pages | M | Laptop design + copywriter, Desktop build | **D23 / D29** (bio exact, never trimmed; the strip is our label text, not his words); D21 (no quote on About for now) |
| 9 | **Music: tap a cover, get the release**: `:target` detail under the grid (like the shop, D41) with the cover large, credits, date, a Spotify album/track embed for that release, smart link | The grid is pretty but every tile leaves the site; a fan expects to play it here | Lady Gaga's cover strip -> release; Sonelle songs | M | Laptop design, Desktop build | D41 pattern reused; D53 (cover grid); D10 (IDENTITY stays a block); one more lazy iframe per opened release only |
| 10 | **Still slogan tape**: a thin static strip between two bands, "RISE • LIVE IT LOUD • PUSH PAST FEAR • THE TIME IS NOW •" in outline caps, cropped at both edges | Gives the ticker look every 2026 template uses, with zero motion | Bad Omens / Ravevora tickers (moving; ours stands still) | S | Laptop design, Desktop build | DESIGN 8 bans tickers (this one never moves: say so in a ruling); D39 cap (~40px, trim elsewhere or desktop only) |
| 11 | **Action signs**: a small ↗ on every link that opens a new tab (D64(4)), a ▶ glyph on Listen and on cover tiles, a calendar glyph already on Add to calendar (D55) | Tells play / page / leave apart at a glance; the new-tab rule needs a visible sign anyway | Van Morrison micro-interactions; common app convention | S | Laptop design, Desktop build | D64(4); D47 (instant states, no animation); D55 (main actions keep words) |
| 12 | **Footer as a closing card**: sign-up as the hero of the footer, the round-2 link grid with icons (D53, port pending), the next show / Now line repeated small | The last screen sells the two main actions again; a spread row of underlined words reads dated | Lyle-upper's "Join the movement" (`wix-templates.md`); Bad Omens' subscribe band | S | Desktop port (16h), Laptop check | D53 (already designed); D39 doesn't apply (footer) but keep the phone footer under ~1.5 screens |

**Not recommended:** a persistent mini player (needs an SPA router; risk to `/edit/`, shop and the 105 tests), scroll-snapped
full-screen sections, moving tickers, autoplay carousels, glass header (D25), loaders, gates, WebGL, sound-on.

## 4. Should we build an alternative site from scratch?

**No.** It wouldn't be absolutely beneficial, and it would cost what the launch can't spare.

- **Time:** launch is Jan 11, about nine weeks out, with Gabe's IDENTITY colours, booking email and photo OKs still to come.
  A second site splits two machines' time in half for the length of the rebuild, then needs a merge.
- **What a rebuild would get that targeted changes can't: nothing found.** Every dated item in section 2 lives in a component:
  RISE (`RiseBand.astro`), video (`VideoBlock.astro`), the photos (data + `public/media`), About (`src/pages/about`), surfaces
  (tokens in `global.css`), header (`Header.astro`). The stack (static Astro + `server.js`) puts no ceiling on the look: the
  modern references in section 1 are plain HTML/CSS patterns (grid, `scroll-snap`, `@view-transition`, panels). The only
  pattern that needs an architecture change is the persistent mini player, and we reject it on our own rules.
- **What it would put at risk:** the `/edit/` screen with sign-in, shows / products editing, backup and restore (D65), the shop
  behind `SHOP_ENABLED` (D36-D43), the Now line logic (D45, D59), the injection tests and 105 passing tests, the era contrast test,
  and ~60 decisions' worth of measured fixes. A fresh site would re-earn all of that or ship without it.
- **The real gap is layout and imagery, not foundation.** That is fixed by items 1-4 and 7 above.

**Instead (cheap cross-compare, as the owner asked, without a rebuild):** the Laptop makes **one** variant page,
`prototype/home-v2.html`, from the existing `prototype/styles.css` tokens and Gabe's real files: items 1 (release card), 2 (real
video thumbnail), 4 (900px+ grid rhythm), 7 (surfaces) and 10 (still tape) on Home only. The Desktop shoots it beside the
current build at 390 and 1280 (same check scripts, same D39 measure) and the owner picks per item, not all-or-nothing. Winners
port component by component; nothing in `src/` changes until the owner picks. Budget: one Laptop session for the page, one
Desktop pass for shots.

## 5. Not verified
Wix Studio's Sound Soul (forum page refused the fetch); Godly (`godly.website` now redirects to recent.design, not read);
Siteinspire's music list (bot checkpoint); Avara / EDOLUS / Overworld seen only through their Awwwards pages; Ravevora's grid and
Noxivolt's sticky element counted in HTML, not seen; Firefox cross-document View Transitions status (Chrome docs disagree with
themselves; Interop 2026 lists it as a focus area); CSS `::scroll-button` / `::scroll-marker` in Safari (reports conflict), so
any swipe row must work with plain `scroll-snap` and no new pseudo-elements; trend-post claims are agency opinion.

## Sources
[Framer music templates](https://www.framer.com/marketplace/templates/category/music/) ·
[Ravevora](https://www.framer.com/marketplace/templates/ravevora/) ·
[Wix Studio Sound Soul](https://www.wix.com/marketplace/template/b5b117cd-7c93-43f2-b023-e83d7a75e24a) ·
[JPK: Squarespace for musicians](https://www.jpkdesignco.com/blog/best-squarespace-templates-for-musicians-and-bands) ·
[Bandzoogle team sites](https://bandzoogle.com/blog/4334250/website-design-inspiration-bandzoogle-team-sites) ·
[Roadie (Shopify)](https://apps.shopify.com/roadie) · [Nextsky: Shopify entertainment themes](https://nextsky.co/blogs/review-themes/best-shopify-themes-for-entertainment) ·
[Webby Music winners](https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/music) ·
[Awwwards Music & Sound](https://www.awwwards.com/websites/music-sound/) · [Awwwards: Avara](https://www.awwwards.com/sites/avara) ·
[Awwwards: Van Morrison](https://www.awwwards.com/sites/van-morrison) · [ladygaga.com](https://www.ladygaga.com/) ·
[badomensofficial.com](https://www.badomensofficial.com/) · [daddyyankee.com](https://daddyyankee.com/) ·
[mms.inherited.band](https://mms.inherited.band/) · [Hypebot/Bandzoogle: 20 musician sites](https://www.hypebot.com/20-beautiful-musician-websites-to-get-inspired-by.md) ·
[own.page: musician site examples (Jul 2026)](https://own.page/blog/musician-website-examples) ·
[Spoko: modern design 2026](https://spoko-space.pages.dev/blog/modern-website-design-trends/) ·
[StudioMeyer: 2026 reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check) ·
[Chrome: cross-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) ·
[Chrome: view transitions 2025](https://developer.chrome.com/blog/view-transitions-in-2025) ·
[Chrome: CSS carousels](https://developer.chrome.com/blog/carousels-with-css).
