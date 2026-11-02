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
