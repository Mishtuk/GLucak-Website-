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
