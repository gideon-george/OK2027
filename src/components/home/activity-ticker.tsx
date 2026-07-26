"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { useDataLight } from "@/components/shared/data-light";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { statesByCode } from "@/lib/geo";

interface ChampionRow {
  first_name: string;
  state_code: string;
  lga_code: string;
  created_at: string;
}

function lgaName(code: string): string {
  return code
    .split("-")
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * The pulse of the movement.
 *
 * First names and place names only — the `recent_champions` view exposes
 * nothing else. Never a surname, never a phone, never a unit label.
 *
 * Renders nothing when there is no real activity to show. A ticker of invented
 * events would be the single most corrosive thing that could go on this page:
 * every other number here is defensible, and one fake scroll of names would
 * make a reader doubt all of them.
 */
export function ActivityTicker() {
  const { lite } = useDataLight();
  const [rows, setRows] = useState<ChampionRow[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured || lite) return;
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
        /* the page is complete without it */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lite]);

  if (lite || rows.length < 3) return null;

  const items = rows.slice(0, 12);

  return (
    <div className="bg-accent/40 border-y">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
        <span className="text-brand-green flex shrink-0 items-center gap-1.5 text-xs font-semibold">
          <Radio className="size-3.5" />
          <span className="hidden sm:inline">Live</span>
        </span>

        <div
          className="group relative h-5 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
          aria-label="Recent activity across the movement"
        >
          <ul className="motion-safe:animate-[ticker-scroll_28s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...items, ...items].map((row, i) => (
              <li
                key={`${row.lga_code}-${i}`}
                className="text-muted-foreground flex h-5 items-center truncate text-xs"
              >
                <strong className="text-foreground pr-1 font-medium">
                  {row.first_name}
                </strong>
                took a polling unit in {lgaName(row.lga_code)},{" "}
                {statesByCode.get(row.state_code)?.name ?? row.state_code}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
