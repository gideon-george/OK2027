import Link from "next/link";
import { CountUp } from "@/components/shared/count-up";
import { coverageMeta, fmt, type CoverageLevel } from "@/lib/coverage";
import { cn } from "@/lib/utils";

/** "2026-07-26" → "26 July 2026". */
export function formatAsOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A figure declared by National Coordination.
 *
 * Always carries its source and date, and always shows the roster count
 * alongside it where the two differ. The whole point of the component is that
 * a reader can never mistake "leadership reports 26 state coordinators" for
 * "26 state coordinators are named on this site".
 */
export function DeclaredFigure({
  level,
  className,
  hideRoster = false,
}: {
  level: CoverageLevel;
  className?: string;
  /** For dense layouts where the roster line is shown once for the whole set. */
  hideRoster?: boolean;
}) {
  const showRoster =
    !hideRoster && level.named !== null && level.named !== level.declared;

  return (
    <div className={className}>
      <p className="font-display text-3xl font-extrabold tracking-tight tabular-nums">
        {fmt(level.declared)}
        {level.universe !== null && (
          <span className="text-muted-foreground text-lg font-bold">
            {" / "}
            {fmt(level.universe)}
          </span>
        )}
      </p>
      <p className="pt-1 text-sm font-medium">{level.label}</p>
      <p className="text-muted-foreground pt-1 text-xs leading-snug">
        Declared by National Coordination, as of{" "}
        {formatAsOf(coverageMeta.asOf)}
      </p>
      {showRoster && (
        <p className="text-muted-foreground pt-0.5 text-xs leading-snug">
          <Link href="/structure" className="hover:text-foreground underline">
            {fmt(level.named!)} named on the public roster
          </Link>
        </p>
      )}
    </div>
  );
}

const arcTone: Record<string, string> = {
  full: "text-brand-green",
  most: "text-brand-blue",
  some: "text-brand-red",
};

function toneFor(pct: number | null): string {
  if (pct === null) return arcTone.most;
  if (pct >= 100) return arcTone.full;
  if (pct >= 50) return arcTone.most;
  return arcTone.some;
}

/**
 * One level of the national scoreboard: a progress ring, the declared figure,
 * and the gap in red. The ring is inline SVG — a chart library for seven
 * circles would cost more than the whole page budget.
 */
export function CoverageTile({ level }: { level: CoverageLevel }) {
  const pct = level.pct;
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const dash = pct === null ? circumference : (pct / 100) * circumference;

  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 64 64" className="size-14 shrink-0 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="6"
            className="stroke-muted"
          />
          {pct !== null && (
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className={cn("stroke-current", toneFor(pct))}
            />
          )}
        </svg>
        <div className="min-w-0">
          <p
            className={cn(
              "font-display text-2xl leading-none font-extrabold tabular-nums",
              toneFor(pct)
            )}
          >
            {/* Whole percentages in the tile; the exact figure is the
                declared/universe pair printed underneath. */}
            {pct === null ? (
              <CountUp value={level.declared} />
            ) : (
              <CountUp value={Math.round(pct)} suffix="%" />
            )}
          </p>
          <p className="pt-1.5 text-sm leading-tight font-medium text-pretty">
            {level.label}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground pt-3 text-xs tabular-nums">
        {fmt(level.declared)}
        {level.universe !== null && ` of ${fmt(level.universe)}`}{" "}
        {level.universeLabel}
      </p>

      {level.gap !== null && level.gap > 0 && (
        <p className="text-brand-red pt-1 text-xs font-semibold tabular-nums">
          {fmt(level.gap)} still to cover
        </p>
      )}
      {level.gap === 0 && (
        <p className="text-brand-green pt-1 text-xs font-semibold">
          Fully covered
        </p>
      )}

      {level.named !== null && level.named !== level.declared && (
        <p className="text-muted-foreground mt-auto pt-2 text-[0.7rem] leading-snug">
          {fmt(level.named)} named on the roster
        </p>
      )}
    </div>
  );
}
