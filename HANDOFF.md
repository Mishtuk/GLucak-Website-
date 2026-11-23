# GLucak website: handoff (always current)

**Read order for a new session:** `CONTEXT.md` (goal, owner rules, client brief) -> this file -> board issue #1
(`node tools/board.mjs read 10`) -> `DECISIONS.md`. Client email: `README.md`.

- Repo: https://github.com/Mishtuk/GLucak-Website- (local `V:\GLucakWebsite` on the Desktop)
- Commits authored as `Alex Mishtuk <113945444+Mishtuk@users.noreply.github.com>`, **no Claude / AI attribution line**
  (owner, 2026-11-06). Set it once per clone: `git config user.name "Alex Mishtuk"`.
- Team agents: `.claude/agents/` (boss, designer, coder, mediator, researcher, copywriter). Research: `docs/research/`.
- **Keep this file current:** update "Now working on" and "Status" with every milestone push.

## Morning summary (2026-11-18, overnight run finished ~10:00 ET)
- **Overhaul OV1-OV6 done + 5 loops of test / repo research / revamp done.** Design score 29 -> 34/40, audit 18/20; `npm test` 316/316;
  all 8 pages clean at 320-1600 (no overflow, no animation, motion switch + reduced motion honoured, CSP self only). `loop5-test.md`.
- **Gabe's edit screen now does everything promised Nov 3 / Nov 6:** Shows, Releases (cover upload), IDENTITY date + pre-save, Bio,
  Products; backup / restore covers all of it.
- **Security:** timeouts + headers (SEC1), CSP frame-ancestors / base-uri 'none', uploads checked by magic bytes, scrypt s2,
  sign-out revokes on every device, no-secrets test, `.npmrc ignore-scripts=true`. `npm audit`: 10 high, all picomatch ReDoS in
  Astro's build-time globbing (no fix exists upstream; not reachable from server.js, which serves static dist).
- **Repos:** 5 loops, 54 repos credibility + harm-scanned via `gh api` only (`repo-safety-log.md`); none harmful; only our own
  rules / tests adopted, nothing installed. Instagram: 2 loops, nothing new usable.
- **Owner calls (nothing done on them):** About header is Gabe's violet grade (swap for a Print frame?); Home hero "G [photo] LUCAK"
  wordmark split (owner taste); HELD list in `docs/review/overhaul/plan.md` section 5 (new bio "Reforaged", venue towns, Discord,
  giveaway / Kit, host purchase + `RENDER_DEPLOY_HOOK`, glucak.com booking address). Decisions taken without you: D98-D116 (reversible).

## Now working on
- Laptop 2026-11-23: admin self-sufficiency rounds A1-A3 (plan docs/review/admin/plan.md); claims src/pages/edit/, public/js/edit.js, server.js edit routes, src/lib/store.js, backup.js, upload.js, test/edit*.test.js
  - A1 done (Sonnet coder + advisor ship): Today card (next show, IDENTITY, Add show / Fix a release), View site, Undo bar replaces confirm() (per-tab stack, Played fold), rows wrap with the year, photos shrunk in the browser (2000px WebP/JPEG, original if that fails), sign-out guard names unsaved tabs, Saved at 4:12 PM, Add show = Open mic + focus Date. 347 tests. NEXT: A2 history + drafts + error codes.
- **OVERNIGHT 2026-11-18 (owner asleep, no questions, 5 loops): follow `docs/review/overhaul/overnight-plan.md`.** Wake-up
  scheduled ~03:47 ET (done); paused at ~80% usage after OV4a; owner resumed it 09:03 ET (13:43 one-shot cancelled); hourly heartbeat 14:30-20:30 stays as fallback (session-only cron). Progress log: append one line per finished step below.
  - 03:50 boss plan `docs/review/overhaul/plan.md` (OV1-OV6, D98-D110) pushed; repo loop 1 research running; OV1 started.
  - OV1 (quick technical wins) gated + pushed: titles / og, Spotify theme=0, /v2/ + 367 unused shots removed, Jan 15 date bombs fixed (suite green faked to Dec 18 / 19, Jan 16), ETag/304, boot warnings, Menu focus, deploy job (inert until RENDER_DEPLOY_HOOK secret), Astro 7.4.12 + engines >=22.23.4; audit 10 high build-time accepted (`ov1-gate.md`). Repo loop 1 + IG loop 1 research committed. DESIGN 28 (OV2-OV4 design) in progress.
  - OV2 + OV3 gated + pushed (DESIGN 28, D112, D114; review 33/40, `ov23-review.md`, `ov23-gate.md`): shows in date order with Full show flag + Next full show, Played folds, share a show (navigator.share / copy), Request a show -> Instagram, `cost` field (Riverside Free), nav + Listen from 700px, Now ticket stub, magenta only on main actions, player first, fades out; Home cap 5.85 screens (D114). Vendored safe review text (anti-slop gate, mobile layout, triage) + agent rules. Repo loop 2 (security-focused) committed. Next: SEC1 (workflow perms + SHA pins + dependabot cooldown, server timeouts, headers on every reply + test), then OV4a/4b edit tabs.
  - SEC1 gated + pushed (`sec1-gate.md`): workflow perms per job + SHA-pinned actions + concurrency + timeouts, dependabot 7-day cooldown, server request 120 s / headers 20 s / body idle 10 s -> 408, COOP / CORP / X-Permitted-Cross-Domain-Policies / Origin-Agent-Cluster on every reply, upgrade-insecure-requests on https; embeds verified in headless Chrome. Next: OV4a/4b edit tabs.
  - Daily workflow verified after SEC1 (run 44277408459: daily + deploy success; gh-pages 431142f).
  - OV4a gated + pushed (`ov4a-gate.md`): edit screen tabs Shows | IDENTITY | Bio | Products; Gabe edits the About bio, Home sentence, IDENTITY date + pre-save (https only), live via site.json + markers, in backup / restore; 277 tests. NEXT: OV4b Releases tab (L), OV5 content fixes (no Gabe answers), OV6 photo style + About + gallery (DESIGN 29), then loops 3-5 (test loop + repo / IG research + revamp).
  - OV4b gated + pushed (`ov4b-gate.md`): Releases tab (5 tabs Shows | Releases | IDENTITY | Bio | Products), live crate / Home latest / Now line via `src/lib/releases.js` + markers, releases + covers in backup / restore (IDENTITY never read from a file). Loop 3 repos (10, none harmful, `repos-loop3`) -> html-a11y test, CSP frame-ancestors / base-uri 'none' + XFO DENY, boss rule. 297 tests. NEXT: OV6 spec (DESIGN 29, designer running), OV5 content fixes, then loops 4-5.
  - OV5 pushed (85c4536..bb11c52): bio interim drops the wrong "Two albums" paragraph (C17), Home latest video skips Shorts, Shorts line, shop wording (no Preview / Sample:), no sign-up band on 404 + Shop, footer credits one line; Home 390 = 3811px (cap 3861). DESIGN 29 + D116 (OV6 spec, deviations ruled) pushed 022d836. 302 tests. NEXT: OV6 build (coder running), its review + gate, then loops 4-5.
  - OV6 gated + pushed (`ov6-gate.md`, sheet `ov6-sheet.png`): one photo language (Print + Clean), each frame once, magenta in no photo, About header = CD live shot + Photos gallery (plain links), Vladd credit; review 33/40, 17/20. Loop 4 repos (12, none harmful) -> uploads checked by magic bytes, scrypt s2 (N=2^15 p=3, old hashes verify), sign-out revokes on every device. 314 tests. OVERHAUL OV1-OV6 DONE. NEXT: loop 5 (full test loop at 320/390/768/1280/1600 + IG check + last repo round + revamp), then the morning summary.
  - Loop 5 done: full test loop 34/40 + 18/20 (`loop5-test.md`), About gallery one full-width row from 900px; repo round 5 (9 repos, all reference) + IG (5 new reels, none usable); `.npmrc ignore-scripts=true` (npm ci + build + tests verified), `test/secrets.test.js`; `npm test` now runs the build itself (ignore-scripts skips pretest; CI run 44330043174 green, preview republished). 316 tests. ALL LOOPS DONE; heartbeat cron removed.
  - 10:30 owner asked for a visual shake-up (staggered panels, better top bar, palettes to cycle). DESIGN 30 "poster wall" written + D118. Paused at 86% session usage. NEXT (resume ~14:05 ET): round PW1 = 30 palettes + `?palettes` switcher (boot.js, no flash) + top bar; then PW2 Home layout; PW3 other pages; each: coder Sonnet -> shots -> design-review -> gate -> push. 30g entrance motion waits for the owner's yes.
  - 13:40 Gabe's answers arrived (email 13:26): written to CONTEXT.md '2026-11-18 Gabe's answers' (17 new 2027 shows, towns, Bandsintown, credits, Patreon line, quotes, bio fixes; his home address kept OUT of the repo). NEXT after PW1: round GA = put these on the site (shows.json, credits, Patreon, quotes, maps links).
  - 14:50 PW1 (6 palettes, ?palettes Colours switcher, new top bar) + GA (Gabe's answers: 2027 shows, map links, Bandsintown, credits, Patreon, Scenic Route quote, Reforged bio, shop line) gated + pushed (`pw1-review.md` 34/40 17/20, `pw1-gate.md`, `ga-gate.md`); preview republished. NEXT: PW2 Home layout (DESIGN 30e/30a-3..5, cap 3920), then PW3. 30g entrance waits for the owner. Open: King's Corner town, Who I Am chorus line, 'valleys' spelling.
  - 15:40 PW2 Home layout (taped hero print, mirrored Rise, angled Shows banner, About paper sheet, Join ticket, torn footer) gated + pushed (`pw2-review.md` 34/40 16/20, `pw2-gate.md`); Home 390x660 = 3916 with shipped shows. NEXT: PW3 other pages (DESIGN 30f; drop the Home-only scoping where pages share the layout; delete the 72rem .shows-grid rule).
  - 16:40 PW3 other pages (Music IDENTITY paper sheet + staggered crate, Shows ticket + poster breakout + sticky side, About collage + sticky column, Videos mosaic, Shop taped notice + staggered grid) gated + pushed (`pw3-review.md`, `pw3-gate.md`). DESIGN 30 rounds 1-3 DONE. Waiting on the owner: palette pick (?palettes), 30g entrance yes/no, King's Corner town, 'valleys'.
- **Desktop 2026-11-18: OVERHAUL in progress (owner: "deep dive review of the website in all aspects ... an overhaul";
  use the past emails `docs/research/email-thread-digest.md` + everything learned).** Reviews: `docs/review/overhaul/design-ux.md`
  (29/40 across all widths; direction "the gig poster that is always current"; top: shows in date order not poster-first, edit
  screen gets Releases / Now + IDENTITY / Bio tabs (promised Nov 3 + 6), one-tap Listen at 700-899px, Now line as a ticket stub,
  magenta only on Listen / Tickets / Pre-save / Buy, Spotify `theme=0`; argues to change D34, the DESIGN 5 poster rule, D47, D96
  share; must keep: type, slogan bands, era system, cover grid, Videos, phone bar, footer, 404, Today / Tomorrow, calendar, section
  word), `content.md` (promises 10 done / 5 partly / 2 missing: gallery, Discord; stale bio "two albums"; booking has no
  address; videos.json hand-fed), `technical.md` (DONE: repo is PUBLIC and tracks unreleased IDENTITY CD art + Gabe's originals + ~100 MB shots -> owner decides visibility; edit screen lacks releases / bio; daily.yml has no Render deploy hook and test/build.test.js:111 date-bombs on Jan 15; Astro 7.4.12 + engines + npm audit fix; cache validators; a11y strong; delete list of 8 groups). **Next:** boss merges the three into
  `docs/review/overhaul/plan.md` (keep / change list + ordered rounds to Jan 11), then designer -> coder -> shots -> design-review
  -> boss gate per round. Local review server was on :8095 (DEV_EDITOR=1, DATA_DIR=.work/review-data); stop it when done.
- **Desktop 2026-11-18: round DR1 DONE (DESIGN 27, D96 approved, `docs/review/dr1/gate.md`):** speculation-rules prefetch over a
  header + still phone bar, Today / Tomorrow on the next show (Now line rule T, amends D45), Apple Music / YouTube / SoundCloud
  row under Spotify, curly quotes everywhere (`curly()` before escaping), Shows Watch lead + two at 1280, era selection / caret /
  scrollbar. Design review 31/40 (was 29), hard rules PASS, `npm test` 245/245, Home 3782 at 390, Music 1280 +56 accepted.
  New: `docs/research/RESOURCES.md` (every owner-shared resource), project skill `.claude/skills/design-review/` (impeccable
  rubric + our overrides), hallmark sloplint triage `docs/review/dr1/sloplint-notes.md`. Loop for every UI round: designer spec ->
  coder -> 390 + 1280 shots (motion on + reduced) -> design-review + sloplint by a separate reviewer -> boss gate.
- **Desktop 2026-11-17 status:** round done and pushed (boss-approved, `docs/review/desktop-round-2026-11-17-review.md`): S1 / S7 /
  sign-in log, poster = first full show, 'Shop', Dependabot, Welcome Home Pre-save, `--w-close` 10.65, **daily Actions workflow**
  (`.github/workflows/daily.yml`, 09:00 UTC: npm ci, npm test, republish preview; owner OK'd; first run green). `npm test` 232/232.
  Research in: `templates-round4`, `ig-design-tips-round2` (+ Whisper transcripts), `oversight-supply` (Reddit; free sections need
  an account = owner OK). Running: design-skills research (impeccable, hallmark, shadcn: owner's tip). **Next:** designer (Opus)
  round from the research with 390 + 1280 screenshot loop; small items: curly quotes in visible copy, speculation-rules prefetch,
  platform links row. Owner: follow-up email to Gabe (Zelle for the deposit) drafted in chat, not sent by us.
- **Desktop 2026-11-17 claim (back after Nov 7):** round plan `docs/review/desktop-round-2026-11-17.md` (green tests, Welcome Home
  Pre-save, S1 / S7 / sign-in log, poster = first full show, Dependabot, daily build). Files: `server.js`, `src/lib/`,
  `src/data/releases.json`, `test/{build,shows,server,products,signup-http}.test.js`, `.github/`. **Owner 2026-11-17: the Laptop
  is unavailable; the Desktop holds ALL files** (Laptop's Nov 10 claim released by the owner; see CONTEXT.md). New from Gabe (Nov 13): Welcome Home smart link `https://wingsmusic.lnk.to/383142-WelcomeHome`; new Spotify bio
  is out (held until the owner's follow-up email is answered).
- **Laptop 2026-11-11 round V1 DONE (DESIGN 26, D95):** `/videos/` built (Scenic Route live lead, Riverside clip with privacy crop, music videos, Shorts link; Play buttons, no iframe until pressed), Videos in nav + phone-bar Watch, Music leads with IDENTITY, Home jump slot is the live face crop, apple-touch icon on #05024c. `npm test` 227/227, Home 3735 at 390, 0 animations. Open for Gabe: who filmed the Riverside clip; confirm Emily Mae on You're Not Alone (not in its title, so no line).
- **Laptop 2026-11-11 round IG6 DONE (Gabe's answers, DESIGN 25, D93):** Gabe's email of Nov 6 answered all 23 questions (`docs/research/gabe-answers-2026-11-06.md`, files `assets/from-gabe/identity-cd/`). Site is now the **IDENTITY era** (ground #05024c, accent magenta #d93cfb; era bug fixed: `html:root` so era colours beat global.css :root), prints re-skinned, his CD photos in slots, IDENTITY cover + 12-track list on Music, real shows (venue towns in `docs/research/venues-2026-11-11.md`, 5 medium-confidence + Cheshire left out: ask Gabe), Welcome Home Dec 18 ("Follow on Spotify", no pre-save), flashing videos blocked (FLASHING in content.js + test), QUOTES_APPROVED on (Home keeps RISE only), Healed by Christ subheader, Patreon line, credits. `npm test` 213/213, a11y200 0, Home 3735 at 390 (5.66 screens). **Owner:** Kit + Scenic Route sign-up giveaway, domains (glucak.com + slogan domain, Gabe said yes), Fourthwall later.
- **Laptop 2026-11-11 round IG5 DONE (DESIGN 24, D91):** inner pages: static grounds from 900px (404 Truchet arcs g-turns.svg, Music record groove g-grooves.svg under RISE, hero wall strip on Shows; `tools/photo/grounds.mjs`), `ForVenues.astro` "Book GLucak" on Shows + About (no button until BOOKING_EMAIL), Music "New here? Start with Go" (`START` in content.js, Gabe Q44), 404 "Wrong turn" without period, Nov 10 Short in videos.json. `npm test` 201/201, a11y200 0, 0 animations, Home unchanged 3601 / 4277. Copy `docs/copy/ig5.md` (Gabe Q43-46). Next per `docs/review/laptop-plan-2026-11-11.md` Update table: S round needs owner OK (Desktop files).
- **Laptop 2026-11-11 round IG4 DONE (DESIGN 23, D89):** owner liked the 1280 hero riso -> texture family per photo slot (`tools/photo/texture.mjs`, colours from the era file): phone hero riso on black, hero wall dot-screen replaces the glow (Home 0 animations), Live It Loud line screen, Rise coarse photocopy halftone, Push Past Fear two plates off register, About shadows screened. SHOWS / Full bio arrow links, grey band rules, display section word, footer words without periods, Menu sheet opens from the button (motion-on only). Advisor **4.33** PASS, hard rule 1 PASS (`docs/review/ig4/eval.md`), fixes in 644d216. `npm test` 194/194, Home 3601 at 390. Research: `docs/research/ig-security-reels.md` (4 owner reels + channels). **Desktop / owner OK needed (src/lib, server.js):** S1 sign-up crash patch, new S7 `//` redirect at server.js ~300, log failed sign-ins, Dependabot + npm ci, optional COOP / upgrade-insecure-requests / security.txt, "Shop." -> "Shop" in products.js 118.
- **Laptop 2026-11-11 plan:** `docs/review/laptop-plan-2026-11-11.md`: next round IG4 (last AI-default clichés: hero glow, ghost SHOWS button, white band rules, 17px section word, footer periods), then Nov 13 Who I Am republish, M1 menu motion, owner picks D81 + tint, then src/lib launch blockers (needs owner OK, Desktop silent).
- **Laptop 2026-11-11 status (owner asleep, working autonomously).** Rounds IG2 (7e9c62a: section word on the rule, About
  setlist, no middle dots) and IG3 (2795c0f, D87: ledge, setlist arrows, chip on the footer rule) done; each scored 4.0 by the
  advisor, who calls visual polish at diminishing returns (`docs/review/ig-round3/eval.md`). Then round R1 (robustness):
  stress test with messy data, 4 overflow fixes (982614a, `docs/review/r1-stress.md`); DESIGN 22 sleeve card for releases with
  no cover, built (2ae6e60; Who I Am goes latest Nov 13 with cover:null); browser fallbacks for iOS 15-18, verified in WebKit 27 +
  Firefox 159 (3cefd93, `docs/review/r1-browsers.md`, 11-row real-phone checklist). `npm test` 188/188, a11y200 0 issues, Home
  3601px. **Security** (`docs/review/security-2026-11-10.md`): ready with fixes; **S1 launch blocker for the Desktop**: POST
  `null` JSON to /api/signup crashes the server; tested patch in `docs/review/patches/s1-signup-crash.diff` (S1 APPLIED 2026-11-17 by Desktop, test/signup-http.test.js). Desktop silent since Nov 7.
  **Owner:** read Charles Liu's Instagram reply (Chrome extension was disconnected); the two picks below (player size, tint).
- **Laptop 2026-11-10 round IG DONE (D69/D71/D73, plan `docs/review/round-ig-plan.md`, gate `docs/review/ig-round/gate.md`).**
  Built in src/: sign-up "Sending…" + one POST per double tap (5e5313b); copy trims Booking / Pre-save / Releases / Full bio /
  player note (595f2ca); no filled tag pills, Album/EP plain bold, `--tint: 0%` token, two redundant rules out (85fb607, ef2fe8b).
  `npm test` 171/171, a11y200 0 issues, Home 3631px quotes off at 390 (Laptop baseline 3633). Advisor score **4.0/5**, hard rule 1
  PASS (`docs/review/ig-round/eval.md`); its 3 fixes (Spotify Play in screen one at 390; flatten white `.tab` labels; About
  1280 right column) are the next round. **Owner:** (a) on phones keep the full Spotify playlist player on Home or switch to the 80px compact one so Play is on screen one (D81, docs/review/ig-round2/gate.md); (b) pick the tint 0 / 5 / 10% from `docs/review/ig-round/design/tint-sheet.png`
  (designer recommends 5%). Claims stay on the same files for the next round (below).
- **(RELEASED by the owner 2026-11-17, Desktop holds all files)** Laptop 2026-11-10 claim (next round, same files): `DESIGN.md`, `src/styles/global.css`,
  `src/components/{Hero,Quote,VideoBlock,Signup,RiseBand,Footer}.astro`, `src/pages/index.astro`, `src/pages/{music,shows,about,shop}/`, `src/pages/404.astro`,
  `public/js/app.js`, `src/components/NoCover.astro`, `test/*.test.js` (Laptop-made), `docs/review/`, `docs/copy/`.
  Not server.js or src/lib/. Owner away; nothing published / paid / sent to Gabe.
- **Laptop 2026-11-10:** agents re-sized (b9bf3ca: advisor + helper added, mediator Haiku, boss task-first). Research:
  `docs/research/ig-design-tips.md` (Charles Liu reels) and `docs/research/ai-design-workflow.md`.
- **Laptop boss 2026-11-06 night: 18h port (a3c504a) approved, nothing to fix** (`docs/review/18h-port-review.md`). The 200%
  "About over the Now line" is the closed Menu sheet's box (laid out, not painted); nothing covers it on screen. **D67:** one
  quote on Home (RISE); the LIVE quote leaves Home (5.69 screens at 390). **Desktop next, when Gabe OKs the quotes:**
  remove `<Quote band="live">` from index.astro, flip `QUOTES_APPROVED`, re-measure. Optional: `.nav-mobile:not([open]) > .sheet { display: none; }`.
- **Desktop 2026-11-06 night: v2 items 1-4 + solid header ported into Home (3ee444d)**; `HEADER_STYLE` in content.js
  ('solid' default / 'scrim'). Home 5.76 screens, Spotify top 556px at 390x660. `npm test` 162/162. Preview republished.
  /v2/ stays unlinked + noindex. Then v2-port review fixes (db72e35) and DESIGN 18h (a3c504a): big latest video +
  two stacked from 900px, FEAR one line, phone Push photo beside its heading. Home 5.43 screens at 390 (quotes off);
  quotes on = 5.86 (~40px over D39): quotes stay off pending Gabe's OK + a ruling. `npm test` 164/164. Preview refreshed.
  Claims released except `server.js`, `src/lib/`.
- **Desktop status 2026-11-06 evening (v2 compare done):** 200% text fix (c8a4aa1), backup review fixes (d8254fa) +
  download messages (254773c), /v2/ comparison Home (bfce2c6, docs/review/v2-compare/), preview republished with /v2/.
  `npm test` 154/154. **Waiting on the owner:** which of v2's 5 items to port into Home.
- **Laptop out of tokens (owner, 2026-11-06 ~16:45).** Desktop is covering its queue WITHOUT touching its claimed
  `prototype/` + `DESIGN.md`: (1) 1.4.4 / 1.4.10 200% text fix built straight in `src/` (Laptop mirrors / restyles in the
  prototype later); (2) home-v2 built as an unlinked, noindex `/v2/` page in the real build (`src/pages/v2/`,
  `src/styles/v2.css`, new components only) for the owner's side-by-side; (3) boss security review of backup / restore
  (`docs/review/backup-review.md`); (4) backup link words drafted in `docs/copy/backup.md` (Laptop may revise).
- **Laptop:** nothing claimed (Gabe's guide `docs/guide/gabe-guide.md`, launch `docs/launch/checklist.md` + `runbook.md` done).
  `docs/review/backup-review.md`: approved; **Desktop next:** F1-F4 there) and its words (`docs/copy/round2.md` section 5).
  **Done 2026-11-06:** copy `docs/copy/round2.md` (D57) and designer DESIGN.md 16 + `prototype/music.html`, `404.html` (D55), boss
  review `docs/review/round2-boss.md` (also approves the Desktop's bf6704b, D59). **Desktop next:** port DESIGN 16h items 1-11 +
  the 3 bf6704b follow-ups in round2-boss.md section 3 (release day before a coming release; "Show Nov 20: ..." Now line, no
  aria-label; F2 upload message). Owner's real-phone test: add "tap Add to calendar on iPhone and Android". Laptop still open:
  task 8 (one Gabe question list).
- **Round 2026-11-05 (owner: store + admin console, then visuals, split evenly). Split posted on #1:**
  - **Laptop:** L1 photo treatments into the prototype per D34 (hero A phones / B 900px+, (d) Push Past Fear, (c) Live It
    Loud poster, (e) About with the HANDS frame swapped); L2 DESIGN.md + prototype for the Shop (grid, product card,
    detail, sample / coming-soon states) and the admin console look (tabs Shows / Products); L3 shop + admin copy;
    L4 boss reviews of the Desktop's builds; later visual polish of Music / About.
  - **Desktop:** D1 privacy swap in src now (hero A -> (a), Push Past Fear -> (d)); D2 store backend (`/shop/`,
    products per visit, `SHOP_ENABLED`, sample products); D3 admin console v2 (tabs, Products editor, image upload
    re-encoded through sharp); D4 port L1 / L2 into src; later OG share images per page, performance, Lighthouse.
    **Done 2026-11-05:** D1 privacy swap; D2 store (`/shop/`, 5 SAMPLE products, per visit from DATA_DIR/products.json,
    `SHOP_ENABLED=1` adds Shop to nav / footer and swaps Watch for Shop in the phone bar, noindex until then);
    D3 admin v2 (`/edit/` tabs Shows | Products, add / edit / delete / reorder, photo upload -> sharp webp, metadata
    stripped, 5 MB / 40 MP caps, `/media/uploads/` served from DATA_DIR). `npm test` 86/86. Preview: `node
    tools/preview.mjs --publish` -> https://mishtuk.github.io/GLucak-Website-/ (static snapshot, edit + sign-up off).
    Share images per page (`node tools/og.mjs [--era path]` -> public/media/og/*.png, 1200x630, og/twitter/canonical in
    Base), perf pass (`tools/perf.mjs`, docs/review/perf.md: 80-141 KB per page without Spotify, CLS 0). `npm test` 91/91.
    Hero D34 built: `HERO = 'ab'` (A + (a) under 900px, B + (b) riso from 900px up; the hidden one gets a 1x1 data GIF,
    so one photo downloads). D37 shop / admin copy wired (8ffa28a). L1 photo round ported (D39: phone hero face
    above GLUCAK, poster art, MIC contact frame; Home 5.46 screens). `npm test` 95/95. Next: port L2 (shop + admin design).
    Claims released except `server.js`, `src/lib/`.
- **Owner, 2026-11-02:** approved direction.md + ROADMAP.md. Sends Gabe section 8. Decides hosting; registers
  glucak.com (auto-renew). Accounts in Gabe's name, owner co-manages. Work only on what doesn't need Gabe's answers.
- **Desktop (2026-11-05):** done: researcher -> `docs/research/social-content.md` (his own words by theme with sources,
  releases, 18 videos, announced shows, 10 open questions) + `src/data/videos.json` / `releases.json`; coder -> phase 2
  port of the Home prototype into Astro (Base, Header, MobileBar, Footer + Motion switch, Hero A default / B by
  `HERO` in `src/pages/index.astro`, real Spotify embed, era tokens + duotone, YouTube facade, 5 pages), Desktop fixes
  (data loads via import.meta.glob, latest release = newest RELEASED, undated videos last, placeholder cover,
  IDENTITY Aug 13 2027 countdown + pre-save from his own post). `npm test` 25/25. Shots: `docs/review/build-shots/`.
  `POST /api/signup` done (`src/lib/signup.js`: Kit v4, env `KIT_API_KEY` + `KIT_FORM_ID`, same-origin, honeypot,
  5 tries / 10 min per IP, 2 KB cap; 503 until Kit is set up; `TRUST_PROXY=1` behind a host proxy). `npm test` 31/31.
  **Gabe's edit screen v1 (shows) done:** `/edit/` (sign-in, then add / change / delete shows; saved shows are on the
  public site on the next page load, no rebuild). `src/lib/auth.js` (Riverside's sign-in trimmed: scrypt, HMAC cookie
  Path=/edit HttpOnly SameSite=Strict, strict Origin, login rate limit + lockout), `src/lib/store.js` (validate every
  row, 200 cap, atomic write, keeps `shows.prev.json`). Env: `EDITOR_USERS=gabe:<hash>,...` (make a hash with
  `echo 'pw' | node tools/hash-password.mjs`, 12+ chars), `SESSION_SECRET` (32+ chars; without it /edit answers 503),
  `DATA_DIR` (default `.data/`), `DEV_EDITOR=1` (local only), `TRUST_PROXY=1`. `npm test` 49/49.
  v2: row preview, releases / bio / links, restore previous, sign-out-everywhere, persistent rate limits, real-phone check.
  Laptop's security review fixed (10 items): bad Host -> 400, rightmost X-Forwarded-For, async scrypt, global sign-in cap
  30/min, lockout per user+IP (user-only 50/h), 409 on stale saves, HSTS/Secure via isHttps(req). **On the host set
  TRUST_PROXY=1** (needed for HSTS and real client IPs). `npm test` builds first (pretest); 58/58.
  Next: daily rebuild for release-day flips + host plan (owner decides the host). Laptop's real-photo round (ddf5d60) ported: Logo D mark + favicon, EXIF-free webp photos (no JPG ships), credits,
  'Out now:' + per-visit 'Next show' Now line (`<!--gl:now-->`, 14 days), Spotify outline button, quotes off until Gabe OKs
  (`QUOTES_APPROVED`). Player 152px visible at 390x660, Home 5.25 screens. Copy from docs/copy/*.md wired into all 4
  pages; release titles exact as on Spotify (+ `artists` credit line); real covers for the 8 released titles
  (`node tools/fetch-covers.mjs`, Spotify oEmbed, webp, no metadata); upcoming covers wait for Gabe. Fixed (Laptop review): public/media was git-ignored (now '/media/' only;
  fresh clone passes), 'Next open mic:' label, Spotify loading note, Music IDENTITY mark aligned. `npm test` 64/64. Claims released except
  `server.js`, `src/lib/`. Waiting on the owner: hero A / B / both, host, Gabe's answers.
- **Desktop, photo art direction (owner 2026-11-05):** designer agent: research ->
  `docs/research/photo-art-direction.md`, real treatment options from Gabe's photos -> `tools/photo/` +
  `docs/review/photo-treatments/` DONE (018f486, sheet.png). Picks: hero A (a) era grade, hero B (b) riso / (f) MCCC,
  Live It Loud (c) poster, Push Past Fear (d) crowd, About (e) contact strip (swap its HANDS frame). **Privacy:** the
  child in the crowd is in frame on the current hero A + likely Push Past Fear; (a) and (d) leave him out: swap soon.
- **Desktop (2026-11-06): backup + restore DONE.** /edit/ 'Download a backup' (GET /edit/api/backup, signed in, 10/h,
  one JSON with shows + products + uploads); restore is owner-only CLI: `node tools/backup.mjs export [out]`,
  `restore <file>` (dry run) / `--yes` (validates everything first, saves `DATA_DIR/pre-restore-<time>.json`, atomic
  writes). Words at src/pages/edit/index.astro:64-65 await the Laptop. `npm test` 136/136.
- **Desktop (2026-11-06):** round-2 design ported (Music crate, link grids, Add to calendar + `.ics`, 404) and D61 show
  address (edit-only; JSON-LD + .ics). `npm test` 131/131. Claims released except `server.js`, `src/lib/`.
- **Desktop research round 3 DONE:** `launch-readiness.md` (host rec: Render Starter + disk, runner-up Azure B1;
  GitHub Actions daily rebuild; Fourthwall CD/vinyl to confirm by email), `discoverability-a11y.md`. Built the Desktop
  findings: Spotify skip link, one h1 per page, distinct link names, signup aria, robots.txt + sitemap.xml, MusicGroup +
  MusicEvent JSON-LD (per visit). 114 tests. Laptop: 1.4.4 200% text overlaps on / and /shows/; address field question.
- **Desktop (2026-11-06): verdict rows 2-4 done** (D45 Now line live: 'Out Nov 13: Who I Am'; F1 / F2 / D49; D47
  headings visible without JS + print, instant :active). `npm test` 105/105. Next: row 7 (port the Laptop's rows 5-6).
- **Desktop (2026-11-06): L2 ported** (shop :target details, line-art samples, glyph + word statuses; admin collapsed
  rows, radio statuses, overlay upload, Save guard; D42 bar rule). `npm test` 99/99. Claims released except `server.js`, `src/lib/`.
- **Desktop research round 2 (owner 2026-11-06):** web design + music art, how to do both better. Claimed:
  `docs/research/design-round-2.md` + `docs/research/art-system.md` DONE (shots/round2/, mockup scripts in `tools/art/`).
  Proposals only; design items wait for the Laptop's boss. Claims released.
- **Laptop (2026-11-05):** boss agent runs each round (plans, briefs the designer / copywriter, reviews). Done, all
  boss-approved: real Spotify embed (D19), Home copy `docs/copy/home.md` (D21, D23), prototype on Gabe's real photos +
  Logo D + type lock (D25, D27, ddf5d60), security review of the edit screen (fixed in 620df1c), copy for Music, Shows, About (D29, D31), D33, IDENTITY guess era + dark Spotify embed (D35). L1 treatments (D39, 2413722), L2 shop + admin design (D41, d255f2e), L3 shop + admin copy (D37, e6d99ad). Nothing claimed.
  **Owner:** pick the hero from `prototype/shots/hero-pick.png` and `hero-pick-identity-guess.png` (boss now recommends C: A on phones, B from 900px; B if one layout only); send Gabe the 9 questions (7 for launch)
  at the bottom of `docs/copy/home.md`. Laptop next: boss review of the Desktop's port at 390 + 1280; then the hero pick and Gabe's answers go in.
  Local clone on the Laptop: `C:\Users\alexm\projects\GLucak-Website` (no `V:\`; Riverside is at
  `C:\Users\alexm\projects\Riverside-Website`).

## Phase 1 (owner approved direction.md + ROADMAP.md, 2026-11-02). Work only on what doesn't need Gabe's answers.
(Research phase, done:)
Research split (Laptop may counter on #1):
1. Desktop: `docs/research/references.md`: first pass on Wix Music templates, Manafest, TFK's Spotify embed,
   Puck Live, Riverside layout, Spotify embed facts.
2. Desktop: `docs/research/wix-templates.md`: deep pass on Wix Music / musician / band / DJ templates in Chrome
   with screenshots (`docs/research/shots/`): home order, nav, player, shows, merch, what to borrow. Done when each
   strong template has a verdict.
2b. Desktop (designer agent, running): `docs/research/genre-and-standouts.md`: genre visual language, award-level
   artist sites, common failures, differentiators for Gabe, eye-appeal principles, a recommended concept
   (owner, 2026-11-02: "don't just recreate what you see online").
3. Laptop: `docs/research/artist-sites.md`: other template galleries (Squarespace, Bandzoogle, Framer, Webflow music
   templates) and a critique of the Desktop's genre study: which differentiators you'd keep, change or drop, plus
   your own. Same breakdown per site.
4. Laptop: `docs/research/shop-and-tools.md`: merch / physical-media checkout options for an indie artist, email
   list providers, show listing (Bandsintown etc.), with costs, so the owner can choose.
5. Both: read and comment on each other's files on #1, then the boss writes `docs/research/direction.md` (agreed
   direction + open questions). Done when both machines agree on #1 and the owner approves.
Later (not before the owner says go): DESIGN.md -> Astro scaffold from Riverside -> Home.
- Owner: send Gabe the "still needed" list (CONTEXT.md) for the playlist link, art and shows.

## Waiting on (owner / Gabe)
- **Build RESUMED (owner, 2026-11-05):** "continue with working on it with the laptop". Proposal is in the owner's private
  repo (pricing never goes in this public repo).
- **Gabe's small set ARRIVED 2026-11-05, now in the repo:** `assets/from-gabe/` (+ `CREDITS.md`): Spotify playlist
  `0D45boIc9xWAdDjz1uTDRo`; Logo D = IDENTITY's (chrome cross + lightning wings, no lettering); photos: Alexander
  Kealey 6000x4000 (hero-grade), two small video stills (Sylvain Paslier, MCCC MSP). Asked Gabe for originals.
- Owner: real-phone test of `prototype/` (offer: Desktop serves it on the home Wi-Fi). Check: 1) fitted lines fill
  the width, no overflow; 2) duotone photo renders; 3) bottom bar sits above the iPhone home indicator; 4) GLUCAK
  doesn't reflow as the font loads; 5) Add to calendar opens the calendar on iPhone and Android. Note Android vs
  iPhone (Safari is the big unknown).
- **Questions for Gabe (merged 2026-11-06).** 26 questions; **13 block the Jan 11 launch** (marked **[LAUNCH]**). Already
  answered and dropped: playlist, logos, photos (`assets/from-gabe/`); IDENTITY date (Aug 13, 2027, his own post). Merged
  from CONTEXT.md, home.md, social-content.md, round2.md, round2-boss.md, shop / admin copy and D49. Paste a group at a time.
  *Launch blockers (send first)*
  1. ~~What email should fans and venues use to book you?~~ Settled by the owner: a glucak.com address forwarding to his
     Gmail (CONTEXT.md). Booking chips stay placeholders until the domain exists.
  2. **[LAUNCH]** What is your current show list? For each: date, venue, city, ticket or details link, and is it a show or an open mic?
  3. **[LAUNCH]** Is Riverside (Horsham) on Jan 16 confirmed, and is it ticketed or free?
  4. **[LAUNCH]** Which of your logos did you make, and which did Dave Bahm make? (The credits need it.)
  5. **[LAUNCH]** Do you already have an email list or newsletter we should move over?
  6. **[LAUNCH]** Do you want glucak.com (and the long slogan domain too)? The owner will register it in your name.
  *Music and releases*
  7. **[LAUNCH]** What are the release date and pre-save link for Welcome Home (December)?
  8. **[LAUNCH]** Is Scenic Route still out Jan 15, 2027?
  9. **[LAUNCH]** Your bio says "two albums" but Spotify shows more. Which should the site call albums, and should "Anomaly" and the "You're Not Alone" EP be listed? Is "GLucak" (Deluxe) the Dec 19, 2025 release?
  10. **[LAUNCH]** Is "feat. Emily Mae" on Go correct, and are the other features credited right?
  11. Can we show the IDENTITY tracklist you posted Oct 24? If yes, please check the spelling of every title.
  12. Can we quote the Who I Am and Scenic Route lyric lines on the site?
  *Shows*
  13. Do your shows have a start time? (Until then calendar events are all-day.) Can you also give a street address for each venue? (Optional; D61.)
  14. Is "GLucak at an open mic." fine as the calendar line for open mics?
  *Words and bio*
  15. **[LAUNCH]** Keep "Epilepsy survivor" on the home page, only on About, and do you also want "Healed by Christ since 2009"?
  16. **[LAUNCH]** Do the Duck Dodge, Scenic Route live and Riverside videos have flashing lights or strobes? (We only show safe ones.)
  17. **[LAUNCH]** The sign-up says "Get the next show and every new song first." Will your list really hear first? If not, we say "right away".
  18. Can we quote two of your posts word for word, with credit and a link: "God will always be with you, and will never leave you in the valley. Trust me, I know." and "Hope to see you there!"?
  19. Is the 404 line "That page isn't here. The music is." OK in your voice? (Owner may decide instead.)
  20. Do you have other live videos, and is Fran Carroll in any of them?
  21. What is Patreon for, and do you want a short line next to the link?
  22. Your new bio in January: when can we have it? (A swap after launch; does not hold it.)
  *Shop (hidden until you say so; none of it blocks launch; held by D49 until real products exist)*
  23. What will you sell and when should the shop open? (Shirts, hoodies, stickers, CD, vinyl: only real items, with your prices; sizes and ship times when they exist.)
  24. Will there be an IDENTITY CD or vinyl? Who makes it, and do you pack and post it yourself?
  25. Do you already sell on Bandcamp or another store? If not, can we set up Fourthwall's free plan in your name?
  26. Once real merch is in, do you want a short line in your own words on the shop page?

- Added 2026-11-06 (image library, assets/from-gabe/social/INDEX.md): (a) who filmed the Crooked Eye live clip and the
  car / garage shoot (credit + OK to use stills)? (b) who made the IDENTITY cover and the tracklist photo? (c) OK to use
  title cards crediting J-BOY, Emily Mae and Micah Haun? (d) can he send the live-set originals (stills are soft)?
## Status
- 2026-11-02 Desktop: **foundation (D16)**: Astro ^7 scaffold, placeholder pages / music / shows / about / privacy,
  `server.js` (static + CSP / security headers + per-visit shows injection at `<!--gl:shows-->`; Astro strips plain
  comments, so pages emit it via a literal `<Fragment set:html>`), `src/lib/shows.js` (validate, NY-day split,
  escaped render, Tickets / Details / no button), `src/eras/placeholder.json` + contrast test. Optional `with` line on shows (Laptop ask). Shows markup ported to DESIGN.md (poster for the first full show, rows, empty state with Follow, "Played", All shows link on Home; Request a show waits for the booking email). Home prototype boss-approved (D18). `npm test` 16/16.
  Kit sign-up plan: server-side via API v4 (free plan has API access); double opt-in behaviour to test in phase 4.
  Run: `npm run build && node server.js` (PORT, default 8080).
- 2026-11-02 Desktop: repo set up. CONTEXT.md, HANDOFF.md, DECISIONS.md, agents, board (#1, pinned) and
  `tools/board.mjs` (say / check / read, Node only) created. No site code yet.
- 17:00 Owner round: Videos keeps Shop on the preview (preview.mjs serves every built page), Home Shows photo matches the list (no gap), King's Corner = Jenkintown, 'Colors' (US), Colors button always on the preview. HOME FILM: Gabe's music videos behind the hero (public/media/film, tools/film/build.mjs + analyze.mjs flash check; yt-dlp at V:\tools\yt-dlp, owner OK 2026-11-18; Rapping Like left out, 4 flashes/s). Plays only while Motion is on, preload none, still hero otherwise; two inks from CSS per palette; Pause video button; server.js serves mp4 with byte ranges (Safari). V:\.gl_theirs.css (old Home prototype, unused) could not be deleted by me (drive-root guard): owner to delete.
- 17:25 Owner round 2: Gig Poster prints are positives now (light palettes swap the two inks in Base.astro). Reels (src/components/Reel.astro + app.js data-reel): Videos page = tabs Music videos / Live, each a flip-through reel (big screen, next peeking, count, Prev/Next, numbered strip); About gallery = 8-page photo album (2-page spread from 700px) incl. 5 music video stills in /media/stills (credits mapped). VideoCard.astro deleted, mosaic/collage CSS deleted. Flips instant unless Motion on; a flip or tab switch stops a playing video.
- 17:40 Owner round 3 (no arrow bar, 'more seamless'): Reel.astro + tabs replaced by HScroll.astro (pinned horizontal galleries, the Awwwards pattern). Motion on: app.js layoutHs/moveHs pins the strip under the header and slides it sideways with the page scroll (no CSS animation; focus scrolls to the item). Motion off/reduced/no JS: swipe row. Videos = 'Now showing' (newest music video, poster-type title over the screen) + 'The reel' film strip with sprocket holes. About = 'Photo album' scrapbook of paper prints at mixed heights/angles. Rapping Like still re-taken (sharp).
- 18:05 Owner round 4 (Dribbble research, 'album covers for the videos'): Videos page = Now showing stage + 'The records' grid. Each video is a designed sleeve (public/media/sleeves, real still per video via tools/film/build.mjs sleeves; Riverside cropped to the stage) in 4 CSS layouts (a stacked/b accent band/c paper print/d giant number), two inks per palette, vinyl peeking out (hover nudges it, instant). Pressing a record loads it on the stage and plays (app.js play(), data-now). HScroll now photo-only (About album). Usage hit 86%: STOPPED new agent work. NEXT: owner wants research via subagents (Haiku/Sonnet, low effort) - see memory agent-models.
- 18:10 NEXT (owner): Videos records need (1) a visual way to cycle through them and (2) opening a record plays it IN PLACE with a visual effect (no page change), e.g. sleeve expands into the player / vinyl slides out / cover flips. Research subagent (Sonnet, low effort) launched for references; its verdict goes here when back. Constraints: Motion on only, never reduced-motion, instant fallback, no flashing, no libraries (CSP self), View Transitions/FLIP/3D transforms OK. Owner rules: headings without 'The'; research via subagents. Session usage 88%: build after the window resets.
- 18:12 Research back (Sonnet, from search snippets, pages not opened). PICK: cycling = scroll-snap COVER FLOW (center record big and straight, sides tilt in 3D by distance from center; animation-timeline:view(inline) with an IntersectionObserver .is-active fallback; flat snap row when Motion off). OPEN = sleeve expands into the Now showing player (same-document document.startViewTransition with a shared view-transition-name, ~500ms ease-out; manual FLIP if unsupported) while the vinyl slides out; instant swap when Motion off / reduced. Only the centered record's vinyl slides further out. AVOID: spinning vinyl (moire), crossfades/white wipes, autoplay carousels, cross-page view transitions. Refs: scroll-driven-animations.style/demos/cover-flow, addyosmani.com/blog/coverflow, Codrops 3D infinite carousel, Framer Audio Sleeve, Chrome same-document view transitions docs.
- 19:55 BUILT cover flow + open (Sonnet agent build, Haiku check, main fixes). Records = scroll-snap row opening on the middle record; Motion on + no-preference + @supports view(): rec-flow tilt (full turn one slot off centre), neighbours tuck in (-18%), front vinyl slides 30%. Tap a side record = centre it (no play); press the front one = sleeve view-transitions into the Now showing screen (0.5s, no root fade, html.vt-rec), then the iframe loads. Motion off/reduced: flat row, instant swap. Motion CSS sits after D64 (block 30 stays motion-free); minifier broke the animation shorthand, so longhands. Checks: h-scroll 0 at 320/390/1280/1600 both states; side click centres without playing; centre click plays. npm test 331/333: the 2 fails are date tests (releases "Out today", site "10 days to go") tripping on UTC past midnight, not this change. Shots: scratchpad rec-on/off-390/1280, rec-open-mid. NEXT: owner look; maybe fix the 2 date tests to use local date.
- 20:20 Owner picked option 1 (opens over the page). BUILT (Sonnet agent, main checked shots): Motion on, the Records section pins (reuses layoutHs/moveHs; the row's scrollLeft follows page scroll 1:1, so the view-timeline tilt still runs) and the records travel across the screen first to last. A record press opens dialog#rec-open over the page: sleeve view-transitions into .ro-screen (0.5s, default 0.2s root fade), .ro-disc vinyl slides out from 900px (@starting-style, gated), then the youtube-nocookie iframe loads. Close / Esc / backdrop close it (reverse transition, iframe removed, focus back). Motion off: swipe row + instant dialog. Now showing plays in place; data-now/swap removed. Checks: h-scroll 0 at 320-1600 both states, dialog open and closed; scrollLeft 0 to max across the pin. npm test 331/333 (same 2 date tests).
- 20:45 Date tests fixed (helpers use New York's day; they failed 7pm-midnight ET and blocked the preview). Records now on Home too (owner): src/components/Records.astro shared by Home and Videos; Home band after Shows replaces the Watch row (VideoBlock stays for /shows/); heading links to /videos/, All videos link; sleeves frame exception on Home+Videos in rules test. npm test 333/333.
- 21:05 Owner: records cut off at the page column, wanted them across the whole screen, more spaced, bigger transition. Row now full-bleed (.band-crate container-type inline-size; .records margin calc(50% - 50cqi), padding 50cqi - rec-w/2), gap clamp(2.5rem, 8cqi, 8rem), tuck-in overlap removed, turn 62deg at 0.68 scale, vinyl slides 40%. h-scroll 0 at 320-1600 both states; npm test 333/333.
- 21:40 About: tab/strip gone (photo under the header), bio quote in poster type (owner chose poster type over a new font). Header nav: Music removed (Listen goes there; aria-current + ledge on /music/). Music releases = records (crateHtml in releases.js emits band-crate data-hs=row with Releases h2, .rec-art real covers unfiltered, rel-open dialog: cover + Spotify embed from a validated 22-char id after the press + Listen everywhere / Pre-save in a new tab). Credit (owner): footer 'Site by Mishtuk Web Design.', meta author, /humans.txt. npm test 334/334.
- 21:55 Owner: background should stay still while scrolling the records. Pinned .band-crate drops its own grain; the stuck .wrap paints bg-2 + grain on a full-bleed ::before (inset 0 calc(50% - 50cqi)). Checked with .work/still-bg.mjs (same patch at two scroll offsets: differed before, identical after) on / and /videos/. npm test 334/334.
- 22:15 Privacy page rewritten as 'Privacy and terms' (Opus agent audit + write; footer link renamed; contents in two columns from 700px). Audit: only email (server -> Kit, Kit not set up yet = 503), IPs in memory minutes for rate limits, error + editor sign-in logs, localStorage motion/palette, gl_edit cookie only on /edit, Spotify/YouTube only on press, no analytics, shop preview only, no contact email (contact = Instagram or reply to a list email). OPEN for owner: host + log retention, shop provider (Fourthwall/Bandcamp), business entity name, privacy contact email, Kit open/click tracking. Not legal advice: lawyer review before launch. npm test 335/335.
- 22:30 Owner: page tab (e.g. 'Videos' under the header) and its strip gone on every inner page; Home keeps its band tabs. CSS only: .sub padding-top header-h, .sub .tab display none, first band no top rule + space-l top (About band-push stays flush). npm test 335/335.
- 23:00 Owner: (1) images broken when opening some records. ROOT CAUSE preview-only: tools/preview.mjs did not rewrite data-cover (release dialog) or the 2nd srcset entry in app.js (1280 stills) to /GLucak-Website-/; fixed both. Also app.js waits for the dialog image to decode (600ms cap) and falls back to the sleeve on error. (2) Privacy and terms rewritten formal: Privacy Policy 13 numbered sections + Terms of Use 15 (Opus); venue for governing law left open (owner/Gabe: Montgomery County?). (3) Shows Watch = 3 static records (Records.astro compact prop, no pin/tilt) opening the same dialog; VideoBlock.astro deleted. npm test 335/335.
