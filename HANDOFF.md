# GLucak website: handoff (always current)

**Read order for a new session:** `CONTEXT.md` (goal, owner rules, client brief) -> this file -> board issue #1
(`node tools/board.mjs read 10`) -> `DECISIONS.md`. Client email: `README.md`.

- Repo: https://github.com/Mishtuk/GLucak-Website- (local `V:\GLucakWebsite` on the Desktop)
- Commits authored as `Mish <113945444+Mishtuk@users.noreply.github.com>`.
- Team agents: `.claude/agents/` (boss, designer, coder, mediator, researcher, copywriter). Research: `docs/research/`.
- **Keep this file current:** update "Now working on" and "Status" with every milestone push.

## Now working on
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
  Next: Gabe's edit screen (reuse Riverside admin auth), daily rebuild for release-day flips. Claims: `server.js`, `src/lib/`, `src/pages/edit/` + `public/js/edit.js` + `test/edit*.test.js` (edit screen, coder agent).
- **Laptop (2026-11-05):** boss agent runs the round (plans, briefs the designer / copywriter, reviews). Claimed:
  `prototype/`, `DESIGN.md`, `docs/copy/`. Doing: real Spotify embed in the prototype (done, in review), heroes A/B +
  duotone on Gabe's real photos -> shots for the owner's pick, type lock with Logo D. Then the copywriter drafts
  `docs/copy/home.md` once `docs/research/social-content.md` lands.
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
  doesn't reflow as the font loads. Note Android vs iPhone (Safari is the big unknown).
- For Gabe: "Epilepsy survivor" wording (Instagram adds "Healed by Christ since 2009"); booking email; the current show
  list with cities (he re-posts schedules often; his 11-05 update wasn't readable); the 10 questions in social-content.md.
  IDENTITY date is settled: his own post says Aug 13, 2027.

## Status
- 2026-11-02 Desktop: **foundation (D16)**: Astro ^7 scaffold, placeholder pages / music / shows / about / privacy,
  `server.js` (static + CSP / security headers + per-visit shows injection at `<!--gl:shows-->`; Astro strips plain
  comments, so pages emit it via a literal `<Fragment set:html>`), `src/lib/shows.js` (validate, NY-day split,
  escaped render, Tickets / Details / no button), `src/eras/placeholder.json` + contrast test. Optional `with` line on shows (Laptop ask). Shows markup ported to DESIGN.md (poster for the first full show, rows, empty state with Follow, "Played", All shows link on Home; Request a show waits for the booking email). Home prototype boss-approved (D18). `npm test` 16/16.
  Kit sign-up plan: server-side via API v4 (free plan has API access); double opt-in behaviour to test in phase 4.
  Run: `npm run build && node server.js` (PORT, default 8080).
- 2026-11-02 Desktop: repo set up. CONTEXT.md, HANDOFF.md, DECISIONS.md, agents, board (#1, pinned) and
  `tools/board.mjs` (say / check / read, Node only) created. No site code yet.
