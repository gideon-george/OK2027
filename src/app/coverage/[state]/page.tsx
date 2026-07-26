import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/shared/stat-tile";
import { ShareBar } from "@/components/shared/share-bar";
import { ContactActions } from "@/components/shared/contact-actions";
import { presenceLabels, penetrationBySlug, statePenetration } from "@/lib/penetration";
import { lgaBaselineForState } from "@/lib/baseline-lga.server";
import { zoneByCode } from "@/lib/geo";

interface Params {
  params: Promise<{ state: string }>;
}

export function generateStaticParams() {
  return statePenetration.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { state } = await params;
  const place = penetrationBySlug(state);
  if (!place) return {};

  return {
    title: `${place.name} coverage`,
    description:
      `${place.name}: ${place.pollingUnits.toLocaleString("en-NG")} polling units, ` +
      `${place.nonVoters.toLocaleString("en-NG")} registered voters who did not turn out in 2023, ` +
      `and where the National OK Movement stands in each LGA.`,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}

export default async function StateCoveragePage({ params }: Params) {
  const { state } = await params;
  const place = penetrationBySlug(state);
  if (!place) notFound();

  const lgas = lgaBaselineForState(place.code)
    .map((lga) => ({
      ...lga,
      nonVoters: Math.max(0, lga.registered - lga.accredited),
      turnoutPct:
        lga.registered > 0
          ? Math.round((lga.accredited / lga.registered) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.nonVoters - a.nonVoters);

  const zone = zoneByCode(place.zone);
  const maxNonVoters = Math.max(...lgas.map((l) => l.nonVoters), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/coverage"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> All states
      </Link>

      <header className="pt-4">
        <p className="eyebrow text-brand-red">{zone?.name} zone</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {place.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <Badge
            variant="outline"
            className={
              place.presence === "covered"
                ? "border-brand-green/40 text-brand-green"
                : "border-brand-red/40 text-brand-red"
            }
          >
            {presenceLabels[place.presence]}
          </Badge>
          {place.holderName ? (
            <span className="text-muted-foreground text-sm">
              State Coordinator: {place.holderName}
            </span>
          ) : (
            <Link
              href="/vacancies"
              className="text-primary text-sm font-medium hover:underline"
            >
              State Coordinator post is open — step forward →
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 pt-8 lg:grid-cols-4">
        <StatTile
          tone="blue"
          value={fmt(place.pollingUnits)}
          label="Polling units"
          hint={`Across ${place.lgas} LGAs and ${fmt(place.wards)} wards`}
        />
        <StatTile
          tone="blue"
          value={fmt(place.registered)}
          label="Registered voters"
          hint="2023 register"
        />
        <StatTile
          tone="red"
          value={fmt(place.nonVoters)}
          label="Did not vote in 2023"
          hint={`${place.nonVoterPct}% of the register`}
        />
        <StatTile
          tone="green"
          value={`${100 - place.nonVoterPct}%`}
          label="Turnout in 2023"
          hint="Accredited of registered"
        />
      </div>

      {/* ---------------------------------------------------------- the LGAs */}
      <section className="pt-14">
        <h2 className="font-display text-2xl font-bold">
          {place.lgas} local government areas
        </h2>
        <p className="text-muted-foreground pt-1 pb-6 text-sm leading-relaxed">
          Ordered by the number of registered voters who stayed home in 2023 —
          the largest job first. No unit-level reports have reached this
          platform yet, so no LGA is marked covered or uncovered; what is shown
          is the size of the work.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">
              LGAs of {place.name} with polling units, registered voters and
              2023 turnout
            </caption>
            <thead>
              <tr className="border-b text-left">
                <th scope="col" className="py-2 pr-3 font-medium">
                  LGA
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Units
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Registered
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Turnout
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Did not vote
                </th>
              </tr>
            </thead>
            <tbody>
              {lgas.map((lga) => (
                <tr key={lga.code} className="hover:bg-accent/50 border-b">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    {lga.name}
                    <span className="text-muted-foreground block text-xs font-normal">
                      {lga.wards} wards
                    </span>
                  </th>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {fmt(lga.pollingUnits)}
                  </td>
                  <td className="text-muted-foreground py-2.5 pr-3 text-right tabular-nums">
                    {fmt(lga.registered)}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {lga.turnoutPct}%
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="bg-brand-red/15 hidden h-1.5 rounded-full sm:block"
                        style={{
                          width: `${Math.max(4, (lga.nonVoters / maxNonVoters) * 56)}px`,
                        }}
                      />
                      <span className="text-brand-red font-semibold tabular-nums">
                        {fmt(lga.nonVoters)}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --------------------------------------------------------- take part */}
      <section className="pt-12">
        <div className="bg-card relative overflow-hidden rounded-xl border p-6 sm:p-8">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <h2 className="font-display text-xl font-bold">
            {fmt(place.nonVoters)} people in {place.name} were registered and
            did not vote.
          </h2>
          <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
            They are already on the register. They live in identifiable wards.
            Reaching them is the whole job — and it is done by people who live
            there.
          </p>
          <div className="flex flex-wrap gap-3 pt-5">
            <Button asChild>
              <Link href={`/coverage/adopt?state=${place.code}`}>
                Adopt a polling unit <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/join">Register in your ward</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={`/baseline/${place.slug}`}>
                Full 2023 baseline for {place.name}
              </Link>
            </Button>
          </div>
          <ContactActions
            className="pt-5"
            size="sm"
            message={`I want to help NOkM cover polling units in ${place.name}.`}
            subject={`Coverage volunteer — ${place.name}`}
          />
        </div>
      </section>

      <ShareBar
        className="mt-12"
        title={`Share ${place.name}'s gap`}
        message={`In ${place.name}, ${fmt(place.nonVoters)} registered voters did not vote in 2023. NOkM is organising ward by ward:`}
        path={`/coverage/${place.slug}`}
      />
    </div>
  );
}
