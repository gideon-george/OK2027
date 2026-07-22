import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  conductDisclaimer,
  independenceDisclaimer,
  principals,
  site,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "What the National OK Movement is, how it operates, and its relationship with the Nigeria Democratic Congress.",
};

const purpose = [
  {
    title: "Mobilization",
    description:
      "Register members, mobilise voters, and drive turnout at ward and polling-unit level.",
  },
  {
    title: "Coordination",
    description:
      "Maintain a structured ladder from National to Zonal, State, LGA, Ward and Unit so no community is left out.",
  },
  {
    title: "Advocacy & sensitization",
    description:
      "Communicate the vision, policies and activities of the principals the movement supports.",
  },
  {
    title: "Feedback loop",
    description:
      "Carry grassroots concerns back up to leadership so decisions are made with the ground in view.",
  },
];

const principles = [
  {
    title: "Voluntary membership",
    description:
      "Anyone who believes in the vision may join. No coercion, and no fee required to participate.",
  },
  {
    title: "Non-conflict with party structure",
    description:
      "We work with party structures where they exist. We never replace elected party executives.",
  },
  {
    title: "Discipline & accountability",
    description:
      "Every appointed executive must show visible engagement, mobilisation and financial accountability at their level.",
  },
  {
    title: "Non-violence",
    description:
      "All activity is peaceful, lawful and within INEC regulations. De-escalation always comes first.",
  },
  {
    title: "One person, one position",
    description:
      "No double office-holding across levels, so nobody's loyalties are divided and nobody blocks two seats.",
  },
  {
    title: "Privacy by default",
    description:
      "PVC and VIN numbers are never collected. Officer phone numbers are never published. What isn't needed isn't kept.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
        About the movement
      </h1>

      <div className="space-y-4 pt-5 leading-relaxed">
        <p>
          The {site.fullName} — NOkM — is an independent grassroots support
          movement working for{" "}
          {principals.map((p, i) => (
            <span key={p.name}>
              <strong className="font-semibold">{p.name}</strong> as {p.office}
              {i === 0 ? " and " : ""}
            </span>
          ))}{" "}
          in Nigeria&apos;s 2027 general election. The &ldquo;OK&rdquo; in the
          name is the two of them: Obi and Kwankwaso.
        </p>
        <p>
          The movement organises through a single chain — National, Zonal,
          State, LGA, Ward, Polling Unit — plus a diaspora directorate for
          Nigerians abroad. Directives travel down it. Reports travel back up it
          every week.
        </p>
        <p className="text-muted-foreground text-sm">{site.motto}</p>
      </div>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-semibold">
          What we exist to do
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {purpose.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display pb-3 text-xl font-semibold">
          Our relationship with the NDC
        </h2>
        <div className="space-y-3 leading-relaxed">
          <p>{independenceDisclaimer}</p>
          <p>
            We align with the party&apos;s candidates and programmes, but our
            internal appointments, structure and operations are managed by NOkM
            leadership. All our materials carry &ldquo;National OK Movement —
            NDC NOkM&rdquo; so nobody mistakes them for official party
            materials.
          </p>
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-semibold">
          How we operate
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <CardHeader>
                <CardTitle className="text-base">{principle.title}</CardTitle>
                <CardDescription>{principle.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display pb-3 text-xl font-semibold">
          Conduct and safety
        </h2>
        <p className="leading-relaxed">{conductDisclaimer}</p>
        <p className="text-muted-foreground pt-2 leading-relaxed">
          No officer of the movement will ever ask you for your PVC number, your
          BVN, your bank details or money in exchange for a position. If someone
          contacts you claiming to be NOkM and asks for any of these, it is not
          us — report it through the structure directory.
        </p>
      </section>

      <section className="pt-10">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Come and do the work
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Structure is built by people who show up. Register in your ward, or
            take one of the open coordinator posts.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Join the movement</Link>
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
