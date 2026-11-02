# The Riverside layout Gabe likes (Desktop, 2026-11-02)

Owner confirmed: Gabe means **the new Riverside site we built**: repo `Mishtuk/Riverside-Website` (Desktop
`V:\RiversideWebsite`, Laptop `C:\Users\alexm\projects\Riverside-Website`), preview
https://mishtuk.github.io/Riverside-Website/. Not the church's old live site, not the band. Repo at a1201f8.
Screenshots (desktop 1568px): `shots/riverside/hero.jpg`, `new-here.jpg`, `latest-message.jpg`.

## What the layout is
Home (`src/pages/index.astro`, 7,233px tall at desktop), one idea per band, bands alternate backgrounds:
| # | Section (component) | Height | What it does |
|---|---|---|---|
| 1 | `home/Hero.astro` | 940 | Full-bleed muted looping video (poster first, per-device files, pause button), dark scrim. Eyebrow "HORSHAM, PA", big serif headline with an italic gold phrase, one-line sub, **two buttons** (Plan your visit / Watch live). A thin info strip pinned to the hero bottom: service times · address · pause. Turns into a live-stream player on Sundays. |
| 2 | `home/NewHere.astro` | 1,093 | Left: sticky big heading "New here? *We saved you a seat.*" + CTA. Right: numbered steps (1, 2, 3) with photo + heading + text link. |
| - | coming-up slot | - | Upcoming events injected by the server (`<!--rs:coming-up-->`), so it is always current. |
| 3 | `home/LatestMessage.astro` | 1,201 | Latest YouTube video (click-to-load `Facade.astro`, no YouTube until you click) left, date + title + "All messages" right. |
| 4 | `home/PodcastTeaser.astro` | 656 | Podcast band on stone background. |
| 5 | `home/GetInvolved.astro` | 1,024 | Cards to the ways in. |
| 6 | `home/GiveBand.astro` | 837 | Feature band (parchment), one ask. |
| 7 | `home/Visit.astro` | 776 | Times, map, address: the closing ask. |
| - | `Footer.astro` | - | Dark, brand + tagline + socials, then Visit / Contact / Explore columns. |

Chrome around it:
- **Header** (`Header.astro`): transparent over the hero, turns solid once the hero scrolls away (IntersectionObserver,
  works without JS). Logo left, 7 nav links, one gold pill button (Give) on the right. Phones: a `<details>` menu
  sheet with the links plus the practical info (times, address, call, Give). No JS framework.
- **Phone bottom bar** (`MobileBar.astro`, <700px): 4 icon actions (Visit, Watch, Give, Directions); hides on scroll
  down, comes back on scroll up or near the end.
- **Tokens** (`src/styles/global.css`): fluid type scale `--step--1..5` with `clamp()`, spacing scale, `--section`
  padding, `--container: 76rem`, radius 8/14px, color tokens with contrast notes in comments. Serif display (DM Serif
  Text) + Source Sans 3. Light theme only.
- **Built-ins worth having:** JSON-LD structured data per page, sitemap / robots / manifest routes, admin screen
  (`admin.astro` + `server.js`), forms with tests, LiveBanner for time-based states.

## Why Gabe likes it (our read)
1. **Calm, obvious order:** one message per band, a clear next step in each, nothing hidden (the opposite of Puck Live).
2. **Big confident headline over real footage**, with only two choices. Feels premium without clutter.
3. **Always current** without manual work: the coming-up list and latest video update themselves.
4. **Phones feel like an app:** the bottom action bar and the menu sheet with the useful info in it.

## How it maps to Gabe's site (keep the structure, change the character)
| Riverside | GLucak | Change |
|---|---|---|
| Hero: video + headline + 2 buttons + info strip | **RISE**: live-show clip or IDENTITY art, slogan as the headline, **Listen / Shows** buttons, strip = next show · latest release | Dark, his era colors, condensed display type instead of the serif. Clip respects reduced motion (Riverside keeps playing under reduced motion by that owner's call; for Gabe, **pause it by default** under reduced motion: epilepsy rule). |
| New here? (sticky heading + numbered steps) | **Music** band: sticky heading + Spotify player near the top, then 3 releases (IDENTITY, Go, One And Done) | Gabe asked for the player "near the top": put it in band 2, or inside the hero on desktop (rap-artist-events pattern). |
| coming-up slot (server-injected events) | **LIVE IT LOUD**: next shows, past shows drop off by date | Same mechanism, our shows list. |
| Latest message (Facade video) | **Latest video** from his YouTube channel | Reuse `Facade.astro` as is. |
| Get Involved cards | **PUSH PAST FEAR**: his story, bio, photos, Patreon | |
| Give band | **THE TIME IS NOW**: IDENTITY countdown + email sign-up ("join the movement") | Later also Shop. |
| Visit | Booking / contact | |
| Mobile bar: Visit, Watch, Give, Directions | **Listen, Shows, Watch, Shop (later: Patreon)** | Same component, new icons/labels. |
| Header Give pill | **Listen** pill (or Pre-save IDENTITY during the campaign) | |

## Reuse list for the build (once the owner says go)
`Header.astro` (overlay + menu sheet), `MobileBar.astro`, `Facade.astro`, `Footer.astro` structure, `global.css`
token scale (swap colors / fonts for era tokens), the coming-up injection pattern for shows, JSON-LD + sitemap
routes, `server.js` admin + tests as the base for Gabe's edit screen.
Don't reuse: the church's serif-and-gold look, light-only theme, 7-link nav (ours: Music, Shows, Videos, About, + Shop later).
