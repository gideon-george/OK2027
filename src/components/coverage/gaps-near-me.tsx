"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStateGeography, wardsForLga } from "@/hooks/use-state-geography";
import { useLgaBaselines } from "@/hooks/use-lga-baselines";
import { states, stateSlug } from "@/lib/geo";

/**
 * "Where is the hole near me?"
 *
 * The visitor picks their state, LGA and ward, and gets the real size of the
 * job in that place: how many polling units, how many registered voters, and
 * how many of them stayed home in 2023.
 *
 * What this deliberately does not do is list individual polling units. The
 * register loaded into this repository carries unit *counts* per LGA, not unit
 * identities — see docs/TODO-real-data.md. Inventing unit names so the panel
 * looked more complete would put fictional places on a political website.
 */
export function GapsNearMe() {
  const [stateCode, setStateCode] = useState<string>();
  const [lgaCode, setLgaCode] = useState<string>();
  const [wardCode, setWardCode] = useState<string>();

  const { geography, loading } = useStateGeography(stateCode);
  const { lgas: lgaBaselines } = useLgaBaselines(stateCode);
  const wards = wardsForLga(geography, lgaCode);

  const lga = useMemo(
    () => lgaBaselines?.find((l) => l.code === lgaCode),
    [lgaBaselines, lgaCode]
  );

  const ward = wards?.find((w) => w.code === wardCode);
  const nonVoters = lga ? Math.max(0, lga.registered - lga.accredited) : 0;
  // Units and voters spread evenly across the LGA's wards. Presented as an
  // average, never as a count for that specific ward.
  const perWardUnits = lga && lga.wards > 0 ? Math.round(lga.pollingUnits / lga.wards) : 0;

  const stateName = states.find((s) => s.code === stateCode)?.name;

  return (
    <div className="bg-card rounded-xl border p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MapPin className="text-brand-red size-5" />
        <h2 className="font-display text-xl font-bold">Gaps near me</h2>
      </div>
      <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
        Find the size of the job where you actually live.
      </p>

      <div className="grid gap-3 pt-5 sm:grid-cols-3">
        <div>
          <label htmlFor="gap-state" className="pb-1.5 block text-xs font-medium">
            State
          </label>
          <Select
            value={stateCode}
            onValueChange={(v) => {
              setStateCode(v);
              setLgaCode(undefined);
              setWardCode(undefined);
            }}
          >
            <SelectTrigger id="gap-state" className="w-full">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="gap-lga" className="pb-1.5 block text-xs font-medium">
            LGA
          </label>
          <Select
            value={lgaCode}
            onValueChange={(v) => {
              setLgaCode(v);
              setWardCode(undefined);
            }}
            disabled={!geography || loading}
          >
            <SelectTrigger id="gap-lga" className="w-full">
              <SelectValue
                placeholder={
                  loading
                    ? "Loading…"
                    : geography
                      ? "Select LGA"
                      : "Pick a state first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {geography?.lgas.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="gap-ward" className="pb-1.5 block text-xs font-medium">
            Ward
          </label>
          <Select
            value={wardCode}
            onValueChange={setWardCode}
            disabled={!wards}
          >
            <SelectTrigger id="gap-ward" className="w-full">
              <SelectValue
                placeholder={wards ? "Select ward" : "Pick an LGA first"}
              />
            </SelectTrigger>
            <SelectContent>
              {wards?.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <p className="text-muted-foreground flex items-center gap-2 pt-4 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading {stateName}&apos;s
          register…
        </p>
      )}

      {lga && (
        <div className="mt-5 rounded-lg border p-4">
          <p className="eyebrow text-brand-red">
            {lga.name} LGA{ward ? ` · ${ward.name}` : ""}
          </p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground text-xs">Polling units</dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {lga.pollingUnits.toLocaleString("en-NG")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Wards</dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {lga.wards}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Registered</dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {lga.registered.toLocaleString("en-NG")}
              </dd>
            </div>
            <div>
              <dt className="text-brand-red text-xs font-medium">
                Did not vote in 2023
              </dt>
              <dd className="font-display text-brand-red text-xl font-bold tabular-nums">
                {nonVoters.toLocaleString("en-NG")}
              </dd>
            </div>
          </dl>

          {ward && (
            <p className="text-muted-foreground pt-4 text-sm leading-relaxed">
              {lga.name} averages about{" "}
              <strong className="text-foreground font-semibold tabular-nums">
                {perWardUnits}
              </strong>{" "}
              polling units per ward. The register loaded here counts units per
              LGA rather than naming each one, so this is the LGA average, not a
              count for {ward.name} specifically.
            </p>
          )}

          <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
            No unit-level reports have reached this platform for {lga.name} yet.
            That is the gap. Take one.
          </p>

          <div className="flex flex-wrap gap-2 pt-4">
            <Button asChild size="sm">
              <Link
                href={{
                  pathname: "/coverage/adopt",
                  query: {
                    state: stateCode,
                    lga: lgaCode,
                    ...(wardCode ? { ward: wardCode } : {}),
                  },
                }}
              >
                I&apos;ll take this one <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            {stateCode && (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/coverage/${stateSlug(states.find((s) => s.code === stateCode)!)}`}
                >
                  See all of {stateName}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
