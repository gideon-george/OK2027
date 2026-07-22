-- NOkM structure, membership and recruitment.
--
-- Adds the office/appointment model that backs /structure and /vacancies, the
-- member register that backs /join, and the contact routing that lets the
-- public reach an office without any officer's phone number being published.
--
-- Nothing here stores a PVC number or a VIN. See docs/nokm-framework.md §7.

-- ============================================================================
-- Enums
-- ============================================================================

create type office_scope_level as enum (
  'national',
  'zonal',
  'state',
  'lga',
  'ward',
  'unit',
  'diaspora'
);

create type appointment_status as enum (
  'vacant',
  'advertised',
  'acting',
  'confirmed',
  'vetted',
  'suspended'
);

create type application_status as enum (
  'submitted',
  'screening',
  'vetting',
  'approved',
  'rejected'
);

create type pvc_status as enum ('yes', 'no', 'in_progress');

-- ============================================================================
-- Offices and appointments
-- ============================================================================

create table offices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_title text not null,
  scope_level office_scope_level not null,
  rank integer not null,
  mandate text not null,
  duties jsonb not null default '[]'::jsonb,
  kpi_defs jsonb not null default '[]'::jsonb,
  framework_addendum boolean not null default false,
  created_at timestamptz not null default now()
);

-- A vacancy is an appointment with no holder. The org chart and the vacancy
-- board therefore read from one table and can never disagree.
create table appointments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  office_id uuid not null references offices (id) on delete restrict,
  -- office_scope_level, not the scope_type enum from migration 001: that one
  -- has no 'national' member, and national posts have no geographic scope.
  scope_type office_scope_level not null,
  -- Geographic scope. Null for national posts, which have no sub-scope.
  scope_code text,
  zone_id uuid references zones (id) on delete restrict,
  state_id uuid references states (id) on delete restrict,
  lga_id uuid references lgas (id) on delete restrict,
  ward_id uuid references wards (id) on delete restrict,
  polling_unit_id uuid references polling_units (id) on delete restrict,
  profile_id uuid references profiles (id) on delete set null,
  -- Recorded for officers unveiled publicly before they hold an account.
  holder_name text,
  status appointment_status not null default 'vacant',
  appointed_at date,
  ended_at date,
  created_at timestamptz not null default now(),
  -- One person, one position: enforced per active appointment.
  constraint appointments_holder_consistent check (
    (status = 'vacant' and profile_id is null and holder_name is null)
    or status <> 'vacant'
  )
);

create index idx_appointments_office_id on appointments (office_id);
create index idx_appointments_profile_id on appointments (profile_id);
create index idx_appointments_state_id on appointments (state_id);
create index idx_appointments_status on appointments (status);

-- Enforces "one person, one position" across levels for live appointments.
create unique index idx_appointments_one_live_post_per_profile
  on appointments (profile_id)
  where profile_id is not null and ended_at is null;

-- ============================================================================
-- Officer contact details — never public, never in the repository
-- ============================================================================

create table officer_contacts (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_officer_contacts_appointment_id
  on officer_contacts (appointment_id);

-- ============================================================================
-- Members
-- ============================================================================

create table members (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 3),
  state_code text not null,
  lga_code text,
  ward_code text,
  polling_unit_code text,
  -- Whether the member holds a PVC. The PVC number and VIN are deliberately
  -- not collected and must never be added to this table.
  has_pvc boolean not null default false,
  pvc_status pvc_status not null default 'no',
  referral_code text not null unique,
  referred_by text,
  -- NDPA 2023: explicit, versioned, timestamped consent.
  consent_version text not null,
  consent_at timestamptz not null default now(),
  joined_at timestamptz not null default now()
);

create index idx_members_state_code on members (state_code);
create index idx_members_lga_code on members (lga_code);
create index idx_members_ward_code on members (ward_code);
create index idx_members_referred_by on members (referred_by);

-- ============================================================================
-- Applications for office
-- ============================================================================

create table applications (
  id uuid primary key default gen_random_uuid(),
  appointment_slug text not null,
  applicant_profile_id uuid references profiles (id) on delete set null,
  full_name text not null,
  phone text not null,
  statement text not null,
  status application_status not null default 'submitted',
  reviewed_by uuid references profiles (id) on delete set null,
  review_notes text,
  consent_version text not null,
  created_at timestamptz not null default now()
);

create index idx_applications_appointment_slug
  on applications (appointment_slug);
create index idx_applications_status on applications (status);

-- ============================================================================
-- Messages routed to an office
-- ============================================================================

create table office_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_slug text not null,
  from_name text not null,
  from_contact text not null,
  subject text not null,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_office_messages_appointment_slug
  on office_messages (appointment_slug);

-- ============================================================================
-- Scope helpers used by row-level security
-- ============================================================================

-- True when the signed-in user holds any live appointment.
create or replace function is_officer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from appointments a
    join profiles p on p.id = a.profile_id
    where p.id = auth.uid()
      and a.ended_at is null
      and a.status <> 'vacant'
  );
$$;

-- True when the signed-in user holds a national-level appointment.
create or replace function is_national_officer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from appointments a
    join offices o on o.id = a.office_id
    where a.profile_id = auth.uid()
      and a.ended_at is null
      and a.status <> 'vacant'
      and o.scope_level in ('national', 'diaspora')
  );
$$;

-- The state codes a signed-in officer is responsible for. National officers
-- get every state; a state officer gets their own.
create or replace function officer_state_codes()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select s.code
  from states s
  where is_national_officer()
  union
  select a.scope_code
  from appointments a
  where a.profile_id = auth.uid()
    and a.ended_at is null
    and a.status <> 'vacant'
    and a.scope_type = 'state'
    and a.scope_code is not null
  union
  -- Zonal officers cover every state in their zone.
  select s.code
  from appointments a
  join zones z on z.code = a.scope_code
  join states s on s.zone_id = z.id
  where a.profile_id = auth.uid()
    and a.ended_at is null
    and a.status <> 'vacant'
    and a.scope_type = 'zonal';
$$;

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table offices enable row level security;
alter table appointments enable row level security;
alter table officer_contacts enable row level security;
alter table members enable row level security;
alter table applications enable row level security;
alter table office_messages enable row level security;

-- Offices and appointments are public: the structure is meant to be seen.
create policy "offices are public"
  on offices for select
  using (true);

create policy "appointments are public"
  on appointments for select
  using (true);

create policy "national officers manage appointments"
  on appointments for all
  using (is_national_officer())
  with check (is_national_officer());

-- Contact details are for officers only, never the public.
create policy "officers read officer contacts"
  on officer_contacts for select
  to authenticated
  using (is_officer());

create policy "national officers manage officer contacts"
  on officer_contacts for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

-- Members read and edit only their own record.
create policy "members read own record"
  on members for select
  to authenticated
  using (id = auth.uid());

create policy "members insert own record"
  on members for insert
  to authenticated
  with check (id = auth.uid());

create policy "members update own record"
  on members for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members delete own record"
  on members for delete
  to authenticated
  using (id = auth.uid());

-- Officers read members inside their own scope only. A state officer sees
-- their state; a national officer sees everyone.
create policy "officers read members in scope"
  on members for select
  to authenticated
  using (state_code in (select officer_state_codes()));

-- Anyone may apply for a post or write to an office; only officers may read.
create policy "anyone may apply"
  on applications for insert
  to anon, authenticated
  with check (true);

create policy "officers read applications"
  on applications for select
  to authenticated
  using (is_officer());

create policy "national officers update applications"
  on applications for update
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

create policy "anyone may message an office"
  on office_messages for insert
  to anon, authenticated
  with check (true);

create policy "officers read office messages"
  on office_messages for select
  to authenticated
  using (is_officer());

create policy "officers update office messages"
  on office_messages for update
  to authenticated
  using (is_officer())
  with check (is_officer());

-- ============================================================================
-- Public aggregate counts
--
-- Individual member records are never public, but the movement's coverage
-- numbers are. This view exposes counts only.
-- ============================================================================

create view member_counts_by_state
with (security_invoker = off)
as
  select
    state_code,
    count(*)::bigint as members,
    count(*) filter (where has_pvc)::bigint as members_with_pvc
  from members
  group by state_code;

grant select on member_counts_by_state to anon, authenticated;

create view member_counts_by_lga
with (security_invoker = off)
as
  select
    state_code,
    lga_code,
    count(*)::bigint as members,
    count(*) filter (where has_pvc)::bigint as members_with_pvc
  from members
  where lga_code is not null
  group by state_code, lga_code;

grant select on member_counts_by_lga to anon, authenticated;
