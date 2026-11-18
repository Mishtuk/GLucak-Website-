# Resources the owner has shared (read before design or research work)

One list of every outside resource the owner pointed us to, what it's for, and how we may use it. Agents: check here
first, then the research file named in each row for the details. Add new resources here (dated) when the owner shares them.

## Design references
| Resource | Shared | Use it for | Our verdict / limits | Details |
|---|---|---|---|---|
| Wix website templates, Music category: https://www.wix.com/website/templates | 2026-11-02 | Structure and polish of music sites | Owner's main template reference. Borrow patterns, never copy a template | `wix-templates.md`, `templates-round4-2026-11-17.md` |
| Manafest's website | 2026-11-02 (Gabe likes it) | Artist-site feel | Reference only, no branding copied | `references.md` |
| Thousand Foot Krutch's embedded Spotify playlist | 2026-11-02 (Gabe) | Spotify player near the top of Home | Built (D19) | `references.md` |
| Riverside site we built: `V:\RiversideWebsite`, https://mishtuk.github.io/Riverside-Website/ | 2026-11-02 (Gabe likes the layout) | Layout + stack (ours, reuse freely) | Stack source (D2) | `riverside-layout.md` |
| Puck Live's site | 2026-11-02 (Gabe dislikes it) | Anti-reference: hard to find, out of date | Hard rule 3 | `CONTEXT.md` |
| Oversight design supply: https://supply.madebyoversight.com (192+ human-made site references) and /sections (70 interactive sections). Via Reddit r/ClaudeDesign: https://www.reddit.com/r/ClaudeDesign/comments/1xhv21i/192_website_designs_to_use_as_references_in_claude/ | 2026-11-17 | Visual references to hand the designer ("give Claude a reference and say what you like about it") | Free sections need an account: owner decided we don't sign up. Paid $15 / $39 a month, $499 lifetime. Licence allows client projects, no redistribution. Rebuild in our own CSS, never paste their code. Fits: Vinyl (musician hero), Jewelcase (CD flip for IDENTITY), Collage (gallery). Reddit itself is blocked for our fetchers: ask the owner to paste a thread | `oversight-supply-2026-11-17.md` |
| shadcn/ui: https://ui.shadcn.com/ | 2026-11-17 | Behaviour + accessibility patterns: Sheet (phone menu), Dialog / Alert Dialog (admin delete), Tabs, Field / Input, Toast, Table | Reference only. React + Tailwind + Radix don't fit our Astro + plain CSS + CSP `script-src 'self'`. Don't run `npx shadcn init` | `design-skills-2026-11-17.md` |

## Design skills and AI-design workflow
| Resource | Shared | Use it for | Our verdict / limits | Details |
|---|---|---|---|---|
| impeccable: https://github.com/pbakaus/impeccable (Apache-2.0) | 2026-11-17 | Scored design critique + audit + craft floor | **Installed as text only:** project skill `.claude/skills/design-review/` (its 4 reference files, unchanged, plus our overrides). Not installed: its launcher downloads and runs a compiled binary each session, a hook runs it on every edit, live mode can run agents with permission bypass, and it fetches remote directions | `design-skills-2026-11-17.md` |
| hallmark: https://github.com/nutlope/hallmark (MIT) | 2026-11-17 | Anti-slop linter (`sloplint.mjs`) + reviewer verdict | Linter only, static mode, run from a copy in `.work/hallmark/` (git-excluded) on `dist/`. Its static mode uses only node:fs and writes to `./.hallmark/`. Not used: themes, imagegen (Together AI key + generated images break the real-photos rule), Wikimedia stock photos, the CSS "Hallmark" stamp, its hook | `design-skills-2026-11-17.md` |
| Owner's workflow tip (2026-11-17) | 2026-11-17 | "Opus designs well on its own. Give it screenshots of the design you want, have it screenshot desktop + mobile after every UI change, then review with the skills; it self-improves." | Standard loop: designer (Opus) spec -> coder -> shots at 390x844 + 1280x800, motion on + reduced -> `design-review` skill (+ sloplint) by a separate reviewer -> boss gate, max 2 fix rounds | `DESIGN.md` 27, `docs/review/dr1/` |
| Charles Liu, @charles.unemployed (Instagram) | 2026-11-10 | "Removing AI slop" reels: colour, type, motion, CSS craft | Round 1 (17 reels) + round 2 (8 reels, Whisper transcripts). Rules: 2 colours + 1 accent of the opposite temperature, only on what's sold; font skip list; curly quotes; dvh, oklch, text-box trim. His process: turn each tip set into an agent skill | `ig-design-tips.md`, `ig-design-tips-round2-2026-11-17.md`, `ai-design-workflow.md` |
| @game_feel_prompts (Instagram) | 2026-11-10 | Game-feel effect packs | Mostly glow / shake / burst: against hard rule 1. Principle kept: "same action, six variants, pick one" | `ig-design-tips.md` |
| Owner's 4 security / design reels + their channels | 2026-11-11 | Security habits | Checked against our code | `ig-security-reels.md` |
| Taste skill (design-taste-frontend) and frontend-design | installed | Anti-slop design guidance | In `designer.md` | user-level skills |

## GitHub repos the owner shared (2026-11-18)
Details and safety reads: `design-repos-a-2026-11-18.md` (1-4) and `design-repos-b-2026-11-18.md` (5-9). Nothing installed unless noted.
| Repo | Use it for | Verdict / limits |
|---|---|---|
| https://github.com/nateherkai/scroll-craft | `taste.md` refuse list + motion rules (transform / opacity only, hover only on `(hover: hover) and (pointer: fine)`), phone hero step-down | Text rules only. The plugin's scroll-scrub / pinned engine is rejected (hard rule 1). `scripts/kie.mjs` calls a paid API with a key |
| https://github.com/singhharsh1708/scrollcraft | nothing | Rejected: canvas frame-scrub + scroll audio; writes Google Fonts links (breaks CSP) |
| https://github.com/VoltAgent/awesome-claude-design | the 9-section DESIGN.md template | Reference list only |
| https://github.com/nishaj0/claude-for-everything | a list; led to jakubkrehel **better-accessibility** (motion gate, WCAG 2.2.2 pause rule, `scroll-padding-top` under the sticky header) | List has no licence. better-accessibility is the only install candidate (read all its .md first). Skip modern-web-guidance (`npx @latest` each use), unslop, oil-ui, ui-ux-pro-max (scripts) |
| https://github.com/pbakaus/impeccable | scored critique / audit / craft floor | Vendored as text: `.claude/skills/design-review/` |
| https://github.com/bitwize-music-studio/claude-ai-music-skills | CC0 text: platform caption limits, copy formulas, voice-checker prose classes 8-11 | Plugin rejected: Suno AI-music pipeline, PostToolUse hooks, MCP server |
| https://github.com/voltagent/awesome-design-md (local copy in the user's `.claude\design-md\`) | DESIGN.md structure: front-matter token table, Do's / Don'ts, Iteration guide, Known gaps. Closest to us: nike, spotify, ferrari, spacex, theverge | Structure, not their visuals |
| https://github.com/xjli360/awesome-design-md-ecommerce | shop card anatomy: ecm-records (catalog line, square corners), dr-strange-records (format / NEW chips), hume-band (spec table) | Reference only; most files "inspiration_only"; its Python scripts not run |
| https://github.com/withastro/astro | upgrade 7.4.5 -> 7.4.12 (needs Node >= 22.23.4; check the host) | Recommended. Reject ClientRouter (our native view transition + reduced motion already), sitemap integration; `astro:assets`, `security.csp` later |

## How to get at them
- **Instagram reels:** read-only. `python -m yt_dlp -f b -o "%(id)s.%(ext)s" https://www.instagram.com/reel/<ID>/` works without login
  (the profile listing doesn't: get IDs in Chrome). Transcribe with faster-whisper on CPU (`medium.en`; CUDA libs are missing). Feed
  audio as a numpy array from ffmpeg (its PyAV decode is broken here). Keep the videos only in `.work/` and delete them after.
- **GitHub repos:** `gh api repos/<owner>/<repo>/git/trees/HEAD?recursive=1` and
  `gh api -H "Accept: application/vnd.github.raw" repos/<o>/<r>/contents/<path>`. Read every file before anything runs or installs.
- **Never:** log in, sign up, like, follow, comment or buy. Ask the owner before anything that costs money, publishes, or creates an account.
