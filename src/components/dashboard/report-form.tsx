"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Mirrors the movement's existing weekly template — Lead Officer, Position,
 * Support Officer, Position, KPIs, Date — so officers recognise the form,
 * plus the counts that feed the quarterly scorecard.
 */
const reportSchema = z.object({
  leadOfficer: z.string().trim().min(3, "Enter the lead officer's name"),
  leadPosition: z.string().trim().min(2, "Enter their position"),
  supportOfficer: z.string().trim().optional(),
  supportPosition: z.string().trim().optional(),
  topicHandled: z.string().trim().optional(),
  activitySummary: z
    .string()
    .trim()
    .min(20, "Summarise what was actually done this week"),
  meetingsHeld: z.number().int().min(0, "Cannot be negative"),
  meetingAttendancePct: z
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100"),
  newMembers: z.number().int().min(0, "Cannot be negative"),
  structuresCreated: z.number().int().min(0, "Cannot be negative"),
  narrative: z.string().trim().optional(),
  evidenceUrl: z.string().trim().url("Enter a valid link").or(z.literal("")),
});

type ReportValues = z.infer<typeof reportSchema>;

/**
 * Number inputs hand back strings. Converting here rather than through
 * z.coerce keeps the form's value type honestly numeric.
 */
function numberFieldProps(field: {
  value: number;
  onChange: (value: number) => void;
}) {
  return {
    value: Number.isNaN(field.value) ? "" : field.value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      field.onChange(e.target.value === "" ? 0 : e.target.valueAsNumber),
  };
}

export function ReportForm({
  appointmentId,
  periodId,
  periodLabel,
  defaultLeadOfficer,
  defaultLeadPosition,
}: {
  appointmentId: string;
  periodId: string | null;
  periodLabel: string | null;
  defaultLeadOfficer: string;
  defaultLeadPosition: string;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftKey = `nokm:report-draft:${appointmentId}:${periodId ?? "none"}`;

  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      leadOfficer: defaultLeadOfficer,
      leadPosition: defaultLeadPosition,
      supportOfficer: "",
      supportPosition: "",
      topicHandled: "",
      activitySummary: "",
      meetingsHeld: 0,
      meetingAttendancePct: 100,
      newMembers: 0,
      structuresCreated: 0,
      narrative: "",
      evidenceUrl: "",
    },
  });

  // Officers file these from the field, often on a weak signal.
  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey);
    if (saved) {
      try {
        form.reset({ ...form.getValues(), ...JSON.parse(saved) });
      } catch {
        window.localStorage.removeItem(draftKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      window.localStorage.setItem(draftKey, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  if (!periodId) {
    return (
      <div className="rounded-lg border p-6">
        <p className="font-medium">No reporting period is open</p>
        <p className="text-muted-foreground pt-1 text-sm">
          The National Secretary opens each week&apos;s reporting period. Check
          back once this week&apos;s is published.
        </p>
      </div>
    );
  }

  async function onSubmit(values: ReportValues) {
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.from("reports").upsert(
      {
        appointment_id: appointmentId,
        period_id: periodId,
        lead_officer: values.leadOfficer,
        lead_position: values.leadPosition,
        support_officer: values.supportOfficer || null,
        support_position: values.supportPosition || null,
        topic_handled: values.topicHandled || null,
        activity_summary: values.activitySummary,
        meetings_held: values.meetingsHeld,
        meeting_attendance_pct: values.meetingAttendancePct,
        new_members: values.newMembers,
        structures_created: values.structuresCreated,
        narrative: values.narrative || null,
        evidence_url: values.evidenceUrl || null,
      },
      { onConflict: "appointment_id,period_id" }
    );

    if (error) {
      setError(
        "That didn't save. Your entries are kept on this device — try again when you have signal."
      );
      return;
    }
    window.localStorage.removeItem(draftKey);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="border-brand-green/40 bg-brand-green/5 rounded-lg border p-6">
        <p className="font-display text-lg font-semibold">Report submitted</p>
        <p className="text-muted-foreground pt-1 text-sm">
          Filed for {periodLabel}. It now counts towards your reporting
          compliance score.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setSaved(false)}
        >
          Edit this report
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <p className="text-muted-foreground text-sm">
          Reporting period:{" "}
          <span className="text-foreground font-medium">{periodLabel}</span>
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="leadOfficer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead officer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position in NOkM</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supportOfficer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Support officer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supportPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Their position</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="topicHandled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic handled</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The training or lecture topic for your scheduled day.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activitySummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What was done this week</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="newMembers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New members registered</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    {...numberFieldProps(field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="structuresCreated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Structures created</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    {...numberFieldProps(field)}
                  />
                </FormControl>
                <FormDescription>
                  Posts filled below you this week.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingsHeld"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meetings held</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    {...numberFieldProps(field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingAttendancePct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendance %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    {...numberFieldProps(field)}
                  />
                </FormControl>
                <FormDescription>Minimum expected is 90%.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="narrative"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenges and recommendations</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormDescription>
                What is blocking you, and what would unblock it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evidenceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evidence link (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting…" : "Submit report"}
        </Button>
      </form>
    </Form>
  );
}
