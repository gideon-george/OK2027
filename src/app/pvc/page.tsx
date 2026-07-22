import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PvcTracker } from "@/components/pvc/pvc-tracker";

export const metadata: Metadata = {
  title: "PVC drive",
  description:
    "Get your Permanent Voter Card and secure Nigeria's future. How to register, how to collect, and how the National OK Movement's PVC drive is progressing.",
};

const steps = [
  {
    title: "Register",
    detail:
      "Register with INEC — online through the INEC Voter Enrolment portal, or in person at an INEC office or registration centre in your area. You need to be 18 or older and a Nigerian citizen.",
  },
  {
    title: "Complete it in person",
    detail:
      "Online pre-registration is only half the process. You must attend a centre to have your fingerprints and photograph captured before your registration counts.",
  },
  {
    title: "Track and collect",
    detail:
      "Cards are collected in person from the INEC office or designated centre for your registration area. Check INEC's announcements for collection dates in your LGA.",
  },
  {
    title: "Tell your ward",
    detail:
      "Once you have it in hand, update your status here so your ward coordinator knows the ward is covered.",
  },
];

const problems = [
  {
    problem: "Your card has not arrived",
    answer:
      "Check with the INEC office for your LGA of registration. Cards are distributed by registration area, not by where you live now.",
  },
  {
    problem: "You have moved",
    answer:
      "You can apply to transfer your registration to your new location through INEC. Do it well before an election — transfers close early.",
  },
  {
    problem: "Your details are wrong",
    answer:
      "INEC runs a correction process for names, dates of birth and other details. Take valid identification with you.",
  },
  {
    problem: "Your card is lost or damaged",
    answer:
      "Report it to your INEC LGA office and apply for a replacement. Do not pay anyone who offers to fast-track it.",
  },
];

export default function PvcPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <IdCard className="text-brand-green size-10" />
        <h1 className="font-display pt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Get your PVC, secure Nigeria&apos;s future
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Your Permanent Voter Card is the key to liberation, progress and
          renewal. Without it, nothing else the movement does can reach a ballot
          box. Structure without PVCs is just a list of names.
        </p>
      </header>

      <div className="border-brand-red/30 bg-brand-red/5 mt-8 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-brand-red mt-0.5 size-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">
              Nobody in NOkM will ever ask for your PVC number
            </p>
            <p className="text-muted-foreground pt-1 leading-relaxed">
              We record only whether you have a card — never the number, never
              your VIN. Anyone asking you for those, or for money to get a card,
              is not us. Registration and collection are free.
            </p>
          </div>
        </div>
      </div>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">How to get one</h2>
        <ol className="space-y-3 pt-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-lg border p-4">
              <span className="bg-brand-green text-primary-foreground font-display flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
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
        <p className="text-muted-foreground pt-4 text-sm leading-relaxed">
          Registration windows, portals and collection dates are set by INEC and
          change between cycles. Always confirm the current process on official
          INEC channels — NOkM is not affiliated with INEC and cannot register
          you.
        </p>
      </section>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">If something goes wrong</h2>
        <div className="space-y-3 pt-5">
          {problems.map((item) => (
            <div key={item.problem} className="rounded-lg border p-4">
              <h3 className="font-semibold">{item.problem}</h3>
              <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      <section>
        <h2 className="font-display text-2xl font-bold">Our progress</h2>
        <p className="text-muted-foreground pt-1 pb-6 text-sm">
          Thursday is PVC day across the movement — every week, every level
          checks who has a card and plans for the rest.
        </p>
        <PvcTracker />
      </section>

      <section className="pt-12">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Record your status
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Members record their PVC status when they register, and can update
            it any time. It is a single yes, no, or in-progress — nothing more.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register and record it</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/learn/getting-your-pvc">Read the full lesson</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
