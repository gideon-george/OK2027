import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LedgerTable } from "@/components/support/ledger-table";
import { appointmentBySlug } from "@/lib/structure";

export const metadata: Metadata = {
  title: "Public ledger",
  description:
    "What the National OK Movement received and what it spent, month by month, by category.",
};

const treasurer = appointmentBySlug("national-treasurer");
const auditor = appointmentBySlug("national-editor-auditor");

export default function LedgerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/support"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> Support NOkM
      </Link>

      <header className="pt-4">
        <p className="eyebrow text-brand-red">Accountability</p>
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          The public ledger
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          Every naira the movement receives and every naira it spends, by month
          and by category. This page exists before there is anything on it, and
          that is the point — a movement whose entire pitch is that it is an
          alternative to opaque politics has to be able to show this from day
          one.
        </p>
      </header>

      <section className="pt-10">
        <LedgerTable />
      </section>

      <section className="pt-10">
        <div className="rounded-xl border p-5">
          <h2 className="font-display font-bold">Who signs this off</h2>
          <dl className="grid gap-4 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs">
                National Treasurer
              </dt>
              <dd className="pt-0.5 text-sm font-medium">
                {treasurer?.holderName ?? "Post open"}
              </dd>
              <dd className="text-muted-foreground text-xs">
                Custody of movement funds.
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">
                National Auditor
              </dt>
              <dd className="pt-0.5 text-sm font-medium">
                {auditor?.holderName ?? "Post open"}
              </dd>
              <dd className="text-muted-foreground text-xs">
                Independent check on the figures.
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground pt-4 text-sm leading-relaxed">
            Queries about any line on this ledger go to the National Treasurer
            through the structure directory. Officers are evaluated on financial
            accountability as one of the ten general KPIs.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/structure/national-treasurer">
              Contact the Treasurer
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
