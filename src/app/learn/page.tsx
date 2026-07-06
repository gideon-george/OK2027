import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lessons } from "@/lib/lessons";

export const metadata: Metadata = {
  title: "Civic education",
  description:
    "Eight practical lessons on voting, polling units, BVAS, result verification, and peaceful participation in Nigeria's 2027 elections.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Civic education
      </h1>
      <p className="pt-2 text-muted-foreground">
        Eight short, practical lessons. Read them in order or jump to what you
        need — each one stands alone.
      </p>
      <div className="grid gap-4 pt-8">
        {lessons.map((lesson) => (
          <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="group">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-lg">
                    {lesson.orderIndex}. {lesson.title}
                  </CardTitle>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {lesson.minutes} min
                  </span>
                </div>
                <CardDescription>{lesson.summary}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
