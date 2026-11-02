# Genre and standouts: how to beat both the templates and the peers (designer, 2026-11-02)

Owner's ask: study Gabe's genre, find what the best sites do differently and what is actually more eye-appealing, then
design something better. `references.md` (Wix, Manafest, TFK, Puck Live, Riverside, Spotify facts) is not repeated here.

Method: WebFetch reads server HTML as text, so it shows structure and copy, not rendered type or color. Visual notes
on genre language (section 1a) come from the artists' album art and press imagery I know, and are marked as such.
JS-only, blocked or dead pages are noted once and skipped. A Chrome screenshot pass of the best five is still worth doing.

## 1. Genre visual language

### 1a. What each lane looks like right now (album art, press, stage; general observation, not per-site)
| Lane | Type | Color | Texture / photo | Motion |
|---|---|---|---|---|
| EDM / electronic | Wide or ultra-light sans, chrome or glow wordmarks, lots of air | Black ground + one saturated light color (cyan, magenta, acid green), gradients that read as stage light | Lasers, haze, crowd silhouettes, 3D renders, "light leaks" | Slow loops, glow, particles; the risk zone is strobe and fast cuts |
| Hip-hop / rap | Heavy condensed or brutal grotesk, huge, tight-set, all caps; also handwritten/marker | Restrained: black, white, one hard accent, or a single loud color owning a whole era (brat green, CHROMAKOPIA's military-olive) | Hard-cropped portraits, flash photography, film grain, photocopy/paper grit | Mostly still; energy from cropping and scale |
| Rock / hard rock | Distressed serif or blackletter accents, stencil, letterspaced wordmarks | Desaturated, high contrast, one warm accent (red, orange) | Grain, scratches, smoke, live shots in low light, hands-up crowds | Little; static posters |
| Faith-based rap/rock (NF, Lecrae, KB, Andy Mineo, Skillet, TFK, Manafest) | Same as their secular lane: they look like the genre, not "Christian" | Dark, moody, one accent per era | Live crowds, raised hands, stage light; the faith shows in words, not crosses or doves | Minimal |

Takeaway: the faith lane's best artists (NF, Lecrae) present as genre artists first, mission second. Gabe should too.
Nobody in these lanes owns the tri-hybrid look, which is the opening.

### 1b. Sites loaded (faith-based peers and lane leaders)
| Site | What it does | What stands out / fails |
|---|---|---|
| NF, https://www.nfrealmusic.com | Label (Capitol) site: hero image, 3 merch items, 4 releases, 15 video thumbs, newsletter | One-word era (FEAR) in all caps owns the page. Fails: no tour dates on Home, no embedded player, videos all link out |
| Lecrae, https://lecrae.com | Era hub for *Reconstruction*: trailer, new video, pre-save, tour, featured single | Strong era-first order (trailer -> video -> pre-save -> tour). Fails: footer says "Copyright 2023", builder text "This newsletter signup form needs a storage option" is live |
| Andy Mineo, https://www.andymineo.com | Title "Music and Stuff" only | JS-only or near-empty; skipped |
| KB, https://kb116.com | n/a | 403 to fetch; skipped |
| Skillet, https://skillet.com | Splash gate: album art, "AFTER THE STORM OUT NOW", 3 buttons, "Enter Site" | Era announcement is instant. Fails: an extra tap before anything; no shows on the gate |
| Hulvey, https://www.hulveymusic.com | Squarespace stack of image-only promo banners (album, merch, film, singles) | Feels like a link-in-bio scrolled long. Same unfinished newsletter placeholder as Lecrae; tour only a nav link |
| Social Club Misfits, https://www.socialclubmisfits.com | GoDaddy one-pager: duplicated "WELCOME MISFITS", photo, bio, socials | Fails hard: malformed `mailto:BOOKING:...` to a different person, "Copyright 2024", no tour, no music, unlabeled icon links |
| Tedashii, https://www.tedashii.com | 301 to an unrelated German game domain | The lapsed-domain failure: the artist's name now points to someone else |
| TFK, https://www.tfkmusic.com | 522 server error (main domain is a "coming soon" page, see references.md) | Dead site for a band with a 20-year career |
| Manafest, https://manafest.com | Gabe's favorite (see references.md) | New finding: the HTML is 810 KB because the logo and hero are inlined as base64; slow on phones |
| Illenium, https://www.illenium.com | EDM: About, Tour Dates, Galleries, Shop, "Phoenix Family" login, "Listen Now" smart link | Named fan community (like Manafest's Fighter Club). Tour dates are script-loaded; no era concept in markup |
| Bring Me The Horizon, https://www.bmthofficial.com | Era site for *POST HUMAN: NeX Gen*, "Church of Genxsis" lore | Era-styled nav labels ("Mu5ic", "L1ve", "M3rch"): memorable, but costs clarity. We keep labels literal |
| Sleep Token, https://www.sleeptoken.com | "Site is undergoing maintenance" | Down; skipped (their lore-driven brand is the reference, not the site) |
| Kendrick Lamar, https://oklama.com | One big photo, stacked text links (music, stores, tour, socials) | Proof that restraint reads as confidence at the top level. Not a model for a growing artist (no content) |

Christian EDM crossover: search found coverage (Rave Jesus' "Rave Revival Tour", Capital Kings, AXIOM Label Group:
https://edmislife.com/editorial/the-top-15-christian-artists-defining-the-sound-of-2026/,
https://relevantmagazine.com/culture/music/4-christian-edm-artists-you-need-to-know/) but no artist sites worth
studying. The lane has no visual leader online. Another opening.

## 2. Standouts beyond the genre
| Site | Recognition | The one idea, executed hard |
|---|---|---|
| Dookie Demastered, https://www.dookiedemastered.com | siteinspire Music | Each of 15 tracks pressed to an absurd format (toothbrush, piano roll). One concept, every page serves it, with a deadpan voice |
| Karma Worlds, https://karma-tracks.com | Awwwards Honorable Mention, Oct 2026 | 166 tracks as a playable card deck in four genre "worlds". Genre as navigation: close to Gabe's tri-hybrid |
| Inherited, https://inherited.band | Awwwards HM, Sep 2026 | Letterspaced wordmark over full-bleed photos and texture: typography alone makes it cinematic |
| Paul Kalkbrenner, https://paulkalkbrenner.net | siteinspire Music | Big lowercase section heads, albums filterable by year, tour as a clean Date / Venue / City table, opt-in sound toggle |
| Alcest, https://alcestmusic.com | siteinspire Music | Era-first (new album + single on top), tour list with "Buy tickets" on every row, US/EU store links. Calm, complete, current |
| Damso, https://damso.com | siteinspire Music | Three nav words and a grid of square photos; the cursor and small UI jokes carry the personality |
| Lady Gaga, https://www.ladygaga.com | Webby People's Voice, Best Music Website 2025 | "Year of MAYHEM": the era name is the hero, and a wall of ~40 thumbnails makes the era feel huge |
| RTRFM, https://rtrfm.com.au | Webby, Best Music Website 2025 (https://www.webbyawards.com/press/press-releases/29th-annual-webby-awards-announce-2025-winners/) | Not an artist, but won by being useful and current over Gaga, Apple Music and SoundCloud x Billie |
| Billie Eilish, https://www.billieeilish.com | big-artist | Root now 302s to the store: the "site" is the shop. Shows that a weak home is a choice, not a fate |

Listings used: https://www.siteinspire.com/websites?categories=music, https://www.awwwards.com/websites/music-sound/
(JS-light, readable). Searches for a recent Awwwards music Site of the Day found none.

What makes them memorable, in one line: **one idea, carried into every page, with everything else stripped back.**
None of the winners does many effects; each does one thing (an era name, a format joke, a card deck, a wordmark) all the way.

## 3. The common failures (seen above, plus the Wix templates in references.md)
1. **Stale or broken = the worst failure.** Old copyright years (Lecrae 2023, SCM 2024), live builder placeholders
   (Lecrae, Hulvey), malformed booking email (SCM), lapsed domain (Tedashii), dead or maintenance sites (TFK, Sleep Token).
   A fan who sees one of these assumes the artist is inactive. Fix: auto year, no field ships empty, domain on auto-renew.
2. **Tour is a nav link to nothing.** NF, Lecrae, Hulvey, Illenium: no dates on Home, or dates only via script.
   Fix: next shows rendered in the HTML at build, on Home, with a real empty state.
3. **Link-in-bio scrolled long.** Hulvey's stacked image banners, Kendrick's link list: every block is "go elsewhere".
   Fix: the music plays here (Spotify embed), the video plays here (facade), the show has tickets here.
4. **Generic template hero.** Full-bleed photo + logo + 4 equal buttons; nothing about the artist except the photo.
5. **Gates and splash pages** (Skillet): one extra tap on a phone is where Instagram visitors bounce.
6. **Weight and slow embeds.** Manafest's 810 KB HTML; template sliders; three iframes loading at once.
   Fix: images as files (AVIF/WebP, sized), one iframe live at a time, the rest behind facades.
7. **Autoplay noise and carousels.** Sound or fast motion on load; carousels hide 4 of 5 messages. Kalkbrenner gets it
   right: sound off, opt-in toggle.
8. **Tiny, unlabeled tap targets.** Icon-only social rows with no labels (SCM, Hulvey). Fix: 48 px targets, text labels
   or aria-labels, one row of six, not twelve.
9. **Clever labels over clear ones** (BMTH "Mu5ic"). Fun once, slows every visit after.

## 4. Differentiators for Gabe
Cost key: **Build** = our one-time effort (S / M / L). **Upkeep** = what Gabe does per update.

### 4.1 The slogan as Home's spine (Laptop's baseline) -- KEEP, with three changes
RISE = hero + Spotify player, LIVE IT LOUD = shows, PUSH PAST FEAR = his story, THE TIME IS NOW = IDENTITY
countdown + email sign-up. Nav stays literal. Desktop's tweak (verb as the big heading, plain label as a small kicker).
- **Why keep:** it is the only idea on this list no peer can copy. The order also matches the brief's priorities
  (listen, then shows, then story, then the album and the list), so the concept doesn't fight the use.
- **Keep the tweak, and make it semantic:** `<h2><span class="kicker">Shows</span> Live It Loud</h2>`. Screen readers,
  search and "find in page" get "Shows", fans see "LIVE IT LOUD". Kicker in the accent color, ~0.8rem, letterspaced.
- **Change 1, the hero:** the hero states the full slogan once as four stacked lines (the type is the hero, a live photo
  behind it). Each section below then "picks up" its line. Not four separate full-screen slides.
- **Change 2, no scroll-jacking:** normal scroll, no pinned sections, no scrubbed animation. Each heading fades/slides
  in once (600 ms, off under reduced motion). Pinned scroll stories are the most common "award site" trick and the
  worst on phones.
- **Change 3, empty states inside the spine:** LIVE IT LOUD with no shows booked shows a live photo or clip, "No shows
  booked right now", and the email sign-up/booking link. THE TIME IS NOW before a release date says "IDENTITY. 2027."
  plus the newest single; it never shows a broken countdown.
- **Build:** S (it is section headings + order). **Upkeep:** none.

### 4.2 IDENTITY era skin -- KEEP (already planned; this sets its scope)
One tokens file per era: 2 colors + ink + ground, the cover art, a texture image, a display-type choice, and the era
word. Swapping the file re-skins Home, buttons, kickers, OG images. Dave Bahm's single artwork supplies the palette.
Lady Gaga's "Year of MAYHEM" shows the payoff: the era name is the headline. For us: "IDENTITY" can sit as a giant,
cropped, low-contrast word behind the RISE hero (decorative, aria-hidden).
**Build:** M once. **Upkeep:** per album, done by us (a "big change").

### 4.3 The IDENTITY tracklist that fills in -- KEEP, best single idea after the spine
A /identity page with 12 numbered slots. Released singles show art, a Spotify embed (facade) and a lyric line;
unreleased slots show the number and a quiet "Coming" with the era texture. Track 12, **Scenic Route**, is visibly the
finale: larger slot, a live clip and the Montco Radio mention now, because he already plays it live. Release day flips
the page to the full album. This turns 8 months of promo into a reason to come back (Lecrae's pre-save, made visual).
- **Build:** M. **Upkeep:** Gabe fills one form per single (title, art, link, one lyric line). Track titles can stay
  hidden until he chooses to reveal them.

### 4.4 Tri-hybrid visual system (EDM light + rap type + rock texture) -- CHANGE: one system, not a switcher
Reject a "pick your genre" theme toggle (gimmick, triples the design work). Instead every page layers all three:
- **Rap = type:** a heavy condensed display face, huge, tight, all caps, hard crops of photos.
- **Rock = texture:** one static grain/paper texture over dark ground and a duotone on photos (from era tokens), so
  Gabe's own DIY photos look like one shoot.
- **EDM = light:** a soft, slow era-colored glow behind the player and the hero type (a radial gradient that drifts over
  ~20 s, low luminance change, never pulses). Light instead of lasers.
Karma Worlds proves genre-as-structure reads well; here it is genre-as-texture, which costs nothing per update.
**Build:** S-M (CSS). **Upkeep:** none.

### 4.5 Shows as gig posters -- KEEP
Each show renders as a typographic poster from its data: huge date ("FEB 14"), venue, city, "Tickets" button, era
colors; Home shows the next 3, /shows the list with Kalkbrenner/Alcest clarity (Date / Venue / City / Tickets) under the
posters. "With Fran Carroll" as an optional line. Past shows drop off by date into a small "Played" list, which also
proves he is active (a growing list of real dates is the antidote to the stale-site failure).
**Build:** M. **Upkeep:** Gabe adds a row (date, venue, city, link); the poster draws itself.

### 4.6 "Behind the beat" producer notes -- CHANGE: a field, not a section
A separate blog/vlog section would go stale (failure 1). Instead an optional 2-3 sentence "How I made it" field on
each IDENTITY track (and optionally a 15 s screen clip of the project file). Shows the DIY producer side where fans
already are. Empty field = nothing rendered.
**Build:** S (one field). **Upkeep:** optional, 2 minutes per track.

### 4.7 The lyric as the hero line -- KEEP
Faith shown the way NF and Lecrae do it: in his own words, not iconography. One lyric line per release in giant type
(on the track slot, the release page, and as the auto-made share image for that page). Raw and true beats a cross icon.
**Build:** S (plus OG image generation, M if we generate images). **Upkeep:** one line per release.

### 4.8 Calm by design, said out loud -- KEEP (small)
High energy with no flashing is our hard rule; make it a quiet brand point: a visible "Motion: on/off" in the footer
(respects the OS setting by default) and one line on About tied to his story. No peer does this; it is true to him.
**Build:** S. **Upkeep:** none.

**Rejected:** WebGL/3D album world (heavy, slow phones, costly to change per era); splash gate (failure 5); autoplay
sound; leetspeak/clever nav labels; carousels; a fan-club login (Illenium) before there is a list to reward.

## 5. Eye-appeal principles we commit to
- **Type is the hero.** Two families max: a heavy condensed display (candidates: Archivo Extra Condensed/Black, Big
  Shoulders Display, Anton; not Bebas Neue, overused) and a plain sans for text. Fluid scale: display
  `clamp(3rem, 13vw, 10rem)`, h2 `clamp(2.25rem, 7vw, 5rem)`, body 17-18 px, line length 60-70ch, kicker 0.8rem +0.15em.
- **Contrast:** body text >= 4.5:1, large text and UI >= 3:1, accent never carries small text unless it passes.
  Near-black ground (not #000) so grain and glow read; accent color on <= 10% of any screen.
- **Imagery:** real live photos only, hard-cropped, duotoned by era tokens; one big image per viewport, not a grid of
  equal cards. No stock, no icon soup, no rounded-card-and-shadow template look, no purple AI gradients.
- **Motion:** smooth and slow. Entrances 500-900 ms ease-out, once. Ambient glow drifts over >= 15 s with small
  luminance change. One moving thing per viewport. Nothing flashes, nothing pulses faster than 1 cycle per 3 s, no
  red flashes, no autoplay video with cuts. Everything off under `prefers-reduced-motion` and via the footer toggle.
- **Layout:** strict grid, big margins, asymmetric placement of the huge type, sections that alternate full-bleed and
  contained. Listen + Shows always one tap away (header buttons desktop, bottom bar phone); targets >= 48 px.
- **Speed is part of the look:** first view under ~150 KB before images, one live iframe (the Spotify player), others
  behind facades; no layout jump when embeds load (reserved heights 352/152).
- **"Straight-up cool", concretely:** confidence through restraint. Fewer, bigger things; nothing begging (no pop-ups,
  no "Welcome to my website"); every word plain except the slogan; every fact current; it looks like his era cover
  came alive, not like a template with his photo in it.

## Recommended concept: "Live It Loud" (the spine)
Home is the slogan told top to bottom: the hero sets the four lines in huge condensed type over a duotoned live photo
with a giant faint "IDENTITY" behind, then RISE carries the Spotify player, LIVE IT LOUD the next shows as gig posters,
PUSH PAST FEAR his story and a live clip, THE TIME IS NOW the IDENTITY countdown and email sign-up, each with a small
literal kicker (Music, Shows, About, IDENTITY) above the big verb. One visual system layers rap type, rock texture
and slow EDM light, all driven by the IDENTITY era tokens; a /identity page fills in track by track toward Scenic Route
as the finale. No scroll-jacking, no flashing, everything current by itself, Gabe edits rows not layouts.

**Alternatives:**
1. **Era poster:** Home is one IDENTITY cover-art poster (Gaga/NF style), slogan small; strongest per era, weakest on the slogan brief.
2. **Track deck:** Home led by the 12-slot IDENTITY tracklist as playable cards (Karma Worlds); great during promo, odd after release.
3. **Template-plus:** the Manafest/Riverside layout from references.md, polished; safest and fastest, but no idea a fan remembers.
