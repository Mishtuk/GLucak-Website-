# Laptop plan from 2026-11-11 (after IG / IG2 / IG3 / R1)

Inputs: `CONTEXT.md`, `HANDOFF.md`, `ROADMAP.md`, `docs/research/ig-design-tips.md` (Charles Liu reels, section 4),
`docs/review/ig-round3/eval.md` (advisor 4.0, "polish at diminishing returns"), screenshots in `docs/review/ig-round3/after/`.

## Where the site stands
- Lighthouse 99-100 perf / 100 a11y, flash audit PASS, `npm test` 188/188, iOS 15-18 fallbacks in.
- IG-research items done: no filled pills, tabular numbers, balanced headlines, two colours + one accent, sign-up states,
  tint token (`--tint: 0%`), redundant rules removed, sleeve card for no-cover releases.
- Three rounds in a row scored 4.0. More small tweaks won't raise that score. Removing the last clichés will, and so will real content.

## What still reads as "AI default" (from the reels' lists, checked on the IG3 shots)
1. **Hero glow** (`.glow`, global.css ~203): a soft accent radial on a dark ground behind the hero is the "dark gradient
   hero" cliché. Swap it for a static texture from Gabe's own world (the halftone / grain already approved), and stop
   the drift animation. Home then has one motion (the heading fade).
2. **Outlined ghost button beside the filled one** (hero LISTEN + SHOWS, footer): "one title, one CTA per screen".
   Keep LISTEN filled; make SHOWS a plain link with the setlist arrow (21b), so there is one button per screen.
3. **Heavy white full-width band rules**: at 1280 the 4px white line is the loudest thing after the name. Draw it in
   `--line`, or keep white only under the ledge word.
4. **Section word at 17px** ("Music" on the ledge): too small to work as a label and too obvious to cut silently.
   Either size it as a real label (step-1, display face) or drop it and let RISE / the band heading carry the section.
5. **Footer "LISTEN. SHOWS. JOIN."**: periods in titles + two outlined objects side by side. Plain words, one outline.
6. **Menu sheet just appears** (`.nav-mobile:not([open]) > .sheet { display: none; }`): open it from the Menu button
   (origin at the trigger, 200ms ease-out in, 160ms out, start scale 0.95), only under the motion-on gate.
7. **Optional press feel:** `scale(0.97)` 150ms on buttons, motion-on gate only (D47 chose colour swap only; owner call).

Waiting on owner picks: D81 (compact 80px Spotify player so Play is on the first phone screen; recommended) and the
tint (0 / 5 / 10%; designer recommends 5%).

## Roadmap (Laptop)
Model per job, to save tokens: designer = Opus (taste calls only), coder / advisor / copywriter / researcher = Sonnet,
helper = Haiku (text swaps, republish, HANDOFF lines), mediator = Haiku. Main session plans and reviews; agents do the work.

| # | When | Round | Who | Done when |
|---|---|---|---|---|
| 1 | Nov 12 | **IG4 "last clichés"**: items 1-5 above. DESIGN.md section 23 spec, then build in global.css, Hero, RiseBand, Footer | designer (spec), coder (build), helper (footer words) | advisor scores it >= 4.3; hard rule 1 PASS; `npm test` green; Home <= 3601px at 390 |
| 2 | Nov 13 | **Who I Am release day**: rebuild + republish the preview so the Now line / latest single flip happens | helper | preview shows Who I Am as latest with the sleeve card |
| 3 | Nov 13-14 | **M1 motion**: item 6 (+ item 7 if the owner says yes); re-run the flash audit + reduced-motion check | coder, advisor | 0 animations under reduced motion; flash audit PASS |
| 4 | as soon as the owner answers | **Owner picks in**: D81 compact player, tint value | coder | screen one at 390 shows Play |
| 5 | Nov 15-22, owner OK needed (Desktop's files; Desktop silent since Nov 7) | **Launch blockers in src/lib + server.js**: S1 sign-up crash patch, per-field caps on venue / city / with, first show poster eager, cache headers; GitHub Actions daily rebuild so release-day flips happen alone | coder, boss review | security S1 closed; a scheduled build runs |
| 6 | when Gabe answers | **Content in**: IDENTITY era file (colours, art as the ground, accent only on Listen / Tickets), real show, covers, bio | designer, copywriter, coder | contrast tests pass; no placeholder chip |
| 7 | Dec 21 - Jan 8 | ROADMAP phase 4: Gabe review, edit-screen walkthrough, Kit, domain | owner + both machines | as ROADMAP.md |

Not doing: more micro-polish on screen one, pulses / glows / shimmer (hard rule 1), dithering or ASCII, paid
references (Mobbin, Interface Craft).

## Update 2026-11-11 (later): IG4 shipped (4.33). Next ideas
Inputs: `docs/research/next-ideas-2026-11-11.md` (Gabe's new content, booking / EPK, phase 6+ ideas) and
`docs/review/inner-audit-2026-11-11.md` (inner pages at 390 / 1280).

| # | When | Round | Who | Files | Done when |
|---|---|---|---|---|---|
| 1 | now | **IG5 "inner pages"**: (a) the print language reaches the inner pages as a shared tone-on-tone ground, 900px+ only, static: Truchet on 404, record-groove rings under Music's RISE, hero wall on Shows; (b) "For venues" block on Shows + About, today's facts only, request button waits for the booking email; (c) Music "New here? Start with Go"; (d) no periods in "Wrong turn.", blank 404 ledge out; (e) the Nov 10 YouTube Short into videos.json | designer (spec, grounds), copywriter (venue block + start line), coder, advisor | global.css, music / shows / about / 404 pages, src/data/videos.json, tools/photo/texture.mjs, test/ | advisor >= 4.3 on inner pages, hard rule 1 PASS, Home height unchanged |
| 2 | owner OK (Desktop's src/lib + server.js) | **S round**: S1 sign-up crash, S7 `//` redirect, failed sign-in log, Dependabot + `npm ci`; Shows: empty state as a blank paper poster with Join, poster = first full show (not an open mic), Directions from the saved address, "Shop." / empty-shop periods | coder, boss review | server.js, src/lib/{signup,shows,store,products}.js | security S1 / S7 closed; shows tests updated |
| 3 | when Gabe answers (flash check Q16) | **Videos page** (phase 6 early): live Crooked Eye clip first, YouTube RSS, click-to-play posters only | designer, coder | new src/pages/videos/ | no autoplay; flash audit PASS |
| 4 | Nov 13 / Jan 15 (needs owner OK to publish) | **Release-day pages**: Who I Am, then Scenic Route spotlight; flip to Out now by date | designer, copywriter, coder | src/pages/music/ | flips with no one touching it (needs the daily rebuild) |
| 5 | Gabe's words per song | Story-behind-the-song pages; "bring the show to your city" form (needs Desktop's server) | copywriter, coder | later | Gabe approves the words |

Row 3 done 2026-11-11 (D95): the Videos page is built (DESIGN 26) and the three IG6 eval fixes ride with it; `npm test` 227/227, Home 390 = 3735.

Not now: Bandsintown sync (a second source of truth next to Gabe's edit screen); textures on covers, logo, product photos or the About h1.
