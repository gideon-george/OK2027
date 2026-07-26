import type { Metadata } from "next";
import Link from "next/link";
import { BringTen } from "@/components/join/bring-ten";
import { ShareBar } from "@/components/shared/share-bar";

export const metadata: Metadata = {
  title: "Each one bring ten",
  description:
    "Your NOkM referral code, how many people have joined through you, and where you rank in your own ward.",
};

export default function BringTenPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <p className="eyebrow text-brand-red">The multiplier</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Each one bring ten.
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          Nothing about this is complicated. If every member brings ten people
          from their own street, their own market, their own church or mosque,
          the movement covers Nigeria without a single billboard.
        </p>
        <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
          You are ranked inside your own ward, not against the whole country. A
          national table is winnable by about twenty people. A ward table is
          winnable by you.
        </p>
      </header>

      <div className="pt-10">
        <BringTen />
      </div>

      <section className="pt-10">
        <div className="bg-accent/40 rounded-xl border p-5 text-sm leading-relaxed">
          <h2 className="font-display pb-2 font-bold">
            What NOkM will never do
          </h2>
          <ul className="text-muted-foreground list-disc space-y-1.5 pl-5">
            <li>Pay you for referrals. This is not a network scheme.</li>
            <li>
              Ask for your bank details, BVN or PVC number — not to register, not
              to refer, not ever.
            </li>
            <li>Charge anybody to join. Membership is free.</li>
          </ul>
          <p className="text-muted-foreground pt-3">
            If someone claiming to be NOkM asks you for money to register
            someone, it is not us.{" "}
            <Link href="/about" className="underline">
              Check how we operate
            </Link>
            .
          </p>
        </div>
      </section>

      <ShareBar
        className="mt-10"
        title="Bring your ten"
        message="I'm bringing ten people into the National OK Movement. Ward by ward, we can turn out a new Nigeria:"
        path="/bring-ten"
      />
    </div>
  );
}
