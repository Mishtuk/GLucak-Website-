# Design repos, round A (2026-11-18)

Owner asked: look through 4 GitHub repos for website design and use what applies. Read via `gh api` only. Nothing installed, cloned or run.
Hard rules checked against: nothing flashes > 3/s; all motion off under `prefers-reduced-motion` and our `html[data-motion='on']` gate; real photos only; CSP `script-src 'self'`; Astro + plain CSS + small plain JS.
Not read in full (noted per repo): file contents I only grepped. Blocked pages: none.

## 1. nateherkai/scroll-craft
- **What:** Claude Code plugin/skill for "premium scroll-driven sites": scroll scrubs video, sections pin, rails pan, pointer depth. Plus a real design floor (taste.md, feel.md, uniqueness.md, verify.md).
- **Licence / activity:** MIT. 5,201 stars. Last push 2026-09-30.
- **Install:** `/plugin marketplace add nateherkai/scroll-craft` (plugin `nateherk-design`, v0.3.1). Skill is `plugins/nateherk-design/skills/scroll-craft/`.
- **Read:** README, SKILL.md (first 150 lines), plugin.json, marketplace.json, taste.md (partly), grep of all other references and engine JS for reduced-motion. Not read line by line: devices.md, worlds.md, worldflight.md, assets.md, approved-collection.md, scrollcraft.css/js, template.html.
- **Safety read:** No hooks, no settings, no permission bypass found (tree has no hook files). But SKILL.md line 14 `allowed-tools: Bash, Read, Write, Edit, ...` and the workflow runs 7 node scripts + `encode.sh`.
  - `scripts/kie.mjs` lines 26-27, 48, 69, 83, 96, 118, 139: network to `api.kie.ai` and `kieai.redpandaai.co`, reads `KIE_AI_API_KEY`, uploads images (base64) and downloads generated media. Paid third-party image/video generation.
  - `scripts/shoot.mjs` line 72 (headless Chrome via playwright-core, needs `npm i playwright-core`), line 647 `spawnSync` ffmpeg. `doctor.mjs` line 33 `execFileSync`. `serve.mjs` `--lan` flag exposes a dev server on the LAN.
  - Verdict: text references are safe; the scripts and the plugin as a whole are not.
- **Fit for GLucak:** The product (scroll-scrubbed video, pinned acts, pointer depth, generated assets) conflicts with our rules almost entirely. The design floor underneath it applies (see Use now). Its own reduced-motion stance is "fewer and gentler, not zero" (taste.md line 221): weaker than ours, so override.
- **Techniques judged:**
  - Scroll-scrubbed video/frames, pinned sticky acts, rail pan: REJECT (scroll-jacking feel, content tied to scroll position, vestibular risk, hides content under reduced motion).
  - Pointer-depth / custom cursor: REJECT (its own refuse list bans custom cursors too).
  - Hero depth planes: REFERENCE only as a static layered composition of Gabe's real photos (no generated cutouts, no kie.ai).
  - Feeling curve + one peak (feel.md), fingerprint gate: use as a planning step only.

## 2. singhharsh1708/scrollcraft
- **What:** Next.js app + Claude plugin that builds "Apple-style" canvas frame-sequence sites exported as plain HTML (`frames/` + `index.html`). Hosted builder at scrollcraft.space.
- **Licence / activity:** MIT. 117 stars. Last push 2026-10-25.
- **Install:** plugin `scrollcraft` v0.2.0 under `plugins/scrollcraft/` (commands `scrollcraft-new`, `scrollcraft-build`, skill `scrollcraft`).
- **Read:** README, SKILL.md (first 80 lines), both commands, plugin.json, SECURITY.md head, grep of 7 scripts. taste.md (65 lines) and grammars.md (86) fetched but only grepped (no reduced-motion hits; line 25 notes sections under ~400px of scroll "flash past").
- **Safety read:** No hooks found. `scripts/verify.mjs` line 277 spawns Chrome and line 292 `rmSync` of a temp profile; `frames-from-*.mjs` call ffmpeg and delete `frame_####.jpg` in the out dir (lines 44, 101); `build-site.mjs` lines 71-73 emit Google Fonts `<link>`s into built pages (third-party, breaks our CSP and privacy stance). Repo also carries Sentry, payments (Dodo), Google/GitHub sign-in for the hosted app: not part of the plugin, but shows the repo is a SaaS codebase. Scripts only: no network calls from the plugin scripts besides the font links.
- **Fit for GLucak:** Core idea is scroll-scrubbed canvas with pinned copy: REJECT (scroll-linked, pinned, canvas). Nothing in the repo is about music or artists. Its `verify.mjs` idea (screenshot every scroll step, flag black/missing frames, report contrast) is a good model for our own review shots, reference only.

## 3. VoltAgent/awesome-claude-design
- **What:** README-only list of 68 `DESIGN.md` files (getdesign.md links) for upload to Claude Design. Not a skill, no code, no files besides README + LICENSE.
- **Licence / activity:** MIT (repo). 4,603 stars. Last push 2026-06-20. The linked DESIGN.md files are "inspired by publicly observable patterns" of real brands, not official.
- **Install:** none (download a DESIGN.md, upload to claude.ai/design). Skills are not installed from here.
- **Safety read:** Nothing executable. Links go to getdesign.md (third-party site, not fetched). Banner links to a paid product (LaunchKit).
- **Fit for GLucak:** Music-relevant entries: Spotify (green on dark, bold type, album-art-driven), ElevenLabs (dark cinematic, waveform), Nike and Tesla (full-bleed photography, sparse). We already hold DESIGN.md, so the only transferable thing is the 9-section DESIGN.md template (Theme, Colour roles, Type, Components, Layout, Depth, Do's/Don'ts, Responsive, Agent prompts). Compare our `DESIGN.md` headings to it; add missing "Do's and Don'ts" and "Agent prompt guide" if absent. Copying a brand's file would be copying a brand: no.
- **Followed from its linked ecosystem (via #4):** none of these are in this README; see section 5.

## 4. nishaj0/claude-for-everything
- **What:** README-only awesome list (skills/plugins/MCP by task). Design section lists 15 UI skills plus "Web Animation & 3D". Entries are explicitly "not security-audited".
- **Licence / activity:** none declared. 36 stars. Last commit 2026-11-17.
- **Install:** none; "follow each repo's README".
- **Safety read:** `.github/workflows/ping-site.yml` lines 14-24: on push to main it curls the author's private site repo with a secret token. Runs in their repo only, no effect on us. No code for us.
- **Fit:** Pointed us to the repos below. Already covered in RESOURCES.md: impeccable, taste-skill, hallmark, awesome-design-md. New to us: unslop, jakubkrehel/skills, modern-web-guidance, oil-ui, ui-ux-pro-max-skill, awesome-design-skills, gsap-skills (GSAP is off-stack: reject).

## 5. Followed from the lists (5 repos, read SKILL.md)
| Repo | Licence, stars, last push | Safety | Fit |
|---|---|---|---|
| jakubkrehel/skills (better-accessibility, better-ui, better-interface; 13 skills total) | MIT, 12.3k, 2026-11-18 | Markdown + yaml only, no scripts, no hooks (tree checked). Best install candidate | better-accessibility: our motion gate, 2.2.2 pause control, focus not hidden by sticky header. better-ui: exact motion values |
| GoogleChrome/modern-web-guidance | Apache-2.0, 22.2k, 2026-11-17 | SKILL.md tells the agent to run `npx -y modern-web-guidance@latest search/retrieve` every time: downloads and runs a package each use. Guides themselves are plain .md in the repo | Has guides for `parallax-scroll-effects`, `scroll-progress-indicator`, `shrinking-header-on-scroll`, `scroll-completion-effects`, `interactive-content-reveal`. Read the .md files directly as CSS reference. Do not install the skill |
| heydamir/unslop | CC-BY-4.0, 17.9k, 2026-11-15 | `snapshot.mjs` (playwright, `fetch(href)` lines 100, 134), `story.mjs` (ffmpeg, local server, `rmSync` lines 404, 490). CC-BY needs credit in any copy | Reference: "five-line direction before editing" (Product, Character, World...) and its slop audit `references/signs.md` (not read). Bans words like clean/modern/premium for Character |
| oil-oil/oil-ui | MIT, 3.5k, 2026-11-18 | Tree only, not read: `check_update.py/.sh` (network), `chrome.mjs`, `oiloil-image.mjs` (image generation), vendored alpine.min.js | Reject install (image gen, update pings). Idea only: explore several directions side by side |
| nextlevelbuilder/ui-ux-pro-max-skill | MIT, 151k, 2026-11-16 | Tree only: dozens of Python scripts (`fetch-background.py`, logo/CIP generators) | Reject install. Generic palettes/font DB, tends to produce the templated look we avoid |
Also seen, not opened: bergside/awesome-design-skills (67 style SKILL.md files via `npx typeui.sh pull`, a downloader: no).

## Use now (max 6)
1. **Refuse list into the review rubric.** From scroll-craft `references/taste.md` "The refuse list" (lines 255+). Add to `.claude/skills/design-review/SKILL.md` and `.claude/agents/designer.md`: no identical-card grids, no `01 / 06` counters, no "scroll" cues, no gradient text, no neon/outer glow (also our rule 1), no custom cursors, no em dashes in visible copy, no invented stats, no text baked into images, no filler verbs (elevate, seamless, unleash), hero max two lines + one primary and one secondary action. Page: all, check Home hero first. Effort S.
2. **Motion rules for `public/css`.** From taste.md "Motion": `transform`/`opacity` only for anything animated, never `transition: all`, never `ease-in` on UI, `ease-out` custom curve `cubic-bezier(0.23,1,0.32,1)`, UI transitions under 300 ms, enter from `scale(0.95)`+opacity never `scale(0)`, stagger 30-80 ms, hover only under `(hover: hover) and (pointer: fine)`. Ours stricter: under reduced motion or Motion off, zero movement (their "fewer and gentler" is not enough). Where: global CSS + design-review motion checklist. Effort S.
3. **Hero type step-down on phones.** From taste.md Typography: step the hero H1 down one size rung under ~700px (headline wraps to 6 lines at 390px otherwise); `text-wrap: balance` on headings, `pretty` on body; body measure 45-75ch; two font families max. Where: Home `h1` with the slogan, ShowCard titles, 390x844 shot check. Effort S.
4. **Accessibility motion + sticky-header rules.** From jakubkrehel `skills/better-accessibility/SKILL.md` lines 82-88 and line 22: movement wrapped in `@media (prefers-reduced-motion: no-preference)`; anything moving more than 5 s needs a visible pause (WCAG 2.2.2), so the Spotify area and any ambient motion get a control; a focused element never hidden behind the sticky header (2.4.11): add `scroll-padding-top` equal to header height. Where: `design-review` accessibility section; header CSS. Effort S.
5. **Scroll-linked reveal, tightly gated.** From modern-web-guidance guides (`interactive-content-reveal`, `scroll-progress-indicator`) as CSS reference only: a section/card fade-up using `animation-timeline: view()` with `animation-range: entry 0% cover 30%`, opacity 0 to 1 and `translateY(12px)` to 0, `linear both`. Must sit inside `@media (prefers-reduced-motion: no-preference)` AND `html[data-motion='on']`, content visible by default (no `opacity:0` outside the gate), no change to DOM order, no pinning, wrap in `@supports (animation-timeline: view())`. Page: Home sections (Shows list, Videos), Shop product cards. Skip the progress bar and shrinking header. Effort M.
6. **Feeling curve + one peak, as a designer step.** From scroll-craft `references/feel.md` (spec) and SKILL.md Step 0: before a page layout, write one line per section (emotion, then what on screen causes it), and name one peak (for Home: the IDENTITY release hero) that gets the most space and quiet before it. Add as a 4-line step in `designer.md`; no code. Effort S.

## Reference only
- scroll-craft `hero-depth.md`: layered hero (background, subject, foreground, type between planes) as a STATIC composition from Gabe's real photos; poster fallback must be complete. No generated plates.
- scroll-craft `verify.md` / singhharsh `verify.mjs`: screenshot at 12 scroll positions, once with reduced motion, to catch dead scroll, faded-out copy, contrast on the composited page. Do manually in our shots step; do not run their scripts.
- unslop "Direction" (five lines before editing; ban the words clean, modern, premium) and `signs.md`; credit CC-BY-4.0 if any text is copied.
- jakubkrehel `better-ui`: press scale, concentric radius (outer = inner + padding), 1px outline on images, optical alignment. Its 4px blur on enters is fine but keep it inside the motion gate.
- awesome-claude-design: 9-section DESIGN.md template; Spotify and ElevenLabs entries as moods to describe, not files to copy.
- scroll-craft `uniqueness.md` fingerprint gate (differ from earlier builds on 4 of 6 dimensions): relevant if we reuse the Riverside layout too closely.

## Reject (why)
- Scroll-scrubbed video/canvas frames, pinned sticky acts, horizontal rail pan (both scrollcrafts): scroll-jacking, scroll-linked, hides content when motion is off, vestibular risk.
- Scroll-linked audio (singh): autoplay-adjacent sound, against our rules and mobile policies.
- Parallax (`parallax-scroll-effects` guide, scroll-craft depth-on-scroll): not "slow fade/translate"; layers moving at different speeds is the vestibular trigger. Static layering only.
- Pointer-follow depth, custom cursors: motion outside the gate, touch audience.
- kie.ai image/video generation (scroll-craft `kie.mjs`), oil-ui `oiloil-image`, hallmark/unslop image generation: API keys, paid, and generated imagery breaks "real photos only".
- Google Fonts `<link>` output (singh `build-site.mjs` 71-73) and any CDN: CSP and third-party.
- GSAP skills, Three.js/WebGL skills: off stack.
- ui-ux-pro-max, awesome-design-skills (`npx typeui.sh pull`): bulk generic style databases and downloaders; the templated look we are avoiding.
- Brand DESIGN.md files: copying a real brand's look.

## Install plan (project-level, text only)
Only one recommended: **jakubkrehel/skills `better-accessibility`** (Markdown only, MIT, no scripts/hooks). Condition: the reviewer reads every .md before running the copy (I read only SKILL.md fully). Run from `V:\GLucakWebsite`:
```
mkdir -p .claude/skills/better-accessibility
for f in SKILL.md focus-and-keyboard.md forms.md hit-areas.md motion-and-zoom.md reporting.md screen-readers.md semantics-and-aria.md; do
  gh api -H "Accept: application/vnd.github.raw" repos/jakubkrehel/skills/contents/skills/better-accessibility/$f > .claude/skills/better-accessibility/$f
done
```
Skip its `agents/openai.yaml`. Add a line to `docs/research/RESOURCES.md` crediting MIT source. Then add an override note in `design-review` that our reduced-motion rule is zero movement.
- scroll-craft plugin: **not recommended** (scripts, paid API key, wrong product). Copy rules by hand (Use now 1-3, 6) instead.
- singhharsh1708/scrollcraft plugin: **not recommended** (scripts, wrong product).
- modern-web-guidance skill: **not recommended** (`npx -y ...@latest` fetches and runs code each use). Read guides directly: `gh api -H "Accept: application/vnd.github.raw" repos/GoogleChrome/modern-web-guidance/contents/skills/modern-web-guidance/guides/ui-behaviors/interactive-content-reveal.md`.
- unslop, oil-ui, ui-ux-pro-max: **not recommended** (scripts; unslop also needs CC-BY credit).
- awesome-claude-design, claude-for-everything: nothing to install.
