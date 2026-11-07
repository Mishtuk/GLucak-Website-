# GLucak launch checklist (target: live Mon Jan 11, 2027)

Written 2026-11-06 by the Laptop boss from `docs/research/launch-readiness.md`, `HANDOFF.md` ("Waiting on"), `ROADMAP.md`
and `CONTEXT.md`. Step-by-step for the launch itself: `runbook.md` (same folder).
Prices are list prices from the research (read 2026-11-06). **Unverified** = from a search summary or third-party page;
re-read it on the day you buy. Nothing here has been bought. No secrets belong in this file.

Owners: **Owner** (Alex), **Gabe**, **Desktop**, **Laptop**, **Coder** / **Designer** (agents, run by Desktop or Laptop).
Dates come from ROADMAP.md; they slide if Gabe's assets slide. The rule: assets by Nov 30, launch about 6 weeks later.

## 1. Owner decisions (do these first; each one blocks the steps below it)
| | Decision | Recommendation (research) | Cost | Decide by | Owner |
|---|---|---|---|---|---|
| [ ] | **Host** | Render Starter + 1 GB disk. Runner-up: Azure Linux B1 (owner knows it, about double the price, heavier portal). Fly.io is the cheapest managed option but needs command-line work. | About $7/mo plus about $0.25/GB/mo for the disk, so about $7.25/mo (**unverified**: Render's pricing page showed no numbers). Azure B1 about $13/mo (**unverified**). | **Nov 8** (ROADMAP phase 0). Host must be live by **Dec 6**. | Owner |
| [ ] | **Domain** glucak.com | Register now at Cloudflare Registrar (cost price, free WHOIS privacy, free DNS). Auto-renew, registrar lock, 2FA. In Gabe's name, account email both can read. Also ask Gabe about the long slogan domain (his question 6). | About $9-10.50/yr (**unverified**; live price on Cloudflare) | **Nov 8** (the name could be taken while he is promoted). | Owner, with Gabe's OK |
| [ ] | **Mailbox type** for gabriel@glucak.com (booking address) | Start with Cloudflare Email Routing: free, forwards to his Gmail. It cannot send, so replies show Gmail unless he sets "Send mail as". Choose a paid mailbox (Google Workspace, Zoho, Fastmail) only if he wants replies from the domain. | Free for forwarding. Paid mailboxes: price not read. | **Dec 6** (so DNS and mail settle by Jan 4). | Owner + Gabe |
| [ ] | **Kit plan and postal address** | Kit Free (up to 10,000 subscribers, has the API). Keep double opt-in on. CAN-SPAM address: Kit's free address (Seattle PMB) is cheapest; a P.O. box is about $100/yr per Kit. Whether Kit's address is enough is the owner's legal call, not legal advice. | $0 | Account open by **Dec 21**; address settled before the first real send. | Owner + Gabe |
| [ ] | **Shop provider** | Fourthwall free plan (0% platform fee on own products, card fee 2.9% + 30c; partly **unverified**). Runner-up Bandcamp merch (10% of item price plus processing). Email Fourthwall support now: "can we sell self-shipped CDs and vinyl, any category restrictions, any licensing check?" The shop is hidden at launch (`SHOP_ENABLED` off), so this blocks nothing. | $0 plan | Email support by **Dec 6**; real decision spring 2027 (ROADMAP phase 7). | Owner, Gabe |
| [ ] | Who owns each account, in one private list (host, domain, Kit, GitHub secrets, Fourthwall, UptimeRobot) | Gabe's name, owner as manager (CONTEXT.md). Shared password manager. | $0 | Before opening any account (**Nov 8**). | Owner |
| [ ] | **Hero A / B / both** | Boss recommends "both" (A on phones, B from 900px); built as `HERO = 'ab'`. | $0 | Nov 22 | Owner |
| [ ] | **Daily rebuild method** | GitHub Actions schedule that POSTs the host's deploy hook (free; the repo is public). Alternative: the Coder adds an in-process timer. | $0 (a Render cron would be $1/mo minimum and cannot touch the disk) | Dec 6 | Owner, Coder |
| [ ] | **Off-server backup place** | A place the owner and Gabe can both read (private repo release, drive, bucket). | $0 to small | Dec 6 | Owner |

## 2. Gabe's answers (launch blockers only)
The full list of 26 questions is in `HANDOFF.md` ("Questions for Gabe"); numbers below match it. Send the launch blockers first,
a group at a time. Everything not listed (11-14, 18-26 and the image-library questions) can wait. Owner sends; Gabe answers.

- [ ] **Assets, small set (Nov 9):** arrived 2026-11-05 (playlist, logos, photos in `assets/from-gabe/`). Still ask for originals of the live photos. Owner / Gabe.
- [ ] **Assets, everything else (Nov 30):** IDENTITY art and colors, more photos, shows list. Owner / Gabe.
- [ ] Q2: current show list (date, venue, city, link, show or open mic). Gabe.
- [ ] Q3: is Riverside (Horsham) on Jan 16 confirmed, ticketed or free. Gabe.
- [ ] Q4: which logos he made and which Dave Bahm made (credits). Gabe.
- [ ] Q5: existing email list to move over. Gabe.
- [ ] Q6: OK to register glucak.com (and the slogan domain) in his name. Gabe. (The owner needs this before registering.)
- [ ] Q7: Welcome Home release date and pre-save link. Gabe.
- [ ] Q8: is Scenic Route still out Jan 15, 2027. Gabe.
- [ ] Q9: what to call albums, whether Anomaly and the You're Not Alone EP are listed, the Deluxe date. Gabe.
- [ ] Q10: "feat. Emily Mae" on Go and the other credits correct. Gabe.
- [ ] Q15: "Epilepsy survivor" on Home or only About, and "Healed by Christ since 2009". Gabe.
- [ ] Q16: do the Duck Dodge, Scenic Route live and Riverside videos have flashing lights or strobes (hard rule: only safe ones). Gabe.
- [ ] Q17: will his list really hear first (sets the sign-up promise). Gabe.
- [ ] Gabe OKs the page text (ROADMAP phase 4, Dec 21 - Jan 8). Owner relays, Gabe.
- [ ] Optional: Gabe OKs the two quotes (Q18); Desktop then flips `QUOTES_APPROVED` (D67).

## 3. Accounts (in Gabe's name, owner as manager)
Where a product has no roles, use a shared-vault login plus 2FA recovery codes held by the owner.
- [ ] Domain registrar (Cloudflare): auto-renew, lock, 2FA, WHOIS privacy. By Nov 8. Owner with Gabe.
- [ ] Host (Render, or the chosen one): owner as admin; note who pays. By Nov 22. Owner.
- [ ] GitHub: repo stays under Mishtuk; add the deploy-hook secret for the daily rebuild. By Dec 6. Owner.
- [ ] Kit: Gabe creates it, owner added as manager; one Form created; API key and form id stored in the password manager. By Dec 21. Gabe + Owner.
- [ ] Google account Gabe controls, for Search Console (verify glucak.com). By Jan 4. Gabe.
- [ ] UptimeRobot free plan, email alerts to the owner. By Jan 4. Owner.
- [ ] Fourthwall: only when the shop opens (spring). Gabe sets up Stripe Connect in his own name. Gabe.
- [ ] One private list of who owns and who pays for each, with renewal dates in the owner's calendar (domain, host, Kit). Owner.
- [ ] Secrets (SESSION_SECRET, EDITOR_USERS, KIT_API_KEY) live only in the host dashboard and the password manager, never in the repo, chat or screenshots. Owner.

## 4. Build items left
From ROADMAP.md and HANDOFF.md as of 2026-11-06. Tick when merged and `npm test` is green.
Desktop = `server.js`, `src/`, builds and Chrome. Laptop = design, copy, review. Check HANDOFF.md claims before editing.
- [ ] Hero pick locked, `HERO` set in `src/pages/index.astro`. Owner, then Desktop.
- [ ] Spotify playlist embed with the real playlist (done); confirm logged-out and in Instagram's in-app browser. Desktop.
- [ ] 200% text fix verified (WCAG 1.4.4 / 1.4.10); Laptop mirrors it into `prototype/` later. Desktop, Laptop.
- [ ] Home v2: owner decides which of v2's 5 items stay; `/v2/` removed or kept unlinked + noindex before launch. Owner, Desktop.
- [ ] Backup link words (`docs/copy/backup.md`) into `src/pages/edit/index.astro`; backup review fixes F1-F4 (`docs/review/backup-review.md`). Laptop words, Desktop wires.
- [ ] Kit single-add endpoint: `signup.js` posts `forms/{form}/subscribers`; Kit's page lists `forms/{form_id}/subscribers/{id}`. Prove 200/201 in the Kit test, else switch to the by-id or bulk endpoint. Desktop.
- [ ] Sign-up reply says "check your inbox to confirm" (double opt-in). Laptop copy, Desktop wires.
- [ ] Confirm `signup.js` logs no email addresses and no password hashes. Desktop.
- [ ] Privacy page final (email sign-up, Spotify embed); no child in frame on Home or Push Past Fear (D1 done). Laptop review.
- [ ] Shows empty state is good, in case no shows are booked on day one. Laptop review.
- [ ] Booking chips: swap the placeholder for gabriel@glucak.com once the mailbox exists. Desktop.
- [ ] `/shop/` noindex and not linked while `SHOP_ENABLED` is off; sitemap lists no `/shop/`. Desktop.
- [ ] Daily rebuild workflow (`.github/workflows/`) with the deploy-hook secret. Coder (Desktop).
- [ ] Off-server weekly backup job, or a written manual routine using `tools/backup.mjs export`. Coder (Desktop) + Owner.
- [ ] Share images per page (`node tools/og.mjs`, 1200x630) regenerated after the final era and photos. Desktop.
- [ ] Flash and motion audit on every page and any hosted clip (PEAT or a frame check); `prefers-reduced-motion` honored. Boss.
- [ ] Final boss review at 390 and 1280 on every launch page, plus the injection checks. Laptop boss.
- [ ] IDENTITY era art and colors dropped in when Gabe's assets arrive (one file swap). Designer.
- [ ] Gabe's edit-screen guide (`docs/guide/gabe-guide.md`) finished and walked through with him. Laptop.

## 5. Pre-launch tests (finish by Jan 4, a week before launch)
- [ ] **Real-phone test**, iPhone Safari and an Android phone; note differences (Safari is the big unknown). Owner.
  - [ ] Fitted lines fill the width, no overflow.
  - [ ] Duotone photo renders.
  - [ ] Bottom bar sits above the iPhone home indicator.
  - [ ] GLUCAK does not reflow as the font loads.
  - [ ] **Add to calendar on iPhone:** tap it on a show; Calendar opens on the right day.
  - [ ] **Add to calendar on Android:** same, in the calendar app.
- [ ] 200% text: browser zoom 200% (and a large phone text size) on Home, Shows, Music, About: nothing overlaps or hides. Laptop / Desktop.
- [ ] Lighthouse (mobile) on each launch page: Performance, Accessibility, Best Practices, SEO; note scores in `docs/review/`. Desktop (`tools/perf.mjs` for page weight).
- [ ] Keyboard-only pass and a screen-reader spot check (skip link, one h1 per page, link names). Laptop.
- [ ] Share-card check: Facebook Sharing Debugger, X composer, iMessage / WhatsApp. Owner.
- [ ] Spotify link logged out and inside Instagram's in-app browser. Owner.
- [ ] Kit end to end with a real address: confirmation email arrives (not in spam), click it, subscriber turns active; duplicate and bad address; honeypot; rate limit. Owner + Gabe.
- [ ] Gabe's first sign-in on his phone: add a test show, see it on the public site with no rebuild, delete it, sign out; wrong-password limit works. Gabe + Owner.
- [ ] Mail: a test to gabriel@glucak.com arrives; SPF, DKIM, DMARC pass (Gmail "Show original"). Owner.
- [ ] **Backup + restore drill:** `node tools/backup.mjs export`, point a scratch `DATA_DIR` (or a wiped test disk) at nothing, restore with the dry run then `--yes`, confirm shows, products and photos are back. Owner or Desktop.
- [ ] Daily rebuild ran once by hand and once on its own schedule. Desktop / Owner.
- [ ] Uptime monitor alerts (stop the service once on the test URL and watch for the email). Owner.
- [ ] Rollback rehearsed: found the host's "roll back to previous deploy" and wrote down the old DNS values. Owner.
- [ ] `npm test` green on the commit being launched. Desktop.

## 6. Launch day (Mon Jan 11, 2027, on the owner's go)
Do not announce until every box in section 5 is ticked. Steps are in `runbook.md` sections 6-8.
- [ ] Go from the owner; Gabe told. Owner.
- [ ] Final deploy of the approved commit; smoke test passes (runbook section 7). Desktop / Owner.
- [ ] DNS has pointed since about Jan 4; confirm apex and `www` both resolve, one canonical, HTTPS, HSTS. Owner.
- [ ] `robots.txt` and `sitemap.xml` reachable; submit the sitemap in Search Console. Gabe / Owner.
- [ ] Uptime monitor green. Owner.
- [ ] Post on board #1 and update HANDOFF.md. Laptop / Desktop.
- [ ] Gabe announces (Instagram bio link, one post). Keep a Kit-hosted form link handy as a fallback. Gabe.
- [ ] Owner stays reachable for the first hours. Owner.

## 7. First week
- [ ] Days 1-3: read host logs and the uptime history; check `/edit/` still signs in; sign-ups reach Kit. Owner.
- [ ] Day 1: Gabe adds or confirms a real show himself. Gabe.
- [ ] Day 3: take a manual backup export and store it off the server. Owner.
- [ ] Day 3: confirm the daily rebuild ran on its own (IDENTITY days-to-go changed). Desktop.
- [ ] Day 7: fix list from real use (sign-up rate, phone problems, Gabe's feedback). Boss.
- [ ] When Gabe sends it: swap in the new bio (a content swap; it never held launch). Laptop copy.
- [ ] After a few clean weeks: move DMARC from `p=none` to `p=quarantine`. Owner.
- [ ] Put secret rotation (yearly, or on a lost laptop) and the domain, host and Kit renewals in the owner's calendar. Owner.
- [ ] Next: Videos, Photos, Contact / Booking pages, then the shop (Fourthwall answer first). Boss.
