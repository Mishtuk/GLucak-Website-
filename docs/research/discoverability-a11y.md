# Discoverability and WCAG 2.2 AA audit (Desktop researcher, 2026-11-06)

Proposals only; no site files edited. Audit: fresh `npm run build`, `node server.js` on :4817 (SHOP_ENABLED=1 DEV_EDITOR=1),
Chrome via playwright at 390 and 1280 over /, /music/, /shows/, /about/, /shop/, /shop/#product-sample-glucak-tee, /privacy/,
/edit/. Server stopped afterwards.

# PART 1: Discoverability

## 1.1 Repo state
- `public/` has **no `robots.txt` and no `sitemap.xml`** (both 404 on the running server). No JSON-LD anywhere in `src/`.
- Already good: `<title>`, meta description, canonical (`SITE_URL` + path), OG + Twitter card with a per-page 1200x630 image,
  `lang="en"`; `/edit/` is `noindex`; `/shop/` is `noindex` until `SHOP_ENABLED=1`.
- `SITE_URL` falls back to `https://glucak.com` (not registered yet). Canonical, OG and every URL below use it: set it in the host env.

## 1.2 How independent artists get found
1. **Search for the name.** Fans type "glucak". Win that query: own domain, the exact same name on every profile, `sameAs` tying them.
2. **Streaming profiles are most fans' real home page** (Spotify, YouTube). Claim them; they also feed Google.
3. **Knowledge panel** is automatic. Google "doesn't manually create or delete panels"; descriptions can't be edited, only the
   image and social links via verified suggestions ([Google](https://support.google.com/knowledgepanel/answer/7534842)). Guides
   ([HypeBot](https://www.hypebot.com/getting-google-verified-how-to-claim-your-knowledge-panel),
   [LabelGrid](https://labelgrid.com/blog/guides/google-knowledge-panel-for-musicians/)) say it is built from the official site,
   socials, MusicBrainz, Wikipedia/Wikidata and streaming profiles (secondary sources, not confirmed by Google). No guarantee a new indie gets one.
4. **Show listings** reach people via Google event surfaces, Spotify/Bandsintown and Instagram. Our own list stays the source of truth.

## 1.3 schema.org types
- **MusicGroup**: `name`, `url`, `image`, `genre`, `description`, `sameAs[]`. No Google rich result; it is an entity signal linking
  the official site to every profile. Cheap, do it. (Fran Carroll is a guest, not a member: leave `member` out.)
- **MusicAlbum / MusicRecording**: `byArtist`, `datePublished`, `url`, `image`. Also no rich result; entity clarity only. Released
  items only, never pre-saves. Lower payoff, do after Events.
- **Event** ([Google docs](https://developers.google.com/search/docs/appearance/structured-data/event), read 2026-11-06):
  - Required: `name`, `startDate`, `location` (`Place` with `address`, and `location.name`). Recommended: `description`, `endDate`,
    `eventStatus`, `image`, `offers`, `organizer`, `performer`, `previousStartDate`.
  - `eventStatus`: EventScheduled (default), EventCancelled, EventPostponed, EventRescheduled (`previousStartDate` only with Rescheduled).
  - `offers.url` must lead to where the **public** can buy tickets for **that** event; `price` 0 for free; invite/membership-only is ineligible.
  - **All-day or no time:** use a date-only `startDate` ("2026-12-19"), never a fake midnight. That is our open mic with no `time`.
  - Include a UTC offset if known; otherwise Google uses the venue's zone. Virtual-only is unsupported (online-event
    properties dropped 2025, [SERoundtable](https://www.seroundtable.com/google-event-recipe-structured-data-update-39544.html)); ours are in person.
  - **Still shown in 2026?** The docs list the United States and say nothing about retirement; I found no 2026 report that Event
    rich results were removed (FAQ results were, May 7 2026, [SERoundtable](https://www.seroundtable.com/google-drops-faq-rich-results-41298.html)).
    Google never guarantees display. Worth doing: it is the feed Google's event surfaces read.
  - **Open mics** are valid public events. Skip `offers` unless a real attend/RSVP page exists; a "Details" link is not a ticket link.
  - **Gap:** `shows.json` has `venue` + `city` ("Somewhere, PA") but no street address. A locality+region `PostalAddress` is accepted
    but Search Console will warn; add an optional `address` field (row 5 below).

## 1.4 Platforms (owner / Gabe actions; we only point at them)
- **Spotify for Artists** (artists.spotify.com): free; profile control, concerts, analytics. His artist page exists
  (`.../artist/1SxMTO4oSXDbNSNzxx7cVX`). Claim steps not verified here. **Action: confirm Gabe has claimed it.**
- **YouTube Official Artist Channel**: merges Topic + main channel, adds the badge and music shelf. Needs official releases from a
  distributor/label and one-artist channel; the distributor submits; YouTube can refuse; sources disagree on the release count
  (1 vs 3), [summary](https://ppc.land/youtube-clarifies-official-artist-channel-requirements-with-new-faq/), verify in YouTube Help.
  **Action: ask the distributor (wingsmusic) to request OAC for channel UCha7GtkOI9A0dzbTG3igbLg.**
- **Bandsintown for Artists** (free): vendor says shows sync to Spotify and to Google Search within about 48h, and it offers a
  widget/API ([Spotify](https://artist.bandsintown.com/integrations/spotify), [Google](https://www.artist.bandsintown.com/integrations/google),
  [DMN](https://www.digitalmusicnews.com/2024/02/13/spotify-tries-live-music-discovery-again-with-bandsintown/)). **Yes as a second
  listing (reaches Spotify and trackers); no as our data source.** Keep our own list: Gabe edits it in `/edit/`, past shows drop off
  by themselves, no third-party script or CSP hole. Cost is entering each show twice (3 to 6 a year): add a hint in the editor.
  Don't build a sync. API terms not verified.
- **Google panel claim:** after launch Gabe signs in and searches his name; "Claim this knowledge panel" shows only if a panel
  exists (ID verification, same Google account). Also add the domain in **Search Console** and submit the sitemap.
- **MusicBrainz** entry with his URLs (optional, owner, free): one of the sources guides name.

## 1.5 sitemap.xml + robots.txt
- Add both. Public URLs: `/`, `/music/`, `/shows/`, `/about/`, `/privacy/`, plus `/shop/` only when the shop is on. Never `/edit/`.
- Do not `Disallow: /edit/` (advertises the path); the page already has `noindex` and auth.
- `SHOP_ENABLED` is read per request in `server.js`, so static files are fine now; add `/shop/` when the shop opens.

## 1.6 What to add to OUR site (S small, M medium)
One helper `src/lib/jsonld.js` returns a JSON string; `Base.astro` renders it in `<script type="application/ld+json" set:html>`
via a new `jsonld` prop. **Escape `<` as `<`** (no-injection rule; show text comes from the editor). `type=application/ld+json`
is data, so the CSP `script-src` does not block it (confirm in the test).

| # | Add | Effort |
|---|---|---|
| 1 | `public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://glucak.com/sitemap.xml` | S |
| 2 | `public/sitemap.xml` with the 5 launch URLs (add `/shop/` when on) | S |
| 3 | MusicGroup + WebSite JSON-LD on `/` (shape A) | S |
| 4 | Event JSON-LD on `/shows/` for each upcoming row of `splitShows(...)` (shape B) | M |
| 5 | Optional `address` on shows: `shows.json`, `validateShow`, editor field | M |
| 6 | MusicAlbum / MusicRecording on `/music/` from `releases.json`, released only | M |
| 7 | Build `sameAs` from `SOCIALS` in `content.js` (no duplicate data) | S |
| 8 | `og:url`, `og:site_name`, `og:locale` in `Base.astro` | S |
| 9 | Editor hint: "also add it on Bandsintown" (owner decision) | S |

**Shape A** (home; values from `content.js` `SOCIALS`):
```json
[{"@context":"https://schema.org","@type":"MusicGroup","@id":"https://glucak.com/#artist","name":"GLucak",
  "url":"https://glucak.com/","image":"https://glucak.com/media/og/home.png",
  "genre":["Hip hop","Electronic","Rock"],
  "description":"Epilepsy survivor and Producer-Rapper/DJ GLucak makes energetic, faith-based music.",
  "sameAs":["https://www.instagram.com/glucakofficial/","https://www.threads.com/@glucakofficial","https://x.com/GLucakOfficial",
   "https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg","https://soundcloud.com/glucak",
   "https://open.spotify.com/artist/1SxMTO4oSXDbNSNzxx7cVX","https://patreon.com/GLucakMusic"]},
 {"@context":"https://schema.org","@type":"WebSite","name":"GLucak","url":"https://glucak.com/",
  "publisher":{"@id":"https://glucak.com/#artist"}}]
```
Add Apple Music / MusicBrainz / Wikidata to `sameAs` only when they exist. `genre` needs Gabe's OK.

**Shape B** (one per upcoming `shows.json` row `r`; `ET` = `-05:00` or `-04:00` for that date in America/New_York via `Intl`):
```json
{"@context":"https://schema.org","@type":"MusicEvent",
 "name":"GLucak at {r.venue}",                    // open-mic: "Open mic at {r.venue}"
 "startDate":"{r.date}T{r.time}:00{ET}",          // no r.time: just "{r.date}"
 "eventStatus":"https://schema.org/EventScheduled",
 "eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode",
 "location":{"@type":"Place","name":"{r.venue}","address":{"@type":"PostalAddress",
   "streetAddress":"{r.address, if set}","addressLocality":"{city before comma}",
   "addressRegion":"{state after comma}","addressCountry":"US"}},
 "performer":[{"@type":"MusicGroup","@id":"https://glucak.com/#artist","name":"GLucak"},
              {"@type":"Person","name":"{r.with}"}],        // second entry only if r.with
 "image":["https://glucak.com/media/og/shows.png"],
 "organizer":{"@id":"https://glucak.com/#artist"},
 "offers":{"@type":"Offer","url":"{r.link}","availability":"https://schema.org/InStock","priceCurrency":"USD"}}
```
Rules for the test: `offers` only when `type==='show'` and `link` exists (never for open-mic or "Details"); omit `price` until Gabe
gives one (don't guess); only upcoming rows (past shows get no markup); city without a comma goes whole into `addressLocality`;
output parses and contains no raw `<`. `MusicEvent` is a subtype of `Event`, so Google treats it as Event.

---

# PART 2: WCAG 2.2 AA audit of the built pages

Method: DOM scan (landmarks, headings, names, alts, fields), tab walk (up to 260 stops/page) at both widths, computed-style
contrast of every text node on 14 views, root font 200% (text-only zoom), reduced motion both ways, Motion switch, signup error,
mobile menu. **`src/eras/` contains only `placeholder.json`**; I also computed the two prototype eras (`prototype/data.js`).

## Findings, worst first

| # | Sev | WCAG | Page | Evidence | Owner | Fix |
|---|---|---|---|---|---|---|
| 1 | High | 1.4.4 Resize Text, 1.4.10 | `/`, `/shows/` at 390 (`/edit/` too) | Root font 200%: scrollWidth 621 vs 390 and `body{overflow-x:clip}` cuts it: hero **Shows** button runs off-screen, poster photo overlaps the Tickets button, brand "GLUCAK" collides with "Menu", the "Music" label overlaps hero text, bottom bar labels touch; `/edit/` Products tab clipped. 1280 fine | Laptop | Let hero buttons wrap, `min-width:0` on `.row-text`, poster art `max-width:100%`, size the bottom bar in rem with wrap; re-test at 200% |
| 2 | High | 2.4.1 Bypass Blocks | `/`, `/music/` | The Spotify iframe takes **about 140 Tab presses** (140 iframe stops at both widths) before focus reaches the rest of the page. Not a trap (focus leaves) but no way past it | Desktop | Add a "Skip the player" link before it, or load the embed on tap like the `a.yt` facade |
| 3 | Med | 1.3.1, 2.4.6 | `/music/` | **No `<h1>`**: first heading is `<h2>Music Rise</h2>` | Desktop | Make the spine heading the h1, as `/shows/` and `/about/` do |
| 4 | Med | 2.4.4 Link Purpose | `/music/` | **9 links named "Listen"** to 9 different URLs; 2 named "Pre-save" (Who I Am vs Scenic Route) | Desktop | `aria-label="Listen to {title}"` / `"Pre-save {title}"` (starts with the visible word, so 2.5.3 holds) |
| 5 | Med | 2.4.4 | `/`, `/music/` | Same name, different targets: nav "Shows" `/shows/` vs hero "Shows" `#shows`; form **Join** button vs bottom-bar **Join** `#join` | Desktop | Name the hero link "Next shows" (or point it at `/shows/`); label the form button "Join the list" |
| 6 | Med | 1.3.1 | `/shows/` | h1 jumps to `<h3>Played</h3>` and `<h3>Latest video</h3>` | Desktop | Make both `h2` (keep the look with the class) |
| 7 | Low | 3.3.1, 4.1.3 | every page (footer signup) | `#email` has no `aria-describedby` or `aria-invalid`. A bad address shows the browser's native bubble (readable); our `role=status` line stays empty and appears only for server errors | Desktop | `aria-describedby="signup-status"` on the input; set `aria-invalid` and focus the field when our message shows |
| 8 | Low | 2.4.3 | mobile menu | `<details>` menu focuses "Music" on open but is not modal: Tab runs on into the page behind, sheet stays open; Escape works only with focus in the page. Not a trap | Desktop | Close on `focusout` of `.nav-mobile` |
| 9 | Low | 2.4.7 | `/`, `/music/` | Spotify iframe shows `outline:none` on our side; any ring inside is Spotify's | Laptop | Accept; note in DESIGN.md section 9 |
| 10 | Low | 2.4.3 | `/shop/#product-...` | Product detail has no way back to the grid except the Back button or Shop nav | Laptop | Add a "Back to all merch" link in the detail |

## Passed (evidence)
- **Landmarks:** public pages have `header`, `nav[Main]`, `nav[Main menu]`, `main`, `footer`, Quick-actions `nav`; `/edit/` has `main`
  + `form` only (by design). One h1 on 7 of 8 pages (music: finding 3). `lang="en"`; unique `<title>` per page.
- **Skip link** is the first Tab stop on every page and targets `#main`.
- **Names and alts:** 0 empty link/button names; 0 images missing `alt` (decorative ones use `alt=""`: 6/7 home, 6/11 shop, 10/10
  edit icons). Email has a `<label>`; honeypot is `aria-hidden`, `tabindex=-1`, off-screen. `/edit/` file inputs have labels and
  `aria-describedby` hints; messages use `.status`/`.alert` regions.
- **Focus visible (2.4.7, 2.4.11, 2.4.13):** every stop has a 3px solid `text` ring (#f5f5f5), offset 3px (4px on shop cards): 17.3:1
  on `bg`, 3.03:1 beside the accent; the offset keeps it on the page background. `scroll-padding` clears the fixed header and
  bottom bar: no focused item was covered.
- **Target size (2.5.8):** 0 targets under 24px; all focusables at least 44px high at 390 and 1280.
- **Motion:** device no-preference: 1 animation on Home; switch reads "Motion: on" (`aria-pressed=true`); click leaves 0 animations
  and "Motion: off". Device reduce: 0 animations and the button reads "Motion: off (device setting)", disabled. Spotify's marquee is
  out of reach (accepted D19).
- **Reflow (1.4.10):** at 320 / 640 CSS px (200% browser zoom of 390 / 1280) no page scrolls sideways.
- **Text contrast:** lowest **5.71:1** across all text styles on 14 views; no text under 16px. Not covered: text laid directly over the
  hero photo (the scan sees only the page color); DESIGN.md section 12 measured 4.60 to 6.18 there. Re-measure when real photos or an era change.
- **Tab order:** DOM order matches visual order (skip, brand, menu/nav, content, signup, footer socials, Motion, Privacy, bottom bar). No trap.

| Era | text/bg | muted/bg | accent/bg | accent-text on accent | text on accent (unused) |
|---|---|---|---|---|---|
| placeholder (`src/eras/`) | 17.32 | 9.01 | 5.71 | 5.71 | 3.03 |
| placeholder-b (prototype only) | 16.83 | 8.77 | 10.12 | 10.12 | 1.66 |
| identity-guess (prototype only) | 17.24 | 9.69 | 5.33 | 5.33 | 3.23 |

All text pairs clear 4.5:1 and accent/bg clears 3:1. Never set `text` or `muted` on `accent` (1.15 to 3.23): buttons stay
`accent-text` on `accent`, as built. Only one era file is shipped, so the D12 era test checks one file today.

## Not verified
- Real screen readers (NVDA / VoiceOver); real phone text-size at 200% (this used CSS root font scaling in Chrome).
- Hero text over real photos in a new era.
- `/edit/` signed-out sign-in and error states (DEV_EDITOR skips login); the prototype checks cover them (DESIGN.md 12, 15h).
- Shop switched off; a host with `SITE_URL` set.
