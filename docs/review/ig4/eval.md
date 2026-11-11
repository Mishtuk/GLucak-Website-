# Round IG4 outside evaluation (glucak-advisor, 2026-11-11, repo at e131759)

Own scratch build (`astro build --outDir` in the scratchpad), `node server.js` PORT 8931, empty DATA_DIR; Spotify / YouTube / ytimg
blocked at the resolver (D85). CDP shots 390x660 and 1280x800 of /, /music/, /shows/, /about/, /nope/ (+ full pages, 2-3x crops of
the hero, the Rise photo, the Push Past Fear photo, the open Menu sheet). `getAnimations()` motion on and reduced. Contrast:
screenshot with all text made transparent, p95 luminance of each text box vs #f5f5f5 (sharp, raw pixels). `npm test` 194/194.

## Scores (calibration IG3 = 4.0)
- **Design quality 4.5 (x2).** Screen one at 390 is the strongest the site has had: one red-and-black print, the outlined SHOWS
  box gone, one button on screen. Home at 1280 reads as one print run (wall, red riso, stark toner, white lines, red plates).
  Not 5: Play still under the bar on screen one (D81, held); two of the five new prints lose Gabe (below).
- **Originality 4.5 (x2).** The print-shop idea (same two stocks and inks, a different screen per slot) is the site's own and
  answers the owner's note; the arrow links and grey rules retire three of IG3's template tells. Not 5: all-caps display
  headings throughout.
- **Craft 4.** Heights unchanged (3601 / 3553 / 4277 / 2159 / 3224), no overflow. Docked: the Rise toner and Live It Loud line
  prints lose the subject; the 9px hero wall reads slightly digital-chunky up close; About h1 on the crowd has a worst pixel of
  3.0:1.
- **Function 4.** SHOWS is a 100x52 target, focus ring fine. Play still not on the first phone screen.

Weighted **4.33** ((4.5x2 + 4.5x2 + 4 + 4) / 6). Gate 4.3: **PASS, narrowly**. The biggest IG3 tells are genuinely gone; fixing
1 and 2 below is what makes the pass comfortable.

## Gates
| Gate | Result |
|---|---|
| Weighted >= 4.3 | PASS (4.33) |
| Hard rule 1 (no flashing; 0 motion under reduced) | **PASS** |
| No text over an image < 4.5:1 | PASS on p95 (below); worst single pixel is the caveat |

**Hard rule 1.** Home `getAnimations()` = 0 motion on, 0 reduced (the glow is gone; it was 1); music / shows / about / 404 all 0
in both. Home 390x660: 3601 reduced / 3553 motion on; 1280 = 4277 (matches the claimed numbers). Menu sheet, motion on: open = 2
transitions, close = 3, 0 once each settles; reduced = 0 opening and closing (the sheet still opens and closes). One 160-200 ms
fade + scale 0.95 -> 1 per tap: nowhere near 3 flashes / second, no full-screen luminance change. Every print is a still.

**Contrast (p95 of the text box with the text hidden; text #f5f5f5).**
| Text | Ratio p95 | Worst pixel |
|---|---|---|
| Home 390 GLUCAK | 6.99 | 4.31 |
| Home 390 slogan | 11.03 | 8.28 |
| Home 390 SHOWS / LISTEN | 16.1 / 16.3 | 15.4 |
| Home 1280 G / LUCAK on the wall | 12.28 / 13.17 | 12.28 |
| Home 1280 slogan | 12.99 | 12.28 |
| About 390 PUSH PAST FEAR | 6.26 | 3.01 |
| About 1280 PUSH PAST FEAR | 6.01 | 2.98 |

Caveat: the About h1 worst pixel is 3.0:1 (a single bright ink dot beside a glyph). It passes the large-text 3:1 line, but a strict
"every pixel 4.5" reading fails it; the p95 and the designer's blurred measure both pass. Cheap insurance: fix 4.

## Your five questions
1. **Do the print variations read as a family?** Yes, mostly. The palette lock (red, white, black from the era file) and the
   "one stock per slot" rule hold them together: night riso (black stock, red + white dots), hero B (paper, red + ink), plates
   (paper, coarse red + ink), About shadows (red tritone with ink dots), line screen (white on black). Those five sit together.
   The **toner is the outlier**: no screen, a hard 1-bit threshold. It looks like a different tool, not a different plate. As a
   "punk flyer" idea it is right; as executed it is the weakest member.
2. **Rise garage toner: is Gabe recognizable?** **No, it is noise.** At 1280 the car is the subject: a big dark ellipse with a
   white wheel arch; Gabe is a pale vertical slab on the right with dark jacket on each side. His white shirt and the pale wall
   both go to paper, so there is no edge between him and the room; glasses, face, necklace and hands are gone. The grain also
   makes it the harshest block on the page, next to the RISE word. The source is 874x492, so no crop-in is possible (`load()`
   refuses to upscale). See fix 1.
3. **Push Past Fear two plates at 390.** Works as a texture, not as a portrait. At 104x159 the dots are fine, the red / ink
   register shift reads as a print, and the figure (arm up, mic, white shirt, drum stands) reads. His head is cut at the top
   edge (mic and chin only) and the face is not readable at that size; the old photo was no better at 117px. Fix 3 moves the
   crop up. It does not hurt and does not help.
4. **New phone hero (a-night-phone-800) face at 390x660.** Readable, and bolder than the old teal grade: you see the glasses, the
   mic at his mouth, the hair, in a halftone that stays crisp. It is the one place the face is clearly Gabe. Limits: only about
   150px of face shows between the header and GLUCAK (same as before), the eyes sit dark in the dots, and the whole screen is now
   one orange-red (the era accent). GLUCAK holds (6.99 p95). Keep. Compare `docs/review/ig4/design/23-home-390-before.png`: the old
   one had more detail but looked like a template.
5. **Hero wall (1280) replaces the glow: background or distraction?** **Background.** Text on it is 12.3:1 or better, it is
   tone-on-tone (about #2a2a2a on #111), the bricks and flower dots only show in the gaps between letters and under the slogan,
   and nothing moves. One note: at 100% the 9px 45-degree dots look more like pixels or a mosaic than a print. It stops at the
   900px breakpoint (phones get the photo, desktops the wall); by design.

## Regressions vs IG3
- **SHOWS arrow link:** fine. Word + 4px arrow, 52px high, aligned with LISTEN at 390 and 1280 and on the 404. No regression.
- **Grey band rules:** read as bands, the ledge is the only white. On About / Shows / 404 at 390 the 2px header line and the
  4px band rule are about 30px apart with the section word between them: a bit busy, not wrong.
- **Section word:** display face 20px, now a real label on the ledge. Fixes the IG3 "17px body text" dock.
- **Footer "Listen Shows Join":** spread evenly at 1280 and 390, no clip; reads as a close. Fixes the IG3 dock. The chip is a
  dashed-underlined "Placeholder colors", no box.
- **Menu sheet:** opens and closes (verified); one fade, no layout shift; reduced = no transition. It covers the hero slogan with
  only a faint 2px bottom rule, so the headline looks sliced at its edge; minor.
- **Phone bar:** unchanged.
- The only visible regressions are the toner and line prints losing the subject (below).

## Ranked fixes (file, exact change)
1. **Rise photo: give Gabe back, or revert the slot.**
   Option A (zero risk, one edit): `src/components/RiseBand.astro` line 16, change `garage-toner-480` / `garage-toner-874`
   back to `garage-480` / `garage-874` (the old files stay in `public/media/v2/`; the credit regex already matches both).
   Option B (keep the toner): in `tools/photo/texture.mjs` `garageToner()` (line 189) key the wall and car out of the tone as the
   night riso does at lines 152-153 (`wallness = blurField(field(img, (r,g,b) => smooth(0.2, 0.5, b - r)), w, h, 2.5)`), set
   `T[i] = T[i] + (0.55 - T[i]) * wallness[i]` so the wall and car print as speckle and Gabe's white shirt stays paper against a
   dark mid, and add local contrast before the curve (add `0.8 * (blur(0.5) - blur(6 * k))` to the luminance). Re-run
   `node tools/photo/texture.mjs` and check at 1280 that the glasses and shirt edge are visible.
2. **Live It Loud line screen: the face is a star.** `tools/photo/texture.mjs` `stageLines()` (line 168): the face sits behind
   mic and hand, so lines turn it into a black hole with spikes. Change `smooth(0.05, 1.0, t)` to `smooth(0.02, 0.9, t)` and
   `pitch` 4.6 -> 3.8 at 634 (3.4 -> 2.8 at 360); or ship the old file (`src/pages/index.astro` line 32: `stage-lines-` ->
   `stage-`). The lines are a good idea; they need his hands and face to survive.
3. **Belt plates at 390: lift the crop so the head is in.** `src/styles/global.css` line 1130: `object-position: 50% 22%` ->
   `50% 0%`. Aspect and heights do not change.
4. **About h1 worst pixel 3.0:1.** In the About screen function of `tools/photo/texture.mjs`, cap the white-ink density in the top
   35% of the file (where the h1 lands at 390 and 1280), as the night riso does under the name; or add
   `text-shadow: 0 0 0.35em var(--bg)` to the `.push-photo h1` rule in `global.css`. The p95 is 6.0+, so this is insurance.
5. **Hero wall chunkiness (optional).** `tools/photo/texture.mjs`, the wall function: screen at 7px instead of 9px and re-run;
   keeps the 12.3:1 and reads as a print rather than pixels.

## Diminishing returns on visual polish: yes, still
IG4 moved the score from 4.0 to 4.33 by retiring real tells, but screen one is about as good as it gets without Gabe's own
choices (colours, real photos), the held Play call (D81), and a real show. The next highest-value work is non-visual: host +
daily rebuild, the S1 signup crash patch (`docs/review/patches/s1-signup-crash.diff`), Gabe walking through the edit screen.

## Not touched
No site code edited, nothing committed. `npm test` ran its `pretest` build into the repo's `dist/` (build output only; git status
is clean except the untracked `docs/research/ig-security-reels.md`).