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
- **D23** (2026-11-05, Laptop boss, review of `docs/copy/home.md`): Can the site trim or re-case Gabe's own words?
  **Ruling:** no. His words go on the site exact or not at all, not even a capital letter changed. Home's PUSH PAST
  FEAR shows bio line 1 only (exact); the full bio, word for word, goes on About; DESIGN.md section 5 drops "then the
  mission-statement line". From Gabe picks: RISE "God will always be with you, and will never leave you in the
  valley. Trust me, I know." (Instagram, Sep 2026); LIVE IT LOUD "Hope to see you there!" (YouTube, Sep 2026); none
  elsewhere for now. Both need Gabe's OK. **Why:** the owner's rule that nothing goes in his mouth he didn't say; an
  edited quote is no longer his; the trimmed line also named the "upcoming 3rd album", which goes stale.
- **D25** (2026-11-05, Laptop boss): Type lock and Logo D. **Ruling:** display type locked: Big Shoulders Display 900
  + Atkinson Hyperlegible Next. Logo D is IDENTITY's mark, never a wordmark: header at 30px left of GLUCAK in one
  link, the IDENTITY block, and the favicon (square crop of the original). Minimum 24px tall, clear space a quarter of
  its height on every side, only on solid dark `bg` / `bg-2` (never on a photo, the accent or a light ground), never
  recolored or altered. **Amends D12:** the era file gains `mark` (path or null; null means the word stands alone).
  **Why:** Logo D has no lettering, so there's no second wordmark to clash with (the reason D14 held the type); marks
  change with eras like the art; its 65% grey wings vanish on light grounds.
- **D27** (2026-11-05, Laptop boss): Real-photo round. **Ruling:** photos ship as WebP from
  `prototype/tools/resize.mjs`, EXIF-free, at most 120 KB at 800px and 300 KB at 1600px; Gabe's originals are never
  shipped. Duotone: no muddiness on his photos, keep the derived ceiling; a per-photo gamma lift only if a low-light
  photo ever needs it. "Play full songs on Spotify" becomes an outline button (amends D19). The Now line uses real
  release data only. Home caps at 5.6 phone screens (hero A, both quotes in). **Why:** measured on Gabe's real files;
  every addition was asked for by Gabe or the owner, and the cap stops creep.
- **D29** (2026-11-05, Laptop boss, review of `docs/copy/music.md`, `shows.md`, `about.md`): Is part of a sentence of
  Gabe's a trim? **Ruling:** yes. A quote is one or more whole sentences exactly as he wrote them; part of a sentence
  is a trim under D23. If the whole sentence is over 120 characters, pick another or none. Music's IDENTITY quote:
  none for now; Shows and About: none. Shows has no intro line (DESIGN section 6 has none). The Dave Bahm artwork
  credit stays, shown only with his art. No Fran Carroll caption. **Why:** D23; the research quoted only part of
  the sentence, so its full form and length are unknown. Credits come only from CREDITS.md, CONTEXT.md or his own posts.
- **D31** (2026-11-05, Laptop boss): How are release titles written? **Ruling:** as credited on Spotify, features
  included, Spotify's wording exact ("w/", "feat."). `src/data/releases.json` must match. Our own notes, such as
  "(self-titled)", never show as titles. The Desktop checks every title on Spotify. **Why:** one source, and a
  collaborator's credit is shown the way Spotify shows it.
- **D33** (2026-11-05, Laptop, amends D31 after the Desktop checked Spotify in 70461b5): Spotify's titles carry no
  "feat." or "w/"; collaborators are separate artist credits. **Ruling:** the title is exactly Spotify's ("Duck, Dodge,
  Jump, Fight"). When a release has more than one artist, an **artists line** sits under the title in the RISE release
  block and the Music release strip, exactly as Spotify lists them ("GLucak, J-BOY"), body face, `muted`; solo
  releases have none. The Now line shows the title only ("Out now: Duck, Dodge, Jump, Fight"); the credit is right
  below it. **Why:** Spotify is the one source, and the collaborator stays credited where the release is shown.
- **D35** (2026-11-05, Laptop boss): IDENTITY guess era and the Spotify theme. **Ruling:** `?era=identity-guess`
  (DESIGN.md section 3c) is approved as a prototype-only preview, labelled "our guess" on the chip, footer and sheet;
  it never enters `src/eras/` and is deleted when Gabe's real colours arrive. The Spotify embed uses `theme=0` (dark)
  in every era (amends D19). Hero recommendation to the owner moves from A to C (A on phones, B from 900px), or B if
  one layout only. **Why:** the owner can judge both heroes in IDENTITY's likely light before Nov 30 without anything
  passing a guess off as Gabe's colours. The cover-derived player colour follows his playlist cover, not the era, and
  clashed (maroon on violet); dark grey fits every era's dark `bg`. B works in any palette because no text sits over
  the photo; A flattens in cool colours under the brightness cap.
- **D37** (2026-11-05, Laptop boss): Shop and admin copy (L3, `docs/copy/shop.md`, `admin.md`). **Ruling:** sample
  products show no price. The sample banner shows only when every product is a sample. The buying note ("You pay on
  the store's own page. We never see your card details.") sits only under a Buy button. While `SHOP_ENABLED` is off, a
  products save says the shop isn't open to fans yet (the server picks the message). On a 409 the message says that
  reloading clears your changes; copy only, no merge, no saved draft, no "save mine anyway". **Why:** D36 says samples
  must be obvious and a price reads as real; every message has to be true for Gabe; two editors rarely collide, and
  overwriting the other save is what the version check prevents.
- **D39** (2026-11-05, Laptop boss): Home height after L1. **Ruling:** the Home cap is 5.8 phone screens at 390x660
  (amends D27's 5.6), measured by CHECK 4 "without the note", hero `ab`, both quotes in, one poster show. The poster art
  (c) stays at every width. Any later addition trims the same height first; raising the cap again needs a logged
  decision. **Why:** the 114px is the poster art the owner approved in D34; it serves main action 2 (shows) on phones,
  where most fans arrive. Dropping it under 700px still missed the cap (5.63) and removed it where it matters most.
- **D41** (2026-11-05, Laptop boss): Shop and admin console design (L2, DESIGN.md sections 14 / 15). **Ruling:**
  approved with fixes. On `/shop/` only the targeted product detail shows (`.product-detail:not(:target) { display:
  none }`): the grid is the page, a card opens its detail, back or the bar's Shop returns. No upload progress bar
  (fetch + "Uploading…"). "Stay" is a plain button (one accent button per view). Card pictures get `alt=""` (the name
  is the link text). New words "Edit" (opens a row) and "Stay" approved. **Why:** grid plus every detail repeated was
  4-6 phone screens of the same five samples, harder to find, not easier (the Puck Live lesson); separate pages are
  too much for five samples; the progress bar was unasked-for code with untested iOS behaviour.
- **D34** (2026-11-05, Desktop, owner delegated the call): Which hero? **Ruling:** both, by width: **A** (GLUCAK over
  the full photo) on phones and small screens, **B** (G[photo]LUCAK) from 900px up. A uses photo treatment (a) era grade,
  B uses (b) riso (or (f) MCCC still where B's slot is small). **Why:** both boss reviews found A stronger on phones and B
  better from 900px up; the owner said "do whatever you think is best". Treatment (a) also takes the child in the crowd
  out of frame. Push Past Fear uses (d); Live It Loud poster (c); About (e) with its HANDS frame swapped.
- **D36** (2026-11-05, Desktop): The shop comes forward. **Ruling:** build a temporary store now (owner): `/shop/` with
  clearly marked sample products (tee, hoodie, CD, vinyl, sticker), each "Coming soon" until Gabe has real products and
  the checkout provider is set up (Fourthwall per the research; we never handle card data). Products are edited in the
  admin console and render per visit, like shows. The store stays hidden from the nav behind `SHOP_ENABLED` until the
  owner switches it on. **Why:** owner, 2026-11-05: "continue working on the website with the store aspect. Make a
  temporary store with some templates and work on the admin console."
