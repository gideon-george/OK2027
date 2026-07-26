-- Adopt a polling unit.
--
-- A NOTE ON WHAT IS AND IS NOT IDENTIFIED HERE.
--
-- The register loaded into this repository carries polling-unit *counts* per
-- LGA, not unit *identities* — data/baseline-lga/*.json has `pollingUnits: 485`
-- for Bwari, and public/geo/*.json goes down to ward and stops. INEC's
-- unit-by-unit list is not in this project. See docs/TODO-real-data.md.
--
-- So an adoption is anchored to a ward, which IS in the register and can be
-- validated, plus the unit name or number as the member reads it off the board
-- at the unit itself. That field is member-supplied text and is marked
-- unverified until an LGA or State Coordinator confirms it. Generating unit
-- codes to make the schema look tidier would have put fictional places on a
-- political website.

create type adoption_status as enum ('claimed', 'confirmed', 'released', 'rejected');

create table polling_unit_adoptions (
  id uuid primary key default gen_random_uuid(),

  -- Validated against the register.
  state_code text not null,
  lga_code text not null,
  ward_code text not null,

  -- As the member reads it at the unit. Never generated, never guessed.
  pu_label text not null check (char_length(trim(pu_label)) >= 2),

  -- The adopter. member_id is set when the claim comes from a registered
  -- member; the name and phone are captured either way, because the whole
  -- point is to reach someone who has just raised their hand.
  member_id uuid references members (id) on delete set null,
  full_name text not null check (char_length(trim(full_name)) >= 3),
  phone text not null,

  pledge_note text check (pledge_note is null or char_length(pledge_note) <= 500),

  status adoption_status not null default 'claimed',
  confirmed_by uuid references profiles (id) on delete set null,
  confirmed_at timestamptz,

  consent_version text not null,
  consent_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_adoptions_state on polling_unit_adoptions (state_code);
create index idx_adoptions_lga on polling_unit_adoptions (lga_code);
create index idx_adoptions_ward on polling_unit_adoptions (ward_code);
create index idx_adoptions_status on polling_unit_adoptions (status);

-- One live claim per person, so the leaderboard cannot be farmed by one
-- enthusiast claiming forty units.
create unique index idx_adoptions_one_live_per_phone
  on polling_unit_adoptions (phone)
  where status in ('claimed', 'confirmed');

-- One live claim per unit. Two people claiming the same unit is a dispute for
-- the LGA Coordinator, not a race.
create unique index idx_adoptions_one_live_per_unit
  on polling_unit_adoptions (ward_code, lower(trim(pu_label)))
  where status in ('claimed', 'confirmed');

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table polling_unit_adoptions enable row level security;

-- Anyone may claim, including people who have not registered as members yet.
-- Turning away someone who wants to stand for their own polling unit because
-- they have not filled in another form first would be self-defeating.
create policy "anyone may claim a unit"
  on polling_unit_adoptions for insert
  to anon, authenticated
  with check (status = 'claimed');

create policy "officers read adoptions in scope"
  on polling_unit_adoptions for select
  to authenticated
  using (is_officer());

create policy "officers confirm adoptions"
  on polling_unit_adoptions for update
  to authenticated
  using (is_officer())
  with check (is_officer());

-- ============================================================================
-- Public aggregates
--
-- Counts are public; the individual rows never are. Nobody browsing the site
-- can enumerate who is standing at which polling unit — that list would be a
-- targeting aid, and this is a political movement in a country where that
-- matters.
-- ============================================================================

create view adoption_counts
with (security_invoker = off)
as
  select
    state_code,
    lga_code,
    count(*)::bigint as adoptions,
    count(*) filter (where status = 'confirmed')::bigint as confirmed
  from polling_unit_adoptions
  where status in ('claimed', 'confirmed')
  group by state_code, lga_code;

grant select on adoption_counts to anon, authenticated;

-- The wall of champions: first name and place only. No surname, no phone, no
-- unit label — a first name and an LGA is enough to celebrate someone without
-- publishing where they can be found.
create view recent_champions
with (security_invoker = off)
as
  select
    split_part(trim(full_name), ' ', 1) as first_name,
    state_code,
    lga_code,
    created_at
  from polling_unit_adoptions
  where status in ('claimed', 'confirmed')
  order by created_at desc
  limit 60;

grant select on recent_champions to anon, authenticated;

-- ============================================================================
-- Referrals — "Each One Bring Ten"
--
-- members.referral_code and members.referred_by already exist (002). This view
-- turns them into a scoreboard without exposing any member record.
-- ============================================================================

create view referral_counts
with (security_invoker = off)
as
  select
    m.referral_code,
    m.state_code,
    m.lga_code,
    m.ward_code,
    count(r.id)::bigint as brought
  from members m
  left join members r on r.referred_by = m.referral_code
  group by m.referral_code, m.state_code, m.lga_code, m.ward_code;

grant select on referral_counts to anon, authenticated;
