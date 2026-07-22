import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  actionPhases,
  actionPlanMeta,
  itemsForPhase,
  totalWeeks,
} from "@/lib/action-plan";

export const metadata: Metadata = {
  title: "6-Month Victory Action Plan",
  description:
    "The National OK Movement's 6-Month Victory Action Plan towards the 2027 general election — four phases, week by week, with the office accountable for each deliverable.",
};

export default function ActionPlanPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="max-w-3xl">
        <Badge variant="outline" className="border-brand-red/40 text-brand-red">
          {actionPlanMeta.subtitle}
        </Badge>
        <h1 className="font-display pt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {actionPlanMeta.title}
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          {totalWeeks} weeks, four phases, and a named office accountable for
          every deliverable. This is the plan the movement is working to — not a
          poster, a schedule anyone can hold us to.
        </p>
      </header>

      <div className="grid gap-3 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {actionPlanMeta.pillars.map((pillar, i) => (
          <div key={pillar} className="rounded-lg border p-4">
            <p className="text-brand-red font-display text-sm font-bold">
              {actionPlanMeta.verbs[i]}
            </p>
            <p className="pt-1 text-sm font-medium">{pillar}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/40 mt-8 rounded-lg border p-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          <strong className="text-foreground font-medium">
            On the dates below:
          </strong>{" "}
          {actionPlanMeta.dataStatus}
        </p>
      </div>

      <div className="space-y-12 pt-12">
        {actionPhases.map((phase, phaseIndex) => {
          const items = itemsForPhase(phase.slug);
          return (
            <section key={phase.slug} id={phase.slug} className="scroll-mt-20">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-brand-blue text-primary-foreground font-display flex size-9 items-center justify-center rounded-full text-sm font-bold">
                  {phaseIndex + 1}
                </span>
                <h2 className="font-display text-2xl font-bold">
                  {phase.name}
                </h2>
                <Badge variant="secondary">Weeks {phase.weeks}</Badge>
                <Badge
                  variant="outline"
                  className="border-brand-red/40 text-brand-red"
                >
                  {phase.verb}
                </Badge>
              </div>
              <p className="text-muted-foreground pt-2 pl-12 text-sm leading-relaxed">
                {phase.summary}
              </p>

              <ol className="mt-5 space-y-3 sm:pl-12">
                {items.map((item) => (
                  <li
                    key={`${item.week}-${item.title}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-muted-foreground font-display text-xs font-bold tracking-wider uppercase">
                        WK {item.week}
                      </span>
                      <h3 className="font-semibold text-balance">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground pt-2 text-sm">
                      <span className="text-foreground font-medium">
                        Deliverable:
                      </span>{" "}
                      {item.deliverable}
                    </p>
                    {item.owner && (
                      <p className="text-muted-foreground pt-1 text-sm">
                        <span className="text-foreground font-medium">
                          Lead office:
                        </span>{" "}
                        {item.owner.title}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      <Separator className="my-12" />

      <section>
        <p className="font-display text-brand-blue text-lg font-semibold text-balance">
          {actionPlanMeta.closing}
        </p>
        <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
          Progress against each item is updated by the accountable office from
          the{" "}
          <Link href="/dashboard" className="text-primary underline">
            officer dashboard
          </Link>
          . Live status appears here once the reporting system is switched on —
          until then this page shows the plan, not claimed progress.
        </p>
      </section>
    </div>
  );
}
