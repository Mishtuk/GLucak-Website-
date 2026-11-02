# GLucak website roadmap

Drafted by the Desktop 2026-11-02 from the Laptop's phases on #1 and `docs/research/direction.md` section 9.
**Laptop: claim and edit directly.** Dates are proposals and durations are estimates. Nothing here is agreed with
Gabe yet. The owner approves each gate.

**The rule that sets the date:** launch = Gabe's assets + about 6 weeks. **Target: live the week of Mon Jan 11, 2027**
(inside his Dec-Feb window, with February as slack). That needs his assets by about **Nov 30**. A December launch only
if they arrive by mid-November. After about Dec 20, February gets tight and we design on a placeholder era.

## Phases
| # | When (proposal) | What | Owner | Gate: done when |
|---|---|---|---|---|
| 0 | now - Nov 8 | Owner approves `direction.md`. Owner sends Gabe the questions (direction.md section 8). Owner decides on hosting, domain (glucak.com looked unregistered on 2026-11-02, so register it soon, with auto-renew) and whose name each account is in. | Owner | Direction approved, questions sent, host + domain decided |
| 1 | Nov 9 - 22 | `DESIGN.md` + a static Home prototype in `prototype/` on a placeholder era. Heroes A and B at 390px with a real photo, the D6 label test, the player top on the first phone screen, slogan wraps at 320px, a duotone test on his real photos. | Laptop (designer); Desktop + boss review in Chrome | Owner picks hero A or B; both machines OK DESIGN.md on #1 |
| 2 | Nov 23 - Dec 6 | Foundation from Riverside: Astro + `server.js`, era tokens + contrast test, header, always-visible phone bar, footer with Motion switch, shows data + per-request injection, Gabe's edit screen with injection tests, PEAT or similar on the tool list. **Host live by the end of this phase.** | Desktop (coder); boss review | `npm test` green; edit screen passes the `<script>` / `' OR 1=1 --` tests; past shows drop off on the host |
| 3 | Dec 7 - 20 | The 4 launch pages (Home, Music, Shows, About), drafted text, Spotify embed with the real playlist, schema / OG images, 390 + 1280 review, flash and motion audit, Lighthouse. | Desktop (coder); Laptop drafts the text and reviews | Boss sign-off against direction.md; nothing flashes; everything one tap from the nav |
| 4 | Dec 21 - Jan 8 | Gabe reviews the text and the site through the owner. Edit-screen walkthrough for Gabe. Fixes. (Expect a holiday slowdown.) | Owner + Gabe; both machines fix | Gabe OKs the text; he has added one show himself |
| 5 | week of Jan 11 | **Launch** on the owner's go: domain pointed, email on the domain, Kit sign-up live, monitoring on. The new bio is a content swap whenever it lands; launch doesn't wait for it. | Desktop; owner approves | Site live at glucak.com; board post + HANDOFF updated |
| 6 | Feb - Mar 2027 | Videos, Photos, Contact / Booking pages, one at a time. The IDENTITY block fills in as singles drop. | Laptop designs, Desktop builds | Each page passes the same review as phase 3 |
| 7 | Spring 2027 | Shop switched on, after the Fourthwall CD/vinyl answer, Gabe's merch list and the sales-tax question. | Owner decides; Desktop builds | First real order goes through |
| 8 | ~Mid-2027 | **IDENTITY release.** Countdown + pre-save as soon as a date exists, the era art at full strength, release-day flip to "Out now". No big changes in the 2 weeks before release. | Both | Release-day flip works by date with nobody touching it |

## Risks, worst first (Laptop's list)
1. **Gabe's assets** (logo, IDENTITY art and colors, photos) block final type and color. *Mitigation:* placeholder era
   through tokens, so the build continues and the swap is one file.
2. **Domain** could be taken while his name is being promoted. *Mitigation:* owner registers early in phase 0.
3. **Node host** must exist before phase 3, not at launch. Cost is the owner's call.
4. **Spotify playlist link**: his top ask and a launch blocker. Test logged-out and Instagram in-app behavior.
5. **Account ownership**: decide whose name the domain, Kit and Fourthwall accounts are in before opening any.
6. **Postal address in emails**: needed before the sign-up can send. The owner confirms the CAN-SPAM handling.
7. **No shows booked at launch**: the Shows empty state must be good on day one.
8. **IDENTITY date unknown**: the sign-up leads until there is one.
9. **Live photo quality**: the duotone can go muddy on low-light shots. Tested in phase 1.
10. **Fourthwall CD/vinyl answer and sales tax**: block only the shop, never the launch.
11. **Scope creep from our own ideas.** If we slip, cut in this order: generated posters -> plain rows, tracklist ->
    simple list, motion -> none. **Never cut:** the player, shows, the edit screen, the hard rules.

## How the team runs each phase
- **Boss** gates every phase against its "done when", with 390 + 1280 screenshots, the injection checks and the flash
  rule. **Mediator** settles designer / coder disagreements before they reach the boss. Rulings go in `DECISIONS.md`.
- **Board #1**: every push is posted; each machine posts at least one improvement idea per session; HANDOFF stays current.
- **Owner gates** (money, public, contacting Gabe): phase 0, the hero pick in phase 1, the host in phase 2, launch, the shop.
