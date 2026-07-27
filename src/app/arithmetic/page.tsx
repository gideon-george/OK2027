import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Info, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VictoryModel } from "@/components/arithmetic/victory-model";
import { modelBasis } from "@/lib/arithmetic";
import { generalElection } from "@/lib/site";

export const metadata: Metadata = {
  title: "The arithmetic of victory",
  description:
    "An interactive model of what winning 2027 actually costs — turnout, share and new PVCs, divided down through 774 LGAs and 176,379 polling units to the number one ward has to find.",
};

function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}

/**
 * The arithmetic of victory.
 *
 * The movement's other pages count what exists: offices, members, adopted
 * units, the 2023 register. This one counts what is missing, and it is the
 * only page on the site whose numbers move when you touch them. Everything it
 * shows is a division sum over the real register — no party votes, no polling,
 * no forecast. See src/lib/arithmetic.ts.
 */
export default function ArithmeticPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-3xl">
        <Badge variant="outline" className="border-brand-blue/40 text-brand-blue">
          <Calculator className="mr-1 size-3" />
          Interactive model
        </Badge>
        <h1 className="font-display pt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
          The arithmetic of victory
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Every movement says it will win. Very few can say what winning costs,
          in people, by name of place. Move the three dials below and the whole
          federation recalculates — down to the number of voters a single
          polling unit has to produce on the day.
        </p>
        <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
          This is not a prediction and it is not a poll. It is long division,
          performed on the 2023 register of {fmt(modelBasis.register2023)} voters
          that this platform already publishes at{" "}
          <Link href="/baseline" className="text-primary underline">
            /baseline
          </Link>
          . The share of the vote is a target you set, not a claim the movement
          makes about how Nigerians will vote.
        </p>
      </header>

      <VictoryModel />

      <section className="pt-12">
        <div className="bg-muted/40 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <Scale className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <h2 className="font-display font-semibold">
                On section 134, in plain English
              </h2>
              <p className="text-muted-foreground pt-2 leading-relaxed">
                The Constitution requires a winning presidential candidate to
                have the highest number of votes cast, and not less than
                one-quarter of the votes cast in each of at least two-thirds of
                all the states in the federation and the Federal Capital
                Territory. After the 2023 election it was argued that the FCT
                carried a separate, mandatory quarter of its own. That argument
                was rejected by the courts, which treated the FCT as one of the
                federating units for this purpose rather than as an extra hurdle.
              </p>
              <p className="text-muted-foreground pt-2 leading-relaxed">
                Because the reading was contested, this page models both and lets
                you switch between them. The summary above is written for
                organisers, not lawyers — it is a plain-English description of a
                decided question, not legal advice, and nothing on this site
                should be relied on as such.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="bg-muted/40 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <h2 className="font-display font-semibold">
                What the model assumes, stated openly
              </h2>
              <ul className="text-muted-foreground list-disc space-y-1.5 pt-2 pl-4 leading-relaxed">
                <li>
                  The register is the {fmt(modelBasis.register2023)} voters
                  attached to polling units whose 2023 result sheet was located.
                  INEC&apos;s official 2023 register was larger — roughly 93.4
                  million — so every figure here is conservative by a few per
                  cent rather than inflated.
                </li>
                <li>
                  Turnout is applied uniformly to every state. Real turnout
                  varies by state, and this model does not pretend to know how it
                  will vary in 2027.
                </li>
                <li>
                  New registrants are spread pro rata: each state grows by the
                  same multiplier. Registration drives do not land evenly, and a
                  state-level registration forecast is not something this
                  platform can defend.
                </li>
                <li>
                  Our share is applied uniformly as well. It is a target, not a
                  distribution — no state-level result is being asserted here.
                </li>
                <li>
                  No per-party 2023 vote counts are used anywhere. They are
                  deliberately excluded from this repository because the public
                  transcription of them is incomplete and uneven.
                </li>
                <li>
                  Polling day is taken as{" "}
                  {new Date(generalElection.expectedDate).toLocaleDateString(
                    "en-NG",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                  . {generalElection.note}
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-4">
                <Button asChild size="sm" variant="outline">
                  <Link href="/baseline">See the underlying register</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/coverage">Where we are covered today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
