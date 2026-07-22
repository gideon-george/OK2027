import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyButton } from "@/components/structure/apply-button";
import { statusLabels, vacancies, type Appointment } from "@/lib/structure";

export const metadata: Metadata = {
  title: "Vacancies",
  description:
    "Open posts across the National OK Movement — national, zonal and state offices currently accepting applications.",
};

const groups: Array<{
  id: string;
  heading: string;
  blurb: string;
  match: (a: Appointment) => boolean;
}> = [
  {
    id: "national",
    heading: "National offices",
    blurb:
      "Directorates on the national executive. Appointed by the National Coordinator after vetting.",
    match: (a) => a.scopeType === "national" || a.scopeType === "diaspora",
  },
  {
    id: "zonal",
    heading: "Zonal coordinators",
    blurb:
      "Each zonal coordinator maps their zone and recruits the state coordinators beneath them.",
    match: (a) => a.scopeType === "zone",
  },
  {
    id: "state",
    heading: "State coordinators",
    blurb:
      "The heart of the movement. A state coordinator builds LGA, ward and polling-unit structures across their state.",
    match: (a) => a.scopeType === "state",
  },
];

function VacancyRow({ appointment }: { appointment: Appointment }) {
  const title =
    appointment.scopeType === "national" || appointment.scopeType === "diaspora"
      ? appointment.office.title
      : `${appointment.scopeLabel} — ${appointment.office.shortTitle}`;

  return (
    <div
      id={appointment.slug}
      className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-balance">{title}</h3>
        <p className="text-muted-foreground pt-1 text-sm">
          {appointment.office.mandate}
        </p>
        <Badge
          variant="outline"
          className="border-brand-red/40 text-brand-red mt-2"
        >
          {statusLabels[appointment.status]}
        </Badge>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/structure/${appointment.slug}`}>Details</Link>
        </Button>
        <ApplyButton appointmentSlug={appointment.slug} postTitle={title} />
      </div>
    </div>
  );
}

export default function VacanciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand-red">Step forward and serve</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Vacancies
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          {vacancies.length} posts across the movement are currently open. Every
          applicant is screened and vetted before appointment — integrity
          screening is a standing requirement of the framework, not a formality.
        </p>
      </header>

      <nav
        aria-label="Jump to level"
        className="flex flex-wrap gap-2 pt-6 text-sm"
      >
        {groups.map((group) => {
          const count = vacancies.filter(group.match).length;
          if (count === 0) return null;
          return (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="hover:bg-accent rounded-md border px-3 py-1.5"
            >
              {group.heading}{" "}
              <span className="text-muted-foreground">({count})</span>
            </a>
          );
        })}
      </nav>

      <div className="space-y-12 pt-10">
        {groups.map((group) => {
          const items = vacancies.filter(group.match);
          if (items.length === 0) return null;
          return (
            <section key={group.id} id={group.id} className="scroll-mt-20">
              <h2 className="font-display text-2xl font-bold">
                {group.heading}
              </h2>
              <p className="text-muted-foreground pt-1 pb-5 text-sm">
                {group.blurb}
              </p>
              <div className="space-y-3">
                {items.map((appointment) => (
                  <VacancyRow key={appointment.slug} appointment={appointment} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="pt-14">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Not ready to lead yet?
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Every structure starts with members. Register in your ward first —
            coordinators are appointed from people already doing the work.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/join">Join the movement</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
