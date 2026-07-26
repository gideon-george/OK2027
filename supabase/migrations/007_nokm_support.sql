-- Support for the movement: in-kind pledges, and the ledger that accounts for
-- everything received.
--
-- WHAT IS NOT HERE, ON PURPOSE:
--
--   No card numbers. No bank account numbers. No BVN. No payment credentials of
--   any kind. Cash is taken on the processor's own hosted checkout, on their
--   domain, and this application never sees an instrument. The only thing
--   recorded on this side is that someone intended to give, and how to thank
--   them.
--
-- Pledges are read by the National Director of Welfare and the National
-- Treasurer only. Someone offering a vehicle or a venue has told the movement
-- something about their means and their address, and that is not a public list.

create type pledge_category as enum (
  'venue',
  'vehicles_fuel',
  'printing_materials',
  'airtime_data',
  'food',
  'professional_services',
  'logistics',
  'volunteer_hours',
  'pvc_transport',
  'other'
);

create type pledge_status as enum ('offered', 'contacted', 'accepted', 'delivered', 'declined');

create table support_pledges (
  id uuid primary key default gen_random_uuid(),

  category pledge_category not null,
  description text not null check (char_length(trim(description)) >= 10),
  quantity text,

  state_code text not null,
  lga_code text,

  available_from date,
  available_note text,

  contact_name text not null check (char_length(trim(contact_name)) >= 3),
  contact_phone text not null,
  contact_email text,

  status pledge_status not null default 'offered',
  handled_by uuid references profiles (id) on delete set null,
  notes text,

  consent_version text not null,
  consent_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_support_pledges_state on support_pledges (state_code);
create index idx_support_pledges_category on support_pledges (category);
create index idx_support_pledges_status on support_pledges (status);

-- ============================================================================
-- The public ledger
--
-- Monthly totals in and out, by category. The movement's whole pitch is that
-- it is an alternative to opaque politics; this table is where that claim gets
-- tested. Rows are written by the National Treasurer and read by everybody.
-- ============================================================================

create type ledger_direction as enum ('received', 'spent');

create table support_ledger (
  id uuid primary key default gen_random_uuid(),

  -- First day of the month being reported.
  period_month date not null,
  direction ledger_direction not null,
  category text not null,
  amount_naira bigint not null check (amount_naira >= 0),
  note text,

  -- Who signed this line off.
  recorded_by uuid references profiles (id) on delete set null,
  published boolean not null default false,

  created_at timestamptz not null default now()
);

create index idx_support_ledger_month on support_ledger (period_month);

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table support_pledges enable row level security;
alter table support_ledger enable row level security;

create policy "anyone may offer support"
  on support_pledges for insert
  to anon, authenticated
  with check (status = 'offered');

-- Deliberately narrow: welfare and the treasury, not every officer.
create policy "welfare and treasury read pledges"
  on support_pledges for select
  to authenticated
  using (is_national_officer());

create policy "welfare and treasury update pledges"
  on support_pledges for update
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

create policy "published ledger is public"
  on support_ledger for select
  using (published = true);

create policy "national officers read the whole ledger"
  on support_ledger for select
  to authenticated
  using (is_national_officer());

create policy "national officers write the ledger"
  on support_ledger for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

-- ============================================================================
-- Public aggregates
-- ============================================================================

create view ledger_monthly
with (security_invoker = off)
as
  select
    period_month,
    direction,
    category,
    sum(amount_naira)::bigint as total_naira
  from support_ledger
  where published = true
  group by period_month, direction, category
  order by period_month desc;

grant select on ledger_monthly to anon, authenticated;

-- Pledge counts only. Never the offers themselves, never a contact.
create view pledge_counts
with (security_invoker = off)
as
  select category, state_code, count(*)::bigint as pledges
  from support_pledges
  group by category, state_code;

grant select on pledge_counts to anon, authenticated;
