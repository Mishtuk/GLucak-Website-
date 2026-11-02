# Design references (designer research, 2026-11-02)

Method note: Wix template preview pages (`wix.com/website-template/view/html/wh-XXXX`) are JS shells; the fetch returns only the listing blurb ("Good for", feature description), not the live demo layout. Home structure below is therefore the template's published description plus the standard pattern for that template type. **Chrome pass still needed to open each demo and screenshot it** (Desktop's job per CONTEXT split). Manafest, Puck Live and Riverside were read from source/live HTML; TFK from a Wayback snapshot (live site is a "Coming soon" Squarespace page today).

## 1. Wix Music templates (picked 7 of the 12 on page 1 of the category)
Category: https://www.wix.com/website/templates/html/music (14 pages; only page 1 read).

| # | Template | URL | Why for GLucak |
|---|---|---|---|
| 1 | DJ (Electric) | https://www.wix.com/website-template/view/html/wh-1430 | "Convey the energy of live performances"; DJ + upcoming events + ticketing (Wix Events). Closest to EDM side. |
| 2 | Music Portfolio (Nocturnal) | https://www.wix.com/website-template/view/html/wh-1075 | Dark artist site with Events (tickets) + Stores (merch) in one. Maps to Shows + Shop. |
| 3 | New Album Landing Page (Cutting-edge) | https://www.wix.com/website-template/view/html/wh-1383 | Track showcase + event details. Model for the IDENTITY countdown/pre-save hero. |
| 4 | New Album Landing Page (Empowering) | https://www.wix.com/website-template/view/html/wh-1375 | Same job, bolder tone; compare for faith/"Rise" energy. |
| 5 | Music Festival (Dramatic) | https://www.wix.com/website-template/view/html/wh-1240 | Lineup/schedule + ticket blocks; borrow the show-card rhythm. |
| 6 | Producer (Sleek) | https://www.wix.com/website-template/view/html/wh-1374 | Clean project showcase; for the producer side, Music/Releases grid. |
| 7 | K-Pop Band (Bold) | https://www.wix.com/website-template/view/html/wh-1385 | Bold type, fan-update schedule, Wix Events. Big-type reference. |

Common structure across them (from descriptions, verify in Chrome): full-bleed hero (artist/album + one primary button) -> music/tracks block -> events list with ticket buttons -> (some) store strip -> footer socials/sign-up. Nav is short (Home, Music, Events/Shows, About, Shop/Contact).

Borrow: ticket button on every show row; hero that is one image + huge type + one CTA; events and store as native sections, not afterthoughts. Don't copy: layouts, their art, Wix-specific widgets. Note in DESIGN.md which of these were actually screenshotted.

## 2. Manafest (https://manafest.com)
Read from live HTML (Go High Level custom page, dark, Archivo/Barlow type, single long page, scoped CSS `#mf`).
- Nav (5 things only): Music (-> YouTube), Fighter Club (fan club page), New album (in-page anchor), Contact, and a button **"Order the album"** (-> manafestshop.com).
- Home top to bottom: full-bleed live photo (hands raised) + album title "Sleep Walker Awake" + two buttons **Order the album / Listen on Spotify** -> album block (cover, order + Spotify) -> **Watch** (videos, "All videos on YouTube") -> story ("Twenty years", "shows across four continents", Hear the album on Spotify) -> **Fighter Club** fan-club signup ("Join", "Free CD for ..., Claim the free CD") -> footer: YouTube, Spotify, Shop.
- Player: no embedded player on the page I could read; Spotify is a button. Shows: no tour list found in the HTML (may be loaded by script; unverified). Merch: separate shop domain via the nav button.
- What makes it work: black ground, one huge live photo, two buttons above the fold, very few nav items, a named fan community with a reward. Steal: the two-button hero (Listen / Shows), the fan-club-with-a-free-thing hook (-> our email list), restraint.

## 3. Thousand Foot Krutch (https://thousandfootkrutch.com)
Live site today: Squarespace "We're under construction" placeholder, so use Wayback: http://web.archive.org/web/20240112010502/https://thousandfootkrutch.com/ (WordPress, Bootstrap).
- Nav: Music, Videos, Photos, Bio, Shop (+ carousel Previous/Next).
- Home: carousel hero -> **Music: "New Album Available Now"** with Spotify embed -> **Video** (two YouTube embeds: "Push", "Running With Giants") -> Instagram feed -> "Join the tfk mailing list" form.
- The Spotify embed, as they did it (old API, now superseded):
  `<iframe src="https://embed.spotify.com/?uri=spotify:album:5SSyCOE8tODWLeD70l1oyx" width="400" height="400px" frameborder="0" allowtransparency="true">` floated left beside text. We use the current `open.spotify.com/embed/playlist/<id>` format (section 6), full width on phones, lazy-loaded.
- Steal: player sits right under the hero in the "Music" block; videos right after; mailing list last. Avoid: fixed 400px width (breaks on phones), carousel hero.

## 4. Puck Live (anti-reference): https://www.puck-live.com (old pucklive.com 301s here)
Doylestown, PA venue (Great Barn Brewery group). Read live; concrete failures:
1. **Address conflict**: title says 14 East Court Street, "Visit Us" says 1 Printers Alley. Wrong info is the worst failure; one source of truth for every fact.
2. **Hours** at the very top with no label and Mon-Wed missing; address/phone buried at the bottom.
3. **Nav bloat/redundancy**: 9 items incl. "Home" (logo already does it), "Log In" (pointless to visitors), footer lists "Cocktail Lounge" that isn't in nav or body.
4. **Label mismatches**: nav "Bookings" vs body "Band Bookings"; CTAs say "Inquire"/"Details" vs headings; two unlabeled "Menu" links (food? drink?).
5. **Inconsistent ticket labels**: "RSVP" vs "Buy Tickets" for the same kind of event; start times vary unexplained.
6. **Shows hidden behind "Load More"**, no calendar view; menus open as PDFs (bad on phones).
7. **Stale signals**: footer "Copyright 2025" in 2026, typos ("Faire"). Our fix: year auto-generated, past shows drop off by date, one label per action ("Tickets"), nav of 5-6 with exact names.

## 5. Riverside layout (local, reusable): V:\RiversideWebsite (Astro)
- `src/pages/index.astro` composes: `Base` layout + `Header overlay` + home sections in order **Hero -> NewHere -> (coming-up injected block) -> LatestMessage -> PodcastTeaser -> GetInvolved -> GiveBand -> Visit** + `Footer`, plus JSON-LD (Church/Event; our MusicGroup/Event equivalent).
- Hero (`components/home/Hero.astro`): full-bleed muted looping video with poster + portrait phone variant, eyebrow, big H1, sub line, two buttons (Plan your visit / Watch live), a "Live now" pill. Video there plays under reduced motion by owner's call; **for GLucak it must stop under `prefers-reduced-motion` and have a pause button** (hard rule).
- Nav (`lib/site.ts` NAV): I'm New, About, Watch, Podcast, Get Involved, Groups, Events, plus a single accent button (Give). Header is transparent over the hero, goes solid after scroll via IntersectionObserver; mobile is a `<details>` sheet (no framework) with focus handling.
- `MobileBar.astro`: phone bottom action bar (Visit / Watch / Give / Directions), hides on scroll down. **Perfect for GLucak: Listen / Shows / Merch / Follow = "one tap from every page".**
- Reusable as-is or lightly re-skinned: `Header`, `MobileBar`, `Hero` (swap content), `LatestMessage` + `VideoCard` + `lib/youtube.ts` (latest video via channel feed), `Facade` (click-to-load embeds; use for Spotify/YouTube), `Footer`, `Cta`, `Faq`, `PageHead`, `LiveBanner`, `lib/site.ts` (single source of site facts), `lib/md.ts`, `styles/global.css` tokens, `manifest.webmanifest.ts`, `sitemap/robots`, `ComingUpStyles` (upcoming-events block, model for Shows). Church-only: GiveBand, NewHere, GetInvolved, Visit, Groups, email/admin/stats modules (admin/edit screen patterns could inform Gabe's edit page).

## 6. Spotify embed facts
- Get the code: playlist > ... > Share > Embed playlist (official tutorial: https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed). Official snippet (track example; same shape for playlists):
```html
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/<PLAYLIST_ID>?utm_source=generator"
  width="100%" height="352" frameborder="0" allowfullscreen=""
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
```
- Heights: **352** = full (cover + tracklist, right for the Home player); **152** = compact (single row, good for a sticky/secondary "Go" player). Tracks default to 152 in many helpers; playlists/albums use 352. Width 100%.
- Optional `&theme=0` for dark. Programmatic control: Spotify iFrame API (`https://open.spotify.com/embed/iframe-api/v1`, `loadEntity`) -- only needed if we swap the playlist per era.
- CSP (our rules): `frame-src https://open.spotify.com;` and, if using the iFrame API script, `script-src https://open.spotify.com`; the player also pulls images/media from Spotify hosts (`img-src https://i.scdn.co`; `media-src`/`connect-src` as Spotify requires; test in the browser console). Not found in official docs I fetched; **verify when building**.
- Consent/cookies: embed sets Spotify cookies; docs give no special consent text. Logged-out visitors get 30-second previews and a login prompt (tell fans: "Open in Spotify" button next to it). Cheapest privacy-friendly pattern: load the iframe on click via Riverside's `Facade` (poster + play), but Gabe wants "a real player", so default to real iframe lazy-loaded below the hero with the facade as fallback; mention Spotify in the privacy page.
- Needs from Gabe: the playlist URL (open.spotify.com/playlist/<id>).

## Recommended direction
Dark, big-type, one-photo-hero concept in the Manafest mould (black ground, huge live photo, two buttons above the fold), built on Riverside's structure (transparent header over hero, phone bottom action bar, facade embeds, single site-facts file), with the IDENTITY palette as the swappable era tokens. Energy comes from oversized type, color blocks and slow smooth motion (no strobe, nothing flashes, all motion off under `prefers-reduced-motion`, hero video paused by default with a visible pause). The two jobs, Listen and Shows, are persistent: header buttons on desktop, bottom bar on phones.

**Home section order:** 1 Hero (slogan, photo/poster, buttons Listen + Shows) -> 2 Spotify playlist player (352) -> 3 Latest release / IDENTITY countdown + pre-save -> 4 Next shows (3 rows, tickets, empty state "No shows booked, join the list") -> 5 Latest video (YouTube feed) -> 6 Scenic Route spotlight (optional) -> 7 Email sign-up ("Fighter Club"-style hook) -> 8 About teaser -> Footer (socials, Patreon, slogan, auto year).

**Nav (6 max):** Music, Shows, Videos, About, Shop (hidden until live), Contact; plus accent button **Listen** (anchors to player/smart link). Phone bottom bar: Listen / Shows / Videos / Follow.

**Steal:** (1) Manafest's two-button hero over a real live photo. (2) TFK's player directly under the hero, then video, then mailing list. (3) Riverside's overlay header + phone bottom bar + facade embeds.
**Avoid:** (1) Puck Live's conflicting facts and mismatched labels (one source of truth, same word everywhere). (2) Hidden shows behind "Load More"/PDFs, stale footer year, junk nav items ("Log In", "Home"). (3) Carousels/fixed-width embeds and any autoplaying, flashing or parallax motion (TFK-era carousel, Wix template animations): static or slow-fade only.

Open items: Chrome screenshot pass of the 7 Wix demos; verify Manafest shows/tour section (may be script-loaded); confirm Spotify CSP list in browser.
