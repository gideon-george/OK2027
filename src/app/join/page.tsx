import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { JoinForm } from "@/components/join/join-form";

export const metadata: Metadata = {
  title: "Join the movement",
  description:
    "Register as a member of the National OK Movement. Free, voluntary, and organised down to your ward.",
};

const assurances = [
  "Membership is free and voluntary — there is no fee to join or to participate.",
  "We never ask for your PVC number or VIN, only whether you have a PVC.",
  "Your details are used to organise you in your ward, and for nothing else.",
];

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Join the movement
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Registering puts you on the map in your own ward. It tells your state
          coordinator you exist, and it turns the movement&apos;s membership
          from an estimate into a number.
        </p>
      </header>

      <div className="bg-muted/40 mt-6 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-brand-green mt-0.5 size-5 shrink-0" />
          <ul className="space-y-1.5 text-sm">
            {assurances.map((line) => (
              <li key={line} className="text-muted-foreground leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8">
        <JoinForm />
      </div>

      <p className="text-muted-foreground pt-8 text-xs leading-relaxed">
        Read the full{" "}
        <Link href="/privacy" className="underline">
          privacy notice
        </Link>{" "}
        for what is collected, how long it is kept, and how to have it deleted.
      </p>
    </div>
  );
}
