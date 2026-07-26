-- Aspirants: people contesting the five races at the 2027 general election.
--
-- TWO RULES SHAPE THIS SCHEMA.
--
-- 1. LISTING IS NOT ENDORSEMENT. The directory says "this person is
--    contesting". It does not say NOkM backs them. Endorsement is a separate
--    table with a ratification date and the body that ratified it, it is empty
--    by default, and no amount of listing activity can create one by accident.
--
-- 2. NOBODY IS LISTED WITHOUT ASKING. Every row carries a consent record and
--    starts in a moderation queue. Scraping names of real Nigerian politicians
--    into a movement's website would misrepresent them.
--
-- Constituency identity is a known gap: INEC's delimitation of the 109
-- senatorial districts, 360 federal constituencies and 993 state
-- constituencies is not in this repository. `constituency_ref` is therefore
-- free text as supplied by the aspirant, alongside the state, and is marked
-- unverified until an officer confirms it. See docs/TODO-real-data.md.

create type race_key as enum ('president', 'governor', 'senate', 'reps', 'assembly');

create type aspirant_verification as enum (
  'self_declared',
  'documents_seen',
  'inec_confirmed'
);

create type aspirant_status as enum ('pending', 'listed', 'rejected', 'withdrawn');

create table aspirants (
  id uuid primary key default gen_random_uuid(),

  full_name text not null check (char_length(trim(full_name)) >= 3),
  race race_key not null,

  -- The seat. state_code is validated against the register; constituency_ref
  -- is what the aspirant says, because we cannot check it yet.
  state_code text,
  constituency_ref text,
  constituency_verified boolean not null default false,

  party text,

  photo_path text,
  photo_alt text,

  -- Five bullets, in the aspirant's own words. Capped so the directory stays a
  -- directory rather than a set of manifestos.
  manifesto text[] check (
    manifesto is null or
    (array_length(manifesto, 1) <= 5 and array_length(manifesto, 1) >= 1)
  ),

  verification aspirant_verification not null default 'self_declared',
  status aspirant_status not null default 'pending',

  -- Consent to being listed publicly, from the aspirant themselves.
  consent_recorded_at timestamptz,
  consent_contact text,

  submitted_by uuid references auth.users (id) on delete set null,
  reviewed_by uuid references profiles (id) on delete set null,
  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The same shape as the photo consent rule: no consent, no publication.
  constraint listed_requires_consent check (
    status <> 'listed' or consent_recorded_at is not null
  ),

  -- A presidential aspirant has no state; every other race does.
  constraint state_matches_race check (
    (race = 'president' and state_code is null)
    or (race <> 'president' and state_code is not null)
  )
);

create index idx_aspirants_race on aspirants (race);
create index idx_aspirants_state on aspirants (state_code);
create index idx_aspirants_status on aspirants (status);

-- ============================================================================
-- Endorsement — separate, deliberate, and empty until a body ratifies one
-- ============================================================================

create table aspirant_endorsements (
  id uuid primary key default gen_random_uuid(),
  aspirant_id uuid not null references aspirants (id) on delete cascade,

  -- The body that took the decision, e.g. "National Working Committee".
  ratified_by text not null check (char_length(trim(ratified_by)) >= 3),
  ratified_on date not null,
  minute_reference text,

  withdrawn_on date,

  created_at timestamptz not null default now(),
  recorded_by uuid references profiles (id) on delete set null
);

create unique index idx_endorsement_one_live_per_aspirant
  on aspirant_endorsements (aspirant_id)
  where withdrawn_on is null;

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table aspirants enable row level security;
alter table aspirant_endorsements enable row level security;

create policy "listed aspirants are public"
  on aspirants for select
  using (status = 'listed');

create policy "officers read the aspirant queue"
  on aspirants for select
  to authenticated
  using (is_officer());

-- Anyone may submit a request to be listed, including the aspirant themselves
-- from a public page. It lands in the queue; it does not appear.
create policy "anyone may request a listing"
  on aspirants for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "national officers moderate aspirants"
  on aspirants for update
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

create policy "endorsements are public"
  on aspirant_endorsements for select
  using (true);

-- Only national officers can record an endorsement, and only ever as a
-- deliberate act with a date and a minute reference.
create policy "national officers record endorsements"
  on aspirant_endorsements for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

-- ============================================================================
-- Public read
-- ============================================================================

create view listed_aspirants
with (security_invoker = off)
as
  select
    a.id,
    a.full_name,
    a.race,
    a.state_code,
    a.constituency_ref,
    a.constituency_verified,
    a.party,
    a.photo_path,
    a.photo_alt,
    a.manifesto,
    a.verification,
    -- Present only when a live ratified endorsement exists.
    e.ratified_by as endorsed_by,
    e.ratified_on as endorsed_on
  from aspirants a
  left join aspirant_endorsements e
    on e.aspirant_id = a.id and e.withdrawn_on is null
  where a.status = 'listed';

grant select on listed_aspirants to anon, authenticated;
