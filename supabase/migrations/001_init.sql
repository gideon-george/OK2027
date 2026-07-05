-- OK2027 pilot schema
-- Geographic hierarchy: zones -> states -> lgas -> wards -> polling_units
-- Plus profiles, group chat spaces, events, civic education, badges, and a
-- scaffold-only incident/result reporting table (pu_reports).

create extension if not exists pgcrypto;

-- ============================================================================
-- Enums
-- ============================================================================

create type flair_type as enum ('obidient', 'kwankwasiya', 'ok_family');

create type user_role as enum (
  'member',
  'pu_champion',
  'ward_coord',
  'lga_coord',
  'state_coord',
  'observer',
  'moderator',
  'admin'
);

create type scope_type as enum ('pu', 'ward', 'lga', 'state', 'zone', 'diaspora');

create type report_type as enum ('result', 'incident');

create type verification_status as enum ('pending', 'verified', 'disputed');

-- ============================================================================
-- Geographic hierarchy
-- ============================================================================

create table zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique check (char_length(code) > 0),
  created_at timestamptz not null default now()
);

create table states (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones (id) on delete restrict,
  name text not null,
  code text not null unique check (char_length(code) > 0)
);

create table lgas (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references states (id) on delete restrict,
  name text not null,
  code text not null unique check (char_length(code) > 0)
);

create table wards (
  id uuid primary key default gen_random_uuid(),
  lga_id uuid not null references lgas (id) on delete restrict,
  name text not null,
  code text not null unique check (char_length(code) > 0)
);

create table polling_units (
  id uuid primary key default gen_random_uuid(),
  ward_id uuid not null references wards (id) on delete restrict,
  name text not null,
  pu_code text not null unique check (char_length(pu_code) > 0),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180)
);

create index idx_states_zone_id on states (zone_id);
create index idx_lgas_state_id on lgas (state_id);
create index idx_wards_lga_id on wards (lga_id);
create index idx_polling_units_ward_id on polling_units (ward_id);

-- ============================================================================
-- Profiles
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  flair flair_type,
  polling_unit_id uuid references polling_units (id) on delete set null,
  is_diaspora boolean not null default false,
  diaspora_country text,
  pvc_hash text,
  pvc_verified_at timestamptz,
  role user_role not null default 'member',
  created_at timestamptz not null default now(),
  constraint profiles_diaspora_country_requires_flag
    check (diaspora_country is null or is_diaspora)
);

create index idx_profiles_polling_unit_id on profiles (polling_unit_id);
create index idx_profiles_role on profiles (role);

-- Auto-create a profile row whenever a new auth user signs up (phone OTP).
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================================
-- PU champions (one champion per polling unit)
-- ============================================================================

create table pu_champions (
  polling_unit_id uuid primary key references polling_units (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  claimed_at timestamptz not null default now()
);

create index idx_pu_champions_profile_id on pu_champions (profile_id);

-- ============================================================================
-- Group spaces (chat/community per geo scope, or per diaspora country)
-- ============================================================================

create table group_spaces (
  id uuid primary key default gen_random_uuid(),
  scope_type scope_type not null,
  scope_id text not null,
  name text not null,
  unique (scope_type, scope_id)
);

create table space_memberships (
  space_id uuid not null references group_spaces (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (space_id, profile_id)
);

create index idx_space_memberships_profile_id on space_memberships (profile_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references group_spaces (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index idx_messages_space_id_created_at on messages (space_id, created_at desc);

-- ============================================================================
-- Events
-- ============================================================================

create table events (
  id uuid primary key default gen_random_uuid(),
  scope_type scope_type not null,
  scope_id text not null,
  title text not null check (char_length(title) > 0),
  description text,
  starts_at timestamptz not null,
  location_text text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  created_by uuid references profiles (id) on delete set null
);

create index idx_events_scope on events (scope_type, scope_id);
create index idx_events_starts_at on events (starts_at);

create table event_rsvps (
  event_id uuid not null references events (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create index idx_event_rsvps_profile_id on event_rsvps (profile_id);

-- ============================================================================
-- Civic education
-- ============================================================================

create table lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) > 0),
  title text not null,
  body_md text not null,
  order_index int not null default 0 check (order_index >= 0)
);

create table lesson_progress (
  profile_id uuid not null references profiles (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (profile_id, lesson_id)
);

create index idx_lesson_progress_lesson_id on lesson_progress (lesson_id);

-- ============================================================================
-- Badges
-- ============================================================================

create table badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) > 0),
  name text not null,
  emoji text,
  description text
);

create table profile_badges (
  profile_id uuid not null references profiles (id) on delete cascade,
  badge_id uuid not null references badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);

create index idx_profile_badges_badge_id on profile_badges (badge_id);

-- ============================================================================
-- PU reports (result/incident documentation) -- SCAFFOLD ONLY.
-- Table + RLS exist so the schema is stable, but no product UI writes to
-- this table yet. Do not surface unverified rows as verified in any client.
-- ============================================================================

create table pu_reports (
  id uuid primary key default gen_random_uuid(),
  polling_unit_id uuid not null references polling_units (id) on delete restrict,
  reporter_id uuid not null references profiles (id) on delete restrict,
  report_type report_type not null,
  payload jsonb not null default '{}'::jsonb,
  evidence_url text,
  geolat double precision check (geolat between -90 and 90),
  geolng double precision check (geolng between -180 and 180),
  device_time timestamptz,
  submitted_at timestamptz not null default now(),
  verification_status verification_status not null default 'pending',
  corroboration_count int not null default 1 check (corroboration_count >= 1)
);

create index idx_pu_reports_polling_unit_id on pu_reports (polling_unit_id);
create index idx_pu_reports_verification_status on pu_reports (verification_status);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table zones enable row level security;
alter table states enable row level security;
alter table lgas enable row level security;
alter table wards enable row level security;
alter table polling_units enable row level security;
alter table profiles enable row level security;
alter table pu_champions enable row level security;
alter table group_spaces enable row level security;
alter table space_memberships enable row level security;
alter table messages enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table badges enable row level security;
alter table profile_badges enable row level security;
alter table pu_reports enable row level security;

-- Geographic reference data + civic education content: readable by anyone,
-- writable only by service_role (migrations/seed scripts), which bypasses RLS.
create policy zones_select_all on zones for select using (true);
create policy states_select_all on states for select using (true);
create policy lgas_select_all on lgas for select using (true);
create policy wards_select_all on wards for select using (true);
create policy polling_units_select_all on polling_units for select using (true);
create policy lessons_select_all on lessons for select using (true);
create policy badges_select_all on badges for select using (true);
create policy group_spaces_select_all on group_spaces for select using (true);

-- profiles: public fields readable by everyone; users manage only their own
-- row. Column-level grants (below) keep pvc_hash/pvc_verified_at/role out of
-- reach of normal client reads and writes.
create policy profiles_select_all on profiles for select using (true);
create policy profiles_update_own on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- pu_champions: readable to all; insertable only by an authenticated user
-- claiming a PU that has no champion yet (also enforced by the primary key).
create policy pu_champions_select_all on pu_champions for select using (true);
create policy pu_champions_insert_if_unclaimed on pu_champions for insert
  with check (
    auth.uid() is not null
    and profile_id = auth.uid()
    and not exists (
      select 1 from pu_champions existing
      where existing.polling_unit_id = pu_champions.polling_unit_id
    )
  );

-- space_memberships: users can see and manage their own membership rows.
create policy space_memberships_select_own on space_memberships for select
  using (profile_id = auth.uid());
create policy space_memberships_insert_own on space_memberships for insert
  with check (profile_id = auth.uid());
create policy space_memberships_delete_own on space_memberships for delete
  using (profile_id = auth.uid());

-- messages: readable/insertable only by members of the space.
create policy messages_select_space_members on messages for select
  using (
    exists (
      select 1 from space_memberships sm
      where sm.space_id = messages.space_id and sm.profile_id = auth.uid()
    )
  );
create policy messages_insert_space_members on messages for insert
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from space_memberships sm
      where sm.space_id = messages.space_id and sm.profile_id = auth.uid()
    )
  );

-- events: visible to all authenticated users (civic events are public by
-- nature); only the creator may manage their own event.
create policy events_select_authenticated on events for select
  using (auth.uid() is not null);
create policy events_insert_own on events for insert
  with check (created_by = auth.uid());
create policy events_update_own on events for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());
create policy events_delete_own on events for delete
  using (created_by = auth.uid());

-- event_rsvps: anyone can see who's attending; users manage their own RSVP.
create policy event_rsvps_select_all on event_rsvps for select using (true);
create policy event_rsvps_insert_own on event_rsvps for insert
  with check (profile_id = auth.uid());
create policy event_rsvps_delete_own on event_rsvps for delete
  using (profile_id = auth.uid());

-- lesson_progress: users manage only their own progress.
create policy lesson_progress_select_own on lesson_progress for select
  using (profile_id = auth.uid());
create policy lesson_progress_insert_own on lesson_progress for insert
  with check (profile_id = auth.uid());

-- profile_badges: publicly viewable (achievements are shown on profiles);
-- awarded server-side only (no client insert policy -- service_role only).
create policy profile_badges_select_all on profile_badges for select using (true);

-- pu_reports: readable only to observer/moderator/admin; insertable only by
-- an authenticated observer, and only as their own report.
create policy pu_reports_select_observers on pu_reports for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('observer', 'moderator', 'admin')
    )
  );
create policy pu_reports_insert_observers on pu_reports for insert
  with check (
    reporter_id = auth.uid()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'observer'
    )
  );

-- ============================================================================
-- Column-level grants for profiles
-- PostgreSQL RLS is row-level only, so sensitive columns are locked down
-- separately via column grants. service_role (used server-side) bypasses
-- RLS and grants entirely, so PVC verification writes must happen there.
-- ============================================================================

revoke all on profiles from anon, authenticated;

grant select (
  id, display_name, avatar_url, flair, polling_unit_id,
  is_diaspora, diaspora_country, role, created_at
) on profiles to anon, authenticated;

grant update (
  display_name, avatar_url, flair, polling_unit_id,
  is_diaspora, diaspora_country
) on profiles to authenticated;

-- No insert grant: profiles are created exclusively by the handle_new_user
-- trigger (security definer) when a new auth.users row appears.
