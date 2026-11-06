# Launch readiness: hosting, domain, Kit, Fourthwall, operations, checklist

Researcher, read-only web research. Date read: **2026-11-06**. For the owner to decide; nothing bought, no accounts made.
"Unverified" = from a third-party page or a search summary, not the vendor's own page. Re-read every price on the day you buy.
Tax and legal items (CAN-SPAM, sales tax) are not legal advice.

## What the site needs at runtime (from package.json, server.js, HANDOFF.md)
- Node >= 22.13; `npm run build` (Astro + sharp, a native module) then `node server.js` (PORT, default 8080).
- A writable **persistent** `DATA_DIR` (shows.json, shows.prev.json, products.json, uploads). Default is `.data/`.
- Env: `DATA_DIR`, `SESSION_SECRET` (32+ chars), `EDITOR_USERS` (`gabe:<hash>`), `TRUST_PROXY=1`, `SHOP_ENABLED`,
  `KIT_API_KEY`, `KIT_FORM_ID`.
- Outbound HTTPS to `api.kit.com`. One process, one disk: it cannot run as several copies (file writes, in-memory rate limits).
- A once-a-day rebuild (IDENTITY days-to-go, release flips). The build output is in the app folder, not in DATA_DIR.

## 1. Hosting

| Host | Smallest plan that fits (list price, date read) | Persistent disk | Daily rebuild | TRUST_PROXY | Setup / upkeep |
|---|---|---|---|---|---|
| **Render** web service | Starter **$7/mo**; 1 GB disk about **$0.25/GB/mo** (both from search summaries of Render's pages and third-party reviews; the pricing page itself rendered no numbers: **unverified**). Free web services sleep and cannot take a disk. | Yes, paid services only (docs.render.com/docs/disks, read 2026-11-06). One instance only; adding a disk disables zero-downtime deploys (a few seconds down per deploy). Automatic snapshot every 24 h, kept 7 days. | A Render cron job **cannot touch a disk** (render.com/docs/cronjobs), but it can call a **deploy hook**; or a free GitHub Actions schedule calls the hook. Redeploy = fresh build. Cron runs in UTC; $1/mo minimum per cron service. | 1 | Low. Git push deploys, free TLS and custom domain, logs in dashboard. |
| **Azure App Service (Linux)** | Basic B1 about **$13.14/mo** (Microsoft Q&A and 2021 blog; the live pricing page showed no number; an Azure price-cut notice exists: **unverified**). Free F1 has no TLS for custom domains and is dev-only (azure.microsoft.com/pricing/details/app-service/linux, read 2026-11-06). | `/home` is a persistent share, survives restarts, shared across instances (learn.microsoft.com App Service file access, read 2026-11-06; that page is written for Windows, Linux `/home` behaviour should be confirmed). Set `DATA_DIR=/home/data`. | No built-in cron for a web app; use a GitHub Actions schedule that redeploys, or a timer inside the app (coder's call). | 1 | Medium. Owner already knows Azure. Free managed certificate for custom domains exists but its tier/apex limits were **not confirmed** (the docs page 404ed). Portal is heavier than Render. |
| **Fly.io** | shared-cpu-1x 256 MB **$2.19/mo**, 512 MB **$3.69/mo**; volume **$0.15/GB/mo**; shared IPv4 free; first 10 certs free (docs.fly.io/about/pricing, read 2026-11-06). | Yes, a Fly Volume, tied to one machine and one region. | Fly has no first-party scheduler in what I read; use GitHub Actions to `fly deploy`. | 1 | Medium. Command line (`flyctl`) and a Dockerfile; cheapest managed option. Sharp on 256 MB is tight: take 512 MB. |
| **Railway** | Hobby **$5/mo** including $5 usage credit; memory about $10/GB/mo, CPU about $20/vCPU/mo, volume about $0.15/GB/mo, max 5 GB volume on Hobby (railway.com/pricing, read 2026-11-06). Real bill will likely land near $5-8. | Yes, a Volume. | Cron not confirmed on the pricing page; Actions again. | 1 | Low-medium. Usage billing makes the monthly total less predictable. |
| **DigitalOcean Droplet** | Basic **$4/mo** (512 MiB, 10 GiB) or **$6/mo** (1 GiB, 25 GiB); backups +20% weekly / +30% daily (digitalocean.com/pricing/droplets, read 2026-11-06). | Yes, the server's own disk. | Real `cron` on the box. Easiest daily rebuild. | 1 (behind Caddy or nginx) | **High upkeep**: someone patches the OS, sets up Caddy/Let's Encrypt, systemd, firewall, log rotation. |
| DO App Platform | Not read. Skipped: disks on App Platform are the part I could not confirm; a Droplet or Render is clearer. | | | | |

**Recommendation: Render Starter with a 1 GB disk (about $7.25/mo by the figures above).**
Why: the site is one small Node process with a disk, which is exactly Render's model; push-to-deploy, free TLS, custom domain
and logs come with it; the disk gets a daily snapshot for free; nothing to patch. The weak spots are real but small: a few seconds of
downtime per deploy (no zero-downtime with a disk) and Gabe's edits are live to visitors without a deploy, so that does not matter.
**Runner-up: Azure Linux B1** if the owner prefers one cloud for both sites and accepts about double the price and more portal work.
Fly.io is the cheapest managed option but costs the owner command-line time. A Droplet is the cheapest overall and the most upkeep.

**Daily rebuild, host-neutral (recommended):** a GitHub Actions workflow with `on: schedule: cron: '5 5 * * *'` (UTC; 05:05 UTC is 00:05 or 01:05
New York) that POSTs the host's deploy hook. Free for a public repo; the repo is public. A deploy takes a minute or two with a few seconds of
downtime. Alternative: the coder adds a timer in `server.js` that rebuilds in-process (then no redeploy needed). Ask the coder; a scheduled deploy is less code.

## 2. Domain, DNS, email

- **Register glucak.com** (owner's plan; check availability first). Cloudflare Registrar charges registry cost with no markup, renewals at cost,
  and free WHOIS redaction (cloudflare.com/products/registrar, read 2026-11-06). Third-party pages quote about $9-10.5/yr for .com
  (unverified; the live figure is on Cloudflare's site). Any registrar works if it offers auto-renew, WHOIS privacy at no charge, and two-factor sign-in.
  Turn on **auto-renew** and **registrar lock**, and put the account's email on a mailbox the owner and Gabe can both read.
- **DNS:** keep it at the registrar if Cloudflare (free DNS, fast changes). Records: apex and `www` to the host's target (Render
  gives a CNAME / A target; use `www` as canonical if the apex only allows A records), plus mail records below. Lower TTL to 300 s a day before cutover.
- **Free `gabriel@glucak.com`:** Cloudflare **Email Routing** is on the Free plan and **forwards only**; it cannot send
  (developers.cloudflare.com/email-routing, read 2026-11-06; Email Sending is a separate beta needing a paid Workers plan for arbitrary recipients).
  So Gabe gets it in his normal inbox but replies from there show his Gmail address unless he sets up "Send mail as"
  in Gmail through a real SMTP. That needs a sender with SMTP; a paid mailbox (Google Workspace, Zoho, Fastmail) avoids the workaround. Decision for the owner:
  forward-only (free, replies come from Gmail) or a paid mailbox (looks professional on both sides). Prices not read.
- **SPF / DKIM / DMARC basics** (so Kit and any mailbox don't land in spam): one SPF TXT record only (merge senders into a single
  `v=spf1 include:... ~all`); add the DKIM records Kit and the mailbox provider give you; add `_dmarc` TXT starting at
  `v=DMARC1; p=none; rua=mailto:...` and move to `p=quarantine` after a few clean weeks. Kit lets you send from your own domain after you
  add its records (verify the exact steps in Kit's help on the day; not read). Check with a test send to a Gmail and an Outlook inbox.
- **Accounts in Gabe's name, owner as manager:** register the domain, host, Kit, Fourthwall and GitHub secrets under Gabe's identity with a shared
  password manager; owner added as team member/admin where the product has roles (Fourthwall free: 2 team members, see shop-and-tools.md). Where a product has no roles
  (many registrars), use a shared-vault login plus 2FA recovery codes held by the owner. Write down who owns what in one private list.

## 3. Kit (email list)

- **Setup:** Gabe creates the Kit account on the Free plan (up to 10,000 subscribers, shop-and-tools.md). Create one **Form**
  (Grow > Landing Pages & Forms > Form); the **form id** is the number in the form's URL / API. API key: Kit v4 uses `X-Kit-Api-Key`
  (our `signup.js` sends that header). Put both in `KIT_API_KEY` and `KIT_FORM_ID` on the host. Keep the key out of the repo.
- **Does an API add trigger the double opt-in email? Yes, when the form is set to double opt-in.** Kit's v4 docs for adding subscribers to forms state that
  adding to a double opt-in form sends the form's incentive (confirmation) email, and people already on the form don't get it again
  (developers.kit.com/api-reference/forms/bulk-add-subscribers-to-forms.md, read 2026-11-06). Kit's own docs say the subscriber must exist first
  (our code creates it first, then adds it to the form, so this matches). Third parties report Kit forms default to double opt-in, and the form's
  Incentive settings has an **auto-confirm** switch that turns it off (Zapier help; unverified), and that a form-added subscriber starts `inactive` until
  they confirm (Kit WordPress plugin PR; unverified). **Not confirmed in Kit's single-subscriber page:** that exact page said nothing about the email.
  So: **test it** with a real address on day one (see checklist). Keep double opt-in on; the confirmation email must show clearly and not hit spam.
  Our API reply to the visitor should say "check your inbox to confirm" (copywriter).
- **Code check for the coder:** Kit's single-add endpoint page lists the path as `forms/{form_id}/subscribers/{id}` (by subscriber id, body `referrer`).
  `signup.js` posts `forms/{form}/subscribers` with `email_address`. Confirm in the Kit test that this call returns 200/201; if not, switch to the by-id form or the bulk endpoint.
- **CAN-SPAM postal address:** the FTC lists a street address, a USPS-registered P.O. box, or a private mailbox at a commercial mail receiving agency
  (ftc.gov CAN-SPAM guide). Kit's help (help.kit.com/en/articles/2502494, read 2026-11-06): Kit offers **its own address free**
  (600 1st Ave, Ste 330 PMB 92768, Seattle, WA 98104-2246), only for mail sent through Kit, not for receiving mail; other options are a P.O. box (about $100/yr per Kit),
  a UPS Store "suite" address, a co-working or friend's business address. Whether Kit's address is enough for Gabe is the owner's legal call.
  Change it at Settings > Email.

## 4. Fourthwall and Bandcamp

- **Can Fourthwall sell self-shipped physical items like CDs and vinyl? Yes for self-sourced products, but no page names CDs or vinyl as allowed.**
  Fourthwall's "How to sell your own products" says self-sourced products default to "I'm shipping orders myself": you pack, ship, upload
  tracking and handle support (help.fourthwall.com/hc/en-us/articles/13331276928539, read 2026-11-06). That article lists **no product-type restrictions**;
  Fourthwall's 3PL warehouse rate table lists CDs and vinyl (search summary of help.fourthwall.com 3PL guide: about $0.07/item in the smallest tier; unverified).
  Safest: one email to support@fourthwall.com asking "can we sell self-shipped CDs and vinyl, any category restrictions, any music-licensing check?" and keep the reply.
- **Fees:** from shop-and-tools.md (read 2026-11-02): $0 plan, 0% platform fee on own products, card fee 2.9% + 30c; catalog print-on-demand items have a per-item cost.
  Third-party pages say 0% product fee for self-sourced items (unverified); re-read fourthwall.com/pricing when opening the account.
- **Payout:** monthly, automatic via Stripe Connect, around the 3rd business day for the prior month's earnings, **$25 minimum**, then 1-3 business days to a US bank
  (summary of help.fourthwall.com pages via sirency.com; the help center also says the schedule stays monthly after a failed payout; unverified in full).
  Gabe sets up Stripe Connect in his own name and tax details.
- **Product links for our Buy button:** each product's URL is in the dashboard under Products; link either to the product page or a direct checkout link
  `https://{shop_domain}/cart/checkout?products={variant_id}:1` (docs.fourthwall.com/storefront/checkout, read 2026-11-06). Direct links are the
  documented-reliable method; there is no WordPress-style plugin and some pages block iframes. So the site's Buy button is an external link
  (new tab) to that URL, stored in `products.json`; no card data on our site. A custom checkout domain (e.g. shop.glucak.com) is possible in Fourthwall's domain settings.
- **Runner-up Bandcamp merch:** 10% of the item price on physical goods (shipping/tax excluded) plus payment-processor fees; Bandcamp's help says 4-6%, another help page
  says 2.2% + $0.30 on cards: the two disagree, test with one sale (get.bandcamp.help articles 23020665520663 and 15263264). Free account can sell merch; seller ships.
  Third-party claim of Bandcamp-integrated shipping labels (April 2026) is unconfirmed. Better if Gabe already has Bandcamp fans.

## 5. Operations

- **Back up `DATA_DIR` off the server.** Host snapshots are not enough (Render: 7 days, restore wipes later changes, host-local). Plan: a weekly job
  (GitHub Actions or the coder adds a small token-protected `/edit/export` that streams a zip) that copies `shows.json`, `products.json` and `uploads/` to a place the owner and
  Gabe both can read (a private repo release, a storage bucket, or the owner's drive). The code already keeps `shows.prev.json` for one-step undo; that is not a backup.
  Do one **restore drill** before launch: wipe a test disk and restore.
- **Uptime monitoring:** UptimeRobot free plan: 50 monitors, 5-minute checks, commercial use allowed (uptimerobot.com/pricing, read 2026-11-06).
  Monitor `https://glucak.com/` and one signup-adjacent page (and `/shop/` after launch); alert the owner by email. Second free check on the Kit form status is optional.
- **Error logs:** use the host's log view (Render dashboard, Azure Log stream, `flyctl logs`). Free tiers keep little history; if a problem
  needs forensics, add a log drain later. Never log email addresses or password hashes (the coder's call; confirm `signup.js` logs none).
- **Renewing secrets:** `SESSION_SECRET` rotate yearly or when a laptop is lost (rotating signs everyone out, fine). `EDITOR_USERS` hash: reissue if Gabe changes his password
  (`echo 'pw' | node tools/hash-password.mjs`). `KIT_API_KEY`: regenerate in Kit if it ever appears in a screenshot or chat. Domain, host card and Kit are renewals to put in the owner's calendar.
- **If the host is down:** visitors see an error page; Spotify/YouTube links elsewhere still work. Daily recovery steps: check host status page, redeploy the last good build, restore the disk from the off-server backup.
  Keep the old site or a one-page "back soon" at the registrar's redirect as a fallback. Kit sign-ups during downtime are lost (the form posts to our server); mitigation: keep a
  Kit-hosted form link in the Instagram bio as a fallback. A bad deploy: use the host's "rollback to previous deploy".

## 6. Launch-day checklist
1. Domain registered, auto-renew + lock + 2FA on, WHOIS privacy on. DNS TTL lowered a day ahead.
2. Host created, repo connected, build `npm install && npm run build`, start `node server.js`, Node >= 22.13, disk mounted (e.g. `/var/data`), `DATA_DIR` pointing at it.
3. Env vars set: `SESSION_SECRET` (random 32+ chars), `EDITOR_USERS` (hash made with `tools/hash-password.mjs`), `TRUST_PROXY=1`,
   `KIT_API_KEY`, `KIT_FORM_ID`, **`SHOP_ENABLED` unset/off**. (`DEV_EDITOR` must NOT be set.)
4. First deploy on the host's own URL: Home, Music, Shows, About, Privacy load; `/shop/` is noindex and not linked.
5. Custom domain + free TLS issued; HTTP redirects to HTTPS; `www` and apex both land on one canonical; HSTS header present.
6. Check `https://glucak.com/robots.txt` and the sitemap exist (and that the sitemap lists no `/shop/` while it is off); Search Console owner is Gabe's Google account.
7. Share-card check: paste the home URL into Facebook Sharing Debugger, X post composer, and send it to a phone via iMessage/WhatsApp; confirm 1200x630 image, title, description.
8. Kit test: sign up with a real address, confirm the confirmation email arrives (not in spam), click it, see the subscriber become active in Kit; try the duplicate and a bad address; verify the honeypot and rate limit.
9. Gabe's first sign-in at `/edit/`: sign in on his phone, add and delete a test show, see it on the public site without a rebuild, sign out. Wrong password rate limit works.
10. Mail: `gabriel@glucak.com` receives a test; SPF/DKIM/DMARC pass (send to a Gmail and read "Show original").
11. Uptime monitor live and alerting; backup job ran once and a restore drill passed; daily rebuild workflow ran once manually.
12. Real-phone check on iPhone Safari and an Android (prototype open question from HANDOFF.md).
13. Rollback plan: keep the previous DNS values written down; host "rollback to previous deploy" button located; the old site (if any) stays up one week; restore from backup if `DATA_DIR` is damaged.
14. Announce only after steps 1-11 pass.

## Biggest risks (short)
1. Persistent data on one disk with one instance: a bad deploy or disk loss wipes shows/products/uploads unless the off-server backup exists and was restore-tested.
2. Kit sign-up path untested end to end: the double opt-in email, the single-add endpoint path in `signup.js`, and sender-domain authentication could all silently fail.
3. Accounts and renewals owned by the wrong people (domain, host, Kit, Fourthwall) plus CAN-SPAM address and sales-tax duties not settled with the owner before the first email or sale.

## Sources
render.com/docs/disks, render.com/docs/cronjobs, render.com/pricing; docs.fly.io/about/pricing; railway.com/pricing;
digitalocean.com/pricing/droplets; azure.microsoft.com/pricing/details/app-service/linux;
learn.microsoft.com/azure/app-service/operating-system-functionality; developers.cloudflare.com/email-routing;
cloudflare.com/products/registrar; uptimerobot.com/pricing; help.kit.com/en/articles/2502494-alternatives-for-your-physical-address;
developers.kit.com/api-reference/forms/bulk-add-subscribers-to-forms.md and /add-subscriber-to-form.md;
help.fourthwall.com/hc/en-us/articles/13331276928539; docs.fourthwall.com/storefront/checkout;
get.bandcamp.help/hc/en-us/articles/23020665520663; ftc.gov CAN-SPAM guide (via shop-and-tools.md).
