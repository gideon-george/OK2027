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
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/shared/stat-tile";
import { coverage } from "@/lib/structure";
import { nationalBaseline, nationalUntapped } from "@/lib/baseline";
import { independenceDisclaimer, principals, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const pillars = [
  {
    title: "Mobilize",
    description:
      "Register members and drive turnout, polling unit by polling unit.",
    chip: "text-brand-red bg-brand-red/10",
  },
  {
    title: "Organize",
    description:
      "A working structure from national leadership down to every ward.",
    chip: "text-brand-blue bg-brand-blue/10",
  },
  {
    title: "Educate",
    description:
      "Civic education so every member knows the process and their rights.",
    chip: "text-brand-green bg-brand-green/10",
  },
  {
    title: "Deliver victory",
    description:
      "Turn structure and knowledge into votes counted on election day.",
    chip: "text-brand-blue bg-brand-blue/10",
  },
];

const routes = [
  {
    icon: Network,
    title: "The structure",
    href: "/structure",
    description:
      "Every national, zonal and state office — who holds it, and which are open.",
    chip: "text-brand-blue bg-brand-blue/10",
  },
  {
    icon: IdCard,
    title: "PVC drive",
    href: "/pvc",
    description:
      "Your PVC is the key. Register, collect it, and track the movement's progress.",
    chip: "text-brand-green bg-brand-green/10",
  },
  {
    icon: BookOpen,
    title: "Civic education",
    href: "/learn",
    description:
      "Eight practical lessons, from getting your PVC to reading a result sheet.",
    chip: "text-brand-red bg-brand-red/10",
  },
  {
    icon: Megaphone,
    title: "6-month action plan",
    href: "/action-plan",
    description:
      "What the movement is doing between now and the general election.",
    chip: "text-brand-blue bg-brand-blue/10",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    href: "/leaderboard",
    description:
      "How each state and LGA is performing on members, structures and reports.",
    chip: "text-brand-green bg-brand-green/10",
  },
  {
    icon: UserPlus,
    title: "Vacancies",
    href: "/vacancies",
    description:
      "Open coordinator posts across the federation. Step forward and serve.",
    chip: "text-brand-red bg-brand-red/10",
  },
];

function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}

export default function Home() {
  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="hero-surface relative overflow-hidden border-b">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-20 text-center sm:py-28">
          <Badge
            variant="outline"
            className="animate-fade-up border-brand-red/40 text-brand-red bg-background/60 px-3 py-1 backdrop-blur"
          >
            Towards the 2027 general election
          </Badge>

          <h1 className="animate-fade-up animation-delay-1 font-display max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            One movement. One goal.{" "}
            <span className="text-gradient-blue">A new Nigeria.</span>
          </h1>

          <p className="animate-fade-up animation-delay-2 text-muted-foreground max-w-2xl text-lg text-pretty sm:text-xl">
            The National OK Movement organises Nigerians — ward by ward,
            polling unit by polling unit — behind{" "}
            <strong className="text-foreground font-semibold">Peter Obi</strong>{" "}
            and{" "}
            <strong className="text-foreground font-semibold">
              Rabiu Kwankwaso
            </strong>
            . The &ldquo;O&rdquo; and the &ldquo;K&rdquo;.
          </p>

          <div className="animate-fade-up animation-delay-3 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-7 text-base shadow-lg shadow-primary/25">
              <Link href="/join">
                Join the movement <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/60 h-12 px-7 text-base backdrop-blur"
            >
              <Link href="/structure">See the structure</Link>
            </Button>
          </div>

          <div className="animate-fade-up animation-delay-4 flex flex-wrap items-center justify-center gap-3 pt-4">
            {principals.map((p) => (
              <span
                key={p.name}
                className="bg-background/70 flex items-center gap-3 rounded-full border py-1.5 pr-5 pl-1.5 backdrop-blur"
              >
                <span
                  aria-hidden
                  className={cn(
                    "font-display flex size-9 items-center justify-center rounded-full text-base font-extrabold",
                    p.letter === "O"
                      ? "bg-brand-red/10 text-brand-red"
                      : "bg-brand-blue/10 text-brand-blue"
                  )}
                >
                  {p.letter}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="text-muted-foreground block text-xs">
                    {p.office}
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- coverage */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-2 pb-5">
          <div>
            <p className="eyebrow text-brand-red">Live coverage</p>
            <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
              Where we stand
            </h2>
          </div>
          <Link
            href="/structure"
            className="text-primary text-sm font-medium hover:underline"
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

      {/* ----------------------------------------------------- the 63M band */}
      <section className="band-blue relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="eyebrow text-white/60">The 2023 lesson</p>
          <p className="text-gradient-light font-display pt-3 text-5xl font-extrabold tracking-tight tabular-nums sm:text-7xl">
            {fmt(nationalUntapped)}
          </p>
          <p className="font-display pt-2 text-xl font-bold text-balance sm:text-2xl">
            registered Nigerians did not vote in 2023.
          </p>
          <p className="max-w-2xl pt-4 leading-relaxed text-pretty text-white/80">
            Out of {fmt(nationalBaseline.registered)} on the register, only{" "}
            {fmt(nationalBaseline.accredited)} were accredited — a turnout of{" "}
            {nationalBaseline.turnoutPct}%. The last election was decided by the
            people who stayed home. They are already registered, they live in
            identifiable wards, and reaching them is this movement&apos;s
            entire job.
          </p>
          <div className="flex flex-wrap gap-3 pt-7">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#1a3a8f] shadow-lg hover:bg-white/90"
            >
              <Link href="/baseline">
                See the 2023 baseline <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/join">Register in your ward</Link>
            </Button>
          </div>
          <p className="pt-5 text-xs text-white/50">
            Derived from the open Nigeria 2.0 collation of INEC IReV result
            sheets · 176,379 polling units
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- method */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="eyebrow text-brand-red">How the movement works</p>
        <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
          {site.motto}
        </h2>
        <div className="grid gap-4 pt-7 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <div key={pillar.title} className="bg-card rounded-xl border p-5">
              <span
                className={cn(
                  "font-display inline-flex size-9 items-center justify-center rounded-lg text-sm font-extrabold",
                  pillar.chip
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display pt-3 text-lg font-bold">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- start here */}
      <section className="bg-accent/40 border-y">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow text-brand-red">Get involved</p>
          <h2 className="font-display pt-1 pb-7 text-3xl font-bold tracking-tight">
            Start here
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} className="group">
                <div className="card-lift bg-card hover:border-primary/50 h-full rounded-xl border p-5">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg",
                      route.chip
                    )}
                  >
                    <route.icon className="size-5" />
                  </span>
                  <h3 className="font-display pt-3 text-lg font-bold">
                    {route.title}
                  </h3>
                  <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                    {route.description}
                  </p>
                  <span className="text-primary inline-flex items-center gap-1 pt-3 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- disclaimer */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="bg-card relative overflow-hidden rounded-xl border p-6 sm:p-8">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <h2 className="font-display text-lg font-bold">
            What NOkM is — and is not
          </h2>
          <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
            {independenceDisclaimer}
          </p>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Membership is voluntary and free. Everything the movement does is
            peaceful, lawful and within INEC regulations.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/about">Read how we operate</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
