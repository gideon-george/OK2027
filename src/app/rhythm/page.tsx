import type { Metadata } from "next";
import Link from "next/link";
import { RhythmList } from "@/components/rhythm/rhythm-list";

export const metadata: Metadata = {
  title: "Weekly rhythm",
  description:
    "What the National OK Movement works on each day of the week — the movement's published Monday-to-Sunday operating cycle.",
};

const reportTemplate = [
  "Lead Officer name",
  "Position in NOkM",
  "Support Officer name",
  "Position in NOkM",
  "KPIs",
  "Date",
];

export default function RhythmPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          Our weekly rhythm
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          The movement runs to a fixed weekly cycle. Every day has a focus, a
          lead officer who runs that day&apos;s session, and a support officer
          who keeps order until it ends.
        </p>
      </header>

      <div className="pt-8">
        <RhythmList />
      </div>

      <section className="pt-12">
        <h2 className="font-display text-xl font-semibold">
          The reporting template
        </h2>
        <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
          Every session is logged in the same format the movement already uses.
          Sessions are scheduled by week and day — for example{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">WK:1 Day 12</code>.
        </p>
        <ol className="grid gap-2 pt-4 sm:grid-cols-2">
          {reportTemplate.map((field, i) => (
            <li
              key={field}
              className="flex items-center gap-3 rounded-md border p-3 text-sm"
            >
              <span className="text-muted-foreground font-display text-xs font-bold">
                {i + 1}
              </span>
              {field}
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground pt-4 text-sm leading-relaxed">
          Officers submit this from the{" "}
          <Link href="/dashboard" className="text-primary underline">
            dashboard
          </Link>{" "}
          rather than by message, so nothing scrolls away and every report
          counts towards the quarterly scorecard.
        </p>
      </section>

      <section className="pt-10">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Standing order for sessions
          </h2>
          <ul className="text-muted-foreground list-disc space-y-2 pt-3 pl-5 text-sm leading-relaxed">
            <li>
              The scheduled lead officer handles the training or lecture for
              that day. The National Coordinator may be invited in for clarity.
            </li>
            <li>
              The support officer keeps decorum, removes interrupting messages,
              and holds the standing order until the session ends.
            </li>
            <li>
              Do not walk or work alone — help in one form or another is never
              far away.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
