# Round IG6 outside evaluation (glucak-advisor, 2026-11-11, repo at 433bf55 + a7e385e)

`npm run build`, `node server.js` PORT 8971, empty DATA_DIR; Spotify / YouTube / ytimg / scdn blocked at the resolver (so the
grey Spotify embed boxes in the shots are the block, not a bug). Headless Chrome over CDP, 390x660 and 1280x800, viewport and full
page of /, /music/, /shows/, /about/ in `docs/review/ig-round6/after/` (`<page>-<w>.png`, `<page>-<w>-full.png`), `getAnimations()`
with motion on and reduced. `npm test` 213/213.

## Scores (calibration IG4 = 4.33)
- **Design quality 4.5 (x2).** The indigo / white / magenta era reads as one run: hero, buttons, prints, CD block all share it, and
  it is now Gabe's own colour, not a guess. Screen one at 390 holds (face, GLUCAK, slogan, one LISTEN, Shows arrow, the Nov 13
  line). Not 5: Home's jump photo (below) and the IDENTITY block buried on Music.
- **Originality 4.5 (x2).** The tracklist is the site's own idea (display face, numbers muted, one row louder by size, no accent),
  and the accent is a fill only, never text. Not 5: still all-caps display headings throughout.
- **Craft 4.** No overflow at 390 / 1280, 213 tests, heights close to the doc (Home 390 3735, Music 4404, Shows 2859, About 2806
  reduced). Docked: jump photo, OG share images still the old charcoal (below).
- **Function 4.** LISTEN on screen one; track 12 is a 48px target; one-tap nav. Docked: IDENTITY, the album the launch is for, is
  4.3 screens down on phone Music.

Weighted **4.33** ((4.5x2 + 4.5x2 + 4 + 4) / 6). Held at IG4. The colour change is a real gain but the new photos and the CD block
add as many small misses as wins.

## Hard rule 1: PASS
`getAnimations()` running = 0 on all four pages at 390 and 1280, motion on and reduced. CSS motion is only the 0.6 s phrase fade
and the Menu sheet (both gated on no-preference / `data-motion='on'`), no keyframes. Every print and CD photo is a still.

## Contrast of #d93cfb on #05024c
Measured from the era file (WCAG): accent vs bg **5.35**, vs bg-2 `#161359` **4.71**, vs the footer ground `#242163` **4.07**; the
button label (bg on accent) **5.35**. Magenta is used only as a fill (`.btn-solid`, poster button, phone-bar `:active`), never as
text, so the 3:1 non-text line and the 4.5:1 label line both pass; the label is also large display type. Weak spots, none failing:
accent vs the white text 3.17 (poster only, 3px bg border carries it); `--line` vs bg 2.02 (decorative rules, not boundaries of
controls); magenta footer JOIN on the ground 4.07 (above 3:1). Muted `#b7b2e3` on bg-2 8.25 and on the ground 7.12.

## Photos: is it still Gabe?
- **Hero (390 and 1280), night riso:** yes. Glasses, cap of hair, hand and mic read in the magenta halftone; at 390 only glasses and
  forehead show above GLUCAK (as IG4).
- **Shows live photo (cd-live, 1280x640):** clearly Gabe, singing, glasses, mic, LED strip. The best new image.
- **About studio (cd-studio):** yes, headphones, glasses, cross necklace, hands on the pads; at 390 he is about 60px tall in a
  360px square, so it reads as a room, not a portrait. Fine.
- **Home Push Past Fear print (1280):** a figure in a white shirt, no face; same as IG4, acceptable as texture.
- **Home jump photo (cd-jump, 1280): no.** Motion-blurred torso, head hidden by the arm, background posterised to white, magenta,
  blue. It is his own grade, so it is not our print, but it is the one image on the page that does not say "GLucak". Hidden under
  900px, so phones never see it.

## CD block and tracklist on a phone (390)
Reads well. The cover (150px, left) beside the mark, "IDENTITY", date, "275 days to go" and a Pre-save button; the 12 tracks
are one 31px-pitch column in Big Shoulders, numbers muted, track 12 one step bigger with a diagonal arrow and "Out Jan 15"; the
credit line follows. Nothing wraps, no overflow. Issues: it starts at y 2860 of 4356, behind 12 release covers; the visible note
says only "Out Jan 15", so a fan sees an arrow with no word "pre-save" (aria-label has it).

## Ranked fixes
1. **OG / share images are still the old charcoal.** `public/media/og/*.png` are dated Nov 5 (home.png: `#111` ground, grey
   type). Fans arrive from Instagram, Threads, X links, so the first impression is the old look. `tools/og.mjs` lines 2 and 13 still
   default to `src/eras/placeholder.json`: change both to `identity.json`, run `node tools/og.mjs`, ship the five PNGs. Same for the
   favicon / apple-touch (`prototype/tools/resize.mjs`, still `#111`).
2. **Move the IDENTITY block up on Music.** `src/pages/music/index.astro` (the `<div class="idn">` block): put it right after the
   Rise / Spotify band and before the Releases grid, or at minimum add a jump link "IDENTITY: tracklist" under the Spotify button.
   Today it is the last thing on the page, 4.3 screens down on a phone. Check the CSS band order and the `test/ig6` track count.
3. **Replace the Home jump photo with one that shows him.** `src/pages/index.astro` line ~49 (`.v2-jump`, `cd-jump-352/704`): make a
   4:5 face-level crop of `assets/from-gabe/identity-cd/identity-cd-inside-live.png` (his face and mic, as graded) to
   `public/media/cd-live-portrait-352/704.webp`, point the slot at it, alt "GLucak singing live in purple light". Trade-off: the
   wide live strip stays on Shows, so the same shoot shows twice (a different crop); owner call vs a repeated-image note. If not,
   delete the slot; the empty grid cell is better than a face-less one.
4. **Say "pre-save" on track 12.** `src/components/content.js` `favorite()`: the visible note becomes `Out Jan 15. Pre-save` (or
   `Pre-save, out Jan 15`) until the day, `Out now. Listen` after; keeps the arrow, no accent.
5. **Check Home Join cover at 320.** DESIGN 25d says the IDENTITY art is 36px wide there (pre-existing). Raise the container-query
   threshold in `src/styles/global.css` (`.v2-photo` at the 20rem query) so it stays at least 72px, or hide the image under 340px.
   Not measured by me at 320 this round.

## Not found wrong
Show list matches the research (Dec 4 Music and Arts Center is a real future show; the cancelled one was Nov 6). `a-night-phone-800`
reports "broken" at 1280 only because it is hidden / lazy (`display: none`), not a missing file. No site file was edited and nothing
was committed; the build rewrote `dist/` only. My server on 8971 is stopped.
