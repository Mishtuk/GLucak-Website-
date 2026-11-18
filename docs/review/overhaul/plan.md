# Overhaul plan (Desktop boss, 2026-11-18; owner asleep, binding per `overnight-plan.md`)

**Task:** turn the three reviews (`design-ux.md`, `content.md`, `technical.md`) into one ordered overhaul. **Done when** rounds
OV1-OV6 below have each passed the gate (npm test, shots, separate review, boss gate) and are pushed with a board post and HANDOFF line.

## 1. Direction (design-ux 7, adopted)
GLucak.com is **the gig poster that is always current**: one sheet in IDENTITY ink and paper where the next date, the newest song
and the slogan are the only loud things.
- **Loud by type, not colour.** Magenta fills only Listen, Tickets, Pre-save, Buy. Photos are print or clean, never tinted.
- **Time-true.** Everything in date order; Today / Tomorrow / Out now lead; the past shrinks by itself.
- **Same two actions at every width.** Listen and Shows are one tap at 320, 768 and 1600.
- **Gabe runs it.** Shows, releases, IDENTITY and the bio change from the edit screen, live on save, no rebuild.
- **Mostly subtraction.** No new motion, nothing new that needs Gabe's facts, hard rules unchanged.

## 2. KEEP / CHANGE / REMOVE / ADD (merged; "D" = design-ux, "C" = content, "T" = technical)
| # | Call | Item | Src | Why / where |
|---|---|---|---|---|
| K1 | KEEP | Big Shoulders + Atkinson pair, fitted lockups (D25) | D | strongest thing on the site |
| K2 | KEEP | IDENTITY era + era tokens (D93), one-change swap | D, C | Nov 3 promise kept; AA contrast measured |
| K3 | KEEP | Phone bar (D8), footer LISTEN / SHOWS / JOIN, grain, 2px corners, no shadows | D | load-bearing |
| K4 | KEEP | Section word above each phrase (D79 / D87) | D | ruled: wayfinding under 900px, not an eyebrow (D108) |
| K5 | KEEP | Home screen one at 390, slogan bands, Home cap (D39 / D67) | D, C | passes the Instagram test |
| K6 | KEEP | Music crate, IDENTITY CD block + tracklist, platform row, "Start with Go" | D, C | best component; facts current |
| K7 | KEEP | Videos page, YouTube facade (D64), flashing-video guard | D, C, T | best practice, hard rule 1 |
| K8 | KEEP | A11y: focus rings, landmarks, labels, 200% reflow, CLS 0, skip link | T | best area |
| K9 | KEEP | Edit engine: validation, sign-in, backup download, injection tests | D, T | reuse for new tabs |
| K10 | KEEP | His words verbatim: slogan, quotes, Patreon line, sign-up line, 404 line (D23) | C | no invented voice |
| K11 | KEEP | Today / Tomorrow, Add to calendar, Played by itself, empty states | D, C | time-true already |
| K12 | KEEP | Shop hidden; D41-D43 / D49 (no new shop work until real products) | D, C | conflict: no sample rename (D49 wins) |
| C1 | CHANGE | Shows in date order; next date gets the big date; full show flagged in place + "Next full show" line (S1, H4) | D | Today hid under Jan 16; D100 |
| C2 | CHANGE | Played: last 3, then `<details>` "All played (n)" (S2) | D | halves Shows |
| C3 | CHANGE | Book GLucak ends on "Request a show" (Instagram DM now, mailto once `BOOKING_EMAIL` is set) (S4) | D vs C | conflict ruled D108 |
| C4 | CHANGE | Riverside Jan 16 shows "Free" | C | Gabe confirmed free |
| C5 | CHANGE | Nav + header Listen from 700px (G1) | D | 700-899 shows only "Menu" |
| C6 | CHANGE | Lockups scaled 700-899px (H3) | D | THE TIME IS NOW ~300px tall at 768 |
| C7 | CHANGE | Now line becomes a ticket stub, one link, static (H1) | D | most useful line reads as a footnote |
| C8 | CHANGE | Accent discipline: Join, Patreon `btn-line`; play squares `--text` (G2) | D | Listen must own magenta; D98 |
| C9 | CHANGE | Player first in RISE at every width (H2) | D | desktop leads with a placeholder sleeve |
| C10 | CHANGE | Spotify `?theme=0` (G3) | D | DESIGN 5 already says so; build drifted |
| C11 | CHANGE | Edit rows one line, Delete inside the form, Played folded, Save bar never covers a row, "See it on the site" (E2, E3) | D | 4,200px of cards at 320 |
| C12 | CHANGE | Home `<title>`, meta description; add `og:url`, `og:site_name`, `og:image:alt`, `twitter:image:alt` | T, C | title is just "GLucak" |
| C13 | CHANGE | Astro 7.4.12, `engines >=22.23.4`, `npm audit fix` (build-time only) | T | 9 high, all build-time |
| C14 | CHANGE | ETag + 304 for static files | T | daily re-download; stale `app.js` risk |
| C15 | CHANGE | Jan 15 date-bomb test; daily deploy-hook job, inert without `RENDER_DEPLOY_HOOK` | T | red tests from Jan 15; no host rebuild |
| C16 | CHANGE | Menu sheet focus; boot warning if PROD without `DATA_DIR` / `TRUST_PROXY=1` | T | silent data loss trap |
| C17 | CHANGE | Bio interim: drop paragraph 2 ("Two albums ...") until Gabe pastes his new one himself | C | wrong count; D23 = his words, removal only |
| C18 | CHANGE | Home "latest" video skips Shorts | C | a stray short reads as the newest |
| C19 | CHANGE | Copy: shorter player fallback, "New shorts most weeks on YouTube.", shop "once the merch is ready", footer credits one line | C | strings in content.md 2, used verbatim |
| C20 | CHANGE | Shop: one notice (drop the chip and the "Sample:" title prefix) | D, C | 4 notices, "SampleSample" |
| C21 | CHANGE | One photo language (print / clean), magenta out of photos, no frame twice, About header readable (G4, G5, A1) | D | 5 treatments on one page; D98 |
| R1 | REMOVE | `src/pages/v2/`, `src/styles/v2.css`, `test/v2.test.js` (keep the `v2-*` rules in global.css) | D, T | dead second Home |
| R2 | REMOVE | Review screenshots in `docs/review/**` that no `.md` links (from HEAD only, no history rewrite) | T, plan | 100 MB; overnight rule |
| R3 | REMOVE | The 3 identical heading fades | D | D102 |
| R4 | REMOVE | About "Find GLucak" (footer carries it); full credits only once, on About | D, C | duplicate; conflict ruled D108 |
| R5 | REMOVE | Sign-up band on 404 and Shop | C | 404 ends on Listen |
| R6 | REMOVE | Round tests (ig2-ig6, dr1, round2, v1, v2port, d64, browsers) as each round breaks one; real asserts to `test/rules.test.js` | T | change detectors; never weaken shows / edit / injection / flashing tests |
| R7 | REMOVE later | `prototype/`, era photo variants, 13 Shorts thumbs, placeholder era | T | tests or docs still reference them: not in the overhaul |
| A1 | ADD | Edit tabs: Now + IDENTITY, Bio, Releases (E1), live through `<!--gl:...-->` markers | D, C, T | promised Nov 3 + Nov 6; D106 |
| A2 | ADD | Share a show: `navigator.share`, copy-link fallback, static "Link copied" (S3) | D | D104 |
| A3 | ADD | Sound line under the hero: "EDM, rap and rock. Raw lyrics, real faith, high energy." | C | his Nov 2 words; first-timers |
| A4 | ADD | "Next: Welcome Home, Dec 18. Pre-save." under Who I Am on Home | C | this month's release missing on Home |
| A5 | ADD | Shows intro line (content.md 2, Shows) | C | his "unreleased songs" line |
| A6 | ADD | About first-person opener (his YouTube Nov 5 line) | C | About sounds like him |
| A7 | ADD | Photos on About from already-cleared files, plain links, no lightbox (A4) | D, C | Nov 2 gallery request; fills 1280 void |
| A8 | LATER | srcset pass, poster eager, Music JSON-LD, external CSS, off-server backup, YouTube feed, Scenic sign-up line request-time | T, C | loops 2-5 |

## 3. Rulings (logged in DECISIONS.md, "boss, owner asleep, reversible")
| Argued change | Ruling | D |
|---|---|---|
| D34 + DESIGN 3b (hero B riso, Push tint), DESIGN 1 item 4 (accent on play button) | **Overturn in part.** Hero A on phones / B from 900px stays. Magenta leaves photos and play squares; fills only Listen, Tickets, Pre-save, Buy. Photos: print or clean. A 2-up before/after sheet is committed so the owner can reverse | D98 |
| DESIGN 5 "first full show is the poster" (shows.js 82) | **Overturn.** Date order always; the next date gets the big treatment; a full show keeps its art and a "Full show" flag where it falls, plus a "Next full show" line | D100 |
| D47 / DESIGN 8 "exactly two motions" | **Amend by subtraction.** The 3 heading fades go (every phrase visible at load). The name wipe (M1) is **not** built in the overhaul: new motion for an epilepsy-survivor client waits for the owner | D102 |
| D96 rejected share | **Overturn.** Share on upcoming show rows; no third party, no motion | D104 |
| Technical open question: releases + bio editing | **Build it** (overnight plan): `site.json` (bio, Home sentence, IDENTITY date + pre-save) and a `releases` list in `LISTS`, injected per request; IDENTITY days-to-go moves to request time | D106 |
| Review conflicts | Booking: Instagram DM until the glucak.com address exists, then one constant flips to mailto. Credits: one line in the footer, full list once on About. D79 / D87 word kept. Dec 4 row stays (Gabe's data, he can delete it) and goes on the Gabe list. Shop samples not renamed (D49). Shorts skipped as "latest"; feed later | D108 |
| Overnight decisions not yet logged | Repo stays public, no history rewrite; review shots to `.work/`, max 4 committed per round | D110 |

## 4. Rounds (in order; every round ends with the same gate)
**Gate (every round):** `npm test` green -> shots 390 + 1280, motion on + reduced, changed pages only, to `.work/` -> reviewer
(Sonnet, separate) runs design-review skill + sloplint triage + hard-rules check (no injection, no flash, reduced motion, one-click
nav) -> boss gate (Opus, short) -> push as Alex Mishtuk, no AI line -> board #1 post (hash + one line per commit) -> HANDOFF line.

**OV1. Technical quick wins (no design, no DESIGN spec).** Two briefs in parallel.
- OV1a helper (Haiku). Files: `src/components/content.js` (theme=0), `src/layouts/Base.astro`, `src/pages/index.astro` (title,
  description from content.md 2 Home meta, the four og/twitter tags), `src/pages/about/index.astro` (meta from content.md), R1 + R2
  deletions via `git rm`. Done when: built Home has the new title and 4 tags; `/v2/` 404s; every deleted image has no hit in
  `git grep <basename>`; tests green after removing `test/v2.test.js`. OUT: any visible copy, other deletes (R7), CSS.
- OV1b coder (Sonnet). Files: `test/build.test.js` (111: expected Scenic line computed from `SCENIC_DAY` vs now, plus a unit test
  both sides of the date with an injected clock; grep other real-clock tests), `.github/workflows/daily.yml` (own job, `needs` the
  build not the tests, `HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}`, `[ -n "$HOOK" ] && curl -fsS -X POST "$HOOK"`, else echo skip),
  `package.json` + lock (astro 7.4.12, engines, `npm audit fix` without `--force`; if the lock diff touches `sharp` or any runtime
  import of `server.js`, revert the audit fix and note it), `server.js` (ETag size+mtime, 304 on `If-None-Match`, warnings at boot),
  `public/js/app.js` 15-19 (focus after the sheet shows), `docs/launch/runbook.md` (NODE_VERSION, the secret). Done when: tests pass with the
  clock set to Jan 16 2027; workflow passes with no secret; curl shows ETag + 304; `npm audit --omit=dev` lists no runtime package.
  OUT: request-time countdown (OV4a), image pass, CSS split, round-test pruning.

**OV2. Shows time-true (designer spec DESIGN 28a-d, then coder).** Designer (Opus) writes **one** DESIGN 28 covering OV2-OV5 UI
(28a shows order + flag + next-full-show line, 28b Played fold, 28c share, 28d Request a show + "Free", 28e 700px nav + lockups, 28f Now
stub, 28g accent rule, 28h player first + fades out, 28i edit tabs + compact rows + save bar, 28j sound line + Welcome Home line).
Coder (Sonnet). Files: `src/lib/shows.js` (`upcomingHtml`, `posterHtml`, `playedHtml`, booking), `src/pages/shows/index.astro`,
`src/pages/index.astro`, `src/components/ForVenues.astro`, `public/js/app.js`, `src/styles/global.css`, shows tests. Done when: with
injected dates (today open mic + later full show) rows are in date order on / and /shows/; the next date is biggest; Riverside shows
"Full show" and "Free" (field named in 28d, escaped, editable later); Played shows 3 + details; share button works with fallback;
Book GLucak ends on "Request a show" to the Instagram DM in a new tab. OUT: poster photo swap (OV6), Now line, nav.

**OV3. One tap at every width + accent discipline (DESIGN 28e-h, coder Sonnet).** Files: `src/styles/global.css` (199, 214-217, 543,
141, 442, motion block), `src/components/Header.astro`, `Hero.astro`, `RiseBand.astro`, `Signup.astro`, `src/pages/index.astro`,
`src/pages/about/index.astro`, `public/js/app.js` 49 (fades out), `src/lib/shows.js` (Now stub markup). Done when: at 700, 768, 899 the
nav and Listen show with no sideways scroll; Now stub is one link, static, <= 56px tall at 320, shows OUT NOW for a release; magenta
fills on Home 390 <= 3 (test counts them); RISE player above the card at 1280; no `.fade` and 0 running animations; Home height within
the D39 cap. OUT: photos, new motion, copy changes.

**OV4a. Edit: Now + IDENTITY and Bio tabs (DESIGN 28i, coder Sonnet, reviewer Sonnet + security pass).** Files: `server.js` (site
object in store, `<!--gl:bio-->`, `<!--gl:home-bio-->`, `<!--gl:identity-->`), `src/lib/store.js` (validator: text caps, https-only
pre-save, real date), new `src/data/site.json` seed (current bio verbatim), `src/pages/{index,about,music}`, `src/pages/edit/index.astro`,
`public/js/edit.js`, compact rows + save bar (E2, E3), tests, `docs/guide/gabe-guide.md`. Done when: a save changes the bio, the Home
sentence and the IDENTITY date + pre-save on the next page load, no rebuild; days-to-go computed per request; bio rendered as text
paragraphs (blank-line split, `curly()`, never HTML); tests prove `<script>`, `' OR 1=1 --` and `javascript:` stay inert or refused per
field; 409 on stale save; size cap. OUT: releases, videos, socials, quotes, restore UI, auth changes.

**OV4b. Edit: Releases tab (coder Sonnet, same reviewers).** Files: `server.js` (`LISTS.releases`, `<!--gl:releases-->`, Now line
reads stored releases), `src/lib/store.js`, new pure `src/lib/releases.js` (crate HTML used by build and server), `src/pages/music/`,
`src/pages/index.astro`, `public/js/edit.js` (reuses product photo upload for covers), tests. Done when: Gabe can add or change a
release (title, date, type, https smart link, cover upload); Music crate, Who I Am tile and Now line follow on the next load; no-cover
sleeve still honest; injection tests per field. OUT: tracklist editing, era swap from the edit screen.

**OV5. Content fixes needing no Gabe answer (helper Haiku for strings, coder Sonnet for logic; DESIGN 28j for placement).**
Files: `site.json` seed (C17), `src/components/Hero.astro` (A3), `src/pages/index.astro` (A4), `src/components/content.js` (C18, C19
fallback), `src/pages/shows/index.astro` (A5), `src/pages/videos/index.astro`, `src/pages/shop/index.astro` (C20), `src/pages/404.astro`
+ shop (R5), `src/components/Footer.astro` (credits line), `src/pages/about/index.astro` (A6). Done when: every string matches
content.md 2 verbatim; Home "latest" is the newest non-Short; test `build.test.js` bio list updated to the seed. OUT: new bio, the
held items below, shop renames.

**OV6. One photo language + About (designer Opus DESIGN 29 + owner 2-up sheet, coder Sonnet).** Files: `tools/photo/run.mjs`,
`public/media/*` (new files only from `assets/from-gabe` cleared in CREDITS.md), `Hero.astro`, `PushPhoto.astro`, `src/lib/shows.js` 66
(new poster frame), `src/pages/about/index.astro` (R4, A7), `global.css`, DESIGN 3b. Done when: two treatments only; no frame used
twice; magenta in no photo; About header photo reads at 768 / 1280; gallery of cleared photos, each a plain link, alt text, credits
once; the 2-up sheet is one of the 4 committed shots. OUT: any photo not already cleared, AI upscaling, lightbox script.

## 5. HELD (Gabe or owner; no guessing)
New bio (NO LONGER HELD, 2026-11-18: "Reforged" confirmed, bio on the site, epilepsy lines kept; round GA) and whether "Epilepsy survivor" stays; Dec 4 Airport Square still on; open-mic cover and set length;
venue towns / street addresses; Scenic Route giveaway file + Kit account; Discord link; Montco Radio mention; Scenic lyric line by track
12; single art for Scenic Route / Welcome Home / Who I Am (M2 "Coming up" row waits with it); CD photo credits; which real merch first;
M.O.M's vs "Cheshire" name; booking details (owner creates the glucak.com address, then `BOOKING_EMAIL` flips); D81 player size;
the M1 name wipe (owner); host purchase, `RENDER_DEPLOY_HOOK` secret, `NODE_VERSION` on Render (owner).

## 6. Budget (rough, tokens)
| Step | Model | Estimate | Heavy because |
|---|---|---|---|
| DESIGN 28 (one spec for OV2-OV5) | Opus | ~90k | reads DESIGN 5/8/10, shows.js, global.css; one call instead of four |
| DESIGN 29 + 2-up sheet | Opus | ~70k | photo runs + image reads |
| Boss gates x7 | Opus | ~15k each, ~105k | read review + 4 shots only, not the code |
| OV1a / OV5 strings | Haiku | ~20k each | mechanical |
| OV1b, OV2, OV3, OV5 logic, OV6 build | Sonnet | 60-120k each, ~450k | tests + build loops |
| OV4a + OV4b | Sonnet | ~150k each, ~300k | server + store + edit.js + injection tests |
| Reviewers x7 | Sonnet | ~50k each, ~350k | screenshots: 390 + 1280 screen + full, changed pages only |
Total ~1.4M, Opus ~265k. Screenshot reads are the hidden cost: reviewers read `-screen` shots first, `-full` only for height checks.
At 85% of the session window: push what's done, update HANDOFF, start no Opus work (overnight plan, Usage).
