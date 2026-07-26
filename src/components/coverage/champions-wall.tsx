"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { statesByCode } from "@/lib/geo";

interface ChampionRow {
  first_name: string;
  state_code: string;
  lga_code: string;
  created_at: string;
}

/** "FC-bwari" → "Bwari". */
function lgaName(code: string): string {
  const part = code.split("-").slice(1).join("-");
  return part
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function since(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 90) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/**
 * The wall of champions.
 *
 * First name and LGA only — that is all the `recent_champions` view exposes.
 * A public list of who is standing at which unit, with a surname attached,
 * would be a targeting aid in a country where that matters.
 */
export function ChampionsWall() {
  const [rows, setRows] = useState<ChampionRow[] | null>(null);

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
          .from("recent_champions")
          .select("first_name, state_code, lga_code, created_at");
        if (!cancelled) setRows((data ?? []) as ChampionRow[]);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <Trophy className="text-muted-foreground mx-auto size-8" />
        <p className="font-display pt-3 text-lg font-bold">
          Nobody has claimed a unit yet.
        </p>
        <p className="text-muted-foreground mx-auto max-w-md pt-2 text-sm leading-relaxed">
          {isSupabaseConfigured
            ? "This wall fills up as members claim the polling units where they vote. Be the first name on it."
            : "This wall goes live with the member database. Until then, tell us on WhatsApp which unit you are standing for."}
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link href="/coverage/adopt">Take the first one</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-xl border">
      {rows.map((row, i) => (
        <li key={`${row.lga_code}-${i}`} className="flex items-center gap-3 px-4 py-3">
          <span className="bg-brand-green/10 text-brand-green font-display flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
            {row.first_name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">
              {row.first_name} took a unit in {lgaName(row.lga_code)}
            </span>
            <span className="text-muted-foreground block text-xs">
              {statesByCode.get(row.state_code)?.name ?? row.state_code}
            </span>
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">
            {since(row.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
