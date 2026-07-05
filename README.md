# OK2027

Community and civic-participation app for Nigerian supporters ahead of the 2027 elections. Pilot scoped to ~5,000 users.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) — Postgres, Auth (phone OTP), Storage, Realtime
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) for maps
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) for validated forms
- [Plausible](https://plausible.io) for analytics, [Sentry](https://sentry.io) for error tracking
- Installable as a PWA via `next-pwa`

## Local development

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (URL + anon key + service role key)
- A Mapbox access token

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in real values:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose to the client) |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS access token |
   | `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Note: the PWA service worker (`next-pwa`) is disabled in development and only builds in production (`npm run build && npm run start`).

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
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
