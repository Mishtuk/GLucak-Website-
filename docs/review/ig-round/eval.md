# Round IG outside evaluation (glucak-advisor, 2026-11-10, repo at ef2fe8b)

Method: `npm run build`, `node server.js` (PORT 8835, empty DATA_DIR), own CDP viewport shots at 390x660 and 1280x800 of
/, /music/, /shows/, /about/ plus Home at 390 scrolled to y=660/1320/1980/2640/3300. Motion on; Spotify and YouTube NOT
blocked (the baseline script blocks them). Compared with `before/` and `after/`.

Summary: the round is almost entirely subtractive. In first viewports the only visible change is the Home hero "Now" pill
gone; the Music "Album" change is below the fold (Music 3292 -> 3234px). Judged as the site stands.

## Scores (1-5)
- **Design quality 4 (x2).** 390 first screen: GLUCAK in Big Shoulders over Gabe's graded duotone photo, slogan fitted in two
  lines, orange LISTEN beside outlined SHOWS, one "Out Nov 13: Who I Am" line. Clear hierarchy, one orange CTA. Not 5: at 390
  the Spotify card only peeks in (~y=555) and its Play sits under the tab bar; the white "Music" tab beside the dashed
  "Placeholder colors" chip is clutter; above 1280 the lower hero is a lot of near-black.
- **Originality 4 (x2).** Slogan-as-section-headings (LIVE IT LOUD / PUSH PAST FEAR / RISE), art-directed halftone/duotone of
  his own photos, one era-orange accent on near-black; nothing Wix-like. Minus one: white-tab labels + all-caps everywhere +
  outlined ghost buttons are a recognisable "bold brutalist" template of their own.
- **Craft 4.** Type fits, no orphans, big tap targets, underlined active nav, consistent rules/spacing; Music meta now one line;
  no "Now Out now" doubling. Docked: Spotify embed title clips (third-party); deliberate pre-launch markers crowd screen one.
- **Function 4.** Listen in header (1280), hero, tab bar and player. Shows is the 2nd tab; a real show card ~1.8 screens down
  at 390. Home 5.43 screens with the player loaded (3583px), 5.50 blocked (3631px), both under the 3633 bar. Not 5: first
  show two screens down; the Now line carries a release, not a show.

Weighted total (4x2 + 4x2 + 4 + 4) / 6 = **4.0**.

## Hard rule 1: PASS
- Motion on: `document.getAnimations()` = exactly one (`drift`, the glow, infinite). Reduced motion: zero animations,
  `data-motion=off`; glow, heading fades and view transition are gated behind `no-preference` / `data-motion='on'`; the Motion
  button is disabled when the device asks for reduced motion.
- Glow: 24s ease-in-out alternate, opacity 0.68-0.88 (~0.04 Hz); pauses off-screen. Nothing flashes.
- Note: Spotify's embed scrolls its long title (third-party marquee, slow, not a flash); unknown if it honours reduced motion.

## Hero glow vs the "dark gradient hero" cliché: mostly no
One orange radial wash (~34%) under a real photo and type, not a purple/blue mesh behind a centred headline. Risk: at 1280 the
lower hero plus the RISE band read as a dark-to-brown field. Keep; lowest priority.

## Fixes for next round (ranked)
1. **Spotify Play button inside the first 390x660 screen.** `global.css` (`.hero-inner` padding-bottom, Rise band top spacing)
   and chip / tab placement in `Hero.astro`. Fans came to listen; pull ~70px up or move the "Placeholder colors" chip out of
   the flow. Re-check the 3633 bar.
2. **Drop or flatten the white `.tab` section labels** ("Music", "Shows", "About", "Join") where the heading already says it.
   `global.css` `.tab` (~303), section markup in `src/pages/index.astro` and `src/pages/{music,shows,about}/index.astro`. Same
   filled-label tell this round removed elsewhere; ~40px each on phones, so the player and next show rise.
3. **Give About's empty right half at 1280 a job** (Listen / Shows / Patreon, or a second photo + listen button) so the page
   ends in an action. `src/pages/about/index.astro` (+ `global.css`).

## AI-design tells still visible
- Tags/pills: the white section tabs; "Preview" chip in the Spotify card (third-party); dashed "Placeholder colors" chip (18c).
- Middle-dot meta lines: "Latest single · Sep 4, 2026", "August 13, 2027 · 276 days to go".
- Periods in titles: footer "LISTEN. SHOWS. JOIN." (also a slogan device).
- All-caps on every heading (brand voice; mild tell).
- Bordered containers: outlined ghost buttons, hairline dividers, the heavy white rule between hero and band.
- Clean: no purple/blue gradient, no Instrument Serif, no italic word, no cream, no three icon cards, no sparkles/glass/marquees of ours.
