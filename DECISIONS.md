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
