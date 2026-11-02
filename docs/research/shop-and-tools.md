# Shop, email list and shows: tools research (coder's view)

Researcher: tools (coder's view of cost-to-build and cost-to-keep-working). Date checked: **2026-11-02**.
Phase: research only. Nothing built, no accounts created, no sign-ups. Prices are the vendors' published list prices, shown as each tool's own cost.

## How to read the numbers

- Every price below was read from the vendor's own page on 2026-11-02 unless marked **unverified**. Unverified means it came from a third party, a search summary, or a page that did not render the number.
- Method note: pages were read through a fetch tool that summarises text. For Shopify, Kit, Buttondown and Mailchimp I also pulled the raw page HTML and checked the key numbers there. The Kit, Buttondown and Mailchimp price calculators are JavaScript sliders, so the exact figure at one list size is sometimes not in the page text (flagged where so).
- "Computed by me" means I did the arithmetic from the published rates. Check any such figure against a real test order before relying on it.
- Sales tax: where I say a vendor collects or does not collect tax, that is the vendor's own statement about its product. Whether Gabe must collect or remit US sales tax, and in which states, is **not settled here** and is not legal or tax advice. The owner or a tax professional should decide.
- Hosting and the domain are outside this file. Costs below are only the tools.

---

## 1. Shop (hosted checkout only; we never touch card data)

Shop launches later and is set up in the background, so "cost while switched off" is a key column.

### Comparison table

| Tool | Pricing URL (checked 2026-11-02) | Monthly cost | Cost while shop is switched off | Per-sale fee | Who ships CDs / vinyl | Sales tax (vendor's statement) |
|---|---|---|---|---|---|---|
| **Fourthwall, Free plan** | https://www.fourthwall.com/pricing | $0 ("Free forever"). Pro is $15/mo (annual saves $48), not needed. | $0 | Own products: 0% platform fee. Catalog (print-on-demand) items: a flat catalog cost is deducted from the price you set (page example: $10 cost shirt sold at $22 leaves $12). Card processing 2.9% + 30c (US cards). | Gabe, at home ("I'm shipping orders myself" is the default for own products, per Fourthwall help). Fourthwall's own warehouse service exists but is invite-only and part of Pro (help page, search snippet, unverified in detail). Shirts and mugs from the catalog: Fourthwall partners make and ship (page: most 7-10 days). CDs/vinyl are not on the pricing page; the warehouse guide lists CDs and vinyl as storable items. | Fourthwall states it is merchant of record, calculates, collects and remits sales tax, and withholds it from payouts (help.fourthwall.com creator tax FAQ and legal FAQ, via search summary; **unverified in full**). Its terms deduct a tax-handling cost from payouts; the amount was not found. |
| **Bandcamp merch** | https://get.bandcamp.help/hc/en-us/articles/23020665520663-What-are-Bandcamp-s-fees | No monthly fee found on the fees page (I did not find a statement either way; **unverified**). | $0 (same caveat) | 10% of the item price on physical items (shipping and tax excluded) plus payment processor fees. Processor fees from Bandcamp's digital-sales help page: 2.2% + $0.30 on credit cards for orders of $8.07 or more; 1.9% + $0.30 PayPal. Another Bandcamp page says processor fees "typically range between 4 and 6%". Bandcamp says the physical-sales processor fees match the digital ones for accounts on its newer payments setup. Two numbers disagree; test with one real sale. | Gabe (Bandcamp's merch model is seller-ships; I did not find a page stating it, so **unverified**). | Bandcamp says it calculates, collects and remits sales tax for a listed set of countries and US states and adds it at checkout; outside that list the seller handles it. I did not read the state list (**unverified**). |
| **Stripe Payment Links** | https://stripe.com/pricing | $0 ("No setup fees, monthly fees, or hidden fees"). Optional: custom domain on the link $10/mo. | $0 (a link just sits unused; deactivation steps not read) | 2.9% + 30c per successful US card payment. +1.5% international cards, +1% currency conversion. Optional Stripe Tax: 0.5% per transaction where registered. | Gabe, or whoever we arrange. Stripe only takes payment; it has no shipping or fulfilment service. Payment Links can collect a shipping address and charge shipping rates (docs.stripe.com/payment-links). | Stripe Tax calculates only where Gabe has an active registration; with no registration it returns zero tax (docs.stripe.com/tax/set-up, via search summary; the page is old, **unverified for today**). Registering is Gabe's job. |
| **Shopify** | https://www.shopify.com/pricing | Cheapest plan on the current page: Basic $39/mo, or $29/mo billed yearly. Card rate 2.9% + 30c. Trial: 3 days free, then $1/mo for 3 months. | Plan cost continues. A cheaper "Pause and Build" plan is reported by third-party blogs at $9/mo (**unverified**); it is not on the pricing page or the help page I could read. | 2.9% + 30c on Basic (page). | Gabe, or a Shopify app / third party. | Not read (**unverified**). |
| **Shopify Starter** | not on https://www.shopify.com/pricing | The word "Starter" does not appear on the current pricing page. A third-party search summary says $5/mo and 5% + 30c (**unverified**, may be discontinued or renamed). | unknown | unknown | unknown | unknown |

Other tools considered: print-on-demand is already covered by Fourthwall (catalog items are printed and shipped by their partners). I did not add Printful or Printify; each needs its own storefront on top, which is more to build and keep working. No other tool clearly fits.

### Worked per-sale costs (computed by me)

Assumptions: US card, item price only. Real totals will also include shipping and tax, and card fees are charged on the whole amount, so the true fee is a little higher. Shipping and tax are ignored here.

**Stripe Payment Links and Fourthwall own-product (same 2.9% + $0.30):**

| Item | Arithmetic | Fee | Left after fee |
|---|---|---|---|
| $25 shirt | 0.029 x 25 = 0.725; + 0.30 = 1.025 | about $1.03 | about $23.97 |
| $12 CD | 0.029 x 12 = 0.348; + 0.30 = 0.648 | about $0.65 | about $11.35 |

Stripe Tax add-on (only where Gabe is registered): 0.5% x $25 = $0.125, about $0.13 more on the shirt; 0.5% x $12 = $0.06 on the CD.

**Fourthwall catalog shirt at $25:** the catalog cost is set per product by Fourthwall and I did not look up a real shirt's cost. Using the pricing page's own example cost of $10 (an assumption, not a real quote): 25 - 10 = 15, minus the card fee $1.03 (arithmetic above) = about $13.97 left. Replace the $10 with the real catalog cost for the chosen shirt.

**Bandcamp merch, using the 2.2% + $0.30 credit-card rate:**

| Item | Bandcamp 10% | Processor fee | Total fees | Left after fees |
|---|---|---|---|---|
| $25 shirt | 0.10 x 25 = 2.50 | 0.022 x 25 = 0.55; + 0.30 = 0.85 | 3.35 | $21.65 |
| $12 CD | 0.10 x 12 = 1.20 | 0.022 x 12 = 0.264; + 0.30 = 0.564 | about 1.76 | about $10.24 |

If the "4 to 6%" statement is the true processor rate instead, the CD fee rises (for example 5%: 0.05 x 12 = 0.60, so total 1.80). Treat these as a range until one test sale is seen.

**Shopify Basic:** same per-sale fee as Stripe (2.9% + $0.30), plus the monthly plan cost whether or not anything sells.

### Entries

**Fourthwall (Free plan)**
- Tool and URL: Fourthwall, https://www.fourthwall.com/pricing, checked 2026-11-02.
- Monthly cost: $0 on Free.
- Per-sale cost: 0% platform fee on own products; flat catalog cost on print-on-demand items; 2.9% + 30c card processing. Digital products 5% on Free (not planned). Memberships 5% (not planned).
- Limits: Free has 2 team members and no free .store domain. Free covers designing and selling catalog items, a customisable shop, promo codes.
- Gabe's effort: low for day-to-day orders on catalog items (nothing to pack). For CDs or vinyl he packs and ships, and uploads tracking.
- Lock-in: low to medium. Product listings, art and customer relationships live in Fourthwall. I did not check what can be exported. Our site only holds a link, so switching later means changing one link.
- Build and upkeep for us: link out to the hosted shop, or use their custom domain / subdomain option (page mentions connecting your own domain; how it works was not read). No card data on our side. Very little code.
- Verdict: **pick, on one condition**. The only candidate with a $0 idle cost, no inventory for shirts, and a stated 0% platform fee on own products. **Condition:** Gabe asked for physical media specifically, and no Fourthwall page confirmed that self-shipped CDs and vinyl are allowed as own products. Confirm this with Fourthwall before committing; if they are not allowed, Bandcamp becomes the pick. Tax handling is the vendor's stated job, which keeps the owner's open question smaller (still to be confirmed by the owner).

**Bandcamp merch**
- Tool and URL: Bandcamp, https://get.bandcamp.help/hc/en-us/articles/23020665520663-What-are-Bandcamp-s-fees, checked 2026-11-02.
- Monthly cost: no monthly fee found (unverified).
- Per-sale cost: 10% plus processor fees (see table above).
- Limits: sellers of physical merch may need to give identity and contact details under the INFORM Consumers Act; merch sales can be disabled if not (Bandcamp help, search summary). Tax forms are issued for sellers earning over $5,000 a year (same source).
- Gabe's effort: low if he already has a Bandcamp page and fans there; he ships everything himself.
- Lock-in: low to medium. Fans and sales history live on Bandcamp.
- Verdict: **runner-up**, and the better choice if Gabe already sells on Bandcamp (CONTEXT.md question 5). Costs more per sale than Fourthwall on self-shipped CDs (10% extra) but it is where music buyers already are and it also carries digital sales.

**Stripe Payment Links**
- Tool and URL: Stripe, https://stripe.com/pricing, checked 2026-11-02.
- Monthly cost: $0.
- Per-sale cost: 2.9% + 30c (US cards).
- Limits: no inventory tracking beyond a purchase cap per link (docs say links can limit the number of purchases); no shipping or fulfilment; Gabe is on his own for tax registration.
- Gabe's effort: medium to high (packing, tracking, answering buyers, and tax set-up).
- Lock-in: low.
- Verdict: not picked. Lowest fee but the most left for Gabe and for us (one link per product, shipping rates, tax). Reasonable fallback for a tiny CD-only drop.

**Shopify (Basic)**
- Tool and URL: Shopify, https://www.shopify.com/pricing, checked 2026-11-02.
- Monthly cost: $39 monthly or $29/mo billed yearly. "Starter" and "Pause and Build" were not on the page.
- Per-sale cost: 2.9% + 30c.
- Gabe's effort: medium. Lock-in: medium.
- Verdict: not picked. A monthly cost while the shop is still switched off, for features a small catalogue does not need.

### Shop: pick, runner-up, questions for Gabe

- **Pick: Fourthwall Free.** **Runner-up: Bandcamp merch.**
- Questions for Gabe (the owner relays these):
  1. Does he already sell on Bandcamp or another store? (If yes, Bandcamp becomes the first choice.)
  2. What will he sell: shirts and hoodies only, or CDs and vinyl too? Roughly how many of each?
  3. Is he willing to pack and post CDs himself, and from what address does he ship? (A return address is shown on parcels.)
  4. Does he want print-on-demand shirts (no stock, a catalogue cost per item) or to order stock himself?
  5. Which countries should the shop ship to?
- Questions for the owner: who confirms US sales-tax duties for Gabe (vendor statements above are not a legal conclusion)? Fourthwall's idle $0 plan and the Fourthwall tax handling should be re-read on the day an account is opened, since the vendor can change them.

---

## 2. Email list (sign-up on every page; fans get show and release news)

### Comparison table

| Tool | Pricing URL (checked 2026-11-02) | Free cap | Monthly cost at 500 subscribers | Monthly cost at 2,000 subscribers | Export | Footer address |
|---|---|---|---|---|---|---|
| **Kit** | https://www.kit.com/pricing | Free plan: up to 10,000 subscribers, unlimited forms, landing pages and email broadcasts (help.kit.com/en/articles/16627071-the-kit-free-plan). Automations and sequences are paid-only. Whether free emails carry Kit branding: the free-plan page does not say; the pricing page lists "Remove Kit branding" as a Creator-plan feature, so assume branding stays on Free. | $0 | $0 | Yes: Subscribers page > select all > Export, CSV (help.kit.com/en/articles/2502489-how-to-export-subscribers-in-kit). Not stated as restricted on Free. | Required in every email; set under Settings > Email. Kit offers its own address for free for use in Kit emails, with conditions (see below). |
| **Buttondown** | https://buttondown.com/pricing | Free for the first 100 subscribers. | $9 (Basic, up to 1,000), read from the page's structured data; the on-page slider did not render in the text I fetched. | $29 (Standard, up to 5,000), same source. | Yes: dashboard Subscribers tab > Export, CSV (docs.buttondown.com/data-exports-subscriber). | Buttondown's own blog says its counsel advised an address is not required for its newsletters but recommends one, and publishes an "official newsletter address" you may use (cost not stated). |
| **Mailchimp** | https://mailchimp.com/pricing/marketing/ | Free: 250 contacts, 500 sends a month, 250 a day, 1 audience, 1 seat. Over 250 contacts, sending is blocked until upgrade or trim (mailchimp.com/help/about-mailchimp-pricing-plans/). | Essentials $13/mo; Standard $20/mo, as shown on the page, which labels these "for 12 months" (an introductory discount, so the later price is **unverified**). | Not rendered on the page; the tier containing 2,000 contacts is 1,501-2,500. A third-party summary quotes Essentials $45 and Standard $60 at 2,500 contacts (**unverified**). | Yes: Audience > Export audience, CSV or ZIP of CSVs, owners and admins only, kept 30 days (mailchimp.com/help/view-export-contacts/, search summary). | Required in every email. Mailchimp's help says to use a P.O. box if you do not want to share a home address (search summary of mailchimp.com/help/about-campaign-footers/). |

The legal point, for any list size: the US CAN-SPAM guide from the FTC states "Your message must include your valid physical postal address." It lists three acceptable kinds: a current street address, a post office box registered with the USPS, or a private mailbox registered with a commercial mail receiving agency (ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business, read 2026-11-02). Whether a given newsletter is covered is a legal question; this file does not decide it. Buttondown's blog states its own counsel's view for its own service only.

### Whose address goes in the footer

This is a privacy point that applies to any solo artist, not a statement about Gabe. Options, all from Kit's help page (help.kit.com/en/articles/2502494-alternatives-for-your-physical-address, read 2026-11-02):
- Kit's own address, free, but only for emails sent through Kit, and mail sent there is not forwarded. It is Kit's address, so Gabe's mail is not reachable there. Whether that satisfies CAN-SPAM for Gabe's emails is a legal question for the owner, not settled here.
- A P.O. box (the article says generally about $100 a year; unverified current price for any one post office).
- A UPS Store street-style address with a suite number (price varies).
- A co-working space or a friend's business address, with their agreement.

### Entries

**Kit (Free)**
- Tool and URL: Kit, https://www.kit.com/pricing, checked 2026-11-02.
- Monthly cost: $0 at 500 and at 2,000 subscribers. Paid Creator, if ever wanted: $33/mo billed yearly ($390 a year) for 1,000 subscribers; I computed a monthly-billing figure of $39 from the page's "save $78 per year" line (390 + 78 = 468, divided by 12 = 39). Higher list sizes not read.
- Per-send cost: none; page says no sending limits.
- Limits: no automations or sequences on Free (so no automatic welcome email series; a single confirmation email still has to work, which I did not test). Support within 24 hours.
- Gabe's effort: low. Sends a broadcast from a web page.
- Lock-in: low. CSV export of all subscribers.
- Build and upkeep for us: simplest path is Kit's hosted form link or embed. If we post our own form to Kit's API instead, that needs a server-side key and our injection tests; I have not read the API terms. Needs an allowed script/iframe in our CSP if embedded.
- Verdict: **pick**. Free at both list sizes, a free cap far above what the launch will reach, export, and a free address option.

**Buttondown**
- Tool and URL: Buttondown, https://buttondown.com/pricing, checked 2026-11-02.
- Monthly cost: $0 up to 100 subscribers, $9 at 500, $29 at 2,000 (structured data on the page; confirm on the slider).
- Limits: priced on active subscribers; assumes at most one email a day to the whole list. Tagging, segmentation and automations are paid add-ons ($9 and $29/mo respectively on the page). Whitelabeling +$79/mo (not needed).
- Gabe's effort: low; plain writing editor.
- Lock-in: low. CSV export.
- Verdict: **runner-up**. Cleaner and simpler than Mailchimp, but it costs money once the list passes 100.

**Mailchimp**
- Tool and URL: Mailchimp, https://mailchimp.com/pricing/marketing/, checked 2026-11-02.
- Monthly cost: free to 250 contacts only, then $13 or $20 at 500 (promo-labelled).
- Gabe's effort: medium. Lots of features he will not use. Lock-in: low (export works).
- Verdict: not picked. The free cap of 250 is the smallest here, and the price at 2,000 could not be read from the page.

### Email: pick, runner-up, questions for Gabe

- **Pick: Kit Free.** **Runner-up: Buttondown.**
- Questions for Gabe:
  1. Does he already have a mailing list (CONTEXT.md question 6)? If so, where, and how many people?
  2. Which postal address is he happy to have printed at the bottom of every email: a P.O. box or UPS Store box he would rent, or the free Kit-provided address (subject to the owner's confirmation)?
  3. Is it fine if the emails show a small Kit credit line on the free plan?
  4. What does he want to send: show announcements, new releases, both? How often (once a week, once a month)?
  5. Does he want a welcome gift for signing up (Manafest's "free thing" idea in references.md)?

---

## 3. Shows (dated list; past shows hide themselves; Gabe edits; open mics)

### What I compared

- **Our own dated list**: shows kept in the site's own data, edited by Gabe in the small edit screen planned in CONTEXT.md, past shows dropping off by date, `Event` structured data for Google.
- **Bandsintown for Artists**: a free listing service with followers, which can also feed an events widget or API on a site.
- No other tool is proposed. Songkick and similar were not researched in depth; none was named in the brief, and they add another place to enter shows.

### Comparison table

| | Own dated list | Bandsintown for Artists |
|---|---|---|
| Pricing URL (checked 2026-11-02) | n/a | https://help.artists.bandsintown.com/en/articles/7039361-does-bandsintown-for-artists-cost-money-to-use |
| Monthly cost | $0 tool cost | $0. Page: "Bandsintown for Artists is free for everyone to use." The artist terms say some functions may be paid (not itemised here). |
| Per-sale cost | none | none (tickets are the venue's or promoter's) |
| Can Gabe edit it? | Yes, through our edit screen. This is the build work for the coder (Riverside's admin patterns are the starting point). Edits show on the next build or refresh, depending on how it is built. | Yes. Add Event in the Bandsintown dashboard (single page or multi-step form), edit single events or many at once, drafts and scheduled publishing, bulk upload by spreadsheet template (help.artists.bandsintown.com/en/articles/7039442-add-an-event and 7170758-edit-events). |
| Does it show on our site by itself? | Yes, it is our data. | Only if we add a widget or call their API. Widget: their support pages say it works on any site that allows HTML and updates when shows change in the dashboard (search snippets of artists.bandsintown.com/support, **unverified**; the widget install page returned a 404 for me). API: a key is available in the artist's settings; the help page says it is for artists showing their own shows on their own website, and "The data is not meant to be used in any other circumstances unless specifically approved by Bandsintown." (help.artists.bandsintown.com/en/articles/7053475-what-is-the-bandsintown-api). |
| Open mics? | Yes. Any row Gabe types. We can show them as a separate "open mic" tag. | **Not documented.** The help pages I read do not mention open mics. They do say an event needs a venue with a known location (a custom location can be typed in) or it is not considered for recommendations. Whether open-mic spots are accepted is **unverified**; Bandsintown support (artistsupport@bandsintown.com) is the place to ask. |
| What it adds that our list lacks | nothing external | Followers get a notification when a show is added (switchable off), and shows are discoverable in their app. That reach is the real advantage. |
| Lock-in | none | Shows live on Bandsintown, but they can be re-entered; low. |
| Build and upkeep for us | Edit screen, tests, `Event` data. A few hours of work; it has to exist anyway for Gabe's other small edits. | If we use the widget: a third-party script and iframe to allow in the CSP, and its look is theirs. If we use the API: a key to keep, a fetch, and a plan for when it is down. More moving parts than our own list. |

### Does sync beat our own dated list?

Not for the website. Our list does the three things the site needs (Gabe can edit, past shows drop off by date, open mics fit). Bandsintown sync would make the site depend on an outside service for its most important page after Music, and the open-mic case is undocumented. Where Bandsintown does help is reach: fans following Gabe in their app. That is a separate benefit, not a replacement for the list.

### Entries

**Own dated list**
- Monthly cost: $0. Per-sale: none. Limits: none. Gabe's effort: low, if the edit screen is built well (date, venue, city, ticket link, "open mic" tick). Lock-in: none. Verdict: **pick**.

**Bandsintown for Artists**
- Monthly cost: $0. Limits: venue must be a known location. Gabe's effort: medium if entered in addition to our list (two places to type); low if the site pulls from it. Lock-in: low. Verdict: **runner-up** as an optional extra. Two sensible uses: (a) Gabe enters bigger full shows there too to reach followers, or (b) later, our site pulls from the API. Do not build (b) until Bandsintown confirms open-mic handling and terms for his own site.

### Shows: pick, runner-up, questions for Gabe

- **Pick: our own dated list.** **Runner-up: Bandsintown for Artists (optional second listing).**
- Questions for Gabe:
  1. Does he already have a Bandsintown page, and do fans follow it? How many?
  2. How many shows a month, and how many of those are open mics versus full shows?
  3. Does he want open mics shown on the site at all, or only full shows (open mics change at short notice)?
  4. Who books the shows, and who can tell him the venue address and ticket link when he adds a show?
  5. If he adds a show in one place, is he willing to type it a second time in another?

---

## Things I could not confirm (all marked above)

- Shopify Starter and Pause and Build plan prices: not on the current pricing page; third-party numbers only.
- Bandcamp: monthly fee statement, physical processor fee (two Bandcamp pages disagree), who ships, the list of states where it collects tax.
- Fourthwall: tax-handling deduction amount, data export, exact custom-domain steps, whether CDs/vinyl are formally allowed (no policy page found).
- Stripe Tax page is old; deactivation steps for a link not read.
- Mailchimp price at 2,000 contacts and the price after its 12-month introductory discount.
- Buttondown 500 and 2,000 figures read from the page's structured data, not the on-page slider.
- Kit branding on the free plan; Kit's welcome/confirmation email behaviour on Free.
- Bandsintown: open-mic handling; widget details (page returned 404).

## Not covered (outside the brief)

Own cart, own ticketing, fan-club platforms. Not researched.
