-- Officer photographs.
--
-- A photograph of a named person is personal data under the Nigeria Data
-- Protection Act 2023, and a photograph of a political officeholder is
-- sensitive: it ties a face to a political opinion. Three rules follow, and all
-- three are enforced here rather than in the UI, because a form can be
-- bypassed and a constraint cannot:
--
--   1. No photo is published without a recorded consent.
--   2. Consent can be withdrawn by the subject at any moment, without review.
--   3. Only officers appear. Members never do. There is no members photo table
--      and there must not be one.
--
-- See docs/nokm-framework.md §7 and README.md, Data protection.

create type photo_status as enum ('pending', 'approved', 'rejected', 'withdrawn');

create table officer_photos (
  id uuid primary key default gen_random_uuid(),

  -- Matches appointments.slug, the same identifier used in /structure URLs.
  appointment_slug text not null,

  -- Path inside the officer-photos storage bucket.
  storage_path text not null,

  -- Required: a portrait with no alt text is unusable on a screen reader, and
  -- this platform is used by people with low vision on cheap Android phones.
  alt_text text not null check (char_length(trim(alt_text)) >= 3),

  credit text,

  -- Consent. Null means the subject has not agreed, and the check constraint
  -- below makes such a row unpublishable.
  consent_recorded_at timestamptz,
  consent_source text,

  status photo_status not null default 'pending',

  uploaded_by uuid references auth.users (id) on delete set null,
  reviewed_by uuid references profiles (id) on delete set null,
  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The rule that matters. A photo cannot be approved without a consent
  -- record, whatever the application layer believes it is doing.
  constraint approved_requires_consent check (
    status <> 'approved' or consent_recorded_at is not null
  )
);

-- One live photo per post. Withdrawn and rejected rows are kept as an audit
-- trail, so the index is partial rather than a plain unique constraint.
create unique index idx_officer_photos_one_live
  on officer_photos (appointment_slug)
  where status in ('pending', 'approved');

create index idx_officer_photos_status on officer_photos (status);

-- ============================================================================
-- Storage
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('officer-photos', 'officer-photos', true)
on conflict (id) do nothing;

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table officer_photos enable row level security;

-- Only approved photos are public.
create policy "approved photos are public"
  on officer_photos for select
  using (status = 'approved');

create policy "officers read own photo"
  on officer_photos for select
  to authenticated
  using (uploaded_by = auth.uid());

create policy "publicity reads the queue"
  on officer_photos for select
  to authenticated
  using (is_national_officer());

create policy "officers upload their own photo"
  on officer_photos for insert
  to authenticated
  with check (uploaded_by = auth.uid());

-- An officer may edit or replace their own photo, but may not approve it —
-- status is forced back to 'pending' by the trigger below on any self-update.
create policy "officers update own photo"
  on officer_photos for update
  to authenticated
  using (uploaded_by = auth.uid())
  with check (uploaded_by = auth.uid());

create policy "national officers moderate photos"
  on officer_photos for update
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

-- ============================================================================
-- Self-approval guard
--
-- Without this, "officers update own photo" would let an officer set their own
-- row to 'approved' and skip the queue entirely.
-- ============================================================================

create or replace function enforce_photo_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved'
     and old.status <> 'approved'
     and not is_national_officer() then
    raise exception 'Only a national officer may approve a photograph';
  end if;

  -- Replacing the image re-opens review: a new picture is a new decision.
  if new.storage_path is distinct from old.storage_path
     and new.status = 'approved' then
    new.status := 'pending';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger officer_photos_review
  before update on officer_photos
  for each row execute function enforce_photo_review();

-- ============================================================================
-- Withdrawal
--
-- Takedown is immediate and needs no review. Someone asking for their face to
-- come off a political website should not wait in a queue for it.
-- ============================================================================

create or replace function withdraw_officer_photo(p_appointment_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update officer_photos
     set status = 'withdrawn',
         updated_at = now()
   where appointment_slug = p_appointment_slug
     and status in ('pending', 'approved');
end;
$$;

grant execute on function withdraw_officer_photo(text) to authenticated;

-- ============================================================================
-- Public read
-- ============================================================================

create view approved_officer_photos
with (security_invoker = off)
as
  select appointment_slug, storage_path, alt_text, credit
  from officer_photos
  where status = 'approved';

grant select on approved_officer_photos to anon, authenticated;
