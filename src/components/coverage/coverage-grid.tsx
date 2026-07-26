"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";
import {
  opportunityBand,
  presenceLabels,
  type PlaceCoverage,
  type PresenceStatus,
  type ZonePenetration,
} from "@/lib/penetration";
import { cn } from "@/lib/utils";

type Mode = "opportunity" | "presence";

/**
 * The gap, as a grid of tiles rather than a basemap.
 *
 * Mapbox GL is ~200 kB before a single tile is fetched, and members are on
 * metered data. The grid carries the same information — every state, coloured
 * and ranked — at the cost of the numbers already on the page.
 */

const presenceClasses: Record<PresenceStatus, string> = {
  covered: "bg-brand-green/15 text-brand-green border-brand-green/30",
  partial: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  dark: "bg-brand-red/10 text-brand-red border-brand-red/30",
  unreported:
    "bg-muted/60 text-muted-foreground border-dashed border-muted-foreground/30",
};

/**
 * Opportunity heat. Fixed hex rather than theme tokens: the band must read the
 * same in light and dark, the way a printed map does.
 */
const heatClasses = [
  "bg-[#eef2ff] text-[#1a3a8f] border-[#c7d2fe] dark:bg-[#1a2547] dark:text-[#c7d2fe] dark:border-[#2c3a6b]",
  "bg-[#c7d7fe] text-[#16307b] border-[#a5b8fc] dark:bg-[#22336b] dark:text-[#dbe3ff] dark:border-[#36498a]",
  "bg-[#93b0fd] text-[#0f2560] border-[#7391fb] dark:bg-[#2d4590] dark:text-white dark:border-[#4560ad]",
  "bg-[#e88b8e] text-[#5c1013] border-[#dd6a6e] dark:bg-[#8a2c30] dark:text-white dark:border-[#a13a3e]",
  "bg-[#d1232a] text-white border-[#b01c22] dark:bg-[#c01f26] dark:text-white dark:border-[#e05a5f]",
];

function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function StateTile({
  place,
  mode,
  max,
}: {
  place: PlaceCoverage;
  mode: Mode;
  max: number;
}) {
  const band = opportunityBand(place.nonVoters, max);
  const tone =
    mode === "presence" ? presenceClasses[place.presence] : heatClasses[band];

  return (
    <Link
      href={`/coverage/${place.slug}`}
      className={cn(
        "flex flex-col justify-between rounded-lg border p-2.5 transition-transform hover:z-10 hover:scale-[1.04] focus-visible:z-10 focus-visible:scale-[1.04]",
        tone
      )}
    >
      <span className="font-display text-[0.8rem] leading-tight font-bold text-balance">
        {place.name}
      </span>
      <span className="pt-1.5 text-[0.7rem] leading-tight font-medium tabular-nums opacity-90">
        {mode === "presence"
          ? presenceLabels[place.presence]
          : `${compact(place.nonVoters)} did not vote`}
      </span>
      <span className="pt-0.5 text-[0.65rem] tabular-nums opacity-70">
        {fmt(place.pollingUnits)} units
      </span>
    </Link>
  );
}

export function CoverageGrid({ zones }: { zones: ZonePenetration[] }) {
  const [mode, setMode] = useState<Mode>("opportunity");
  const all = zones.flatMap((z) => z.states);
  const max = Math.max(...all.map((s) => s.nonVoters));

  return (
    <div>
      {/* ----------------------------------------------------------- toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <div
          role="group"
          aria-label="Colour the map by"
          className="bg-muted inline-flex rounded-full p-1"
        >
          {(
            [
              ["opportunity", "Voters not reached"],
              ["presence", "Where we have people"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                mode === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ----------------------------------------------------------- key */}
        {mode === "opportunity" ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Fewer</span>
            <span className="flex gap-0.5" aria-hidden>
              {heatClasses.map((c, i) => (
                <span key={i} className={cn("size-4 rounded-sm border", c)} />
              ))}
            </span>
            <span className="text-muted-foreground">
              More voters who stayed home
            </span>
          </div>
        ) : (
          <ul className="flex flex-wrap items-center gap-3 text-xs">
            {(["covered", "dark", "unreported"] as PresenceStatus[]).map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn("size-3 rounded-sm border", presenceClasses[s])}
                />
                <span className="text-muted-foreground">
                  {presenceLabels[s]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ------------------------------------------------------------ zones */}
      <div className="space-y-7">
        {zones.map((zone) => (
          <section key={zone.code}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-2.5">
              <h3 className="font-display text-base font-bold">
                {zone.name}
                <span className="text-muted-foreground pl-2 text-xs font-medium">
                  {zone.holderName
                    ? `Coordinator: ${zone.holderName}`
                    : "Zonal coordinator post open"}
                </span>
              </h3>
              <p className="text-muted-foreground text-xs tabular-nums">
                {fmt(zone.nonVoters)} did not vote · {fmt(zone.pollingUnits)}{" "}
                units · {zone.statesCovered}/{zone.statesTotal} states have a
                coordinator
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {zone.states.map((place) => (
                <StateTile
                  key={place.code}
                  place={place}
                  mode={mode}
                  max={max}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* --------------------------------------------------- what drives it */}
      <div className="bg-muted/40 mt-8 flex items-start gap-3 rounded-lg border p-4 text-xs leading-relaxed">
        <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="text-muted-foreground space-y-1.5">
          <p>
            <strong className="text-foreground font-medium">
              What is colouring this map.
            </strong>{" "}
            {mode === "opportunity"
              ? "Registered voters who did not turn out in 2023, from the INEC polling-unit register. Real and complete for every state."
              : "Whether a coordinator is named on the public roster for that state. This is presence recorded on this platform — not a claim that nobody else is on the ground."}
          </p>
          <p>
            Below state level nothing has been reported into this platform yet,
            so LGA, ward and unit coverage shows as{" "}
            <em>not yet reported</em> rather than being coloured as an absence.
            It fills in as officers file reports and members adopt units.
          </p>
        </div>
      </div>
    </div>
  );
}
