import Link from "next/link";
import { BookOpen, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lessons } from "@/lib/lessons";

const pillars = [
  {
    icon: BookOpen,
    title: "Learn",
    href: "/learn",
    description:
      "Eight practical civic-education lessons: from getting your PVC to reading a result sheet.",
  },
  {
    icon: MapPin,
    title: "Find your unit",
    href: "/network",
    description:
      "Nigeria votes polling unit by polling unit. Explore the pilot network across FCT and Anambra.",
  },
  {
    icon: Users,
    title: "Organise",
    href: "/about",
    description:
      "Neighbours who know each other and show up together are the strongest civic force in the country.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Pilot — FCT &amp; Anambra
        </Badge>
        <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Your vote is a plan,{" "}
          <span className="text-primary">not a wish.</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          OK2027 is a community for Nigerians organising peacefully ahead of
          the 2027 elections — supporters of Peter Obi, Rabiu Kwankwaso, and
          everyone who believes participation beats complaint.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/learn">Start learning</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/network">Explore the network</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <Link key={pillar.href} href={pillar.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <pillar.icon className="mb-2 size-6 text-primary" />
                <CardTitle className="font-display">{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section className="border-t py-16">
        <div className="flex items-baseline justify-between pb-6">
          <h2 className="font-display text-2xl font-bold">Start with a lesson</h2>
          <Link href="/learn" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {lessons.slice(0, 4).map((lesson) => (
            <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-base">
                    {lesson.orderIndex}. {lesson.title}
                  </CardTitle>
                  <CardDescription>{lesson.summary}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
