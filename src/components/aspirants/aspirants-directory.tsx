"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Info, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initialsFor } from "@/components/shared/officer-portrait";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/config";
import { races, type RaceKey } from "@/lib/races";
import { states, statesByCode } from "@/lib/geo";

interface AspirantRow {
  id: string;
  full_name: string;
  race: RaceKey;
  state_code: string | null;
  constituency_ref: string | null;
  constituency_verified: boolean;
  party: string | null;
  photo_path: string | null;
  photo_alt: string | null;
  manifesto: string[] | null;
  verification: "self_declared" | "documents_seen" | "inec_confirmed";
  endorsed_by: string | null;
  endorsed_on: string | null;
}

const verificationLabels: Record<AspirantRow["verification"], string> = {
  self_declared: "Self-declared",
  documents_seen: "Documents seen",
  inec_confirmed: "Confirmed with INEC",
};

export function AspirantsDirectory() {
  const [rows, setRows] = useState<AspirantRow[] | null>(null);
  const [raceKey, setRaceKey] = useState<string>("all");
  const [stateCode, setStateCode] = useState<string>("all");

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
          .from("listed_aspirants")
          .select("*")
          .order("full_name");
        if (!cancelled) setRows((data ?? []) as AspirantRow[]);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (raceKey !== "all" && r.race !== raceKey) return false;
      if (stateCode !== "all" && r.state_code !== stateCode) return false;
      return true;
    });
  }, [rows, raceKey, stateCode]);

  if (rows === null) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 pb-6">
        <div className="w-52">
          <label htmlFor="asp-race" className="pb-1.5 block text-xs font-medium">
            Race
          </label>
          <Select value={raceKey} onValueChange={setRaceKey}>
            <SelectTrigger id="asp-race" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All five races</SelectItem>
              {races.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <label htmlFor="asp-state" className="pb-1.5 block text-xs font-medium">
            State
          </label>
          <Select value={stateCode} onValueChange={setStateCode}>
            <SelectTrigger id="asp-state" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Users className="text-muted-foreground mx-auto size-8" />
          <p className="font-display pt-3 text-lg font-bold">
            No aspirants are listed yet.
          </p>
          <p className="text-muted-foreground mx-auto max-w-lg pt-2 text-sm leading-relaxed">
            This directory is empty on purpose. NOkM does not scrape names of
            politicians and publish them — every person here asked to be listed
            and consented to it. If you are contesting in 2027, put yourself
            forward.
          </p>
          <Button asChild size="sm" className="mt-5">
            <Link href="/aspirants/submit">Request a listing</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const raceLabel = races.find((r) => r.key === a.race)?.label;
            const photoUrl = a.photo_path
              ? `${supabaseUrl}/storage/v1/object/public/officer-photos/${a.photo_path}`
              : null;

            return (
              <li key={a.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={a.photo_alt ?? a.full_name}
                      loading="lazy"
                      className="aspect-[4/5] w-14 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span className="bg-muted text-muted-foreground font-display flex aspect-[4/5] w-14 shrink-0 items-center justify-center rounded-md text-sm font-bold">
                      {initialsFor(a.full_name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-display leading-tight font-bold text-balance">
                      {a.full_name}
                    </p>
                    <p className="text-muted-foreground pt-0.5 text-xs">
                      {raceLabel}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {a.constituency_ref ??
                        (a.state_code
                          ? statesByCode.get(a.state_code)?.name
                          : "Nigeria")}
                      {a.constituency_ref && !a.constituency_verified && (
                        <span className="opacity-70"> · unverified</span>
                      )}
                    </p>
                  </div>
                </div>

                {a.manifesto && a.manifesto.length > 0 && (
                  <ul className="text-muted-foreground list-disc space-y-1 pt-3 pl-4 text-xs leading-relaxed">
                    {a.manifesto.slice(0, 5).map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-1.5 pt-3">
                  <Badge variant="secondary" className="text-[0.65rem]">
                    {verificationLabels[a.verification]}
                  </Badge>
                  {a.party && (
                    <Badge variant="outline" className="text-[0.65rem]">
                      {a.party}
                    </Badge>
                  )}
                  {a.endorsed_by && (
                    <Badge className="bg-brand-green text-[0.65rem] text-white">
                      Endorsed by {a.endorsed_by}
                    </Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="bg-muted/40 mt-8 flex items-start gap-3 rounded-lg border p-4 text-xs leading-relaxed">
        <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground">
          <strong className="text-foreground font-medium">
            Being listed here is not an endorsement.
          </strong>{" "}
          This directory records who is contesting. NOkM backs a candidate only
          when the National Working Committee ratifies it, and that appears as a
          dated endorsement badge — nothing else on a card implies support.
          Every aspirant in a race is shown with equal weight, and party colours
          are never used.
        </p>
      </div>
    </div>
  );
}
