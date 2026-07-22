"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface ScoreboardRow {
  state_code: string;
  state_name: string;
  zone_code: string;
  members: number;
  members_with_pvc: number;
  reports_submitted: number;
  structures_created: number;
}

/**
 * Live membership and reporting figures. Every number is read from the
 * database — there is no seeded or illustrative data behind this table.
 */
export function LiveScoreboard() {
  const [rows, setRows] = useState<ScoreboardRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("state_scoreboard")
          .select("*")
          .order("members", { ascending: false });
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setRows((data ?? []) as ScoreboardRow[]);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <BackendNotice action="Live membership and reporting figures" />;
  }

  if (failed) {
    return (
      <p className="text-muted-foreground text-sm">
        Live figures could not be loaded. Check your connection and refresh.
      </p>
    );
  }

  if (!rows) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const ranked = rows.filter((r) => r.members > 0);

  if (ranked.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">No members registered yet</p>
        <p className="text-muted-foreground pt-1 text-sm">
          The first state to register a member takes the top of this table.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right">Members</TableHead>
            <TableHead className="text-right">With PVC</TableHead>
            <TableHead className="text-right">Reports</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranked.map((row, i) => (
            <TableRow key={row.state_code}>
              <TableCell className="text-muted-foreground tabular-nums">
                {i + 1}
              </TableCell>
              <TableCell className="font-medium">{row.state_name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.members.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.members_with_pvc.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.reports_submitted.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
