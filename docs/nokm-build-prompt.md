# NOkM Platform — Full Build Prompt

Paste everything below the line into a fresh Claude Code session opened in this
repository. It specifies all three waves of the OK2027 → National OK Movement
transformation as a single build.

---

## MISSION

Transform this repository from **OK2027** (a 3-page static civic-education
brochure) into **NOkM — the National OK Movement platform**: the operational
system of record for a live nationwide political support movement in Nigeria.

Build all three waves in one pass. Work wave by wave, committing at the end of
each wave, but do not stop for approval between them.

## CONTEXT — WHAT NOkM IS

The National OK Movement (NOkM) is an **independent grassroots support group**
aligned with the Nigeria Democratic Congress (NDC), mobilising for **Peter Obi
(President)** and **Rabiu Kwankwaso (Vice President)** in the **2027 Nigerian
general election**. "OK" = Obi + Kwankwaso. Also referred to as the
Obidient/Kwankwasiyya (OK) Alliance.

Critical framing, which must be reflected in the product and in copy:

- NOkM is **NOT** an organ of the NDC party. It is a voluntary, non-elected
  movement that operates *parallel to and in support of* the party. It
  complements, and never replaces, official party structures.
- Membership is **voluntary and free**. No fees to participate.
- All activity must be **peaceful, lawful, and within INEC regulations**.
  Nothing in the product may encourage confrontation.
- **One person, one position** — no double office-holding across levels.
- Command ladder: **National → Zonal → State → LGA → Ward → Polling Unit**,
  plus a **Diaspora** directorate.
- Movement motto: *"Structure. Mobilize. Secure. Grow. Lead. Deliver."*
- Taglines: *"One Nation. One Voice. One Future."* / *"A New Nigeria Is
  Possible!"* / *"Together, we can. Together, we will win."*

The movement currently runs entirely inside WhatsApp. Reports scroll away,
membership lives in a Google Form behind a QR code, vacancies are announced once
and forgotten, and KPIs are declared but never measured. **The purpose of this
platform is to be the permanent register, the org chart, and the scoreboard that
WhatsApp cannot be.**

## CURRENT STATE OF THE REPO

- Next.js 15 (App Router, `output: "export"`) + TypeScript + Tailwind v4 +
  shadcn/ui. Deployed to GitHub Pages via `.github/workflows/deploy.yml`.
- Routes: `/`, `/learn`, `/learn/[slug]`, `/network`, `/about`.
- `supabase/migrations/001_init.sql` — full schema written but **no Supabase
  project provisioned yet**. Already contains: `zones, states, lgas, wards,
  polling_units, profiles, pu_champions, group_spaces, space_memberships,
  messages, events, event_rsvps, lessons, lesson_progress, badges,
  profile_badges, pu_reports` and enums `flair_type, user_role, scope_type,
  report_type, verification_status`.
- `src/lib/geo.ts` — zones + pilot geography. `src/lib/lessons.ts` — 8 civic
  lessons (keep these, they are good).
- `basePath: "/OK2027"` in `next.config.ts`.

## NON-NEGOTIABLE CONSTRAINTS

1. **Static export only.** GitHub Pages serves static files. All dynamic
   behaviour is client-side against Supabase. No route handlers, no server
   actions, no middleware. Every dynamic route needs
   `generateStaticParams()`.
2. **Never commit personal phone numbers or member data to the repo.** The
   repository is public. Officer names and roles were publicly unveiled and may
   live in a seed file; **phone numbers must not**. They belong in Supabase
   behind row-level security, loaded by an admin import script that reads from
   an uncommitted local file.
3. **Never collect PVC numbers or VINs.** Store `has_pvc: boolean` plus ward
   only. This gives every mobilisation metric needed with none of the
   liability.
4. **NDPA 2023 compliance from day one.** Membership data includes political
   opinion, a sensitive category under the Nigeria Data Protection Act 2023.
   Ship a real privacy notice, an explicit consent checkbox at registration
   (unticked by default, with its own record in the database including
   timestamp and policy version), and a data-deletion request route.
5. **The independent-support-group disclaimer appears in the site footer on
   every page** and again above the submit button on `/join`.
6. **Non-incitement in all copy.** Participation, organisation, turnout,
   de-escalation. Never confrontation, never allegations against named
   individuals, never anything that reads as a call to disrupt.
7. Type safety end to end. Zod schemas for every form and every Supabase
   boundary. Server components by default; `"use client"` only where needed.

---

# WAVE 1 — REBRAND, STRUCTURE, RECRUITMENT

### 1.1 Rebrand

- Rename the project to **NOkM / National OK Movement** throughout: `package.json`
  (`name: "nokm"`), README, metadata, manifest, wordmark, all copy.
- Wordmark: **NOkM** with the "O" and "K" emphasised, subtitle "National OK
  Movement".
- Palette: NDC/NOkM **red, white, and deep blue** as primary and secondary,
  Nigerian **green** as accent. Replace the current green-only theme in
  `src/app/globals.css`. Must work in light and dark mode.
- Keep `basePath` configurable: read it from
  `process.env.NEXT_PUBLIC_BASE_PATH ?? "/OK2027"` so moving to a custom domain
  (`nokm.ng`) later is a one-line change. Document this in the README.
- Remove all "pilot — FCT & Anambra" framing. The movement is national. Replace
  it with a live coverage strip: *states live / LGAs live / offices vacant*.

### 1.2 Data model — new migration `002_nokm_structure.sql`

Add (do not break existing tables):

```
offices          id, title, slug, scope_level (national|zonal|state|lga|ward|unit|diaspora),
                 rank, mandate text, duties jsonb, kpi_defs jsonb
appointments     id, office_id, scope_id, scope_type, profile_id (nullable),
                 holder_name, status (vacant|advertised|acting|confirmed|vetted|suspended),
                 appointed_at, ended_at
                 -- a vacancy is simply a row with profile_id null; the org chart
                 -- and the vacancy board are the same table
applications     id, appointment_id, applicant_profile_id, statement, status
                 (submitted|screening|vetting|approved|rejected), reviewed_by, notes
members          -- extends profiles: state_id, lga_id, ward_id, pu_id, has_pvc,
                 joined_at, consent_version, consent_at, referral_code, referred_by
officer_contacts id, appointment_id, phone, email  -- RLS: officers+ only, never public
```

Write **row-level security policies** for every new table. Public read for
`offices`, `appointments` (excluding contact details), and aggregate counts.
Authenticated-officer read for contacts and applications. Insert-own for
`members` and `applications`.

### 1.3 Seed the real structure

Create `data/nokm-structure.json` with the 25 national offices, 6 zonal
coordinator posts, and 37 state coordinator posts (36 states + FCT), each with
its mandate, duties, and KPI definitions. Source the office definitions from
`docs/nokm-framework.md` (create that file from the framework text the user
supplies, or ask for it if absent).

Seed known officeholders **by name and role only**. Mark every unfilled post
`status: 'vacant'` — including North-West Zonal, North-East Zonal, and Abia
State, which are currently pending. Vacant posts are a feature, not an
embarrassment: they drive `/vacancies`.

### 1.4 Routes

- `/` — homepage. Principals (Obi/Kwankwaso), mission, live coverage counters,
  primary CTA **Join the Movement**, secondary **See the structure**.
- `/structure` — drill-down: National → Zone → State → LGA → Ward. Filled posts
  in brand colour, vacant posts grey with an **Apply** button. Nigeria map or a
  clean grid of 37 state tiles; do not require Mapbox for this view.
- `/structure/[slug]` — office detail: mandate, duties, KPIs, current holder (name
  and role only), coverage stats beneath it, and a **contact this office** form
  that routes a message without exposing a phone number.
- `/vacancies` — every `status IN ('vacant','advertised')` post, filterable by
  level and state, each with an apply flow.
- `/join` — member registration. Phone OTP via Supabase Auth. Cascading
  select: state → LGA → ward → polling unit. Asks `has_pvc` (yes / no / in
  progress). Explicit unticked consent checkbox linking to `/privacy`.
  Generates a referral code. On success: welcome screen with the member's ward
  coordinator, their referral link, and a link to `/learn`.
- `/privacy` — NDPA-compliant notice: controller identity, lawful basis,
  categories collected, retention, rights, deletion request route.
- `/about` — rewrite for NOkM: what the movement is, the Modus Operandi, the
  relationship with NDC, operational principles.

Keep `/learn` and `/learn/[slug]` exactly as they are apart from rebranding.
Fold the old `/network` content into `/structure`.

---

# WAVE 2 — REPORTING, KPIs, THE OPERATING RHYTHM

### 2.1 Data model — migration `003_nokm_reporting.sql`

```
reporting_periods  id, kind (weekly|monthly|quarterly), starts_on, ends_on, label
reports            id, appointment_id, period_id, lead_officer, support_officer,
                   activity_summary, topic_handled, meetings_held, meeting_attendance_pct,
                   new_members, structures_created, evidence_url, narrative,
                   submitted_at, submitted_by
kpi_snapshots      id, appointment_id, period_id, scores jsonb, composite numeric,
                   computed_at
directives         id, title, body, issued_by, level, published_at, ack_required
directive_acks     id, directive_id, appointment_id, acked_at
action_plan_items  id, phase, week_no, title, description, owner_office_id,
                   deliverable, status, due_on
```

Roll-ups: a materialised view or scheduled RPC that aggregates ward → LGA →
state → zone → national for membership, structures, and reporting compliance.

### 2.2 Officer dashboard — `/dashboard`

Auth-gated (phone OTP). On login the officer sees only their own scope.

- **This week**: which reporting period is open, what is due, days remaining.
- **Submit report**: a form mirroring the movement's existing template — Lead
  Officer, Position, Support Officer, Position, KPIs, Date — plus new members,
  structures created, meetings held, attendance %, narrative, optional evidence
  upload (Supabase Storage).
- **My scorecard**: current-quarter KPI progress against the ten general
  executive KPIs (membership growth, structural expansion, programme delivery,
  meeting attendance ≥90%, reporting compliance, communication responsiveness,
  financial accountability, conflict resolution, leadership performance,
  ethical compliance).
- **My structure**: posts below the officer, filled and vacant, with a
  one-click "advertise this vacancy" action.
- **Directives**: unread directives with an acknowledge button.

### 2.3 `/action-plan` — the 6-Month Victory Action Plan

Render the plan as a live, dated, checkable timeline rather than an image.
Phases, weeks (`WK:1 Day 12` format is used by the movement), owning office,
deliverable, status, and an overall % complete. Public read; officers with
scope can update status from the dashboard.

### 2.4 `/rhythm` — the weekly operating cycle

The movement's existing Mon–Sun cycle, as a live calendar:

| Day | Focus |
|---|---|
| Monday | Politics and marketing the movement — strategy and outreach |
| Tuesday | Strategies to win all polling units for Obi & Kwankwaso |
| Wednesday | State-by-state coverage progress review |
| Thursday | PVC verification — who has one, planning for the rest |
| Friday | Member business marketing and networking |
| Saturday | Politics and trending news analysis |
| Sunday | Checking upon ourselves — welfare and solidarity |

Show today highlighted, who is the lead officer for each session, and the
report template for that day.

### 2.5 `/leaderboard`

Public, encouraging, never punitive. Rank states and LGAs by members
registered, structures completed, and reporting compliance. This is the single
best driver of coordinator activity — make it the most-linked page in the
product.

---

# WAVE 3 — PVC DRIVE, MARKET, STORE, DIASPORA

### 3.1 `/pvc` — the PVC drive

Why the PVC matters, how to register, how to collect, what to do if there is a
problem, INEC links. A **self-report tracker**: a member marks their PVC status
(and only that) and sees live ward / LGA / state / national totals with a
progress bar. Copy: *"Get your PVC, secure Nigeria's future."*

**Never accept a VIN or PVC number.** Boolean status only.

### 3.2 `/market` — NOkM Market/Trade BO Advertisement Centre

A member-business board: post a listing (business name, category, state/LGA,
description, WhatsApp contact, one image). Browse and filter by category and
state. Moderation queue — listings are `pending` until an officer approves.
Ties directly into the movement's Friday rhythm. Categories from the existing
artwork: market & trade, advertising services, business growth.

### 3.3 `/store` — merchandise

Catalogue the existing designs (polo, hoodie, sweatshirt, cap) in orange, sky
blue, and green colourways, with the NDC + NOkM crests. **No payment
processing** — each item links to an official WhatsApp ordering contact.
Keeping money flows off the platform is deliberate; do not add a checkout.

### 3.4 `/diaspora`

Country chapters, how to start one, and a diaspora registration path that skips
the Nigerian ward/PU cascade in favour of country and city.

### 3.5 Quarterly scorecards

Generate the quarterly evaluation report per officer from `kpi_snapshots`,
viewable in the dashboard and exportable as a printable page. This is what makes
the movement's stated policy of replacing non-performing executives defensible
against a record rather than a feeling.

---

## CROSS-CUTTING REQUIREMENTS

- **Mobile-first.** The overwhelming majority of members are on Android phones
  on metered data over patchy networks. Budget hard: no heavy client bundles,
  lazy-load anything below the fold, compress every image, keep the largest
  route under ~150 KB of JS. Test at a 3G throttle.
- **Offline tolerance.** Registration and report forms must survive a dropped
  connection — persist form state to `localStorage` and retry submission.
- **Accessibility.** Semantic HTML, real labels, visible focus, WCAG AA
  contrast in both themes. `/structure` and `/action-plan` must be usable by
  keyboard and screen reader.
- **Shareability.** Every page gets Open Graph metadata and an OG image, because
  distribution happens by WhatsApp forward. This is the primary growth channel —
  treat OG cards as a feature, not an afterthought.
- **SEO.** `sitemap.xml`, `robots.txt`, and `Organization` structured data
  identifying NOkM as an independent political support movement.
- **Analytics:** privacy-preserving and cookieless only. No Meta pixel, no
  Google Analytics — a political membership platform must not leak members to
  ad networks.

## DELIVERABLES

1. All routes above, building cleanly with `npm run build` (static export).
2. Migrations `002` and `003` with complete RLS policies.
3. Seed scripts for offices, appointments, and the full 36-state + FCT +
   774-LGA geography (extend `scripts/seed-geo.ts`; use placeholder ward data
   where the INEC register is unavailable and label it clearly as placeholder).
4. `.env.local.example` updated with every variable required.
5. README rewritten for NOkM: what it is, the stack, local setup, Supabase
   provisioning steps, deployment, and a **data-protection section** stating
   what is collected, what is never collected, and where consent is recorded.
6. `docs/nokm-framework.md` — the executive roles, duties, and KPI framework as
   the canonical reference the seed data is built from.
7. `npm run lint` and `npx tsc --noEmit` both clean.

## HOW TO WORK

- Start by reading `src/lib/geo.ts`, `src/lib/lessons.ts`,
  `supabase/migrations/001_init.sql`, and `src/app/layout.tsx` so you extend the
  existing conventions instead of inventing new ones.
- Reuse the shadcn/ui primitives already in `src/components/ui/`. Add new
  primitives with the `shadcn` CLI, not by hand.
- Commit at the end of each wave with a clear message. Do not push.
- Where a real-world fact is needed that you do not have — the exact INEC ward
  register, the full 774-LGA list, the official WhatsApp ordering number — use
  clearly-labelled placeholder data and list every placeholder in a
  `docs/TODO-real-data.md` file rather than inventing plausible-looking
  specifics.
- **Do not invent officeholder names, phone numbers, membership figures, or
  coverage statistics.** Every count in the UI must come from the database. An
  empty state that reads "no members registered yet" is correct; a fabricated
  "12,400 members" is not.

Begin with Wave 1.
