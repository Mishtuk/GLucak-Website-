# Loop 5 test loop (advisor, 2026-11-18), HEAD after OV1-OV6

Verdict: **PASS, no P0, no P1.** One P2 layout item and one owner-judgment P2, a handful of P3s. Everything held is Gabe's or the owner's.

## Scores
| Round | Critique /40 | Audit /20 |
|---|---|---|
| design-ux (before) | 29 | - |
| ov23 | 33 | - |
| ov6 | 33 | 17 |
| **loop 5** | **34** | **18** |

- **Critique 34.** Visibility 3, match 3, control 3, consistency 4, error prevention 3, recognition 4, flexibility 3, minimalist 4, errors 3, help 4 (Today stub, "Next full show" line, share and calendar buttons, one-click nav at every width). The +1 over ov6 is the About dead gap now fixed (gallery sits under the bio).
- **Audit 18.** A11y 4, perf 4, theming 3, responsive 4 (no overflow at 320 to 1600), anti-pattern 3.
- **Craft floor: PASS.** No gradient text, kicker or glass added; 3px focus ring on every stop; pages end on Listen.
- **Antislop gate:** PASS. All hard rules hold (see Verified).

## What can improve (ranked)
Sizes: S under 30 min, M a couple of hours, L a day.

| # | Pri | Item | Where | Fix | Size |
|---|---|---|---|---|---|
| 1 | P2 | **About at 1280/1600: the right half is empty for about 700px** beside Photos, Book GLucak and Credits (`.work/loop5/about-1280-mo-full.jpg`). The old dead gap is gone, but the gallery (`max-width: 34rem`) sits alone in the left column while the actions sit in the right. | `src/styles/global.css:1411` (`.gallery`), `1420` (`.about-body`) | At 900px and up put `.gallery` in the right column under the actions (`grid-column: 2`, `align-self: start`), or let the grid go 3 across at full width. | S |
| 2 | P2 (owner taste) | **Home hero at 1280/1600: the photo block sits between G and LUCAK**, so the wordmark reads "G LUCAK" at a glance (`home-1280-mo-screen.png`). h1 has aria-label "GLucak", so only the visual reading is affected. | `global.css:240-264` (`.hero-photo`) | Move or narrow the cut-out so it sits behind the letters or beside the word. Needs the owner's look first. | M |
| 3 | P3 | Dead CSS left from the removed hero variants: one `data-hero='b'` / `.credit-b` rule. | `global.css` (grep `data-hero='b'`) | Delete. | S |
| 4 | P3 | Credits are one block not tied to photos, and "Photo: Alexander Kealey" and "Video still: Joseph Lucak" credit frames that are on Home, not About (ov6 P2-3). | `src/pages/about/index.astro:42-44` | Add a lead line: "Credits for every photo on this site." | S |
| 5 | P3 (owner) | About header is a full-bleed, very saturated violet band (hue 274, not magenta); it competes with the LISTEN button (ov6 P2-2). | `public/media/cd-live-*.webp` | Tighter crop, or keep and tell the owner. | S |
| 6 | P3 | Gallery links open the bare .webp with no hint (ov6 P3-2). | `about/index.astro:36-38` | Optional visually hidden "(opens the photo)". | S |
| 7 | P3 | The Spotify iframe takes 20+ Tab stops on Home (third-party content). The "Skip the Spotify player" link works. | Home player | Nothing to do. | - |

Not ours (Gabe or owner, plan.md section 5): "Epilepsy survivor" and the new bio ("Reforaged"); Dec 4 Airport Square; open-mic cover and set length; venue towns and addresses; Discord link; single art for Scenic Route / Welcome Home / Who I Am; CD photo credits; real merch; M.O.M's vs Cheshire; `BOOKING_EMAIL`; host and `RENDER_DEPLOY_HOOK`. Items 2 and 5 are owner taste calls.

## Sloplint (static, `--genre atmospheric --scope page`)
74 FAIL, 36 REFLEX, 96 WARN over 9 files, full output `.work/loop5/sloplint.txt`. Triaged against `docs/review/dr1/sloplint-notes.md`. All standing: 20, 24a, 24b (`.h-go`, `.next-rel a` tap trick, `global.css:1339, 1403`), 34, 41, 48, 67, F15, F6 (tabular-nums is already set at `global.css:503, 618`; the lint hits the detail selectors only), 3 (`.quote` rule is ruled, `.yt-play::before` is the play triangle), 58.
**Hits not in the earlier run, none real:**
- 24a `.ed-say` (private edit screen, spacing scale).
- F4 "two filled buttons in the hero" on About: Patreon and Request a show are a text link and an outlined button (false positive).
- 58 on `/privacy/`: legal copy, 35 words.
No new real hits.

## Promise check (email-thread-digest.md)
| Item | Status | Evidence |
|---|---|---|
| Spotify player near top of Home | Done | Spotify iframe in RISE under the hero (`home-1280-mo-screen.png`; at 390 it starts at the first fold) |
| Slogan prominent; four words as Home headings | Done | Hero line; H2s "Music Rise", "Shows Live It Loud", "About Push Past Fear", "Join The Time Is Now" |
| Releases, shows, videos in one place | Done | Home sections, /music/ (11 releases), /shows/, /videos/; one click each in the nav |
| Past shows drop off ("Played") | Done | /shows/ H2 "Played", `<details>` "All played (8)" |
| IDENTITY countdown + pre-save | Done | /music/ "August 13, 2027, 268 days to go"; pre-save link in dist |
| Era swap in one change | Done by code | Era tokens in `global.css`; not re-tested here |
| Edit screen: shows, release links, bio | Partly verified | /edit/ loads with Sign in; I did not sign in and save; OV4a/OV4b gates cover it |
| Edit sign-in + backup | Partly verified | Sign-in form present; backup not downloaded here |
| Add to calendar | Done | "Add to calendar" link on every show row (tab order on /shows/) |
| Photo gallery | Done | About "Photos": 3 real photos, all with alt |
| Booking / contact form | Partly | "Request a show" goes to Instagram DM; mailto waits on `BOOKING_EMAIL` (owner) |
| Merch / shop set up | Done (hidden) | /shop/ builds with 5 sample products; not in the nav by design |
| Email sign-up | Done | Join band on pages, honeypot `website` field |
| Patreon link + bio | Done | Patreon on About and footer; bio on About |
| Intuitive, versatile, cool; nothing stale | Done | Today/Tomorrow, "Next full show", no overflow 320 to 1600 |

## Verified (and how)
- `npm run build` (9 pages); served on :8140 with `DATA_DIR=.work/loop5-data DEV_EDITOR=1`. Headless Chrome over CDP (`.work/loop5-shots.mjs`, `loop5-a11y.mjs`, `loop5-tab.mjs`); outputs in `.work/loop5/` (`shots.txt`, `a11y.json`, `tab.json`, PNG/JPG shots).
- **56 shots** (8 pages x 320, 390, 768, 1280, 1600 reduced motion, plus 390 and 1280 motion on). **No horizontal overflow** anywhere (scrollWidth equals width). **0 running animations** on every page, motion on and off. Home height: 320 4108, 390 3859 (reduced) / 3811 (motion on), 768 3846, 1280 4178, 1600 4621. Console errors: only the expected 404 on /nope; none elsewhere. I looked at the shots for Home 320/390/1280, Shows 390, Music 1280 and About 1280 myself; the rest by measurement.
- **Hard rules.**
  - CSP header: `script-src 'self'`, no `unsafe-inline` for scripts, `frame-ancestors 'none'`, `base-uri 'none'`.
  - Every `<script>` in dist is `src=` (`app.js`, `boot.js`, `edit.js`) plus one `ld+json` data block, which is not executed. External hosts are only links and the Spotify/YouTube frames.
  - No flashing: nothing animates. The only motion rule is the menu sheet transition (`global.css:1217-1225`, `no-preference` and `data-motion='on'` only).
  - Motion switch: "Motion: on" (aria-pressed true), click gives "off"/false, click again "on"; it persists to /shows/. Under emulated reduce it shows "Motion: off (device ...)" and a click does not turn it on.
  - One click to every section: Music, Shows, Videos, About in the header and menu, plus the phone bar.
  - Real photos only.
- **Keyboard.** Home order: skip link, brand, Music, Shows, Videos, About, Listen, hero Listen, Shows, stub, "Skip the Spotify player", then the iframe. Shows: nav, "Next full show", then a calendar and a share control per row in date order, "All played", Watch all videos, video buttons. Each stop has a solid 3px outline with a 3px offset (none drawn inside the third-party iframes). Skip link shows at (16, 8) and goes to `#main`.
- **Landmarks and headings.** One h1 per page, h2 order correct, header/nav/main/footer/phone-bar nav on every page; /edit/ has only `main` (private). `lang=en`, unique titles, 0 images without alt, 0 unlabelled controls.
- **Tap targets at 390.** Everything is 44px or more; the only smaller control is the hidden honeypot input (33x52, `tabindex=-1`).
- **Contrast.** Body and nav 16.96:1, navy on magenta button 5.35:1 at 20.8px, footer links about 7:1.
- **Not verified:** signed-in edit actions, backup download, an era swap, a phone's real Spotify/YouTube behaviour, the 768 and 1600 shots by eye.
