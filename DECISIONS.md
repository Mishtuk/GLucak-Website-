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
- **D42** (2026-11-06, Desktop, Laptop's idea): When does Shop take Watch's place in the phone bar (D8)? **Ruling:**
  only when `SHOP_ENABLED=1` AND at least one product is `available`. The nav and footer Shop links follow
  `SHOP_ENABLED` alone. **Why:** samples can't be bought, so a bar slot fans tap most should never lead to nothing
  buyable; the nav link is fine for the owner's preview.
- **D43** (2026-11-06, Laptop boss, L4 review of the L2 port, `docs/review/l2-port-review.md`): What counts as
  "available" in D42? **Ruling:** buyable: status `available` **and** a Link (the same `buyable()` that shows Buy). A
  product set to Available without a Link shows "Coming soon" and keeps Watch in the phone bar. The L2 port is approved
  with two fixes: F1 (this rule) and F2 (rows inert while saving, Save waits for an upload). **Why:** Gabe will set
  Available before he pastes the store link; the bar must never lead to nothing buyable, and edits made during a save
  were silently thrown away.
- **D45** (2026-11-06, Laptop boss, round-2 verdict, amends D18's Now line): **Ruling:** the Now line picks, in order:
  a release dated from today to 14 days ahead ("Out Nov 13: Who I Am", linking its smart link); a release from its day
  to 7 days after ("Out now: {title}"); the next show or open mic within 14 days; otherwise the newest release. It must
  ship before Nov 13. **Why:** listen is main action 1, and campaigns live in dated states of one layout (Sleep Token,
  Lorde). Who I Am is a week out and Home is silent; shows still lead the Shows band right below.
- **D47** (2026-11-06, Laptop boss, round-2 verdict): Motion after round 2. **Ruling:** DESIGN 8 stands: exactly two
  motions, no page transitions (View Transitions dropped), no scroll-linked CSS animation. The heading fade keeps its
  IntersectionObserver, but `app.js` itself adds the waiting state, and only to headings below the first screen at
  load, so with no JS (or a failed `app.js`) and in print every phrase is visible. Instant `:active` colour swaps (no
  transition) are allowed on every button and card. **Why:** the slogan must never be a blank band; for Gabe the test
  for motion is "is it needed", and a full-screen fade on every tap isn't.
- **D49** (2026-11-06, Laptop boss, round-2 verdict): Shop work until real products exist. **Ruling:** no new shop
  statuses, fields or policy lines (pre-order / `shipsBy`, ship time, print guarantee, size chart, swatches, "Listen
  first") until Gabe has real products and a provider account; they are parked in `docs/research/design-round-2.md`
  section 2. Only change now: sold-out products sort last. **Why:** merch is third; with samples only, any ship time
  or guarantee would be untrue (D37), and a schema change without a product to use it is guesswork.
- **D51** (2026-11-06, Laptop boss, round-2 verdict on `docs/research/art-system.md`): **Ruling:** for any art the team
  makes (site, share cards, posters), use the IDENTITY colour roles (still a guess per D35 until Gabe's colours), our
  two fonts only, and Logo D only on dark solid ground; violet on paper only for large type. The single-cover template
  is an offer the owner may show Dave and Gabe, never a task; we never repaint or tint their covers, and the
  "homemade vs designed" notes stay internal. The Music sleeve waits for Gabe's confirmed tracklist and his OK. Posters,
  social templates and merch files are not scheduled (owner's call; printing costs money). The two-ink poster is the
  reference for the site's poster card in the identity-guess era. **Why:** covers are Dave's and Gabe's work; our job
  is the website, and rules that keep our own art in one world.
- **D53** (2026-11-06, Laptop boss, round-2 verdict): The other round-2 web items. **Ruling:** adopt Music as a cover
  grid (DESIGN 6's "cover strip"; coming singles show their art as made, or the placeholder, with the date), footer
  and About link lists as a 2-column grid of 48px rows, Add to calendar (a server-made `.ics` per show), and a 404 page
  with Listen / Shows. Drop Share buttons on shows and per-show share cards for now; per-release share cards come after
  the grid. No new layout for a single's "drop moment": the release block already flips by date, and a note from Gabe
  goes in the existing quote slot only if he wrote it (D23/D29). **Why:** each adopted item serves listen or shows on a
  phone at small cost; the rest adds buttons or pipelines nobody asked for.
- **D55** (2026-11-06, Laptop boss, review of the round-2 design, DESIGN.md 16, `docs/review/round2-boss.md`): **Ruling:**
  approved with three small fixes, made in the prototype. (a) Hiding "Listen everywhere" under 700px is approved **on Home
  only** (`.rise-player:has(~ .release) .under-link`): Home's release block repeats the same smart link 150px lower; Music has
  no release block, so it keeps the link. Home stays 5.78 screens (D39 cap 5.8). (b) The glyph-only Add to calendar is
  approved on rows and on the phone poster; a poster card 37rem and wider also shows the words "Add to calendar" (free
  there); the accessible name is "Add to calendar: {venue}, {Mon D}" everywhere. (c) Link-grid columns are at least their
  widest word (SoundCloud ran 11px past its rule at 390). No "Single" tag (Album / EP only) and `alt=""` on grid covers
  are approved. **Why:** a calendar with a plus beside the date it saves is a common sign, and it is a convenience, not a
  main path: Tickets and every main action keep words, so nothing a fan needs depends on reading an icon. Words on the
  phone poster cost 44px (measured), over the cap, for a secondary action; where they are free we show them.
- **D57** (2026-11-06, Laptop boss, check of `docs/copy/round2.md`): **Ruling:** approved with changes. The show state keeps
  a kind word: "Show Nov 20: {venue}, {city}" / "Open mic Nov 20: ...", "Show today: ..." on the day, linking #shows (D18).
  No `aria-label` on the Now link (the labels reordered the visible words, failing WCAG 2.5.3). The 404 copy, the .ics
  wording and "Pre-save" on the coming tiles are approved (both smart links checked: real pre-save pages). New admin
  string: "Wait for the photo to finish uploading, then press Save." **Why:** "Intuitive": a bare date and a venue makes
  a fan guess what it is, and open mics look like shows; "Show" mirrors "Out Nov 13: ...", one pattern for every state.
- **D59** (2026-11-06, Laptop boss, review of the Desktop's bf6704b): **Ruling:** approved; it can stay live for Nov 13.
  `npm test` 105/105 with the build; the Now line is right on every fixed date checked (Oct 29 to Aug 13 2027, including
  the New York midnight edges), escaped, http(s) only; F1 and D49 are right. Follow-ups, none blocking: the release-day
  state must beat a coming release (today B is checked after A); the D57 copy changes; F2's guard message goes stale
  ("Uploading…" stays after the upload ends), so use the D57 string and clear it when the upload ends. **Why:** these are
  real, small defects; none shows with today's data (the next two releases are 63 days apart).
- **D61** (2026-11-06, Laptop boss, optional street address on shows; Desktop research `discoverability-a11y.md` row 5): **Ruling:**
  add it. One optional plain-text field `address` per show, filled only in the `/edit/` Shows card. It is **not shown on the
  site** (rows and the poster stay "{venue}, {city}"); it appears only where a machine or a calendar needs it: JSON-LD
  `location.address.streetAddress` and the `.ics` `LOCATION` ("{venue}, {address}, {city}", else "{venue}, {city}"). If empty,
  nothing changes (no guessing, never invented). Validation in `validateShow`: string, trimmed, 1-120 characters when present,
  no line breaks or control characters (reject, do not strip), empty string stored as absent; no HTML ever goes out raw:
  JSON-LD through `JSON.stringify` with `<` escaped (as now), `.ics` through the existing text escape (backslash, comma,
  semicolon, newline), and it is never put in a visible row, so no escaping path is added to the page. Admin words are in
  `docs/copy/round2.md` section 4. Ask Gabe once for the addresses (HANDOFF question 13); venues without one keep the
  locality-only markup. **Why:** Google's Event rich result wants a street address and Search Console warns without it; it
  helps a fan's calendar pin the place. Showing it on the page would add a line to every row for little gain, and the
  Add to calendar button already carries it to the phone. Optional keeps Gabe's edit screen at its current length.
- **D63** (2026-11-06, Laptop boss, review of the Desktop's round-2 port 7c0e6b5 + D61 cfab6a9, `docs/review/round2-port-review.md`):
  **Ruling:** approved with five small fixes, none blocking: (F1) footer link cells at 900px+ are at least their word
  (`minmax(max-content, 1fr)`; SoundCloud ran 10px into Patreon at 900-970px); (F2) Music's SoundCloud line gets its
  `text-link` class back; (F3) About `links-lg` gap 0.4rem under 380px (the Desktop's 380-519px two-column rule is right and
  stays); (F4) the header brand gets the pressed text swap on its word (`.brand:active .brand-word`), since 16e removed the
  tap highlight; (F5) the address check also refuses C1 controls (`\x80-\x9f`, NEL). **Why:** each is a measured failure
  (overlap, no tap feedback, an unchecked line break); the fixes add no new look or words.
- **D65** (2026-11-06, Laptop boss, review of the Desktop's backup + restore 9e3a633, `docs/review/backup-review.md`):
  **Ruling:** approved, no security defect; four fixes before Gabe is told about it: (F1) the backup holds only the photos
  the products use and a backup over the 50 MB restore cap is refused at download with a message (measured: 160 uploads
  gave a 52.1 MB file that restore refuses); (F2) a product photo missing from the file but already on disk is fine, and one
  missing from both is a warning, not a refusal; (F3) no brotli on the download (it held the public site 1.46 s); (F4) a
  failed download gets a page message: the link fetches the file itself and shows the sign-in card on 401, the server's
  message on 429 / 413, and plain words otherwise (`docs/copy/round2.md` section 5). Words: link **Download a backup**
  (kept); hint **One file with your shows, products and photos. Keep it somewhere safe. If anything is ever lost, the
  person who runs the site can put it back from this file.** **Why:** a backup is only worth something if it restores, and
  a silent failed download on a phone looks like a success; one fetch covers every failure with no new route.
- **D64** (2026-11-06, Desktop, owner's notes): Owner overrides parts of D47 / D25 / the hero header rule. **Ruling:** (1)
  page-to-page transitions become seamless: a short cross-document View Transition (opacity / position only, no flash,
  under ~300 ms), fully off under `prefers-reduced-motion` and the Motion switch; (2) the header mark + GLUCAK is always
  visible, including over the Home hero; (3) the latest-video block shows the video's real thumbnail (saved locally,
  no third-party image request); (4) links to other sites open in a new tab (`target="_blank" rel="noopener"`, with a
  screen-reader "opens in a new tab" hint). The Laptop designs the details (DESIGN.md) and the Desktop builds them.
  **Why:** the owner looked at the preview and asked for these by name.
- **D67** (2026-11-06, Laptop boss, quotes vs D39 after the 18h port a3c504a, `docs/review/18h-port-review.md`): **Ruling:**
  Home carries **one** "From Gabe" quote, the RISE one ("God will always be with you, and will never leave you in the
  valley. Trust me, I know."), in the release card. The LIVE quote ("Hope to see you there!") leaves Home. The D39 cap
  stays 5.8 screens at 390x660, now measured with the one quote: **5.69** (both quotes were 5.86; quotes off 5.43). At 320
  it is 6.08 (both 6.25). D39 is measured at 390 only, and 320 is reported, not capped. The quote's layout stays as built
  (`.quote-credit` block: the inline credit runs past the quote's edge even at 320 / 100%). Both quotes still wait on
  Gabe's OK (`QUOTES_APPROVED`). **Why:** Home stays scannable and his voice stays where it says the most: the faith line
  is the raw, lived voice the site is about, next to his song. "Hope to see you there!" is a sign-off that the shows list
  under it already makes. Re-ruling the cap for a 40px sign-off would open the door to every later addition, and
  restyling the credit trades a measured overflow for 28px.
- **D69** (2026-11-10, Laptop boss, round IG, `docs/review/round-ig-plan.md`): Who builds while the Desktop is silent? **Ruling:**
  this round the Laptop also builds in `src/`, after claiming its files in HANDOFF "Now working on" (pull, claim, push first). It
  never touches `server.js` or `src/lib/` (the Desktop's standing claims). The designer specs against the build (DESIGN.md section 19
  with exact CSS deltas), not the prototype, which has been behind the build since the 18h port; DESIGN.md still comes before any
  build. The split returns to D2's when the Desktop answers on #1. **Why:** the Desktop has been silent on #1 since Nov 7, the owner
  wants the site moving while he is away, and porting through a stale prototype would cost a second pass for no gain.
- **D71** (2026-11-10, Laptop boss, round IG): Which reel lessons (`ig-design-tips.md` 4b) go in? **Ruling:** adopt (1) no filled
  tag labels (Now, From Gabe, Album / EP, Latest become plain words or go; dead `.release-meta` removed), (2) a sign-up Sending state
  with a guard against double submits, (3) a `--tint` token that mixes the era accent into `--bg-2` / `--line` in OKLCH, **shipped
  at 0%** until the owner picks from a 3-option sheet, (4) a redundant-words pass on our own strings (never Gabe's), (5) at most 3
  rules removed where space already groups. Cut: press scale (D47 stands: instant colour swap, no movement), a Menu open animation,
  skeletons (already reserved: 352px player, 16:9 thumbs, CLS 0), IDENTITY 2+1 (waits on Gabe's colours), concentric radii (moot),
  and every pulse / glow / shine / ripple (Hard rule 1). No new motion this round; Home stays within D39 (quotes-off at most 5.54).
  **Why:** each adopted item removes a known AI-default tell or a real defect at no height and no motion; the owner's standing taste
  is to see palette options before one rolls out, so the tint lands as a one-value switch, not a change of look.
- **D73** (2026-11-10, Laptop boss, from `ai-design-workflow.md` 3.9-3.10): How is a round judged? **Ruling:** every round ends
  with an independent evaluator (glucak-advisor, never the agent that built it): viewport-size shots at 390x660 and 1280x800,
  before and after, scored 1-5 on design quality and originality (each counted twice), craft and function, with the calibration
  examples in the round plan, a hard-rule check, and at most 3 ranked fixes that become the next round. **Why:** builders grade
  their own work too kindly, and a fixed rubric keeps rounds comparable; the boss still makes the final call.
- **D75** (2026-11-10, Laptop boss, round IG2, `docs/review/round-ig2-plan.md`; eval fix 2): Do the white `.tab` section labels go?
  **Ruling:** the label stays a plain word on every page: the exact nav word, 16px or more, 4.5:1, inside the same heading as the
  phrase (D6). Only its form is open: the designer shoots 4 directions (the crate tab as built as the control, the word unfilled on
  the rule, the word as a line inside the band, one from Gabe's world, never a pill) and the boss picks at the gate on D6, the px it
  frees above RISE at 390, and "not a filled label". If none beats the control, the crate tab stays. **Why:** the tab is deliberate
  (DESIGN 1 item 2) and is the condition D6 set for keeping the slogan as headings; the eval's premise "where the heading already
  says it" doesn't hold on Home, where the heading is "Live It Loud", not "Shows". But the filled block is the same pattern D71
  removed elsewhere, and the hero reserves `--tab-h` for it, so its form is worth a measured look, not a guess.
- **D77** (2026-11-10, Laptop boss, round IG2): Scope after the 4.0 review. **Ruling:** build eval fix 1 (Spotify's Play pressable on
  the first 390x660 screen, measured with Spotify unblocked) and fix 3 (About's right column at 900px+ holds Listen / Shows /
  Patreon at its top), the label per D75, and drop the two middle-dot meta lines (the 19a two-span pattern). Cut: the footer
  "LISTEN. SHOWS. JOIN." (echoes Gabe's slogan; `server.js` inserts "Shop." into it, a Desktop claim), outlined ghost buttons (they
  are how one accent fill per view works, and touch every page), the 1280 near-black lower hero and the glow (eval: keep), the
  placeholder chip (absolute, frees no height; goes with Gabe's colours). From the research: the 4-directions step for this one
  component and the named-defaults "never" list in every designer brief; palette directions wait on Gabe's colours (D35). Home
  stays at most 3631px quotes off at 390x660. **Why:** at most 3 visible changes per round keeps the evaluator's before/after
  readable (`ai-design-workflow.md` 3.12); listen is main action 1 and most fans arrive on phones.
- **D79** (2026-11-10, Laptop boss, round IG2 gate, `docs/review/ig-round2/gate.md`; D75): Which section label? **Ruling:**
  direction 2 of the sheet (`docs/review/ig-round2/design/labels-sheet.png`): the exact nav word, `text` 700, 17px, no fill,
  standing on the band's 4px rule, inside the same heading (D6); `--tab-h` 34 -> 24px; sub pages show their first band's rule.
  Built exactly as DESIGN 20a. Rejected: 3 (Home 3714px, over the bar; 4.05:1 on About's photo, an eyebrow), 4 (3.80:1 on
  About's photo, read sideways, phrases 7% smaller). **Why:** the only direction that beats the control on all three gate tests:
  same D6 terms, 10px back (Home 3621), no filled block, worst pixel 14.3:1. Supersedes DESIGN 1 item 2's white tab.
- **D81** (2026-11-10, Laptop boss, round IG2 gate; amends D77): Spotify's Play on the first 390x660 screen (DESIGN 20b)?
  **Ruling:** HELD as an owner / Gabe option, not built this round. Neither the player swap nor 20b's spacing cuts go in (the
  cuts only serve Play). Shots kept: `20b-home-390-before-unblocked.png` (today) vs `20b-home-390-rec.png` (80px player).
  **Why:** the measurements leave no version that keeps the playlist as Gabe asked for it ("embedded Spotify playlist player near
  the top, like Thousand Foot Krutch", CONTEXT): with the 352px player Play needs 142px and every listed source together gives
  138.8, and Spotify's current 152px compact player also drops the track list and still misses. The 80px player is a client-facing
  change to a named request, made while the owner is away, at a size Spotify's generator no longer offers, with a 28px Play (under
  our 48px floor) that still misses 320x568. The owner decides, with Gabe if he wants.
- **D83** (2026-11-10, Laptop boss, round IG2 gate): About from 900px and the middle-dot lines (DESIGN 20c, 20d)? **Ruling:**
  approve both exactly as written: the setlist (Listen / Shows / Patreon, three 2px-ruled rows in the display face, no fill;
  phones keep the solid Patreon button), not the outlined-button fallback; the two meta lines become two spans (word `text` 700,
  date `muted`, a literal space between). No new words. **Why:** the setlist makes the header's LISTEN the view's one accent fill,
  uses the site's own ruled-list language instead of a CTA stack, and costs phones nothing; 20d removes the meta-string tell and
  makes the release kicker one line at 390.
- **D85** (2026-11-10, Laptop boss, round IG2 gate): How are "Spotify blocked" shots taken? **Ruling:** not with
  `Network.setBlockedURLs` (the embed is an out-of-process frame and loads anyway, the designer found). Launch Chrome with
  `--host-resolver-rules="MAP open.spotify.com ~NOTFOUND, MAP *.spotify.com ~NOTFOUND, MAP *.scdn.co ~NOTFOUND"` for blocked
  shots and without it for unblocked ones; say which in every shot note. Earlier "blocked" shots had Spotify loading. **Why:** the
  heights don't change (the box is reserved), but the evaluator's before/after must show what a fan sees in each case.

## D87 (Laptop, 2026-11-11): Round IG3 gate (DESIGN 21)
- **21a: direction 1, "the ledge"** (the rule steps up 4px under the word as a solid trapezoid), not the designer's recommended
  direction 2. Why: at 390 the open outlined "tab line" reads as an outlined, tappable button sitting beside the outlined
  placeholder chip: the same box/pill tell rounds IG and IG2 removed. The ledge ties the word to the rule with no box and no
  tap affordance; contrast within the control's (12.46 / 10.62 / 17.32). Zero height, no motion.
- **21b approved** (rules-stroke arrow per setlist row, diagonal arrow for Patreon, existing hover underline / focus ring /
  pressed swap). **21c approved** (chip moves to the footer's top rule, only while the era is Placeholder); Footer.astro claimed.

## D89 (Laptop designer, 2026-11-11): Round IG4 spec, the texture family and the last clichés (DESIGN 23). Proposed; boss / owner confirm
- **Texture family** (owner's note: the hero riso "in different ways" on the other images): one print shop, a different screen
  per slot, every ink and paper from the era file (`tools/photo/texture.mjs`, re-run per era). Phones' hero A: night riso (black
  stock, accent + white, fine screen, plates held down under the name). Hero B: unchanged. Live It Loud photo: white line screen on
  black. Rise photo: photocopy toner. Push Past Fear photo: two coarse plates, 1% off register. About's crowd: halftone only in
  the shadows. Not treated: covers, IDENTITY art, Logo D (never tinted), YouTube thumbnails (his title cards, other artists'
  names, platform logos), the poster (already one ink, coarse; a Desktop file). Text over every image 4.5:1 or better (p95).
- **Item 1:** the drifting accent glow goes; from 900px the hero's ground is a static 1-bit screen of the pallet wall behind Gabe
  (Kealey, above every head), a mask painted tone-on-tone (`--line` 50% into `--bg`). Home: 0 animations at rest.
- **Item 2:** SHOWS (hero, 404) and Full bio (Home) become the setlist arrow link (`.go`): one button per row.
- **Item 3:** band and footer rules in `--line`; the ledge carries the only white, under the word.
- **Item 4:** the section word stays (D6) and becomes a real label: display face 900, `--step-1`, nav case, inside the 24px reserve.
- **Item 5:** footer "Listen Shows Join", no periods; `word-spacing: 0.375em` keeps the fitted width, so `--w-close` and the footer
  height don't change; the placeholder chip loses its box (dashed underline), so the Motion switch is the footer's one outline.
  Desktop follow-up (owner OK): "Shop." -> "Shop" in `src/lib/products.js` 118.
- **Item 6 (M1):** the Menu sheet opens from the Menu button (scale 0.95 -> 1, 200ms ease-out in, 160ms out), motion-on gate only.
- **Why:** the owner asked for the texture across the site; one shop with varied screens keeps one family without a filter
  sampler; items 1-5 remove the clichés the IG3 eval named and move no height (Home 390 3601, 320 3724, 1280 4277). Six visible
  changes exceed the 3-change habit (ai-design-workflow 3.12): the boss may build in two passes (DESIGN 23e).

## D91 (Laptop designer, 2026-11-11): Round IG5 spec, inner pages (DESIGN 24). Proposed; boss / owner confirm
- **24a grounds** (900px+, static, tone-on-tone `--line` 50% into `--bg`, never under text below 4.5:1; measured worst 12.28:1):
  404 = our own seeded quarter-arc Truchet (96px cells, 4px stroke, 9 KB SVG); Music = one spiral record groove with 9 tracks
  and a blank label under RISE (3 KB SVG); Shows = the hero wall mask turned over, a strip under LIVE IT LOUD (0 new bytes).
  Generator `tools/photo/grounds.mjs` (colourless masks, era contrast check). No Book of Shapes file. If the owner reads the
  Shows wall as a repeat, Shows drops it alone.
- **24b For venues:** one `ForVenues.astro` on Shows (under Watch) and About (above Find GLucak); the copywriter's words; until
  `BOOKING_EMAIL` exists it ends on `LISTEN ->` with no chip and no "coming soon"; then an outlined Request a show plus the
  address as text. Instagram DM held (Q43).
- **24c** "New here? Start with Go" on the Releases heading row (`START` constant, Gabe's pick Q44). **24d** "Wrong turn" with no
  period, blank ledge removed, `--w-lost` 4.9704 / `--w-lost2` 1.9318.
- **Why:** the print shop reaches the inner pages with each page's own subject and no photo repeated on them; bookers get a
  finished block today; Home is untouched (3601 / 4277 measured).

## D93 (Laptop designer, 2026-11-11): Round IG6 spec, the IDENTITY era from Gabe's real art (DESIGN 25). Proposed; boss / owner confirm
- **Era** `src/eras/identity.json` (written): bg `#05024c` (the cover's indigo), text `#f4f2ff`, **accent `#d93cfb` magenta** (the
  LED / flare / jump-photo light), accent-text = bg, muted `#b7b2e3`. Picked from three on `docs/review/ig6/design/era-candidates.png`:
  cyan (the tracklist lettering) is brightest on the button but fails as a print ink under text (3.40:1) and adds a second hue
  family; blue-violet passes only as a pastel. Magenta: Listen 5.35:1, fill vs page 5.35, every print check passes. Replaces the
  D35 guess; the site defaults to IDENTITY (content.js 3), the Placeholder chip goes with it.
- **Bug for the coder first:** `Base.astro` 57 / `edit/index.astro` 18 print `:root{era}` before global.css's `:root`, so no era
  ever applied; becomes `html:root{...}`.
- **Prints re-skinned** (texture.mjs over the IG4 names; run.mjs as new `b-riso-identity-*`, `c-poster-identity-*`); poster swap
  is `src/lib` (owner OK). Grounds unchanged (colourless), check PASS.
- **Gabe's CD photos as he graded them:** jump fills Home's empty Push slot (900px+), studio closes About's actions column, the CD's
  live shot opens Shows' "Book GLucak"; looking held. Shows drops the Kealey wall strip (repeat). Cover files
  `covers/identity(-320/-960).webp`, Home's Join art and releases.json point to them.
- **Music:** IDENTITY as the CD: cover, countdown, 12-track list; Scenic Route one size up, linked, "Single, out Jan 15. His
  favorite." (copywriter to confirm), no accent (2 + 1).
- **Why:** CONTEXT says launch in IDENTITY's colours; the real art now exists. Home 390 stays 3484 (cap 3601).

## D95 (Laptop coder, 2026-11-11): Round V1 built, the Videos page (DESIGN 26) plus three IG6 eval fixes
- **Videos page** `/videos/` (`src/pages/videos/index.astro`, `VideoCard.astro`, pure `src/components/videos.js`): Scenic Route live (lead), Thank you
  Riverside! (privacy-cropped poster, 800x450, only the back of one head left), then music videos newest first, lyric video last, one link
  to the Shorts tab. No iframe until a press. Posters are our own copies of YouTube's thumbnails (`tools/fetch-video-thumbs.mjs` now honours `crop`).
- **Rulings applied (main session):** every video except the two FLASHING ones is treated as cleared by Gabe; Riverside credit is "GLucak on
  YouTube" until Gabe names the filmer; a "with X" line only when X is in the video's own YouTube title (so You're Not Alone has none; Emily
  Mae is on the Go lyric video, Micah Haun and J-BOY on theirs). A test enforces it.
- **Nav:** Videos joins the nav (Music, Shows, Videos, About); the phone bar's Watch goes to `/videos/` everywhere (the Shop swap markers are
  untouched); Home and Shows "Watch" headings link to it; sitemap + share image (`og/videos.png`; the other four og files were reverted, not re-made).
  `public/js/app.js`: cards become real Play buttons, `autoplay=1` only inside the press handler, one player at a time. Nav container breakpoint 36rem -> 44rem; the Menu sheet scrolls.
- **IG6 eval fixes:** (1) Music: the IDENTITY block (now under an h2) leads the page, above the Releases grid (Music 390 height unchanged, 4404). (2) Home
  jump slot: `cd-jump-*` replaced by `cd-live-portrait-352/704.webp`, a 4:5 face-level crop of the CD inside-live frame, graded as Gabe made it
  (same as the other CD photos, D93 / DESIGN 25h: no print), no metadata; his glasses, cap and mic read clearly; the old jump files are deleted.
  (3) apple-touch icon ground `#111111` -> `#05024c` (`prototype/tools/resize.mjs`; only that icon regenerated and copied).
- **Measured:** Home 390 = 3735 (unchanged), Videos 390 3037, 1280 2006, 0 running animations on Home / Videos / Music / Shows with motion on and reduced, no overflow.
  `npm test` 227/227 (`test/v1.test.js`: 14 tests). Home and Music keep their Spotify iframe; no YouTube iframe is in any built page.
