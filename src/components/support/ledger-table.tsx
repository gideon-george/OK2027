"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface LedgerRow {
  period_month: string;
  direction: "received" | "spent";
  category: string;
  total_naira: number;
}

function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function monthLabel(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The published ledger.
 *
 * Only rows the National Treasurer has marked `published` are visible — the
 * `ledger_monthly` view filters on it, so an unfinished month cannot leak.
 */
export function LedgerTable() {
  const [rows, setRows] = useState<LedgerRow[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setRows([]);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const supabase = await getSupabase();
        const { data } = await supabase
          .from("ledger_monthly")
          .select("period_month, direction, category, total_naira");
        if (!cancelled) setRows((data ?? []) as LedgerRow[]);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-display text-lg font-bold">Nothing to report yet.</p>
        <p className="text-muted-foreground mx-auto max-w-md pt-2 text-sm leading-relaxed">
          The movement has not yet published a month of accounts. When cash
          support opens, every naira in and out appears here, by category,
          signed off by the National Treasurer.
        </p>
        <p className="text-muted-foreground pt-3 text-xs">
          An empty ledger is an honest ledger. It will not stay empty once money
          starts moving.
        </p>
      </div>
    );
  }

  // Group by month, newest first.
  const months = Array.from(new Set(rows.map((r) => r.period_month)));

  return (
    <div className="space-y-6">
      {months.map((month) => {
        const inRows = rows.filter(
          (r) => r.period_month === month && r.direction === "received"
        );
        const outRows = rows.filter(
          (r) => r.period_month === month && r.direction === "spent"
        );
        const totalIn = inRows.reduce((a, r) => a + r.total_naira, 0);
        const totalOut = outRows.reduce((a, r) => a + r.total_naira, 0);

        return (
          <div key={month} className="rounded-xl border">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-3">
              <h2 className="font-display font-bold">{monthLabel(month)}</h2>
              <p className="text-sm tabular-nums">
                <span className="text-brand-green font-semibold">
                  +{naira(totalIn)}
                </span>
                <span className="text-muted-foreground px-2">·</span>
                <span className="text-brand-red font-semibold">
                  −{naira(totalOut)}
                </span>
              </p>
            </div>
            <div className="grid gap-6 p-5 sm:grid-cols-2">
              {(
                [
                  ["Received", inRows, "text-brand-green"],
                  ["Spent", outRows, "text-brand-red"],
                ] as const
              ).map(([heading, list, tone]) => (
                <div key={heading}>
                  <p className="eyebrow text-muted-foreground/70 pb-2">
                    {heading}
                  </p>
                  {list.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nothing.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {list.map((r) => (
                        <li
                          key={`${r.category}-${r.direction}`}
                          className="flex items-baseline justify-between gap-3 text-sm"
                        >
                          <span>{r.category}</span>
                          <span className={`font-medium tabular-nums ${tone}`}>
                            {naira(r.total_naira)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
