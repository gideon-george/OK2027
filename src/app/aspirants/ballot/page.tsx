import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { YourBallot } from "@/components/aspirants/your-ballot";
import { ShareBar } from "@/components/shared/share-bar";

export const metadata: Metadata = {
  title: "Your ballot 2027",
  description:
    "The five races that decide who represents you in 2027 — President, Governor, Senate, House of Representatives and State Assembly — for your own ward.",
};

export default function BallotPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/aspirants"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> Aspirants
      </Link>

      <header className="pt-4">
        <p className="eyebrow text-brand-red">Know what you are voting for</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Your ballot, 2027
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          Five separate contests decide who represents you. Set your ward once —
          it is saved on this phone and nowhere else.
        </p>
      </header>

      <div className="pt-10">
        <YourBallot />
      </div>

      <ShareBar
        className="mt-12"
        title="Send it to your ward group"
        message="Do you know which state constituency you vote in? Most people don't. Build your 2027 ballot:"
        path="/aspirants/ballot"
      />
    </div>
  );
}
