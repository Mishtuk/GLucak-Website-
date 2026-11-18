# Technical review for the overhaul (advisor, read-only, 2026-11-18)

Scope: server on :8095 (HEAD 854ba58, astro 7.4.5 installed, Node 24.19). Method: curl, headless Chrome over CDP (scripts in the
session scratchpad: network + CLS + DOM audit, Tab walk with focus-ring / under-sticky-bar check, 320 px at 200% reflow, Menu sheet),
`npm outdated`, `npm audit`, grep. Nothing built, restarted or edited. My only writes to the edit API were rejected posts (invalid date,
`javascript:` link, stale version): no data changed.

**Verdict: go with changes.** The runtime is sound (CSP, auth, caps, atomic writes, no JS errors, CLS 0, no page scroll at 320/200%).
Three things need action before Jan 11: the public repo, the daily rebuild + date-bomb test, and the edit screen not doing what the
owner promised Gabe (releases + bio).

## Worst 3 findings
1. **The repo is PUBLIC and holds things that should not be** (`gh repo view`: PUBLIC). Tracked: `assets/from-gabe/` (48 files incl.
   unreleased IDENTITY CD back/tracklist/cover, full-res photos by Kealey and Paslier), `docs/research/email-thread-digest.md` (Gabe's
   email thread), 102 MB of review screenshots (pack is 360 MiB). Owner call (public / contacting Gabe is a hard rule): make it private
   (daily Actions on a private repo uses free minutes; fine) or purge. The checklist chose public only for free Actions.
2. **Edit screen cannot do 2 of the 3 things the owner promised** ("add shows, update release links and change your bio",
   email-thread-digest.md:27). It edits shows, products (shop hidden), photo upload and a backup download. Releases live in
   `src/data/releases.json` and the bios are literal text in `src/pages/index.astro:49` and `about/index.astro`; both need a code
   change and deploy. Gabe's new bio is "a swap in January" (HANDOFF Q22), i.e. our work, not his.
3. **Daily rebuild is not wired to a host and a test will go red on Jan 15.** `.github/workflows/daily.yml` runs `npm test` then publishes the
   gh-pages preview; it never calls a Render deploy hook (runbook.md section 3 step 10 is a plan, not a file). Separately
   `test/build.test.js:111` asserts "Scenic Route is coming Jan 15" but `content.js:47-51` flips that copy at `SCENIC_DAY`, so
   `npm test` fails from Jan 15 (4 days after launch) and, if tests gate the deploy, the rebuild silently stops. Release flips and
   IDENTITY days-to-go are build-time (`index.astro`, `idn`), so a stopped rebuild means stale "days to go".

## 1. Accessibility: KEEP (best area). Fixes are small
Evidence (CDP, 390 and 1280):
- **Keyboard**: Home has 43 stops, no dead end, every stop has a 3 px focus ring (0 NOFOCUSRING outside the Spotify iframe), none hidden under the
  sticky header or phone bar. Order: skip link, GLucak home, Menu, hero links, "Skip the Spotify player", platform row, shows, videos,
  Play buttons (`button`, label "Play <title>"), Patreon, email, Join, footer, Motion, phone bar. Same clean result on Music, Shows, Videos,
  About, Edit (30-44 stops). The Spotify iframe adds many cross-origin tab stops; the skip link before it (`Skip the Spotify player`) is right. KEEP.
- **Skip link** reports "under header" only because it is positioned over it on focus (intended). Skip target `#main` exists.
- **Landmarks / headings**: one H1 per page, H2/H3 in order on all 7 pages; header, nav "Main", nav "Main menu", main, footer, nav
  "Quick actions". No unnamed link/button, 0 images without alt, every `<img>` has width/height. Sign-up: `<label for=email>`,
  `aria-describedby` + `role=status`, `aria-invalid` on bad input (`app.js:68-76`). Honeypot label hidden with `aria-hidden` and `tabindex=-1`.
- **200% / reflow**: 320 px wide + root font 200% -> `scrollWidth 320 == clientWidth` on all 7 pages. Only overflow is the intentional swipe row
  `.v2-vid` (Home, Shows). `scroll-padding-top: 92px` computed (`global.css:83`: header + tab + 0.5rem), bottom padding clears the phone bar.
- **Contrast** (`src/eras/identity.json`, computed): text/bg 16.96, muted/bg 9.37, accent/bg 5.35, accent-text/accent 5.35. All pass AA.
  text on accent is 3.17 (large text only; do not use for body). The placeholder era is unused (see delete list).
- **2.2.2 / motion**: 0 running animations on load, no `infinite` animation anywhere in `global.css`, no `<video>`/autoplay. Only
  "fade in once" headings and the Menu sheet, both gated by `html[data-motion]` (`boot.js`). The Motion switch is the 2nd-last stop at the bottom
  (`app.js:30-45`); fine now (nothing needs pausing), but if the overhaul adds ANY moving thing it needs a control near the top.
- **Menu sheet** (`app.js:15-19`): Enter opens it, Tab walks Music > Shows > Videos > About, Escape closes and returns focus to Menu.
  Defect (low): the `toggle` handler's `.sheet a.focus()` does nothing (verified: after open, focus stays on the summary), so a screen
  reader user hears no jump into the sheet. Tab still enters it, so it is usable. CHANGE: focus after the sheet is visible (`requestAnimationFrame`) or drop the handler.
- **Link names**: every `aria-label` contains its visible word (label-in-name OK), e.g. "Listen" -> "Listen to the music".
- **Edit screen**: labels on every field, `role=alert` per-row errors (`edit.js:69`), focus moves to the first bad row (`:366`),
  tablist has `aria-selected`; 40 clean stops. KEEP.
- ADD: run the better-accessibility pass (design-repos-a item 4: movement inside `prefers-reduced-motion: no-preference`; pause control
  for anything over 5 s) against the NEW design, not this one. No test currently covers the focus-ring-under-sticky-bar check; the Tab-walk script is cheap to keep in `.work/`.

## 2. Performance: CHANGE (images + cache headers); the rest is KEEP
Measured transfer (brotli, cold cache, no Spotify frame, which is a separate origin):

| Page | 390 px total | doc (br) | images | 1280 px total | Notes |
|---|---|---|---|---|---|
| / | 207 KB, 15 req | 19.8 | 130 | 295 KB | fonts 49 KB (preloaded, `font-display: swap`), hero `fetchpriority=high`, JS 4.5 KB |
| /music/ | 38 KB | 19.0 | 19 | 87 KB | |
| /shows/ | 54 KB | 19.1 | 35 | 78 KB | poster `loading=lazy` above the fold (LCP risk) |
| /videos/ | 231 KB | 17.8 | 213 | 231 KB | 7 thumbs at 1280 w on a phone |
| /about/ | **250 KB** | 18.0 | 232 | **317 KB** | `cd-studio-960.webp` 154 KB, no srcset |
| /privacy/, /404 | 17 KB | 17 | 0 | | |

- **CLS 0 on every page** (widths/heights present). KEEP.
- **HTML is 70-88 KB raw per page because all of `global.css` (97 KB source) is inlined** (`astro.config.mjs` `inlineStylesheets: 'always'`);
  brotli makes it ~17-19 KB, but it is re-sent on every page and every prefetch. CHANGE only if the overhaul rewrites the CSS anyway:
  emit one hashed `/_astro/*.css` (the server already serves `/_astro/` immutable, `server.js` last line) and the HTML drops to ~3 KB.
- **Caching gap (server.js, last `send`)**: images, fonts and `/js/*.js` get `max-age=86400`, no `ETag`, no `Last-Modified`
  (checked with curl; `If-None-Match` still returns 200 with full body). Effects: every day each visitor re-downloads fonts + hero; and
  after a deploy a visitor can run yesterday's `app.js` against today's HTML (selector mismatch risk). CHANGE (S): ETag from size+mtime and 304,
  or fingerprint `/js` and `/media` and mark immutable.
- **Images**: all WebP, sized, but `srcset` is missing on the 800 px phone hero, `d-crowd-screen-phone-800`, `cd-studio-960` (About), and every
  release cover on /music/ (`noSrcset` list in the audit). The shop sample images are fine. OG PNGs are 70-233 KB (under WhatsApp's 300 KB).
- **Embeds**: YouTube is a facade (button, no iframe until Play, `youtube-nocookie`, autoplay only after the press, local thumbs): KEEP, best practice.
  Spotify is a lazy iframe (`loading=lazy`, 352 px) on Home and Music; it is the heaviest third-party and sets Spotify cookies when it loads. If the
  overhaul wants less weight or a privacy line, use the same facade (press to load); owner's D81 wants Play on screen one, so this is a design call.
- **Server**: compression is sync brotli q5 per HTML request (22 ms measured), no cache. Fine for this traffic. Prefetch/prerender via
  `Speculation-Rules` header: KEEP (`prerender conservative` also runs page JS on hover-click; harmless here).
- **JS**: 6.3 KB `app.js` + 0.6 KB `boot.js` (edit.js 24 KB only on /edit/). No framework. KEEP.

## 3. SEO and sharing: CHANGE (cheap wins)
- Titles/canonicals/robots good: `Music | GLucak` etc., `canonical` per page (trailing slash), `/edit/` noindex header + meta, 404 noindex,
  `robots.txt` (Allow /, Disallow /edit/, Sitemap), sitemap lists 6 pages and no `/shop/` or `/v2/`. 404 returns real 404 with the site chrome.
- **Home `<title>` is just "GLucak"** and its description is the slogan. CHANGE: `GLucak | Producer-rapper, EDM / rap / rock, Horsham PA` style title
  (copy team decides), description with the next show or IDENTITY. Privacy and 404 reuse the home OG image: fine.
- **Missing**: `og:url`, `og:site_name`, `og:image:alt`, `twitter:image:alt`; sitemap has no `<lastmod>`; no web manifest (not needed).
- **JSON-LD**: Home has MusicGroup + WebSite (`index.astro:13-17`, `sameAs` from SOCIALS); Shows gets MusicEvent per upcoming show
  injected per request (`shows.js:106-121`, `startDate` with New York offset, location, performer; no `url` / `offers` / `image`, fine unless the
  show has a ticket link: add `url` from `link`). Music has no JSON-LD: ADD `MusicAlbum`/`MusicRecording` for IDENTITY and singles (S, from releases.json).
- Share images: 1200x630 PNG per page, `tools/og.mjs`, tested (`test/og.test.js`). KEEP; regenerate after the overhaul changes the look.
- www/apex and http->https redirects are not in `server.js`; Render does both at its edge for added custom domains (**verify on the day**); canonical tags cover the rest.

## 4. Edit screen (Gabe's tool): KEEP the engine, ADD releases + bio
What it edits today: **Shows** (date, time, show/open mic, venue, city, address, with, link; past ones grey and kept under Played), **Products**
(hidden until `SHOP_ENABLED`; photo upload to WebP), **Download a backup**. Not editable: releases (title, date, links, covers), bio, videos,
socials, Patreon line, quotes.
- Validation is good and plain-language: `Show 1: Pick a real date.`, `The link has to start with https:// ...` (a `javascript:` link and a `<script>` venue
  were both refused or inert), stale-save refusal (409 with "write down what you changed first"), size-cap errors (32 KB shows, 256 KB products), 429/503 messages. Tests exist
  for injection (shows, products, login, .ics, JSON-LD). Sign-in: scrypt, lockouts, 7-day cookie, `Path=/edit`.
- Backup: in-UI download only; **restore is CLI only** (`tools/backup.mjs restore`, on the server). Gabe cannot restore; the owner must. Acceptable if the
  guide says "send the file to Alex". Render snapshots are not a backup (runbook section 10). ADD (M): weekly off-server copy; the export needs a session, so either
  a token header on `/edit/api/backup` for one Action, or a monthly "owner downloads and files it" reminder.
- Non-technical fit: big targets (48-56 px), one tab per list, an inline sign-out confirm, guide with screenshots (`docs/guide/gabe-guide.md`). Gaps: guide
  line 109 sends "your bio, new videos or photos" back to us; the product Image field is a raw path text box (`edit.js:170`, `/media/uploads/...`) that the
  upload button fills: hide the box.
- **ADD releases + bio (promise)**. Lazy design that reuses the existing machinery: one more `LISTS` entry (`server.js:~150`) for `releases` (validate
  title, date, type, https link, cover from uploads) and a small `site.json` for `bio` + `patreon_line`; render both through the existing marker injection
  (`<!--gl:...-->`, like shows) so a save is live without a rebuild. Costs: ~1 validator in `store.js`, 2 markers, ~80 lines of `edit.js`, tests that mirror
  `checkShows`. Cheaper stop-gap if the overhaul wants to ship first: a monthly "send me your bio / release link" routine, stated honestly in the guide.
  Decide with the owner now, because it changes what the Music/About templates must look like (markers, not literals).

## 5. Code health: CHANGE (delete a lot)
- `npm outdated`: only astro (7.4.5 -> 7.4.12, same major). Package declares `^7.3.8` so `npm install` will take it. Astro >= 7.4.2 needs Node
  `>=22.23.4` (`node_modules/astro/package.json` engines; design-repos-b says the same) but `package.json` says `>=22.13`: set
  `"engines": {"node": ">=22.23.4"}` and Render `NODE_VERSION` accordingly. `daily.yml` uses `node-version: 22` (latest 22.x, fine).
- **`npm audit --omit=dev` is 9 high today** (was 0 on Nov 10): picomatch ReDoS (GHSA-fc5q-39xc-vjpf) pulled in by vite/fdir/tinyglobby/anymatch, plus an
  astro advisory for `@astrojs/node` image endpoint (not used: static + our own server). All BUILD-TIME; `server.js` runtime imports only `sharp`. `npm audit fix`
  reports a fix; do it with the 7.4.12 bump and re-run the build. Not a launch blocker; do not let the daily job fail on audit.
- **Dead / leftover**: `/v2/` page (`src/pages/v2`, `src/styles/v2.css`, `test/v2.test.js`), the whole `prototype/` apart from `tools/resize.mjs`,
  13 unused Shorts thumbnails, 7 unused era photo variants, placeholder era. Proof in the delete list.
- **Tests**: 32 files, 3,132 lines, 245 tests (HANDOFF). Behaviour tests worth keeping: shows, products, edit, auth, backup, server, signup, signup-http, calendar,
  seo, build, a11y200, tokens, og, nocover, stress, eras, gabe-answers (flashing rule). The "round" tests (`ig2`-`ig6`, `dr1`, `round2`, `v1`, `v2port`, `d64`, `browsers`:
  ~1,000 lines) mostly regex the CSS/HTML of one design round (`ig4.test.js:14-30` matches `.hero-wall { mask: ... }` and exact `<a class="go"...>` markup). They are
  change detectors that will fail on the overhaul and prove nothing about users. REMOVE as the redesign lands; keep their few real rules (credits match images, no flashing video,
  fitted-line fallbacks) in one `rules.test.js` of ~10 asserts. `npm test` runs a build first (pretest) so every red design test blocks the daily job: another reason.
- **Time bombs**: `test/build.test.js:111` (Jan 15 copy, see finding 3). Any test using the real clock against build output will break on a date flip: grep `Date`
  / fixed dates before launch and inject the clock (`nowHtml(rows, now, rel)` already takes `now`).
- **Over-engineering (ponytail lens)**: `tools/art/*` (cjs/python art generators), `tools/board.mjs`, `tools/fetch-*.mjs`, `tools/make-shop-samples.mjs`
  are one-shot dev tools, harmless but not product; move to a `dev/` note or delete once their output is committed. `shopLinks` marker swapping (`products.js`) is more machinery
  than a flag needs, but the shop is off at launch: leave it. In-memory rate limits are fine for one instance (documented).
- Config traps: `DATA_DIR` defaults to `.data/` inside the app; on a host without a disk a redeploy silently wipes Gabe's shows. ADD (S): in `server.js` log a loud
  warning when `PROD && !env.DATA_DIR`, and when `PROD && TRUST_PROXY !== '1'` (security S2: every visitor shares one IP, sign-up limit becomes site-wide).

## 6. Launch readiness for Jan 11
| Item | State | Blocked on |
|---|---|---|
| Host (Render Starter + 1 GB disk, `DATA_DIR=/var/data`, one instance) | not bought | **Owner** (runbook section 3; due Dec 6 per checklist) |
| Node on host | needs >= 22.23.4 | us (engines + `NODE_VERSION`) |
| Env: SESSION_SECRET, EDITOR_USERS (`tools/hash-password.mjs`), `TRUST_PROXY=1`, `NODE_ENV=production`, KIT_API_KEY + KIT_FORM_ID; `DEV_EDITOR` and `SHOP_ENABLED` unset | documented in runbook section 2 | owner creates accounts; Gabe picks his password |
| Kit | endpoint `forms/{id}/subscribers` unproven vs Kit docs (checklist section 4); double opt-in email unproven | **Gabe makes the Kit account**; then us: one real sign-up test, confirm 200/201 and the email |
| Domain glucak.com + slogan domain | Gabe said yes (Nov 6) | **Owner registers** (Cloudflare, DNS-only grey cloud, security S2) |
| Email forwarding gabriel@glucak.com | Cloudflare Email Routing (free, forward only) | Owner + Gabe; booking chips wait on it (`ForVenues`) |
| Daily rebuild | workflow builds a gh-pages preview, **no deploy hook call** | us: add `curl -X POST $RENDER_DEPLOY_HOOK` job, separate from tests; owner adds secret |
| Backups | download button + CLI restore; no off-server job | owner: where to keep it; us: reminder or token export |
| Monitoring | none | Owner: UptimeRobot on `/` (5-minute checks, email) |
| Security S1 (null JSON crash) | applied 2026-11-17 and tested (`signup-http.test.js`, `server.js:112-113`); try/catch + `unhandledRejection` present | done, re-run by hand on the host |
| Real-phone test (iOS Safari + Android) | not done | Owner (checklist section 5) |
| Search Console, share-card debug (FB / X / iMessage) | not done | Gabe's Google account; us |
| Content from Gabe | Q2/Q3 shows, Q5 list, Q9 albums, Q22 new bio (Jan) still open per HANDOFF | Gabe via owner |
- Deploys on a disk host lose zero-downtime: a few seconds of 5xx at the daily hook. Cheaper alternative: compute IDENTITY days-to-go and the Scenic sign-up
  line at request time with the same `<!--gl:...-->` mechanism as the Now line, and only rebuild on real content changes (no hook, no secret, no downtime).
  M effort; decide with the overhaul because the Home template changes anyway.
- Rollback: Render Events > Rollback (locate before launch). The runbook is thorough; nothing technical missing except the two items marked "us" above.

## Decisions
| Area | Call |
|---|---|
| Accessibility | KEEP; CHANGE Menu focus; ADD a re-run on the new design and a Tab-walk script |
| Performance | CHANGE cache validators, srcset on 6 images, shows poster eager; KEEP facade, fonts, JS size; optional external CSS |
| SEO / sharing | KEEP structure; CHANGE Home title/description; ADD og:url/site_name/alt, Music JSON-LD |
| Edit screen | KEEP shows/products/validation; ADD releases + bio; CHANGE hide raw image path; REMOVE nothing |
| Code health | REMOVE /v2/, prototype/, round tests; CHANGE Astro 7.4.12 + engines + audit fix |
| Launch | CHANGE repo visibility (owner), wire deploy hook, fix time-bomb test; ADD env warnings |

## Top 12 technical changes, ranked
| # | Change | Impact | Effort | Files |
|---|---|---|---|---|
| 1 | Decide repo visibility: make private (or purge `assets/from-gabe/identity-cd`, `docs/research/email-thread-digest.md`, review screenshots). Owner's call | High (leak, client trust) | S | GitHub settings; `.gitignore` |
| 2 | Fix the Jan 15 time-bomb test and wire the daily deploy hook (hook job separate from `npm test`) | High (stale site after launch) | S | `.github/workflows/daily.yml`, `test/build.test.js:111` |
| 3 | Edit screen: releases + bio (markers + `LISTS` entry), update guide | High (owner's promise) | M-L | `server.js`, `src/lib/store.js`, `src/pages/{index,about,music}`, `public/js/edit.js`, `docs/guide/gabe-guide.md` |
| 4 | Astro 7.4.12, `engines >=22.23.4`, `npm audit fix`, Render `NODE_VERSION` | Med (security tooling, host build) | S | `package.json`, `package-lock.json` |
| 5 | Cache validators (ETag/304) or fingerprint `/js` + `/media`; fonts immutable | Med (repeat-visit weight, stale JS) | S | `server.js` (static `send`, last lines) |
| 6 | Prune: delete `/v2/`, `prototype/` leftovers, round tests; keep one `rules.test.js` | Med (speed of the overhaul, signal) | M | see delete list |
| 7 | Image pass: `srcset` for About studio, phone hero, release covers; shows poster `loading=eager`; Videos thumbs 640 on phones | Med (About 250 KB, LCP) | S | `about`, `Hero.astro`, `music`, `shows`, `videos`, `content.js` |
| 8 | SEO tags: Home title/description, `og:url`, `og:site_name`, image alt, Music JSON-LD, MusicEvent `url` | Med (shares, search) | S | `Base.astro`, `index.astro`, `music/`, `shows.js:116` |
| 9 | Env guards at boot: warn if PROD without `DATA_DIR` / `TRUST_PROXY`; Kit single-add proof test with real key | Med (silent data loss, shared rate limit) | S | `server.js` (top), `signup.js` |
| 10 | Off-server backup routine (token export for one Action, or owner reminder) and say who restores | Med | S-M | `server.js` backup route, `runbook.md`, `gabe-guide.md` |
| 11 | Menu sheet focus fix; keep Tab-walk script; re-run a11y on the new design | Low-Med | S | `public/js/app.js:15-19` |
| 12 | Request-time days-to-go + Scenic line (drop the daily rebuild's reason to exist) | Med (no deploy downtime) | M | `index.astro`, `content.js:47`, `server.js inject()` |

## Delete list (safe to remove; proof nothing references them)
Verify with `git grep` again on the day; all checked 2026-11-18.
| Path | Size | Proof |
|---|---|---|
| `src/pages/v2/index.astro`, `src/styles/v2.css` | 124 + 83 lines | `v2.css` is imported only by `src/pages/v2/index.astro:11` (grep). No nav, sitemap, speculation rule or Home link to `/v2/` (`test/v2.test.js` asserts "Home does not link it"). Page is `noindex`. `global.css:1005` already holds the ported rules |
| `test/v2.test.js` | 16 lines | tests only `/v2/` |
| `test/v2port.test.js`, `ig2`, `ig3`, `ig4`, `ig5`, `ig6`, `dr1`, `round2`, `v1`, `d64`, `browsers` (after folding ~10 real asserts into `rules.test.js`) | ~1,000 lines | design-round change detectors (regex on CSS/HTML); no code imports them. Keep `gabe-answers.test.js` (flashing rule) |
| `prototype/` except `prototype/tools/resize.mjs` (move to `tools/`, fix `test/v1.test.js:162` and the `make-shop-samples.mjs` SRC) | 16 MB (15 MB `shots/`) | only references: `v1.test.js:162` (reads resize.mjs), `tools/make-shop-samples.mjs:1,9` (one-shot generator, output already in `public/media/shop`), a comment in `shows.js:65`. Not served: server reads `dist/` only |
| `docs/review/**/*.png|webp` screenshots and other review image folders (keep the .md) | ~100 MB tracked (pack 360 MiB) | docs only; nothing in `src`, `server.js`, `test` or `tools` reads `docs/review` images (grep) |
| `public/media/videos/<13 Shorts ids>-{640,1280}.webp` (2LLo7Qo-cDI, b3H3cWQqTgc, EuRUwh1CPhs, GRVXG9cHRX4, M3LTokh3HyE, pDY5Mh3v9rk, re0y7wIm2wE, uVNwpXD9bZw, WC77330EaqE, wYQicqLfPRI, WZkvg5YMQ9w, zmhbfHppXNM, zVXORhLTVU4) | 496 KB | ids exist only in `videos.json` as `kind: other`; none appear in built `/videos/` or `/` HTML (checked). Delete only if Shorts stay a link, not cards |
| `public/media/{a-era-grade-phone-800,b-riso-1000,c-poster-identity-600,c-poster-identity-1000,d-crowd-800,d-crowd-1600,d-crowd-phone-800}.webp` | 236 KB | referenced only by `tools/photo/*` and `test/ig4.test.js`, never by `src/` or built pages. Regenerable from `assets/from-gabe` |
| `src/eras/placeholder.json` | small | only `identity.json` is imported (`content.js:3`); `test/eras.test.js` may list it: check before removing |
| Root `media/` (empty, gitignored), `.work/` scratch | 0 | gitignored |
Not on the list (looks dead, is not): `public/fonts/OFL-*.txt` (licences), `tools/hash-password.mjs`, `tools/backup.mjs`, `tools/og.mjs`, `tools/preview.mjs` (daily workflow), `tools/photo/*`.
