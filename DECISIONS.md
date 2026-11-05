# Decisions

Desktop uses even numbers, Laptop odd. Format: number, date, question, ruling, why.

- **D2** (2026-11-02, Desktop): Start from the Riverside site's stack (Astro + small `server.js` + `node --test`).
  Why: Gabe likes Riverside's layout, it's our code, and it already has the patterns (admin, forms, tests). The
  Laptop can counter on #1 before the build starts.
  **Confirmed 2026-11-02 (owner):** "Riverside" = the new Riverside site we built, not the old live site or the band.

- **D4** (2026-11-02, Desktop boss): Hero: Gabe's name (Kalkbrenner pattern) or the slogan? **Ruling:** both.
  "GLUCAK" huge with a live photo set into a gap in the word, the full slogan in four short lines right under it,
  Listen / Shows, the "Now" line; still photo at launch, no video. If the 390px screen can't fit both with the top
  of the Spotify player showing, the name shrinks, never the slogan. **Why:** fans from Instagram need to see whose
  site it is, Gabe asked for the slogan featured prominently, and the photo inside the name replaces the stacked
  photo + tint + glow + word background, so the hero stays one idea and short enough for the player.
- **D6** (2026-11-02, Desktop boss): Do big slogan headings with a small label stay intuitive (Laptop's concern A)?
  **Ruling:** keep the spine. The label is 16px or more on phones, passes 4.5:1 contrast, uses the exact nav word,
  and real content (a date, a play button) sits right under the heading. If it fails the 390px prototype check,
  plain headings ("Shows") become the big text and the phrase the small line. **Why:** the slogan is the one idea no
  peer can copy, but "intuitive" is Gabe's first word, and no real artist site proves the pattern (artist-sites.md).
- **D8** (2026-11-02, Desktop boss): Phone bottom bar behaviour and labels? **Ruling:** always visible (no hide on
  scroll), on every page: Listen / Shows / Watch / Join; Shop replaces Watch when the shop opens. **Why:** our rule is
  Listen and Shows one tap away from every page; Riverside's bar hides on scroll (MobileBar.astro:2) and no peer has one.
- **D10** (2026-11-02, Desktop boss): IDENTITY 12-track page at launch? **Ruling:** a block on the Music page at
  launch, its own page later; how many slots and titles show waits on Gabe's answers. **Why:** Gabe wants 3-4
  sections to start, and a page of mostly "Coming" slots could read as unfinished.
- **D12** (2026-11-02, Desktop boss): What goes in the era file? **Ruling:** colors, cover art, texture and era word
  only; the display font is fixed and changing it is a reviewed change; an automated test fails any era file whose
  colors miss 4.5:1 (text) or 3:1 (large text, controls). **Why:** colors come from art we haven't seen yet, and a
  new font can break the slogan's line breaks.
- **D14** (2026-11-02, Desktop, amends D4 after the Laptop's counter on #1): **Ruling:** the name leads, the slogan is
  one big line under it (wrapping to 2 lines on phones, never caption-sized). The first prototype shows **two heroes
  at 390px with a real photo, and the owner picks**: **A** huge GLUCAK over a full-bleed duotone live photo
  (Inherited's strength, Manafest's structure); **B** the photo set into the name at his own break, G[photo]LUCAK
  (Kalkbrenner). Display type is not locked until Gabe's logo files arrive (avoid two wordmarks). Launch hero is a
  still photo; any clip we host later must pass a frame-level flash check (e.g. PEAT) first. **Why:** six letters
  plus one line leaves room for the player on the first phone screen; the spine repeats the slogan four times
  below; the photo slot in B is thumbnail-sized on a phone, so A may carry more energy: test, don't guess.
- **D16** (2026-11-02, Desktop): Can any build start before DESIGN.md? **Ruling:** only design-independent
  foundation, in phase 1 alongside the Laptop's DESIGN.md: the Riverside scaffold with neutral placeholder pages, the
  shows data and per-visit upcoming/past split, the era-file contrast test, and test harnesses. No styles, layout or
  copy (those wait for DESIGN.md). **Why:** the owner said to work on whatever doesn't need Gabe's answers; this
  doesn't constrain the look, and it de-risks phase 2 (Node host behaviour, shows dropping off) early.
- **D18** (2026-11-03, Desktop boss): Home prototype (452dece) review, direction.md section 9 step 4. **Ruling:**
  approved, no blocking fixes. Re-ran `prototype/check.mjs` on the Desktop and got the Laptop's numbers (player top
  on the first 390x660 screen clear of the bar, no sideways scroll at 320/390/1280, labels 17px 17.3:1, ~5 screens,
  animations empty under reduced motion and the switch, flash delta 0.0001, 48px+ targets, no CSP errors, no
  innerHTML). Confirmed the Laptop's proposals: Release fields, IDENTITY site facts (`releaseDate`, `presaveLink`),
  Now line 14-day window, derived duotone ceiling. Sign-up endpoint is `POST /api/signup`. Open for Gabe via the
  owner: "IDENTITY, 2027" and the "Epilepsy survivor" bio line on Home. Hero A vs B waits for real photos (D14).
  **Why:** every "done when" in direction.md section 9 step 3 is met and reproducible; what's left needs Gabe's
  photos or a real phone.
- **D19** (2026-11-05, Laptop boss): Real Spotify embed in the prototype. **Ruling:** approved. The playlist link
  reads "Play full songs on Spotify". Spotify's title marquee is accepted (it stops under the device reduce-motion
  setting; our footer switch can't reach a cross-origin iframe). Spotify's cover-art background is accepted
  (fallback: `&theme=0`). **Why:** logged-out fans, most from Instagram's in-app browser, get 30-second previews, so
  the link says why to tap; hard rule 1 is met by the device setting.
- **D21** (2026-11-05, Laptop boss, answers the Desktop's "From Gabe" idea on #1): **Ruling:** changed. At most one
  quote per band, after the band's main content, never above the player (RISE: under the latest release; LIVE IT
  LOUD: after All shows; THE TIME IS NOW: optional; PUSH PAST FEAR: none, the bio is already his words). Max 120
  characters, exact, from posts `social-content.md` marks as his own, credited and linked ("GLucak, Instagram, Mar
  2026"), static (never rotating), approved by Gabe via the owner. No approved quote means nothing shown. Data: an
  optional `quote {text, url, date, platform}` per band. **Why:** the owner asked for a dialogue in his own voice; D6
  keeps real content right under each heading, and a quote under RISE would push the player off the first screen.
