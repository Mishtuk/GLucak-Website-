# Round IG2: the evaluator's fixes (Laptop boss plan, 2026-11-10)

Inputs: `docs/review/ig-round/eval.md` (4.0/5, D73), DESIGN.md 1 / 9 / 19, D6 / D39 / D67 / D69 / D71, `ai-design-workflow.md` 3.1, 3.3,
3.12. Repo at ba84c51, `npm test` 171/171. Owner away ("continue researching and then working on the website", CONTEXT 2026-11-10).
Decisions for this round: **D75, D77** (DECISIONS.md). D69 still holds: the Laptop builds in `src/`, never `server.js` or `src/lib/`.

## 1. Goal
**Task:** a fan on a phone can press Spotify's Play on the first 390x660 screen, the section labels stop reading as a template,
and About ends in an action at 1280, with no new motion and Home no taller; then the advisor scores it again.
**Done when:** slices A, 1, 2 meet their "done when", the advisor's scored review (slice 3) is saved to
`docs/review/ig-round2/eval.md`, `npm test` passes, nothing was published (incl. the Pages preview), paid for or sent to Gabe.

**Every slice's "done when" also includes (STD):**
- `npm test` passes (171 + any new). No edit to `server.js`, `src/lib/`, `src/pages/v2/` or `src/components/content.js`.
- a11y200 `--url` on the build: still 0 views with issues (48 views, as `docs/review/ig-round/after-a11y`) at 320 / 390 / 1280, 100% and 200%.
- Hard rule 1: with motion on, `document.getAnimations()` on Home is still exactly one (the glow); under reduced motion zero. No new
  transition, animation or transform of any kind this round. Nothing can flash.
- Home height, quotes off, 390x660: **at most 3631px** (D77; moving the player up removes space, it never needs more).
- Viewport shots (not full page) at 390x660 and 1280x800 of each changed view into `docs/review/ig-round2/after/`. "Before" is
  `docs/review/ig-round/after/` (Spotify blocked) plus slice A's unblocked Home 390 shot.
- Gabe's words untouched (slogan with its period, quotes, bio); no new facts; no new words unless the boss approved them at the gate.

## 2. Slices (ranked)

| # | Slice (eval fix) | Changes | Files | Who | Done when (plus STD) |
|---|---|---|---|---|---|
| A | Design pass | DESIGN.md section 20: 20a label, 4 directions; 20b first-screen Play; 20c About 1280; 20d meta lines | `DESIGN.md`, `docs/review/ig-round2/design/` | designer | 4-direction sheet saved; 20a-20d with exact CSS / markup deltas and measured numbers; boss picks 20a and approves before slice 1 |
| 1 | Play on screen one (fix 1) + label (fix 2, per D75) | 20a + 20b built | `src/styles/global.css`, `Hero.astro`, `RiseBand.astro`, `src/pages/index.astro`, `src/pages/{music,shows,about,shop}/index.astro`, `src/pages/404.astro` (markup only if 20a needs it) | coder | Unblocked 390x660 shot: Spotify's whole round Play button above the tab bar's top edge; iframe top <= 20b's number; label still the exact nav word, >= 16px, >= 4.5:1, inside the same heading (D6) |
| 2 | About ends in an action (fix 3) + no middle-dot meta lines | 20c + 20d built | `src/pages/about/index.astro`, `RiseBand.astro`, `src/pages/index.astro`, `src/pages/music/index.astro`, `src/styles/global.css` | coder | About 1280x800 first screen shows the 20c actions in the right column; `grep -rn "&middot;\|·" src/components src/pages --include=*.astro` finds nothing outside `src/pages/v2/`; both lines still read alone |
| 3 | Independent evaluator (D73) | Scored review of the round | report -> `docs/review/ig-round2/eval.md` (main session saves it) | advisor | 4 criteria scored with reasons, hard-rule check, Play position measured unblocked, at most 3 ranked fixes |

**Cut, and why (D77):** footer "LISTEN. SHOWS. JOIN." (the period cadence echoes Gabe's slogan, and "Shop." is inserted into that
line by `server.js`, the Desktop's claim); outlined ghost buttons (the outline is how one accent fill per view works, DESIGN 1 item
4; it touches every page: a round of its own if ever); the near-black lower hero at 1280 and the glow (eval: keep, lowest
priority); the placeholder chip (already `position: absolute`, so moving it frees no height; it goes when Gabe's colours arrive).
Research: adopted the 4-directions step for ONE component (the label) and the named-defaults "never" list in every designer brief;
the palette directions wait on Gabe's IDENTITY colours (D35). At most 3 visible changes this round (ai-design-workflow 3.12).

## 3. Briefs (hand each to one agent as written)
Scratch for everyone: `C:\Users\alexm\AppData\Local\Temp\claude\C--Users-alexm\9d845ea6-3a1c-426d-b0be-7355c69f5f27\scratchpad`
(SCRATCH below). Shots: copy `SCRATCH\baseline-shots.mjs` to your own file and change `BASE` (your port), `OUTDIR`, and for Play
shots delete `*open.spotify.com*` and `*scdn.co*` from `Network.setBlockedURLs` and wait ~5 s after load. Serve with
`DATA_DIR` = a new empty folder in SCRATCH and `PORT` = your port; stop only your own PIDs. Never build into `dist/` while another
agent might: build with `npx astro build --outDir SCRATCH\dist-<you>` and serve that with `DIST_DIR`.

**Slice A, glucak-designer (Opus). Port 8851, outDir `dist-design`.** Task: write DESIGN.md section 20 "Round IG2" against the build
(D69), from `docs/review/ig-round/eval.md` fixes 1-3 and D75 / D77. Read DESIGN 1, 3, 8, 9, 18, 19 and D6 / D39 / D47 first.
**20a, the section label (D75): 4 directions, then a pick.** The word stays on every page (exact nav word, >= 16px, >= 4.5:1, inside
the same `<h1>`/`<h2>` as the phrase, D6). Its form is open. Shoot four, injected over CDP into the served build, at 390x660 (Home
hero -> RISE edge) and 1280x800 (/shows/ top): (1) control, the crate tab as built; (2) the word unfilled, `text` 700, standing on
the 4px rule; (3) the word as a plain line inside the band right above the phrase, freeing the hero's `--tab-h` reserve; (4) yours,
from Gabe's world (crate, setlist, gig poster), not a pill. Per direction: px it frees above RISE at 390, Home height, contrast.
Save a 4-up sheet to `docs/review/ig-round2/design/labels-sheet.png`; recommend one. If none beats the control on D6 + height +
"not a filled label", say so: the crate tab then stays. **20b, Play on screen one.** Measure with Spotify unblocked: Play's offset
`P` inside the 352px embed (read off a shot), the iframe's top today, the bar's top (660 - `--bar-h`). Write the target "iframe top
<= N px at 390x660" and where the px come from (with 20a's pick and without it): hero `padding-bottom`, `.now` margin, `.band`
`padding-top`, `.v2-card` padding, the RISE line; the slogan, GLUCAK, Listen / Shows and the D39 face strip stay. **20c, About at
>= 900px:** the right column holds actions at its top (Listen to `/music/`, Shows to `/shows/`, Patreon, existing labels only; one
accent fill per view, counting the header's LISTEN); phones unchanged or shorter. **20d:** "Latest single · Sep 4, 2026" and
"August 13, 2027 · 276 days to go" without the middle dot, the 19a pattern (two spans in a flex row, word `text` 700, date `muted`).
Before writing, list what in your plan is a generic default and revise it. Never: Inter / Roboto / Arial / system / Space Grotesk,
gradients beyond the existing glow, cream, three icon cards, pills or filled tags, tracked-out caps eyebrows, middle-dot meta,
italic accent words, new colours or fonts, any motion. May touch: `DESIGN.md` (new section 20), `docs/review/ig-round2/design/`.
Out of scope: `src/`, the prototype, footer, buttons, the glow, copy changes. Done when: the sheet exists and 20a-20d have exact
deltas a coder can paste, each with its measured px.

**Slice 1, glucak-coder (Sonnet). Port 8853, outDir `dist-coder`.** Task: build DESIGN 20a (the boss's pick) and 20b exactly. May touch:
`src/styles/global.css`, `src/components/{Hero,RiseBand}.astro`, `src/pages/index.astro`, `src/pages/{music,shows,about,shop}/index.astro`,
`src/pages/404.astro`, and tests that assert the old markup. Keep `<!--gl:now-->` and every `<!--gl:*-->` marker exactly (server.js
fills them). Out of scope: `src/pages/v2/`, words, any style not in 20a/20b, `server.js`, `src/lib/`. Done when: STD plus the slice 1
row; write iframe top, Play's box, bar top and Home height to `docs/review/ig-round2/after/play.txt`.

**Slice 2, glucak-coder (Sonnet), after slice 1. Same port and outDir.** Task: build DESIGN 20c and 20d exactly. May touch:
`src/pages/about/index.astro`, `src/components/RiseBand.astro`, `src/pages/index.astro`, `src/pages/music/index.astro`,
`src/styles/global.css`, tests that pin the old strings. Out of scope: new words, the footer, the Patreon link target, anything
else. Done when: STD plus the slice 2 row; About's scrollHeight at 390x660 not higher than before your edit (measure it first),
both numbers in `docs/review/ig-round2/after/about.txt`.

**Slice 3, glucak-advisor (Sonnet, read-only). Port 8855, outDir `dist-eval`.** Task: score round IG2 as an outside evaluator; you did
not build it. Serve the build, take viewport shots at 390x660 and 1280x800 of /, /music/, /shows/, /about/, once with Spotify
blocked and Home 390 once unblocked; compare with `docs/review/ig-round/after/`. Score 1-5, one paragraph each: design quality (x2),
originality (x2), craft, function. Calibration: 2 = "dark gradient hero, centred headline, filled pill tags, three icon cards, grey
on grey"; 4 = round IG as scored in `docs/review/ig-round/eval.md`; 5 = "GLUCAK over Gabe's own graded photo, Spotify's Play pressable
on the first phone screen, a real show under it, labels that read as his and not a template, every page ending in an action".
Check hard rule 1 (one animation with motion on, zero reduced) and Home quotes-off <= 3631px at 390x660. Out of scope: editing
anything, new research. Done when: the report has scores, the hard-rule and height checks, Play's measured position and at most 3
ranked fixes; the main session saves it.

## 4. Order and parallel lanes
1. **Claim** (main session): `git pull --rebase`; extend the standing Laptop claim in HANDOFF "Now working on" with
   `src/pages/shop/index.astro`, `src/pages/404.astro`, `docs/review/round-ig2-plan.md` (`docs/review/ig-round2/` is under `ig-round*/`).
2. **Slice A** alone. **Boss gate:** pick 20a (or keep the control), approve 20b-20d and any new word (none expected).
3. **Slice 1, then slice 2**, one coder holding `global.css` in turn. No parallel lane this round: every build slice touches
   `global.css`, and the designer's injected deltas are only valid on the build they measured.
4. **Slice 3** last. Its fixes become the next round; HANDOFF updated; commit by the main session after review.
Never two agents on one file or one outDir at once. Each result returns to the boss and is checked against its own "done when"
first; extra work is dropped.

## 5. Decisions (appended to DECISIONS.md)
- **D75:** the section label stays a plain word on every page (D6); its filled-tab form is decided by the 4-direction sheet at the gate.
- **D77:** round IG2 scope: eval fixes 1 and 3, the label per D75, middle dots out; footer periods, ghost buttons, the glow and the
  chip cut; Home bar stays 3631px quotes off; Play's position is measured with Spotify unblocked.
