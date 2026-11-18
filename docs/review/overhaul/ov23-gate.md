# OV2 + OV3 boss gate (DESIGN 28a-28h, 28j, 28k; D98-D114)
Boss, 2026-11-18. Range 117607d..717fd02 (a72e772 is .claude/ only: agents + design-review reference, OK). `npm test` 261/261.

**Verdict: APPROVED.** No gate fixes needed. Review `ov23-review.md` PASS WITH FIXES 33/40; every P1-P3 landed:
- P1 share face: a0cb60b resets `background: none; border: 0` (`.share-btn`), `background: none; padding: 0` (stamp). Checked
  myself at 768 (/ and /shows/, fresh build, port 8099): stamp "Share" reads ink-on-dark beside "Add to calendar", row glyph
  transparent, 48x48, unhidden by JS. Fixed shots 390 / 1280 (`.work/ov23-after/fixed/`): stamps and row glyphs clear.
- P1 row overlap: row share glyph sits beside the calendar glyph (`@container (width >= 17rem)`, margin-left 20px); "NOV 19"
  unclipped at 390 / 768 / 1280.
- Focus: 3px solid outline on stamp and row button (`:focus` verified by CDP). P3, no action: the row ring draws round the 48px hit
  box, so on keyboard focus it crosses the date's baseline; same as `.cal-btn` (D55), ring only, nothing hidden.
- P2 rule 50 (759d77f), P3 sloplint notes + hidden/aria-label test (53c1be0): landed.
- **D114 accepted.** Option A was tried and saved 6px only; the +31 is the owner-asked 28j copy, 3859 <= 3861, still under 6
  screens, reversible. No further raises: the next Home addition must pay for itself in height.
- Injection spot-check PASS: `data-share` is `/shows/#s-<showId>` (date + slug `[a-z0-9-]` + hash), resolved against
  `location.origin`; title/text/aria via `esc(curly())`; messages by `textContent`. Cost: string, trimmed, C0/C1/LS/PS refused,
  <= 40, rendered via `esc`; no SQL in the store.
- Scope: fixes touch only global.css (share + .idn), shows.test.js, DECISIONS.md, sloplint notes. 0 animations, no h-scroll at 768.
Push OK (owner/lead pushes; not pushed by the boss).
