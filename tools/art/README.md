# Art mockups (research round 2, docs/research/art-system.md)

Proposals only, not used by the site. Real photos, our two fonts, the mark; no AI.
- `python -I mkfonts.py` (run here, needs fontTools) makes `fonts/*.ttf` from the site's woff2 files.
- `node m1-singles.cjs`, `m2-poster.cjs`, `m3-social.cjs`, `m4-merch.cjs` write PNGs to `art/` and the webp mockups
  in `docs/research/shots/round2/art-*.webp`. `lib.cjs` holds the shared halftone / grain / text helpers
  (`textpath.py` turns text into SVG paths so sharp renders our fonts exactly).
