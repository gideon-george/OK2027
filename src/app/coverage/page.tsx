import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverageGrid } from "@/components/coverage/coverage-grid";
import { GapsNearMe } from "@/components/coverage/gaps-near-me";
import { CoverageTile, formatAsOf } from "@/components/coverage/declared-figure";
import { CountUp } from "@/components/shared/count-up";
import { ShareBar } from "@/components/shared/share-bar";
import { coverageLevel, coverageLevels, coverageMeta, darkUnits, fmt } from "@/lib/coverage";
import {
  biggestOpportunities,
  darkStates,
  nationalPenetration,
  zonePenetration,
} from "@/lib/penetration";

export const metadata: Metadata = {
  title: "Coverage map",
  description:
    "Where the National OK Movement has people and where it does not — every zone, state and LGA, against the full INEC polling-unit register and the voters who did not turn out in 2023.",
};

export default function CoveragePage() {
  const units = coverageLevel("unit");

  return (
    <div>
      {/* -------------------------------------------------- the dark headline */}
      <section className="border-b bg-[#0b1020] text-white dark:bg-black/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="eyebrow text-white/50">The map of the gap</p>
          <h1 className="font-display text-brand-red pt-4 text-6xl font-extrabold tracking-tight tabular-nums sm:text-8xl">
            <CountUp value={darkUnits} />
          </h1>
          <p className="font-display pt-2 text-2xl font-bold text-balance sm:text-3xl">
            polling units where NOkM has nobody.
          </p>
          <p className="max-w-2xl pt-4 leading-relaxed text-pretty text-white/70">
            Nigeria has {fmt(units?.universe ?? 0)} polling units. National
            Coordination declares canvassers in {fmt(units?.declared ?? 0)} of
            them, as of {formatAsOf(coverageMeta.asOf)}. Everything below is the
            arithmetic of the rest — where the unreached voters are, and who is
            closest to them.
          </p>
          <div className="flex flex-wrap gap-3 pt-7">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0b1020] shadow-lg hover:bg-white/90"
            >
              <Link href="#gaps-near-me">
                Find the gap near me <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/coverage/adopt">Adopt a polling unit</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ declared scoreboard */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="eyebrow text-brand-red">Declared coverage</p>
        <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
          Every level of the ladder
        </h2>
        <p className="text-muted-foreground max-w-2xl pt-2 pb-7 text-sm leading-relaxed">
          Figures declared by National Coordination as of{" "}
          {formatAsOf(coverageMeta.asOf)}, set against the whole of Nigeria.
          Where the public roster names fewer people than are declared, both
          numbers appear — they are answers to different questions.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {coverageLevels.map((level) => (
            <CoverageTile key={level.key} level={level} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- grid */}
      <section className="bg-accent/30 border-y">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow text-brand-red">State by state</p>
          <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
            The whole federation
          </h2>
          <p className="text-muted-foreground max-w-2xl pt-2 pb-7 text-sm leading-relaxed">
            Tap any state to drill into its LGAs. Colour by where the voters
            are, or by where the movement already has a coordinator named.
          </p>
          <CoverageGrid zones={zonePenetration} />
        </div>
      </section>

      {/* ------------------------------------------------------ gaps near me */}
      <section id="gaps-near-me" className="mx-auto max-w-4xl px-4 py-14">
        <GapsNearMe />
      </section>

      {/* --------------------------------------------------- where it matters */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-xl border p-5 sm:p-6">
            <p className="eyebrow text-brand-red">Biggest prize</p>
            <h2 className="font-display pt-1 pb-1 text-xl font-bold">
              Where the unreached voters are
            </h2>
            <p className="text-muted-foreground pb-4 text-sm">
              States with the most registered voters who did not turn out in
              2023.
            </p>
            <ol className="space-y-2.5">
              {biggestOpportunities.map((place, i) => (
                <li key={place.code}>
                  <Link
                    href={`/coverage/${place.slug}`}
                    className="hover:bg-accent -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors"
                  >
                    <span className="font-display text-muted-foreground w-5 text-sm font-bold tabular-nums">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {place.name}
                    </span>
                    <span className="text-brand-red text-sm font-semibold tabular-nums">
                      {fmt(place.nonVoters)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-card rounded-xl border p-5 sm:p-6">
            <p className="eyebrow text-brand-red">Unfilled</p>
            <h2 className="font-display pt-1 pb-1 text-xl font-bold">
              States with no coordinator named
            </h2>
            <p className="text-muted-foreground pb-4 text-sm">
              {darkStates.length} of {nationalPenetration.statesTotal} states
              have no State Coordinator on the public roster, ordered by what is
              at stake there.
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {darkStates.map((place) => (
                <li key={place.code}>
                  <Link
                    href={`/coverage/${place.slug}`}
                    className="border-brand-red/30 bg-brand-red/5 text-brand-red hover:bg-brand-red/10 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    {place.name}
                    <span className="tabular-nums opacity-70">
                      {Math.round(place.nonVoters / 1000)}k
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild size="sm" variant="outline" className="mt-5">
              <Link href="/vacancies">
                Step forward <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <ShareBar
          className="pt-10"
          title="Share the gap"
          message={`${fmt(darkUnits)} polling units in Nigeria have no NOkM canvasser. Find the gap in your ward:`}
          path="/coverage"
        />
      </section>
    </div>
  );
}
