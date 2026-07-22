-- NOkM reporting, KPIs, directives and the action plan.
--
-- Turns the movement's existing paper practices into a record: the weekly
-- report template, the ten quarterly executive KPIs, national directives, and
-- the 6-Month Victory Action Plan.
--
-- The point of this migration is that "replace non-performing executives"
-- becomes a decision against a record rather than an impression.

-- ============================================================================
-- Enums
-- ============================================================================

create type reporting_period_kind as enum ('weekly', 'monthly', 'quarterly');

create type action_item_status as enum (
  'not_started',
  'in_progress',
  'blocked',
  'done'
);

-- ============================================================================
-- Reporting periods
-- ============================================================================

create table reporting_periods (
  id uuid primary key default gen_random_uuid(),
  kind reporting_period_kind not null,
  label text not null,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  unique (kind, starts_on)
);

create index idx_reporting_periods_dates on reporting_periods (starts_on, ends_on);

-- ============================================================================
-- Weekly reports
--
-- Column names mirror the movement's existing WhatsApp template so officers
-- recognise the form: Lead Officer, Position, Support Officer, Position,
-- KPIs, Date.
-- ============================================================================

create table reports (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  period_id uuid not null references reporting_periods (id) on delete restrict,
  lead_officer text not null,
  lead_position text not null,
  support_officer text,
  support_position text,
  topic_handled text,
  activity_summary text not null,
  meetings_held integer not null default 0 check (meetings_held >= 0),
  meeting_attendance_pct numeric(5, 2) check (
    meeting_attendance_pct between 0 and 100
  ),
  new_members integer not null default 0 check (new_members >= 0),
  structures_created integer not null default 0 check (structures_created >= 0),
  narrative text,
  evidence_url text,
  submitted_by uuid references profiles (id) on delete set null,
  submitted_at timestamptz not null default now(),
  -- One report per post per period. Re-submitting updates the existing row.
  unique (appointment_id, period_id)
);

create index idx_reports_appointment_id on reports (appointment_id);
create index idx_reports_period_id on reports (period_id);

-- ============================================================================
-- KPI snapshots
--
-- scores is the ten general executive KPIs, each 0-100, keyed by slug:
--   membership_growth, structural_expansion, programme_delivery,
--   meeting_attendance, reporting_compliance, communication_responsiveness,
--   financial_accountability, conflict_resolution, leadership_performance,
--   ethical_compliance
-- ============================================================================

create table kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  period_id uuid not null references reporting_periods (id) on delete cascade,
  scores jsonb not null default '{}'::jsonb,
  composite numeric(5, 2) check (composite between 0 and 100),
  computed_at timestamptz not null default now(),
  unique (appointment_id, period_id)
);

create index idx_kpi_snapshots_appointment_id on kpi_snapshots (appointment_id);

-- ============================================================================
-- Directives and acknowledgement
-- ============================================================================

create table directives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  issued_by uuid references profiles (id) on delete set null,
  issued_by_office text,
  level office_scope_level not null default 'national',
  ack_required boolean not null default true,
  published_at timestamptz not null default now()
);

create index idx_directives_published_at on directives (published_at desc);

create table directive_acks (
  id uuid primary key default gen_random_uuid(),
  directive_id uuid not null references directives (id) on delete cascade,
  appointment_id uuid not null references appointments (id) on delete cascade,
  acked_at timestamptz not null default now(),
  unique (directive_id, appointment_id)
);

create index idx_directive_acks_appointment_id on directive_acks (appointment_id);

-- ============================================================================
-- 6-Month Victory Action Plan
-- ============================================================================

create table action_plan_items (
  id uuid primary key default gen_random_uuid(),
  phase text not null,
  week_no integer not null check (week_no >= 1),
  day_no integer check (day_no between 1 and 31),
  title text not null,
  description text,
  owner_office_id uuid references offices (id) on delete set null,
  deliverable text,
  status action_item_status not null default 'not_started',
  due_on date,
  updated_by uuid references profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create index idx_action_plan_items_week on action_plan_items (week_no);
create index idx_action_plan_items_status on action_plan_items (status);

-- ============================================================================
-- Roll-ups
--
-- Coverage and performance aggregated per state. Exposed publicly as counts
-- only — never individual members or individual report contents.
-- ============================================================================

create view state_scoreboard
with (security_invoker = off)
as
  select
    s.code as state_code,
    s.name as state_name,
    z.code as zone_code,
    coalesce(m.members, 0) as members,
    coalesce(m.members_with_pvc, 0) as members_with_pvc,
    coalesce(r.reports_submitted, 0) as reports_submitted,
    coalesce(r.new_members_reported, 0) as new_members_reported,
    coalesce(r.structures_created, 0) as structures_created
  from states s
  join zones z on z.id = s.zone_id
  left join (
    select
      state_code,
      count(*)::bigint as members,
      count(*) filter (where has_pvc)::bigint as members_with_pvc
    from members
    group by state_code
  ) m on m.state_code = s.code
  left join (
    select
      a.scope_code,
      count(*)::bigint as reports_submitted,
      sum(rep.new_members)::bigint as new_members_reported,
      sum(rep.structures_created)::bigint as structures_created
    from reports rep
    join appointments a on a.id = rep.appointment_id
    where a.scope_type = 'state'
    group by a.scope_code
  ) r on r.scope_code = s.code;

grant select on state_scoreboard to anon, authenticated;

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table reporting_periods enable row level security;
alter table reports enable row level security;
alter table kpi_snapshots enable row level security;
alter table directives enable row level security;
alter table directive_acks enable row level security;
alter table action_plan_items enable row level security;

-- Periods and the action plan are public: members should be able to see what
-- the movement has committed to and whether it is on schedule.
create policy "reporting periods are public"
  on reporting_periods for select
  using (true);

create policy "national officers manage reporting periods"
  on reporting_periods for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

create policy "action plan is public"
  on action_plan_items for select
  using (true);

create policy "officers update action plan"
  on action_plan_items for update
  to authenticated
  using (is_officer())
  with check (is_officer());

create policy "national officers manage action plan"
  on action_plan_items for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

-- Reports are internal. An officer reads and writes their own; national
-- officers read everything.
create policy "officers read own reports"
  on reports for select
  to authenticated
  using (
    is_national_officer()
    or appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  );

create policy "officers submit own reports"
  on reports for insert
  to authenticated
  with check (
    appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  );

create policy "officers update own reports"
  on reports for update
  to authenticated
  using (
    appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  )
  with check (
    appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  );

-- Scorecards: an officer sees their own; national officers see all.
create policy "officers read own kpi snapshots"
  on kpi_snapshots for select
  to authenticated
  using (
    is_national_officer()
    or appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  );

create policy "national officers manage kpi snapshots"
  on kpi_snapshots for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

-- Directives are readable by every officer and issued by national officers.
create policy "officers read directives"
  on directives for select
  to authenticated
  using (is_officer());

create policy "national officers issue directives"
  on directives for all
  to authenticated
  using (is_national_officer())
  with check (is_national_officer());

create policy "officers read own acks"
  on directive_acks for select
  to authenticated
  using (
    is_national_officer()
    or appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  );

create policy "officers acknowledge directives"
  on directive_acks for insert
  to authenticated
  with check (
    appointment_id in (
      select id from appointments
      where profile_id = auth.uid() and ended_at is null
    )
  );
