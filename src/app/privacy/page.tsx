import type { Metadata } from "next";
import Link from "next/link";
import { currentPolicyVersion, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How the National OK Movement collects, uses and protects member data under the Nigeria Data Protection Act 2023.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Privacy notice
      </h1>
      <p className="text-muted-foreground pt-2 text-sm">
        Version {currentPolicyVersion}. This notice is written to meet the
        Nigeria Data Protection Act 2023 (NDPA).
      </p>

      <div className="space-y-8 pt-8 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold">
            Who controls your data
          </h2>
          <p className="pt-2">
            The {site.longName} is the data controller for information collected
            through this platform. The National Director of ICT/New Media
            operates the platform and the National Director of Security &amp;
            Strategy owns the protection protocols. You can reach either office
            through the{" "}
            <Link href="/structure" className="text-primary underline">
              structure directory
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">
            What we collect
          </h2>
          <ul className="list-disc space-y-2 pt-2 pl-5">
            <li>
              <strong>Your name and phone number</strong> — to identify you as a
              member and to verify that the registration is genuinely yours.
            </li>
            <li>
              <strong>Your state, LGA and ward</strong> — to place you in the
              right structure so your local coordinator can organise with you.
            </li>
            <li>
              <strong>Whether you hold a PVC</strong> — a yes, no, or
              in-progress answer, used to measure the movement&apos;s PVC drive.
            </li>
            <li>
              <strong>A referral code</strong>, if you joined through another
              member&apos;s link.
            </li>
            <li>
              <strong>Your consent record</strong> — the version of this notice
              you agreed to and the time you agreed.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">
            What we never collect
          </h2>
          <p className="pt-2">
            We do not collect your <strong>PVC number</strong> or your{" "}
            <strong>Voter Identification Number (VIN)</strong>. We do not ask
            for your bank details, your Bank Verification Number, or your
            National Identification Number. No officer of the movement is
            authorised to request any of these on our behalf — if someone does,
            it is not us.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">
            Our lawful basis
          </h2>
          <p className="pt-2">
            We process your data on the basis of your <strong>consent</strong>,
            given by ticking the consent box when you register. Membership of a
            political movement reveals political opinion, which the NDPA treats
            as sensitive personal data — so consent is explicit, is never
            pre-ticked, and is recorded with a timestamp and the version of this
            notice you saw.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">
            Who can see it
          </h2>
          <ul className="list-disc space-y-2 pt-2 pl-5">
            <li>
              Coordinators can see members within their own scope only — a ward
              coordinator sees their ward, not the state.
            </li>
            <li>
              Aggregate counts (how many members in a ward, an LGA, a state) are
              shown publicly. Individual member records never are.
            </li>
            <li>
              We do not sell, rent or share member data with any party, campaign,
              advertiser or data broker. This site carries no advertising
              trackers and no analytics that identify you.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">How long we keep it</h2>
          <p className="pt-2">
            Member records are kept for the duration of the 2027 general
            election cycle and for twelve months afterwards, unless you ask us to
            delete them sooner. Applications for office are kept for the same
            period so appointment decisions remain auditable.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Your rights</h2>
          <p className="pt-2">
            Under the NDPA you may ask us to show you the data we hold about
            you, correct it, delete it, or stop processing it. You may withdraw
            consent at any time — withdrawing consent removes you from the
            membership register and does not affect anything done before you
            withdrew.
          </p>
          <p className="pt-2">
            To make any of these requests, contact the National Director of
            ICT/New Media or the National Secretary through the{" "}
            <Link href="/structure" className="text-primary underline">
              structure directory
            </Link>
            . We respond within 30 days. If you are not satisfied, you may
            complain to the Nigeria Data Protection Commission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">How it is protected</h2>
          <ul className="list-disc space-y-2 pt-2 pl-5">
            <li>
              Access is controlled by row-level security — officers can only read
              records inside their own scope.
            </li>
            <li>Sign-in is by one-time code to your phone. There is no password to leak.</li>
            <li>
              No member data is stored in the movement&apos;s public code
              repository, and officer phone numbers are never published on this
              site.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Changes</h2>
          <p className="pt-2">
            If this notice changes materially, we record a new version and ask
            members to consent again. The version you agreed to is stored with
            your record.
          </p>
        </section>
      </div>
    </div>
  );
}
