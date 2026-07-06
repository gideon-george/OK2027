# OK2027

Community and civic-participation app for Nigerian supporters ahead of the 2027 elections. Pilot scoped to ~5,000 users.

**Live site:** https://gideon-george.github.io/OK2027/

## Stack

- [Next.js 15](https://nextjs.org) (App Router, static export) + TypeScript + Tailwind CSS + [shadcn/ui](https://ui.shadcn.com)
- Hosted on **GitHub Pages** (static). Deploys automatically from `master` via GitHub Actions.
- [Supabase](https://supabase.com) — Postgres, Auth (phone OTP), Storage, Realtime (schema + seed ready in `supabase/`; wired in client-side once a Supabase project is provisioned)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) for maps (planned)
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) for validated forms

> Note: GitHub Pages serves static files only, so all future backend features
> (auth, chat, events) run client-side against Supabase. The earlier
> `next-pwa` service worker was removed because it doesn't work under the
> `/OK2027` base path; the web-app manifest remains.

## Local development

### Prerequisites

- Node.js 20+
- npm
- (Only for future backend features) a Supabase project and Mapbox token — the
  static site itself needs no credentials

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000/OK2027](http://localhost:3000/OK2027) — the app
   lives under the `/OK2027` base path to match GitHub Pages.

For future backend features, copy `.env.local.example` to `.env.local` and
fill in Supabase/Mapbox values:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (used only by the seed script, never shipped to the client) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS access token |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app |

### Deployment

Every push to `master` triggers `.github/workflows/deploy.yml`, which builds
the static export (`out/`) and publishes it to GitHub Pages.

### Other scripts

```bash
npm run build     # static export to out/
npm run lint      # eslint
npm run db:seed   # seed Supabase (dry-runs without credentials)
```

## Project structure

```
src/
  app/               # routes (App Router)
  components/
    ui/              # shadcn/ui primitives
    family/          # family-related components
    map/              # Mapbox components
    protect/         # incident/fraud-documentation components
    profile/         # profile components
    shared/          # shared/cross-cutting components
  lib/
    supabase/        # Supabase client setup
    validators/      # Zod schemas
    utils.ts
  hooks/
  types/
```

## Principles

- Boring, well-tested tech over clever tech.
- Type safety end-to-end — Zod at every API boundary.
- Server components by default; client components only when needed.
- PVC numbers and phone numbers are never stored in plaintext — always hashed.
- Fraud/incident data must be evidence-based (photo + geotag + timestamp) and clearly marked verified vs. unverified.
- Non-incitement in all UI copy.
