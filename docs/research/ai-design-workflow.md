# Getting better, less "AI slop" design out of an AI coding agent (Laptop researcher, 2026-11-10)

Scope: the wider net around Charles Liu's "Removing AI Slop" reels (another agent covers the reels). Nothing was
commented, DM'd, followed or logged into. Only public pages were read. Not verified by running anything: these are
techniques from sources, not tested on our site.

## 1. Charles Liu's "skills" and "resources": are they public?

**No, not found anywhere public.**
- Instagram bio of @charles.unemployed (read-only fetch): talks about apps and tech; co-founder of Gleam
  (@try.gleam, "500k+ users"); contact charles@superhappy.so; link in bio = `gleam.so`.
- `gleam.so` home page links only to About, Products, Instagram (@try.gleam) and hello@gleam.so. No skills, no
  downloads, no resources page, no GitHub link.
- GitHub repo search for unslop + accent + charles: 0 results. Web search for the handle, "unslop" and "accent"
  tied to him: nothing. Several *unrelated* community "unslop" skills exist (e.g. theclaymethod/unslop,
  onmax/claude-config/unslop). They clean up AI-written code and prose, not design, and are not his. Do not assume
  they match what he sells or gives away.
- Conclusion: "unslop" and "accent" are comment-for-DM lead magnets. The only way to get them is to comment and DM,
  which we did not do. If the owner wants them, he can ask; our own list in section 3 covers the same ground
  from public, checkable sources.
- @niki.aroca: bio "Co-Owner: @averlo.co", link `averlo.co/booking` (a booking page). Posts are mostly photo
  carousels, Oct-Nov 2026. No public design resource found.
- @ayoships: bio "Exposing dark patterns in mobile apps", YC W25, link `ayoships.com`. Short text-overlay reels
  about apps and money. No public design resource found. Both are format inspiration (how to make the reel), not
  technique sources.

## 2. Sources table

| Who | Link | Date | Technique |
|---|---|---|---|
| Anthropic, "Improving frontend design through Skills" | https://www.claude.com/blog/improving-frontend-design-through-skills | 2025-11-12 | Name fonts to avoid and give alternatives by category; extreme weight/size contrast; one cohesive palette in CSS variables; one orchestrated page-load reveal; layered backgrounds; end with an anti-convergence reminder (the model drifts to Space Grotesk after Inter is banned) |
| Anthropic, frontend-design skill (SKILL.md, anthropics/skills and claude-code plugin) | https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md | current (read 2026-11-10) | Write a 4-6 colour named design plan first, review it for generic defaults, build, then critique with screenshots; lists AI defaults to avoid (cream + terracotta, near-black + acid green, SaaS card grids, tracked-out eyebrow labels, middle-dot meta strings); a brief's own visual direction always wins |
| Anthropic prompting docs, "Prompting Claude Sonnet 5" > Design and frontend defaults | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 | current (read 2026-11-10) | Model settles into one house style; "don't use that colour / make it clean and minimal" just swaps to another fixed palette. Two fixes that work: (1) give a concrete spec (hex palette, radius, type, section order); (2) make it propose 4 directions (bg hex / accent hex / typeface / rationale) and pick one before building |
| Anthropic prompting docs, "Frontend design" section | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | current | The `<frontend_aesthetics>` system-prompt block; cites the full skill; also gives Claude a crop/zoom tool for reading images |
| Anthropic cookbook, prompting_for_frontend_aesthetics | https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb | read 2026-11-10 | Three strategies: steer each dimension separately, reference a named inspiration (IDE theme, cultural aesthetic), name the defaults to avoid. Notes the sample output still landed on Syne/DM Sans: shifts defaults, no guarantee |
| Anthropic Engineering, "Harness design for long-running apps" | https://www.anthropic.com/engineering/harness-design-long-running-apps | read 2026-11-10 | Separate generator and evaluator; evaluator drives the live page with Playwright, screenshots it, scores 4 criteria (design quality, originality, craft, functionality), writes critique back; originality criterion explicitly penalises "purple gradients over white cards"; weight design and originality above craft; few-shot score examples calibrate the grader; 5-15 rounds |
| kent-tokyo, "What I do before letting Claude Code touch web app design" (DEV) | https://dev.to/kent-tokyo/what-i-do-before-letting-claude-code-touch-web-app-design-53n0 | Jun 3 (year not shown) | Spec in markdown first; tokens + DESIGN.md before components; name references not adjectives; list all interaction states; 2-3 visible changes per round; screenshot at 375px; diagnose regressions before fixing; scope fences ("don't touch layout or colours"). Comment: use viewport-size shots (full-page gets downscaled) and check `getComputedStyle` for exact token values |
| Julian Oczkowski, "7 Claude Code Design Skills..." (DEV, from Medium) | https://dev.to/aiforwork/7-claude-code-design-skills-that-follow-a-real-design-process-4f63 | Mar 31 (year not shown) | Pipeline: grill the requirements -> design brief (tone, inspiration) -> information architecture -> tokens -> task list -> build -> screenshot design review (with Playwright MCP) |
| VoltAgent, awesome-design-md | https://github.com/VoltAgent/awesome-design-md | undated (2026 repo) | Public DESIGN.md files describing real brand systems (theme, palette with roles, type, components, elevation, do/don't, responsive, agent prompt guide). Copy one in as a style reference. Third-party analyses, not official brand rules |
| Gaurav Tiwari, "Stop Slop" | https://gauravtiwari.org/stop-slop-ai-slop/ | 2026-04-26, upd. 2026-10-24 | Copy slop tells (uniform cadence, generic closings, significance inflation, throat-clearing) + a nine-point pre-ship checklist including loading/error/empty states. Writing-focused, useful for our copywriter |
| Charles Liu @charles.unemployed | https://www.instagram.com/charles.unemployed/ | Oct-Nov 2026 | Reels covered by the other agent; skills not public (section 1) |

Weak or unconfirmed (not relied on): feedbagel "7 step Claude Code setup" (teaser only, claims a DESIGN.md
"looks like Stripe" trick); tutorialsdojo web design workflow (page did not load); assorted skill-directory mirrors.

## 3. The strongest techniques (imperative)

1. **Have the designer propose 4 directions before building, then pick one.** Each as bg hex / accent hex / typeface /
   one-line reason. This is Anthropic's recommended anti-sameness move now that temperature cannot be set. (Sonnet 5 docs)
2. **Replace adjectives with a concrete spec.** Hex palette (4-6 named colours), radius, type roles, section order,
   hover timing. "Clean and minimal" only swaps one default for another. (Sonnet 5 docs, kent-tokyo)
3. **Name the defaults to avoid, with replacements.** Ban Inter/Roboto/Arial/system fonts, purple gradients,
   SaaS card grids, eyebrow labels, middle-dot meta strings; supply alternative faces. Re-ban when it drifts to the
   next default (Space Grotesk). (Anthropic blog, cookbook, skill)
4. **Write a design plan first and review it against the brief before any code.** Named colours, type roles, a
   layout concept, then ask "what here is a generic default?" and revise. (frontend-design skill)
5. **Open from the most characteristic thing in the subject's world,** not a big-number / small-label / gradient hero.
   For GLucak that is his artwork, his rooms, his words. (frontend-design skill)
6. **Use extreme type contrast.** Weights 100-200 vs 800-900, size jumps of 3x or more, one distinctive face used
   decisively, a clear high-contrast pairing. (Anthropic blog, cookbook)
7. **Commit to dominant colour with a sharp accent,** all as CSS variables; layer backgrounds (gradient, pattern,
   texture) instead of flat fills. (Anthropic blog)
8. **One orchestrated moment of motion** (a staggered page-load reveal) beats scattered micro-effects; keep motion
   that answers a user action; respect reduced-motion. (Anthropic blog, skill)
9. **Run a separate evaluator pass on screenshots.** A different agent opens the live page, takes viewport shots at
   375 and desktop, scores design quality / originality / craft / function, writes a critique; the builder
   fixes or pivots. Agents grade their own work too kindly. (Anthropic harness post)
10. **Score on principles with a few worked examples,** not "is it beautiful". Weight originality and design quality
    above craft so the model takes risks. Write 2-3 scored examples of "generic" vs "ours" for the evaluator.
    (Anthropic harness post)
11. **Put tokens and rules in a DESIGN.md that CLAUDE.md imports,** and let the coder verify values with
    `getComputedStyle` rather than by eye. (kent-tokyo + comment)
12. **Limit each fix round to 2-3 visible changes with a scope fence,** and on regressions ask for a before/after
    diff list *before* fixing. (kent-tokyo)
13. **Screenshot at viewport size, not full page** (full-page shots are downscaled and hide spacing errors); give the
    model a crop/zoom step for fine detail. (DEV comment, Anthropic docs)
14. **Feed real references: a named existing site or a DESIGN.md from a real brand** as a style anchor, then say
    what to keep and what to change. Never "make it like X" without saying which attributes. (kent-tokyo, awesome-design-md)
15. **Specify every state up front:** hover, focus, disabled, loading, error, empty, plus dark mode from the start.
    Anything unspecified gets the generic default. (kent-tokyo, Tiwari checklist)

## 4. What is genuinely new versus what the repo already does

The repo already has real photography and artwork as the anchor, locked fonts, per-era palettes
(DESIGN.md / art-system.md), and a "10 improvements" list with screenshots from our own builds. Skimmed headings only.

New, not yet in our process as far as the headings show:
- **Four-directions-then-pick step** (#1) and a **named-defaults ban list** (#3) in the designer brief.
- **A separate evaluator agent** with scored criteria and few-shot examples (#9, #10); we review by shots but with
  no fixed rubric or independent grader.
- **Computed-style check against DESIGN.md tokens** (#11) as a coder test.
- **Slop-tell checklist for copy and states** (#15; Tiwari) for the copywriter.
- **2-3 changes per round plus scope fences** (#12) for review loops.

Already covered: reference-led design, real client photos, motion restraint, small mobile details (design-round-2.md
sections 4-5), so no change needed there.

## 5. How the team should brief the designer and coder differently

**Designer (glucak-designer)**
- Start every new page or era with 4 directions (hex, hex, face, reason, plus which Gabe artwork it comes from); the
  boss or owner picks; only then prototype.
- Include a "never" list in the brief: Inter/Roboto/Arial/system fonts, Space Grotesk, purple gradients,
  cream+terracotta, near-black+acid-green, SaaS three-card grids, tracked-out eyebrow labels, middle-dot meta lines.
  Name the replacement for each.
- Give a design plan the designer must self-review for "generic default" before drawing.
- Call for one orchestrated motion moment per page, not many.

**Coder (glucak-coder)**
- Treat DESIGN.md tokens as the contract: CSS variables only, no hard-coded hex; add a test that compares
  `getComputedStyle` to the tokens.
- Build one component at a time; max 2-3 visible changes per round; always state what must not change.
- Define all states (hover, focus, loading, error, empty) and dark mode in the same pass.

**Reviewer / boss**
- Add an evaluator step: separate agent, Playwright or Chrome, shots at 375 and desktop (viewport-size), scores
  design quality, originality, craft, function on 1-5 with a written critique and 2-3 scored examples. Originality
  and design quality weigh double. The builder then refines or pivots.
- Do not let the builder grade itself.

**Copywriter**
- Run the Tiwari tells as a pre-ship check: uniform sentence length, generic closers, throat-clearing, filler
  adverbs. Keep Gabe's own words, which are the best anti-slop material.

Caveats: models re-converge even with bans (Anthropic says so); "museum quality" wording measurably pushes outputs
toward one look, so avoid stock superlatives in prompts; the third-party posts are single-author blogs, not tests.

## 6. Downloaded files

None. No public copy of Charles Liu's "unslop" or "accent" skills exists; nothing was downloaded, installed or run.
Pages read by fetch only; raw tool output of the Anthropic prompting doc is cached at
`C:\Users\alexm\.claude\projects\C--Users-alexm\9d845ea6-3a1c-426d-b0be-7355c69f5f27\tool-results\toolu_015pKi5uZqTjTJ2BHbVxVZUf.txt`
(harness cache, not a deliverable).
