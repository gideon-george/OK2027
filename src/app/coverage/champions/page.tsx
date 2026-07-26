import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChampionsWall } from "@/components/coverage/champions-wall";
import { ShareBar } from "@/components/shared/share-bar";
import { StatTile } from "@/components/shared/stat-tile";
import { coverageLevel, darkUnits, fmt } from "@/lib/coverage";

export const metadata: Metadata = {
  title: "Wall of champions",
  description:
    "The members standing for their own polling units, and the LGAs closest to full coverage.",
};

export default function ChampionsPage() {
  const units = coverageLevel("unit");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/coverage"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> The coverage map
      </Link>

      <header className="pt-4">
        <p className="eyebrow text-brand-red">One unit, one person</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Wall of champions
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          Everyone who has stood up and said: that unit is mine. First names and
          places only — nobody&apos;s full name, number or exact unit is
          published here.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 pt-8">
        <StatTile
          tone="green"
          value={fmt(units?.declared ?? 0)}
          label="Units declared covered"
          hint="Reported by National Coordination"
        />
        <StatTile
          tone="red"
          value={fmt(darkUnits)}
          label="Units still dark"
          hint="Nobody standing there yet"
        />
      </div>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-bold">Most recent</h2>
        <ChampionsWall />
      </section>

      <section className="pt-10">
        <div className="bg-card relative overflow-hidden rounded-xl border p-6">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <h2 className="font-display text-lg font-bold">
            Your unit is probably still on the dark list.
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            It takes two minutes and it puts your name against the place you
            already vote.
          </p>
          <Button asChild className="mt-4">
            <Link href="/coverage/adopt">
              Adopt your polling unit <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <ShareBar
        className="mt-10"
        title="Call your people in"
        message="I'm standing for my polling unit with NOkM. Take yours — one person, one unit:"
        path="/coverage/champions"
      />
    </div>
  );
}
