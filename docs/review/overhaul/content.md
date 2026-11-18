# Content + promises review (Copywriter, 2026-11-18)

Read: copywriter brief, CONTEXT, README (Nov 2), Gabe's Nov 6 answers, email digest, social-content, design-repos-b. Rendered /, /music/,
/shows/, /about/, /videos/, /shop/, /edit/, /nope from localhost:8095, plus `src/components/content.js`, `src/lib/shows.js`, `src/data/*.json`.
Nothing edited except this file. Voice-checker prose classes applied: no em dashes, no "elevate/journey/unleash", no triplet padding in
pages or components. The copy is already clean; the gaps are missing blocks and stale facts.

## 1. Promise checklist (digest table + 2 extras)
Counts: **done 10, partly 5, missing 2** (17 items).

| Item | Status | Where / what is true today |
|---|---|---|
| Spotify playlist player near top of Home | done | Home hero "Music Rise" block (iframe, skip link, fallback text); also top of /music/ |
| Slogan prominent; four words as Home headings | done | Hero slogan; headings Rise (Music), Live It Loud (Shows), Push Past Fear (About), The Time Is Now (Join + IDENTITY); footer + meta |
| Releases, shows, videos in one place | done | Home: Who I Am tile, 3 show rows + poster, 3-video row |
| Past shows drop off ("Played") | done | /shows/ "Played"; Nov 2 to 17 already moved |
| IDENTITY countdown + pre-save | done | Home bottom and /music/: "August 13, 2027 268 days to go" (correct) + Pre-save. Build-time count (daily workflow) |
| Era swap in one change | done | `src/eras/identity.json` / `placeholder.json` (not visually tested by me) |
| **Edit screen: add shows, update release links, change bio** | **partly** | /edit/ has two tabs only: **Shows** and **Products**. **No release-link editing, no bio editing.** Release links live in `releases.json`, bio in `about/index.astro`. Promised Nov 3 and Nov 6 |
| Edit sign-in + backup | done | Password sign-in card; "Download a backup" |
| Add to calendar | done | "Add to calendar" on Riverside poster and rows (.ics per show) |
| Photo gallery | **missing** | No gallery anywhere; photos are section decoration only. Gabe ticked "all of the above" |
| Booking or contact form | **partly** | "Book GLucak" block on /shows/ and /about/ exists, but `BOOKING_EMAIL = null` (`src/lib/shows.js:49`): **no button, no address, no form**. The block ends on "Listen". A venue cannot book him from the site |
| Merch / shop in the background | done | /shop/ built, hidden from nav and sitemap, items labelled Sample |
| Email sign-up | **partly** | "Join" form on every page, Kit not set up; copy only promises a heads-up. Gabe wants Scenic Route as the sign-up gift |
| Patreon link + bio | done | Patreon on Home About band, About, footer. Bio is on About but it is the OLD Spotify bio (see 2) |
| Intuitive, versatile, cool; nothing hard to find or stale | **partly** | 4-item nav is good. Stale: bio, "Two albums", Dec 4 show, no booking path |
| Latest videos update themselves (extra) | **partly** | "Latest" = newest row of `videos.json`, hand-fed (newest Nov 10). No feed fetch in `daily.yml` or `tools/` |
| Discord link (extra, Gabe Nov 2) | **missing** | Not on the site. Digest says ask before linking; still an [ASK GABE] |

## 2. Every visible string, page by page
### Home /
- KEEP hero slogan "Rise, Live It Loud, Push Past Fear, The Time Is Now." (his, verbatim).
- KEEP Now line "Open mic today: Chambers 19, Doylestown, PA" (plain label, accurate, per-day).
- CHANGE meta "GLucak: Rise, Live It Loud, Push Past Fear, The Time Is Now." (says nothing about the music). Fix: "GLucak: independent producer-rapper and DJ from Horsham, PA. EDM, rap and rock with raw, faith-based lyrics. New music, shows and videos." (his words; Horsham from his Nov 13 bio).
- CHANGE "Loading the Spotify player. Not showing? Use Play full songs on Spotify below." Fix: "Player not loading? Play it on Spotify below." Shorter on a phone.
- KEEP "Who I Am / Single / Latest single Nov 13, 2026 / Listen" (accurate).
- **ADD: Welcome Home (Dec 18) is not on Home.** Its pre-save (`wingsmusic.lnk.to/383142-WelcomeHome`) is only in the Music crate. Under the Who I Am tile: "Next: Welcome Home, Dec 18. Pre-save."
- KEEP quote "God will always be with you, and will never leave you in the valley. Trust me, I know." (approved, credited, linked).
- CHANGE Riverside poster "JAN 16 / Add to calendar / Riverside, Horsham, PA / 6:00 PM": Gabe confirmed **free**. Add "Free". Best fan fact on the page, missing.
- CHANGE video row: first card "The question we all ask, but ignore inside" is a Nov 10 short and reads as a stray thought as the page's "latest". Prefer featured videos until the feed is wired.
- CHANGE About band bio ("Despite facing various difficulties and struggles over the years, Epilepsy survivor and Producer-Rapper/DJ GLucak has shown no intent to give up ..."): one 33-word third-person sentence, old bio. See About.
- KEEP Patreon "Back my projects and merch. Get early access to songs only the inner circle knows exist." (his phrases, first person; pending his OK of the line).
- KEEP sign-up "Join the list. Scenic Route is coming Jan 15, and the first listen will be yours." (honest until Kit exists). After Kit + the file: "Join the list and get Scenic Route free." [ASK GABE: giveaway file, Kit OK]. Confirmation "You're in. We'll tell you the day Scenic Route lands." KEEP (curly).
- KEEP IDENTITY block ("268 days to go" is right today).
- CHANGE footer credits "Photo: Alexander Kealey. Video still: Joseph Lucak. Video stills: GLucak on YouTube. Photos: from the IDENTITY CD. IDENTITY cover: GLucak. Logo: Dave Bahm." Six fragments on a phone. Keep the credits (they are a promise) but on one line: "Credits: Alexander Kealey, Joseph Lucak, GLucak, Dave Bahm", full list on /about/. [ASK GABE: CD photo credits].

### Music /music/
- KEEP description "Listen to GLucak: the playlist, every release, and IDENTITY."
- KEEP tracklist (12 tracks, CD back, "WYLD LOVE") and "All songs written, recorded, produced, mixed and mastered by Gabriel Lucak".
- KEEP "Out Jan 15", "Pre-save" on Scenic Route and Welcome Home, "Remix album" tag, all three albums shown. Every date matches today's facts.
- KEEP "New here? Start with Go". But it names no sound: ADD one line (section 3).
- KEEP quote "WHO I AM should depend on the one who came for me" (verbatim, his capitals).
- ADD beside track 12, his words: "I've been playing this one live a lot lately, open mic after open mic." (Instagram, Oct 25). A Scenic Route lyric line is allowed (Nov 6 #18) but D67 caps one quote per page. [ASK GABE: which lines].

### Shows /shows/
- KEEP rows, "Today / Tomorrow", times, "Played". Dates correct.
- CHANGE "Music and Arts Center of Airport Square ... DEC 4 ... 5:00 PM": Gabe said that venue **cancelled the night of Nov 6**. Unclear if Dec 4 stands. Hold the row until he says. [ASK GABE]
- CHANGE Riverside row: add "Free".
- **ADD intro line (none today):** "Mostly open mics around Horsham and Doylestown, plus a full show at Riverside on Jan 16. Come hear unreleased songs." ("unreleased songs" is his Oct 26 line: "come out if you like free merch, live music and unreleased songs").
- Book GLucak: "Horsham-based producer-rapper and DJ. Open mics and full shows, often with guitarist Fran Carroll." Accurate, plain. **CHANGE the action**: no address means no button. Until the booking address exists, point "Request a show" at the Instagram DM (`instagram.com/glucakofficial/`, already in SOCIALS). A "Book GLucak" heading that cannot book is a broken promise.

### About /about/
- KEEP subhead "Epilepsy survivor / Healed by Christ since 2009" (his Nov 6 #10 request). Nov 13 email holds whether it stays.
- **CHANGE bio: stale.** "Two albums and numerous singles and EPs ... brand-new content and music for 2026 and 2027" and "upcoming 3rd album (rumored to be his best work yet)" are the old Spotify text. His new bio is already live on Spotify (Nov 13). "Two albums" also contradicts his own count of three that the Music page shows. Swap to the new bio once "Reforaged" is answered; interim: keep paragraphs 1 and 3, drop 2.
- ADD a first-person opener from his own lines: "The hours in the studio. The energetic live performances. The time spent tweaking everything to hit just right. It's more than a hobby." (YouTube, Nov 5) so About sounds like him, not a press kit.
- CHANGE meta "GLucak: Epilepsy survivor, Producer-Rapper/DJ, making energetic music with faith." leads the search snippet with epilepsy. Fix: "GLucak: Horsham producer-rapper and DJ. Energetic, faith-based EDM, rap and rock."
- KEEP Patreon line + button. REMOVE the Spotify/YouTube-only "Find GLucak" if the footer already carries every social.

### Videos /videos/
- KEEP "Scenic Route / Live at Crooked Eye Brewery", "Thank you Riverside! / Live at Riverside, Horsham", "Music videos". The flashing guard works.
- CHANGE "Shorts most weeks:  On YouTube" (double space, no verb). Fix: "New shorts most weeks on YouTube." (about 15 uploads Aug 31 to Nov 5 supports "most weeks").
- KEEP captions "feat. J-BOY", "with Micah Haun", "feat. Emily Mae". [ASK GABE: Emily Mae on You're Not Alone is already on his open list].

### Shop /shop/
- KEEP "Preview: the shop is not open yet" and "This shop is a preview. Everything here is a sample and can't be bought." Hidden from nav and sitemap.
- CHANGE items are **invented**: GLucak tee, hoodie, sizes S to 2XL, IDENTITY vinyl. Gabe's real merch: backpacks, hats, CDs, stickers, one water bottle; vinyl only planned; the 50 IDENTITY CDs are giveaways. Rename the samples to hat, backpack, CD, stickers. "SampleSample: GLucak tee" prints the word twice (tag + title): drop "Sample:" from the title.
- CHANGE "once Gabe's merch is ready": straight apostrophe, third person on a fan page. Fix: "The real photo and price go here once the merch is ready."

### Edit /edit/
- KEEP the labels and hints: "Change anything, then press Save. Past shows are grey: they stay on the Shows page under Played." / "One file with your shows, products and photos. Keep it somewhere safe." / "This site never takes card details." Plain and clear.
- ADD Releases and Bio tabs (top-10 #3) and say in the intro what can be changed.

### 404 /nope
- KEEP "Wrong turn. That page isn't here. The music is." (short, his tone). REMOVE the sign-up band there; end on Listen.

### Cross-site
- Quotes: rendered text uses curly apostrophes ("You're", "can't", "Mike's", "M.O.M's"); the only straight one is shop "Gabe's merch".
- The "Join the list. Scenic Route ..." band is on all 8 pages. Fine on Home, Music, Shows; drop on 404 and Shop.
- Dates all current: Who I Am Nov 13 (out), Welcome Home Dec 18, Scenic Route Jan 15, IDENTITY Aug 13 2027, Riverside Jan 16 6pm, open mics through Dec 4.

## 3. Missing for fans and venues (facts we have)
1. **What he sounds like, one line.** Under the hero and in the Home meta. From his Nov 2 words ("EDM, Rap and Rock tri-hybrid ... raw and faith-based ... all high energy"): "EDM, rap and rock. Raw lyrics, real faith, high energy."
2. **How to book him.** Set `BOOKING_EMAIL` (address on glucak.com forwarding to his Gmail, promised Nov 6) or the DM link now. Add "Solo, or with guitarist Fran Carroll." (already there). [ASK GABE: set length, tech needs, fee].
3. **What is new this week.** Welcome Home Dec 18 pre-save on Home; Riverside "free".
4. **Cost to attend.** Riverside is free; open mics [ASK GABE: cover?].
5. **Where venues are.** Cities show on every row; street addresses exist in data for some and are never shown. Show them once confirmed. [ASK GABE: addresses; M.O.M's, Fox Chase, High Steaks, North Penn VFW have none].
6. **Radio.** He says Scenic Route is on Montco Radio (Nov 2). "Hear Scenic Route on Montco Radio" is a fact line. [ASK GABE: OK to publish, show name].
7. **Photos.** A gallery was asked for. Build a small one, or tell Gabe it is dropped; do not let it vanish silently.

## 4. KEEP / CHANGE / REMOVE / ADD
| Page / block | Call | Why |
|---|---|---|
| Home hero + slogan | KEEP, ADD sound line | slogan is his; first-timers need one line |
| Home Now line | KEEP | auto, plain, accurate |
| Home Who I Am tile | KEEP, ADD Welcome Home Dec 18 | next event missing |
| Home show rows | KEEP, CHANGE Riverside "free" | fan fact |
| Home video row | CHANGE latest | random short as "latest" |
| Home About band, Patreon, sign-up | KEEP (bio text follows About) | |
| Music player / IDENTITY / tracklist / crate | KEEP | accurate |
| Music quote | KEEP | approved |
| Shows list | KEEP, CHANGE Dec 4 row | cancellation risk |
| Shows "Book GLucak" | CHANGE | cannot book |
| About bio | CHANGE | stale, "Two albums" wrong |
| About subhead | KEEP | his Nov 6 answer |
| Videos | KEEP, CHANGE "Shorts" line | grammar |
| Shop | CHANGE samples | invented items |
| Edit | CHANGE (add Releases, Bio) | promised twice |
| 404 | KEEP, REMOVE sign-up band | ends on Listen |
| Footer credits | CHANGE to one line | phone length |
| Gallery, Discord | ADD or tell Gabe | requested |

## 5. Top 10 content changes (ranked)
| # | Change | Impact | Effort | File |
|---|---|---|---|---|
| 1 | Make booking real: set the address, or point "Request a show" at the Instagram DM until it exists | high (venues, promise) | S | `src/lib/shows.js:49`, `ForVenues.astro` |
| 2 | Replace the stale bio (drop "Two albums" / "rumored"); new bio once "Reforaged" is answered | high | S | `src/pages/about/index.astro`, Home About band |
| 3 | Edit screen: add Releases (title/date/link) and Bio, the Nov 3 and Nov 6 promise | high (owner trust) | L | `src/pages/edit/index.astro`, `public/js/edit.js`, server |
| 4 | One-line "what he sounds like" under the hero and in the Home meta | high (first visit) | S | `Hero.astro`, `index.astro` |
| 5 | Welcome Home Dec 18 pre-save on Home under Who I Am | high (this month) | S | `index.astro`, `content.js` `upcoming()` |
| 6 | Riverside "free" on poster and row; confirm Dec 4 venue | med | S | `lib/shows.js`, `shows.json` |
| 7 | Wire videos to the YouTube feed in the daily job so "latest" updates itself; keep shorts out of "latest" | med | M | `tools/`, `daily.yml`, `videos.json` |
| 8 | Shop samples: swap invented tee/hoodie for his real merch; drop "SampleSample" and "Gabe's" | med | S | `tools/make-shop-samples.mjs`, `products.json` |
| 9 | First-person About opener from his own lines; search snippet leads with the music | med | S | `about/index.astro` |
| 10 | Footer credits on one line; Shorts-line grammar; no sign-up band on 404; shorter player fallback | low | S | `Footer.astro`, `videos/index.astro`, `404.astro`, Spotify block |

## 6. List for Gabe (new, not in the owner's Nov 17 email)
1. Open mics: cover charge or free to watch, and about how long is your set? (one line for Shows)
2. Is Music and Arts Center of Airport Square on **Dec 4** still on after the Nov 6 cancellation?
3. Your new bio says IDENTITY is your **third** album, but you listed three albums already (GLucak Deluxe, Time is at the Essence, Fall Down 7). Which count should the site use?
4. OK to say Scenic Route is on Montco Radio, and what is the radio show called?
5. Booking: what should a venue send you, how much notice, any tech needs?
6. Photo gallery: send about 6 live photos you are happy to show, or skip it?
7. Which Scenic Route lyric line to put beside track 12 (from your Instagram post)?
8. Merch samples: which real item first (hats, backpacks, CDs, stickers, water bottle)?
9. Is M.O.M's in Doylestown the same open mic as "Cheshire" on your old graphic? (name check)
