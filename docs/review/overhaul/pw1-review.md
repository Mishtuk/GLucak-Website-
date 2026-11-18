# PW1 design review (advisor, 2026-11-18), commits 80af514..09c941a

Verdict: **PASS (no P0, no P1).** Two P2s and four P3s, none blocking. Evidence: `.work/pw1/` (24 palette shots, condensed, menu-open, sheet.png,
report.txt: no hscroll, 0 animations in all 24), plus my own shots in `.work/pw1r/` (768, 900, 1600, 700 and 1280 on Home, Shows, About, Videos, Shop in
poster / amber / steel / redline / green, menu open in amber and steel, condensed on Shows, a focused nav link, the switcher open at 390) from a local
server I started (`DEV_EDITOR=1 PORT=8267`) and stopped. Script: `.work/pw1r-shots.mjs`, `.work/pw1r-ov.mjs`.

## Score
- **Critique (Nielsen 0-4, /40): 34.** Visibility 4 (the ledge on the rule says where you are in every palette), match 3, control 3, consistency 4
  (one bar, six grounds, the same lockup), error prevention 3, recognition 4, flexibility 3, minimalist 3, errors 3, help 4 (menu sheet and slogan).
- **Audit (/20): 17.** A11y 4 (3px focus ring clears the full-height nav link, Listen/menu targets >= 44, one `aria-current`), perf 4 (no new
  requests, filters are inline SVG), theming 4 (every palette reads; Print re-ink is clean two-colour), responsive 3 (the 900 overflow, P2-1; switcher
  covers content, P2-2), anti-pattern 2 (the scrim of the section tab under the bar is a bit busy, P3-1).
- **Craft floor: PASS.** Contrast: all six `text/bg`, Listen `accent-text/accent` and the muted tag hold their spec floors on screen (Gig Poster
  muted `#5e5246` tag on cream reads clearly at 1280/1600; white on red Listen 5.7:1). No gradient text, no side stripe (the menu row bar is the
  spec'd indicator, not a card stripe), no glass, no new motion.

## Findings
**P2-1. Home overflows by 2-3px at 900-~920px wide (the known one), in every palette.** Cause found: the word "IDENTITY" (`p.identity` inside
`.identity-state`, `global.css:519`, size `--step-3`) is wider than its grid cell at that width, so `scrollWidth` is 902 at 900 and 903 at 901, 0 at
899 and 950 (measured 880/899/900/901/950/1000, three palettes). `.idn > .identity-state .identity { overflow-wrap: anywhere }` exists at
`global.css:1306` but the Home 900px band does not hit it. Fix: add `min-width: 0` on `.identity-state > .identity` and `overflow-wrap: anywhere`
to `.identity` itself (line 519), or drop `--step-3` one step inside `@media (min-width: 900px) and (max-width: 940px)`. Re-run the 900 check.

**P2-2. The "Colours" button sits on top of page content on 700px and wider.** `global.css:1472` (`.pal { position: fixed; left: 12px;
bottom: calc(var(--bar-h) + 12px) }`, `--bar-h` is 0 from 700px up). It hides text: About's "...projects and merch" line (steel-about-768), the
"NOV 29" date (amber-shows-1600) and the Riverside venue line (condensed-shows-poster). It is an owner tool and hidden for fans, so not a P1, but
the owner reads the page through it. Fix: put it bottom-right (`left: auto; right: 12px`) and give `.pal-sheet` `left: auto; right: 0`, or shrink
it to a 44px circle with a swatch glyph; either keeps it clear of the left text column.

**P3-1. Section tab sits in a tight double rule under the bar.** Every inner page (`Music`, `Shows`, `About` tab at y 75-100 in the 1280 shots) shows the
bar's 2px rule, then the tab word wedged against a second rule about 30px below. It reads intentional (D87) but cramped next to the new 6px ledge
right above it. Optional: add 4px of `margin-top` to the first band so the ledge and the tab do not stack; leave if the owner likes it.

**P3-2. Gig Poster phone hero: the re-inked photo is nearly a texture.** `poster-home-390.png` (sheet row 3, col 3): the print is cream-on-ink dots
behind GLUCAK; the face is lost. Same crop as before (OV6 P3-3), not a regression; `object-position` lower in `a-print-phone-800` would help
all six palettes.

**P3-3. Condensed bar keeps the descriptor at 1280.** `condensed-shows-poster.png`: bar is 56px but "Producer-rapper and DJ" still shows. Fine, only noting
the spec's `@container (width >= 74rem)` is on the bar, not the condensed state. No action.

**P3-4. Spotify card on the light palette is a hard dark block on cream** (`poster-music-1280.png`). Expected (30c), but it is the heaviest object on
the page and its title clips ("GLucak: Latest and Greate" at 900, Spotify's own embed). No action; tell the owner.

## Checked and fine (how)
- **Top bar at 390/700/768/900/1280/1600:** `.header-bar` children never overlap (rects measured, 768: brand 28-234, nav 269-601, Listen 617-740 so
  16px clear; 900: 31-237 / 399-731 / 747-869; 1600 tag visible at 80-482). 700 and below use Menu/Close (587-673 beside the brand). The Menu
  fallback at 768 is the desktop nav, no clipping. Lockup, plate and nav look finished in the shots.
- **Logo plate:** invisible on the five dark palettes, a black chip on Gig Poster at 390, 768, 1280 and 1600 (poster-home-900, poster-music-1280);
  D25's dark ground holds, the mark is not recoloured.
- **Phone bar and menu sheet:** accent Listen glyph visible in all six (sheet row 3, bottom); open menu in poster, amber and steel: rows 64px, arrow,
  ledge-bar on the current row, slogan, sheet fills to the bar.
- **Listen buttons:** magenta, amber, red, coral, orange, teal each on bg and on the phone bar; text legible in all.
- **Re-inked Print:** hero A, B, poster art and the JAN 16 card are two-colour in every palette, cream/ink swap clean on Gig Poster.
- **Switcher:** 6 rows with swatches, Reset, 52px rows, fits 390 and sits above the phone bar; `#pal` is `hidden` (`display: none`) with no key or `?palettes`.
- **Hard rules:** 0 running animations in all 24 shots; block 30 has no `transition`/`animation` (only `transition: none` on the pressed rule, line 845);
  condense is instant; no inline `<script>` in built `dist/index.html`; `server.js:51` CSP `script-src 'self'`; boot.js reads only localStorage,
  never `?palettes`; no motion outside `html[data-motion='on']`. Focus ring (3px) visible on a nav link in focus-nav.png.

Side effects: I started and stopped a dev server on :8267 and wrote `.work/pw1r*` files; no tracked source edited, nothing committed.
