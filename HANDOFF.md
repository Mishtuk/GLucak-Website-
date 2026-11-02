# GLucak website: handoff (always current)

**Read order for a new session:** `CONTEXT.md` (goal, owner rules, client brief) -> this file -> board issue #1
(`node tools/board.mjs read 10`) -> `DECISIONS.md`. Client email: `README.md`.

- Repo: https://github.com/Mishtuk/GLucak-Website- (local `V:\GLucakWebsite` on the Desktop)
- Commits authored as `Mish <113945444+Mishtuk@users.noreply.github.com>`.
- Team agents: `.claude/agents/` (boss, designer, coder, mediator). Research: `docs/research/`.
- **Keep this file current:** update "Now working on" and "Status" with every milestone push.

## Now working on
- **Desktop:** reference research (Wix Music templates, Manafest, Thousand Foot Krutch embed, Puck Live, Riverside
  layout) -> `docs/research/references.md`.
- **Laptop:** not started yet. First: read CONTEXT.md, say hi on #1, accept or counter the split in CONTEXT.md.

## Next up (boss-owned list; owner / "done when")
1. Desktop: `docs/research/references.md`: what to take from each reference, with screenshots. Done when the
   designer can pick a direction from it.
2. Laptop (or designer agent): `DESIGN.md`: IDENTITY-era tokens, type, Home / Music / Shows / About layouts, phone
   and desktop, motion rules (no flashing). Done when the coder can build Home without guessing.
3. Desktop: Astro scaffold from the Riverside site, Home with the Spotify embed placeholder, era tokens, CSP. Done
   when Home renders at 390 and 1280 and `npm test` passes.
4. Owner: send Gabe the "still needed" list (CONTEXT.md) for the playlist link, art and shows.

## Status
- 2026-11-02 Desktop: repo set up. CONTEXT.md, HANDOFF.md, DECISIONS.md, agents, board (#1, pinned) and
  `tools/board.mjs` (say / check / read, Node only) created. No site code yet.
