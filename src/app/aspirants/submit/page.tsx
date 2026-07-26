import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AspirantSubmitForm } from "@/components/aspirants/aspirant-submit-form";

export const metadata: Metadata = {
  title: "Request a listing",
  description:
    "Ask to be listed in the NOkM aspirants directory. Listing is not endorsement.",
};

export default function SubmitAspirantPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/aspirants"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" /> Aspirants
      </Link>

      <header className="pt-4">
        <h1 className="font-display pt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Request a listing
        </h1>
        <p className="text-muted-foreground pt-4 leading-relaxed">
          If you are contesting a seat in 2027, you can ask to appear in this
          directory.
        </p>
      </header>

      <div className="border-brand-blue/30 bg-brand-blue/5 mt-6 rounded-xl border p-5">
        <h2 className="font-display font-bold">Read this first</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pt-3 pl-5 text-sm leading-relaxed">
          <li>
            <strong className="text-foreground font-medium">
              Being listed is not an endorsement.
            </strong>{" "}
            The directory records who is contesting. NOkM backs a candidate only
            when the National Working Committee ratifies it, on a date, in a
            minute.
          </li>
          <li>
            <strong className="text-foreground font-medium">
              Nothing here is for sale.
            </strong>{" "}
            No listing, no placement, no endorsement. Anyone who tells you
            otherwise is not speaking for this movement.
          </li>
          <li>
            Submit only for yourself, or with the written agreement of the
            person you are submitting for. Every listing carries a consent
            record.
          </li>
          <li>
            Requests go to a moderation queue. Nothing appears on the public
            site until a national officer approves it.
          </li>
        </ul>
      </div>

      <div className="pt-8">
        <AspirantSubmitForm />
      </div>
    </div>
  );
}
