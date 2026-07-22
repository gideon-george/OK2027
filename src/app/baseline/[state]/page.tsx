import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { StatTile } from "@/components/shared/stat-tile";
import { baselineForState } from "@/lib/baseline";
import { lgaBaselineForState } from "@/lib/baseline-lga.server";
import { states, stateSlug, zoneByCode } from "@/lib/geo";
import { stateCoordinator } from "@/lib/structure";

export function generateStaticParams() {
  return states.map((state) => ({ state: stateSlug(state) }));
}

function stateFromSlug(slug: string) {
  return states.find((s) => stateSlug(s) === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const state = stateFromSlug(slug);
  if (!state) return { title: "State not found" };
  return {
    title: `${state.name} — 2023 baseline`,
    description: `Polling units, register, 2023 turnout and result-sheet coverage for ${state.name}, LGA by LGA.`,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}

export default async function StateBaselinePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const state = stateFromSlug(slug);
  if (!state) notFound();

  const baseline = baselineForState(state.code);
  if (!baseline) notFound();

  const lgas = lgaBaselineForState(state.code);
  const coordinator = stateCoordinator(state.code);
  const zone = zoneByCode(state.zone);
  const gap = baseline.registered - baseline.accredited;

  const rankedLgas = [...lgas].sort(
    (a, b) => b.registered - b.accredited - (a.registered - a.accredited)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/baseline"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> All states
      </Link>

      <header className="pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{zone?.name ?? state.zone}</Badge>
          <Badge variant="outline">2023 baseline</Badge>
        </div>
        <h1 className="font-display pt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {state.name}
        </h1>
      </header>

      <section className="pt-8">
        <div className="border-brand-red/30 bg-brand-red/5 relative overflow-hidden rounded-xl border p-6">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <p className="text-gradient-red font-display text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
            {fmt(gap)}
          </p>
          <p className="font-display pt-2 font-bold">
            registered voters in {state.name} did not vote in 2023
          </p>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Spread across {fmt(baseline.pollingUnits)} polling units in{" "}
            {fmt(lgas.length)} local government areas. Turnout was{" "}
            {baseline.turnoutPct}%.
          </p>
        </div>
      </section>

      <section className="pt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile value={fmt(lgas.length)} label="LGAs" />
          <StatTile value={fmt(baseline.wards)} label="Wards" />
          <StatTile value={fmt(baseline.pollingUnits)} label="Polling units" />
          <StatTile
            tone="blue"
            value={fmt(baseline.registered)}
            label="Registered"
          />
          <StatTile
            tone="green"
            value={`${baseline.turnoutPct}%`}
            label="Turnout"
          />
        </div>
      </section>

      {coordinator && (
        <section className="pt-8">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              State Coordinator
            </p>
            {coordinator.filled ? (
              <p className="font-display pt-1 text-lg font-semibold">
                {coordinator.holderName}
              </p>
            ) : (
              <p className="text-brand-red pt-1 font-medium">
                This post is open — {fmt(baseline.pollingUnits)} polling units
                have no state coordinator behind them.
              </p>
            )}
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={`/structure/${coordinator.slug}`}>
                {coordinator.filled ? "Contact this office" : "Apply for this post"}
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="pt-10">
        <h2 className="font-display text-2xl font-bold">
          Local government areas
        </h2>
        <p className="text-muted-foreground pt-1 pb-5 text-sm">
          Ranked by unmobilised voters — where the largest gains are available.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LGA</TableHead>
                <TableHead className="text-right">Wards</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Registered</TableHead>
                <TableHead className="text-right">Did not vote</TableHead>
                <TableHead className="w-28">Turnout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedLgas.map((lga) => {
                const lgaGap = lga.registered - lga.accredited;
                const turnout =
                  lga.registered > 0
                    ? Math.round((lga.accredited / lga.registered) * 1000) / 10
                    : 0;
                return (
                  <TableRow key={lga.code}>
                    <TableCell className="font-medium">{lga.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lga.wards}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(lga.pollingUnits)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(lga.registered)}
                    </TableCell>
                    <TableCell className="text-brand-red text-right font-medium tabular-nums">
                      {fmt(lgaGap)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={turnout} className="h-2" />
                        <span className="text-muted-foreground w-9 text-right text-xs tabular-nums">
                          {turnout}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display text-xl font-semibold">
          Result-sheet record, 2023
        </h2>
        <p className="text-muted-foreground max-w-3xl pt-2 text-sm leading-relaxed">
          Of {fmt(baseline.pollingUnits)} polling units in {state.name}, a
          published sheet was located and cross-checked for{" "}
          {fmt(baseline.validated)}, {fmt(baseline.unsure)} were unclear and set
          aside for review, and {fmt(baseline.notFound)} had no sheet found.
          This describes the completeness of the public record — it is not a
          claim about any result.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-4">
          <StatTile
            tone="green"
            value={fmt(baseline.validated)}
            label="Validated"
            hint={`${baseline.validatedPct}% of units`}
          />
          <StatTile value={fmt(baseline.unsure)} label="Unclear" />
          <StatTile tone="red" value={fmt(baseline.notFound)} label="Not found" />
        </div>
      </section>

      <section className="pt-10">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Turn this into votes
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Every number above is a person who is already registered. They do
            not need to register again — they need someone in their ward who
            knows them and turns up.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register in your ward</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/pvc">Check the PVC drive</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
