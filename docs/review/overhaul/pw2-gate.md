# PW2 gate (Desktop main session, boss role, 2026-11-18)

**Verdict: pass.** Commits bc65ceb..276800e + fixes cf73fba. Review `pw2-review.md`: PASS WITH FIXES (34/40, 16/20, no P0).
- P1-1 height: with the SHIPPED shows (empty DATA_DIR) Home 390x660 was 3980; trims (ticket/sheet padding, band bottoms on phones)
  bring it to **3916** (cap 3920, D118). The stagger is intact (sheet `.work/pw2/sheet.png`).
- P1-2 overflow: IDENTITY in the Join column at 900-1039 now stacks by media query (the container query could not style its own
  container); the About tape stays inside the viewport on phones. Sweep 320-1600 every 10px: 137 widths, no horizontal overflow.
- P2s fixed: 768 About sheet (heading across, 4:5 belt print under it), 768 Join `align-items: start`, Gig Poster Shows ground
  10% text mix so the angled edge reads (11.9:1 text, 4.9:1 muted). P3: Colours pill sits left on phones (owner-only tool).
- Coder deviations accepted: Home-only scoping (`html[data-home]` / `.v2-push`) until PW3; the 72rem `.shows-grid` rule moves to PW3;
  no hover outline on the IDENTITY cover (D51).
- `npm test` 327/327.
