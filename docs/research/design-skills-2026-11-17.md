# Design skills + shadcn/ui: impeccable, hallmark, shadcn (Desktop researcher, 2026-11-17)

Source: the owner's advice ("Opus can make good designs; use impeccable + hallmark; screenshots in; shadcn components;
screenshot desktop + mobile and review via the skills"). Method: read both repos through `gh api` (README, SKILL.md, the
reference files for audit / critique / craft-floor / animate / hooks, the launcher script, plugin + marketplace JSON,
hallmark's `gates.md`, `SKILL.md`, install / hook / imagegen / theme scripts). **Nothing installed, cloned or run.** Not read
line by line: the 50 hallmark theme files, impeccable's `live.md` (42 KB), `document.md`, `new-work*.md`, the compiled engine.

## Verdicts

| Item | Verdict |
|---|---|
| impeccable | **Use the text, not the machinery.** Vendor `critique-rubric.md`, `audit.md`, `craft-floor.md`, `animate.md` into a project skill; no hook, no live mode, no engine binary until the owner OKs the safety flags below. |
| hallmark | **Use as a linter + reviewer prompt on our existing pages** (`audit`, `sloplint --render`). Skip themes, `redesign`, imagegen, library photos. |
| shadcn/ui | **Visual + accessibility reference only. Do not install.** React + Tailwind, wrong stack. |

## 1. impeccable (github.com/pbakaus/impeccable)

- **What:** one skill, 24 sub-commands, plus a deterministic slop detector ("62 rules, no LLM, no API key"), a hook, 5 helper
  agents, a Chrome extension. Version 4.9.2, Apache-2.0, ~112k stars, last push 2026-11-18. Started from Anthropic's
  frontend-design skill (README License).
- **Install (Claude Code):** `npx impeccable install` (asks project vs global, offers the hook), then `/impeccable init`
  (writes `PRODUCT.md`). Or plugin: `/plugin marketplace add pbakaus/impeccable` then `/plugin install`. Or manual copy,
  no Node: `cp -r .claude/skills/impeccable <project>/.claude/skills/` (README "Manual copy": skips hook + agents).
  Standalone detector: `npx impeccable detect <dir|url>`; exit 2 = findings.
- **Commands:** steer (`bolder quieter distill colorize typeset layout animate delight overdrive`), review (`critique`
  = scored UX review; `audit` = technical report), finish (`polish harden clarify adapt optimize onboard`), iterate
  (`live`, `generate`), setup (`shape init document extract`), plus `hooks`, `doctor`, `foundations`, `pin`.
- **Key rules quoted**
  - craft-floor.md "Refuse": "A kicker or eyebrow above a heading. This one is a ban, not a default"; "Section numbers
    (01 / 02 / 03) unless the sequence carries information"; "Gradient text"; "Glass and blur as decoration"; "A colored
    border-left ... above 1px"; "Hard offset shadows outside a neobrutalist world"; "Same-size cards of icon plus heading
    plus text"; "nested cards are always wrong"; "Unicode glyphs or emoji standing in for an icon system".
  - craft-floor.md "Verify": contrast "body >=4.5:1, large >=3:1"; "body measure 65-75ch, display max 6rem, tracking floor
    -0.04em"; "Motion: one authored moment, not scattered effects"; theme the browser surfaces (selection, caret, scrollbar,
    focus ring, tabular numerals); "Run the real copy at every breakpoint".
  - SKILL.md: "Verify by looking at the rendered result at the sizes it ships at, and batch the checks: fix what one look
    shows before looking again." "The brief wins" (pinned aesthetics beat its own warnings).
  - audit.md: 5 dimensions scored 0-4 (a11y, performance, theming, responsive, "implementation integrity"), total /20,
    findings tagged P0 blocking .. P3 polish with location / WCAG / suggested command. Motion check: "flag ... flashing
    above threshold, and motion that blocks focus, reading, or task completion". Touch targets 44px (24px WCAG floor).
  - critique.md: "Assessment A (design review) and Assessment B (detector/browser evidence) MUST run as two isolated
    sub-agents"; A must finish before detector output is seen ("it still anchors judgment"); Nielsen 10 heuristics 0-4,
    cognitive load, personas; a degraded single-context run must print a banner; ends by asking what to fix next.
  - animate.md: every animation "needs a `prefers-reduced-motion` path with an intentional alternative"; capture motion
    once normal, once reduced (`impeccable motion-capture <url> --reduced-motion`), then a fresh motion-reviewer agent.
- **Safety read (flags, exact places)**
  1. **Downloads and runs a compiled binary.** `.claude/skills/impeccable/scripts/impeccable` (launcher, line 231) curls
     `https://github.com/pbakaus/impeccable/releases/download/engine-v<ver>/...` into `~/.impeccable/bin/`, checked against
     `engine-checksums.txt` which ships in the same repo (guards transit, not a bad release). SKILL.md "Setup" step 1 runs
     it at the start of every session (`impeccable context`).
  2. **Hook runs outside model approval, unsandboxed.** README "Hooks run outside model approval"; hooks.md:113 "runs the
     engine unsandboxed with the agent's environment and network access". `.claude/settings.json` wires it to
     SessionStart / PostToolUse (Edit|Write) / Stop. Never blocks edits, but it is arbitrary code on every edit.
  3. **Live mode can run a second agent with permissions off.** README "Live mode": Apply can run the `codex` or `claude`
     CLI with `--dangerously-bypass-approvals-and-sandbox` / `--permission-mode bypassPermissions`, env inherited, unless
     `IMPECCABLE_LIVE_COPY_AGENT=chat|off`. Also runs `package.json` script `impeccable:manual-edit-validate`. Do not use.
  4. **Remote content into the agent + telemetry.** README "Telemetry": a new design fetches "visual directions from the
     impeccable.style catalog" (cannot be turned off); the anonymous pick record can: `npx impeccable telemetry off`,
     `DO_NOT_TRACK=1`, or `"telemetry": false` in `.impeccable/config.json`. Fetched text is an injection surface.
  5. **Scope creep beyond design:** `foundations` (secrets, 404, CI roadmap), `init` writes PRODUCT.md, critique starts a
     local live-server and injects `http://localhost:PORT/detect.js` (critique.md:83). All local, but not "design only".
  - No file asks for API keys. Nothing exfiltrates the repo that I found; I did not read the engine source or `live-browser.js`
    (566 KB bundle).
- **Fit problems:** `bolder`, `overdrive` ("shaders, spring physics, scroll-driven"), `delight`, `animate` push motion we
  forbid; craft-floor encourages blur / backdrop-filter / clip-path motion. Our no-flash rule and DESIGN.md ("exactly two
  motions on Home, no shadows") win. audit.md warns against a global `0.01ms` reduced-motion kill; ours is "all motion
  off", fine as long as state changes (focus, pressed, active page) stay visible. `critique` and `audit` are the keepers.

## 2. hallmark (github.com/nutlope/hallmark, "Made by Together AI")

- **What:** skill that deals a theme (50 materials) and builds a self-contained HTML/CSS page, then lints and reviews it.
  v2.0.0, MIT, ~57k stars, last push 2026-11-11. One skill (`skills/hallmark/SKILL.md`) + 26 reference files + Node scripts
  (`sloplint.mjs`, `sloplint-render.mjs`, `theme.mjs`, `capture.mjs`, `picture.mjs`, `imagegen.mjs`, `install*.mjs`,
  `lint-hook.mjs`). No agent files; reviewers are subagents spawned from `gates.md` section 6.
- **Install:** `npx skills add nutlope/hallmark -g` (`-g` = user-level; omit for project; `--agent claude-code` for one
  harness). Or `/plugin marketplace add nutlope/hallmark` then `/plugin install hallmark@hallmark`. From a clone:
  `node skills/hallmark/scripts/install.mjs`; optional edit hook `install-hook.mjs` (writes `.claude/settings.json`;
  `--remove` undoes). Browser checks need `npm i -g puppeteer-core` + Chrome; without them only static checks run.
- **Verbs:** `/hallmark <prompt>` (new build), `/hallmark redesign <path>`, `/hallmark audit <path>` (report only). SKILL.md:
  "Never use it on an existing design unless the user names Hallmark". Lint any page directly:
  `node <skill-dir>/scripts/sloplint.mjs <file-or-dir> --render` (or `--url http://localhost:<port>/<route>`).
- **Gate tiers (gates.md):** Floor (never ships), Reflex (waivable on the record), Finish (never blocks). Floor quotes
  (SKILL.md): "Every colour and every font goes through a token declared at `:root`"; "Never `transition: all`. Never
  animate width, height, top or left"; "Every animation has a `prefers-reduced-motion: reduce` fallback, and content is
  visible with scripting off"; "Never an invented metric, testimonial, logo wall"; "Never an eyebrow, and never a label in
  tracked capitals or small caps"; "Never a purple-to-blue gradient, a card inside a card, an emoji as an icon"; "The
  hero's headline, one sentence and primary action are all visible at 1280 x 800"; "About 80 words on any one screen";
  "overflow-x: clip on both html and body". Reflex: Inter/Roboto/Poppins as display, Tailwind stock palette, glow/aurora,
  mono as costume, accent over ~5% of viewport, three icon cards.
- **Review loop it enforces:** hero first, `sloplint --render --stage hero`, fresh-context reviewer; then full page:
  render tier shoots 8 widths (`WIDTHS = [320,375,414,768,1024,1280,1440,1920]`, sloplint-render.mjs:6) and emulates
  `prefers-reduced-motion: reduce` (line 146); reviewer (`review-finish.md`) first word is `recapture | rebuild | fix | ship`,
  max 8 findings, "Do not fix anything", closes with "what must not be diluted while fixing". Budget: "one batched
  inspection, one fix batch, at most one confirming round". Pre-emit self-score on six axes P/H/E/S/R/V, any under 3 = revise.
- **Safety read**
  1. `scripts/imagegen.mjs:6` posts to `https://api.together.xyz/v1/images/generations` with `TOGETHER_API_KEY` (opt-in; no
     key = placeholder). **Conflicts with owner rule "nothing generated"; never set the key.**
  2. `scripts/theme.mjs:413-418` downloads Wikimedia Commons photos (`photos --save`) for stand-ins. Conflicts with "his own
     real photos only"; skip.
  3. Install scripts run `node` children (`install.mjs:102`, `lint-hook.mjs`) and the hook edits `.claude/settings.json`;
     `capture.mjs:60` can attach to a Chrome DevTools port on 127.0.0.1. All local; code is plain readable JS (good).
  4. `npx skills add` pulls the third-party `skills` CLI from npm: unreviewed. Safer: plugin route, or copy the folder.
  5. Output branding: SKILL.md prints "Powered by Together AI" in the Picks block (chat), and requires a `/* Hallmark ·
     v2.0.0 ... */` stamp as line 1 of shipped CSS. Owner rule is no Claude/AI attribution in commits; a tool stamp in CSS
     is a different thing but tell the owner. Linting a file without a stamp via the `sloplint.mjs` CLI works regardless.
  - No file asks for keys other than item 1, nothing instructs the agent outside design/build. Not read: 50 theme files.
- **Fit problems:** it wants a 7-word headline (slogan is 11 words: use `copy: verbatim` in the stamp, which "reports the copy
  gates (19, 58, 69) as notes"; Floor 13/44b may still fire on Home, answer on the record). It wants an email band avoided
  at the end of every page (Reflex, waivable: our Signup is in the brief). Its "ask once" step and the draw/deal flow are for
  new pages: not for us.

## 3. Overlap with what we already have

Read: `.claude/agents/designer.md` (30 lines: uses frontend-design + design-taste-frontend, no-strobe rule, phones first);
`docs/research/ai-design-workflow.md` (15 techniques; section 4 says we lack "a fixed rubric or independent grader" and a
computed-style token test); `ig-design-tips.md` (4a done, 4b ranked todo, 4c does not fit); installed `taste-skill`
(`~/.claude/skills/taste-skill/SKILL.md`, 1206 lines, dials, brief inference, "not dashboards"); `frontend-design` plugin (71 lines).

| Area | Already have | New from impeccable / hallmark |
|---|---|---|
| Ban list (eyebrows, gradient text, nested cards, Inter, emoji icons, glow) | ig-design-tips + taste-skill + frontend-design cover about 80% | Duplicate. Only novelties: browser-surface theming (selection, caret, scrollbar), "section numbers" ban, 44px/24px touch rule |
| Independent evaluator with scores | Recommended in ai-design-workflow #9/#10, not built | **New and the main prize:** impeccable `critique` (isolated A/B subagents, Nielsen 0-4, personas), `audit` (5 dims /20, P0-P3), hallmark `review-finish.md` (recapture/rebuild/fix/ship) |
| Deterministic lint of the rendered page | Nothing; we have `tools/perf.mjs`, a11y shots by hand | **New:** `sloplint --render` (8 widths, reduced-motion emulation, overflow-x, hero-at-1280x800, token-only colour, `transition: all`); `impeccable detect <url>` |
| Review budget | "2-3 changes per round" (#12) | Hallmark's "one batched inspection, one fix batch, at most one confirming round" is tighter; adopt |
| Design plan / 4 directions | ai-design-workflow #1, #4 | Duplicate; hallmark's six-axis pre-emit score (P H E S R V) is a cheap add |
| Palette/theme catalog, themes dealt, library photos, imagegen | Our eras + art-system + real Gabe photos | Skip all; contradicts art-directed real-photo rule |
| Motion | DESIGN.md: two motions, flash rules, `data-motion` switch | Both skills agree on reduced-motion paths; neither tests flash rate. Our own rule stays the authority |

## 4. shadcn/ui (ui.shadcn.com, github.com/shadcn-ui/ui, MIT, ~128k stars)

- **What:** "not a component library... how you build your component library": you copy component source into your repo
  (CLI + registry), React + Tailwind + Radix primitives (a "base" variant also exists in the docs). Docs folders seen:
  `installation` has `astro.mdx`, `vite`, `next`... but the Astro guide is React islands + Tailwind. Sidebar also lists
  "Skills" and an "MCP Server" (not read). No official non-React port. Community vanilla port found:
  `codylindley/shadcn-html` (MIT, 60 stars, Apr 2026): "semantic HTML, modern CSS, vanilla JavaScript ... No framework"
  with `dist/components/<name>/<name>.css|.js` and per-component `component-skill.md`. Only listed, not read; young and tiny.
- **Verdict: reference only.** Reasons: (1) no React or Tailwind in our stack, adding both for a static music site is
  the opposite of lazy; (2) bundle weight: React runtime + hydration vs our small plain JS; (3) CSP `script-src 'self'`:
  Astro React islands hydrate through an inline `astro-island` script, which `'self'` blocks unless hashed/nonced: unverified
  here, needs a test before anyone tries; (4) our look is a poster style (no shadows, 2px radii, heavy borders) which
  shadcn's soft neutral defaults would fight; (5) we already own Header, MobileBar, Signup, Footer, admin screens.
  Its value is the behaviours Radix already got right. I did not read the component source, only the docs landing page;
  the list below is from the standard WAI-ARIA patterns they implement: verify against the live docs when borrowing.
- **Borrow (plain CSS + JS, no framework):**
  1. **Sheet** (our mobile Menu, ig-design-tips 4b#5): overlay, focus moves in and returns to the trigger, Esc and
     overlay click close, `inert`/aria-modal background, scroll lock; slide from edge 150-250ms under motion-on only.
  2. **Dialog / Alert Dialog** (admin delete show, discard changes): focus lands on Cancel for destructive confirms, `Tab`
     trapped, labelled title + description, return focus. Native `<dialog>` does most of it with zero JS framework.
  3. **Tabs** (admin sections, maybe Music filters): `role=tablist`, roving tabindex, arrow-key/Home/End, `aria-selected`,
     panel `hidden`; no animation needed.
  4. **Field + Input + Label + Form messages** (Signup, booking request, admin edit): label always visible, `aria-invalid`,
     `aria-describedby` to the error, specific idle/sending/success/error text (ig-design-tips 4b#6), static, no pulse.
  5. **Toast / Alert** for "Saved" in admin: `role=status`, polite, text + icon swap, auto-dismiss without motion; plus
     **Table** semantics for the shows list (scoped headers, row actions as real buttons).

## 5. Proposed designer workflow (Opus), fits the boss gate

1. **Inputs:** target screenshots from the owner / Wix refs in `docs/research/shots/`, DESIGN.md, the era file. Designer
   states the brief, a "never" list and the 4 directions (ai-design-workflow #1/#3) before touching CSS.
2. **Build one component or page** from tokens only (no literal colours), all states listed up front, motion behind
   `prefers-reduced-motion: no-preference` and `html[data-motion='on']`.
3. **Shoot** (batched, viewport-size not full-page, plus one full page for rhythm): widths **390 and 1280**, each in
   **motion-on and motion-reduced** (emulate `prefers-reduced-motion`, and `data-motion` off) = 4 sets per page, plus 320 for
   overflow. Save to `docs/review/<round>/<page>-<w>-<on|off>.png` (existing convention: `docs/review/a11y-200/`). Use the
   existing Chrome/playwright route the team used for a11y-200; no new dependency.
4. **Lint:** `sloplint.mjs <dist> --render` (or `--url` on `astro dev`) and `impeccable detect <url>` if installed; fix every
   Floor/FAIL. Findings that fight our brief (headline length, uppercase poster type, hard borders) are answered on the
   record in `docs/review/<round>/README.md`, not silently ignored.
5. **Independent review (different agent, not the builder):** impeccable `critique` + `audit` run as read-only reports on the
   shots + source, scored /20 with P0-P3. Plus the hallmark finish-reviewer prompt for the one-word verdict. Add our own
   rule the skills lack: "any flashing-risk element (animated bright/dark alternation, strobe-like loop) = P0".
6. **Iterations:** max **2 fix rounds** per page (one batched fix + one confirming shot set), 2-3 visible changes per round
   with a scope fence. Stop early on `ship` or audit >= 16/20 with no P0/P1. A third round needs the mediator.
7. **Boss gate:** boss reads `docs/review/<round>/README.md` (shots, lint output, audit table, answered findings) and the
   reduced-motion set. Gate passes only if: no P0/P1, no Floor FAIL, reduced-motion set shows content and state intact,
   390 and 1280 have no horizontal scroll, strict CSP page still loads (no inline script). Then the owner sees it.
8. **Self-improve claim:** the owner's "it will self-improve" holds only with an outside grader and a hard round cap; agents
   grade their own work too kindly (ai-design-workflow #9).

## 6. Install plan (run by the main session AFTER the owner's files are read; owner OK first)

| Step | Command | Level | Rating |
|---|---|---|---|
| A. Vendor impeccable's review docs as text | `gh api -H "Accept: application/vnd.github.raw" repos/pbakaus/impeccable/contents/.claude/skills/impeccable/reference/{critique,critique-rubric,audit,craft-floor}.md` into `.claude/skills/design-review/` (one SKILL.md that says: read-only, no scripts, no network, run as separate agent) | project `.claude/` | **recommended** (zero code runs) |
| B. Hallmark linter only | read-only clone outside the repo (scratchpad), then `node <clone>/skills/hallmark/scripts/sloplint.mjs <dist> --render`; needs global `npm i -g puppeteer-core` + Chrome | none (not installed) | **recommended**, optional `/plugin marketplace add nutlope/hallmark` + `/plugin install hallmark@hallmark` for `audit` verb |
| C. Hallmark hook / imagegen / themes | `install-hook.mjs`, `TOGETHER_API_KEY`, `theme.mjs photos` | n/a | **not** (settings edits; generated and stock imagery break owner rule) |
| D. Full impeccable | `npx impeccable install --providers=claude --scope=project`, answer **no** to the hook, then `npx impeccable telemetry off` | project | **not recommended now**; only if the owner accepts the binary download. If done: never `/impeccable live`, never `foundations`, set `IMPECCABLE_LIVE_COPY_AGENT=off`, add the README's `.gitignore` block |
| E. impeccable `detect` as CLI only | `npx impeccable detect --json http://localhost:<port>` (downloads the engine) | none | **optional**, same binary caveat |
| F. shadcn | none; browse ui.shadcn.com docs for behaviours | n/a | **not installed** (`npx shadcn@latest init` would add React + Tailwind) |
| G. Tell the designer | add to `.claude/agents/designer.md`: step 5 workflow above, the never-list, "Skill: design-review" in tools | project | **recommended** |

Project-level beats user-level: both skills are written for greenfield defaults, so keep them off other repos (Mulligan,
Riverside) that have their own designs. Open question for the owner: is `npx skills add` / a 112k-star but fast-moving
binary-downloading repo acceptable on the client-work machine? Default answer: take A + B, skip D.
