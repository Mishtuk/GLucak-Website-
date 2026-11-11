# Instagram security and web reels: what they teach, and what applies to GLucak (Laptop researcher, 2026-11-11)

Sources: four reels the owner sent (below) and the public reels of their four creators. Read only: nothing was liked, commented, followed or DM'd.
Method: `yt-dlp` fetched each reel's video, caption and date without logging in (dates are UTC). Speech was transcribed on this PC (Whisper small, run locally in Node) and
checked by eye; "[screen]" marks text that is only on screen, read from ffmpeg contact sheets. Instagram would not give `yt-dlp` a profile page without a login, so
profile reel lists came from the public profile pages opened in Chrome (reel ids, view counts, bio). Everything else the creators post (comment-for-a-PDF "resource docs", DMs) is a lead magnet and
was not requested.
Transcripts below are condensed in our own words (the creators' speech is theirs). The raw machine transcripts are in the scratchpad, not in the repo:
`C:\Users\alexm\AppData\Local\Temp\claude\29abb69cf93759cc\9bcf59e3-5d65-4720-88d2-c7f991fa7795\scratchpad\reels\` (`*.txt`, `study\*.txt`).
Not verified: OWASP, MDN and RFC links below are standard references that were not re-opened this session (only bookofshapes.com was). Nothing here was run on a live host. One finding (S7) was reproduced on a local server.

## 1. The four reels

| # | Reel | Creator | Date | Length | What it is |
|---|---|---|---|---|---|
| 1 | https://www.instagram.com/reel/DcV4_XvTded/ | @byarnieverma (Arnie Verma) | 2026-08-22 | 21 s | "Securitymaxxing for your vibe coded app (Part 3)": checks 37-54 |
| 2 | https://www.instagram.com/reel/DfgUOg6EoE3/ | @ui_motion_prompts | 2026-11-09 | 12 s | "Menu Part 3": six ways to open one menu (design, no speech) |
| 3 | https://www.instagram.com/reel/Det6xAWgLk4/ | @minutelet | 2026-10-20 | 93 s | "10 things that expose your app before 1000 users", #1 race conditions |
| 4 | https://www.instagram.com/reel/Dcvgqsuv3Rs/ | @setupsai (Tony Chen) | 2026-09-01 | 13 s | "Powerful websites you should know, part 1134": Book of Shapes (SVG patterns) |

**Reel 1, Arnie, Part 3 (37-54).** Caption: 'Comment "protection" for the resource doc' (lead magnet) + #ai #security #vibecode. Speech is only the list, read fast over a talking head; the list is also on screen as it appears.
The 18 items: 37 vulnerable dependencies, 38 malicious packages, 39 prompt injection, 40 unpermissioned AI access, 41 excessive DB permissions, 42 missing audit logs, 43 no security
monitoring, 44 no backups/restore, 45 exposed internal dashboards, 46 missing security headers, 47 insecure cookie settings, 48 unencrypted sensitive data, 49 poor tenant isolation, 50 unreviewed AI code,
51 mass assignment, 52 command injection, 53 insecure deserialization, 54 misconfigured OAuth. Teaches: a pure checklist, no explanations, no fixes. Claims: none that can be tested; it is a prompt for what to ask your AI to audit.
His earlier parts (found on his profile, all studied the same way) continue the numbering to 70, see section 3.

**Reel 2, ui_motion_prompts, Menu Part 3.** Caption: "same menu, six ways to open it ... Which one would you use? Comment 1-6 / Free prompts, link in bio". No speech (music; the "Bye!" a speech tool returns is noise).
[screen] six variants on one dark phone mock: 1 Anchor Pop (menu springs out of the button edge, shrinks back on pick), 2 Turn Over (the card turns over to show the menu), 3 Card Deal (items deal out like cards, the picked one flies into the button),
4 Drum Roll (items roll in on a 3D drum, then roll away), 5 Outline Trace (a violet-cyan outline traces the panel, then rows wipe in), 6 Tile Build (the panel builds from tiles in a wave, then breaks apart). Dark navy, violet, mint/cyan glow.
Teaches: the open/close motion is the whole design; every variant starts at the trigger button.

**Reel 3, minutelet, race conditions (#1 of 10).** Caption: "Ten Things that expose your app before 1000 users! Here is the first one: Race Condition." Blueprint-style animated diagrams (chalk on blue) with captions.
Says: two buyers can both be told they got the last ticket if two requests read "1 left" before either writes. Do not check in code and then write; let the database check and write in one step ("take one ticket only if one is left"),
which works because the row is locked while it writes; the second request then sees zero. Same bug behind double charges and duplicate sign-ups; one impatient double click is enough, no big traffic needed.
[screen] the list of 10: race conditions, N+1 queries, error tracking, rate limits, background jobs, spend alerts, rollback, live database, webhooks, backups. Ends: "ask your AI to find every race condition in my app and fix each with a single update or a row lock".

**Reel 4, setupsai, Book of Shapes.** Caption: "find almost any customizable SVG patterns #svg #pattern #poster". Says: a site of generative SVG patterns with sliders; edit and download instantly; any pattern can become a poster; no login. [screen] bookofshapes.com, "A collection of minimal, generative and customizable SVG-patterns. Created by Nikolaj Sokolowski"; patterns Hiding Squares, Scattered Cube Grid, Broken Ring, Concentric Noise Rings; a "Make a poster" panel that lays the pattern on a white poster sheet.
Looked up (not in the reel): the site's licence page allows commercial use, no attribution needed (credit welcome), but you may not redistribute the patterns as patterns (packs, or offering them inside an app, builder or template). Three patterns that recreate existing works (Joy Division, Joy Division Mesh, Brockmann Beethoven Arcs) may be studied but not published or sold, especially on record sleeves or posters. Pattern node graphs and site source code are not covered.

## 2. The creators and their channels

| Handle | Who | Followers (profile, 2026-11-11) | Content | Commercial angle |
|---|---|---|---|---|
| @byarnieverma | Arnie Verma, Australian founder ("Growing @outmatched_aus", arnieverma.com) | 8.7K | talking-head AI-building, founder and security lists | Every post is "comment a word for the resource doc" (lead magnet); one is a legal-services affiliate offer (Lawpath); no claim of security credentials on the profile |
| @ui_motion_prompts | "UI x motion_prompts" (also @game_feel_prompts) | 11.8K | one UI component, six motion variants, daily; "each one is a copy-paste AI prompt" | Prompts free; copy-paste code sold ($3 each, $29 for all 27, Gumroad) |
| @minutelet | "Your Guide to System Design, Databases & Engineering" | 2.9K | plain-English "before 1000 users" advice with blueprint animations, aimed at people building with AI | None seen |
| @setupsai | Tony Chen, daily "tech and AI tips", 3.8M followers | 3.8M | "Powerful websites you should know" (part 1,205 by Nov 11) | Many parts are sponsored (e.g. #runableai on part 1205, @meetgamma on part 211) |

Reading the four against each other: Arnie and minutelet cover the same ground; minutelet is the better teacher (one idea, one fix, one analogy, a prompt to ask your AI), Arnie is the broader list but names things without explaining them.

### 2a. Other recent reels, and what was studied
Studied in full (video, transcript, frames) are marked **S**. "Title only" = caption read, not transcribed. Dates UTC.

**@minutelet (16 recent on the profile + 8 more from scrolling).** The 10-things series: #1 race conditions (reel 3) **S**; #2 N+1 queries DeukQOYseNV (10-20, performance, skipped); #3 error tracking Dewbx (10-21, title only); #4 rate limiting DexMyZHMkQT (10-21) **S**; #5 background jobs DezDx7 (10-22, skipped); #6 spend alerts De0L00 (10-22, title only); #7 rollbacks De1nG1 (10-23, title only); #8 live database De2UIH (10-23, title only); #9 webhooks De4gWi (10-24, title only); #10 backups you never restored De5AwFWMT75 (10-24) **S**. Others:
Deg-smBMExC "never trust the client" (10-15) **S**; Dej4ffusB4f prompt injection (10-16) **S**; DemJpnvsFwB "what to do so AI stops breaking things" (10-17, title only); DfHoiOAMrOR deleting data safely, undo button (10-30) **S**; DfR9e6Nozs0 "you don't need your own login system before 1000 users" (11-03) **S**; DfXL4dAscAA alerts not dashboards (11-05) **S**.
Skipped, not security: DfIYjy1I3GS dead code and duplicate logic (10-30); DfK_wV6IDMc microservices at 200 users (10-31); DfNjBEUIPLJ no separate backend (11-01); DfQJALHI-sg no Redis cache (11-02); DfZg3TFsfkI one region (11-06); Dfc8o4psUQR Rust rewrite saved 4 ms (11-07); Dffot2gMl5n uptime nines (11-08); DfiHv5asWhM sharding (11-09); DfmnLM4smm1 testing the few things that hurt (11-11).

**@byarnieverma (about 40 posts seen).** Security series, all studied the same way: DcDla-qRkoR Part 1, 18 checks (08-15) **S**; DcOELo1zGtz Part 2, 19-36 (08-19) **S**; DcbDo37zTvJ Part 4, 55-70 (08-24) **S**; reel 1 = Part 3 (08-22) **S**. Part numbering is by their on-screen titles; there is no reel titled "Part 1" in the caption.
Title only: DeHF3GPTD_s a list of GitHub repos for AI coding (10-05; transcribed, off-topic: names tools such as Spec Kit, Taskmaster, Strix for pen-testing and a security scanner, no detail); Db-v57jT0Uw resource doc (08-13); Dc_I5LdT5AQ privacy settings (09-07).
Skipped, not web security or design: Deb50DaTups reverse-engineering and software cloning news (transcribed, off-topic); DeofmkOTWf and DfMl3yUTw3S writing and thinking; DfhO3P2zfbq app-ownership legal; DdENJZ5zZvm and DeOw03Hz2nc legal and starting a business; Dc3T8W5TppC AI model evals; DdtY5R4zNW4 Claude credits; DdwAxbeTDAm model news; DdG4ZCQzzsZ Hugging Face; DeEiySlzfJ- personal update; DcWCrLMzRlX docs for your codebase; DcLjPcUz-ho Codex trick; DcBccOBTT8P, DcGb60iTKdC, Db8DLihT5_B, DbiV1iCTEhe agent-handling; Ddyx4cYzZtz, DeJteckTCn2, Dd1TGIcTauX, DclZp3wTnAW, DcyNWNfTPWz, DcTfJDfzucQ, Dbxvzb9TeVo, DbYMf1sz6Z2, DeWjQJRzhDt, DfPQx-LTbnW, DfZj40bTGNN opinion, talk and update posts.

**@ui_motion_prompts (78 posts; 12 recent reels, all one-line "N ways" demos, 11-10 and 11-11).** Studied: DfjNoNsDHNZ Menu Part 4 "drawn in pencil" **S**; DfkgCPLAtOH Copy to Clipboard Part 1 **S**; DfikgDPgqpF Dialog Part 1 **S**; DfmigE5Cf0F Password Strength Part 1 **S**; Dfj9uZ4DgfO Tab Bar Part 4 "sliding pill made of glass" (frames only, a liquid-glass look; skipped).
Skipped (component we don't have, or app-only): Date Picker Dfi5DFtjxMM, Pagination DfjiT-fDFdL, Pull to Refresh DflJRt7jfJ_, Number Counter Dfld7zxgt1K, Add to Cart Dflyb-1jF_Q, Swipe to Delete DfmHB27jdD9; DflmKWtMC6U is the code-for-sale promo.

**@setupsai (12 recent reels, each "part N" of a daily series; first two are old pinned viral ones).** Studied: reel 4 (Book of Shapes) **S**; DfXCy7XMscp part 1199 anime.js **S** (an animation library; docs with live sliders); DfmcXkHhv5m part 1205 Runable **S** (an AI site builder, sponsored; sample sites: gradient "Dream Big" whale, black-and-white jet in clouds, purple luxury hair-oil page).
Skipped, not web design: 1197 drawing, 1198 3D home design, 1200 CAD, 1201 image expand, 1202 Arduino, 1203 Pokemon game, 1204 car repair, and the two old pinned reels (slides generator, flight simulator).

## 3. The security lists, merged and de-duplicated

Arnie's four parts number 70 items; many repeat each other (six of them are "a secret is somewhere it should not be"), so they merge to about 35 distinct ideas. minutelet adds
operations items (race conditions, backups, delete safety, alerts) and the AI-agent items. Ids are ours.
Marks: **VS** = VERIFIED-STANDARD (matches OWASP or MDN guidance, link given). **DUBIOUS** = hype or unsupported. Links not re-opened this session.

OWASP Top 10 (2021) map used below: A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures, A09 Logging and Monitoring Failures, A10 SSRF. https://owasp.org/Top10/ . Cheat sheets: https://cheatsheetseries.owasp.org/ .

### A. Secrets and configuration
| Id | Item (source numbers) | Mark | Why / link |
|---|---|---|---|
| A1 | Keep secrets out of code, git history, front-end JS, build logs, public `.env` files, and rotate if leaked (Arnie 1, 2, 3, 11, 13, 14) | VS | OWASP Secrets Management cheat sheet; A05, A02 |
| A2 | No default credentials; no exposed staging/test sites, debug pages or dashboards on production (10, 29, 30, 45) | VS | A05; OWASP Top 10 "Security Misconfiguration" |
| A3 | Send security headers: CSP, HSTS, nosniff, frame protection, referrer policy (46) | VS | MDN CSP https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP ; HSTS https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security ; OWASP Secure Headers Project |
| A4 | Generic errors for visitors, no stack traces; no sensitive data in logs; keep source maps off public hosting (12, 35, 36, 65) | VS (source maps: low severity, DUBIOUS as a top-36 item) | OWASP Error Handling and Logging cheat sheets. A source map shows your code, not secrets; it only matters if the code holds a secret (A1) |
| A5 | Do not set `Access-Control-Allow-Origin: *` with credentials; CORS only for known origins (27) | VS | MDN CORS https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS |
| A6 | Cookies: HttpOnly, Secure, SameSite, narrow Path (47, 68) | VS | MDN Set-Cookie https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie ; OWASP Session Management cheat sheet |

### B. Access control and sign-in
| Id | Item | Mark | Why / link |
|---|---|---|---|
| B1 | Never trust the client: price, discount, user id, "is admin" all re-checked on the server; hiding a button is not a check (minutelet "never trust the client"; Arnie 5, 15, 32) | VS | A01, A04; OWASP Input Validation cheat sheet. The $99-for-$1 story is an illustration, not a cited incident, but the bug class is real |
| B2 | One user cannot read another's data: IDOR/BOLA, tenant isolation, row-level security, least-privilege database accounts (6, 7, 8, 33, 41, 49) | VS | A01; OWASP IDOR Prevention cheat sheet |
| B3 | Admin routes protected on the server (9) | VS | A01 |
| B4 | Sign-in done properly: salted slow password hashing, expiring reset links, sessions that end, limits on wrong guesses, same answer for unknown and known users, strong JWT secret (4, 24, 25, 26, 55-56; minutelet login reel) | VS | A07; OWASP Authentication, Password Storage and Session Management cheat sheets |
| B5 | MFA for admin accounts (55) | VS (as a recommendation; strongest for accounts with weak or reused passwords) | A07; OWASP Authentication cheat sheet |
| B6 | "Rent the lock": use Supabase Auth, Clerk, Firebase or Auth0 instead of writing login (minutelet) | Half VS, half DUBIOUS | "Do not invent crypto or session code" is standard (OWASP). "Free for your first thousands of users" is a vendor-pricing claim, not checked; the vendor adds an account, a cost curve, lock-in and a third party holding logins. Fair for a many-user app; for two editors it is a trade, not a rule |
| B7 | OAuth misconfiguration (54) | VS | A07; OWASP OAuth cheat sheet |

### C. Injection and input
| Id | Item | Mark | Why / link |
|---|---|---|---|
| C1 | Validate and escape input; XSS, SQL and NoSQL injection, command injection, unsafe deserialization (16, 17, 18*, 19, 34, 52, 53) | VS | A03, A08; OWASP XSS Prevention, SQL Injection Prevention, Injection Prevention cheat sheets. *Item 18 is not spoken clearly; the transcript ends "...SQL injection, no SQL injection", read as NoSQL injection |
| C2 | Mass assignment: accept only the fields you expect (51) | VS | OWASP Mass Assignment cheat sheet |
| C3 | CSRF protection (20) | VS | OWASP CSRF Prevention cheat sheet; MDN SameSite |
| C4 | Safe file uploads and path traversal (21, 22) | VS | OWASP File Upload cheat sheet; A01 path traversal |
| C5 | SSRF: never fetch a user-chosen URL (23) | VS | A10; OWASP SSRF Prevention cheat sheet |
| C6 | Open redirects: never redirect to a user-controlled target (69) | VS | OWASP Unvalidated Redirects cheat sheet |
| C7 | Webhooks: verify signature, reject replays (31, 59; minutelet #9 title only) | VS | A08; provider docs (Stripe-style signature + timestamp) |

### D. Abuse and reliability
| Id | Item | Mark | Why / link |
|---|---|---|---|
| D1 | Rate-limit login, sign-up, uploads and any paid or AI endpoint (28; minutelet #4) | VS | OWASP API Security Top 10 "Unrestricted Resource Consumption" https://owasp.org/API-Security/ ; Authentication cheat sheet. His "5 tries a minute" is an example number, not a standard |
| D2 | Race conditions: check-and-write in one atomic step or a row lock (58; minutelet #1) | VS | PostgreSQL row locking https://www.postgresql.org/docs/current/explicit-locking.html ; A04. "Ask your AI to find every one" is DUBIOUS as a method: an AI review is a hint, not proof |
| D3 | Business-logic abuse: think how the feature can be misused (57) | VS, vague | OWASP Business Logic Vulnerability page; no concrete test given |
| D4 | Timeouts on outgoing calls, and security checks that fail closed, not open (63, 64) | VS | OWASP Error Handling cheat sheet ("fail securely"); standard engineering practice |
| D5 | Unsecured GraphQL, WebSocket or real-time endpoints (70) | VS | OWASP GraphQL and WebSocket cheat sheets |

### E. Supply chain and process
| Id | Item | Mark | Why / link |
|---|---|---|---|
| E1 | Update vulnerable dependencies; watch for malicious or unpinned packages and actions (37, 38, 62) | VS | A06, A08; OWASP Vulnerable Dependency Management and npm Security cheat sheets; `npm audit`, Dependabot |
| E2 | Least privilege and no exposed credentials in CI/CD; do not run untrusted GitHub Actions (60, 61) | VS | OWASP CI/CD Security cheat sheet; GitHub Actions security hardening docs |
| E3 | Review AI-written code before it ships (50) | VS | A04, A06 (AI code can include invented or vulnerable packages) |

### F. Working with AI
| Id | Item | Mark | Why / link |
|---|---|---|---|
| F1 | Prompt injection: text the AI reads can carry instructions; "never do X" in the system prompt helps but is not a lock; limit what the AI can do and check every action on the server; sensitive actions wait for a human (39, 40, 65, 66, 67; minutelet prompt-injection reel) | VS | OWASP Top 10 for LLM Applications, LLM01 Prompt Injection and LLM06 Excessive Agency https://genai.owasp.org/llm-top-10/ . His Reddit-comment story matches publicly reported 2025 research on an AI browser (Perplexity Comet) but was not re-checked here |
| F2 | Do not connect an AI to the production database; run a destructive query as a transaction that ends in rollback, with a SELECT before and after (minutelet delete reel) | VS | Standard database practice (transactions, dry-run SELECT). Platform-specific claims (point-in-time recovery on a given vendor's plan) are unverified |

### G. Operations
| Id | Item | Mark | Why / link |
|---|---|---|---|
| G1 | A backup you have never restored is a hope: restore into a test project, time it, and remember uploaded files (44; minutelet #10) | VS | A04; OWASP/NIST contingency practice (backup + restore test) |
| G2 | Audit logs, security monitoring, and alerts that find you (an alert on "site down", "errors jump", "checkout fails") beat dashboards nobody watches (42, 43; minutelet alerts reel) | VS | A09; OWASP Logging cheat sheet. Sentry is his tool of choice (account; free-tier limits unverified) |
| G3 | Encrypt sensitive data in transit and at rest (48) | VS | A02; OWASP Transport Layer Security and Cryptographic Storage cheat sheets |

### H. Hype and framing flags (not security facts)
- "Your app isn't ready for 1000 users" / "Securitymaxxing" / "70 checks": the numbers pad the list (secrets, access control and logging each appear four to six times under different names). Treat it as a prompt to think of categories, not 70 tasks.
- "Comment a word for the resource doc": a lead magnet. Nothing in the reels needs it.
- "Ask your AI to fix it": fine for a first pass; none of the reels says to test the fix.
- Fear tone ("someone just bought your course for $1"): real bug classes, invented stories.
- The "before 1000 users" reels mix security with scaling advice (microservices, Redis, sharding). That is opinion for people building on Supabase/Vercel, not security, and not for a one-server site.

## 4. Applies to GLucak

Checked against `server.js`, `src/lib/auth.js`, `src/lib/signup.js`, `src/lib/store.js`, `src/lib/upload.js`, `src/lib/backup.js`, `src/lib/products.js`, `public/js/`, `.gitignore`, `package.json`, `docs/review/security-2026-11-10.md` and `docs/launch/`. Line numbers are as of the working tree today. Not re-run: the full test suite.
The site is one Node server serving a static Astro build; no database (JSON files in `DATA_DIR`), no checkout (the Buy button goes to the store's own page), no logins for fans, one or two editors on `/edit/`, email sign-ups go to Kit. That removes most of the lists (SQL, tenants, JWT, OAuth, webhooks, GraphQL).

### 4a. Already done
| Item | Where |
|---|---|
| A1 secrets: key only in env; `.env` and `.data` ignored; no `.env` or map file tracked; no key in `public/js`; no source maps in `dist/` | `src/lib/signup.js:148`; `.gitignore`; `git ls-files` check; `find dist -name '*.map'` empty |
| A2 no default credentials; edit screen refuses to start without a 32+ char secret; `DEV_EDITOR` is loopback-only and off in production | `server.js:34-36,145,177` |
| A3 headers: CSP (`script-src 'self'`, `object-src 'none'`, `frame-ancestors`, `form-action`, Spotify and YouTube frames only), nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS when HTTPS | `server.js:45-53` |
| A4 generic 404 and 500, no stack traces, nothing leaked in `Server`; no source maps | `server.js:95-104,275-278`; review "Passed" |
| A5 no CORS headers at all, so browsers keep everything same-origin | grep: no `Access-Control` in `server.js`, `src/lib`, `public/js` |
| A6 cookie `HttpOnly; SameSite=Strict; Path=/edit; Secure` in prod; only the "motion" preference is in `localStorage` | `src/lib/auth.js:37-38`; `public/js/app.js:23-24` |
| B1 never trust the client: prices and all list fields are validated on the server; Buy opens the store's own page | `src/lib/products.js:34-37,90`; `src/lib/store.js:194-216` |
| B3 admin API needs a session on every route (401); the `/edit/` shell page holds no data, is `noindex` and `Disallow`ed | `server.js:182,187,226,309`; `src/pages/robots.txt.ts` |
| B4 sign-in: scrypt with salt, equal-time dummy check for unknown names, same message for wrong name or password, 12-char minimum, HMAC-signed 7-day session with `timingSafeEqual`, new password ends old sessions, limits and lockouts (10 per IP per 15 min, 30 per minute overall, 5 fails lock a name+IP, 50 lock a name) | `src/lib/auth.js:42-52,53,67-73,15-34,76,93-104`; `server.js:212-217` |
| C1/C2 injection and mass assignment: output escaped (`esc`), only whitelisted fields kept, `<script>` and `' OR 1=1 --` tests (hard rule 2), no SQL, no `child_process`, `eval` or `new Function`, JSON only for saves | `src/lib/products.js:96-97`; `src/lib/store.js:174-207`; `server.js:230`; review "Owner hard rule" |
| C3 CSRF: strict Origin on every write, SameSite=Strict, JSON-only content type, `Sec-Fetch-Site` check on API GETs | `src/lib/auth.js:108-112`; `server.js:179,201,230` |
| C4 uploads and traversal: type gate, sharp must decode JPEG/PNG/WebP, 40 MP cap, EXIF dropped, server-chosen name, `wx`, name regex on read; path normalised and checked against `DIST` | `src/lib/upload.js:244-257`; `server.js:244-263,288-297` |
| C5 SSRF: only one fixed outgoing host (`api.kit.com`); form id must be digits | `src/lib/signup.js:149-150` |
| D1 rate limits on login, sign-up (5 per 10 min per IP), uploads, backup downloads | `server.js:189,215,248`; `src/lib/signup.js:121-129,144` |
| D2 races: one server process; version check and write run with no `await` between them; atomic temp-file write with `.prev`; 409 on a stale save | `server.js:237-240`; `src/lib/store.js:218-231` |
| D4 timeouts and fail-closed: 8 s limit on Kit calls; no secret means the edit routes answer 503; page injection fails open only to the plain static page (intended) | `src/lib/signup.js:152`; `server.js:34-36,177,308` |
| E1 dependencies: two only (astro, sharp), lockfile tracked, `npm audit --omit=dev` showed 0 on 2026-11-10; audit and Dependabot planned in the launch checklist | `package.json`; review header; `docs/launch/checklist.md:104` |
| G1 backups: `GET /edit/api/backup` (auth, 10 per hour), `tools/backup.mjs`, restore re-validates every row and re-encodes every photo; restore drill and off-server copy on the launch list | `server.js:186-199`; `src/lib/backup.js:1-3`; `docs/launch/checklist.md:99`; `docs/launch/runbook.md:80` |
| G2 audit log lines: sign-in, saves, uploads, backup downloads, each with a timestamp and the editor's name; uptime monitor planned | `server.js:195,220,241,261`; `docs/launch/runbook.md:108` |
| C6 redirects: the sign-up redirect target is a fixed string (but see S7 for the folder redirect) | `server.js:114` |
| No webhooks, OAuth, JWT, GraphQL or WebSocket endpoints, no password-reset flow, no fan accounts, no tenants, no SQL | whole `server.js` |
| E2/E3 AI and CI items: no CI exists yet; this team's agents treat web content as data, not instructions (role files) | `.claude/agents/researcher.md` |

### 4b. Worth doing (ranked)
| # | What | Why | File | Effort |
|---|---|---|---|---|
| 1 | **Fix S1 (one POST of `null` crashes the server)**, add hostile-body HTTP tests, and wrap `handle()` and the `'end'` callback in try/catch with a process-level `unhandledRejection` log. Patch already written and tested: `docs/review/patches/s1-signup-crash.diff`. Still unapplied (`server.js:119` and `src/lib/signup.js:145` still read `fields` without a guard). This is the "checks fail" and race-style bug the reels describe, and it is the one real launch blocker | availability, A04/D4 | `server.js:119`, `server.js:111-122,267`; `src/lib/signup.js:145`; `test/` | S (apply patch, run tests); Desktop-owned per HANDOFF, main session decides |
| 2 | **New, S7: folder redirect can point at another host.** `GET /a/..//music` returns `301 Location: //music/`, which a browser reads as `https://music/`. Reproduced on a local server today (also `/shows/..//shows`, `/%2e%2e//about`). The target must be a single-word host matching one of our folder names, so it is not usable to send fans to an attacker's site, but it is still an open-redirect shape (C6). Fix: build the Location from the path with leading slashes collapsed, e.g. `'/' + p.replace(/^\/+/, '') + '/'`, and add a test that `//` and `/..//` paths never produce a Location starting `//` | A01/C6, reel item 69 | `server.js:300` (+ a test in `test/server.test.js`) | XS |
| 3 | **Log failed sign-ins and lockouts**, with the IP and the (length-capped, quote-escaped) name. Today only successes are logged (`server.js:220`); a brute-force run would leave no trace. One line each at `server.js:215` (locked) and `server.js:217` (wrong). Check the privacy page covers server logs holding IPs (the host already logs IPs) | G2/A09, reel items 42-43 | `server.js:215-217` | XS |
| 4 | **Dependabot (or a monthly reminder) and `npm ci` on deploy.** Add `.github/dependabot.yml` for npm with weekly checks; build with `npm ci` so only the lockfile versions install. Free on GitHub; no account beyond the existing repo | E1, reel items 37-38, 62 | new `.github/dependabot.yml`; `docs/launch/runbook.md` build command | XS |
| 5 | **Optional headers already noted in S6:** `upgrade-insecure-requests` in the CSP and `Cross-Origin-Opener-Policy: same-origin`. Test that Spotify/YouTube embeds still play and the Instagram in-app browser still opens the site before turning on | A3, reel item 46 | `server.js:45-53` | XS, with an embed check |
| 6 | **`/.well-known/security.txt`** (RFC 9116: Contact and Expires). Costs nothing and tells a researcher where to write. The contact address is the owner's choice (a role address, not Gabe's personal one); needs the owner's yes because it is public | not in the reels; standard https://www.rfc-editor.org/rfc/rfc9116 | new `public/.well-known/security.txt` | XS, owner decides the address |
| 7 | **Smoke test the launch checklist rows the reels reinforce:** TRUST_PROXY (S2, otherwise one shared rate limit), and a stale-save 409 plus a double-click on Save. All are already in `docs/launch/checklist.md`; nothing new to add except to tick them | D1, D2 | `docs/launch/checklist.md` | XS |

Money or accounts: none of the ranked items costs money. Dependabot uses the existing GitHub repo. UptimeRobot (free tier, already planned, account is the owner's) covers the "alerts" reel. Sentry (his tool) and Cloudflare WAF (his rate-limit tool) would need new accounts, add a third party, and Cloudflare's proxy conflicts with our client-IP handling (S2); not recommended now. Paid auth vendors (Clerk, Auth0) are not needed.

### 4c. Not helpful or does not fit
| Item | Why |
|---|---|
| B6 "rent the lock" (Supabase/Clerk/Auth0) | Our sign-in is a trimmed copy of Riverside's proven code, covers every item on his list (hashing, limits, sessions), and serves one or two people. A vendor adds an account, a cost curve and a third party holding Gabe's login |
| B5 MFA for `/edit/` | Real value only if a password is weak or reused. Ours needs 12+ characters, has lockouts and Origin checks, and the owner generates it. A TOTP flow is a day of new code (a second secret to store, recovery codes) for two users. Revisit if more editors are added or the shop opens with real money behind `/edit/` |
| B2, C1 (SQL parts), C7, D5, B7, 41, 49, 54, 59, 70 | No database, tenants, OAuth, webhooks, GraphQL or WebSockets |
| Prompt-injection and AI-permission items (F1) | The site has no AI feature. They apply to how the team's agents read web pages (already treated as data, role file) |
| G3 encrypting our data | We store no fan emails (Kit does) and only public data (shows, products, photos); HTTPS comes from the host |
| E2 CI/CD hardening | No CI yet. If GitHub Actions is added for the daily rebuild, pin actions by commit and grant only `contents: read` |
| Race conditions at scale (minutelet #1) | Single process, no await between check and write; breaks only if a second instance is run, already a launch rule (checklist item 7) |
| Explicit server timeouts | Node 22's defaults (headers 60 s, request 300 s) already cut slow connections; no change needed |
| Dashboards, charts, Datadog, Redis, microservices, sharding, Rust | Not security; wrong size for this site |
| Session revocation (S4) and name-only lockout (S5) | Accepted in the existing review; unchanged |

## 5. Design reels

Hard rules (CONTEXT.md): rule 1, nothing flashes more than 3 per second; all motion off under `prefers-reduced-motion` and the site's own motion switch. `DESIGN.md`: no shadows, no cards but the release card, exactly two motions on Home. Same method as `docs/research/ig-design-tips.md` section 4.
Overlap: the Laptop plan (`docs/review/laptop-plan-2026-11-11.md`, item 6) already has "Menu sheet just appears: open it from the Menu button" and `ig-design-tips.md` 4b #5 says the same. These reels only add pictures of that idea.

### 5a. What the design reels show
- **Menu Part 3 and Part 4 (@ui_motion_prompts).** Part 4 variants [screen]: Push Back (page tilts back as the menu comes), Kebab Popover, Gooey Menu (circles that blob out of the button), Fold Down, Button to Panel (the button grows into the panel), Command Palette (search box with arrow keys). Every one starts at the trigger and returns to it. Part 3 adds a spring pop, a card flip, dealing, a 3D drum, a traced outline and tile wave. The grey Part 4 style is a clean pencil-line look; Part 3 is dark with violet/mint glow.
- **Copy to Clipboard Part 1:** Select Sweep, Ghost Fly, Flip Board, Pill Stretch, Char Wave, Outline Echo (mint flash plus two outlines rippling out).
- **Dialog Part 1:** Scale Pop (from 72% with a soft overshoot), Spring Drop, Hinge Swing (3D), Line Unfold (a glowing line opens wide), Soft Focus (blur behind), Wobble In (jelly).
- **Password Strength Part 1:** Flow Fill, Block Drop, Spark Feed, Chain Light (segments flash in turn), Flap Label, Liquid Link.
- **Book of Shapes (@setupsai):** generated static SVG patterns, see reel 4.
- **anime.js (@setupsai 1199):** a JavaScript animation library with copy-paste examples. **Runable (1205):** a sponsored AI site builder; its samples are gradient and 3D "dream" pages.

### 5b. Done already
| Idea | Where |
|---|---|
| Start from the trigger, short ease-out | the page view transition and heading fade are already 0.2 s ease-out under the motion gate (`ig-design-tips.md` 4a); the Menu sheet itself is not yet animated (`global.css:1137` hides it with `display: none` while closed) |
| Static, flash-free states for form feedback | sign-up Sending state is text only (security review) |
| Halftone, grain, contour and print textures for backgrounds | `docs/research/art-system.md`, `photo-art-direction.md` (owner approved) |

### 5c. Helpful (ranked)
1. **Menu opens from the Menu button, not from nowhere.** Button to Panel or Anchor Pop are the two closest: the sheet scales from about 0.95 and fades from the button's corner, 150-250 ms ease-out in, about 20% faster out. Needs a way to animate a `<details>` panel (closed state is `display: none`, `global.css:1137`; `@starting-style` or `transition-behavior: allow-discrete`). Behind both gates (`prefers-reduced-motion: no-preference` and `html[data-motion='on']`). Same task as Laptop plan item 6. Files `src/styles/global.css` (~180-200, 1137), `src/components/Header.astro`.
2. **Book of Shapes patterns as static artwork.** Contour (Concentric Noise Rings), Hiding Squares (halftone-like), grid and radial patterns match the "contour lines, halftone, blueprint grid" backgrounds already chosen in `art-system.md`. Could make flat one-colour section textures or a poster-style flyer for IDENTITY. Use only as a static SVG or PNG exported at build time; never the animated version; one colour, one accent, contrast checked with `src/lib/contrast.js`. Licence allows commercial use, no attribution (credit welcome "Pattern from bookofshapes.com"); avoid the three recreations of existing art and the "pattern inside a template or app" use. The designer owns the call. Effort S (export, optimise, check weight).
3. **Poster-sheet framing** from Book of Shapes "Make a poster" (huge caps title over a pattern with small mono-free caption) fits the heavy-border poster look; a possible Shows or IDENTITY flyer. Optional.

### 5d. Not helpful / does not fit
- **Outline Echo, Outline Trace, Chain Light, Spark Feed, Line Unfold, glowing mint/violet edges, ripples, Wobble/jelly, Char Wave:** glow, ripple or sequenced flashes. Rule 1 and `ig-design-tips.md` section 5 say no pulse, glow or sparkle animation. Chain Light and Spark Feed flash in turn; never build them.
- **Gooey, Drum Roll, Hinge Swing, Card Deal, Turn Over, Tile Build:** 3D or blob motion; a third motion on a page that has a two-motion limit, and extra work for five links.
- **Command Palette:** a five-page site does not need search.
- **Password strength meter:** the admin password is generated with `tools/hash-password.mjs` (12+ characters enforced in `auth.js:76`); a meter would only train a weaker habit. Guidance (NIST 800-63B) favours length and a blocklist over meters.
- **Dialog styles:** the editor uses the browser's `confirm()` for deletes (`public/js/edit.js:116,226`), which is accessible and works on every phone; no custom dialog is needed for Gabe.
- **Copy to Clipboard:** the site has no copy button.
- **Tab Bar "sliding pill made of glass":** liquid glass is on the trends-cliche list (`ig-design-tips.md` 4d).
- **anime.js:** extra script weight for motion the CSS and View Transitions already cover; a JS animation library is the wrong tool under strict motion rules.
- **Runable and its samples:** paid AI page builder, sponsored; the samples are the gradient/dream look this team already flagged as AI slop.

## 6. Unreachable or not done
- Instagram would not return a creator's profile or reel list to `yt-dlp` without a login ("Unable to extract data"). Reels fetched one by one by URL worked, so every caption, date and video came from there; the lists came from the public profile pages in Chrome. Older reels beyond the first scroll of each profile were not enumerated for @setupsai and @ui_motion_prompts.
- Comment counts and comments were not read; the "comment a word" PDFs and Arnie's and @ui_motion_prompts' paid or free resource docs were not requested (that would be commenting or DMing).
- minutelet #3, #6, #7, #8, #9, #11 and DemJpnv, and Arnie's DeHF3 repo list beyond names, were not studied in depth.
- Platform claims (Supabase backup plans, Clerk/Auth0/Sentry free tiers) were not checked against vendor docs.
