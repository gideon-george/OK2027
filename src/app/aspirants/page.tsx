import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspirantsDirectory } from "@/components/aspirants/aspirants-directory";
import { ShareBar } from "@/components/shared/share-bar";
import { confidenceLabels, races } from "@/lib/races";

export const metadata: Metadata = {
  title: "Aspirants",
  description:
    "Who is contesting in 2027, across all five races — President, Governor, Senate, House of Representatives and State House of Assembly.",
};

export default function AspirantsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-3xl">
        <p className="eyebrow text-brand-red">Five races, one ballot</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Who wants to represent you?
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          A general election in Nigeria is not one contest, it is five. Most
          attention goes to the presidency; the seats that decide whether your
          road is fixed and your school is staffed are the other four.
        </p>
      </header>

      {/* ------------------------------------------------------- five races */}
      <section className="pt-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {races.map((r) => (
            <div key={r.key} className="bg-card rounded-xl border p-4">
              <p className="font-display text-brand-blue text-2xl font-extrabold tabular-nums">
                {r.seats.toLocaleString("en-NG")}
              </p>
              <p className="pt-1 text-sm leading-tight font-semibold text-pretty">
                {r.label}
              </p>
              <p className="text-muted-foreground pt-1 text-xs leading-tight">
                {r.constituencyUnit}
              </p>
              <Badge
                variant="outline"
                className={
                  r.confidence === "complete"
                    ? "border-brand-green/40 text-brand-green mt-2.5 text-[0.6rem]"
                    : "text-muted-foreground mt-2.5 text-[0.6rem]"
                }
              >
                {confidenceLabels[r.confidence]}
              </Badge>
            </div>
          ))}
        </div>

        <div className="bg-muted/40 mt-4 flex items-start gap-3 rounded-lg border p-4 text-xs leading-relaxed">
          <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="text-muted-foreground space-y-1.5">
            <p>
              <strong className="text-foreground font-medium">
                Seat totals are constitutional. Constituency names are not
                loaded.
              </strong>{" "}
              109 senatorial districts, 360 federal constituencies and 993 state
              constituencies exist, and INEC publishes which LGAs make up each
              one. That delimitation dataset is not in this platform yet, so no
              district is named here.
            </p>
            <p>
              Naming your federal constituency wrongly on a political website
              would be worse than leaving it blank, so it is left blank. If you
              can supply INEC&apos;s delimitation data,{" "}
              <Link href="/about" className="underline">
                get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ your ballot */}
      <section className="pt-12">
        <div className="band-blue relative overflow-hidden rounded-2xl px-6 py-8 text-white sm:px-10 sm:py-10">
          <p className="eyebrow text-white/60">Start here</p>
          <h2 className="font-display pt-2 text-2xl font-bold text-balance sm:text-3xl">
            Do you know which state constituency you vote in?
          </h2>
          <p className="max-w-2xl pt-3 leading-relaxed text-pretty text-white/80">
            Most people do not. Build your ballot once and it is saved on your
            phone — the five races that decide your representation, your polling
            unit, and how many of your neighbours stayed home in 2023.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-white text-[#1a3a8f] shadow-lg hover:bg-white/90"
          >
            <Link href="/aspirants/ballot">
              Build my ballot <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------- directory */}
      <section className="pt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-1">
          <div>
            <p className="eyebrow text-brand-red">The directory</p>
            <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
              Declared aspirants
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/aspirants/submit">Request a listing</Link>
          </Button>
        </div>
        <p className="text-muted-foreground max-w-2xl pt-2 pb-8 text-sm leading-relaxed">
          Everyone listed here asked to be listed and consented to it. NOkM does
          not scrape politicians&apos; names and publish them as though they had
          agreed.
        </p>
        <AspirantsDirectory />
      </section>

      <ShareBar
        className="mt-12"
        title="Share the five races"
        message="A Nigerian general election is five races, not one. Find out who is contesting yours:"
        path="/aspirants"
      />
    </div>
  );
}
