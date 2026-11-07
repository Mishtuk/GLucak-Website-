# GLucak launch runbook

For the person doing the launch. Written 2026-11-06 from `docs/research/launch-readiness.md` and the code (`server.js`, `src/lib/`,
`tools/`). The recommended host is **Render** (Starter + 1 GB disk). Everything that is specific to a host is in **section 3**; on
another host, swap only that section. Sections 1, 2 and 4-10 are host-neutral. Companion: `checklist.md`.

**Unverified** marks a price or a step taken from a search summary or a third-party page, or not read at all. Re-check it in the
vendor's own page on the day. **No secrets go in this file.** Keep them in the host dashboard and the password manager.

## 1. What the site needs
- Node >= 22.13. Build: `npm install && npm run build` (Astro, plus `sharp`, a native module). Start: `node server.js`.
- One process and one persistent disk. It must not run as several copies (file writes and rate limits are in memory).
- Outbound HTTPS to `api.kit.com`.
- The build output (`dist/`) lives in the app folder; the live data lives in `DATA_DIR`. A redeploy rebuilds `dist/` and leaves `DATA_DIR` alone.
- `npm test` runs a build first (`pretest`) and should be green on the commit you ship.

## 2. Environment variables
Set these on the host. Leave out any that say "leave unset".

| Variable | Set to | What it does |
|---|---|---|
| `SESSION_SECRET` | 32+ random characters | Signs the `/edit/` login cookie. In production, if it is missing or shorter than 32, the edit routes answer 503 and log "Edit screen off". Changing it signs everyone out (fine). |
| `EDITOR_USERS` | `gabe:<hash>` (more with commas: `gabe:<hash>,alex:<hash>`) | Who may sign in at `/edit/`. Name then a password hash (32 hex, a dot, 128 hex). A bad entry is skipped with a warning. A new hash ends that editor's old sessions. |
| `DATA_DIR` | the persistent disk path, e.g. `/var/data` | Where `shows.json`, `shows.prev.json`, `products.json` and `uploads/` live. Default is `.data/` inside the app, which is lost on redeploy on most hosts. |
| `TRUST_PROXY` | `1` | Trust the host's `X-Forwarded-For` and `X-Forwarded-Proto` headers: real client IP for rate limits, and HTTPS detection for secure cookies and HSTS. Only set it behind the host's proxy. |
| `KIT_API_KEY` | from Kit (Settings > Developer / API) | Server-side sign-up to Kit API v4 (sent as `X-Kit-Api-Key`). Never in the browser or the repo. |
| `KIT_FORM_ID` | the number of the one Kit Form | The form new subscribers are added to. |
| `SHOP_ENABLED` | leave **unset** at launch (`1` turns the shop on) | `1` adds Shop to the nav, phone bar and footer. Read per request, so flipping it needs a restart, not a rebuild. |
| `NODE_ENV` | `production` | Production mode (also on if `WEBSITE_SITE_NAME` is set, as Azure does). Render does not set it for Node by default (**unverified**), so set it. |
| `PORT` | leave unset on Render (it supplies one) | Port the server listens on; default 8080. |
| `SITE` / `SITE_URL` | leave unset | Build-time canonical site, default `https://glucak.com`. Only set to preview on another address (for a staging build). |
| `DEV_EDITOR` | **must NOT be set** | A localhost-only login bypass. It is ignored in production, but keep it out. |
| `SHOWS_FILE`, `PRODUCTS_FILE`, `RELEASES_FILE`, `DIST_DIR` | leave unset | Path overrides for tests and tools. |

### Make SESSION_SECRET
On any machine with Node 24:

    node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

Copy the output straight into the host's env var screen and the password manager. Do not paste it into chat or a file in the repo.

### Make the EDITOR_USERS hash (`tools/hash-password.mjs`)
From the repo folder:

    node tools/hash-password.mjs

It asks for the password (typing is hidden and never lands in shell history) and prints a hash. Gabe should choose his own password
(the tool refuses weak ones and says why). Then set `EDITOR_USERS` to `gabe:<the hash>`. Do not use `echo 'pw' | ...` or pass the
password as an argument; both put it in shell history. A password manager's CLI can pipe into the tool instead. To change a password,
make a new hash and replace it in the env var; his old sessions end at once.

## 3. Host-specific: Render (swap only this section for another host)
Render figures are from search summaries of Render's pages: **unverified** until you read them. Starter about $7/mo, disk about $0.25/GB/mo.
Free web services sleep and cannot have a disk, so use a paid one.

1. Create a Render account (in Gabe's name, owner as a team member where roles exist). Connect the GitHub repo `Mishtuk/GLucak-Website-`.
2. New > **Web Service**. Runtime Node. Region near New York. Instance type **Starter**. **One instance only.**
3. Build command: `npm install && npm run build`. Start command: `node server.js`.
4. Node version: the repo's `engines` asks for >= 22.13. If Render picks a lower one, set the `NODE_VERSION` env var to a 22.x or 24.x release (**verify** the current setting name in Render's docs).
5. Add a **Disk**: 1 GB, mount path `/var/data`. Set `DATA_DIR=/var/data`. (Adding a disk disables zero-downtime deploys: expect a few seconds down per deploy.)
6. Add the env vars from section 2.
7. Health check path: `/`. First deploy; open the `*.onrender.com` URL and run the smoke test (section 7) there before touching DNS.
8. Custom domain: Settings > Custom Domains > add `glucak.com` and `www.glucak.com`. Render shows the DNS targets and issues free TLS once DNS verifies. Use the exact values it shows in section 4.
9. **Deploy hook** (Settings > Deploy Hook): copy the URL. It is a secret. Save it as a GitHub Actions secret named, for example, `RENDER_DEPLOY_HOOK`.
10. **Daily rebuild** (needed so the IDENTITY days-to-go and release flips update). A Render cron job cannot touch the disk, but it can call a deploy hook, and a redeploy is a fresh build. Use a free GitHub Actions workflow in the public repo:

        on:
          schedule:
            - cron: '5 5 * * *'   # UTC; 00:05 or 01:05 New York
          workflow_dispatch:
        jobs:
          rebuild:
            runs-on: ubuntu-latest
            steps:
              - run: curl -fsS -X POST "$HOOK"
                env:
                  HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}

    A deploy takes a minute or two with a few seconds down. Run it once by hand (`workflow_dispatch`) before launch and check Render's Events log. (The workflow file is a Coder item in the checklist.)
11. Logs: Render dashboard > Logs. Snapshots: Render snapshots the disk every 24 h and keeps 7 days; a restore from a snapshot wipes later changes. **Treat this as a convenience, not the backup** (section 10).
12. Rollback: Render dashboard > Events > pick the last good deploy > Rollback (**verify** the button name on the day). Locate it before launch day.

On **Azure App Service (Linux)** instead: use `/home/data` as `DATA_DIR` (**confirm** `/home` persistence on Linux), `WEBSITE_SITE_NAME` makes the server treat itself as production, and the daily rebuild is a GitHub Actions schedule that redeploys. On **Fly.io**: a Volume, a Dockerfile, 512 MB RAM (sharp is tight on 256 MB), and `fly deploy` from Actions.

## 4. DNS
Registrar and DNS at Cloudflare is the recommendation (free DNS, fast changes). Use the exact targets your host and mail providers show; the values below are placeholders.

**The day before cutover (e.g. Sun Jan 10, or earlier if the site goes live on the domain before launch):** lower the TTL of the existing apex and `www` records to **300 seconds**. Wait for the old TTL to pass.

| Record | Name | Value | Notes |
|---|---|---|---|
| A or ALIAS/CNAME-flattened | `glucak.com` (apex) | the host's target (Render shows an A record or CNAME; Cloudflare flattens a CNAME at the apex) | If the host allows only A records at the apex, make `www` the canonical and redirect the apex to it. |
| CNAME | `www` | the host's target (Render: `<service>.onrender.com`) | Both names must land on one canonical address over HTTPS. |
| MX | `glucak.com` | Cloudflare Email Routing records (or the paid mailbox provider's) | Added by turning Email Routing on. Forwarding only; it cannot send. |
| TXT (SPF) | `glucak.com` | one record only, e.g. `v=spf1 include:<kit-or-mail-provider> ... ~all` | **Only one SPF record may exist.** Merge senders into it. Use the include values Kit and the mailbox provider give you. |
| CNAME/TXT (DKIM) | as given | the DKIM records Kit and the mailbox provider give you | Needed for Kit to send from the domain. Verify the exact steps in Kit's help on the day (not read). |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:<owner mailbox>` | Start at `p=none`. After a few clean weeks, move to `p=quarantine`. |

If Cloudflare proxies the site (orange cloud), start with DNS-only (grey) until the host's certificate is issued, to avoid a redirect loop (**check** on the day).
Check mail with a test send to a Gmail and an Outlook inbox; in Gmail use "Show original" and read SPF / DKIM / DMARC = PASS.

## 5. Before the cutover (night before / morning of)
1. Host service built from the exact approved commit and healthy on its own `onrender.com` URL; smoke test (section 7) passes there.
2. Env vars as in section 2; `SHOP_ENABLED` unset; `DEV_EDITOR` unset.
3. TTL lowered a day ahead (section 4).
4. Old DNS values written down (export the zone or screenshot it). Keep the old site, if any, up for a week.
5. A fresh backup taken and stored off the server (section 10).
6. Uptime monitor created (UptimeRobot free: 5-minute checks, email alerts, **unverified** current limits) on `https://glucak.com/`.
7. Search Console: Gabe's Google account verifies glucak.com (DNS TXT record) so the sitemap can go in.

## 6. Cutover
1. Add or change the apex and `www` records to the host's values (section 4). Do mail records the same day if not already in.
2. In the host, check both names show as verified and the certificate is issued.
3. Wait for DNS: `nslookup glucak.com` and `nslookup www.glucak.com` should return the host. With a 300 s TTL it takes minutes.
4. Open `http://glucak.com` (redirects to HTTPS), `https://glucak.com`, `https://www.glucak.com`: all end on one canonical address. Check the response has `Strict-Transport-Security`.
5. Run the smoke test (section 7) on the real domain.
6. Only then tell Gabe and announce. Raise the TTL back to 3600 or higher after a stable day.

## 7. Smoke test (on the domain, phone and desktop)
- [ ] `/`, `/music/`, `/shows/`, `/about/`, `/privacy/` load, no console errors, fonts do not reflow, Spotify player shows.
- [ ] Nav: every page is one tap from the menu. `/shop/` is not linked and is noindex.
- [ ] `/robots.txt` and `/sitemap.xml` exist; the sitemap lists no `/shop/`.
- [ ] View source of Home: canonical is `https://glucak.com/...`, share image 1200x630, no stray `localhost`.
- [ ] **404 status:** open `/no-such-page/`. The page reads "That page isn't here. The music is." **and** the HTTP status is 404 (`curl -I https://glucak.com/no-such-page/` shows `404`). It sends `X-Robots-Tag: noindex`.
- [ ] **`/edit/` sign-in:** open `/edit/`, sign in as `gabe` (his password). A wrong password is refused and, after several tries, rate limited. Signed out `/edit/api/shows` answers not signed in.
- [ ] **A test show:** add a show dated in the future (venue "TEST"), see it on `/shows/` and Home without a rebuild, then delete it. Past shows drop off by themselves.
- [ ] **The `.ics`:** on an upcoming show tap Add to calendar (`/shows/<id>.ics`): it downloads `glucak-<id>.ics` as `text/calendar` and opens in the calendar on iPhone and Android. A past or unknown id returns 404.
- [ ] **Sign-up with Kit:** on Home use the sign-up form with a real address you own: the page says to check the inbox, the confirmation email arrives (not in spam), clicking it makes the subscriber active in Kit. Then try a duplicate and a bad address. The honeypot field stays empty. If it fails, check `KIT_API_KEY`, `KIT_FORM_ID` and the host logs; the single-add endpoint path in `src/lib/signup.js` may need the by-id form (see the checklist).
- [ ] Download a backup from `/edit/` ("Download a backup") and open the JSON: shows, products and uploads present.
- [ ] Share-card: paste the Home URL into the Facebook Sharing Debugger and a phone chat; title, description and image show.
- [ ] Uptime monitor green.

## 8. Rollback
Pick the smallest fix first.
1. **Bad deploy / bad code:** in the host, roll back to the previous good deploy (Render: Events > Rollback, **verify**). `DATA_DIR` is untouched by a rollback. Re-run the smoke test.
2. **Bad content (a wrong show list):** in `/edit/`, use the one-step undo (the server keeps `shows.prev.json`), or fix the rows.
3. **Wrong DNS or certificate trouble:** put the old DNS values back (kept from section 5, step 4). Cheap with the 300 s TTL.
4. **Damaged or lost data:** restore from the off-server backup (section 9). Render's 7-day disk snapshot is a second chance, not the first.
5. **Host down:** check the host's status page, redeploy the last good build, then restore from backup if the disk is gone. While it is down visitors see an error and Kit sign-ups are lost (the form posts to our server); keep a Kit-hosted form link for Gabe's Instagram bio as a fallback.
6. Write down what happened in `HANDOFF.md`.

## 9. Restore from a backup (`tools/backup.mjs`)
Run on the server's shell (Render: the web service's Shell tab), with the same env as the app, so `DATA_DIR` is the disk. Needs a shell on the box; on Render the shell is **verify**.

    node tools/backup.mjs export [out-file]        # one JSON file; same as the edit screen's download
    node tools/backup.mjs restore <file>           # DRY RUN: validates everything and changes nothing
    node tools/backup.mjs restore <file> --yes     # restores

1. Get the backup file onto the server (the file is untrusted; the tool checks every row and photo first and refuses anything over 50 MB).
2. Run the dry run. It prints the data folder, shows and products now vs in the backup, and how many photos are new or overwritten (other photos are kept). Fix any listed problems; a failed check changes nothing.
3. Run again with `--yes`. It first saves the current data as `DATA_DIR/pre-restore-<time>.json`, then replaces the data with atomic writes.
4. Reload `/shows/` and `/edit/`; confirm counts and photos.
5. Gabe can also download a backup himself from `/edit/` any time; restore is owner-only.

**Rehearse this once before launch** against a scratch `DATA_DIR` (checklist section 5).

## 10. Backups and upkeep
- **Off-server backup:** weekly (and before any big change), `node tools/backup.mjs export`, or Gabe's download from `/edit/`, copied to a place the owner and Gabe can both read. Host snapshots are not enough (7 days, host-local, a restore wipes later changes). A scheduled job to automate this is a Coder item.
- **Daily rebuild:** the GitHub Actions workflow in section 3, step 10. Check it ran after launch; if it fails the site still serves, but days-to-go and release flips go stale.
- **Rotate secrets:** `SESSION_SECRET` yearly or on a lost laptop; `EDITOR_USERS` when Gabe changes his password; `KIT_API_KEY` in Kit if it ever shows up in a screenshot or chat. Update the host env var and restart.
- **Renewals** in the owner's calendar: domain, host card, Kit.
- **Logs:** the host's log view. The code must not log emails or hashes; if you see either, treat it as a bug and tell the Desktop.
