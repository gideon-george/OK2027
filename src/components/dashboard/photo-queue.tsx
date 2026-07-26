"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase/client";
import { supabaseUrl } from "@/lib/supabase/config";
import { appointmentBySlug } from "@/lib/structure";

interface QueueRow {
  id: string;
  appointment_slug: string;
  storage_path: string;
  alt_text: string;
  consent_recorded_at: string | null;
  status: string;
  created_at: string;
}

/**
 * The approval queue, for National Publicity and the National Secretary.
 *
 * Row-level security decides who may approve; this component only shows what
 * the signed-in officer is allowed to see, so a state officer opening it gets
 * an empty queue rather than an error.
 */
export function PhotoQueue() {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const supabase = await getSupabase();
      const { data, error: queryError } = await supabase
        .from("officer_photos")
        .select(
          "id, appointment_slug, storage_path, alt_text, consent_recorded_at, status, created_at"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (queryError) throw queryError;
      setRows((data ?? []) as QueueRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the queue.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(row: QueueRow, status: "approved" | "rejected") {
    setBusyId(row.id);
    setError(null);
    try {
      const supabase = await getSupabase();
      const { error: updateError } = await supabase
        .from("officer_photos")
        .update({ status })
        .eq("id", row.id);
      if (updateError) throw updateError;
      setRows((current) => current?.filter((r) => r.id !== row.id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that decision.");
    } finally {
      setBusyId(null);
    }
  }

  if (rows === null) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border p-4 text-sm">
        {error ?? "No portraits are waiting for approval."}
      </p>
    );
  }

  const base = `${supabaseUrl}/storage/v1/object/public/officer-photos/`;

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {rows.map((row) => {
        const appointment = appointmentBySlug(row.appointment_slug);
        return (
          <div
            key={row.id}
            className="flex flex-wrap items-start gap-4 rounded-lg border p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}${row.storage_path}`}
              alt={row.alt_text}
              className="aspect-[4/5] w-20 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-[12rem] flex-1">
              <p className="text-sm font-medium">
                {appointment?.holderName ?? row.appointment_slug}
              </p>
              <p className="text-muted-foreground text-xs">
                {appointment?.office.title}
                {appointment && appointment.scopeLabel !== "National"
                  ? ` · ${appointment.scopeLabel}`
                  : ""}
              </p>
              <p className="text-muted-foreground pt-1.5 text-xs italic">
                &ldquo;{row.alt_text}&rdquo;
              </p>
              <Badge
                variant="outline"
                className={
                  row.consent_recorded_at
                    ? "border-brand-green/40 text-brand-green mt-2 text-[0.65rem]"
                    : "border-brand-red/40 text-brand-red mt-2 text-[0.65rem]"
                }
              >
                {row.consent_recorded_at
                  ? "Consent recorded"
                  : "No consent — cannot be approved"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={busyId === row.id || !row.consent_recorded_at}
                onClick={() => decide(row, "approved")}
              >
                {busyId === row.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === row.id}
                onClick={() => decide(row, "rejected")}
              >
                <X className="size-3.5" /> Reject
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
