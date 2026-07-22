import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/shared/stat-tile";
import { AppointmentCard } from "@/components/structure/appointment-card";
import {
  appointmentsForState,
  coverage,
  nationalRoster,
  zoneCoverage,
} from "@/lib/structure";
import { geoForState } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Structure",
  description:
    "The full NOkM structure — national executives, zonal coordinators and state coordinators across all 36 states and the FCT. Filled posts and open vacancies.",
};

export default function StructurePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          The structure
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          NOkM runs on a command ladder: National → Zonal → State → LGA → Ward →
          Polling Unit, plus a Diaspora directorate. Directives flow down it and
          reports flow back up it every week.
        </p>
        <p className="text-muted-foreground pt-2 text-sm">
          Posts shown with a dashed border are open. Nothing here is hidden — an
          empty office is a job waiting for someone to do it.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 pt-8 sm:grid-cols-4">
        <StatTile
          tone="blue"
          value={`${coverage.nationalFilled}/${coverage.nationalTotal}`}
          label="National offices"
        />
        <StatTile
          tone="blue"
          value={`${coverage.zonesFilled}/${coverage.zonesTotal}`}
          label="Zones covered"
        />
        <StatTile
          tone="blue"
          value={`${coverage.statesFilled}/${coverage.statesTotal}`}
          label="States covered"
        />
        <StatTile tone="red" value={coverage.vacanciesTotal} label="Posts open" />
      </div>

      <section className="pt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
          <h2 className="font-display text-2xl font-bold">
            National executives
          </h2>
          <Link href="/vacancies" className="text-primary text-sm hover:underline">
            Open posts →
          </Link>
        </div>
        <p className="text-muted-foreground pb-5 text-sm">
          The national executive of the movement, in the order set by the
          framework.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nationalRoster.map((appointment) => (
            <AppointmentCard key={appointment.slug} appointment={appointment} />
          ))}
        </div>
      </section>

      <section className="pt-14">
        <h2 className="font-display text-2xl font-bold">
          Zones and states
        </h2>
        <p className="text-muted-foreground pt-1 pb-6 text-sm">
          Six geopolitical zones, 36 states and the Federal Capital Territory.
        </p>

        <div className="space-y-10">
          {zoneCoverage.map((zone) => (
            <div key={zone.code}>
              <div className="flex flex-wrap items-center gap-3 pb-1">
                <h3 className="font-display text-xl font-semibold">
                  {zone.name}
                </h3>
                <Badge variant="secondary">{zone.code}</Badge>
                <Badge
                  variant="outline"
                  className={
                    zone.statesFilled === zone.statesTotal
                      ? "border-brand-green/40 text-brand-green"
                      : "text-muted-foreground"
                  }
                >
                  {zone.statesFilled}/{zone.statesTotal} states covered
                </Badge>
              </div>
              <p className="text-muted-foreground pb-4 text-sm">{zone.blurb}</p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {zone.coordinator && (
                  <AppointmentCard
                    appointment={zone.coordinator}
                    showScope
                  />
                )}
                {zone.states.map(({ state, coordinator }) => {
                  if (!coordinator) return null;
                  const geo = geoForState(state.code);
                  const extras = appointmentsForState(state.code).filter(
                    (a) => a.office.slug !== "state-coordinator"
                  );
                  return (
                    <div key={state.code} className="flex flex-col gap-2">
                      <AppointmentCard appointment={coordinator} showScope />
                      {geo && (
                        <p className="text-muted-foreground px-1 text-xs">
                          {geo.lgas} LGAs · {geo.wards.toLocaleString()} wards ·{" "}
                          {geo.pollingUnits.toLocaleString()} units
                        </p>
                      )}
                      {extras.map((extra) => (
                        <AppointmentCard
                          key={extra.slug}
                          appointment={extra}
                          showScope
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-14">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Below state level
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            LGA, ward and polling-unit posts are appointed by their State
            Coordinator and appear here as each state completes its structure.
            The full register is loaded: all 774 LGAs, 8,874 wards and 176,379
            polling units across the federation.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register in your ward</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/vacancies">See open posts</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
