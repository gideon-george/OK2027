import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OfficerPortrait } from "@/components/shared/officer-portrait";
import { ContactActions } from "@/components/shared/contact-actions";
import { SocialLinks } from "@/components/shared/social-links";
import { nationalRoster, statusLabels, zonalRoster } from "@/lib/structure";
import { nationalCoordinator, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "The leadership of the National OK Movement — the National Coordinator, the National Working Committee and the zonal coordinators.",
};

/** Everyone on the national roster except the Coordinator, who leads the page. */
const workingCommittee = nationalRoster.filter(
  (a) => a.slug !== nationalCoordinator.appointmentSlug
);

export default function LeadershipPage() {
  return (
    <div>
      {/* ------------------------------------------- the National Coordinator */}
      <section className="hero-surface border-b">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="eyebrow text-brand-red">Leadership</p>
          <div className="grid gap-8 pt-6 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-start sm:gap-10">
            <OfficerPortrait
              name={nationalCoordinator.name}
              size="xl"
              tone="blue"
              className="max-w-[14rem] shadow-lg"
            />
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
                {nationalCoordinator.name}
              </h1>
              <p className="text-brand-blue pt-2 text-lg font-semibold text-pretty">
                {nationalCoordinator.title}
              </p>
              <p className="text-muted-foreground text-sm">
                {nationalCoordinator.organisation}
              </p>

              <blockquote className="border-brand-red/50 mt-6 border-l-2 pl-4">
                <p className="text-lg leading-relaxed text-pretty">
                  {nationalCoordinator.statement ?? site.rallyingCry}
                </p>
                <footer className="text-muted-foreground pt-2 text-xs">
                  {nationalCoordinator.statement
                    ? `${nationalCoordinator.name}, ${nationalCoordinator.title}`
                    : `The rallying cry of the movement. A signed statement from the Coordinator appears here once issued.`}
                </footer>
              </blockquote>

              <ContactActions
                className="pt-6"
                message="Hello NOkM, I would like to reach the office of the National Coordinator."
                subject="Message for the National Coordinator"
              />
              <SocialLinks className="pt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------ National Working Committee */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-1">
          <div>
            <p className="eyebrow text-brand-red">The national executive</p>
            <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
              National Working Committee
            </h2>
          </div>
          <Link
            href="/structure"
            className="text-primary text-sm font-medium hover:underline"
          >
            Full structure →
          </Link>
        </div>
        <p className="text-muted-foreground max-w-2xl pt-2 pb-8 text-sm leading-relaxed">
          The national executive of the movement, in the order set by{" "}
          <code className="text-xs">docs/nokm-framework.md</code>. An office
          with no name attached is open — see{" "}
          <Link href="/vacancies" className="underline">
            vacancies
          </Link>
          .
        </p>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {workingCommittee.map((appointment) => (
            <li key={appointment.slug}>
              <Link href={`/structure/${appointment.slug}`} className="group block">
                <OfficerPortrait
                  name={appointment.holderName}
                  tone={appointment.filled ? "blue" : "muted"}
                  size="lg"
                  className="group-hover:ring-primary/40 transition-shadow group-hover:ring-2"
                />
                <p className="font-display pt-2.5 text-sm leading-tight font-bold text-balance">
                  {appointment.holderName ?? "Open post"}
                </p>
                <p className="text-muted-foreground pt-0.5 text-xs leading-tight text-pretty">
                  {appointment.office.title}
                </p>
                {!appointment.filled && (
                  <Badge
                    variant="outline"
                    className="border-brand-red/40 text-brand-red mt-1.5 text-[0.65rem]"
                  >
                    {statusLabels[appointment.status]}
                  </Badge>
                )}
                {appointment.office.frameworkAddendum && (
                  <Badge variant="secondary" className="mt-1.5 text-[0.65rem]">
                    Framework addendum
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------ zonal coordinators */}
      <section className="bg-accent/40 border-y">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow text-brand-red">Six geopolitical zones</p>
          <h2 className="font-display pt-1 pb-8 text-3xl font-bold tracking-tight">
            Zonal coordinators
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {zonalRoster.map((appointment) => (
              <li key={appointment.slug}>
                <Link
                  href={`/structure/${appointment.slug}`}
                  className="group block"
                >
                  <OfficerPortrait
                    name={appointment.holderName}
                    tone={appointment.filled ? "green" : "muted"}
                    size="lg"
                    className="group-hover:ring-primary/40 transition-shadow group-hover:ring-2"
                  />
                  <p className="font-display pt-2.5 text-sm leading-tight font-bold text-balance">
                    {appointment.holderName ?? "Open post"}
                  </p>
                  <p className="text-muted-foreground pt-0.5 text-xs">
                    {appointment.scopeLabel}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ closing */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="bg-card relative overflow-hidden rounded-xl border p-6 sm:p-8">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <h2 className="font-display text-lg font-bold">
            Photographs of the executive
          </h2>
          <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
            Officers appear with their initials until they upload a portrait and
            record their consent to it being published. Officers can do that
            from their dashboard; the National Publicity Secretary approves each
            one before it appears here.
          </p>
          <div className="flex flex-wrap gap-3 pt-5">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                Officer sign-in <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/about">How the movement operates</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
