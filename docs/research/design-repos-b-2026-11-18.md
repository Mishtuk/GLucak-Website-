# Design repos B: music skills, DESIGN.md sets, e-commerce DESIGN.md, Astro (2026-11-18, researcher)

Read-only pass. Nothing installed, cloned into the repo, built or run. Remote files read through `gh api`; copies of the
skills are only in the scratchpad. Nothing was blocked. Not read in full (said where it matters below).

## 1. bitwize-music-studio/claude-ai-music-skills
- **License** CC0-1.0 (public domain). **Stars** 673. **Last commit** 2026-11-15. Plugin v0.104.1.
- **What it is:** a workflow for making albums with **Suno (AI music generation)**: 67 SKILL.md files (lyrics, Suno prompts, mixing,
  mastering, promo video, release). Read the description of all 67 and the body of promo-writer, promo-reviewer, voice-checker,
  release-kit and release-director. **No EPK, bio, press-kit, show-listing or artist-site skill exists.** Nothing touches a website.
- **Mismatch:** Gabe writes, produces and sings everything himself, faith-based and real-life. Most of the repo (generate, suno-*,
  lyric-writer, album-art-director that writes AI art prompts, sound-effects) is AI generation: against "real photos only" and his story.
- **Safety read**
  - `hooks/hooks.json` L1-17: PostToolUse on every Write/Edit runs `python3 hooks/validate_track.py` and `check_version_sync.py`.
    **Flag: a hook that runs on every edit** (same pattern we refused in impeccable). Those two .py files were not read.
  - `.mcp.json` L1-7 + `servers/bitwize-music-server/mcp-launch` L1-14: starts a local Python MCP server (`run.py`) from
    `~/.bitwize-music/venv`. About 45 handler files, **not audited**. `skills/setup/SKILL.md` installs Python packages.
  - Network: `skills/import-audio/SKILL.md` L171 and `skills/listen/SKILL.md` L126 curl a Suno download link; `skills/generate/SKILL.md`
    L242 curl-uploads a MIDI file to a signed URL; `cloud-uploader` pushes to R2 / S3 with the user's keys. Needs Suno and cloud accounts.
  - `release-director/SKILL.md` L318, L335 appends a "Made with Claude AI Music Skills" tweet link: wrong for Gabe.
  - `hooks/install.sh` L1-33 only copies a pre-commit hook into `.git/hooks`.
- **Fit for GLucak:** no page or element can use the plugin. Text-only reusables (CC0, so copyable): `skills/promo-reviewer/platform-rules.md`
  (char limits and "first 125 chars visible" per platform: for Shows / release share captions), `skills/promo-writer/copy-formulas.md`
  (hooks, CTAs), `skills/voice-checker/SKILL.md` prose Classes 8-11 (a checklist that flags AI-sounding prose: use it on `docs/copy/*`
  so site text stays in Gabe's voice), `skills/release-kit/SKILL.md` (list of fields a distributor form asks: a checklist for the Music page data).
- **Verdict: reject the plugin, take three text files as reference.**

## 2. VoltAgent/awesome-design-md
- **License** MIT. **Stars** 128,012. **Last commit** 2026-10-28. Remote has 84 DESIGN.md files, the local copy
  (`C:\Users\alexm\.claude\design-md\`) 74. **New since the local copy:** 1win, aljazeera, dji, jobright, mercury, mydealz, nerdwallet,
  oracle, oura, sap. None is a music, poster or dark-bold-type site. Skip them.
- **Safety read:** the content is markdown/YAML design notes copied from the local files (read as data, nothing executed). Local dirs hold only DESIGN.md + README.md.
  I did not read the remote repo's own scripts: it is a list repo, nothing to install. Risk is low; the only real risk is an agent obeying
  text inside a DESIGN.md, so treat them as data.
- **Structure worth borrowing (seen in nike, ferrari, spacex, x.ai, wired: the newer, 360-575 line format):**
  1. YAML front matter (`version`, `name`, `description`, then `colors:`, `typography:`, `rounded:`, `spacing:`, `components:`) where
     components reference tokens as `{colors.canvas}`. An agent reads every value without scanning 3,000 lines.
  2. Fixed order: Overview, Colors (Brand/Surface/Text/Semantic), Typography (Hierarchy table, Principles, **Note on Font Substitutes**), Layout
     (spacing, grid, whitespace), Elevation, Shapes, Components, **Do's and Don'ts**, Responsive (breakpoints, touch targets, collapsing, image behaviour),
     **Iteration Guide**, **Known Gaps**.
  3. Don'ts are one-liners with the reason, e.g. ferrari L485-487 "Don't use rounded or pill CTAs: 0px corners are the brand button",
     "Don't bold display copy".
  Our DESIGN.md is 3,045 lines in round-by-round sections (L1 to L1457+ and on). It has the content but no token table, no one-page Do/Don't, no Known Gaps.
- **Closest to a dark, poster-like, bold-type site (borrow):**
  | Site | Lines | Borrow |
  |---|---|---|
  | **nike** | 575 | Photography-first with towering uppercase condensed display type over campaign images; "Signature Components", "Photography Geometry", "Image Behavior" sections |
  | **ferrari** | 531 | Near-black `#181818` canvas, white display, one accent, 0px corners, "hairlines" token group (our `--line`), cinematic photo bands |
  | **spacex** | 363 | Pure black, full-bleed hero photography, uppercase small labels over photos, tersest of the set |
  | **spotify** | 246 | Dark surface scale and the older 9-section format with Buttons / Cards / Inputs component specs; Gabe's audience lives here |
  | **theverge** | 339 | Neon "hazard" accent on black with poster headlines and a gradient-system section (copy the section idea, never animate it) |
  Also seen but weaker for us: x.ai, runwayml (dark, AI-product tone).
- **Verdict: use the structure (add a front-matter token block + Do/Don't + Iteration Guide + Known Gaps), not the visuals.**

## 3. xjli360/awesome-design-md-ecommerce
- **License** MIT. **Stars** 27. **Last commit** 2026-09-30. **2,733** brand folders, many with `SOURCE.json`.
- **Quality:** most files say `evidence_status: "historical_unverified"`, `usage_scope: "inspiration_only"`, `layout_status: "proposed_not_measured"`
  (ecm-records L1-9). Only a few dozen "measured components" (RECOMMENDED.md), and those are home / beauty / kitchen brands, none music or merch.
  The repo itself says no entry is a whole-site reconstruction. Treat as loose reference.
- **Safety read:** `.github/workflows/validate.yml` L1-19 only installs `requirements.txt` (PyYAML, tinycss2, coloraide, Pillow; pinned ranges)
  and runs unit tests. `scripts/` holds 25 Python files incl. `capture_rendered.py`, `extract_site.py` (headless browser capture) and
  `worker_claude.py` (spawns Claude to write entries): **not read, never run**. No keys seen in the files read. We never run the repo; DESIGN.md files are data.
- **Picks for the hidden shop** (`src/pages/shop/index.astro`, `src/lib/products.js`, DESIGN.md section 14):
  1. **ecm-records**: `product-card` with `rounded: none`, no price decoration, title + subtitle + **catalog line** (L221-239). Matches our 2px / no-shadow rule: use the catalog line for "Tee, S-XL" or an edition number.
  2. **dr-strange-records**: `product-card` with a 1:1 `product-card-image`, title, artist line, price (L266-285), plus **format badge tokens** (`format-lp`, `format-cd`) and a `badge-new`. Use for "CD", "Tee", "Sticker" chips and a NEW chip on IDENTITY items.
  3. **hume-band**: band-merch card plus a "Spec table" component (sizes, material) for the product detail block (14e).
  Empty states and "sold out" were **not found** in the three files read (only `Known Gaps` lists). Keep our own (14f).
- **Verdict: reference only.** Take card anatomy, skip the colors (blue and violet palettes do not match our eras).

## 4. withastro/astro
- **License** MIT in the repo; GitHub's API reports `NOASSERTION` (LICENSE not re-read). **Stars** 64,025. **Last commit** 2026-11-18 (today).
- **Versions:** we ask `^7.3.8`; `node_modules` has **7.4.5**; latest release **astro@7.4.12** (2026-11-13). No `astro@8` release found. Node requirement
  since 7.4.2 (`cf27e70`): **`>=22.23.4`** (our package.json says `>=22.13`, local Node is v24.19.0).
- **Changes since 7.3.8 (CHANGELOG lines 3-482):** 7.4.0 adds `astro build --timings`, `experimental.redirectPage`, fonts provider
  `getFontProperties`, `image.service.build/runtime`. The rest is patches. Relevant fixes: 7.4.3 CSP hashes not added for empty external
  scripts/styles, and `Astro.csp` hashes were missing from the meta in static builds; 7.4.11 stricter `security.allowedDomains` host
  checks (SSR only, we are static); 7.4.12 lower memory. Nothing breaking.
- **Upgrade verdict: safe and recommended**: same major, patch/minor only, no config change needed. Do bump `engines.node` and
  make sure the host runs Node >= 22.23.4 (security release). Run `npm test` after (it builds first).
- **Feature fit:**
  | Feature | Verdict |
  |---|---|
  | `astro:assets` / `<Picture>` | Not used now: our images come from `prototype/tools/resize.mjs` (sharp). Output is same-origin, so CSP-safe. Use only for the future Photos gallery if hand-made srcsets get tedious. Responsive-images was not in the 7.3-7.4 notes; check docs first |
  | Fonts API | Skip. Fonts are already self-hosted woff2 (`global.css` L4-11, `font-src 'self'`) |
  | ClientRouter / view transitions | **Reject.** Swaps pages with JS and re-runs scripts; our native `@view-transition { navigation: auto }` (`global.css` L876) is already off under reduced motion (L883). Would add a second motion path that our Motion switch must also reach |
  | Prefetch | Already covered by `public/speculation-rules.json`. Skip the integration |
  | `security.csp` | **Later, maybe.** Emits hashes so `style-src 'unsafe-inline'` (`server.js` L45) could go. `build.inlineStylesheets: 'always'` means many per-page hashes; the header is set in `server.js`, so test it with the CSP tests first. Effort M, not urgent |
  | `@astrojs/sitemap` 3.7.5 | Skip: `src/pages/sitemap.xml.ts` already does it with no dependency |
  | `--timings` | Handy once if a build is slow. Free after the upgrade |
- **Safety read:** official org, npm provenance not checked; the upgrade adds no new dependency of ours. Astro telemetry is on by default: `npx astro telemetry disable` if the owner wants it off.

## Use now (max 6)
1. **Upgrade astro to 7.4.12 and set `engines.node` to `>=22.23.4`.** Source: `packages/astro/CHANGELOG.md` 7.4.2-7.4.12. `package.json`. **S**
2. **Add a "Do's and Don'ts" + "Iteration Guide" + "Known Gaps" block** at the top of `DESIGN.md`, one page, pulled from the existing rules (banned list L456-458, "Accent as small text is banned", no cards). Source: ferrari + nike DESIGN.md. **S**
3. **Add a front-matter token table** (colors, type, space, radius, components by `{token}` reference) to `DESIGN.md`, generated from `src/eras/*.json` and the `:root` block. Source: nike / spotify DESIGN.md format. **M**
4. **Shop product card anatomy:** catalog line + format chip + NEW chip, square corners. Source: ecm-records and dr-strange-records `product-card` blocks. Goes into `DESIGN.md` 14c and `src/pages/shop/index.astro`. **S**
5. **Prose check for site copy:** run voice-checker's prose classes (8-11) as a read-only checklist on `docs/copy/*` before Gabe sees drafts. Source: `skills/voice-checker/SKILL.md` (CC0). Goes in the copywriter agent's brief. **S**
6. **Social caption limits table** (first 125 chars on Instagram, 280 on X) for the share text and OG descriptions. Source: `skills/promo-reviewer/platform-rules.md` (CC0). Goes in `docs/copy/`. **S**

## Reference only
- nike, ferrari, spacex, spotify, theverge DESIGN.md (structure and photo-band ideas); ecm-records / dr-strange-records / hume-band (shop card).
- `astro:assets` `<Picture>` for the Photos gallery; Astro `security.csp` to drop `'unsafe-inline'` from `style-src`.
- release-kit field list as a Music-page data checklist.

## Reject (why)
- **bitwize plugin / MCP server:** Suno AI-generation workflow; edit hook and local Python server; AI art against "real photos only"; adds a promo tweet that credits Claude / the repo.
- **Astro ClientRouter:** JS page swaps duplicate our native transition and complicate reduced motion / the Motion switch.
- **@astrojs/sitemap, Astro prefetch, Fonts API:** we already do each of these.
- **ecommerce repo scripts and its color palettes:** unverified evidence, capture tooling not audited; visuals do not match.

## Install / upgrade plan
- **Recommended** (owner OK first; the coder runs it, then `npm test`):
  ```
  cd V:\GLucakWebsite
  npm install astro@^7.4.12
  node -v            # must be >= 22.23.4 here and on the host
  ```
  then set `"engines": { "node": ">=22.23.4" }` in `package.json`. Optional one-off: `npx astro build --timings`.
- **Not recommended:** `claude plugin install bitwize-music` (or its marketplace entry); `npm i @astrojs/sitemap`; adding `<ClientRouter />`;
  cloning either design repo (the local `C:\Users\alexm\.claude\design-md\` copy plus `gh api` reads is enough).
- **Not needed:** nothing else. To refresh the local DESIGN.md copy, fetch the 10 new files by `gh api` only if wanted (none fit).
