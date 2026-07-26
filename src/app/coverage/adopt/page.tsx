import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AdoptForm } from "@/components/coverage/adopt-form";
import { Skeleton } from "@/components/ui/skeleton";
import { darkUnits, fmt } from "@/lib/coverage";

export const metadata: Metadata = {
  title: "Adopt a polling unit",
  description:
    "Claim the polling unit where you vote and stand for it. One person, one unit — from registration through to the count.",
};

export default function AdoptPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/coverage"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> The coverage map
      </Link>

      <header className="pt-4">
        <p className="eyebrow text-brand-red">
          {fmt(darkUnits)} units still dark
        </p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Take your polling unit.
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          Elections in Nigeria are won and lost at the polling unit. Not the
          state, not the LGA — the unit where you personally vote. Claim yours,
          and the movement knows there is someone standing there.
        </p>
        <ul className="text-muted-foreground list-disc space-y-1.5 pt-4 pl-5 text-sm leading-relaxed">
          <li>One person, one unit.</li>
          <li>
            You do not need to be a registered member first — though bringing
            ten people afterwards is the whole idea.
          </li>
          <li>
            Your LGA Coordinator confirms the claim and gets in touch. Your name
            and number are never published.
          </li>
        </ul>
      </header>

      <div className="pt-10">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <AdoptForm />
        </Suspense>
      </div>
    </div>
  );
}
