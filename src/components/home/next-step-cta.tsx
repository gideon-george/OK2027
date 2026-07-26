"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  href: string;
  label: string;
  secondaryHref: string;
  secondaryLabel: string;
}

const STEPS: Record<string, Step> = {
  new: {
    href: "/join",
    label: "Join the movement",
    secondaryHref: "/coverage",
    secondaryLabel: "See the coverage map",
  },
  registered: {
    href: "/coverage/adopt",
    label: "Adopt your polling unit",
    secondaryHref: "/coverage",
    secondaryLabel: "Find the gap near you",
  },
  adopted: {
    href: "/bring-ten",
    label: "Now bring ten",
    secondaryHref: "/coverage/champions",
    secondaryLabel: "Wall of champions",
  },
  officer: {
    href: "/dashboard",
    label: "Open your dashboard",
    secondaryHref: "/coverage",
    secondaryLabel: "See the coverage map",
  },
};

/**
 * The next thing, not the thing they already did.
 *
 * Reads three local markers left by the join form, the adoption flow and the
 * officer sign-in. Nothing is sent anywhere — this is a read of localStorage on
 * the visitor's own device.
 *
 * Renders the "new visitor" pair on the server so the button is correct and
 * clickable before hydration, then upgrades.
 */
export function NextStepCta() {
  const [step, setStep] = useState<Step>(STEPS.new);

  useEffect(() => {
    try {
      const ls = window.localStorage;
      if (ls.getItem("nokm.officer") === "1") setStep(STEPS.officer);
      else if (ls.getItem("nokm.adopted") === "1") setStep(STEPS.adopted);
      else if (ls.getItem("nokm.referralCode")) setStep(STEPS.registered);
    } catch {
      /* private browsing — the default pair is a fine first ask */
    }
  }, []);

  return (
    <div className="animate-fade-up animation-delay-3 flex flex-wrap items-center justify-center gap-3">
      <Button asChild size="lg" className="h-12 px-7 text-base shadow-lg shadow-primary/25">
        <Link href={step.href}>
          {step.label} <ArrowRight className="size-4" />
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="bg-background/60 h-12 px-7 text-base backdrop-blur"
      >
        <Link href={step.secondaryHref}>{step.secondaryLabel}</Link>
      </Button>
    </div>
  );
}
