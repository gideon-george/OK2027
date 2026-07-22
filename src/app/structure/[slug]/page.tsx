import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ContactOfficeForm } from "@/components/structure/contact-office-form";
import { AppointmentCard } from "@/components/structure/appointment-card";
import {
  appointmentBySlug,
  appointments,
  appointmentsForState,
  statusLabels,
  zoneCoverage,
} from "@/lib/structure";

export function generateStaticParams() {
  return appointments.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const appointment = appointmentBySlug(slug);
  if (!appointment) return { title: "Office not found" };

  const title =
    appointment.scopeType === "national" || appointment.scopeType === "diaspora"
      ? appointment.office.title
      : `${appointment.scopeLabel} — ${appointment.office.title}`;

  return {
    title,
    description: appointment.filled
      ? `${title}: held by ${appointment.holderName}. ${appointment.office.mandate}`
      : `${title} is open. ${appointment.office.mandate}`,
  };
}

export default async function OfficePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const appointment = appointmentBySlug(slug);
  if (!appointment) notFound();

  const { office, filled, holderName, scopeLabel, scopeType, status } =
    appointment;

  const heading =
    scopeType === "national" || scopeType === "diaspora"
      ? office.title
      : `${scopeLabel} ${office.shortTitle}`;

  // Posts sitting directly beneath this one, so the page reads as a real
  // chain of command rather than an isolated card.
  const zone =
    scopeType === "zone"
      ? zoneCoverage.find((z) => z.code === appointment.scopeCode)
      : undefined;
  const statesBelow = zone?.states.map((s) => s.coordinator).filter(Boolean) ?? [];
  const alsoInState =
    scopeType === "state"
      ? appointmentsForState(appointment.scopeCode).filter(
          (a) => a.slug !== appointment.slug
        )
      : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/structure"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> All offices
      </Link>

      <header className="pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {scopeType === "national"
              ? "National"
              : scopeType === "diaspora"
                ? "Diaspora"
                : scopeType === "zone"
                  ? "Zonal"
                  : "State"}
          </Badge>
          {office.frameworkAddendum && (
            <Badge variant="outline">Framework addendum</Badge>
          )}
        </div>

        <h1 className="font-display pt-3 text-3xl font-bold tracking-tight text-balance">
          {heading}
        </h1>

        <div className="pt-4">
          {filled ? (
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Currently held by
              </p>
              <p className="font-display pt-1 text-xl font-semibold">
                {holderName}
              </p>
              <Badge
                variant="outline"
                className="border-brand-green/40 text-brand-green mt-2"
              >
                {statusLabels[status]}
              </Badge>
            </div>
          ) : (
            <div className="border-brand-red/30 bg-brand-red/5 rounded-lg border border-dashed p-4">
              <p className="font-display text-lg font-semibold">
                This post is open
              </p>
              <p className="text-muted-foreground pt-1 text-sm">
                {statusLabels[status]}. Applications are screened and vetted
                before appointment.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href={`/vacancies#${appointment.slug}`}>
                  Apply for this post
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <section className="pt-10">
        <h2 className="font-display text-xl font-semibold">Mandate</h2>
        <p className="pt-2 leading-relaxed">{office.mandate}</p>
      </section>

      <section className="pt-8">
        <h2 className="font-display text-xl font-semibold">Duties</h2>
        <ul className="space-y-2 pt-3">
          {office.duties.map((duty) => (
            <li key={duty} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="text-brand-blue mt-0.5 size-4 shrink-0" />
              <span>{duty}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-8">
        <h2 className="font-display text-xl font-semibold">
          Key performance indicators
        </h2>
        <p className="text-muted-foreground pt-1 text-sm">
          Measured quarterly, alongside the ten general executive KPIs that
          apply to every officer.
        </p>
        <ul className="space-y-2 pt-3">
          {office.kpis.map((kpi) => (
            <li key={kpi} className="flex items-start gap-2 text-sm">
              <Target className="text-brand-red mt-0.5 size-4 shrink-0" />
              <span>{kpi}</span>
            </li>
          ))}
        </ul>
      </section>

      {statesBelow.length > 0 && (
        <section className="pt-10">
          <h2 className="font-display pb-3 text-xl font-semibold">
            States in this zone
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {statesBelow.map((s) => (
              <AppointmentCard key={s!.slug} appointment={s!} showScope />
            ))}
          </div>
        </section>
      )}

      {alsoInState.length > 0 && (
        <section className="pt-10">
          <h2 className="font-display pb-3 text-xl font-semibold">
            Other {scopeLabel} offices
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {alsoInState.map((a) => (
              <AppointmentCard key={a.slug} appointment={a} showScope />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-10" />

      <section>
        <h2 className="font-display text-xl font-semibold">
          Contact this office
        </h2>
        <p className="text-muted-foreground pt-1 pb-4 text-sm leading-relaxed">
          Officer phone numbers are not published. Send a message here and it
          reaches the office directly — this protects officers from
          impersonation and from people posing as the movement to solicit money.
        </p>
        <ContactOfficeForm
          appointmentSlug={appointment.slug}
          officeTitle={heading}
        />
      </section>
    </div>
  );
}
