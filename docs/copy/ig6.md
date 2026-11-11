# IG6 copy (Copywriter draft, Laptop, 2026-11-11) - sign-up giveaway, About lines, Patreon, Welcome Home, IDENTITY block, credits, lyric quotes, albums

For Gabe to review via the owner. Site voice (plain labels) except lines marked as his. No middle dots, no periods in titles or
labels, nothing invented. Sources: `docs/research/gabe-answers-2026-11-06.md` (answers #3, 6, 8, 10, 12, 13, 17, 18, 19),
`docs/research/social-content.md`, `src/components/Signup.astro`, `src/pages/about/index.astro`, `src/components/content.js`.
Today's sign-up wording (Signup.astro): label "Get the next show and every new song first." / button "Join".

---

## 1. Sign-up: give away Scenic Route (answer #12)

Fact to respect: Scenic Route is unreleased until Jan 15, 2027. Nothing on the site delivers a file or a private link today
(Kit is not set up, answer #4). So the site must not say "you get it" until the incentive email exists.

**(a) Now, before Kit exists.** Promise only what is true today: a heads-up, not a file.

| Part | Draft |
|---|---|
| Line (label) | **Join the list. Scenic Route is coming Jan 15, and the first listen will be yours.** |
| Button | **Join** (unchanged) |
| Success message | **You're in. We'll tell you the day Scenic Route lands.** |

Caution: "the first listen will be yours" is also a promise, and only true once the owner sends that email. If the owner
will not send one by Jan 15, use the safer line: **Get the next show and every new song first.** (today's) and skip Scenic Route.
Do not add "free download", "instant", or "check your inbox for the song" in (a).

**(b) Once the incentive email exists** (owner has Kit, an automation, and the Scenic Route file or private link).

| Part | Draft |
|---|---|
| Line (label) | **Join the list and get Scenic Route free.** |
| Sub line | **One song, one email, from me.** |
| Button | **Get Scenic Route** |
| Success message | **You're in. Check your inbox for Scenic Route.** |

Owner must set up before (b) goes live (state it to Gabe plainly, never on the page):
1. Kit account in Gabe's name, with the API key and form id the site already expects (`src/lib/signup.js`).
2. An automation or incentive email in Kit that sends Scenic Route (a private link or file) right after sign-up.
3. Gabe's OK, and the delivery rule: before Jan 15 the song is unreleased, so the link must be private and the audio file
   Gabe's to give. Ask whether it goes out before release or from Jan 15 only.
4. A check that the success message matches what really arrives (spam folder note only if tests show it lands there).

"Sub line" and "from me" are the site speaking as Gabe; mark for his OK. Later giveaways: swap the song name only.

---

## 2. About: Epilepsy survivor line, with "Healed by Christ since 2009" as its subheader (answer #10)

His answer: keep "Epilepsy survivor"; "we could do it as a subheader to the other one". Both words are his (his Instagram bio
holds "Healed by Christ since 2009", per next-ideas line 137). The bio paragraph already says "Epilepsy survivor" inside it
(about/index.astro line 19), and that sentence stays word for word (D23).

Exact placement: a short two-line label under the h1 (Push Past Fear), above the bio, in the push-body, before `<div class="bio">`.

```
Epilepsy survivor              <- label, larger (heading style)
Healed by Christ since 2009    <- subheader under it, smaller, normal weight
```

| Part | Text | Chars |
|---|---|---|
| Heading | **Epilepsy survivor** | 17 |
| Subheader | **Healed by Christ since 2009** | 28 |

No period on either, no middle dot, and nothing added after (no explanation, no condition detail). Do not put it on the meta
description. Home: only if Home already shows the "Epilepsy survivor" line as a label (today it only appears inside the bio
sentence); if so, same two lines.

---

## 3. Patreon line next to the link (answer #19)

His own description: crowdfunds projects and merch (still early); members get early access to content and songs "only those in
the inner circle know exist". The line sits next to the Patreon link on About (above the `about-patreon` button) and Home.

**Option A (short, plain):**
**Back my projects and merch. Get early access to songs only the inner circle knows exist.**

**Option B (shorter, his tone):**
**Join the inner circle. Early songs, early content, and a hand in what I make next.**

Notes: A uses his "inner circle" idea and both facts (projects and merch, early access). B drops "merch" to stay short and
says "a hand in what I make next", which is our wording for crowdfunding projects; use A if Gabe wants only his words.
Do not say prices, tiers, "exclusive", or how many members. "Still early" stays off the page. Link and button text stay **Patreon**.

---

## 4. Welcome Home (out Dec 18, 2026; closes the single series; no pre-save yet) (answer #6)

Data: `releases.json` row, date 2026-12-18, listen link when it exists. No pre-save button until a link exists (do not point
at a guessed lnk.to).

| Place | Draft |
|---|---|
| Now line, from the 14-day window (Dec 4 to Dec 17) | **Out Dec 18: Welcome Home** (round2.md state A; link: its smart link, only once one exists, else no link) |
| Now line, Dec 18 | **Out today: Welcome Home** |
| Now line, Dec 19 to Dec 25 | **Out now: Welcome Home** |
| Release text, crate tile (before the date, no pre-save) | **Welcome Home. Dec 18, 2026** (tag: **Coming**) |
| Release text, one line of context (optional) | **The last single before IDENTITY.** |

Careful with the optional line: Gabe/owner said it "closes the single series"; whether IDENTITY (Aug 13, 2027) follows
directly is not stated. If he does not confirm, use **The last single in the series** or omit it. Before a link exists: no
"Pre-save" word anywhere, and while Who I Am is the nearer release the Now line shows that one (D45 order).
[ASK GABE: OK to call it the last single of the series; and the smart link when Wings Access makes it.]

---

## 5. IDENTITY tracklist block (answer #17, CD back is authoritative)

| Part | Draft |
|---|---|
| Heading | **IDENTITY tracklist** |
| Tracks | 1 IDENTITY, 2 ChurchBoy, 3 Single Kids, 4 WYLD LOVE, 5 Life Blood, 6 Mayday Mayday, 7 Light, 8 Mere Reflection, 9 Another Dimension, 10 Trenches, 11 Finish Strong, 12 Scenic Route |
| Scenic Route marker | tag on track 12: **Out Jan 15** (becomes **Out now** from that day; link to its smart link) |
| Credit line | **All songs written, recorded, produced, mixed and mastered by Gabriel Lucak** |

Notes: spelling is the CD back's (WYLD LOVE, ChurchBoy). The CD prints "All Songs Written, Recorded, Produced, Mixed and
Mastered by Gabriel Lucak"; sentence case here is ours (D23 keeps case only for his own quoted text, but this is a credit
line, so ask only if he cares). No final period on the credit line (it is a label). Other tracks carry no marker: no dates
are sourced for them.

---

## 6. Credits (answers #3, 13)

Footer / About credits list, "Photo credits" heading becomes **Credits**. Existing photo credits stay unchanged (Photo:
Alexander Kealey; Video: Sylvain Paslier; Video: Montgomery County Community College, MSP program group; Video still: Joseph
Lucak where used).

| Line | Text |
|---|---|
| IDENTITY cover | **IDENTITY cover: GLucak** |
| IDENTITY logo | **IDENTITY logo: Dave Bahm** |
| Lead singles' art | **Single art: Dave Bahm (Scenic Route, ChurchBoy, Single Kids, WYLD LOVE, Another Dimension)** |
| Video | **Duck, Dodge, Jump, Fight video: Joseph Lucak** |
| Live clip | **Scenic Route live clip: Vladd (Vladdtime)** |

Shorter footer version (one line): **Art: GLucak (IDENTITY cover), Dave Bahm (logo, lead singles). Video: Joseph Lucak, Vladd.**
Replace the old "IDENTITY art: from GLucak's Instagram" credit once the cover is his own (#3). A credit shows only where that
art or video is on the site. Gabe's thanks to Dave (Instagram 2026-10-27) can stay as the source, not a page line.

---

## 7. Lyric pull quotes (answer #18)

social-content.md has exact lines he posted himself, so these are not invented. Quote word for word, with the post as the link.

**Who I Am** (his post 2026-10-15, https://www.instagram.com/p/DehP5uyihwM/):
**"WHO I AM should depend on the one who came for me"**
Credit line: GLucak, Instagram, Oct 2026. (Alternate from the same post: "When it all burns down, what does it boil down to?")

**Scenic Route** (his post about Oct 25, https://www.instagram.com/p/DfXwP3eCpkf/):
**"Just hold on tight / it's gonna be alright"**
Credit line: GLucak, Instagram, Oct 2026. (Full block is four lines; use two or the whole four, never reordered.)

Gaps: social-content.md dates the Scenic Route post only as "ish", so confirm the month before printing the date. A third-party
version of the Who I Am text (next-ideas line 47) differs in casing ("the One"); use the social-content.md one. Gabe approves
the final pick (open list below). Do not quote more than one per page (D67: Home keeps one quote).

---

## 8. Album labels (answer #8)

Three albums: GLucak (Deluxe Edition), Time is at the Essence, Fall Down 7, Stand Up 8 (a remix album). Anomaly and You're
Not Alone stay singles / EPs.

| Item | Text |
|---|---|
| Title | **Fall Down 7, Stand Up 8** (no period) |
| Type tag | **Remix album** (the other albums keep **Album**; add a `remix` flag or a type label in `TYPE_TAG`) |

---

## 9. Gabe question list, updated (his email of 2026-11-06)

**Answered (23 of 23 from the owner's list):** show list (open mics, #1), Riverside Jan 16 (#2), credits (#3), email list
(none yet, #4), domains (#5), Welcome Home Dec 18 (#6), Scenic Route Jan 15 (#7), albums (#8), features (#9), epilepsy and
"Healed by Christ since 2009" (#10), flashing (#11), sign-up promise (#12), Joseph and Vladd credits (#13), Fran short exists
(#15), quote OK (#16), CD tracklist (#17), lyric quotes yes (#18), Patreon OK (#19), new Spotify bio late December (#20),
merch and Fourthwall (#21-23). Live originals (#14) answered as "coming in his next email".

**Still open:**
1. Cities and addresses of the open-mic venues, and ticket or info links (we use public venue info, marked).
2. Who took the IDENTITY CD photos (cover, inside live shot, jump, studio, looking)? Credit needs a name.
3. The live video originals (#14) and the Fran Carroll and Chance short (#15).
4. Which Who I Am and Scenic Route lines he wants quoted: we propose the lines in section 7 (he approves).
5. New, from this round: OK on the sign-up line (section 1), the Patreon option A or B (section 3), whether Welcome Home
   "closes the series" may be said on the page (section 4), whether the Scenic Route song goes out before Jan 15 on sign-up.
6. Still pending from earlier lists: booking email address, Q43 to Q46 in ig5.md.
