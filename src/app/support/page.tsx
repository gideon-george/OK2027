import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, HandCoins, HandHeart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PledgeForm } from "@/components/support/pledge-form";
import { ContactActions } from "@/components/shared/contact-actions";
import { ShareBar } from "@/components/shared/share-bar";
import { cashSupport, supportRules } from "@/lib/support";
import { appointmentBySlug } from "@/lib/structure";

export const metadata: Metadata = {
  title: "Support NOkM",
  description:
    "Support the National OK Movement in cash or in kind — venues, vehicles, printing, airtime, professional services or your own hours. Membership stays free.",
};

const treasurer = appointmentBySlug("national-treasurer");
const financialSecretary = appointmentBySlug("national-financial-secretary");

export default function SupportPage() {
  return (
    <div>
      {/* ------------------------------------------------------------- hero */}
      <section className="hero-surface border-b">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
          <p className="eyebrow text-brand-red">Support the movement</p>
          <h1 className="font-display pt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Structure costs money and it costs hours.
          </h1>
          <p className="text-muted-foreground max-w-2xl pt-4 leading-relaxed">
            A ward meeting needs a hall. A PVC drive needs a bus. A weekly
            report needs data on somebody&apos;s phone. If you can give any of
            that, you are giving the movement exactly what it runs on.
          </p>
          <p className="pt-4 font-semibold">
            Membership is free and always will be. Nobody has to give anything
            to belong.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- the two paths */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="#in-kind"
            className="card-lift bg-card hover:border-primary/50 rounded-xl border p-5"
          >
            <span className="bg-brand-green/10 text-brand-green flex size-10 items-center justify-center rounded-lg">
              <HandHeart className="size-5" />
            </span>
            <h2 className="font-display pt-3 text-lg font-bold">
              Give in kind
            </h2>
            <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
              Venues, vehicles, printing, airtime, food, professional skills,
              your own time. Open now.
            </p>
            <span className="text-brand-green pt-3 inline-block text-sm font-semibold">
              Available today →
            </span>
          </a>

          <a
            href="#cash"
            className="card-lift bg-card hover:border-primary/50 rounded-xl border p-5"
          >
            <span className="bg-brand-blue/10 text-brand-blue flex size-10 items-center justify-center rounded-lg">
              <HandCoins className="size-5" />
            </span>
            <h2 className="font-display pt-3 text-lg font-bold">Give in cash</h2>
            <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
              Through a hosted checkout in the movement&apos;s registered name,
              with a published ledger.
            </p>
            <span className="text-muted-foreground pt-3 inline-block text-sm font-semibold">
              {cashSupport.enabled ? "Available today →" : "Opening shortly →"}
            </span>
          </a>
        </div>
      </section>

      {/* ----------------------------------------------------------- in kind */}
      <section id="in-kind" className="bg-accent/30 scroll-mt-20 border-y">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="eyebrow text-brand-red">Open now</p>
          <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
            Give in kind
          </h2>
          <p className="text-muted-foreground pt-2 pb-8 leading-relaxed">
            At this stage this is worth more than cash. A hall on a Saturday, a
            bus for a PVC run, five hundred posters, or four hours a week of
            your own time moves the movement further than most donations would.
          </p>
          <PledgeForm />
        </div>
      </section>

      {/* -------------------------------------------------------------- cash */}
      <section id="cash" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14">
        <p className="eyebrow text-brand-red">
          {cashSupport.enabled ? "Open" : "Not open yet"}
        </p>
        <h2 className="font-display pt-1 text-3xl font-bold tracking-tight">
          Give in cash
        </h2>

        {cashSupport.enabled && cashSupport.checkoutUrl ? (
          <div className="pt-6">
            <Button asChild size="lg">
              <a
                href={cashSupport.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Give through {cashSupport.processor}
              </a>
            </Button>
            <p className="text-muted-foreground pt-3 text-xs leading-relaxed">
              You are taken to {cashSupport.processor}&apos;s own secure page.
              This website never sees your card or account details.
            </p>
          </div>
        ) : (
          <div className="border-brand-blue/30 bg-brand-blue/5 mt-6 rounded-xl border p-5">
            <h3 className="font-display font-bold">
              We are not taking money yet — on purpose.
            </h3>
            <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
              Cash support opens when three things are in place, and not before:
            </p>
            <ol className="text-muted-foreground list-decimal space-y-1.5 pt-3 pl-5 text-sm leading-relaxed">
              <li>
                A payment account in the movement&apos;s registered name — never
                an individual&apos;s personal account.
              </li>
              <li>
                The National Treasurer
                {treasurer?.holderName ? ` (${treasurer.holderName})` : ""} and
                the National Financial Secretary
                {financialSecretary?.holderName
                  ? ` (${financialSecretary.holderName})`
                  : ""}{" "}
                publicly accountable for it.
              </li>
              <li>
                A Nigerian election lawyer&apos;s review of what we are allowed
                to receive and from whom.
              </li>
            </ol>
            <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
              Until then, anybody asking you to send money &ldquo;to NOkM&rdquo;
              is not authorised by this movement. Give in kind instead, or talk
              to us directly.
            </p>
            <ContactActions
              className="pt-4"
              size="sm"
              message="I want to support NOkM financially. How can I do that safely?"
              subject="Financial support enquiry"
            />
          </div>
        )}

        {/* ------------------------------------------------- accountability */}
        <div className="mt-8 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-brand-green size-5" />
            <h3 className="font-display font-bold">
              The rules, before you give anything
            </h3>
          </div>
          <ul className="text-muted-foreground list-disc space-y-2 pt-3 pl-5 text-sm leading-relaxed">
            {supportRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-5">
            <Button asChild variant="outline" size="sm">
              <Link href="/support/ledger">
                <BookOpenCheck className="size-3.5" /> See the public ledger
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/about">How the movement operates</Link>
            </Button>
          </div>
        </div>

        <div className="border-brand-red/30 bg-brand-red/5 mt-6 rounded-xl border p-5">
          <h3 className="font-display font-bold">If someone asks you for money</h3>
          <ul className="text-muted-foreground list-disc space-y-2 pt-3 pl-5 text-sm leading-relaxed">
            <li>
              No officer of this movement will ever ask for your bank details,
              your BVN or your PVC number.
            </li>
            <li>
              No position, appointment or endorsement in NOkM is for sale, at
              any level.
            </li>
            <li>
              Check anyone claiming to collect for NOkM against the{" "}
              <Link href="/structure" className="underline">
                structure directory
              </Link>{" "}
              first, and report them to us.
            </li>
          </ul>
        </div>

        <ShareBar
          className="mt-10"
          title="Ask your circle"
          message="NOkM runs on halls, buses, printing and volunteer hours. If you can give any of it:"
          path="/support"
        />
      </section>
    </div>
  );
}
