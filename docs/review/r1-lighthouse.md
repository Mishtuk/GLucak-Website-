# R1 launch audit: Lighthouse + flash (2026-11-11, Laptop coder)

Real build (`npm run build`, then `node server.js`, PORT 8881, NODE_ENV unset, empty DATA_DIR), Lighthouse 12.8.2 installed only in the
session scratchpad, headless Chrome, default simulated throttling (mobile preset = slow 4G + 4x CPU; desktop preset = fast).
Reports are JSON in the scratchpad, not in the repo. Summary images: `docs/review/r1-lighthouse/scores.png` (full table) and
`flash-luminance.png` (luminance trace).

**Result in one line:** every page scores 99-100 on Performance and 100 on Accessibility and SEO; the only sub-90 numbers are Best
Practices 78-79 on Home and Music (Spotify's own third-party cookies) and SEO 69 on /shop/ with the shop off (noindex, on purpose).
No flash risk found. **No source change was needed**, so the "after" column equals "before".

## 1. Lighthouse scores (before = after, nothing changed)

Perf / Accessibility / Best Practices / SEO. Shop on gave the same numbers except /shop/ SEO 100.

| Page | Mobile | Desktop | Mobile LCP / CLS / TBT |
|---|---|---|---|
| / | 99 / 100 / 79 / 100 | 100 / 100 / 78 / 100 | 2.0 s / 0.014 / 0 ms |
| /music/ | 99 / 100 / 79 / 100 | 100 / 100 / 78 / 100 | 1.9 s / 0.019 / 0 ms |
| /shows/ | 99 (shop off), 100 (on) / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.8 s / 0 / 0 ms |
| /about/ | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.7 s / 0 / 0 ms |
| /shop/ shop OFF | 100 / 100 / 100 / **69** | 100 / 100 / 100 / **69** | 1.9 s / 0 / 0 ms |
| /shop/ shop ON | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.9 s / 0 / 0 ms |

- SEO 69 on /shop/ (off) is `is-crawlable`: the page is `noindex` while the shop is off (D8/D36). Correct, and it clears when SHOP_ENABLED=1.
- Home and Music Best Practices: `third-party-cookies` (`sp_t`, `sp_landing`, set by open.spotify.com inside the player) and
  `inspector-issues` (the same cookie issue). Not ours, see section 2.

### Top opportunities (all small; none moves a score by more than a point)

1. `/shows/` mobile: the first poster photo is the LCP element and is `loading="lazy"` (audits `lcp-lazy-loaded`, `lcp-discovery`, perf 99).
   It comes from `POSTER_ART` in `src/lib/shows.js` (server-filled list), so it is on the Desktop list.
2. Cache lifetime (`uses-long-cache-ttl`, `cache-insight`): fonts, `/media/*`, `/js/*`, `grain.png` get `max-age=86400`; only `/_astro/` and
   uploads get a year (server.js line 313). Repeat visits revalidate or refetch 13 files after a day. Desktop list.
3. `render-blocking` `/js/boot.js` (1.3 KB, est. 160 ms on simulated 4G). Deliberately kept synchronous: it sets `data-motion` before first
   paint so a visitor who turned Motion off (or has reduced motion) never sees the glow start. Moving it to `defer` would trade
   a 160 ms estimate for a frame of motion for exactly the people who opted out. Not changed.
4. Image delivery estimates (84 KB mobile Home, 55 KB Music, 80 KB desktop): Lighthouse compares file size with CSS size, not with the
   device pixel ratio (1.75 on its mobile preset). Home hero is 800 px for a 412 px screen, the video thumbs are 640 px for 299 px
   boxes: both are right at 1.75x-2x. `grain.png` (15 KB, 128x128 PNG) could be 11 KB as lossless WebP: 4 KB, skipped as not worth a format change.
5. CLS 0.014 (Home) / 0.019 (Music) mobile: three tiny shifts (hero photo 0.006, the "Music" tab after the Spotify font loads 0.006,
   Spotify's own font 0.002). Well under the 0.1 "good" line. Pages with no Spotify frame are 0.
6. Forced reflow 1.4 ms in `app.js:52` (the first `getBoundingClientRect` loop for the fade headings): negligible.

### Third-party cost (reported separately; Spotify / YouTube)

| Page (mobile preset) | Our bytes | Third-party bytes | Third-party requests |
|---|---|---|---|
| / | 200 KB | 836 KB (Spotify embed-cdn 680 KB, encore.scdn.co fonts 146 KB, art 18 KB, a Spotify Sentry ping) | 34 |
| /music/ | 157 KB | 835 KB (same) | 34 |
| /shows/, /about/, /shop/ | 157 / 110 / 136 KB | 0 | 0 |

- Spotify is the whole third-party cost, and it loads on Home and Music because the player sits in the first screen at 390 px (D81: owner
  wants Play on screen one). It costs 4x our own page weight and is the only cause of the Best Practices drop. A click-to-load facade would
  remove it but changes the look and the "Play is there" promise, so it is an owner decision, not a coder fix.
- YouTube: **0 requests** to youtube.com / ytimg on any page. The video block is a plain link with a local thumbnail until tapped
  (facade works as designed); the privacy-enhanced player loads only on tap.

## 2. Flash audit (hard rule 1)

**Method.** Headless Chrome (new headless) via CDP, motion ON (no `prefers-reduced-motion`), 390x844 and 1280x800, DPR 1, real Spotify iframe
allowed. `Page.startScreencast` (JPEG, one frame per compositor update, 40-60 fps while anything moves; a static page emits no frames
because nothing changes). Each frame is decoded, converted to relative luminance (WCAG formula, sRGB linearised) at half size and cut into
170x128 blocks (= the 341x256 px general-flash area, stride half a block). A "transition" is a block whose mean relative luminance moves
by 0.10 or more between two frames (darker side below 0.8). Counted per raw frame pair and again resampled at 10 fps; a flash is two opposing
transitions; the limit is 3 per second. (A first pass with per-pixel diffs was thrown away: it flagged scrolling photographs, because
every pixel changes while the mean does not.) Script and raw results are in the scratchpad (`flash\flash2.mjs`).

Scenarios per page (/, /music/, /shows/, /about/, /shop/) and viewport: load + 3.5 s idle, a 5 s scroll to the bottom, 2 s at the bottom;
hover, mouse-press and keyboard focus on every main control (Listen, Shows, Join, Patreon, Pre-save, header Listen, nav links, the Motion
switch, the Menu summary: 8 to 14 per page); five real page-to-page navigations by clicking the nav (View Transitions are on).

| What | Result |
|---|---|
| Idle with motion on (all 10 page x viewport runs) | **0 transitions**. Largest block step 0.016 (the glow drift on Home, 24 s cycle, 0.68-0.88 opacity); Music/Shows/About/Shop emit no frames at all |
| Page load | 1 transition per load: the empty browser tab going to the page. Once, not repeated |
| Scrolling (user driven, 5 s over the whole page) | 0 transitions at the real frame rate (largest block step 0.043). Only the artificial 10 fps resample of a 1000 px/s scroll crosses 0.10 as dark and light bands pass, which is the scrolling, not a flash |
| Hover / press / focus of every main control | **0 transitions**. Largest block step 0.097 (the Listen button's invert on mouse-press, a small area); focus ring 0 |
| View transition, 5 hops, 4 runs (2 viewports x light/dark) | Cross-fade over about 0.2 s. Largest one-frame block step 0.26 (390 px), 0.16 (1280 px). At most 3 same-direction steps and **0 opposing pairs** in any second. The site has a single theme, so light and dark runs are identical |

`flash-luminance.png` shows the Home trace: flat while idle, one smooth swing per hop. A hop changes the viewport mean by about 0.15-0.2
(Home 0.26, Music 0.11, Shows 0.31, About 0.16), so one hop is a real but single and softened change. Two hops can never land inside a
third of a second because each is a full page load; a visitor tapping through pages every second still produces at most one swing a second.
**Verdict: PASS. Nothing flashes, nothing changes large-area luminance more than once a second.**

**Reduced motion** (`prefers-reduced-motion: reduce` emulated, 10 runs): `document.getAnimations()` has **0 running animations/transitions**
on every page; `.glow` `animation-name: none`; `data-motion="off"`, the Motion button reads "Motion: off (device setting)" and is
disabled; `.fade .phrase` transition-duration 0s and opacity 1 (Home's three `fade-wait` headings are shown, not hidden); the page
navigation is a hard cut (`@view-transition { navigation: none }`), largest step 0.32 for one navigation, no cross-fade.

**One exception, not ours:** on a 390 px screen the Spotify player's track title ("GLucak: Latest ...") is a scrolling marquee inside
Spotify's iframe, about 160x18 px (0.3% of the screen, nowhere near the flash area) and it keeps moving under reduced motion. It is
Spotify's code. It is text moving in a small box, not a flash (hard rule 1 is not touched); it does touch WCAG 2.2.2 (auto-moving content
over 5 s needs a pause). Fix would be a click-to-load player, an owner decision, same as the cookie point above.

## 3. Fixes made

None. Nothing in our files (`src/styles`, `src/components`, `src/pages`, `public/js`) scored below 100 or showed a flash. The items we could
touch were judged not worth the risk to the look: boot.js stays synchronous (above), no format change for grain.png, the 0.014 CLS is inside
the "good" band and mostly Spotify's font. Gates re-run on the unchanged tree: `npm test` 188/188 (includes the a11y200 sweep, 0 issues);
Home at 390x660 with reduced motion and quotes off = **3601 px**.

## 4. For the Desktop (server.js / src/lib only)

1. `src/lib/shows.js` `POSTER_ART`: make the first poster `loading="eager" fetchpriority="high"` (or drop `loading="lazy"` for the first row);
   it is the LCP image on /shows/ and is lazy-loaded (fixes `lcp-lazy-loaded` / `lcp-discovery`, perf 99 to 100). Later posters stay lazy.
2. `server.js` line 313: `max-age=86400` for everything but `/_astro/`. Fonts (`/fonts/*.woff2`) never change name: give them
   `public, max-age=31536000, immutable`. `/media/*`, `/js/*`, `grain.png` keep unhashed names, so a long max-age would show stale files after
   an edit; either leave them at one day, or serve them 1 week + `stale-while-revalidate`, or rename on change. Suggest fonts only, plus
   `/media` at 7 days.
3. Not a code item, for the owner: the Spotify player is the entire third-party cost (836 KB, cookies, 34 requests) and the one marquee
   under reduced motion. Keeping it in screen one is D81; a "Load player" facade would cost the "Play is on screen one" look.
