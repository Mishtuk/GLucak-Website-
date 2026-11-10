# Round IG: the reel lessons, built (Laptop boss plan, 2026-11-10)

Inputs: `docs/research/ig-design-tips.md` section 4, `docs/research/ai-design-workflow.md`, CONTEXT.md (2026-11-10 + Hard rules),
D39 / D47 / D64 / D67. Repo at b9f542a, `npm test` 164/164. Decisions taken for this round: **D69, D71, D73** (DECISIONS.md).

## 1. Goal
**Task:** take the AI-default tells off the live build (filled tag labels, sign-up with no in-flight state, pure-grey neutrals,
redundant words and rules) without adding motion or height, then have an independent evaluator score the result.
**Done when:** slices 1-5 below meet their "done when", the advisor's scored review (slice 6) is saved, `npm test` passes, and
nothing was published, paid for or sent to Gabe.

**Every slice's "done when" also includes (the standard checks, "STD"):**
- `npm test` passes (164 + any new tests). No edit to `server.js` or `src/lib/` (Desktop claims).
- `node prototype/tools/a11y200.mjs --url http://127.0.0.1:<port>` on the build: no new issue versus the slice-0 baseline at
  320 / 390 / 1280, 100% and 200%.
- Reduced motion: nothing new animates with `--force-prefers-reduced-motion` or Motion: off; no new animation at all this round
  (no pulse, glow, shine, scale or loop). Nothing can flash.
- Home height, quotes off, 390x660 (scrollHeight / 660): **at most 5.54 screens** (baseline 5.43; 5.54 = D39's 5.8 cap minus the
  RISE quote's 0.26 measured in D67). Slice 5 also measures the D67 setup (one quote on): at most 5.8.
- Viewport-size shots (not full page) at 390x660 and 1280x800 of each changed view, before and after, in `docs/review/ig-round/`.
- Gabe's words untouched (slogan incl. its period, quotes, bio); no new facts; text through Astro `{}` / `textContent` only.

## 2. Slices (ranked)

| # | Slice (research item) | Changes | Files | Who | Done when (plus STD) |
|---|---|---|---|---|---|
| 0 | Baseline | Measures before anything changes | `docs/review/ig-round/baseline.txt` + shots | helper | a11y200 `--url` report, Home height (quotes off), 8 viewport shots (Home, Music, Shows, About at 390 + 1280) saved |
| A | Design pass (feeds 1, 3, 4) | DESIGN.md section 19: tag replacements, tint options, rule audit, sign-up states | `DESIGN.md`, `docs/review/ig-round/design/` | designer | 19a-19d written with exact CSS deltas; tint sheet with 3 options + contrast numbers; boss approves before slice 1 starts |
| 1 | No filled tag labels (4b #2, #3) | `.now-tag`, `.quote-tag`, `.tile-tag`, `.v2-tag` become weight / plain words or go, per 19a; dead `.release-meta` rule deleted | `src/styles/global.css`, `Hero.astro`, `Quote.astro`, `VideoBlock.astro`, `src/pages/music/index.astro`, tests that assert the old markup | coder | `grep` finds none of the 4 classes in `src/`; every label still reads alone (Now line, Album/EP, Latest, the quote credit); Home height not higher |
| 2 | Sign-up states (4b #6) | Sending state ("Sending…", `aria-disabled` on Join, second submit ignored while in flight); existing three messages kept | `public/js/app.js` (sign-up block only), `src/components/Signup.astro` | coder | With 2 s added latency: one POST per double tap, "Sending…" in the status line, then the server's message; no-JS form still posts; `<script>` / `' OR 1=1 --` still inert (signup tests pass); no global.css edit |
| 3 | Tinted neutrals (4b #1) | One `--tint` token mixes the accent into `--bg-2` and `--line` (OKLCH); ships at **0%** (D71) so the look is unchanged until the owner picks from the sheet | `src/styles/global.css` (:root only), new `test/tokens.test.js` | coder | At 0% computed `--bg-2` / `--line` within 1/255 of today's; at the 19b options text and muted on `--bg-2` measured >= 4.5:1; test fails on any colour literal outside `:root` (mask `#000` allowed) |
| 4 | Words: redundant-text pass (Tiwari tells; unslop "drop redundant labels / verbose copy") | Table of at most 8 cuts or rewordings of OUR strings | `docs/copy/ig-round.md`; then text-only swaps in `src/pages/*.astro`, `src/components/*.astro` | copywriter drafts, helper applies | Each row: page, current text, proposed, why; no Gabe quote, slogan or fact changed; boss-approved rows applied verbatim; Home height not higher |
| 5 | Rules and borders audit (4b #9) | Remove at most 3 rules that repeat a grouping already made by space, per 19c; final D67-setup height check | `src/styles/global.css` | coder | 19c's list built exactly; the 4px band spine and button borders stay unless 19c says why; D67 setup <= 5.8 |
| 6 | Independent evaluator (ai-design-workflow #9, #10) | Scored screenshot review of the whole round | report text -> `docs/review/ig-round/eval.md` (main session saves it) | advisor | 4 criteria scored 1-5 with reasons, hard-rule check, at most 3 fixes ranked for the next round |

**Cut, and why:** press `scale(0.97)` (D47: pressed = instant colour swap, no movement; stands); origin-aware Menu animation (a
third motion for an instant control, and a closing `<details>` cannot animate out on iPhone Safari without JS: no payoff);
skeletons (already there: player box keeps 352px, video thumbs are 16:9 on `--bg-2`, CLS 0 in `docs/review/perf.md`); IDENTITY
2+1 era (waits on Gabe's colours, D35); concentric radii (moot: one nested radius, already equal); stagger, pulse, glow, shine,
ripple (Hard rule 1, section 4c). The hero `.glow` stays (DESIGN 8); the evaluator gives a view on it, no change this round.

## 3. Briefs (hand each to one agent as written)

**Slice 0, glucak-helper (Haiku).** Task: record the baseline before any `src/` change. `npm run build`, then `node server.js`
with `DATA_DIR` set to a new temp folder and `PORT=8827`. Run `node prototype/tools/a11y200.mjs --url http://127.0.0.1:8827`
with `OUT` set to `docs/review/ig-round/baseline-a11y`. Measure Home quotes-off height at 390x660 (`document.documentElement.scrollHeight / 660`;
use the a11y200 harness with the height set to 660, in your scratchpad, not committed). Take viewport shots of `/`, `/music/`,
`/shows/`, `/about/` at 390x660 and 1280x800 with reduced motion into `docs/review/ig-round/before/`. Write all numbers to
`docs/review/ig-round/baseline.txt`. Stop the server (your PID only). May touch: `docs/review/ig-round/` only. Out of scope: any
fix, any opinion. Done when: the file and 8 shots exist and the height matches 5.43 within 0.02 (else report the difference).

**Slice A, glucak-designer (Opus).** Task: write DESIGN.md section 19 "Round IG" against the BUILD (not the prototype, D69),
from `ig-design-tips.md` 4b items 1, 2, 3, 9 and 6. Read DESIGN 3, 7, 8, 16e, 18 and D47 / D57 / D67 first. Write:
19a, each filled label (`.now-tag` Hero.astro:35, `.quote-tag`, `.tile-tag`, `.v2-tag`): drop it or make it a plain word in
weight / colour, with the exact markup and CSS, and check the line still reads alone ("Out Nov 13: Who I Am" was written in D57 to
stand without a tag). No middle-dot meta strings, no new pill, no all-caps small text. 19b, tint: the formula for `--bg-2` /
`--line` with a `--tint` percent of `--accent` in OKLCH, plus a sheet of 3 options (0% = today, subtle, stronger) as 390x660 shots of
the Home first screen and the footer, each with measured text and muted contrast on `--bg-2`; recommend one. 19c, list every
border and rule in global.css with keep / remove; remove only ones that repeat a grouping already made by space, at most 3, with
why; the 4px band spine is the poster look (keep unless you argue it). 19d, sign-up: add the Sending state row to section 7
("Sending…", Join `aria-disabled`, no look change beyond what exists). Before writing, list what in your plan is a generic AI default
and revise it (ai-design-workflow 5). May touch: `DESIGN.md` (new section 19 + the one section 7 row), `docs/review/ig-round/design/`.
Out of scope: editing `src/`, the prototype, motion of any kind, new colours or fonts, the glow. Done when: 19a-19d have exact CSS
deltas a coder can paste and the tint sheet is saved.

**Slice 1, glucak-coder (Sonnet).** Task: build DESIGN 19a exactly. May touch: `src/styles/global.css`, `src/components/Hero.astro`,
`Quote.astro`, `VideoBlock.astro`, `src/pages/music/index.astro`, and tests that assert the old markup (e.g. `test/round2.test.js:79`).
Also delete the unused `.release-meta` rule (global.css 550; no element uses it). Keep the `<!--gl:now-->` markers exactly as they
are (server.js fills them). Out of scope: any other style, words not in 19a, `server.js`, `src/lib/`. Done when: STD plus the
slice 1 row; before / after shots of the Now line, Music grid and video row at 390 and 1280 in `docs/review/ig-round/after/`.

**Slice 2, glucak-coder (Sonnet).** Task: give the sign-up an in-flight state. In `public/js/app.js` sign-up block: on a valid
submit set the status to "Sending…" (boss-approved string), set `aria-disabled="true"` on Join and ignore further submits until the
response; then the three existing messages unchanged; clear `aria-disabled` after. `textContent` only. May touch: `public/js/app.js`
(sign-up block only), `src/components/Signup.astro`. Out of scope: global.css, server code, new messages, any animation, the Kit
setup. Done when: STD plus the slice 2 row, checked in Chrome with `Network.emulateNetworkConditions` latency 2000 ms against
the local server (503 until Kit is set up is fine: "That didn't go through. Try again.").

**Slice 3, glucak-coder (Sonnet).** Task: build DESIGN 19b's tint mechanism with `--tint: 0%` (D71). May touch: `src/styles/global.css`
`:root` block, new `test/tokens.test.js`. Out of scope: era files, `--muted`, `--text`, `--bg`, any other rule. Done when: STD plus the
slice 3 row; record the computed `--bg-2` / `--line` at 0% and at each 19b option in `docs/review/ig-round/tint.txt`.

**Slice 4, glucak-copywriter.** Task: read every visible string WE wrote on Home, Music, Shows, About and the footer in the build and
find redundant labels, throat-clearing, filler, uniform cadence (Tiwari tells, `ai-design-workflow.md` 2 and 5). Write
`docs/copy/ig-round.md`: at most 8 rows (page, file:line, current, proposed, why), shortest first. Never touch Gabe's own words
(slogan with its period, quotes, bio), release titles, D57 Now-line patterns or anything a test pins without saying so. May touch:
`docs/copy/ig-round.md` only. Done when: the table exists. Then **glucak-helper (Haiku)** applies the boss-approved rows verbatim
(text only, the files named in each row) after slice 1 is done, and runs `npm test`.

**Slice 5, glucak-coder (Sonnet).** Task: build DESIGN 19c (at most 3 removals), then the final cap check: a second build with
`QUOTES_APPROVED = true` into a temp `--outDir`, served with `DIST_DIR`, Home at 390x660; restore `content.js` at once and confirm
`git status` shows no change to it. May touch: `src/styles/global.css`. Done when: STD plus the slice 5 row; numbers in
`docs/review/ig-round/after/height.txt`.

**Slice 6, glucak-advisor (Sonnet, read-only).** Task: score the round as an outside evaluator; you did not build it. Serve the
build (temp `DATA_DIR`), take viewport shots (not full page) at 390x660 and 1280x800 of Home, Music, Shows, About, and compare with
`docs/review/ig-round/before/`. Score 1-5 with one paragraph each: design quality (x2), originality (x2), craft, function. Calibration:
2 = "dark gradient hero, centred headline, filled pill tags, three icon cards, grey on grey"; 4 = "GLUCAK in Big Shoulders over
Gabe's own graded photo, slogan fitted to the width, the Spotify player in the first screen and a real show under it". Check hard rule 1
(nothing loops but the glow; all off under reduced motion). Say whether the hero glow reads as the "dark gradient hero" cliché, as an
opinion only. Out of scope: editing anything, new research. Done when: your report has the scores, the hard-rule check and at most
3 ranked fixes for the next round; the main session saves it to `docs/review/ig-round/eval.md`.

## 4. Order and parallel lanes
1. **Claim first** (main session): `git pull --rebase`, then under HANDOFF "Now working on": "Laptop 2026-11-10 round IG (D69):
   claims `DESIGN.md`, `src/styles/global.css`, `src/components/{Hero,Quote,VideoBlock,Signup}.astro`, `src/pages/index.astro`, `src/pages/{music,shows,about}/`,
   `public/js/app.js`, `test/round2.test.js`, `test/tokens.test.js`, `docs/review/ig-round/`, `docs/copy/ig-round.md`. Not server.js or src/lib/."
2. **Slice 0** alone (it needs the untouched build).
3. **In parallel, no shared files:** slice A (DESIGN.md, design shots) | slice 2 (app.js, Signup.astro) | slice 4 draft (docs/copy).
4. **Boss gate:** approve 19a-19d and the copy rows (or send back with fixes). The tint stays 0% whatever 19b recommends (D71).
5. **One coder holds global.css, in turn:** slice 1 -> slice 3 -> slice 5. The helper's copy apply runs beside slice 3 (it touches
   only the astro files 1 has finished with; never global.css).
6. **Slice 6** last, after slice 5's height check. Its fixes become the next round; the round ends with a HANDOFF update.
Never two agents on one file at once. Each brief returns to the boss, checked against its own "done when" first; extra work is dropped.

## 5. Decisions (appended to DECISIONS.md)
- **D69:** the Laptop builds in `src/` this round; the designer specs against the build. **D71:** what is adopted and cut; tint at 0%
  until the owner picks. **D73:** an independent scored evaluator ends every round.
