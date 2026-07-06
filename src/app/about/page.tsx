import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "What OK2027 is, the principles it runs on, and where the project is headed.",
};

const principles = [
  {
    title: "Participation over complaint",
    description:
      "The app celebrates showing up: registering, learning, organising, voting. Energy goes into turnout, not arguments.",
  },
  {
    title: "Facts, clearly labelled",
    description:
      "Anything documented must be evidence-based — photo, place, and time — and is always marked verified or unverified. Unverified never masquerades as verified.",
  },
  {
    title: "Never confrontation",
    description:
      "Nothing in OK2027 encourages confronting anyone. De-escalation and personal safety come before any document, photo, or result.",
  },
  {
    title: "Privacy by default",
    description:
      "Sensitive identifiers like PVC numbers and phone numbers are never stored in plaintext. What isn't needed isn't collected.",
  },
];

const badges = [
  { emoji: "✅", name: "Verified Voter", description: "Verified your PVC." },
  { emoji: "🛡️", name: "PU Champion", description: "Claimed and represents a polling unit." },
  { emoji: "📣", name: "Recruiter", description: "Brought new members into the community." },
  { emoji: "🎓", name: "Civic Scholar", description: "Completed all civic education lessons." },
  { emoji: "🌱", name: "Day-One", description: "Joined during the pilot phase." },
  { emoji: "🦸", name: "Election-Day Hero", description: "Actively participated on election day." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        About OK2027
      </h1>
      <div className="space-y-4 pt-4 leading-relaxed">
        <p>
          OK2027 is an independent community project for Nigerians organising
          peacefully ahead of the 2027 general elections. It grew out of the
          energy behind Peter Obi&apos;s and Rabiu Kwankwaso&apos;s movements —
          the &ldquo;O&rdquo; and the &ldquo;K&rdquo; — and it is open to
          everyone who believes participation beats complaint.
        </p>
        <p>
          The project is running as a small pilot: the Federal Capital
          Territory and Anambra State, targeting five thousand members. Start
          small, work properly, then grow.
        </p>
      </div>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-semibold">Principles</h2>
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
        <div className="flex items-center gap-2 pb-4">
          <h2 className="font-display text-xl font-semibold">
            Community badges
          </h2>
          <Badge variant="outline">coming with accounts</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <span className="text-xl">{badge.emoji}</span>
              <div>
                <p className="text-sm font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display pb-3 text-xl font-semibold">
          What&apos;s next
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          This site is the first public step. Accounts, polling-unit community
          spaces, events, and member profiles arrive as the pilot backend comes
          online. The civic education library and network map work today — no
          sign-up needed.
        </p>
      </section>
    </div>
  );
}
