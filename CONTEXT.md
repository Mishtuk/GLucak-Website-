# CONTEXT: read this first (both machines)

Everything the owner (the user, "Mish") has said about this project, plus the client brief, fleshed out.
If you are the **Laptop** session: read this, then `HANDOFF.md`, then the board (issue #1), and introduce yourself
there with `Laptop:`. The client's own email is in `README.md`; this file adds the plan around it.

## The job
- **Our first hired job.** The client came to us first and is paying. The owner wants to show real quality.
- **Client:** Gabe (Gabriel Lucak, he/him), artist name **GLucak**. Independent producer-rapper / DJ who writes and
  produces everything and does the vocals. Genre: EDM / rap / rock "tri-hybrid". Lyrics raw and faith-based, from
  real life. High-energy recording and performing artist; open mics plus some full-length shows, wants more of those.
  Often performs with guitarist **Fran Carroll**. Epilepsy survivor (this shapes the site, see Hard rules).
- **The site:** a music website and a shop. A central hub where fans find the latest: new releases, upcoming
  shows, latest videos, and merch.
- **Main actions:** 1) listen to the music, 2) come to the shows. Merch third.
- **Audience:** largely fans (most arriving on phones from Instagram, Threads, X, Spotify bios).
- **Feel (his three words):** **Intuitive, Versatile, straight-up Cool.**
- **Slogan (feature prominently):** "Rise, Live It Loud, Push Past Fear, The Time Is Now."
- **Launch window:** December 2026 to February 2027, as promo for IDENTITY ramps up.

## Owner's instructions (2026-11-02)
- Repo: `Mishtuk/GLucak-Website-` (local `V:\GLucakWebsite`). Commits authored as `Mish`.
- `HANDOFF.md` is always current with the latest context so no session runs out of context mid-task. Update it
  after every milestone, not only at the end. Sessions can end without warning.
- `CONTEXT.md` (this file) carries everything the owner says, so the Laptop can catch up by reading it. Add new
  owner instructions here (dated) as they come.
- **Team of subagents** (`.claude/agents/`):
  - **boss**: above everything, keeps every agent on task and on the goal (the best possible site). Plans, reviews, decides.
  - **designer**: how it looks and works; owns `DESIGN.md` and `prototype/`.
  - **coder**: builds it.
  - **mediator**: talks between designer and coder, understands both, finds the ruling so it isn't direct conflict.
- **Design reference: Wix templates** (https://www.wix.com/website/templates), especially the Music category, for how
  the site should be designed (structure, polish). Borrow patterns, build our own; no copying a template wholesale.
- Install plugins/skills when they help the build; tell the owner if a connection (account, API, service) is needed.
- **Desktop and Laptop are two Claude sessions working together.** This machine is the Desktop; the other is the
  Laptop. Talk on the board (pinned issue #1). Keep prompting each other with new ideas and designs and ways to make
  the site better, and keep checking for each other's replies.

## Working together (Desktop and Laptop)
- **Board:** issue #1 "Coordination board: Desktop and Laptop". Every comment starts with `Desktop:` or `Laptop:`
  (both machines post as Mishtuk; the prefix tells them apart).
- **Tool (Node only, works on both):** `node tools/board.mjs say "Laptop: ..."`, `node tools/board.mjs check Laptop`
  (prints NEW_DESKTOP / DESKTOP_SILENT / OK), `node tools/board.mjs read 10`.
- **Check the board** at the start of every session, after every push, and on a loop while working (every ~10 min).
  Answer anything new before starting new work. If the other side is silent, keep working on your own tasks.
- **Every push gets a board post:** short hash + one line per commit.
- **Ideas both ways:** each machine posts at least one concrete improvement idea (design, content, feature) per
  work session; the other answers it (yes / no / changed, and why).
- **Claims:** before editing, `git pull --rebase`, add your line under HANDOFF "Now working on" with the files you'll
  touch, push it. Never edit files the other machine claimed. Never force-push `main`.
- **Decisions:** `DECISIONS.md`, Desktop even numbers (D2, D4...), Laptop odd (D1, D3...).
- **Split (proposed, Laptop may counter):** Laptop does research, `DESIGN.md` and static prototypes in `prototype/`;
  Desktop does Chrome research (Wix templates, Manafest, social profiles), the build, tests and screenshots.

## Hard rules
1. **No flashing content.** Nothing flashes more than 3 times per second (WCAG 2.3.1), no strobe effects, no
   rapid red flashes, and all motion (parallax, autoplay video, marquees) stops under `prefers-reduced-motion`.
   Gabe is an epilepsy survivor and many fans may be too. High energy comes from type, color, layout, and smooth
   motion, never strobing.
2. **No HTML or SQL injection** (owner rule for all web projects). Parameterized SQL only; data rendered escaped;
   http(s) links only; a test per form proving `<script>` and `' OR 1=1 --` stay inert.
3. **Easy to find, always current** (the Puck Live lesson): every section one click from the nav, in the place a
   fan expects; past shows drop off by themselves; latest videos update themselves.
4. **Ask the owner before** anything that costs money, goes public, or contacts Gabe.

## What goes on the site
Gabe wants several sections, launching with about 3-4 and adding more as time goes; the shop is set up in the
background and switched on later.

| Section | Launch? | Notes |
|---|---|---|
| Home | yes | Slogan hero; **embedded Spotify playlist player near the top** (like Thousand Foot Krutch did); latest release; next shows; latest video; email sign-up |
| Music | yes | Releases (IDENTITY, Go, One And Done, self-titled Deluxe), listen-everywhere links (smart link), SoundCloud |
| Shows | yes | Upcoming shows with date, venue, city, ticket link; past shows hide themselves; booking contact |
| About | yes | Bio (current Spotify bio now, new bio in January 2027), photos, Patreon, socials |
| Videos | soon | Latest from YouTube (channel feed, updates itself) |
| Photos | soon | Gallery (his own photos and Dave Bahm's art, permission given) |
| Contact / Booking | soon | Form for fans, venues, collaborators |
| Shop | later | Merch and physical media (CDs, vinyl?), built in the background, switched on later |

Every page footer: socials (Instagram, Threads, X, YouTube, SoundCloud, Spotify), Patreon, email sign-up, slogan.

## Gabe's music and links
- **IDENTITY**, third album, his favorite and "best work yet", out about 8 months after the email (around mid-2027).
  Promotion has started. Track 12 (last), **Scenic Route**, is his favorite; played live a lot and on local radio
  (Montco Radio). The site should build toward IDENTITY: countdown and pre-save when there's a date and link.
- Current highlights: singles **Go** and **One And Done**, the **Deluxe** self-titled record.
- Go (smart link to every platform): https://wingsmusic.lnk.to/370407-Go
- SoundCloud: https://soundcloud.com/glucak
- YouTube (main): https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg
- Instagram: https://www.instagram.com/glucakofficial/  Threads: https://www.threads.com/@glucakofficial
- X: https://x.com/GLucakOfficial  Patreon: https://patreon.com/GLucakMusic
- **Current bio:** "Despite facing various difficulties and struggles over the years, Epilepsy survivor and
  Producer-Rapper/DJ GLucak has shown no intent to give up on either his Faith in God or his mission in creating
  energetic music to bring others to Christ. Two albums and numerous singles and EPs into the biz and with no plans
  to slow down, GLucak has been running at a ferocious pace crafting brand-new content and music for 2026 and 2027.
  Nevertheless, no matter the musical style or genre, be it his debut single or his upcoming 3rd album (rumored to be
  his best work yet), the mission statement has always been the same: Rise, Live It Loud, Push Past Fear, The Time Is Now."
- **We draft all site text** for him to review (he asked for drafts).

## Look and feel references
- **Likes:** Manafest's website; the layout of the Riverside church site (ours: `V:\RiversideWebsite`,
  `Mishtuk/Riverside-Website`, so reuse it freely); Thousand Foot Krutch's embedded Spotify playlist.
- **Dislikes:** Puck Live's site: things hard to find, not where expected, not kept up to date.
- **Templates:** Wix Music templates (owner's pick), see above.
- **Brand assets:** Gabe has a logo, colors, album art and lots of audio/video. He made most himself; his cousin
  **Dave Bahm** made the IDENTITY singles' artwork and that logo version, with full permission to use.
- **Colors change per release.** Start with the IDENTITY album colors. So the theme is built as swappable
  "release eras": one set of color/art tokens per era, switched in one place.

## Practical
- No website or domain yet. Name ideas: **GLucak** (e.g. glucak.com) or RiseLiveItLoudPushPastFearTheTimeIsNow
  (43 characters: hard to type; better as a redirect to the main domain if he wants it at all).
- Wants an email on the domain (e.g. gabriel@glucak.com); has a personal email already.
- Pays for nothing website-related now.
- **Changes:** many small ones (by release / tour), big ones rarely. **He wants to make small changes himself**
  (shows, release links, videos, bio), and send big ones to us. So: a simple, safe edit screen for Gabe.
- **Pricing** (owner's business, don't quote numbers to Gabe without the owner): quote is based on how much depth he
  wants; website + server upkeep is always a monthly payment (hosting, domain, security updates, maintenance).
  He's young and the budget is likely limited; the plan should fit what he can pay.

## Fleshed-out ideas (proposals, not yet agreed with Gabe)
- **Release-era theming:** `src/eras/identity.json` style tokens (colors, hero art, accent) so a new album re-skins
  the site in one change. This is the "versatile" word made real.
- **Shows that keep themselves current:** each show has a date; past shows move to "Past shows" automatically;
  `Event` structured data so shows can appear in Google; "Add to calendar" button. Optional later: Bandsintown sync.
- **Videos that keep themselves current:** read the YouTube channel's public RSS feed at build time (no API key),
  so "Latest video" is never stale.
- **Spotify:** official embed iframe (`open.spotify.com/embed/playlist/<id>`), lazy-loaded, near the top of Home.
  Needs Gabe's playlist link (which playlist? a "This is GLucak" style one he curates?).
- **IDENTITY countdown + pre-save** block, then flips to "Out now" on release day by date.
- **Email list:** a provider with a free tier (e.g. Mailchimp, Buttondown, or Kit) or our own small list; decide with
  the owner. Fans get show and release announcements.
- **Shop groundwork:** product pages built but hidden behind a switch; checkout through a hosted provider (Stripe
  Payment Links, Shopify Starter, Fourthwall, or Bandcamp merch) so we never handle card data. Pick with owner/Gabe.
- **Faith-based tone:** let the mission show (the slogan, the story) without being preachy; the music leads.
- **Live energy without strobe:** big bold type, the IDENTITY palette, smooth slow motion, live photos, a short
  muted hero clip from a show (poster first, off under reduced motion), cut from his own footage.
- **SEO / sharing:** `MusicGroup` + `Event` schema, good Open Graph images per page (links shared on Instagram look right).
- **Scenic Route spotlight:** his favorite track, played live and on Montco Radio: a featured live clip or radio
  mention on Home or Music.

## Still needed from Gabe (owner sends these; we don't contact him directly)
1. The Spotify playlist link for the home player.
2. IDENTITY art, colors, logo files (and the Dave Bahm logo version), plus a few photos and a live clip.
3. Upcoming shows list (date, venue, city, ticket link).
4. Domain choice (glucak.com availability to check) and whether he wants the long slogan domain too.
5. Shop: what merch / physical media, and whether he already uses a store (Bandcamp, etc.).
6. Email sign-up: does he already have a mailing list?
7. Release date and pre-save link for IDENTITY when known; the new bio in January.

## Connections the owner may need to set up
- Spotify playlist link (from Gabe). No Spotify API account needed for the embed.
- A host account (the Riverside site's host can be reused), a domain registrar, domain email.
- Email-list provider account; shop/checkout provider account (later).
- None blocking for design and the first build.
