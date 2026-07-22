import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  IdCard,
  Megaphone,
  Network,
  Trophy,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/shared/stat-tile";
import { coverage } from "@/lib/structure";
import { independenceDisclaimer, principals, site } from "@/lib/site";

const pillars = [
  {
    title: "Mobilize",
    description:
      "Register members and drive turnout, polling unit by polling unit.",
  },
  {
    title: "Organize",
    description:
      "A working structure from national leadership down to every ward.",
  },
  {
    title: "Educate",
    description:
      "Civic education so every member knows the process and their rights.",
  },
  {
    title: "Deliver victory",
    description:
      "Turn structure and knowledge into votes counted on election day.",
  },
];

const routes = [
  {
    icon: Network,
    title: "The structure",
    href: "/structure",
    description:
      "Every national, zonal and state office — who holds it, and which are open.",
  },
  {
    icon: IdCard,
    title: "PVC drive",
    href: "/pvc",
    description:
      "Your PVC is the key. Register, collect it, and track the movement's progress.",
  },
  {
    icon: BookOpen,
    title: "Civic education",
    href: "/learn",
    description:
      "Eight practical lessons, from getting your PVC to reading a result sheet.",
  },
  {
    icon: Megaphone,
    title: "6-month action plan",
    href: "/action-plan",
    description:
      "What the movement is doing between now and the general election.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    href: "/leaderboard",
    description:
      "How each state and LGA is performing on members, structures and reports.",
  },
  {
    icon: UserPlus,
    title: "Vacancies",
    href: "/vacancies",
    description:
      "Open coordinator posts across the federation. Step forward and serve.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
          <Badge
            variant="outline"
            className="border-brand-red/40 text-brand-red"
          >
            Towards the 2027 general election
          </Badge>

          <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            One movement. One goal.{" "}
            <span className="text-brand-blue">A new Nigeria.</span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-lg text-pretty">
            The National OK Movement organises Nigerians — ward by ward, polling
            unit by polling unit — behind{" "}
            <strong className="text-foreground font-medium">Peter Obi</strong>{" "}
            and{" "}
            <strong className="text-foreground font-medium">
              Rabiu Kwankwaso
            </strong>
            . The &ldquo;O&rdquo; and the &ldquo;K&rdquo;.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/join">
                Join the movement <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/structure">See the structure</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2">
            {principals.map((p) => (
              <span key={p.name} className="text-muted-foreground text-sm">
                <strong className="text-foreground font-semibold">
                  {p.name}
                </strong>{" "}
                — {p.office}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
          <h2 className="font-display text-2xl font-bold">Where we stand</h2>
          <Link
            href="/structure"
            className="text-primary text-sm hover:underline"
          >
            Full structure →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            tone="blue"
            value={`${coverage.nationalFilled}/${coverage.nationalTotal}`}
            label="National offices"
            hint="Filled of established"
          />
          <StatTile
            tone="blue"
            value={`${coverage.zonesFilled}/${coverage.zonesTotal}`}
            label="Zones covered"
            hint="Zonal coordinators in post"
          />
          <StatTile
            tone="blue"
            value={`${coverage.statesFilled}/${coverage.statesTotal}`}
            label="States covered"
            hint="36 states and the FCT"
          />
          <StatTile
            tone="red"
            value={coverage.vacanciesTotal}
            label="Posts open"
            hint="Apply and serve"
          />
        </div>
        <p className="text-muted-foreground pt-3 text-xs">
          Structure figures come from the official roster. Membership figures
          appear here once member registration goes live.
        </p>
      </section>

      <section className="bg-accent/40 border-y">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-bold">
            How the movement works
          </h2>
          <p className="text-muted-foreground pt-1 text-sm">{site.motto}</p>
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className="bg-background rounded-lg border p-4"
              >
                <span className="text-brand-red font-display text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display pt-1 text-lg font-semibold">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground pt-1 text-sm">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display pb-6 text-2xl font-bold">Start here</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="group">
              <Card className="group-hover:border-primary/50 h-full transition-colors">
                <CardHeader>
                  <route.icon className="text-brand-blue mb-2 size-6" />
                  <CardTitle className="font-display">{route.title}</CardTitle>
                  <CardDescription>{route.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            What NOkM is — and is not
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            {independenceDisclaimer}
          </p>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Membership is voluntary and free. Everything the movement does is
            peaceful, lawful and within INEC regulations.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/about">Read how we operate</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
