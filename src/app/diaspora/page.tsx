import type { Metadata } from "next";
import Link from "next/link";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterList } from "@/components/diaspora/chapter-list";
import { appointmentBySlug } from "@/lib/structure";

export const metadata: Metadata = {
  title: "Diaspora",
  description:
    "NOkM country chapters for Nigerians abroad — how to join one, and how to start one where none exists.",
};

const steps = [
  {
    title: "Find five people",
    detail:
      "A chapter starts with a handful of Nigerians in the same country who want to organise. Five committed people beats fifty names on a list.",
  },
  {
    title: "Write to the Diaspora Directorate",
    detail:
      "Contact the National Director of Diaspora Affairs with your country, your city, and who is willing to coordinate.",
  },
  {
    title: "Screening and recognition",
    detail:
      "The directorate screens the proposed coordinator, as it does for every appointment, then recognises the chapter formally.",
  },
  {
    title: "Start working",
    detail:
      "Chapters report like every other structure: weekly, up the ladder. Diaspora work is advocacy, fundraising support, and keeping family at home registered and voting.",
  },
];

export default function DiasporaPage() {
  const director = appointmentBySlug("national-director-diaspora");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <Globe className="text-brand-blue size-10" />
        <h1 className="font-display pt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Diaspora chapters
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Nigerians abroad are part of this movement. The Diaspora Directorate
          organises country chapters, coordinates international members, and
          connects them back to the wards their families vote in.
        </p>
      </header>

      {director?.filled && (
        <div className="mt-6 rounded-lg border p-4">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            National Director of Diaspora Affairs
          </p>
          <p className="pt-1 font-semibold">{director.holderName}</p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href={`/structure/${director.slug}`}>Contact this office</Link>
          </Button>
        </div>
      )}

      <section className="pt-12">
        <h2 className="font-display pb-1 text-2xl font-bold">
          Established chapters
        </h2>
        <p className="text-muted-foreground pb-6 text-sm">
          Recognised chapters and their membership.
        </p>
        <ChapterList />
      </section>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">
          Start a chapter where there is none
        </h2>
        <ol className="space-y-3 pt-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-lg border p-4">
              <span className="bg-brand-blue text-primary-foreground font-display flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-12">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Registering from abroad
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Diaspora members register by country and city rather than by ward
            and polling unit. If you still hold a PVC and a registered address
            in Nigeria, register with your state instead so you are counted in
            the ward where your vote lands.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/structure">See the full structure</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
