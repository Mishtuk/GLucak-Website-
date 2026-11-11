# Round IG2 outside evaluation (glucak-advisor, 2026-11-11, repo at 7e9c62a)

Method: own build into a scratch outDir, `node server.js` (PORT 8855, empty DATA_DIR), own CDP shots (viewport, motion on) at
390x660 / 1280x800 of /, /music/, /shows/, /about/ (+ About 900x800, Home 390 scrolled). Blocked shots launch Chrome with
`--host-resolver-rules` (D85; the Spotify frame shows the sad-page icon, so the block is real); one unblocked Home 390 shot.

## Scores (calibration: IG = 4.0)
- **Design quality 4 (x2).** Screen one still strong (GLUCAK over the graded duotone, two-line slogan, one orange LISTEN). IG2
  ends the hero cleaner (white tab gone) and About at 1280 is now composed: PUSH PAST FEAR over the photo, bio left, a
  three-row setlist (LISTEN / SHOWS / PATREON) right, one orange fill. Not 5: Play still under the tab bar on screen one; the
  "Placeholder colors" chip crowds the hero foot; the 17px section word floats under the header at 1280 like a breadcrumb.
- **Originality 4 (x2).** The white-tab / pill tell is largely gone; the setlist is a real Gabe-world idea. Not 5: all-caps
  headings, heavy white rules and outlined ghost buttons remain the site's own template; the section word is now just text.
- **Craft 4.** Type fits 320-1280, no orphans, middle dots gone with a clearer hierarchy, sub-page rules consistent. Docked:
  footer "LISTEN. SHOWS. JOIN." (cut by D77), the chip, setlist rows have no link cue at rest (hover-only underline).
- **Function 4.** Listen everywhere; About now ends in actions (IG fix 3 done). First show ~1.8 screens down at 390; Play not
  on screen one.

Weighted **4.0**. Cleaner, two of three IG fixes done, but screen one did not change for a visitor.

## Hard rule 1: PASS
Motion on: Home `getAnimations()` = 1 (the glow); other pages 0. Reduced motion: 0 everywhere, `data-motion=off`. Home quotes
off at 390x660: 3553px motion on, 3601px reduced (footer layout differs by 48px; not new). Both under 3631.

## D79 plain-word label
Works against the template tell (exact nav word, 14.3-17.3:1, no height, no pill) but reads weaker than the old tab: alone
under the header on sub pages, duplicates the nav underline at 1280, a caption beside the chip on Home 390. Calmer, no identity.

## Play position (owner call D81, not ranked)
Unblocked Home 390: iframe top 545.9 (was 555.9), Play disc ~y 687-731, bar top 598: ~27px below the viewport. Not on screen one.

## Fixes for next round (ranked)
1. **Give the section word an identity**: `global.css` `.tab` (~304). Unfilled, but tied to the rule as a "crate divider"
   (e.g. a short second hairline, or Big Shoulders at a heading-related scale), not a body-17px breadcrumb. No height, no motion,
   exact nav word (D6).
2. **Setlist rows read as links at rest**: `global.css` `.about-set a` (450-452). A non-pill, non-motion cue (trailing arrow
   glyph or a permanent underline), also on hover / focus; keep one accent per view.
3. **Clear the chip from screen one**: the dashed "Placeholder colors" chip (`Hero.astro` / `global.css`, absolute). Hide it from
   visitors or fold it into the footer until Gabe's colours arrive (D35). No height cost.

## What moves 4 toward 5
Function holds it at 4: the held 20b call (Play on the first phone screen). Then real content: Gabe's own colours (D35) and a real
show replacing "Placeholder Venue / Somewhere, PA" (the Home shows card is the strongest piece and still carries dummy words).

## Tells still visible
Gone: white filled tab, "Now" pill, middle dots. Remaining: placeholder chip, footer period cadence, all-caps headings, outlined
ghost buttons, heavy white band rules, Spotify's own "Preview" chip (third-party).
