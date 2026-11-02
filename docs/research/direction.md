# Direction: what we propose to build for GLucak (for the owner to approve)

Boss, 2026-11-02. Built from every file in `docs/research/` and board #1. Research only: nothing is built until you
approve this, then `DESIGN.md` comes next. "Proposal" means our idea, not something Gabe asked for.

## 1. The concept in 3 sentences
**"Live It Loud":** Gabe's own slogan is the spine of the home page. The four phrases (Rise / Live It Loud / Push
Past Fear / The Time Is Now) are the headings of the four parts a fan needs (music, shows, his story, IDENTITY +
sign-up), and the whole look re-colors per release, starting with IDENTITY.
Templates give every artist the same stock lines and fixed colors, and Gabe's peers' sites are stale, script-loaded
or link lists (genre-and-standouts.md section 3, artist-sites.md); his site plays the music on the page, lists real
dates that drop off by themselves, and nobody else can copy the slogan.

## 2. Home, top to bottom
Target: the whole page in about 5 phone screens or less (wix-templates.md).
0. **Header.** Logo left; nav **Music, Shows, About**; a **Listen** button. See-through over the hero, solid after
   scrolling. Phones: menu button. *From:* riverside-layout.md, references.md.
1. **Hero (Rise starts here).** "GLUCAK" huge in a heavy condensed face, the **slogan as one big line under it**
   (2 lines on phones); two buttons **Listen / Shows**; one static "Now" line (next show if one is close, else the
   newest release). Two versions go into the prototype for you to pick: **A** the name over a full-bleed tinted live
   photo, **B** a live photo set into the name (G[photo]LUCAK). **Not full height**, so the player shows below it.
   Still photo at launch, no video. Final type waits for Gabe's logo files. *From:* standouts-visual.md
   (Kalkbrenner, Inherited), Manafest and Gigfolio two-button hero, Riverside hero strip, genre-critique.md, board
   #1. Rulings D4, D14.
2. **RISE** (small label "Music"). The **real Spotify playlist player** (official embed, 352px tall, full width),
   with **the top of it visible on the first phone screen (390 x about 660px)**. Under it: "Open in Spotify / Listen
   everywhere" (fans who aren't logged in only get 30-second previews). Then the **latest release** card: cover as
   made, "Listen on:" row. On desktop the player can sit inside the hero. *From:* TFK, rap-artist-events,
   references.md section 6, genre-critique.md.
3. **LIVE IT LOUD** (label "Shows"). **Next shows**: on phones one big gig-poster style show plus two short rows;
   button says Tickets or Details, no button when there's no link; open mics as short rows. Empty state: "No shows
   booked right now", Follow, Request a show, past shows below (KJ-52). Then the **latest video** from his YouTube
   channel (updates itself, loads on tap). *From:* genre-and-standouts.md 4.5, genre-critique.md, artist-sites.md.
4. **PUSH PAST FEAR** (label "About"). A short version of his story in his words, saying the mission plainly; one
   live photo; **Patreon** button; link to About. *From:* CONTEXT.md, genre-critique.md (faith caution).
5. **THE TIME IS NOW** (label "Join"). **Email sign-up first** (one field, a clear promise, e.g. "Get the
   next show and every new song first": proposal), then "IDENTITY, 2027". Countdown and pre-save appear only once
   there's a date and link; flips to "Out now" on release day. *From:* genre-critique.md, hiphop-artist template.
6. **Footer** (every page): six labelled social links, Patreon, email sign-up (on Home, part 5 is it), slogan,
   automatic year, **Motion on/off** switch, and a closing line "Listen. Shows. Join." *From:* CONTEXT.md, nobigdyl.
- **Phone bottom bar, every page, always visible:** Listen / Shows / Watch / Join. This plus the header is how
  Listen and Shows stay one tap away everywhere. *From:* Riverside `MobileBar`, artist-sites.md. Ruling D8.

## 3. Pages
**At launch (4, as Gabe asked for "3 or 4"):** Home; **Music** (releases as a cover strip with listen links, the
IDENTITY 12-track block filling in toward Scenic Route, SoundCloud); **Shows** (Date / Venue / City / Tickets list,
"Played" list of past shows, booking email); **About** (bio, photos, Patreon, socials, booking email).
**Built in the background at launch:** Gabe's simple edit screen (shows, release links, bio) and a hidden shop slot
(a nav slot + link to the Fourthwall store, off until the shop opens). A short **privacy page** (email sign-up,
Spotify embed), linked from the footer only.
**Later, one at a time:** Videos, Photos (his and Dave Bahm's art), Contact/Booking form, Shop (switched on), a
full IDENTITY page (proposal), producer notes per track (proposal), a press kit page for venues (proposal).

## 4. Look
- **IDENTITY era system:** one small file per release holds 2 colors + text + background colors, cover art, a
  texture and the era word. Change the file and the site re-colors. A test fails any era whose colors make text hard
  to read. **We still need the real IDENTITY art and colors from Gabe**; until then we design with placeholders.
- **Type:** two families. A heavy condensed display face, huge and all caps (candidates: Archivo Black/Extra
  Condensed, Big Shoulders Display, Anton; not Bebas Neue, overused) and a plain sans for reading. The font is not
  part of the era file: changing it is a reviewed change. Check the slogan still wraps well on the smallest phones.
- **Color:** dark (near-black) background, one strong era color used sparingly (about a tenth of any screen).
- **Photography:** his real live photos only, tightly cropped, tinted in the era color (duotone). **Album covers and
  Dave Bahm's art are shown exactly as made.** Test the tint on his real photos first (dark shots can go muddy).
- **The three genres in one look:** rap = the big type; rock = a still grain texture; EDM = a soft, slow glow of
  era color behind the hero and player.
- **Motion (hard rule, Gabe is an epilepsy survivor):** nothing flashes more than 3 times a second, no strobe, no red
  flashes, no glitch or distortion effects, no autoplaying video with cuts. Headings fade in once (under a second);
  the glow drifts over 15+ seconds. One moving thing per screen. No scroll tricks. **All motion stops** when the
  phone/computer asks for reduced motion, and with the footer Motion switch.
- **Speed:** light first load, only one live embed (Spotify); other embeds load on tap; no jumping layout.

## 5. Tools picked (from shop-and-tools.md; prices are vendors' list prices on 2026-11-02)
| Need | Pick | Runner-up | Money? |
|---|---|---|---|
| Shop (later) | **Fourthwall Free**: $0 while switched off, 0% platform fee on own products, card fee 2.9% + 30c | Bandcamp (10% + card fees), first choice if he already sells there | Per-sale fees only. **Condition:** confirm Fourthwall allows self-shipped CDs/vinyl |
| Email list | **Kit Free**: $0 up to 10,000 subscribers, CSV export | Buttondown ($9/mo at 500) | Free. Every email needs a postal address: a P.O. box is **about $100/yr (unverified)** if he won't use his own or Kit's |
| Shows | **Our own dated list**, Gabe edits it, past shows drop off by date | Bandsintown, free, as an optional second listing for reach | Free |
| Music / videos | Spotify embed (no account), YouTube channel feed (no key) | - | Free |
| **Hosting** | **A Node host** (shows are picked per visit so past ones vanish on time; also the edit screen and forms). GitHub Pages can't do this | Riverside's host, if reusable | **Costs money: owner decides** |
| Domain + domain email | glucak.com (check it's free) + e.g. gabriel@glucak.com | - | **Costs money: owner decides** |

Owner question: who confirms Gabe's US sales-tax duties? (vendor statements are not legal advice).

## 6. What we rejected and why
- **Copying a template (Wix, Squarespace, Bandzoogle, Framer, Webflow):** fixed colors, motion we can't control,
  weak Spotify support; our Riverside base (D2) does the era swap, motion rules and edit screen.
- **Splash / "Enter site" page:** one extra tap is where Instagram visitors leave.
- **Carousels and moving tickers:** they hide messages and facts a fan needs to read.
- **Autoplay sound, Kalkbrenner's site-wide sound player:** the Spotify player is the player; nothing plays unasked.
- **Scroll-jacking / pinned scroll stories:** worst on phones.
- **3D / WebGL album world, long loaders:** slow phones, costly to redo per album.
- **Glitch / distortion video (Lady Gaga), strobe:** breaks the epilepsy rule.
- **Clever nav labels (e.g. "Mu5ic"):** literal labels, same word everywhere (Puck Live lesson).
- **Giant faint "IDENTITY" word behind the hero:** competes with the slogan.
- **Genre theme switcher:** gimmick, triples design work.
- **Fan-club login:** nothing to log in for yet.
- **Blog:** would go stale; at most a short producer note per track, later.
- **Tinting album covers:** his and Dave Bahm's art stay as made.
- **A line about epilepsy as a site feature:** his story to tell; the bio already does.
- **Shows only updated at build time, Bandsintown as the source:** past shows would linger; open mics undocumented.
- **Shopify, Mailchimp, Stripe Payment Links:** monthly fee while idle / tiny free cap / most work for Gabe.
- **Phone bar that hides on scroll:** then Listen and Shows aren't always one tap away.

## 7. Agreed vs still open
**Agreed by both machines on #1:** the work split (Laptop: DESIGN.md + prototype; Desktop: Chrome, build, tests);
Riverside stack (D2, owner-confirmed); slogan spine, phrase as the big heading and plain label above it; Rise =
player + latest release, Live It Loud = shows + latest video; sign-up before the album date; player top on the
first phone screen, hero not full height; show type (show / open mic) with optional link, Tickets / Details; no
faint IDENTITY word; Motion switch stays, epilepsy stays out of site copy; shows picked per visit on a Node host;
tint live photos only; the "Now" line; listen-everywhere link under the player; Push Past Fear says the mission
plainly; Kalkbrenner/Inherited/Gaga/Dookie findings (standouts-visual.md). Tool picks: the Laptop's, not contested.

**Still open, my rulings (DECISIONS.md D4-D12):**
- **D4 / D14 Name or slogan as hero:** name leads, slogan one big line under it; hero A (full-bleed photo) vs B
  (photo in the name) both prototyped at 390px, owner picks. Type waits for Gabe's logo.
- **D6 Small labels (Laptop's concern):** keep the spine, but the label is 16px+ on phones, readable contrast, the
  exact nav word, real content right under it. Fails the 390px prototype check -> plain headings win.
- **D8 Phone bar:** always visible; Listen / Shows / Watch / Join (Shop takes Watch's place when the shop opens).
- **D10 IDENTITY tracklist:** a block on Music at launch, its own page later; how much shows depends on Gabe's answers.
- **D12 Era file scope:** colors, art, texture, era word only; the font stays fixed; a contrast test checks each era.
- **Still open for Gabe/owner:** hosting, domain, P.O. box (money); open mics listed or not; the sign-up's name.

## 8. Questions for Gabe (owner sends; replaces CONTEXT.md "Still needed")
**If you only have 5 minutes (these protect the Jan 11 launch):** the Spotify playlist link (1), and your logo files
+ 3 live photos by about Nov 9 (2a).

1. **Spotify:** the link to the playlist for the home player (which one should fans hear first?).
2. **Art, in two steps.** (a) By about **Nov 9**: logo files (and Dave Bahm's version) + 3 live photos (who took
   them, OK to use?). (b) By about **Nov 30**: IDENTITY art and colors, more live and press photos, and any live
   clip, especially Scenic Route.
3. **Shows:** the upcoming list (date, venue, city, ticket link); roughly how many a month, open mics vs full shows;
   list open mics on the site at all?; a Bandsintown page already, and would he enter shows in two places?
4. **Booking:** which email should booking requests go to for now?
5. **Domain:** glucak.com OK (we check it's free)? The long slogan domain as a redirect too? Want gabriel@glucak.com?
6. **Email list:** an existing list (where, how many)? What to send and how often? Which postal address in the
   emails (own, P.O. box, or Kit's)? OK with a small Kit credit line? A free thing for signing up?
7. **IDENTITY:** release date and pre-save link when known; how many singles out by launch and when the rest come;
   OK to show "12 tracks" and titles before he announces them?
8. **Shop:** sells anywhere already (Bandcamp?); what (shirts, CDs, vinyl, how many); will he pack and post CDs,
   and from what address; print-on-demand or his own stock; which countries.
9. **Bio:** the new bio in January (we keep the Spotify one until then; we draft the rest of the text).

## 9. Next steps after you approve
1. **Owner:** send Gabe section 8; decide hosting and domain. *Done when* sent and a host is picked.
2. **Laptop (designer): DESIGN.md.** *Done when* it covers every item in sections 2-4: home order, nav and phone
   bar, era file fields, provisional type pick (locks when the logo arrives, D14), data for releases / shows / era, motion rules, and both machines OK it on #1.
3. **Laptop (designer): static Home prototype in `prototype/`**, placeholder era. *Done when* screenshots at 390px
   and 1280px show: player top on the first phone screen; slogan wraps at 320px; labels pass D6; Home about 5 phone
   screens or less; all motion stops under reduced motion; nothing flashes.
4. **Desktop + boss:** review the prototype in Chrome at both widths against step 3; send back fixes or approve.
5. **Then the build (Desktop/coder):** Astro from Riverside, Home first, per DESIGN.md. Not before steps 2-4.
