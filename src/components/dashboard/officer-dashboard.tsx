"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackendNotice } from "@/components/shared/backend-notice";
import { OfficerSignIn } from "@/components/dashboard/officer-sign-in";
import { ReportForm } from "@/components/dashboard/report-form";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { generalKpis } from "@/lib/kpis";
import { appointmentBySlug } from "@/lib/structure";
import { dayFor } from "@/lib/rhythm";

interface AppointmentRow {
  id: string;
  slug: string;
  scope_type: string;
  scope_code: string | null;
  holder_name: string | null;
  offices: { title: string; short_title: string } | null;
}

interface PeriodRow {
  id: string;
  label: string;
  ends_on: string;
}

interface SnapshotRow {
  scores: Record<string, number>;
  composite: number | null;
}

interface DirectiveRow {
  id: string;
  title: string;
  body: string;
  issued_by_office: string | null;
  published_at: string;
  ack_required: boolean;
}

export function OfficerDashboard() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentRow | null>(null);
  const [period, setPeriod] = useState<PeriodRow | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotRow | null>(null);
  const [directives, setDirectives] = useState<DirectiveRow[]>([]);
  const [ackedIds, setAckedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = await getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSignedIn(false);
        return;
      }
      setSignedIn(true);

      const today = new Date().toISOString().slice(0, 10);

      const [appointmentRes, periodRes, directiveRes] = await Promise.all([
        supabase
          .from("appointments")
          .select(
            "id, slug, scope_type, scope_code, holder_name, offices(title, short_title)"
          )
          .eq("profile_id", user.id)
          .is("ended_at", null)
          .maybeSingle(),
        supabase
          .from("reporting_periods")
          .select("id, label, ends_on")
          .eq("kind", "weekly")
          .lte("starts_on", today)
          .gte("ends_on", today)
          .maybeSingle(),
        supabase
          .from("directives")
          .select("id, title, body, issued_by_office, published_at, ack_required")
          .order("published_at", { ascending: false })
          .limit(10),
      ]);

      const appt = appointmentRes.data as AppointmentRow | null;
      setAppointment(appt);
      setPeriod(periodRes.data as PeriodRow | null);
      setDirectives((directiveRes.data ?? []) as DirectiveRow[]);

      if (appt) {
        const [snapshotRes, ackRes] = await Promise.all([
          supabase
            .from("kpi_snapshots")
            .select("scores, composite")
            .eq("appointment_id", appt.id)
            .order("computed_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("directive_acks")
            .select("directive_id")
            .eq("appointment_id", appt.id),
        ]);
        setSnapshot(snapshotRes.data as SnapshotRow | null);
        setAckedIds(
          new Set(
            ((ackRes.data ?? []) as { directive_id: string }[]).map(
              (r) => r.directive_id
            )
          )
        );
      }
    } catch {
      setError("Could not load your dashboard. Check your connection.");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }
    void load();
  }, [load]);

  async function acknowledge(directiveId: string) {
    if (!appointment) return;
    const supabase = await getSupabase();
    const { error } = await supabase.from("directive_acks").insert({
      directive_id: directiveId,
      appointment_id: appointment.id,
    });
    if (!error) {
      setAckedIds(new Set([...ackedIds, directiveId]));
    }
  }

  async function signOut() {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setSignedIn(false);
    setAppointment(null);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <BackendNotice action="The officer dashboard" />
        <p className="text-muted-foreground text-sm leading-relaxed">
          When it goes live, every officer will submit their weekly report here
          instead of by message, and see their own quarterly scorecard against
          the ten general executive KPIs.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/rhythm">See the reporting template</Link>
        </Button>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!signedIn) {
    return <OfficerSignIn onSignedIn={load} />;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          Try again
        </Button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="rounded-lg border p-6">
        <h2 className="font-display text-lg font-semibold">
          No appointment found for this number
        </h2>
        <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
          This dashboard is for officers holding a post in the movement. If you
          have been appointed but cannot get in, the phone number recorded
          against your appointment may differ from the one you used — contact
          the National Secretary through the structure directory.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild size="sm" variant="outline">
            <Link href="/structure/national-secretary">
              Contact the National Secretary
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const officeTitle = appointment.offices?.title ?? "Officer";
  const seeded = appointmentBySlug(appointment.slug);
  const scopeLabel = seeded?.scopeLabel ?? appointment.scope_code ?? "National";
  const todayRhythm = dayFor(new Date().getDay());
  const unacked = directives.filter(
    (d) => d.ack_required && !ackedIds.has(d.id)
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {scopeLabel}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {officeTitle}
          </h1>
          {appointment.holder_name && (
            <p className="text-muted-foreground pt-1 text-sm">
              {appointment.holder_name}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="overview" className="pt-6">
        <TabsList>
          <TabsTrigger value="overview">This week</TabsTrigger>
          <TabsTrigger value="report">Submit report</TabsTrigger>
          <TabsTrigger value="scorecard">My scorecard</TabsTrigger>
          <TabsTrigger value="directives">
            Directives
            {unacked.length > 0 && (
              <Badge className="bg-brand-red ml-1.5">{unacked.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Reporting period
            </p>
            {period ? (
              <>
                <p className="font-display pt-1 text-lg font-semibold">
                  {period.label}
                </p>
                <p className="text-muted-foreground pt-1 text-sm">
                  Closes {new Date(period.ends_on).toLocaleDateString()}.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground pt-1 text-sm">
                No period is currently open.
              </p>
            )}
          </div>

          {todayRhythm && (
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Today — {todayRhythm.day}
              </p>
              <p className="pt-1 font-medium">{todayRhythm.focus}</p>
              <p className="text-muted-foreground pt-1 text-sm">
                {todayRhythm.deliverable}
              </p>
            </div>
          )}

          {unacked.length > 0 && (
            <div className="border-brand-red/40 bg-brand-red/5 rounded-lg border p-4">
              <p className="font-medium">
                {unacked.length} directive{unacked.length > 1 ? "s" : ""} awaiting
                your acknowledgement
              </p>
              <p className="text-muted-foreground pt-1 text-sm">
                Communication responsiveness is one of your ten KPIs.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="report" className="pt-4">
          <ReportForm
            appointmentId={appointment.id}
            periodId={period?.id ?? null}
            periodLabel={period?.label ?? null}
            defaultLeadOfficer={appointment.holder_name ?? ""}
            defaultLeadPosition={officeTitle}
          />
        </TabsContent>

        <TabsContent value="scorecard" className="space-y-4 pt-4">
          {snapshot ? (
            <>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Composite score
                </p>
                <p className="font-display text-brand-blue pt-1 text-4xl font-bold tabular-nums">
                  {snapshot.composite ?? "—"}
                </p>
                <p className="text-muted-foreground pt-2 text-sm">
                  {officeTitle} · {scopeLabel}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  data-print-hide
                  onClick={() => window.print()}
                >
                  Print this scorecard
                </Button>
              </div>
              <div className="space-y-3">
                {generalKpis.map((kpi) => {
                  const score = snapshot.scores?.[kpi.slug];
                  return (
                    <div key={kpi.slug} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">{kpi.label}</p>
                        <p className="text-sm tabular-nums">
                          {typeof score === "number" ? `${score}%` : "Not scored"}
                        </p>
                      </div>
                      {typeof score === "number" && (
                        <Progress value={score} className="mt-2" />
                      )}
                      {kpi.threshold && (
                        <p className="text-muted-foreground pt-1.5 text-xs">
                          Minimum expected: {kpi.threshold}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-lg border p-6">
              <p className="font-medium">No scorecard yet</p>
              <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                Scorecards are computed at the end of each quarter from the
                reports you file. Submit weekly and yours will build itself.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="directives" className="space-y-3 pt-4">
          {directives.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No directives have been issued yet.
            </p>
          ) : (
            directives.map((directive) => {
              const acked = ackedIds.has(directive.id);
              return (
                <div key={directive.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-balance">
                      {directive.title}
                    </h3>
                    {acked && <Badge variant="secondary">Acknowledged</Badge>}
                  </div>
                  <p className="text-muted-foreground pt-1 text-xs">
                    {directive.issued_by_office ?? "National leadership"} ·{" "}
                    {new Date(directive.published_at).toLocaleDateString()}
                  </p>
                  <p className="pt-2 text-sm leading-relaxed whitespace-pre-line">
                    {directive.body}
                  </p>
                  {directive.ack_required && !acked && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => acknowledge(directive.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
