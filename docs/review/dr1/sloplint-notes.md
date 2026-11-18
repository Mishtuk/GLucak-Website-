# hallmark sloplint: standing triage for GLucak (DR1, 2026-11-17)

Run: `node .work/hallmark/sloplint.mjs dist --genre atmospheric --scope page` (static mode, `.work/` is git-excluded; see
`docs/research/RESOURCES.md`). Ignore these on future runs; triage only NEW rule hits.
- **House style, not ours:** 20 (Hallmark stamp in CSS), 24a / 24b (its spacing scale), 41 (dark surface sets no text colour: inherited), 58.
- **False positives here:** 34 (body uses `overflow-x: clip`, global.css:96; `hidden` only in the `@supports not` fallback ~1170; header
  sticks), 48 (`#000` inside a mask is a mask value), 62 (`.fade-wait` is added by app.js:49 to below-fold headings only; visible without JS, D47).
- **Covered by rulings:** 67 `.tracks-h` / section word (D79, D87), Play square (D95), Book GLucak / LISTEN ending (D91).
- **Fixed in DR1:** 50 at global.css:503 (`.identity-state` -> `auto minmax(0, 1fr)`).
