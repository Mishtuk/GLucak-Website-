# Round 2 copy (Copywriter draft, 2026-11-06) - Now line (D45), 404 page, Add to calendar

**Boss check done (Laptop, 2026-11-06, D57): approved with the changes marked "Boss (D57)" below.** In short: the show state
keeps a kind word ("Show Nov 20: ..." / "Open mic Nov 20: ..."); the Now link has no `aria-label` (its visible text is its
name); the calendar's accessible name starts with "Add to calendar"; both coming smart links were checked and are real
pre-save pages (Who I Am, Scenic Route), so "Pre-save" on the coming tiles is true.

Written from the round-2 verdict (`docs/review/round2-verdict.md`, tasks 1 and 6) and D45/D53. Counts are characters including
spaces. "Site" = plain label, not Gabe's voice. Nothing here quotes Gabe; the only words of his are the fixed slogan fragments,
used as-is. Facts used: Who I Am, 2026-11-13, `https://wingsmusic.lnk.to/WhoIAm` (social-content.md section 2).

---

## 1. Now line (D45): Home hero, `nowHtml()`

Format: the "Now" tag, then one link. Date style is "Nov 13" (month abbreviation + day, no year, New York time).
Order of states is D45's: release in 14 days, release day, release in the 7 days after, next show or open mic within 14 days,
newest release, nothing.

| State | String | Chars (Who I Am) | Link goes to |
|---|---|---|---|
| A. Release 1 to 14 days ahead | **Out {date}: {title}** | 20 | the release's smart link |
| B. Release day (today) | **Out today: {title}** | 20 | the release's listen link |
| C. Out now (day after release, up to 7 days) | **Out now: {title}** | 17 | the release's listen link |
| D. Next show (show or open mic, within 14 days, no release state above) | ~~{date}: {venue}, {city}~~ **Boss (D57): Show {date}: {venue}, {city}**; open mic: **Open mic {date}: {venue}, {city}** | 13 / 17 + venue + city | ~~the ticket link~~ **Boss (D57): #shows** (the poster with Tickets and Add to calendar, right below; D18) |
| D2. The show is today | ~~Today: {venue}, {city}~~ **Boss (D57): Show today: {venue}, {city}** / **Open mic today: {venue}, {city}** | 12 / 16 + venue + city | same as D |
| E. Nothing in the window: newest release | **Out now: {title}** | 17 | the release's listen link (unchanged from home.md section 1) |
| F. No release and no show at all | no line (hide the Now tag and the link) | - | - |

Notes for the coder:
- A and B/C/E share the "Out ..." pattern on purpose: only the word after "Out" changes, so the line never looks like a
  different component. B is its own string because "Out Nov 13" on Nov 13 would read as future.
- C and E are the same string; E is simply "newest release, no window". Do not add "Latest" or "New".
- D replaces home.md's draft "Next show: Venue, City". The date is more useful than the label "Next show", and it is shorter.
  The word "Now" tag already tells people it is current. If the boss prefers the old label, use **Next show: {venue}, {city}**.
- **Boss (D57):** keep a kind word, drop "Next". The date is worth showing, but a bare "Nov 20: The Rail, Philadelphia" makes a fan
  guess what it is (a venue name doesn't always sound like one, and open mics look the same as shows). "Show Nov 20: ..." reads
  as the same pattern as "Out Nov 13: ...": a kind word, when, colon, the name. "Next" is already said by the Now tag.
- Never "Pre-save" or "Coming soon" in the line. See ask below on the link.
- Venue and city come from the show data as typed. At 390 the line fits on one line up to about 28 characters; longer
  venue or title text wraps to a second line (the 48px target is allowed two lines at 320, per the verdict) and must not
  be cut off with an ellipsis. Duck, Dodge, Jump, Fight (24) in state A is 36 characters and will wrap; that is expected.

~~Accessible names (the visible text stays the same; use `aria-label` only where the text alone is unclear):~~

**Boss (D57): no `aria-label` on the Now link in any state.** The visible text is clear on its own, and every label below
changes the words or their order, so a voice-control user who says "click Out Nov 13" would miss (WCAG 2.5.3, Label in
Name). Kept only for the record:

| State | ~~Accessible name~~ |
|---|---|
| A | ~~{title}, out {date}. Opens the release link~~ |
| B, C, E | ~~Listen to {title}~~ |
| D, D2 | ~~{venue}, {city}, {date}. Details~~ |

For the boss / Gabe: Who I Am is out Nov 13, so state A shows from Oct 30 (it will show on Nov 6). Lands as "Out Nov 13: Who I Am".
No change needed from Gabe for the line itself.

---

## 2. 404 page (`404.astro`, status 404)

Site voice, not Gabe's. It uses only the fixed slogan phrase "Push Past Fear" as given. Plain text, no animation, no
fade, nothing that moves. Same page frame as the rest (nav and footer stay).

| Block | String | Chars |
|---|---|---|
| Tab/title (`<title>`) | **Page not found - GLucak** | 25 |
| Heading (display type, the one big line) | **Wrong turn.** | 11 |
| One line under it | **That page isn't here. The music is.** | 38 |
| Button 1 (primary) | **Listen** | 6 |
| Button 2 | **Shows** | 5 |
| Link 3 (text link, third) | **Home** | 4 |

Order is by the main actions: Listen first, Shows second, Home last. Listen goes to the Music page; Shows to Shows.
Accessible names: "Listen to GLucak's music", "See upcoming shows", "Back to the home page". The heading is the page's h1.

Not used on purpose: jokes about errors, the code "404" as big type, "Oops", "Sorry", blaming the visitor, a search box.
If the boss wants the slogan on this page, use the existing LIVE IT LOUD fitted phrase under the buttons, not new words.

---

## 3. Add to calendar (D53: server-made `.ics` per show)

Used on the poster card and on each upcoming row (shows and open mics). Not on Played rows (past shows 404).

| Part | String | Chars |
|---|---|---|
| Button / link label | **Add to calendar** | 15 |
| Accessible name | ~~Add {venue} on {date} to your calendar~~ **Boss (D57): Add to calendar: {venue}, {date}** (e.g. "Add to calendar: The Rail, Nov 20"): it starts with the visible words where they show (37rem+ poster, D55), and with the glyph alone it still says the action first | 17 + venue + date |
| Downloaded file name | **glucak-{date-iso}-{venue-slug}.ics** | - |

The label is a plain link with the 48px target and the same style as Tickets, one step quieter (the coder/designer choose).
Never "Save the date" or "Remind me": the file does not set a reminder.

### The .ics event

| Field | Format | Notes |
|---|---|---|
| SUMMARY (title), show | **GLucak at {venue}** | e.g. "GLucak at The Rail" |
| SUMMARY, open mic | **GLucak open mic at {venue}** | uses the row kind tag, "Open mic" |
| LOCATION | **{venue}, {city}** | |
| DESCRIPTION | see below | joined with escaped newlines (`\n`), then escaped per RFC 5545 |
| URL | the ticket/details link, only if http(s) | omit the field if none |
| Date/time | all-day event on {date} unless the show data holds a time | see ask below |

DESCRIPTION text, one line per row, a row is dropped when its field is empty:
```
GLucak live.
With Fran Carroll.            (only if the "with" field is set; name from the field)
{venue}, {city}
Tickets: {link}               (show)   /   Details: {link}   (open mic)
glucak.com                    (only once the domain is live: {site url})
```
First line is **GLucak live.** for shows and **GLucak at an open mic.** for open mics. No taglines, no "don't miss it", no
price, no time claims: only facts that come from the show data.

### For the boss / Gabe
- [ASK GABE: do his shows have a start time?] The data has a date only (the Shows copy never mentions times). Until he gives
  times, the event is all-day on the date. A start time later lets it say "Doors/Start" with no copy change.
- Link label in the Now line: states A and B link the same smart link. We have not verified what `wingsmusic.lnk.to/WhoIAm`
  offers (a pre-save vs a plain listen page), so the line avoids "Pre-save" and says only "Out Nov 13". The boss should open
  the link before Nov 13; if it is a pre-save page, nothing in this file needs to change, because the wording is the same.
- Needs Gabe's OK: the 404 line "That page isn't here. The music is." (site voice, so the owner's call whether to ask him) and
  the open-mic event wording "GLucak at an open mic." Nothing else here needs him.
- Not in this file: new Music words. The cover grid reuses music.md's "Out {date}" and "Pre-save" strings as they are; add
  nothing until the designer's grid shows a gap.

---

## 4. Admin: Save pressed while a photo uploads (Boss, D57)

Shown in the Products Save message when Save is pressed during an upload (bf6704b shows "Uploading…" there, which stays after the
upload ends and never says what to do):

| String | Chars |
|---|---|
| **Wait for the photo to finish uploading, then press Save.** | 57 |

When the upload ends, the Save message clears (the photo's own line already says "Uploaded. Press Save to keep it.").
