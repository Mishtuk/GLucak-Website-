# Admin panel research for Gabe's /edit/ screen (2026-11-23)

Goal: what makes a small-site admin easy, safe and self-sufficient for a non-technical owner on his phone. Then: what our /edit/ is missing.
Method: our own past work first, then 9 web fetches and searches. `process/inbox/admin-panels-research.md` does not exist yet in Base-Website-Design-Template (checked), so there was nothing to build on.

## Sources

| Source | What we took | Limits |
|---|---|---|
| Mulligan-Games-B docs/admin/design.md and architecture.md (ours) | "Today" home with big quick-action buttons. Bottom nav on phone. Cancel dialog names the item and effect. 30-second Undo, then "Restore". Unsaved forms keep a draft after idle timeout. Demo banner. Log screen. Backup and restore plan. | Built for a shop with staff and a database. Gabe is one person on flat files. |
| Base-Website-Design-Template patterns/event-admin.md and event-admin-page.md (ours) | Soft cancel (a `cancelled` flag and a `rev` counter) instead of hard delete. One page for list, add, edit, cancel. | Uses Cloudflare Access login. We have our own login, so only the soft-cancel idea carries over. |
| GLucak docs/copy/admin.md and docs/guide/gabe-guide.md (ours) | Current words and flow: per-tab Save, Played fold, lockout wording, 7-day sign-in. | The guide has no "something went wrong, what now" section beyond lockout. |
| https://www.nngroup.com/articles/confirmation-dialog/ | Confirm only serious, irreversible acts. Name the item. Buttons state the outcome ("Delete show" / "Keep show"). Offer undo where possible. Too many prompts train click-through. | Desktop-era article. |
| https://www.nngroup.com/articles/errors-forms-design-guidelines/ (search summary only, not fetched in full) | Message next to the field. Keep what the user typed. | Read from the summary, not the page. |
| https://design-system.service.gov.uk/patterns/validation/ | Say what went wrong and how to fix it. Validate on submit, not per keystroke. Keep entries. Error summary at top with focus moved to it. Ignore harmless spaces. Always validate on the server. | Built for multi-page government forms. |
| https://design-system.service.gov.uk/patterns/check-answers/ | A "check before you submit" step. Button names the action. "Change" link beside each part. Skipped optional fields show "Not provided". | Meant for one-time transactions. We only need the idea for risky saves. |
| https://engineered.at/articles/posting-with-sveltiacms-from-my-phone plus Sveltia README and search results | Sveltia says mobile still has "rough edges". Its branch-per-post Editorial Workflow was only promised for mid-2026 (blog post of 2026-03-31; shipped or not is unconfirmed). | The phone post had no detail. We learned that even a leading git CMS is not fully phone-ready. |
| https://keystatic.com/docs/introduction | Saves local, to GitHub, or both. No editor preview or drafts described. | Stub page on images and drafts. |
| Shopify mobile app (App Store listing, shopify.com/blog/shopify-mobile-app) | Phone-first admin works: photo upload, price edit, push notice on a new order, home widgets with today's numbers, global search. | Marketing pages. Reviewers still report gaps. |
| Bandzoogle / Squarespace / Bandcamp roundup search | Musician builders give a show calendar plus drag-and-drop editing. Bandsintown sync is the usual way to avoid typing shows twice. | Roundup blogs with no admin UX detail. Could not confirm mobile editing for any of the three. |
| Not reached: Linktree, Wix, TinaCMS, Decap, Kirby (guide URL returned 404) | Skipped for budget. | Any Kirby or Tina claim is general knowledge, and none is used here. |

No site blocked us.

## Patterns that matter for a one-person musician admin

1. A home that says what is next. Why: Gabe opens it asking "Is my site right today?" Show next show, release status, last save time, and three big buttons. Shopify and our Mulligan design both do this. The data is already loaded.
2. Undo beats "Are you sure?". Why: NN/g limits confirms to serious acts and says undo protects better. Remove a row at once and show "Show removed. Undo".
3. Version history with one-tap restore. Why: he will not know what he broke. "Go back to how it was on Tuesday" is what lets him stop messaging us. A backup file he cannot restore is not a safety net.
4. Check before a risky save, in plain words. Why: GOV.UK check-answers. For the release date and pre-save link show "Pre-save opens Fri 13 Aug 2027. Fans will tap: https://..." That catches the wrong year and bad links before they go live.
5. See it, or undo it. Why: every save goes live at once. For one user a "Check on the site" link plus history is enough. A full draft system is not.
6. Errors by the field, in plain words, input kept. Why: GOV.UK and NN/g agree. We already do this well. Extend it to links.
7. Never lose typing. Why: phones kill tabs and drop signal. Keep a local draft of unsaved tabs and offer it back. Mulligan's design plans the same.
8. Photos fix themselves. Why: a phone photo is 4 to 12 MB and often the wrong way up. Resize and rotate in the browser, then upload. Offer fixed frames, not a free crop tool.
9. Empty states that teach. Why: "No shows yet. Add your first one" with the button right there replaces a guide page.
10. Help where he is. Why: a "?" by confusing fields, and an error code he can text us, beat a PDF.
11. Sign-in that does not annoy. Why: 7 days per phone is right. A signed-out save must keep his changes (we do).
12. Phone basics. Why: 48px targets, Save always in reach, labels not placeholders, nothing hover-only. Our file already follows most of this.
13. A tiny audit trail. Why: "Last saved by you, today 4:12 pm" builds trust, and a short change list answers "what changed?" The server already logs saves.

## Gap list: current /edit/ vs those patterns

What we read: tabs Shows, Releases, IDENTITY, Bio, Products. Per-tab Save with a dirty marker. `beforeunload` guard and a sign-out guard. `confirm()` on delete ("goes away when you press Save"). 409 on a version clash. Row and field errors. A 401 keeps his changes. 429 and 413 messages on backup. Photo cap 5 MB, JPG/PNG/WebP only. "See it on the site" link after save. Backup download. Played fold. IDENTITY shows "days to go". I found no history, no restore, no draft storage, no image resize, and no era picker (IDENTITY has only release date and pre-save link).

### P0: blocks self-sufficiency

| # | Gap | Suggested fix | Size |
|---|---|---|---|
| P0-1 | No way back after a bad save. Backup download exists, but there is no restore and no history in the screen. Any mistake means a message to us. | Server keeps the last 10 versions of each data file. Add "History" per tab: list by time, "Go back to this one". | M |
| P0-2 | A photo over 5 MB is refused with "Pick a smaller one". Phone photos are usually bigger, and he cannot fix that himself. | Resize (long edge about 1600px) and fix rotation in the browser with canvas before upload. Keep the server cap as a backstop. | M |
| P0-3 | After Save, a deleted row is gone for good and the only guard is a `confirm()` popup. | Remove the row at once with an "Undo" bar (the row stays recoverable until Save). Pair with P0-1 for after Save. Drop `confirm()` for rows. | S |
| P0-4 | Era (album) theme is not editable here. A new album look needs us. | "Album look" picker on IDENTITY: choose from the existing eras by name and swatch, with a preview strip. No free colour pickers. | M |

### P1: faster and more confident

| # | Gap | Suggested fix | Size |
|---|---|---|---|
| P1-1 | No home. He lands on the Shows list. | "Today" card above the tabs: next show, release status, last saved time, 3 quick buttons. | S |
| P1-2 | Unsaved typing is lost if the phone kills the tab. `beforeunload` is unreliable on phones. | Save dirty tabs to localStorage every few seconds (try/catch). On load: "You have unsaved changes from earlier. Keep or throw away." | M |
| P1-3 | No check of links beyond format. A wrong pre-save link goes live. | Show "Fans will tap: [link]" before Save. Optional server check that warns, never blocks. | M |
| P1-4 | A 409 clash tells him to "write down what you changed". A dead end for him. | "Reload and keep my changes" that re-applies his edits where the rows still match. Rare with one user, so keep it small. | M |
| P1-5 | Empty states and field help are thin outside IDENTITY and Bio. | One-line empty states with the Add button. "?" notes on the harder fields. | S |
| P1-6 | "That didn't save" has no code. | Show a short code and "Copy this and text me". The server logs the same code. | S |
| P1-7 | Sign-out guard says "changes aren't saved" without saying where. | Name the tabs: "Unsaved in Shows and Bio." | S |
| P1-8 | After Save the only check is the "See it on the site" link. | Add "Saved at 4:12" next to it and open the link on the right section. | S |

### P2: nice to have

| # | Gap | Suggested fix | Size |
|---|---|---|---|
| P2-1 | No visible audit trail. | "Recent changes": last 10 lines from the server log (when, which tab, how many rows). | S |
| P2-2 | No restore from a backup file in the screen. | Upload the file, show what it replaces, confirm. Skip if P0-1 covers it. | M |
| P2-3 | No "Duplicate show" for repeat venues. | Copy a row, change the date. Real time saver. | S |
| P2-4 | Photo framing. | Fixed frame choice (centre, top, bottom) only. | M |
| P2-5 | Error summary on a failed save does not take focus. | GOV.UK style summary at the top with a link to each bad row. | S |
| P2-6 | Add to Home Screen and a first-run tip card. | Manifest plus a 3-step card. | S |
| P2-7 | Show sync from Bandsintown or similar. | Only if he already uses one. Ask him. | L |

## Suggested build order
1. P0-2 photo resize and P0-3 undo bar.
2. P0-1 history and restore (small server change).
3. P1-1 Today card, P1-2 local draft, P1-6 error code.
4. P0-4 era picker after the designer confirms the era list and tokens.
5. The rest as time allows.

## What NOT to build (overkill for one user)

- Draft and publish workflow with branches or approvals. Sveltia's own is for teams and was still pending in 2026.
- Roles, extra accounts, invite flows.
- Rich text editor, page builder, drag-and-drop layout. Plain text with blank lines is working.
- Free-form crop, filters, a media library with folders.
- Comments, notifications, scheduled publishing. Release day already switches by date.
- Two-factor login or password-reset email. Keep the lockout and the "text me for a new password" path.
- Analytics inside /edit/. Use Spotify's and the host's own.
- A full git CMS (Sveltia, Decap, Keystatic, Tina). Phone rough edges, a GitHub account for Gabe, and more to explain than our single-purpose screen.
- Live visual editing on the real site.

## Open questions
- Does Gabe use Bandsintown or Songkick? (decides P2-7)
- How many eras exist, and may he only pick from them? (decides P0-4 scope)
- Should "Go back" work per tab or for the whole site? Default: per tab.
