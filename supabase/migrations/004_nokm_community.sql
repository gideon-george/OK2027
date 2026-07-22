-- NOkM community features: the Market/Trade board and diaspora chapters.
--
-- PVC tracking needs no table of its own — it lives on members.pvc_status,
-- which records only whether someone holds a card. PVC numbers and VINs are
-- never collected. See docs/nokm-framework.md §7.

create type listing_status as enum ('pending', 'approved', 'rejected', 'withdrawn');

create type listing_category as enum (
  'market_trade',
  'advertising_services',
  'business_growth'
);

-- ============================================================================
-- Market / Trade BO Advertisement Centre
--
-- Ties into the movement's Friday rhythm: members market their own businesses
-- to each other.
-- ============================================================================

create table market_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null check (char_length(trim(business_name)) >= 2),
  category listing_category not null,
  state_code text not null,
  lga_code text,
  description text not null check (char_length(trim(description)) >= 20),
  -- The poster's own contact. The movement publishes no central number here,
  -- so nobody can pose as NOkM to take money for a listing.
  contact_whatsapp text not null,
  image_url text,
  status listing_status not null default 'pending',
  reviewed_by uuid references profiles (id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_market_listings_status on market_listings (status);
create index idx_market_listings_state_code on market_listings (state_code);
create index idx_market_listings_category on market_listings (category);

-- ============================================================================
-- Diaspora chapters
-- ============================================================================

create table diaspora_chapters (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  city text,
  slug text not null unique,
  coordinator_name text,
  coordinator_profile_id uuid references profiles (id) on delete set null,
  status appointment_status not null default 'vacant',
  created_at timestamptz not null default now()
);

create index idx_diaspora_chapters_country on diaspora_chapters (country);

create table diaspora_members (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  country text not null,
  city text,
  chapter_id uuid references diaspora_chapters (id) on delete set null,
  referral_code text not null unique,
  referred_by text,
  consent_version text not null,
  consent_at timestamptz not null default now(),
  joined_at timestamptz not null default now()
);

create index idx_diaspora_members_country on diaspora_members (country);

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table market_listings enable row level security;
alter table diaspora_chapters enable row level security;
alter table diaspora_members enable row level security;

-- Only approved listings are public. Pending ones are visible to their owner
-- and to officers reviewing the queue.
create policy "approved listings are public"
  on market_listings for select
  using (status = 'approved');

create policy "owners read own listings"
  on market_listings for select
  to authenticated
  using (owner_id = auth.uid());

create policy "officers read all listings"
  on market_listings for select
  to authenticated
  using (is_officer());

create policy "members create own listings"
  on market_listings for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owners update own listings"
  on market_listings for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "officers moderate listings"
  on market_listings for update
  to authenticated
  using (is_officer())
  with check (is_officer());

create policy "diaspora chapters are public"
  on diaspora_chapters for select
  using (true);

create policy "national officers manage diaspora chapters"
  on diaspora_chapters for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

create policy "diaspora members read own record"
  on diaspora_members for select
  to authenticated
  using (id = auth.uid());

create policy "diaspora members insert own record"
  on diaspora_members for insert
  to authenticated
  with check (id = auth.uid());

create policy "diaspora members update own record"
  on diaspora_members for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "diaspora members delete own record"
  on diaspora_members for delete
  to authenticated
  using (id = auth.uid());

create policy "officers read diaspora members"
  on diaspora_members for select
  to authenticated
  using (is_national_officer());

-- ============================================================================
-- Public aggregates
-- ============================================================================

create view pvc_progress
with (security_invoker = off)
as
  select
    state_code,
    count(*)::bigint as members,
    count(*) filter (where pvc_status = 'yes')::bigint as have_pvc,
    count(*) filter (where pvc_status = 'in_progress')::bigint as awaiting_collection,
    count(*) filter (where pvc_status = 'no')::bigint as not_registered
  from members
  group by state_code;

grant select on pvc_progress to anon, authenticated;

create view diaspora_chapter_counts
with (security_invoker = off)
as
  select
    c.id as chapter_id,
    c.country,
    c.city,
    c.slug,
    count(m.id)::bigint as members
  from diaspora_chapters c
  left join diaspora_members m on m.chapter_id = c.id
  group by c.id, c.country, c.city, c.slug;

grant select on diaspora_chapter_counts to anon, authenticated;
