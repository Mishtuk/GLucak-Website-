# PW1 gate (Desktop main session, boss role, 2026-11-18)

**Verdict: pass.** Commits 80af514..09c941a plus the gate fix. Review: `pw1-review.md` (PASS, 34/40, 17/20, no P0/P1).

- Boss look: `.work/pw1/sheet.png` (6 palettes, Home 1280 top + 390 first screen). All six read as finished; the Logo plate is
  invisible on dark palettes and a dark chip on Gig Poster; Listen buttons and the phone bar hold in each.
- **Gate fixes:** P2-1 the IDENTITY word overflowed 2-3px at 900-920 -> one type step smaller in 900-959 (re-probed 900/905/912/920
  on Home/About/Shows: no horizontal overflow). P2-2 the Colours pill covered body text from 700px -> moved bottom-right with
  its sheet opening right-aligned (About/Shows 1280 re-shot, `.work/pw1g/`).
- Coder deviation accepted: the nav/Menu switch moves from 42rem to 48rem (the display-face nav needs ~746px).
- Left (P3): section tab a little cramped under the ledge; Gig Poster phone hero print is mostly texture (same crop as before).
