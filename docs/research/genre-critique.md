# Critique of genre-and-standouts.md, section 4 (Laptop, 2026-11-02)

Answers the Desktop's request on #1: keep / change / drop per differentiator, plus additions. Overall: **"Live It Loud"
is the right concept.** The problems below are about fit with Gabe's own email, not about the idea.

## Verdicts
| # | Differentiator | Verdict | In one line |
|---|---|---|---|
| 4.1 | Slogan as spine | **Keep, change** | Put back the latest release and latest video; fix the last section; protect the player's position |
| 4.2 | IDENTITY era skin | **Keep, change** | Drop the giant faint word from the hero; add a contrast test |
| 4.3 | Tracklist that fills in | **Keep, change** | A block on Music at launch, its own page later |
| 4.4 | Tri-hybrid system | **Keep, change** | Recolor live photos only, never cover art |
| 4.5 | Shows as gig posters | **Keep, change** | Design for open mics first; most rows won't have tickets |
| 4.6 | Producer notes | **Keep field, drop clip** | Low priority, after launch |
| 4.7 | Lyric as hero line | **Keep, scope** | Release and track pages only; the slogan owns Home |
| 4.8 | Calm by design | **Keep toggle, drop the rest** | It is an accessibility requirement, not a brand point |
| - | Rejected list | **Agree** | All of it stands |

## Details

### 4.1 Slogan as spine
1. **The concept loses two things Gabe named first.** His email says fans should find "New releases, upcoming shows,
   the latest videos". CONTEXT's Home row lists latest release and latest video, and `riverside-layout.md` keeps a
   Latest video band, but the recommended concept has neither. Fix without adding a band: **RISE = player + latest
   release; LIVE IT LOUD = next shows + latest video.**
2. **THE TIME IS NOW over "IDENTITY. 2027." contradicts itself:** the heading says now, the content says later. Lead
   with what a fan can do today (join the list, pre-save when it exists) and put the album date second.
3. **The player must stay "near the top".** He asked for that by name. Riverside's hero is 940px tall at desktop, and
   copying a full-height hero with four lines of display type puts the player a full screen down on a phone. Rule: the
   top of the player is visible on the first phone screen, so the hero is not full height. Measure at 390px in the
   prototype. On desktop, the player can sit in the hero (`rap-artist-events`).
4. The slogan wrap at narrow widths is unmeasured. "THE TIME IS NOW" may break at 320px with the proposed
   `clamp(3rem, 13vw, 10rem)`. Check with the chosen face.

### 4.2 IDENTITY era skin
- **Drop the giant faint "IDENTITY" behind the hero.** The hero would stack the slogan, photo, duotone, grain, glow and
  a second giant word. That breaks this study's own finding ("one idea, everything else stripped back") and competes
  with the slogan he asked to feature. The era word belongs in THE TIME IS NOW and on Music.
- **Add a contrast test per era file.** Colors change per release and come from art we haven't seen, so a test should
  fail any era that misses the 4.5:1 and 3:1 rules. That makes "versatile" safe to repeat.
- **Take display type out of the era file for now.** A new face can break the slogan's wraps, so it should be a
  reviewed change, not a token swap.

### 4.3 Tracklist
- **Launch scope:** Gabe said 3 or 4 sections to start, and this would add a page. Launch it as a block on Music, and
  split it into its own page later if it earns one.
- **Risk:** if only a few singles are out at launch, most slots say "Coming". That can read as unfinished, which is
  failure 1 in this study. Decide after Gabe says how many singles are out and when the rest are due.
- Ask Gabe before publishing the track count or any title beyond what he has already made public.

### 4.4 Tri-hybrid system
- **Correction to my idea on #1:** I said every photo and cover goes through the duotone. Covers should not. Dave
  Bahm's and Gabe's artwork is shown as made; only live photos get recolored.
- Test the duotone on his real photos before committing. Low-light shots may go muddy.
- Build notes: grain as a small static image, and the glow as a transform/opacity layer rather than a repainted
  gradient, so phones stay smooth.

### 4.5 Gig posters
Gabe wrote that he does "a lot of open mic performances" and "a few full-length shows". So the typical row has no
ticket link, and the design as written assumes one.
- Data: add a type (show / open mic) and make the ticket link optional. The action reads Tickets or Details, one word
  each, per the Puck Live lesson. A row with no link shows no button.
- Posters for full shows; compact rows for open mics. On phones, one poster plus two rows, which protects the
  "under ~5 phone screens" target from `wix-templates.md`.
- First ask Gabe whether he wants open mics listed at all (question in `shop-and-tools.md`).

### 4.6 Producer notes
Keep the optional text field. Drop the 15-second clip: it adds an upload and hosting path for a nice-to-have. Build after launch.

### 4.7 Lyric as hero line
Keep it, on release and track pages. Home has one giant line, the slogan. Use hand-made share images at launch; generated
ones can wait.

### 4.8 Calm by design
- **The toggle is needed, not optional.** A glow that drifts for 20 seconds starts by itself and lasts over 5 seconds,
  which falls under WCAG 2.2.2 (Pause, Stop, Hide). So the on/off control stays.
- **Drop the About line unless Gabe asks for it.** His epilepsy is his to tell, and his bio already does. We shouldn't
  turn it into a site feature. "Calm" is also the wrong word beside "Live It Loud".

## Additions
1. **The "Now" strip (keep what got lost).** `riverside-layout.md` maps Riverside's hero strip to "next show · latest
   release", but the recommended concept omits it. His first sentence asks for a place to "find out the latest". One
   line in the hero, picked from the data: the next show if one is close, otherwise the newest release. **Build:** S
   (reuses the hero strip). **Upkeep:** none.
2. **Listening when logged out.** `references.md` notes logged-out visitors get 30-second previews, and fans arriving
   from Instagram may well be logged out in its in-app browser (unverified, test it). Keep an "Open in Spotify / listen
   everywhere" link directly under the player, or the main action ends after 30 seconds. **Build:** S. **Upkeep:** none.
3. **Later, optional, not requested:** a story-sized (9:16) version of each show poster to post on Instagram, since it
   is drawn from data anyway. **Build:** M. Not for launch.

## Faith: one caution on section 1a
"Genre artist first, mission second" is a good read of the visual style, and it should stop there. Gabe's bio says his
mission is music "to bring others to Christ". No iconography is fine, but PUSH PAST FEAR should say it plainly in his
words, not soften it. We draft, he reviews.

## Checks on the study's facts (run 2026-11-02 with curl)
| Claim | Result |
|---|---|
| Lecrae "Copyright 2023" and live newsletter placeholder | Confirmed |
| Hulvey newsletter placeholder | Confirmed |
| Tedashii 301 to an unrelated domain | Confirmed (`op.projectx-thegame.de`) |
| Manafest HTML is 810 KB | **Out of date or a different read:** 1,796,787 bytes today, with 6 base64 images. The point stands, more strongly |
| Section 3, fix 2: shows "rendered in the HTML at build" | **Change:** Riverside injects them per request (`server.js:171`). At build alone, a past show stays up until the next build, which is the Puck Live failure. So the site needs a Node host, and the GitHub Pages preview can't show this |

**Open gap:** the owner asked what is "actually more eye-appealing", but the standouts in section 2 were read as HTML
text, which shows neither type nor color. Before `direction.md` calls those findings visual, the Chrome screenshot pass
of the best five (the study already suggests it) should happen. It's the Desktop's by the split.
