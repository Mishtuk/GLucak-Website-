# Design round 2: making the built site better (Desktop designer, 2026-11-06)

Owner, 2026-11-06: "Keep on doing research on website design and the art for the music. How to better design it." This file
is the **website** half (the art half is `art-system.md`). It doesn't repeat `genre-and-standouts.md`, `standouts-visual.md`,
`artist-sites.md` or `photo-art-direction.md` (Kalkbrenner, Inherited, Dookie, Gaga, Alcest, Karma, NEFFEX, nobigdyl. are
covered there). Read in Chrome (read only, no logins or carts, no cookie banners clicked) plus Wayback snapshots and web
search. Screenshots: `shots/round2/`. Our build was judged from `docs/review/build-shots/*.png` (2026-11-05) and `src/`.

## 1. Release campaigns: how the site changes week by week

| Site | What it does | Seen |
|---|---|---|
| **Sleep Token**, sleep-token.com (*Even In Arcadia*, 2025) | **One layout, three text states over four months.** Until about 13 Mar 2025 the home is still the previous album ("TAKE ME BACK TO EDEN, BUY / LISTEN NOW", merch, tour). On the day of the announcement the whole home swaps to the new art: "THE NEW ALBUM COMING MAY 9 2025, AVAILABLE NOW TO PRE-ORDER & PRE-SAVE", four region store buttons, tour presale, and "Don't see your city? Sign up for updates". From release day: "OUT NOW, AVAILABLE NOW TO STREAM & PURCHASE". Nothing else moves. | Wayback 20250220, 20250314, 20250408, 20250510; live (`sleeptoken-eia-outnow.jpg`) |
| **Lorde**, lorde.co.nz (*Virgin*, 2025) | **The home is one thing per week, in her voice.** Single week (24 Apr): the single's full credits, then a short first-person paragraph about how the song was made. Tour week (14 May): one photo of an art object from the album world, a first-person tour note with presale and on-sale dates. The copy changes, the layout barely does. | Wayback 20250424170348, 20250514162853 (`lorde-2025-05-tour-week.jpg`) |
| **Turnstile**, turnstilehardcore.com (*NEVER ENOUGH*, live Nov 2026) | The home is the store. At the top, the album's videos as a plain "▶ title" list in order (a video tracklist), then Listen now, the film's links, then pre-order 2LPs in five colours. Tour dates are a poster **image** (not text, not tappable). | live (`turnstile-store-home.jpg`) |
| **Ella Mai**, ellamai.com (*Do You Still Love Me?*, 2026) | Press reports a two-week album countdown on the site with tracklist, pre-orders and a new store at once. Now: a releases carousel, and Tour Dates is "Follow Ella Mai / View on Laylo" (no dates, a follow button instead). | live (`ellamai-home.jpg`); [allhiphop](https://allhiphop.com/?p=6123550) |
| **NF**, nfrealmusic.com (*FEAR* EP, live) | Era art full-screen (a burning house), then three store items (two marked PRE-ORDER), a release carousel, videos. No player on the page. | live |
| **Laylo** drop playbook | Share a "notify me" link 1-2 weeks before each single, use it for every single, the release-day message carries the stream link, then merch and presale go to the same list first. ([Drop Blueprint](https://laylo.com/blog/drop-blueprint-music), [Top drops 2025](https://laylo.com/blog/top-drops-of-2025)) | web |

**What the good ones share:** the campaign lives in **states of one layout, flipped by date**, not new pages; each week has
**one** thing (a single, a tour, a pre-order); the artist's own words carry the week (Lorde). Countdowns are a short window
(about two weeks), not months. Big pop sites tease with puzzles; none of that is needed for Gabe's audience.

**For IDENTITY, from Gabe's own dates** (`releases.json`: Who I Am 13 Nov 2026, Scenic Route 15 Jan 2027, album 13 Aug 2027):
- **T-14 days before a single:** the Now line names it ("Out Nov 13: Who I Am", links the pre-save). Music shows its cover.
- **Release day:** Now line "Out now: Who I Am"; the RISE release block becomes that single; email goes out through Kit.
- **Days 1-14:** the single may carry one exact note from Gabe (whole sentences, D23/D29) and its credits, Lorde-style.
- **Between singles:** shows lead (the poster). **Album T-14:** the existing IDENTITY day count; release day flips (built).
All of it from dates in data Gabe already edits. Who I Am is **7 days out today**, and the site doesn't mention it on Home.

## 2. Artist merch stores (self-contained for the Laptop's L2 shop design)

Our model today (`src/lib/products.js`): one page, cards link to `#anchor` details, statuses sample / coming soon /
available / sold out, sizes shown as text, **Buy goes to the Fourthwall product page**, where the fan picks size and pays.

| Store | Grid and card | Detail page | States, trust |
|---|---|---|---|
| **Harry Mack** (Fourthwall), shop.harrymackofficial.com (`harrymack-fourthwall-*.jpg`) | 3 columns, every product on the same light-grey square, name, price, **colour swatches under the card**. Weak: the same hoodie appears as 4 cards (one per colour) | Two thumbnails left, **size as buttons**; unavailable sizes **stay visible, greyed** (class `unavailable`); quantity, Add to cart, wallet buttons; accordions *More details / Size & fit (size chart) / Quality guarantee & returns* | "Quality is guaranteed. If there is a print error... we'll replace or refund it, otherwise final sale." Up top, under the price |
| **NF** (Shopify), nfrealmusicmerch.com (`nf-store-*.jpg`) | 4 columns, black products on white, caps names in tiny grey (low contrast) | Size in a **dropdown** (slower on phones), size chart **in inches** (length, chest, sleeve) printed on the page, the lyric on the shirt's back named in the description | "ALL SALES ARE FINAL. NO EXCHANGES OF SIZES." and the duties note in red above the description. Currency picker and cart in the header |
| **Turnstile** (Shopify) | Store is the home; colour variants are separate cards | Pre-order page: "Expected ship date on or around November 20th", "Limited to 4 per variant per customer", **the full tracklist** on the LP page | "*PRE-ORDER" is written into the product name; "Sold out" badge in the grid |
| **IDLES** (Bandcamp), idlesband.bandcamp.com/merch | Grid of formats; **sold-out items stay in the grid** with "Sold Out" where the price was | Album page: the **player first**, then each format: "Record/Vinyl + Digital Album, includes unlimited streaming... plus download", "ships out within 7 days", "Release date December 19", "Send as Gift" | Every physical format includes the digital album at once |
| **Fourthwall** bundles ([help](https://help.fourthwall.com/hc/en-us/articles/43428674505883-How-to-Create-a-Bundle-Product-Listing)) | | A bundle (album + shirt) can mix print-on-demand, digital and self-fulfilled items; fixed bundle price or the sum | If one item is out of stock the **whole bundle is out**; items from two warehouses ship separately |
| **Fourthwall** shipping ([help](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/shipping-and-delivery-expectations)) | | On-demand items are made after the order: 3-5 business days, plus 3-7 days US transit | Fourthwall's own advice: tell fans 1-2 weeks is normal |

**What to take, in order:**
1. **Don't make fans pick a size twice.** Size and payment happen on Fourthwall. On our detail, sizes are **information**
   ("Sizes S-2XL", a "Size chart" disclosure with the measurements in inches), not buttons; one **Buy on the store** button
   deep-links the product. Size buttons on our side only if the Buy link can carry the size (it can't today).
2. **Every status says what happens next,** with one line under it: Available + "Made when you order. Arrives in about
   1-2 weeks (US)." / **Pre-order** (new status, needs `shipsBy`): "Ships on or around {date}." / Sold out: stays in the grid,
   sorted last, "Sold out" where the price was (IDLES), no Buy, no disabled button / Coming soon: no price (D37).
   Status lives in a field, never in the name (Turnstile's "*PRE-ORDER" name is the anti-pattern).
3. **Trust in three short lines under Buy, not a policy page:** what happens if a print is wrong (Harry Mack's guarantee,
   Fourthwall's real policy in Gabe's account), returns/exchanges, and our existing D37 note about paying on the store.
4. **Music products link to the music:** CD and vinyl details carry "Listen first" (the release's smart link) and the
   tracklist when known (Turnstile, Bandcamp). Say "includes download" only if Fourthwall really delivers one.
5. **One card per product,** colours as swatch dots (Harry Mack), not one card per colour. Products on a flat `bg-2` square,
   same crop for every item (Harry Mack's consistency is what makes a plain grid look premium).
6. **Bundles (album + shirt) later,** as one product with its own card; if either part sells out the bundle shows Sold out.
7. **Phone:** 2-column grid at 390 (cards about 170px), detail with the photo first, then name, price, status line, Buy
   full width, then the size chart and policy as `<details>`. No currency picker, no cart, no cookie banner: we have none.

## 3. Typography-led and editorial layouts that stay intuitive
- **Fred again..** (fredagain.com, `fredagain-home.jpg`): the nav is four lowercase words (listen, store, tour, sign up),
  each above a hairline in its own quarter of the page; behind it, real snapshots and the name as a huge repeated word.
  Big type is the art; the nav stays plain words. Weak: "There are no upcoming events." from a widget, and a cookie wall.
- **Sleep Token:** the album title is the hero; every action is a short labelled button under it. Poster type, plain verbs.
- **Turnstile:** the "▶ title" video list is a typographic tracklist: plain text, scannable, tappable, era-proof.
- **Phones:** NF, Turnstile and Fred all hide the nav behind a burger or tiny words. Our always-on bar (D8) beats all of them.
- **Lesson:** big type for the art (name, phrases, dates), small plain words for every action. That's our spine (D6); keep it.

## 4. Motion that feels alive without flashing
- **Scroll-linked reveals in CSS:** `animation-timeline: view()` works in Chrome and Safari 26; Firefox still has it behind a
  flag ([Chrome docs](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)). Wrapped in
  `@supports (animation-timeline: view())`, a browser without it simply shows the content: it can't get stuck invisible.
- **Page transitions:** cross-document View Transitions (`@view-transition { navigation: auto; }`) run in Chrome/Edge 126+
  and Safari 18.2+, same-origin only, skipped after 4 s ([Chrome docs](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)).
  For us: a 200 ms opacity cross-fade only (no slides, no zooms); declared inside `prefers-reduced-motion: no-preference`; our
  own switch skips it with `pagereveal` + `event.viewTransition?.skipTransition()` when `data-motion` is off. One fade per tap
  cannot reach 3 flashes a second, and both pages share the dark `bg`, so the luminance change is small.
- **Hover:** instant colour swaps and underline weight (we have them, behind `@media (hover: hover)`); no animated hovers.
- **Audio-reactive: not at all.** The Spotify iframe gives no audio data (cross-origin), and beat-synced brightness at 120-170
  BPM is a 2-3 Hz pulse, right under the WCAG 2.3.1 line of 3. Not worth a hard-rule risk.

## 5. Small details that read premium on a phone
| Detail | Best practice | Ours now |
|---|---|---|
| Tap feedback | Every button darkens or insets on `:active` at once (no animation) | Only the phone bar has `:active` (`global.css:490`) |
| Focus | Thick, visible ring | Done: 3px `text` ring (`global.css:109`) |
| Loading | Reserved boxes in `bg-2`, never a jump | Done for photos and the player (DESIGN 7) |
| Empty states | An action instead of nothing (Ella Mai's Follow, Sleep Token's "Don't see your city?") | Done and better (Follow + Request a show) |
| Footer | A tidy grid of labelled links, aligned | Social links wrap as loose underlined words ("X" alone on a row at 390) |
| 404 | Branded, with the main actions | **None** (`src/pages` has no `404.astro`) |
| Share cards | Per page, and per release / show where it gets shared | Per page only (`public/media/og/*.png`) |
| Calendar | "Add to calendar" per show | Not built (CONTEXT proposes it) |
| Cookie banner | None needed when there are no trackers | **None: better than all six sites I opened** |

## 6. Our built site against the best

**Already better than the peers:** a real Spotify player on the first phone screen (NF, Sleep Token, Turnstile, Ella Mai and
Fred have none on home); shows as real text with honest empty states (Turnstile's dates are an image; Fred's is "There are
no upcoming events"); Listen and Shows one tap away on every page; no cookie wall; light pages; one idea (the slogan) all the
way down, with poster-scale type that none of these stores match.

**Weaker:** (a) in our own 390 full-page shot, LIVE IT LOUD, PUSH PAST FEAR, THE TIME IS NOW and the Push photo are **blank
bands**: the phrases start at `opacity: 0` (`global.css:313`) and only show once the observer fires; (b) the next single (Who I
Am, 7 days out) isn't on Home; (c) Music is one long column of 96px rows, and the two coming singles have no art; (d) About is
a wall of text after the photo; (e) no 404, no calendar, no share; (f) the shop shows sizes as a line and no ship time.

### 10 improvements, in order
| # | What | Why | Effort | Owner | DECISIONS |
|---|---|---|---|---|---|
| 1 | **Phrases are never hidden.** Visible by default; the fade runs only under `@supports (animation-timeline: view())` as a scroll-linked opacity from 0.35 to 1 (or JS adds the hidden class only to headings below the first screen at load) | A missed observer, a fast flick, find-in-page or a screenshot tool shows empty bands where his slogan should be (our own shot does) | S | Desktop build | None (DESIGN 8 keeps the fade, opacity only) |
| 2 | **Now line announces the next release inside 14 days:** "Out Nov 13: Who I Am" + pre-save, then "Out now" on the day | Campaigns live in dated states (Sleep Token); the single is a week away and Home is silent | S | Desktop build, Laptop copy | **Amends D18** (Now line: shows within 14 days, else newest release) |
| 3 | **Drop moment:** for 14 days after a single, the RISE release block shows the bigger cover, credits, and optionally one exact note from Gabe in the RISE quote slot | Lorde's week-of-the-single page, in his own voice, which the owner asked for | M | Laptop design, Desktop data (`note`, `credits` on a release) | Fits D21/D23/D29 (one quote per band, exact); must stay inside D39's 5.8 cap by **replacing** R1 for those 14 days |
| 4 | **Shop states that say what happens next** (section 2): `preorder` + `shipsBy`, ship-time line, sold-out sorted last, sizes as information + size chart, trust lines, "Listen first" on music items | Fans buying from Instagram need to know when it arrives and what if it's wrong; no double size-pick | M | Laptop L2 design; Desktop `products.js` | Keeps D36/D37; **new status is a schema change** to log |
| 5 | **Music as a cover grid:** 2 columns at 390, 4 from 900px; coming singles get their art and "Out Nov 13" | DESIGN 6 already says "cover strip"; the build is a list, and covers are the most eye-appealing thing he has (Dave Bahm's art) | S-M | Laptop design check, Desktop build | None (follows DESIGN 6) |
| 6 | **Press feedback on every button and row:** `:active` swaps to the hover colours instantly; `-webkit-tap-highlight-color: transparent` once it exists | A tap that answers at once is the cheapest "premium" feel; now only the bar answers | S | Desktop build | None (no animation added) |
| 7 | **Footer and About link lists as a grid:** 2 columns at 390, 48px rows, icon + label, aligned; same for About's "Find GLucak" | Loose wrapping words look unfinished ("X" orphaned) | S | Laptop design, Desktop build | None |
| 8 | **Shows: Add to calendar (.ics) and Share** per row and on the poster (`navigator.share`, falling back to copying the link) | Turns "come to a show" (main action 2) into a saved date; fans share shows in DMs | M | Desktop build, Laptop copy | None (CONTEXT proposal) |
| 9 | **Page change cross-fade** (View Transitions, 200 ms, opacity only, both off-switches) | Pages feel like one site, not reloads; zero JS for Chrome/Safari, nothing in Firefox | S | Desktop build | **Needs a logged decision:** DESIGN 8 says exactly two motions exist |
| 10 | **404 page + share cards per release and show:** 404 with GLUCAK, the slogan, Listen / Shows; build-time OG image per release (cover as made + title) and per show (poster date) | Every shared link and every dead link still sells the music | S (404), M (cards) | Desktop build, copywriter (404 text is site copy, not Gabe's words) | None (covers as made, D-rule on art) |

**Not recommended:** a live countdown (DESIGN 7 already says static), a tour poster as an image (Turnstile), a currency
picker or cart on our side, puzzle teasers, audio-reactive visuals, a burger instead of the bar.

## Sources
Live: [sleep-token.com](https://www.sleep-token.com), [turnstilehardcore.com](https://turnstilehardcore.com), [ellamai.com](https://www.ellamai.com),
[nfrealmusic.com](https://www.nfrealmusic.com), [nfrealmusicmerch.com](https://nfrealmusicmerch.com/collections/all),
[shop.harrymackofficial.com](https://shop.harrymackofficial.com/products/anomaly-tour-2025-black-t-shirt) (found via
[Fourthwall musician examples](https://fourthwall.com/creator-examples/musicians)), [idlesband.bandcamp.com/merch](https://idlesband.bandcamp.com/merch),
[fredagain.com](https://www.fredagain.com). Wayback: [Sleep Token 2025-03-14](https://web.archive.org/web/20250314203536/https://www.sleep-token.com/),
[Lorde 2025-04-24](https://web.archive.org/web/20250424170348/https://lorde.co.nz/), [Lorde 2025-05-14](https://web.archive.org/web/20250514162853/https://lorde.co.nz/).
Not verified: Ella Mai's countdown (press only, it's over now); Fred again..'s word band may or may not move; Firefox's
current scroll-timeline flag status (third-party source); Fourthwall's exact guarantee wording for Gabe's account.
