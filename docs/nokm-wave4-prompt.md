# NOkM — Wave 4 Build Prompt: "Make It Live"

Paste everything below the first horizontal rule into a fresh Claude Code
session opened in this repository.

Wave 4 turns the platform from a well-built record into a **living, shareable,
national movement product**: leadership identity and faces, official contact
and social presence, declared national coverage, a penetration-and-gap map down
to polling unit, an aspirants directory for all five 2027 races, and a support
(cash and in-kind) pipeline.

Part 2 of this document (below the prompt) answers the National Coordinator's
questions on **scale, database and domain name**, and is not part of the prompt.

---

## MISSION

The NOkM platform is correct but quiet. Wave 4 makes it **alive, personal and
spreadable** — without breaking a single one of the honesty rules that make it
trustworthy.

Three outcomes:

1. **Faces and identity.** The movement is people. Show them — National,
   Diaspora, Zonal, State and LGA — with photographs, and put the National
   Coordinator and the official channels of contact where nobody can miss them.
2. **The map of the gap.** NOkM declares presence in 124,258 polling units.
   Nigeria has 176,379. Make the missing **52,121** the most visible number on
   the site, drillable from nation to zone to state to LGA to ward to unit, so
   every officer can see exactly where their own hole is.
3. **Reach.** Make it trivially shareable on WhatsApp, cheap on data, usable on
   a ₦25,000 Android phone on 2G, and give people something to *do* the minute
   they arrive: register, adopt a polling unit, refer ten, or support in cash
   or in kind.

Work item by item. Commit at the end of each lettered section. Do not stop for
approval between sections — but **do stop at any BLOCKER marked below**, and
list every blocker you hit in your final summary.

---

## READ FIRST

Before writing code, read:

- `README.md` — especially **Data protection** and **Principles**
- `docs/nokm-framework.md` — canonical offices, duties, KPIs
- `docs/TODO-real-data.md` — exactly what is real and what is not
- `src/lib/site.ts`, `src/lib/structure.ts`, `src/lib/geo.ts`,
  `src/lib/baseline.ts`
- `data/nokm-structure.json`

The rule that governs this entire wave, from `README.md`:

> **Never invent a number.** Every count in the UI comes from the roster file or
> the database. An empty state that reads "no members registered yet" is
> correct; a plausible-looking figure is not.

Wave 4 introduces numbers that leadership has **declared** but that the roster
cannot yet prove. That does not mean lowering the standard. It means adding a
second, clearly-labelled category. See section C — get that model right before
building anything that depends on it.

---

## INPUTS REQUIRED FROM LEADERSHIP

Several items below cannot be completed with invented content. Build the
component, ship it behind an honest empty state, and record the gap in
`docs/TODO-real-data.md`. **Never fill one of these with a guess.**

| Input | Needed for | If missing |
|---|---|---|
| Official social handles — exact URLs for Instagram, Facebook, X, Telegram, LinkedIn, YouTube, TikTok | Section B | **Omit the icon entirely.** A guessed handle can point at a stranger's or an impersonator's account. Never construct a social URL from the movement's name. |
| National Coordinator's WhatsApp number, in full international format, **with the Coordinator's explicit consent to publish it** | Section B | Show the email only. |
| Officer photographs + a signed likeness/consent note per officer | Section D | Initials avatar fallback. |
| Names behind the declared counts — the 28 national executives, 3 diaspora coordinators, 26 state coordinators | Section C | Show declared vs named side by side, with the delta stated plainly. |
| Aspirant list per race, with each aspirant's consent to be listed | Section G | Ship the directory empty with a submission route. **Do not seed it with real Nigerian politicians' names scraped from anywhere.** |
| Paystack/Flutterwave business account, in the movement's registered name, with the National Treasurer named as signatory | Section H | Show the in-kind pledge form only, and a "cash support opens shortly" state. |
| Legal sign-off on the support/donations copy | Section H | Do not ship the cash path. |

---

## NON-NEGOTIABLE CONSTRAINTS

All existing constraints from `docs/nokm-build-prompt.md` still apply. These are
added or amended for Wave 4:

1. **Static export stays, for now.** `output: "export"`. No route handlers, no
   server actions, no middleware. Everything dynamic is client-side against
   Supabase, or a hosted third-party page (payments). Every dynamic route needs
   `generateStaticParams()`. If a feature genuinely cannot be built this way,
   say so in your summary rather than quietly switching the build target —
   moving off static export is a decision for the maintainer (see Part 2 §3).
2. **Officer phone numbers still never enter the repository** — with exactly
   one recorded exception: the movement's **published official contact line**,
   which is a public-facing channel and not a personal directory entry. Put it
   in `src/lib/site.ts` under `officialContact`, amend the rule in `README.md`
   to name the exception, and never add a second number to that file.
3. **Photographs are personal data.** An officer photo requires that officer's
   consent. Store photos in Supabase Storage, not in `public/`. Provide a
   takedown path. Never display a photo of a member — only officers,
   aspirants and public figures who have consented to a public listing.
4. **Declared ≠ verified.** Any figure supplied by leadership but not backed by
   named roster records renders with a "Declared" marker, a source and an
   as-of date. Never merge a declared figure into a verified one to make a
   bigger headline.
5. **No endorsement is published unless it has been formally ratified.** The
   aspirants directory lists people who are contesting. It does not say NOkM
   backs them, unless there is a ratified endorsement record with a date.
6. **Payments never touch this application.** No card fields, no bank details,
   no BVN, ever. Hosted checkout on the processor's own domain, or a published
   account for direct transfer. The app records intent, never credentials.
7. **Data-light is a feature, not a nicety.** Members are on metered data. Any
   map, photo grid or share-image feature must degrade gracefully and must not
   push a route past ~200 kB of first-load JS. Photos are served in modern
   formats at display size, lazily, with a low-quality placeholder.
8. **Still no analytics, no Meta pixel, no Google Analytics.** Growth is
   measured through the movement's own referral and registration counts.

---

## A. LEADERSHIP IDENTITY AND CREDITS

**A1.** Add to `src/lib/site.ts`:

- The National Coordinator as a first-class part of the movement's identity —
  **Hon. Agom Augustine, National Coordinator, Convener & Mobilizer, National
  OK Movement (NOkM)**. Full title exactly as given; do not abbreviate
  "Convener & Mobilizer" away.
- `builtBy: { name: "Comrd. Gideon George", role: "Platform Developer" }`.

**A2.** A **Coordinator's word** block on the home page, above the "What NOkM
is — and is not" panel: portrait (or initials fallback), name, full title, and
a short signed statement. If no statement text is supplied, use the movement's
rallying cry attributed to the office, not an invented quotation.

**A3.** A `/leadership` route — the National Coordinator's full profile plus
the National Working Committee, ordered by `rank` from
`data/nokm-structure.json`.

**A4.** Developer credit in the footer bottom bar, understated:
"Platform built by Comrd. Gideon George for the National OK Movement." One
line, muted, no link unless one is supplied.

**A5.** Update `README.md` and the `/about` page to name the National
Coordinator and the platform developer.

---

## B. OFFICIAL CONTACT AND SOCIAL PRESENCE

**B1.** In `src/lib/site.ts`, add a single `officialContact` object:

```ts
export const officialContact = {
  email: "nokm2026@gmail.com",
  // International format, digits only, no "+". Publish ONLY with the
  // Coordinator's explicit consent — see README, Data protection.
  whatsapp: null as string | null,
  whatsappLabel: "National Coordinator — direct line",
} as const;
```

Build a `waLink(message?: string)` helper that produces a
`https://wa.me/<number>?text=<encoded>` URL, and returns `null` when no number
is configured so every call site degrades to email.

**B2.** A `SocialLinks` component driven by a `socials` array in
`src/lib/site.ts`. Each entry is `{ platform, handle, url }` and is rendered
only if `url` is a real supplied URL. **Ship the array empty rather than
guessing handles.** Support Instagram, Facebook, X, Telegram, LinkedIn,
YouTube, TikTok, WhatsApp Channel. Place it in the footer and on `/about`.

**B3.** Contact surfaces, everywhere it matters:

- Footer: email (mailto) + WhatsApp + socials.
- A floating WhatsApp action button on mobile, on every page, with a
  context-aware prefilled message ("I want to join NOkM in <state>", "I want to
  support NOkM", "I want to serve as an LGA Coordinator in <LGA>"). It must not
  cover primary controls, and must be dismissible.
- Every call to action in Wave 4 offers **two doors**: the form, and WhatsApp.
  WhatsApp is how Nigeria actually communicates. Never make the form the only
  way through.

**B4.** Replace the "ordering contact not yet published" state on `/store` and
the office-contact form fallbacks with the official email and WhatsApp.

---

## C. DECLARED NATIONAL COVERAGE — THE HONEST WAY

Leadership has declared the movement's national footprint. These are the
figures, and they must appear on the site:

| Level | Declared | National total | Gap |
|---|---:|---:|---:|
| National executives | 28 | 32 offices established | — |
| Diaspora coordinators appointed | 3 | — | — |
| Zonal coordinators | 6 | 6 | 0 |
| State coordinators | 26 | 37 | 11 |
| LGA coordinators | 544 | 774 | 230 |
| Ward executives | 6,191 | 8,809 (INEC) | 2,618 |
| Polling unit canvassers | 124,258 | 176,379 | 52,121 |

**C1.** Create `data/nokm-coverage-declared.json`:

```json
{
  "_meta": {
    "source": "National Coordination — National OK Movement",
    "declaredBy": "Hon. Agom Augustine, National Coordinator",
    "asOf": "<date supplied with the figures>",
    "note": "Declared coverage as reported by National Coordination. These are the movement's own operational figures, not counts of named records held in this platform. Where the roster names fewer people than are declared, both numbers are shown."
  },
  "levels": [ /* one entry per row above: key, label, declared, universe, universeSource */ ]
}
```

**C2.** `src/lib/coverage.ts` derives, per level: declared, universe, gap,
percentage covered. Cross-check `universe` against the real geography in
`src/lib/geo.ts` — 774 LGAs, 176,379 polling units — and **fail the build with
a clear error if a declared figure exceeds its universe.** A declared number
larger than the number of polling units in Nigeria is a data-entry error, not
a fact, and the platform should refuse to publish it.

**C3.** A `DeclaredFigure` component. It renders the number, and beneath it, in
small muted type: *"Declared by National Coordination, as of <date>"*. Where
the roster names a different count, it also renders *"<n> named on the public
roster"* with a link to `/structure`. Both numbers, always. No averaging, no
picking the flattering one.

**C4.** Replace the home page coverage strip with a **national coverage
scoreboard**: seven tiles, one per level, each showing declared / universe as a
progress arc, with the gap in red beneath. Animate the counters up on first
view (respect `prefers-reduced-motion`).

**C5.** Update `docs/TODO-real-data.md` with a new **Declared coverage**
section recording every delta between declared and named, and the action
required: leadership to supply names for the 28 national executives, 3 diaspora
coordinators and 26 state coordinators so the roster can be reconciled.

---

## D. FACES OF THE MOVEMENT — OFFICER PHOTOGRAPHS

**D1.** Schema — `supabase/migrations/005_nokm_photos.sql`:

- `officer_photos`: `appointment_slug`, `storage_path`, `alt_text`,
  `credit`, `consent_recorded_at`, `consent_source`, `status`
  (`pending` | `approved` | `withdrawn`), `uploaded_by`, timestamps.
- Storage bucket `officer-photos`, public read for `approved` rows only.
- RLS: an officer may upload to their own appointment; only National Publicity
  or National Secretary may approve; anyone may request takedown, which sets
  `withdrawn` immediately without waiting for review.
- A row with no `consent_recorded_at` can never reach `approved`. Enforce it in
  a database constraint, not just in the UI.

**D2.** `OfficerPortrait` component, used everywhere an officer appears:
approved photo if one exists, otherwise the existing initials avatar in the
office's tone colour. Never a stock photo, never a silhouette that implies a
person exists where one has not been named. Fixed aspect ratio (4:5), no layout
shift, lazy below the fold.

**D3.** `/structure` gains a **gallery view** toggle alongside the current list:
a responsive portrait grid, filterable by level (National / Diaspora / Zonal /
State / LGA) and by state, searchable by name. Vacant posts appear in the grid
as outlined "This seat is open — step forward" cards linking to `/vacancies`.
Make the vacancies *visible*, not hidden; an empty chair recruits.

**D4.** Upload flow inside `/dashboard`: an officer uploads their own portrait,
sees a live crop preview, ticks an explicit consent checkbox with its own
wording ("I consent to NOkM publishing this photograph of me on its public
website, and I understand I may withdraw this at any time"), and submits for
approval. Client-side resize to max 1000px on the long edge before upload —
officers are uploading 6 MB phone photos over mobile data.

**D5.** A publicity-officer moderation queue at `/dashboard` for approve /
reject / withdraw, and a bulk-upload path for a state coordinator submitting
their LGA team in one go.

**D6.** A **mosaic** on the home page — a dense wall of approved officer
portraits, gently drifting, that resolves into the NOkM wordmark. Purely
decorative, `aria-hidden`, disabled under `prefers-reduced-motion` and under
the data-light setting from section J. This is the "lively" the movement asked
for: the first thing a visitor should feel is *how many people are already
here*.

---

## E. THE PENETRATION MAP — WHERE WE ARE, WHERE WE ARE NOT

This is the centrepiece of Wave 4 and the answer to "identify gaps that must be
filled". Build it at `/coverage`.

**E1.** A drill-down hierarchy: **Nation → Zone → State → LGA → Ward → Polling
Unit**. At each level, a tile or region is coloured by coverage:

- **Dark / unclaimed** — no NOkM presence recorded
- **Amber** — partial (some units below it covered)
- **Green** — full coverage recorded
- Intensity scales with percentage.

The visual metaphor is a **map lighting up**. The headline at the top of the
page is the number of polling units still dark, in the largest type on the
site, counting down as coverage grows.

**E2.** Do **not** load a Mapbox GL basemap by default — it is a heavy
dependency and members are on metered data. Build the primary view as a
lightweight **grid/treemap of tiles** rendered from the committed geography
(`data/geo-index.json`, `public/geo/*.json` fetched per state on demand). Offer
a real geographic map only as an opt-in "Map view" that lazy-loads Mapbox, and
only if `NEXT_PUBLIC_MAPBOX_TOKEN` is configured.

**E3.** Every level shows: units covered / total, canvassers recorded,
registered voters (from the 2023 baseline), and — the payoff — **voters not
reached**, computed from the baseline's non-voters in the uncovered units.
Connect the gap to the prize: *"11,400 registered voters in this LGA live in
polling units where NOkM has nobody. In 2023, 7,900 of them did not vote."*

**E4.** A **"Gaps near me"** panel: the visitor picks state → LGA → ward, and
gets the specific uncovered polling units around them, with a one-tap
**"I'll take this one"** action.

**E5.** `/coverage/[state]` static routes for all 37, each shareable and
individually indexed, so a state coordinator can send their own state's page
into their WhatsApp group. Give each a distinct OpenGraph image with the
state's coverage percentage rendered into it.

**E6.** Data source: coverage comes from the `pu_champions` / appointment
records in Supabase where they exist, and falls back to the declared figures
from section C at national level. Never blend the two silently — the map
legend states which source is driving the colour.

---

## F. ADOPT A POLLING UNIT

The gap map shows the hole. This fills it, and it is the single most viral
mechanic available to a movement organised around polling units.

**F1.** `polling_unit_adoptions` table: `pu_code`, `member_id`, `status`
(`claimed` | `confirmed` | `released`), `claimed_at`, `confirmed_by`,
`pledge_note`. RLS: a member may claim; the LGA or State Coordinator confirms;
one active claim per member; a unit can hold one active claim.

**F2.** A one-screen claim flow from any dark unit on the map: name, phone,
ward confirmation, consent. Reuse the `/join` validators — an adoption is a
registration with a polling unit attached, not a separate identity.

**F3.** On success, generate a **PU Champion card** — a shareable image with
the unit name, unit code, ward, LGA, the champion's name, and the NOkM
wordmark. Render it client-side to a canvas and offer *Share to WhatsApp*,
*Download*, *Set as status*. This card is the growth engine: it is a personal
achievement that names a place, and Nigerians share things that name their
place.

**F4.** A public **wall of champions** at `/coverage/champions` — the most
recent adoptions scrolling live, and the LGAs closest to full coverage. Fire
a celebration state (confetti, a distinct card) when a ward reaches 100%.

**F5.** "Each One Bring Ten" — extend the existing referral code on `/join`
into a visible personal dashboard: your code, your QR, how many joined through
you, your rank in your ward / LGA / state, and a share card for each milestone
(1, 5, 10, 25, 50, 100). Rank people **within their own ward first** — a
national leaderboard is demotivating to everyone outside the top 20, a ward
leaderboard is winnable by anyone.

---

## G. ASPIRANTS — ALL FIVE RACES

The movement asked how to display politicians contesting at every level, from
State House of Assembly to the Presidency. Build `/aspirants`.

**G1.** Model the five races honestly against Nigeria's actual constituency
structure:

| Race | Constituency unit | Count |
|---|---|---:|
| President | Nation | 1 |
| Governor | State | 36 |
| Senate | Senatorial district | 109 |
| House of Representatives | Federal constituency | 360 |
| State House of Assembly | State constituency | 993 |

**BLOCKER:** the repository has no senatorial-district, federal-constituency or
state-constituency delimitation data — `src/lib/geo.ts` goes state → LGA → ward
→ PU. Build the schema and the UI against a `data/constituencies.json` file
with a documented shape, seed it with whatever is authoritative and obtainable
from INEC's delimitation publications, and **record clearly in
`docs/TODO-real-data.md` which of the five race levels have real constituency
data and which are stubbed.** Do not fabricate constituency names or LGA
groupings. A wrong federal constituency on a political website is a serious
error.

**G2.** `aspirants` table: name, office sought, constituency reference, party,
photo, five-bullet manifesto, verification status
(`self_declared` | `documents_seen` | `inec_confirmed`), consent record,
submitted_by, timestamps. **NOkM endorsement is a separate table** with a
ratification date and the body that ratified it, and it is absent by default.

**G3.** The directory: filter by race, state, constituency, party, verification
status. Each aspirant gets a card with portrait, office, constituency and
verification badge. Never show party colours in a way that implies NOkM
preference, and show every listed aspirant in a race with equal visual weight.

**G4.** **"Your Ballot 2027"** — the feature that makes this matter to a
visitor. Enter your ward once, and see *your* five races on one screen: the
Presidency, your Governor, your Senator, your Rep, your Assembly member — with
the aspirants contesting each, your polling unit, your unit's 2023 turnout, and
whether NOkM has a canvasser there. Save it to `localStorage`. Make it
shareable as a card. Most Nigerians cannot name their state assembly
constituency; a tool that tells them, and shows them who wants the seat, is
genuinely useful and will be shared for that reason alone.

**G5.** A side-by-side **compare** view, up to three aspirants in the same
race, on their own declared commitments only.

**G6.** A submission route for an aspirant to request a listing, with explicit
consent, going into a moderation queue. Nobody is listed without asking.

---

## H. SUPPORT NOkM — CASH AND IN KIND

**H1.** Route `/support`, in the primary navigation, with two clearly separated
paths.

**H2. In kind** — a real form, live immediately, no payment processor needed.
Categories: venue space, vehicles and fuel, printing and materials, airtime and
data, food for events, professional services (legal, medical, media, design),
security-conscious logistics, volunteer hours, PVC-drive transport. Fields:
what you can offer, quantity, where (state/LGA), when available, contact,
consent. Writes to a `support_pledges` table with RLS so only the National
Director of Welfare and the National Treasurer can read it. Confirmation
screen offers the WhatsApp line for immediate follow-up.

**H3. Cash** — hosted checkout only. A Paystack or Flutterwave payment page on
the processor's own domain, opened in a new tab. Suggested amounts in naira
(₦1,000 / ₦5,000 / ₦20,000 / ₦100,000 / other), plus a published bank transfer
option in the movement's registered name. **No card field, no account number
input, no BVN, ever appears in this application.** Record only the visitor's
*intent* to give and their contact, if they choose to leave it.

**H4. Accountability, which is the whole point.** Directly beneath the give
button, before anyone parts with money:

- Who receives it — the movement's registered name and the National Treasurer's
  office (the office, not a personal account).
- What it funds — a short list, and the current campaign target with a progress
  bar.
- A link to a **public ledger** page showing monthly totals received and spent
  by category. Ship the ledger page even if it starts at zero. A political
  movement asking Nigerians for money without publishing what happens to it is
  the exact thing this movement exists to be an alternative to.
- The receipt policy, and the named contact for a query.

**H5.** Compliance copy, reviewed before launch (see Part 2 §4): NOkM is an
independent support group, not a party or a candidate; contributions are not
donations to a candidate or to the NDC; contributions are not tax-deductible;
the movement does not accept anonymous contributions or contributions from
foreign sources or from public funds; no contribution buys any position,
appointment or influence within the movement. Membership remains **free** —
state that on the support page itself so nobody mistakes giving for a
requirement.

**H6.** Every CTA on `/support` offers the email (`nokm2026@gmail.com`) and the
National Coordinator's WhatsApp as the human point of contact, per section B.

**BLOCKER:** do not ship the cash path until a processor account exists in the
movement's registered name and the copy has been reviewed. Ship in-kind and the
ledger shell; show cash as "opening shortly — talk to us on WhatsApp".

---

## I. HOME PAGE — MAKE IT LIVE

The current home page is well designed and static. Give it a pulse.

**I1.** Hero: keep the typography and the 63.2M framing — it is strong. Add a
**countdown to the 2027 general election** and a **live registration odometer**
that ticks as members join (animate from a cached value; never show a fake
number).

**I2.** A **coverage strip** immediately below the hero: the seven declared
levels from section C, and the dark-units number as the emotional hook, linking
to `/coverage`.

**I3.** The **officer mosaic** from D6.

**I4.** A **live activity ticker** — "Adaeze just adopted PU 004, Nkanu East,
Enugu", "Kano is 62% covered", "Ward 7, Bwari reached full coverage". First
names and place names only, never full names or numbers. Pull from recent
adoption and registration events. Pause on hover, hide under data-light.

**I5.** Rotate the primary CTA by what the visitor has already done, from
`localStorage`: not registered → *Join*; registered → *Adopt your polling
unit*; adopted → *Bring ten*; officer → *Open your dashboard*. Always give the
returning visitor the next thing, never the thing they already did.

**I6.** A **testimony strip** — short quotes from real named officers with
their portraits, once supplied. Empty state, not invented quotes.

---

## J. REACH, SPEED AND SHARING

Ten million users on Nigerian mobile networks is an engineering constraint
before it is a marketing goal.

**J1. WhatsApp-first sharing.** A `ShareBar` component on every substantive
page: WhatsApp first and largest, then Telegram, X, Facebook, copy-link. Every
share carries a prefilled message written for the page it is on.

**J2. Share cards.** A single client-side card generator (canvas) producing
1080×1080 and 1080×1920 images for: PU Champion (F3), referral milestone (F5),
Your Ballot (G4), state coverage (E5), and "I registered". Nigerian visual
identity — green/white, the NOkM wordmark, bold display type readable as a
WhatsApp Status thumbnail. Generate on demand, never at build time.

**J3. PWA and offline.** `public/manifest.json` already exists — complete it,
add a service worker that caches the shell, geography and lesson content, and
make `/learn`, `/coverage` and the registration form usable offline with queued
submission on reconnect. Add an install prompt after a second visit.

**J4. Data-light mode.** A toggle in the header, persisted, and defaulted on
when `navigator.connection.saveData` is true: no mosaic, no ticker, no map
view, portraits at low resolution. State the saving in the toggle's tooltip.

**J5. Performance budgets, enforced.** No route above 200 kB first-load JS.
Map, card generator, Mapbox and the photo grid are all `next/dynamic` with
loading states. Verify with `npm run build` and report the actual per-route
numbers in your summary — do not claim a budget you have not measured.

**J6. SEO and link previews.** Per-page OpenGraph images for all 37 state
coverage pages, all constituency pages that have real data, and `/support`.
Structured data (`Organization`, `Person` for the Coordinator). Extend
`sitemap.ts` to every new route.

**J7. Accessibility.** Everything keyboard-navigable, AA contrast in both
themes, `prefers-reduced-motion` respected by the mosaic, ticker, counters and
confetti, and every map tile reachable and labelled for screen readers. This is
a public-interest platform; excluding disabled Nigerians is not acceptable.

---

## K. HOUSEKEEPING

**K1.** Update `README.md`: the National Coordinator, the developer credit, the
official contact, the amended phone-number rule with its single exception, the
photo consent model, the declared-vs-verified model, and the support pipeline.

**K2.** Update `docs/TODO-real-data.md` with every new placeholder introduced,
every declared-vs-named delta, and the constituency-data blocker from G1.

**K3.** Bump `currentPolicyVersion` in `src/lib/site.ts` and extend `/privacy`
to cover officer photographs, aspirant listings, support pledges and adoption
records. This is a material change to what the platform collects — members must
be re-prompted for consent.

**K4.** Add the new routes to `src/lib/nav.ts`. The navigation is already at 12
items and cannot take 5 more — regroup it into: **Movement** (Structure,
Leadership, Vacancies, Diaspora), **Coverage** (Coverage map, Baseline,
Leaderboard, Action plan, Rhythm), **Take part** (Join, Adopt a PU, PVC,
Support, Learn), **Community** (Market, Store, Aspirants, About). Primary bar
keeps four: Coverage, Join, Support, Learn.

---

## DEFINITION OF DONE

- `npm run build` passes clean; `npm run lint` passes clean.
- No route above 200 kB first-load JS except `/join` — report the real table.
- Every new number on the site traces to the roster, the database, the 2023
  baseline dataset, or a `DeclaredFigure` with its source and date.
- No invented name, quotation, social handle, phone number or constituency
  anywhere in the diff. Grep your own output for these before you finish.
- Photos cannot reach `approved` without a consent record — verified by a
  database constraint.
- Every BLOCKER is either resolved with supplied input, or shipped as an honest
  empty state and listed in your final summary.
- The site works with JavaScript-heavy features disabled, on a slow 3G throttle,
  in dark mode, on a 360px viewport.

Commit per section. Final summary: what shipped, what is blocked on leadership
input, the measured bundle table, and every judgement call you made.

---
---

# PART 2 — Answers to the National Coordinator's questions

Not part of the prompt above. This is the decision brief for
**scale, database, domain and money**. Figures are indicative and must be
re-checked at purchase time.

## 1. Domain name

`nokmofficial@ng` is not a valid domain — `@` belongs in an email address. The
options as written are `nokmofficial.org`, `nokmofficial.ng` and
`nokmofficial.com`.

**Recommendation: register all three, point them at one canonical site.** They
are cheap relative to the cost of someone else registering your name during a
campaign. Serve `nokmofficial.org` as canonical and 301 the others to it.

| Domain | Registrar type | Indicative annual cost | Note |
|---|---|---|---|
| `nokmofficial.org` | International (Cloudflare, Namecheap, Porkbun) | ~$10–15 | Best fit — `.org` reads as a movement, not a business. **Canonical.** |
| `nokmofficial.com` | International | ~$10–15 | Defensive. Redirect. |
| `nokm.ng` / `nokmofficial.ng` | NiRA-accredited Nigerian registrar (Whogohost, Qservers, DomainKing, Web4Africa) | ₦15,000–30,000 for `.ng`; `.org.ng` is materially cheaper | Nigerian identity, strong locally. Redirect or use for campaigns. |

Also register the obvious typo and hyphen variants if budget allows, and lock
every domain with registrar-lock and 2FA on the registrar account. Use a
registrar-provided WHOIS privacy where legal.

**Do not let one person own the domain personally.** Register in the movement's
name, with the official email as the contact, and give at least two national
officers access. Domains registered to a departing individual are one of the
most common ways a movement loses its own identity.

**Email:** move official correspondence off `@gmail.com` to
`info@nokmofficial.org` once the domain exists. Zoho Mail has a free tier for a
custom domain; Google Workspace is around $6–7/user/month. Keep
`nokm2026@gmail.com` published as the contact during the transition, and
forward it. A `@nokmofficial.org` address materially increases how seriously
donors, media and institutions take the movement.

**Deployment:** adding a custom domain in Vercel is a one-line change here —
`vercel.json` already sets `NEXT_PUBLIC_BASE_PATH=""`. Set
`NEXT_PUBLIC_APP_URL` to the new domain, add the domain in the Vercel
dashboard, point the DNS, and update the hard-coded paths in
`public/manifest.json` (noted in `docs/TODO-real-data.md`).

## 2. Database

**Supabase is already the right answer and the schema is already written** —
four migrations in `supabase/`, seed scripts in `scripts/`, RLS designed. It
has not been provisioned. That is the single highest-value thing the movement
can do this week: nothing that makes the platform *live* — registrations,
photos, adoptions, reports, the coverage map — works until it exists.

**Steps:** create the project, enable Phone auth, `npm run db:migrate`,
`npm run db:seed:all`, set the two `NEXT_PUBLIC_SUPABASE_*` variables in Vercel,
redeploy. Half a day of work.

**Cost path:**

| Stage | Plan | Indicative cost |
|---|---|---|
| Launch, under 50k members | Free | ₦0 — but the free tier pauses on inactivity, so move off it before any public push |
| Real operation | Pro | ~$25/month + usage |
| 1M+ members, photos at scale | Pro + add-ons, or Team | Driven by storage, egress and compute |

**The cost that will actually bite is not the database — it is SMS.** Phone-OTP
auth at scale is expensive: at roughly ₦3–5 per SMS, one million verifications
is ₦3–5 million, before any re-sends. Three mitigations, in order:

1. **Do not authenticate ordinary members at all.** Registration and polling-unit
   adoption do not need a login. Authenticate **officers only** — that is
   thousands of people, not millions. This is the single biggest cost decision
   available and it should be made deliberately.
2. Use a **Nigerian SMS provider** (Termii, Africa's Talking, Twilio's local
   routes) rather than an international default — the per-message difference is
   several-fold.
3. Consider **WhatsApp** as the verification channel. It is where the movement
   already lives, and message costs are lower than SMS.

Also budget for **image storage**: 600,000+ officer photos at 200 kB each is
~120 GB plus egress. Resize on upload (specified in D4), serve at display size,
and if it grows, move the bucket behind Cloudflare R2 or Images, where egress
is free or near-free.

## 3. Scaling up

Honestly: **10 million users is achievable for the reach, not for the
registrations**, and it is worth being precise about which one is the goal.
Nigeria's entire 2023 register was ~93 million and total votes cast ~25
million. Ten million *registered members* would make NOkM one of the largest
membership organisations in Africa. Ten million *people reached and shared to*
is a realistic campaign goal. Design and measure for both, but state the target
honestly inside the movement — a declared number that later has to be walked
back costs more credibility than it ever bought.

**What the platform needs, in order:**

1. **Provision Supabase.** Nothing else matters until it exists.
2. **Custom domain + official email.** Credibility, and shareable links that
   look like a movement rather than a GitHub URL.
3. **Move to Vercel as the single deploy target.** The dual GitHub Pages /
   Vercel setup forces `output: "export"`, which is why there are no server
   routes. Dropping the Pages target unlocks route handlers (payment webhooks,
   server-side share-image generation, an admin API), ISR, and per-request
   caching at the edge. **Recommendation: make Vercel canonical, keep Pages as a
   static fallback only if the movement values a free mirror.** This is the one
   architectural decision that most constrains what can be built next, so make
   it deliberately.
4. **Cache aggressively at the edge.** The coverage map, the structure pages and
   the baseline data are the same for everyone; they should be served from cache,
   not recomputed. Vercel's CDN handles millions of reads at low cost when the
   pages are static. **The read path must never hit the database.**
5. **Protect the write path.** Registrations, adoptions and pledges are the only
   things touching Postgres per user. Rate-limit them, add Turnstile or hCaptcha
   on public forms, and put a unique constraint on phone number. At 10M scale
   you will be targeted by bulk-registration scripts, and a membership roll that
   can be inflated by a script is worthless as evidence of support.
6. **Team and process, not just tech.** A platform this size needs at least: a
   named data controller for NDPA compliance, a moderation rota for photos,
   aspirant listings and market posts, and a second person with production
   access. Today there is one developer and one deploy key. That is the real
   scaling risk.

**Indicative monthly running cost at serious scale:** Vercel Pro ~$20,
Supabase Pro ~$25 plus usage, domains ~$3, email ~$0–7/user, SMS variable and
dominant if member auth is kept. **Under $100/month plus SMS** for a platform
serving millions of reads — which is only true because the read path is static.
Keep it that way.

## 4. Taking money — the part that needs care

**Processor:** Paystack or Flutterwave. Both are Nigerian, take naira by card,
bank transfer and USSD, work with a hosted checkout page (so no server is
needed on a static site), and settle to a Nigerian corporate account.
Flutterwave has broader international coverage, which matters for the diaspora
chapters. Fees are broadly ~1.5% + ₦100 domestic, capped, and higher for
international cards.

**Prerequisites before a single naira is collected:**

1. A **registered legal entity** — the account must be in the movement's name,
   not any individual's personal account. Money into a personal account is the
   fastest way to destroy a movement's credibility, and it is what your
   opponents will look for first.
2. **Named financial accountability** — the National Treasurer and National
   Financial Secretary are already offices in `docs/nokm-framework.md`. Put
   their offices on the support page.
3. **Legal review** of the donation copy. Nigeria's Electoral Act 2022 regulates
   contributions to *parties and candidates*, including caps and a prohibition
   on foreign contributions to parties. NOkM is neither a party nor a candidate,
   which is precisely why the boundary must be drawn explicitly in the copy —
   and why funds must never be transferred to a candidate or party in a way that
   would make NOkM a conduit around those rules. **Get this reviewed by a
   Nigerian election lawyer before launch.** This document is not legal advice.
4. **No anonymous contributions, no foreign-source contributions, no crypto.**
   Record who gave and when, for every contribution.
5. **Publish the ledger.** Monthly in, monthly out, by category. The movement's
   entire pitch is that it is an alternative to opaque politics; the support
   page is where that claim is tested in public.

**In-kind support can start immediately** — it needs no processor, no legal
entity, and no review beyond ordinary care. Ship section H2 first. In a
Nigerian grassroots context, in-kind support (venues, transport, printing,
airtime, food, volunteer hours) is frequently worth more than the cash a
movement at this stage can raise anyway.

## 5. What I would do in the next two weeks

1. Provision Supabase. (Half a day. Unblocks everything.)
2. Register the domains and set up the official email. (Half a day.)
3. Send leadership the input checklist at the top of this document — social
   handles, the WhatsApp number with consent, the names behind the 28 / 3 / 26,
   and officer photographs. Nothing in section C or D can be finished without
   them.
4. Build sections A, B, C, H2 and I — identity, contact, declared coverage,
   in-kind support, a living home page. All achievable without new data.
5. Then build E and F — the coverage map and Adopt-a-PU. That pair is the
   product's reason to exist and its best chance of spreading.
6. G (aspirants) last, and only once real constituency data is in hand.
