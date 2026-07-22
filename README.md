# NOkM — National OK Movement

The operational platform for the **National OK Movement (NOkM)**: the permanent
register, the org chart, and the scoreboard for a nationwide grassroots
movement organising behind **Peter Obi** and **Rabiu Kwankwaso** — the "O" and
the "K" — for Nigeria's 2027 general election.

**Live site:** https://gideon-george.github.io/OK2027/

> **NOkM is an independent support group.** It is not an organ of the Nigeria
> Democratic Congress, is not funded by the party, and does not issue party
> directives. It complements official party structures and never replaces them.
> All activity is peaceful, lawful and within INEC regulations.

## What this replaces

The movement runs on WhatsApp. Reports scroll away, membership lives in a form
behind a QR code, vacancies are announced once and forgotten, and KPIs are
declared but never measured. This platform is the thing WhatsApp cannot be — a
record that persists.

| | |
|---|---|
| `/structure` | Every national, zonal and state office. 70 posts, filled and vacant. |
| `/vacancies` | Open posts with an application and vetting flow. |
| `/join` | Member registration, placed down to ward level. |
| `/dashboard` | Officer sign-in, weekly reports, quarterly KPI scorecards, directives. |
| `/action-plan` | The 6-Month Victory Action Plan as a dated timeline. |
| `/rhythm` | The published Monday-to-Sunday operating cycle. |
| `/leaderboard` | Zone and state performance. |
| `/pvc` | The PVC drive and live progress. |
| `/learn` | Eight civic-education lessons. |
| `/market` `/store` `/diaspora` | Member businesses, merchandise, country chapters. |

## Stack

- [Next.js 15](https://nextjs.org) (App Router, **static export**) + TypeScript
  + Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- Hosted on **GitHub Pages**. Deploys from `master` via GitHub Actions.
- [Supabase](https://supabase.com) — Postgres, phone-OTP Auth, Storage. Schema
  and seeds live in `supabase/` and `scripts/`.
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) at
  every form and database boundary.

GitHub Pages serves static files only, so everything dynamic runs client-side
against Supabase. There are no route handlers, no server actions and no
middleware, and every dynamic route has `generateStaticParams()`.

**The site is fully functional before Supabase exists.** Public pages render
from committed seed data (`data/nokm-structure.json`); database-backed features
detect that no project is configured and say so plainly instead of failing.

## Data protection

This is a membership platform for a political movement, which makes member data
sensitive personal data under the **Nigeria Data Protection Act 2023**. The
rules below are not optional.

**What is collected:** name, phone number, state/LGA/ward, whether the member
holds a PVC, an optional referral code, and a versioned timestamped consent
record.

**What is never collected:**

- **PVC numbers and VINs.** Only a `yes` / `no` / `in_progress` status. This
  gives every mobilisation metric the movement needs with none of the liability.
- Bank details, BVN, or NIN. No officer is authorised to ask for these.

**What is never committed to this repository:**

- **Officer phone numbers.** The repo is public; a committed roster stays in git
  history forever. Names and roles are seeded from
  `data/nokm-structure.json`; numbers belong in the `officer_contacts` table
  behind row-level security, loaded from a local uncommitted file.
- Any member data.

**Where consent is recorded:** `members.consent_version` and
`members.consent_at`, captured from an explicit, never pre-ticked checkbox on
`/join` that links to `/privacy`. The policy version lives in
`currentPolicyVersion` in `src/lib/site.ts` — bump it when the notice changes
materially, which re-prompts members for consent.

**Access control:** row-level security on every table. Officers read only their
own scope — a state officer sees their state, a zonal officer their zone.
Aggregate counts are public; individual records never are. Public contact with
an office goes through a form, so no officer's number is exposed to
impersonation or fraud.

**Analytics:** none. No Meta pixel, no Google Analytics. A political membership
platform must not leak its members to ad networks.

## Local development

### Prerequisites

- Node.js 20+ (Supabase's SDK warns on Node 20; 22+ recommended)
- npm

### Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000/OK2027 — the app lives under a base path to match
GitHub Pages.

Backend features need credentials: copy `.env.local.example` to `.env.local`
and fill it in. Without them the site runs fine in a read-only mode.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — seed scripts only, never shipped to the client |
| `NEXT_PUBLIC_BASE_PATH` | Base path; set to `""` for a custom domain |
| `NEXT_PUBLIC_APP_URL` | Full public URL, used for sitemap and link previews |

### Provisioning Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Phone** auth and connect an SMS provider. All sign-in is by
   one-time code; there are no passwords anywhere in the system.
3. Apply migrations in order:

   ```bash
   npm run db:migrate
   ```

   - `001_init.sql` — geography, profiles, spaces, lessons, badges
   - `002_nokm_structure.sql` — offices, appointments, members, applications
   - `003_nokm_reporting.sql` — reporting periods, reports, KPIs, directives
   - `004_nokm_community.sql` — market listings, diaspora chapters

4. Seed:

   ```bash
   npm run db:seed:all
   ```

5. Load officer phone numbers separately, from a local file that is **not** in
   this repository, into `officer_contacts`.

### Moving to a custom domain

Set `NEXT_PUBLIC_BASE_PATH=""` and `NEXT_PUBLIC_APP_URL=https://your-domain`.
Also update `start_url`, `scope` and the icon paths in `public/manifest.json`,
which are static JSON and cannot read the environment.

### Scripts

```bash
npm run build              # static export to out/
npm run lint               # eslint
npm run db:migrate         # apply migrations
npm run db:seed            # geography, lessons, badges (dry-runs without credentials)
npm run db:seed:structure  # offices and appointments (dry-runs without credentials)
npm run db:seed:all        # both
```

Both seed scripts fall back to a dry run when credentials are absent, so they
never silently no-op.

## Project structure

```
data/
  nokm-structure.json   # offices + appointments (names and roles only)
  nokm-action-plan.json # 6-month plan
  inec-pilot.json       # LGA/ward geography (FCT + Anambra)
docs/
  nokm-framework.md     # canonical offices, duties, KPIs — seed data derives from this
  TODO-real-data.md     # every placeholder still in the system
src/
  app/                  # routes (App Router)
  components/
    ui/                 # shadcn/ui primitives
    structure/ join/ dashboard/ market/ pvc/ diaspora/ rhythm/ leaderboard/
    shared/
  lib/
    structure.ts        # offices, appointments, coverage
    geo.ts              # zones, 36 states + FCT, LGA data
    kpis.ts             # the ten general executive KPIs
    supabase/           # config (no SDK) + lazily-loaded client
    validators/         # Zod schemas
supabase/migrations/
scripts/
```

`docs/nokm-framework.md` is the canonical reference. When it and the seed data
disagree, the framework wins.

## Performance

Members are on Android phones, on metered data, over patchy networks. That
constrains the build:

- `optimizePackageImports` for the `radix-ui` umbrella package, which
  otherwise pulled ~74 kB of unused primitives into every page with a button.
- `supabase-js` is loaded on demand inside submit handlers, never on the
  critical path. `src/lib/supabase/config.ts` exists purely so components can
  check whether the backend is configured without importing the SDK.
- The application form loads on first click, not with the vacancies list.
- Registration and report forms persist drafts to `localStorage`, so a dropped
  connection costs a retry rather than the whole submission.

All routes are at or under ~150 kB of first-load JS except `/join` (~193 kB),
which is the registration form itself. See `docs/TODO-real-data.md`.

## Principles

- Boring, well-tested tech over clever tech.
- Type safety end to end — Zod at every boundary.
- Server components by default; client components only where needed.
- **Never invent a number.** Every count in the UI comes from the roster file or
  the database. An empty state that reads "no members registered yet" is
  correct; a plausible-looking figure is not.
- Placeholder data is labelled as placeholder, in the UI and in
  `docs/TODO-real-data.md`.
- Non-incitement in all copy. Participation, organisation, turnout,
  de-escalation — never confrontation.
