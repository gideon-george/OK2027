"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/shared/stat-tile";
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { statesByCode } from "@/lib/geo";

interface PvcRow {
  state_code: string;
  members: number;
  have_pvc: number;
  awaiting_collection: number;
  not_registered: number;
}

/**
 * Live PVC progress, computed from members.pvc_status. Records only whether a
 * member holds a card — never a PVC number or VIN.
 */
export function PvcTracker() {
  const [rows, setRows] = useState<PvcRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.from("pvc_progress").select("*");
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setRows((data ?? []) as PvcRow[]);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <BackendNotice action="Live PVC progress" />;
  }

  if (failed) {
    return (
      <p className="text-muted-foreground text-sm">
        PVC figures could not be loaded. Check your connection and refresh.
      </p>
    );
  }

  if (!rows) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      members: acc.members + r.members,
      have: acc.have + r.have_pvc,
      awaiting: acc.awaiting + r.awaiting_collection,
      none: acc.none + r.not_registered,
    }),
    { members: 0, have: 0, awaiting: 0, none: 0 }
  );

  if (totals.members === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">No PVC data yet</p>
        <p className="text-muted-foreground pt-1 text-sm">
          These figures fill in as members register and record their PVC status.
        </p>
      </div>
    );
  }

  const pct = Math.round((totals.have / totals.members) * 100);
  const ranked = [...rows]
    .filter((r) => r.members > 0)
    .sort((a, b) => b.have_pvc / b.members - a.have_pvc / a.members);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline justify-between pb-2">
          <p className="text-sm font-medium">Members with a PVC in hand</p>
          <p className="font-display text-brand-green text-2xl font-bold tabular-nums">
            {pct}%
          </p>
        </div>
        <Progress value={pct} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={totals.members.toLocaleString()} label="Members" />
        <StatTile
          tone="green"
          value={totals.have.toLocaleString()}
          label="Have their PVC"
        />
        <StatTile
          value={totals.awaiting.toLocaleString()}
          label="Awaiting collection"
        />
        <StatTile
          tone="red"
          value={totals.none.toLocaleString()}
          label="Not registered"
        />
      </div>

      <div>
        <h3 className="font-display pb-3 text-lg font-semibold">
          By state
        </h3>
        <div className="space-y-2">
          {ranked.map((row) => {
            const statePct = Math.round((row.have_pvc / row.members) * 100);
            return (
              <div key={row.state_code} className="rounded-lg border p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {statesByCode.get(row.state_code)?.name ?? row.state_code}
                  </p>
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {row.have_pvc}/{row.members}
                  </p>
                </div>
                <Progress value={statePct} className="mt-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
