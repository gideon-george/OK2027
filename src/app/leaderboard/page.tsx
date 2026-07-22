import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LiveScoreboard } from "@/components/leaderboard/live-scoreboard";
import { zoneCoverage } from "@/lib/structure";
import { geoForState, states, statesByCode } from "@/lib/geo";
import { stateCoordinator } from "@/lib/structure";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "How each zone and state is performing on structure coverage, membership and reporting across the National OK Movement.",
};

export default function LeaderboardPage() {
  const rankedZones = [...zoneCoverage].sort(
    (a, b) =>
      b.statesFilled / b.statesTotal - a.statesFilled / a.statesTotal ||
      b.statesFilled - a.statesFilled
  );

  const rankedStates = [...states].sort((a, b) => {
    const aFilled = stateCoordinator(a.code)?.filled ? 1 : 0;
    const bFilled = stateCoordinator(b.code)?.filled ? 1 : 0;
    if (aFilled !== bFilled) return bFilled - aFilled;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand-red">Who is doing the work</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Leaderboard
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Where the work is being done. This page exists to encourage, not to
          shame — a state near the bottom is a state with room to move, and
          every coordinator can change their position this week.
        </p>
      </header>

      <section className="pt-10">
        <h2 className="font-display text-2xl font-bold">
          Zones by structure coverage
        </h2>
        <p className="text-muted-foreground pt-1 pb-5 text-sm">
          States with a coordinator in post, out of states in the zone.
        </p>
        <div className="space-y-3">
          {rankedZones.map((zone, i) => {
            const pct = Math.round((zone.statesFilled / zone.statesTotal) * 100);
            return (
              <div key={zone.code} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-display text-sm font-bold tabular-nums">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold">{zone.name}</h3>
                    {zone.coordinator?.filled ? (
                      <Badge variant="secondary">Coordinator in post</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-brand-red/40 text-brand-red"
                      >
                        Coordinator vacant
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {zone.statesFilled}/{zone.statesTotal}
                  </span>
                </div>
                <Progress value={pct} className="mt-3" />
              </div>
            );
          })}
        </div>
      </section>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">
          Live membership and reporting
        </h2>
        <p className="text-muted-foreground pt-1 pb-5 text-sm">
          Read straight from the member register. No estimates.
        </p>
        <LiveScoreboard />
      </section>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">State by state</h2>
        <p className="text-muted-foreground pt-1 pb-5 text-sm">
          Structure status for all 36 states and the FCT.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead className="text-right">Polling units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedStates.map((state) => {
                const coordinator = stateCoordinator(state.code);
                const zone = statesByCode.get(state.code)?.zone;
                return (
                  <TableRow key={state.code}>
                    <TableCell className="font-medium">
                      {coordinator ? (
                        <Link
                          href={`/structure/${coordinator.slug}`}
                          className="hover:underline"
                        >
                          {state.name}
                        </Link>
                      ) : (
                        state.name
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {zone}
                    </TableCell>
                    <TableCell>
                      {coordinator?.filled ? (
                        <span className="text-brand-green">In post</span>
                      ) : (
                        <span className="text-brand-red">Vacant</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {geoForState(state.code)?.pollingUnits.toLocaleString() ??
                        "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="pt-12">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Move your state up this table
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Two things change a state&apos;s position: members registered and
            posts filled. Both are open to anyone willing to do the work.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/vacancies">Take a post</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
