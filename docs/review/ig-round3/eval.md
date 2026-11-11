# Round IG3 outside evaluation (glucak-advisor, 2026-11-11, repo at 2795c0f)

Own scratch build, `node server.js` PORT 8865, empty DATA_DIR; CDP shots 390x660 / 1280x800 of /, /music/, /shows/, /about/
(+ About 900, Home footer at 390, 3x ledge crops); Spotify / YouTube blocked with `--host-resolver-rules` (D85).

## Scores (calibration IG2 = 4.0)
- **Design quality 4 (x2).** Screen one slightly cleaner (chip gone from the hero foot). About 900 / 1280 composed. Not 5: Play
  under the bar on screen one (held, D81); hero otherwise as in IG.
- **Originality 4 (x2).** Arrowed setlist is the site's own idea; the ledge is good restraint. Not 5: all-caps headings, heavy
  white band rules, outlined ghost buttons; section word still 17px body text.
- **Craft 4.** Arrows in the rules' 4px stroke, ring wraps the 72px row, ledge clean at 3x, footer chip fits 320-1280, 404
  blank ledge fine. Docked: footer "LISTEN. SHOWS. JOIN." (D77) and two outlined objects side by side in the footer.
- **Function 4.** Setlist rows read as links at rest. Play not on the first phone screen.

Weighted **4.0**. Three small, correct changes; the score did not move.

## Hard rule 1: PASS
Home `getAnimations()` = 1 (the glow) motion on, 0 reduced; other pages 0; hover adds none. Home 390x660: 3553 motion on, 3601
reduced; 320 = 3724; 1280 = 4277.

## The three changes
- **Ledge (21a): works.** Solid 4px trapezoid under the word on the rule; at 1x reads as a pedestal / thick underline; fixes the
  floating caption; echoes the nav's current-page underline at 1280.
- **Setlist arrows (21b): works.** 486x72 targets, diagonal arrow on Patreon (`_blank`, link text says it opens a new tab),
  ring wraps the row, no animation.
- **Footer chip (21c): works.** On the footer's top rule, 146x26, only while `era.name === 'Placeholder'` (Footer.astro:7).

## Ranked fixes (before Gabe's content; excludes D81, server.js, src/lib, anything needing his answers)
1. **Stress-test every page with realistically wrong data** (throwaway fixtures, not shipped): 45-char venue, two-line show
   note, 0 / 1 / 15 shows, 40-char release title, release with no cover, three-paragraph bio; check 320 / 390 / 1280 for
   overflow, clipped phrases, bar collisions. Real content is what will break the fit-to-width type and `100cqi / var(--w-*)` phrases.
2. **A designed no-cover state for releases.** Music 1280 shows hatched placeholder tiles; Who I Am (`cover: null`) becomes the
   Home "Latest single" on Nov 13 with the SVG placeholder (`content.js` ~60). Make a typographic cover (title in the display
   face, one rule, no new colour) so a missing cover looks intended.
3. **Cross-browser / in-app pass** on Chromium-only features: `text-box: trim-both cap alphabetic` (global.css 125, 270, 272),
   mask / `clip-path` for arrows and ledge, `cqi` units, the fixed header in iOS Safari and the Instagram in-app browser. Add
   fallbacks where layout depends on `text-box` (extra top space OK, a clipped phrase not). Needs Safari or a real phone to verify.

## Diminishing returns on visual polish: yes
IG, IG2, IG3 all held 4.0; screen one has barely changed since IG. What moves 4 toward 5 is content and one call: Gabe's colours
(D35), real covers and photos, a real show instead of "Placeholder Venue / Somewhere, PA", and the held Play call (D81).

## What helps the launch most now (work, not polish)
- Fixes 1 and 3 (data resilience, cross-browser), then Lighthouse and a flash audit on the real build.
- Host + daily rebuild: release flips happen at build time, so Nov 13 does nothing without a rebuild that day. Domain, Kit,
  postal address (ROADMAP risks 3, 5, 6).
- Gabe's edit-screen walkthrough: he adds one show himself.
- Chase the asset list (colours, covers, photos, playlist link, shows) through the owner.
- Ask Gabe whether he wants Play above the fold (D81).
