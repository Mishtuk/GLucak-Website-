# R1: the site outside Chromium (iOS Safari, Instagram in-app browser, Firefox)

Why: most fans arrive from Instagram, whose in-app browser is the phone's own WebKit (iOS) or Chrome's WebView (Android).
An iPhone's WebKit is only as new as its iOS, so "Safari support" means "which iOS". Task: eval.md ig-round3 fix 3.
Build: `src/` at 2ae6e60 plus the CSS block described below. Not touched: server.js, src/lib/, v2.

## What was tested

| Engine | Version | How |
|---|---|---|
| WebKit (Playwright) | 27.2, Windows build | 390x844 isMobile + touch @2x, 768x1024, 1280x800; /, /music/, /shows/, /about/ (+ /shop/, /nope/ for overflow) |
| Firefox (Playwright) | 159 | 390x844 window (no isMobile in Firefox), 1280x800; same pages |
| Chrome (system) | current | Home height only, to prove nothing changed |
| **Simulated old WebKit** | same WebKit 27.2, feature stripped | the page HTML rewritten in flight so the engine behaves as if it lacked a feature (see below) |

Both real engines are new (they have text-box, cqi, color-mix, :has, dvh, overflow: clip), so **as built they render the
site like Chrome**: Home at 390 is 3598px (WebKit) / 3601px (Firefox) vs Chrome 3601px; 1280 is 4277 / 4265 / 4277; no
sideways overflow, nothing clipped or overlapping on any of the four pages. That is the good news and the reason the
real-engine shots look identical before and after.

The risk is the older iPhone. Playwright cannot install an iOS 15/16/17 WebKit, so those were **simulated**: the page's
inline CSS is rewritten in the browser (`text-box` removed; `cqi` / `container-type` / `@container` renamed to something the
engine ignores; `color-mix(` likewise; `100dvh`, `overflow: clip`), which is exactly what an engine without the feature does
with the same declaration (drops it). It is a faithful test of the CSS fallback; it is **not** a real iPhone.

## Feature table

Where "Used" is global.css (and the inline era `<style>` in Base.astro). Versions are first-supporting versions.

| Feature | Used | Lacks it | If missing | Fallback |
|---|---|---|---|---|
| `text-box: trim-both cap alphabetic` | the fitted words: `.ln .sl`, `.name-row`, `.n-g .n-rest`, `.phrase-rise` | Safari / iOS before 18.2 (iOS 17, 18.0-18.1); older Firefox (159 has it); Chrome before 133 | cosmetic: the line box keeps its leading, Home stands 20px taller at 390 (3618 vs 3598), the slogan lines sit slightly further apart. Nothing clips (no `overflow: hidden` on these) | none needed; looks fine in the sim (`sim-ios17-*.png`) |
| `cqi` unit and `container-type` (fitted lines `100cqi / var(--w-*)`, `.name-row --fs`) | ~20 rules | Safari / iOS before 16.0, Firefox before 110 | font-size declaration is invalid, so every fitted word falls to 18px body text: GLUCAK, LIVE IT LOUD, the close line all tiny (readable, not clipped) | **added**: `@supports not (width: 1cqi)` sizes each line from the viewport (`--fitw`); full width under 900px, a safe share of the page from 900px |
| `@container (...)` queries, range syntax `width <` | 200% text rules, link grids, poster, header | same as cqi | the 200%-text and narrow-card rules do not apply: normal layout at 100% text, still fits | none needed (only matter at 200% text) |
| `.brand` `min(1.75rem, 11.5cqi)`, `.phone-bar a` `min(1rem, 7cqi)` | header, bar | same | declaration dropped, falls to the plain `1.75rem` / `1rem` above it | already a fallback |
| `color-mix()` in srgb and oklch | `--bg-2`, `--line` tokens; `.btn-line`; `.yt-title`; `.player-box`; hero scrims; glow; header scrim; `--hatch` | Safari / iOS before 16.2, Firefox before 113 | `--bg-2` / `--line` invalid: every border and tile ground disappears; hero text scrim gone (name white on a bright shirt); Spotify box ground gone | **added**: `@supports not (color: color-mix(...))` gives `--bg-2: var(--bg)`, `--line: var(--muted)`, solid grounds for `.btn-line .yt-title .player-box`, a plain bottom ramp on the hero. The glow and hatch simply do not show (cosmetic). The header is `solid` by default, which uses plain `--bg` |
| `overflow: clip` (body, `.top`) | stops the 160%-wide hero glow scrolling the page sideways | Safari / iOS before 16 | page scrolls sideways by ~120px on Home (sim: scrollWidth 507 at 390) | **added**: `@supports not (overflow: clip)` uses `hidden` |
| `100dvh` | `body { min-height }` | iOS before 15.4 | declaration dropped, short pages stop short of the screen | **added**: `@supports not (min-height: 100dvh)` uses `100vh` |
| `:has()` | `.site-header:has(details[open])`, `.row:not(:has(.cal-btn))`, `.wrap:has(> .links)`, `.spine:has(...)`, `.ln-close:has(a[href$="/shop/"])`, `.identity-state:has(...)` | iOS before 15.4, Firefox before 121 | any rule whose selector list contains it is dropped whole. The header rule was `.site-header.is-solid, .site-header:has(...)`, so the solid header vanished with it | **fixed**: split into two rules. The others are single-selector rules; they only drop their own nicety (footer container, shop close-line width, Played row date alignment) |
| `mask` / `-webkit-mask` (arrows, hero photo fade) | `.about-set a::after`, `.hero-photo img` | none (all have the `-webkit-` form and unprefixed; Safari 15.4+, Firefox 53+) | arrows would be solid blocks | none needed; arrows verified in WebKit and Firefox at 1280 |
| `clip-path` (ledge `.tab::before`, `.vh`) | | none (Safari 13.1+) | | none |
| `env(safe-area-inset-*)` | `--safe-x`, `.phone-bar`, `--bar-h` | works everywhere WebKit; needs `viewport-fit=cover` (set in Base.astro:39) | | none; see Instagram below |
| `text-wrap: balance` / `pretty` | product and tile titles, `p` | balance: Safari before 17.5; pretty: Safari before 26, Firefox (159: no) | cosmetic: ragged last lines | none |
| `@view-transition { navigation: auto }`, `::view-transition-*` | page-change fade | Safari before 18.2, Firefox | plain page change, no fade. Header name and reduced-motion switches are inert | none (it is an enhancement; the dark ground is on `html`, no white flash) |
| `hyphens: auto` | poster place word | Safari before 17 needs `-webkit-` | a long word such as "Philadelphia," could run under the art at 320 on iOS 16 | **added**: `-webkit-hyphens`; `overflow-wrap: break-word` already there |
| `rotate`, `inset`, `aspect-ratio`, `min()/clamp()`, `display: contents`, `object-fit`, `mix-blend-mode`, `overscroll-behavior-x`, scroll-snap | many | Safari 14.1-16 for the newest of these | cosmetic at worst | none |
| SVG `filter: url(#duo)` on `<img>` (duotone photos) | `img.duo` | works in WebKit and Firefox in these shots | if it failed the photo would show untinted | real iPhone row below |
| `field-sizing`, anchor positioning, `@starting-style`, scroll-driven animation, subgrid, CSS nesting, `light-dark()`, `@property` | **not used** (grep of src/) | | | |

## What broke before, in the simulated old WebKit (`sim-ios15-before-*`)

Home at 390 / 1280, WebKit with cqi, color-mix, dvh and clip removed (and text-box):

- Every fitted word at 18px (GLUCAK, the slogan, LIVE IT LOUD): the hero loses its whole point. Not clipped, but the page
  is 3170px instead of 3598px with a mostly empty hero.
- Page scrolls sideways (scrollWidth 507 at 390, 1664 at 1280) because `overflow: clip` was ignored.
- No scrims, no borders, no tile or player grounds (the tokens were invalid).
- The one orange CTA (Listen) stayed orange and visible in every case.

After the fallbacks (`sim-ios15-after-*`, Home / Shows): the hero words fill the width again (at 390 identical to Chrome
apart from the missing scrim and glow), no sideways scroll on any of /, /music/, /shows/, /about/, /shop/, /nope/ at
320, 390, 768, 1024, 1280, 1600 (the only elements past the edge are the hero glow, clipped by `.top`, and the video swipe
row, which scrolls by design). From 900px the fitted lines are a share of the page (smaller than Chrome, never wider than
their column); under 900px they match. Home 390 is 3592px.

## Chrome unchanged

Every fallback sits in an `@supports not (...)` that Chrome fails, or is the :has split and a `-webkit-hyphens` (inert in
Chrome). Measured in Chrome after the change: Home quotes-off 390x660 reduced motion **3601px**, 320 = 3724, 1280 = 4277
(same as ig-round3 eval). `npm test` 188/188 (185 existing + 3 new in `test/browsers.test.js`; they check each fitted
line has a fallback, that the `@supports not` rules survive the minifier, and the header split). No new animation. A11y200
needs no re-run: nothing a Chrome user can reach changed (same computed CSS).

One build trap found: the minifier **drops a plain declaration written before its modern twin** (`min-height: 100vh;
min-height: 100dvh;` came out as only the 100dvh one). So every fallback is an `@supports not` rule, not a duplicate
declaration, and the test pins them in the built HTML.

## Instagram in-app browser (no fix needed; see the phone rows)

- **Fixed bottom bar vs IG's toolbar.** iOS IG shows its own bottom toolbar (back / forward / share) below the web view,
  and the page's `position: fixed; bottom: 0` bar sits at the bottom of the web view, i.e. just above IG's toolbar. The
  bar reserves `env(safe-area-inset-bottom)`: in IG that is probably 0 (IG's toolbar takes the home-indicator area), in
  Safari it is ~34px. Either way the result is extra space under the labels, never clipped (`--bar-h` and
  `scroll-padding-bottom` use the same value, so the last content is reachable). IG's toolbar can also hide on scroll,
  resizing the view; the bar then follows the new bottom (a small jump, cosmetic). Not testable without a phone.
- **`target="_blank"`.** The About setlist's Patreon row and external links come from `src/lib/ext.js`, which adds
  `target="_blank"` and a hidden "opens in a new tab" hint. In IG on iOS a `_blank` link usually loads in the same web view
  (IG's back arrow returns), so the hint is slightly off but harmless; the owner may prefer "Open in Safari" from IG's menu
  for Spotify. Spotify links also do not hand off to the Spotify app from IG (universal links are not followed).
- **Safe area.** `viewport-fit=cover` is set and the `.wrap` side gutters add `--safe-x`, so a notch in landscape does not
  cover text. The phone bar hides from 700px, so a landscape phone mostly never shows it.
- **Add to calendar (`/shows/<id>.ics`).** Many in-app browsers cannot download or open an `.ics`: most likely to fail in IG.
  The owner's list already has "Add to calendar on iPhone"; add the in-IG case below.
- **Forms.** Sign-up input is 17px (iOS does not auto-zoom at 16px+). `fetch` POST works in WebKit web views.

## What is left

- iOS 17 and 18.0-18.1 (no `text-box`): Home ~20px taller at 390, the slogan lines a little further apart. Accepted; a
  fallback would need a hand-measured negative margin per word.
- No `color-mix` (iOS before 16.2, about 1-3% of traffic and falling): no glow, no hatch on placeholder tiles, a plain
  bottom ramp instead of the tuned hero scrims (white name over a bright shirt is weaker). Legible, not designed.
- No container units (iOS before 16): from 900px the fitted lines are a safe share, not an exact fit (matters only for
  old iPads in landscape).
- No view transition, no `text-wrap`: cosmetic.
- The Playwright WebKit is a Windows build of current WebKit: it proves layout and CSS support, not iOS font rendering,
  the Safari toolbar, the keyboard, or IG's chrome. Firefox shots are a 390px window, not a phone.

## Real-phone checklist rows (for the owner; add to the launch checklist)

| # | Device | Check | Pass if |
|---|---|---|---|
| 1 | iPhone Safari, newest iOS | Home first screen, then Music, Shows, About | GLUCAK and the slogan fill the width, nothing touches or is cut; one orange Listen button |
| 2 | iPhone on iOS 17 or older, if anyone has one | same as 1 | words fully visible; a little more space between lines is fine |
| 3 | iPhone Safari | scroll up and down on Home | phone bar sits above the toolbar / home indicator, no gap showing the page under it; last section reachable |
| 4 | iPhone, open the site from an Instagram link (bio or story) | Home, scroll, tap Menu, tap Listen | bar sits above IG's toolbar, not under it; Menu sheet opens and closes; no sideways scroll |
| 5 | same, in IG | tap "Play full songs on Spotify" (opens a new tab) | opens Spotify web/app; IG's back arrow returns to the site |
| 6 | same, in IG | Spotify player and a YouTube thumbnail | player loads (30s preview is fine); the video plays on tap |
| 7 | same, in IG | a show's "Add to calendar" | the event is offered, or at least a clear way out; note what happens |
| 8 | same, in IG | join the email list | submits, shows the thank-you, keyboard does not hide the field |
| 9 | iPhone Safari | the duotone hero photo and the About photo | tinted like Chrome (not plain colour, not black) |
| 10 | iPhone, landscape | Home | text not under the notch |
| 11 | Android, Instagram link and Chrome | rows 4-8 again | same |

## Screenshots (`docs/review/r1-browsers/`)

`real-webkit-*` / `real-firefox-*`: real engines, as built (identical before and after, so no separate "before").
`sim-ios17-*`: WebKit without `text-box` (what iOS 17 shows; no fix). `sim-ios15-before-*` / `sim-ios15-after-*`: WebKit
without text-box, cqi, color-mix, dvh and clip, before and after the fallbacks (Home 390 and 1280; after also Shows).
Scratch tooling (Playwright, scripts) lives in the session scratchpad, not in the repo or its package.json.
