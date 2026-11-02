# Artist sites and template galleries (designer research, 2026-11-02)

Scope: the template galleries the Wix pass did not cover, plus small independent artists that `genre-and-standouts.md`
does not cover. Wix, the Desktop's peer list and the Spotify facts are not repeated here. Direction, home order, nav
and palette belong to `direction.md`; this file gives evidence only.

**How this was read.** Everything was read on 2026-11-02 from fetched HTML: raw HTML through curl with a phone user
agent, or WebFetch, as stated per entry. Nothing was rendered, so no type, color, layout or video was seen.
- "Observed" means it is in the HTML, CSS or page text I read.
- "Inferred" means I worked it out from markup.
- "Unverified" means I could not check it.
- Every **390px first screen** note and most **motion** notes are inferred, because nothing was viewed at 390px.
- `prefers-reduced-motion` counts cover the page HTML only. Linked CSS and JS files were not searched, so a count of
  0 does not prove a site ignores the setting.
- Vendor pricing is left out of this file.

## 1. Template galleries: is anything strong enough to reopen D2?

**Verdict: no.** None of the four reopens D2. Framer's Gigfolio is the best thing found, and it is worth borrowing from
as a pattern and a data shape. The yardstick was the Riverside preview (https://mishtuk.github.io/Riverside-Website/,
raw HTML, 97 KB, 12 reduced-motion matches) and the local Riverside code.

| What GLucak needs | Riverside base (D2) | Squarespace | Bandzoogle | Framer | Webflow |
|---|---|---|---|---|---|
| Real Spotify player near the top | To build; `Facade` exists | Possible by embed (third-party source); none in demos read | Yes through HTML Code; Bandzoogle warns it won't match the site's style | Unverified; none in demos read | Unverified; none in demos read |
| Next shows in the HTML, not script-loaded | Yes: Riverside injects them per request (`server.js:171`); the shows data itself is not built yet | **No** on the tour block seen (comment says "rendered by Handlebars") | Partly; KJ-52's empty text and past shows are in the HTML | CMS rows in the demo HTML; Gigfolio dates observed | Unverified |
| Past shows drop off by date | To build | Bandsintown handles it (inferred) | Observed ("Previous events") | Unverified | Unverified |
| One-place era swap | To build | Site Styles (third-party source); not one file | Theme Designer; no per-release swap mentioned | Unverified | Unverified |
| Phone Listen and Shows bar | `MobileBar` exists, needs relabeling | Custom work (inferred) | Custom work (inferred) | Custom work (inferred) | Custom work (inferred) |
| All motion off under reduced motion | Under our control | Not controllable by us (inferred) | Not controllable by us (inferred) | 0-1 matches in demos | 0 matches in demos |
| Simple edit screen for small changes | Admin pattern exists | Full editor; simple form unverified | Full editor | CMS editor; unverified for non-designers | CMS editor; unverified |
| Injection tests, own forms | Yes, in our `test/` setup | Vendor's | Vendor's | Vendor's | Vendor's |

**The honest cost of D2:** Riverside is a church site. It has no releases, shows list or merch model; `ComingUpStyles` is
the nearest thing. Gigfolio ships all three on day one. That is a build cost for us, but it does not outweigh the
control over motion, the era swap and the edit screen. The same gaps show up here as in `wix-templates.md`: fixed colors,
built-in players, and navs that hide Music or Shows.

### 1a. Squarespace
- **Read:** gallery page by curl and WebFetch: a shell (no templates in the page text; the music URLs I tried returned the
  generic page). Demos read as raw HTML: `vandam-fluid-demo.squarespace.com`, `waverly-fluid-demo.squarespace.com`. Names of
  music-suited templates (Vandam, Kitui, Jasonwild, Waverly, Cruz, Sidney) come from a third-party guide,
  https://www.jpkdesignco.com/blog/best-squarespace-templates-for-musicians-and-bands. Only Vandam and Waverly were read.
- **Vandam:** nav Tour, Press, Merch (no Music). Home: image -> album promo with product blocks -> Upcoming Dates (4 rows, See Full
  Schedule) -> Merch -> Press -> newsletter in the footer. Lorem ipsum in product text.
- **Waverly:** nav Bio, Photos, Contact Me. Home: one line about the artist -> email sign-up -> bio teaser -> 2019 tour
  list -> contact.
- **Player:** none in either demo's HTML. **Motion:** no video found; reduced-motion 0.
- **Finding:** both demos ship the text "This newsletter signup form needs a storage option" in their HTML. The genre study
  saw this on live artist sites, so that failure looks like a template default that shows until the owner connects storage (inferred).
- **Steal:** Waverly's sign-up promise, "to be notified of upcoming sets": it says what the email is for.
- **Avoid:** tour blocks fed from another service, with nothing in the page HTML (see nobigdyl., 2b).
- **Verdict: no.** Good for an artist who edits layouts personally. Neither demo reaches the Riverside yardstick.

### 1b. Bandzoogle
- **Read:** `/pricing` by raw HTML; `/features/design` by WebFetch; help articles from search result summaries (not opened);
  KJ-52's live site as the real example (2d). No template gallery was read: `/templates` and `/examples` returned 404.
- **Offer:** "dozens" of presets (no count given), Theme Designer, font upload, custom CSS, built-in player, tour calendar,
  mailing list, store, all in one account.
- **Player:** Spotify goes in through HTML Code. Bandzoogle says the widget won't take on the site's colors and that it
  doesn't support external embeds (https://bandzoogle.com/help/articles/443-embedding-a-spotify-player).
- **Shows:** the best empty state in this file comes from here, through its Bandsintown feature (see 2d).
- **Weight:** KJ-52's home HTML is 627 KB and his music page 1.28 MB, against 97 KB for the Riverside preview. HTML size
  only; other sites may load more through scripts.
- **Avoid:** "Powered by Bandzoogle" stays in the footer on KJ-52's site, and the nav there shows how lists grow to 9 items.
- **Verdict: no.** This is the most practical all-in-one, and its fan tools are real. The look is less controllable, and a
  Spotify embed is a side door here, while the Spotify player is one of the client's two explicit asks.

### 1c. Framer
- **Read:** category page by raw HTML (at least 50 distinct template slugs; my listing stopped at 50). Five listing pages by
  raw HTML. Four demos by raw HTML, which is server-rendered and so readable: Gigfolio, Headliner, Nightwave, Vesper Music.
- **Gigfolio** (https://www.framer.com/marketplace/templates/gigfolio/, published October 2026, free to remix, license
  "Limited"): nav Music, Tour, Video, Merch, Press, Contact plus Listen. Hero: artist name, **Listen now / Tour dates**, then a
  status line ("Low Light · out 14 November", "Eight rooms · Nov to Dec 2026", "LP, cassette and tees in the shop"), which is
  probably a ticker (17 ticker or marquee matches, inferred). Then 02 Music, 03 Tour, 04 Video, 05 Records. CMS collections:
  Releases, Tour Dates (ticket link, sold-out status), Merch (Buy link to your own shop). Has an "Edit Me" guide.
- **Nightwave:** a release page with a labelled audio player that can be paused and scrubbed; the listing says no autoplay.
- **Headliner:** one-action concert landing page. **Vesper Music:** literal headings (About, Songs, Concert, Contact,
  Stay In The Loop), 2 videos.
- **Motion:** Gigfolio 0 reduced-motion matches. Headliner and Vesper 1 each. Vesper 2 video tags, Headliner 1. No Spotify
  embed in any demo.
- **Steal:** Gigfolio's two hero actions, and its three data sets as a model for our own schema.
- **Avoid:** a moving ticker for facts a fan needs to read. Show them as a static line.
- **Verdict: no, but the best pattern source of the four.** It has the closest fit to a working artist site and a solo
  artist could fill it. Reasons it stops short: one more vendor, motion we don't own, and era swap and show expiry unverified.

### 1d. Webflow
- **Read:** gallery URLs I guessed returned 404. Marketplace pages by raw HTML: Playza, Singer 128, Sofiasound, and
  `/list/music-artist` (5 templates). Demos by raw HTML: Playza, Sofiasound, Singer 128 (its root is a template sales page, so it
  is not a usable demo). All paid. WebFetch failed on the list page (header overflow).
- **Playza:** h1 "Breaks Limits", album blocks repeated, 2 videos, ticker matches. Tour section: "Live Show at 19:00" above "Get
  ready for our upcoming tours".
- **Sofiasound:** About, Discography, "Listen on:" per release, ticker matches.
- **Player:** no Spotify embed in the demos. **Motion:** 0 reduced-motion matches in demo HTML.
- **Steal:** a "Listen on:" row on each release (Sofiasound).
- **Avoid:** album-heavy demos: repeated records and generic lines ("Breaks Limits", "Sound Without Limits") assume a large
  catalog and could be any artist. That is the same weakness the Wix pass found.
- **Verdict: no.** Lowest value of the four for this job.

## 2. Independent peers

Candidate results: **NEFFEX, Ruslan and nobigdyl.** are live and used. **Connor Price** is out: `connorpricemusic.com` is a
Shopify password page reading "Our website is currently under construction", with an email box, so it fails the live test.
A 2025 Wayback snapshot returned a small page that I did not review. `connorprice.store` and `connorprice.shop` exist but were
not confirmed as official, so I did not use them. **Swaps checked:** KJ-52 added (real finding). Zauntee added as Tier B, one
pattern. Rapture Ruckus (retired, farewell notice) and Austin Ryder (country, not this lane) rejected. Domains I guessed for
Ibabylon, Citizen Soldier, Jon Keith and Aaron Cole gave nothing. That only rules out the guesses; their real sites may exist.

Five live sites: four Tier A, one Tier B. I stopped at five rather than pad with thin sites.

### 2a. NEFFEX
- **URL/read:** https://www.neffexmusic.com, raw HTML of home, `/tour`, `/about`, `/content-creators`, sitemap; WebFetch of
  home and tour (both returned a shell). `neffex.com` is a "For sale" GoDaddy site, not his.
- **Tier:** A. Closest genre mix; independence taken from the brief, not re-verified.
- **Nav:** burger plus cart; labels not in the HTML I read. Sitemap pages: home, about, content-creators, tour, contact-us,
  journal.
- **Home top to bottom:** one Squarespace section with a 15-second hosted background video, no text or buttons in the page
  HTML -> footer with six social icons. Almost nothing else.
- **Player:** none; Spotify, Apple and SoundCloud icon links.
- **Shows:** `/tour` is titled "Born a Rockstar Tour" and has **no dates**. It holds a YouTube video, a social row and one
  button: **"Where Should I Tour Next?"**, linking to a Laylo page. The Laylo page came back as a shell, so what it collects is unverified.
- **Merch:** cart link only; no shop link or products found.
- **390px first screen (inferred):** full-width video, logo, burger. No visible way to listen except icons, if they are
  in view. Unverified.
- **Flash/motion risk: unverified, treat as high.** Looping background video with unknown cuts; 0 reduced-motion matches.
- **What makes it work:** the tour page turns having no dates into a question to fans.
- **Steal:** the question as a button. About page uses plain headings, "The Music" and "The Purpose".
- **Avoid:** a text-free home. `/journal` slugs ("searching-for-succulents") look like template leftovers (inferred).
- **Verdict:** the tour page passes the one-photo, two-shows test. The home does not help a first-time visitor.

### 2b. nobigdyl.
- **URL/read:** https://www.dyllie.com (`nobigdyl.com` redirects here), raw HTML of home, `/shows`, `/listen`, `/booking`,
  sitemap; WebFetch of `/shows`. Squarespace, with `dyllie.com` as the main domain. Designed by a studio (413 Creatives).
- **Tier:** A. Left Capitol to go independent per Rapzilla; 2026 label status not confirmed.
- **Nav:** store, about, shows, listen + watch, podcast, booking, contact. Icon row for Spotify, Apple, YouTube and socials.
- **Home top to bottom:** tagline "renaissance is here." -> "HOLY SMOKE! 2026 TICKETS" -> "the people we became / STREAM NOW" ->
  footer line **"listen. store. book me."**
- **Player:** none; `/listen` is two cover grids (audio, video) linking to smart links.
- **Shows:** `/shows` is headed "nobigdyl. live" with a Squarespace tour block fed by Bandsintown. Nothing is in the HTML, and
  WebFetch saw an empty section. Whether dates appear after scripts run is unverified.
- **Merch:** external `nobigdyl.myshopify.com`.
- **390px first screen (inferred):** cover image with two calls to action and a menu. Unverified.
- **Flash/motion risk: low (inferred).** No background video on home; parallax setting is off in the config; reduced-motion
  0. `/booking` has a video block.
- **What makes it work:** three plain words at the bottom of every page cover the visitor's next step.
- **Steal:** the short action line at the end of each page.
- **Avoid:** staleness. On 2026-11-02 the home still sells 2026 Holy Smoke tickets; search sources date that festival to August
  2026. Its link (`https://INDIETRIBE.UE`) did not resolve from curl (single attempt). Footer says ©2023.
- **Verdict:** the structure is simple enough to sustain, and this site shows what happens when it isn't kept up.

### 2c. Ruslan
- **URL/read:** `ruslankd.com` redirected to https://blessgod.co/pages/live on my first curl; later requests returned 429 or
  405. Raw HTML of that page and the shop home. WebFetch failed (429). A Shopify store, not a music site.
- **Tier:** A. "Indie to the core" per Rapzilla (2021); the store's "15,000" count is the store's own claim.
- **Nav (from page text; menu grouping inferred):** Movement, YouTube, Podcasts, Bless God Summit, FAQ, Patreon, Ruslan KD Tour,
  Contact, Bless God Shop Support, Book Ruslan KD, Godly Ambition Book.
- **Home top to bottom:** 3-slide hero -> ticker "ENCOURAGE | EMPOWER | INSPIRE | TRUSTED BY 15,000" -> "LIVE A LIFE THAT BLESSES
  GOD" -> Best Sellers -> Ruslan's Picks -> Shop by style.
- **Player:** none on the pages read. **Merch:** the whole site.
- **Shows:** `/pages/live`: slideshow, then a Bandsintown widget. Config: Follow section at top (button "FOLLOW"), **Play My
  City** at the bottom, RSVP hidden. Rendered result unverified.
- **390px first screen (inferred):** shop slide with a Shop button. Music absent.
- **Flash/motion risk: medium (inferred).** Autoplay muted loop video, carousel, two marquees at 40 s and 50 s; reduced-motion
  0. No flashing seen in code; video content unverified.
- **What makes it work:** the name domain lands on the live page, not the shop. The mission is the brand: one line, three words.
- **Steal:** a request-my-city option even on a working tour page.
- **Avoid:** a leftover testimonial, "I love Amla!..." on a prayer journal hero, repeated across slides (template leftover,
  inferred). A "Sign up and get 10% off" offer needs a shop to exist first.
- **Verdict:** only the live page passes the test. The store model fails it.

### 2d. KJ-52
- **URL/read:** https://kj52.com, raw HTML of home, `/shows`, `/booking`. Live Bandzoogle site, also read as a real test of
  that platform.
- **Tier:** A (inferred). Recent releases are sold from his own site and earlier ones were crowdfunded; "independent" is not
  stated outright in what I read.
- **Nav:** Store, kj52 box set, About, Music, Shows, Photos, Contact, Videos, Booking (9 items; Shows fifth).
- **Home top to bottom:** mailing-list bar "Join our mailing list for the latest news" -> "Make a donation to Kj52's ministry"
  -> release players with Download -> store items. Long.
- **Player:** Bandzoogle's own, with track lists and downloads. No Spotify embed.
- **Shows:** the best empty state found. Exact text: **"There are no upcoming events right now."** then **Follow us** and
  **Request a show** (both go to Bandsintown), then a **Previous events** table with date, event and location. A dated
  list of past shows keeps a quiet page looking active.
- **Merch:** native store with Printful products, CDs, books.
- **390px first screen (inferred):** nav and the mailing-list bar. Unverified.
- **Flash/motion risk: low (inferred).** No video tags or keyframes in the home HTML; the player's script names a title
  marquee. Reduced-motion 0.
- **What makes it work:** dated facts. It is plain, but it looks current.
- **Steal:** the three-part empty state, and releases sold only on his own site, for a limited time (per a December 2025
  Jesus Freak Hideout item; not confirmed on the site).
- **Avoid:** a donation ask above the music; 9 nav items; download-heavy pages.
- **Verdict:** passes the test best of the five. Two shows and a good empty state would work here.

### 2e. Zauntee
- **URL/read:** https://www.zauntee.com, raw HTML and WebFetch (partial); `/tour` came back empty; `/music` and `/video`
  404. Wix site.
- **Tier:** B. Signed to Atlantic per 2024 reports; current status unclear. One pattern only.
- **Nav:** tour, shop, music, video, book, plus OUT NOW!
- **Home:** banner -> OUT NOW! release image -> Tour image -> **Text** (a phone number linked to a Community SMS page) -> Email ->
  Follow. Tour widget not captured.
- **Player:** none; music goes to an external page. **Merch:** `shop.zauntee.com`.
- **390px first screen:** unverified. Wix serves a `width=320` viewport to phones.
- **Flash/motion risk:** unverified; a Video Player element is on the home.
- **Steal:** five plain lowercase nav words, each one a thing to do.
- **Avoid:** a nav "video" item that points back to the home.
- **Verdict:** one useful pattern; the SMS line depends on a paid-style service (unverified).

## 3. The five questions

**1. What do small sites show with few or no shows?**
The best do not hide the page. KJ-52: one honest line, Follow, Request a show, then past shows. NEFFEX: a question button in
place of dates. Ruslan: Follow plus Play My City. The weak versions are a blank section (nobigdyl., as read) and a stale ad for
a past event. Bandsintown feeds four of the five (not NEFFEX). KJ-52's Follow and Request a show come through it, but
nobigdyl.'s Squarespace block shows neither in the HTML, so the empty state depends on how it is embedded (inferred).

**2. What puts Listen and Shows one tap away on a phone?**
No peer does it. None of the five has a bottom bar or a persistent Listen and Shows pair in the HTML (bars are inferred absent;
nothing was rendered). Closest are Gigfolio's two hero buttons, which are only on the hero, and Zauntee's plain nav. Riverside's
`MobileBar` is the only true bar found. One catch: it **hides on scroll down** and returns on scroll up, so it is not always one tap away.

**3. Does the phrase-as-heading with a small literal kicker read well?**
Nothing here can settle it: no site was rendered and no fan test exists.
- *For:* Gigfolio uses exactly this: `03 / Tour` (12px) above "Eight rooms, Nov to Dec"; `04 / Video` above "Slow Burn, one
  take" (52px); `05 / Records` above "Every record". Sizes are desktop CSS values. Its kicker words match its nav words, which
  is what lets a visitor recognize the section. Playza places "Live Show at 19:00" above "Get ready for our upcoming tours".
  Sofiasound places "About me" above "Behind the Scene" (position only; sizes not checked). Riverside's own headings are
  phrases ("Sunday messages, anywhere."), though without kickers: only its hero has an eyebrow.
- *Against:* every example found is a template demo. None of the five real artist sites does it. They use literal headings
  ("The Purpose", "audio.", "Previous events") or none. Ruslan is the nearest: his one slogan line sits above a literal
  "Best Sellers", once, not section after section.
- *The main difference:* template phrases carry content. "Eight rooms, Nov to Dec" tells you what is below it; LIVE IT LOUD
  does not say shows. In that case the 12-13px kicker does all the labeling, and the big text is what a thumb-scrolling fan sees first.
- *Not seen anywhere:* one sentence split across four section headings.
- *Mission without preaching (seen):* NEFFEX puts purpose in one plain first-person paragraph on About. Ruslan uses one line and
  a ticker. KJ-52's "ministry" donation ask, placed above the music, is the version that reads most like an appeal.

**4. What sign-up hook works without spending anything?**
A specific promise tied to a next event. The evidence is about wording only: **no site publishes sign-up rates**, and Laylo's
conversion claims are vendor claims. Seen: "Where Should I Tour Next?" (NEFFEX), "notified of upcoming sets" (Waverly), Follow and
Request a show (Bandsintown, no list of your own needed), a site-only release (KJ-52). Weakest: "latest news" (KJ-52). Needs a
shop first: "10% off" (Ruslan).

**5. Does any gallery beat D2?**
No, for all four (section 1). Framer's Gigfolio comes closest, and its data shape and hero pair are worth taking.

## 4. Top 5 steals, ranked
1. **KJ-52's empty Shows state:** one honest line, Follow, Request a show, then a dated past-shows list.
2. **NEFFEX's question as the hook:** "Where Should I Tour Next?" asks for something a fan wants to give.
3. **Gigfolio's data shape and hero pair:** Releases, Tour Dates (ticket link, sold-out) and Merch (Buy link), with Listen now
   and Tour dates up front.
4. **KJ-52's site-only release:** a limited track or EP gives people a reason to visit that costs nothing but the file.
5. **nobigdyl.'s closing action line:** three plain words at the end of every page.

Also seen: staleness comes from leftovers. Template defaults, past-event ads and old copyright years were all live or
shipping by default (nobigdyl., Ruslan, Squarespace demos).

## 5. Unverified
- Everything visual: all 390px first screens, type, color, actual kicker size on phones. A Chrome pass at 390px is still needed.
- NEFFEX's background video content and cuts (flash risk), and any text placed over it. This one matters for the hard rule.
- Whether nobigdyl.'s, Ruslan's and Zauntee's tour widgets show dates after scripts run.
- What Laylo's page collects, and whether Bandsintown's follow and request tools cost anything.
- Whether `INDIETRIBE.UE` is really dead: one failed curl lookup.
- Independence of KJ-52 (inferred) and nobigdyl. in 2026; NEFFEX not re-checked; Zauntee's current label.
- Squarespace's real music template list; only two demos read. Bandzoogle's template gallery was not read at all.
- Reduced-motion handling in linked CSS or JS on every site and demo.
- Framer and Webflow: Spotify embed behavior, simple editing for a non-designer, automatic expiry of past shows, era-style swaps.
- Bandzoogle help details came from search summaries, not the articles themselves. Search-sourced dates are unconfirmed.
