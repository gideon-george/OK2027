import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
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
import {
  baselineMeta,
  nationalBaseline,
  nationalUntapped,
  stateBaselines,
} from "@/lib/baseline";
import { stateSlug, statesByCode } from "@/lib/geo";

export const metadata: Metadata = {
  title: "2023 baseline",
  description:
    "Every polling unit in Nigeria, the 2023 register and turnout, and how complete the public result-sheet record was — the ground the movement is organising on for 2027.",
};

function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}

export default function BaselinePage() {
  const ranked = [...stateBaselines].sort(
    (a, b) => b.registered - b.accredited - (a.registered - a.accredited)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-3xl">
        <Badge variant="outline" className="border-brand-blue/40 text-brand-blue">
          2023 general election
        </Badge>
        <h1 className="font-display pt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
          The ground we are organising on
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Every polling unit in the federation, the register attached to it, and
          how many people actually turned out in 2023. This is the map the
          movement works from — you cannot mobilise a ward you cannot see.
        </p>
      </header>

      <section className="pt-8">
        <div className="border-brand-red/30 bg-brand-red/5 relative overflow-hidden rounded-xl border p-6 sm:p-8">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <p className="text-gradient-red font-display text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl">
            {fmt(nationalUntapped)}
          </p>
          <p className="font-display pt-2 text-lg font-bold">
            registered voters did not vote in 2023
          </p>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Out of {fmt(nationalBaseline.registered)} on the register,{" "}
            {fmt(nationalBaseline.accredited)} were accredited — a turnout of{" "}
            {nationalBaseline.turnoutPct}%. The election was not decided by the
            people who voted so much as by the people who did not. That is the
            movement&apos;s entire opportunity, and it sits in identifiable
            wards and polling units.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register in your ward</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/arithmetic">Work out what winning costs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-2xl font-bold">
          The national picture
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile value={fmt(nationalBaseline.pollingUnits)} label="Polling units" />
          <StatTile value={fmt(nationalBaseline.wards)} label="Wards" />
          <StatTile value={nationalBaseline.lgas} label="LGAs" />
          <StatTile value="37" label="States + FCT" />
          <StatTile
            tone="blue"
            value={fmt(nationalBaseline.registered)}
            label="Registered"
            hint="2023"
          />
          <StatTile
            tone="green"
            value={`${nationalBaseline.turnoutPct}%`}
            label="Turnout"
            hint="2023"
          />
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display text-2xl font-bold">
          How complete was the public record?
        </h2>
        <p className="text-muted-foreground max-w-3xl pt-2 text-sm leading-relaxed">
          2023 was the first Nigerian general election where polling-unit result
          sheets were published online, on INEC&apos;s IReV portal. Volunteers
          at Nigeria 2.0 went through them unit by unit. Of{" "}
          {fmt(nationalBaseline.pollingUnits)} polling units, a sheet was
          located and cross-checked for{" "}
          {fmt(nationalBaseline.validated)}, {fmt(nationalBaseline.unsure)} were
          set aside as unclear and needing manual review, and{" "}
          {fmt(nationalBaseline.notFound)} had no sheet found at all.
        </p>
        <p className="text-muted-foreground max-w-3xl pt-3 text-sm leading-relaxed">
          These figures describe the completeness of the published record. They
          are not a claim about any person, party or result. The lesson the
          movement takes from them is operational: a polling unit with a NOkM
          agent present is a polling unit whose sheet gets seen, signed and
          accounted for.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-5">
          <StatTile
            tone="green"
            value={fmt(nationalBaseline.validated)}
            label="Sheets validated"
          />
          <StatTile value={fmt(nationalBaseline.unsure)} label="Flagged unclear" />
          <StatTile
            tone="red"
            value={fmt(nationalBaseline.notFound)}
            label="No sheet found"
          />
        </div>
      </section>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">
          Where the unmobilised voters are
        </h2>
        <p className="text-muted-foreground pt-1 pb-5 text-sm">
          States ranked by registered voters who did not turn out in 2023 — the
          largest available pools first.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Registered</TableHead>
                <TableHead className="text-right">Voted</TableHead>
                <TableHead className="text-right">Did not vote</TableHead>
                <TableHead className="w-32">Turnout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((state) => {
                const gap = state.registered - state.accredited;
                const ngState = statesByCode.get(state.code);
                return (
                  <TableRow key={state.code}>
                    <TableCell className="font-medium">
                      {ngState ? (
                        <Link
                          href={`/baseline/${stateSlug(ngState)}`}
                          className="hover:underline"
                        >
                          {state.name}
                        </Link>
                      ) : (
                        state.name
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(state.registered)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(state.accredited)}
                    </TableCell>
                    <TableCell className="text-brand-red text-right font-medium tabular-nums">
                      {fmt(gap)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={state.turnoutPct ?? 0} className="h-2" />
                        <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                          {state.turnoutPct}%
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

      <section className="pt-12">
        <div className="bg-muted/40 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <h2 className="font-display font-semibold">
                Source, and what is not shown here
              </h2>
              <p className="text-muted-foreground pt-2 leading-relaxed">
                Data comes from the{" "}
                <a
                  href="https://forensic.nigeria2.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Nigeria 2.0 2023 Electoral Sheets Collation
                </a>
                , an open dataset transcribed from INEC&apos;s IReV portal by
                volunteers, and published openly at{" "}
                <a
                  href="https://nigeria2.com/elections/results/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  nigeria2.com
                </a>
                . NOkM is not affiliated with Nigeria 2.0.
              </p>
              <p className="text-muted-foreground pt-2 leading-relaxed">
                <strong className="text-foreground font-medium">
                  Per-party vote counts are deliberately not published on this
                  site.
                </strong>{" "}
                The source transcription is incomplete and uneven — nationally
                it captures between roughly three-quarters and all of each
                party&apos;s official total, and in several states fewer than
                one sheet in twenty was validated. Republishing those numbers as
                results would be misleading. For official results, go to INEC.
              </p>
              <p className="text-muted-foreground pt-2 leading-relaxed">
                {baselineMeta.coverage}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
