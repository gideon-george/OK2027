import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Merchandise",
  description:
    "Official National OK Movement branded wear — polos, hoodies, sweatshirts and caps carrying the NDC and NOkM crests.",
};

const items = [
  {
    name: "Polo shirt",
    detail: "Collared, tipped in red, white and blue, with both crests.",
  },
  {
    name: "Hoodie",
    detail: "Pullover with front pouch, crests on chest and back.",
  },
  {
    name: "Sweatshirt",
    detail: "Crew neck, crests on chest and back.",
  },
  {
    name: "Cap",
    detail: "Curved peak with the movement torch and wordmark.",
  },
];

const colourways = [
  { name: "Orange", className: "bg-orange-500" },
  { name: "Sky blue", className: "bg-sky-300" },
  { name: "Green", className: "bg-green-600" },
];

export default function StorePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          Official merchandise
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Branded wear carrying the NDC and NOkM crests and the movement&apos;s
          motto — {site.tagline}
        </p>
      </header>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-semibold">The range</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.name} className="rounded-lg border p-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-muted-foreground pt-1 text-sm">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-semibold">Colourways</h2>
        <div className="flex flex-wrap gap-3">
          {colourways.map((colour) => (
            <div
              key={colour.name}
              className="flex items-center gap-2 rounded-md border px-3 py-2"
            >
              <span
                aria-hidden
                className={`size-4 rounded-full border ${colour.className}`}
              />
              <span className="text-sm">{colour.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-10">
        <div className="bg-muted/40 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-display font-semibold">How to order</h2>
              <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
                Orders are placed directly with the movement&apos;s merchandise
                office on WhatsApp. This site takes no payments and holds no
                card details — deliberately, so that nobody can pose as NOkM to
                collect money through it.
              </p>
              <Badge variant="outline" className="mt-3">
                Ordering contact not yet published
              </Badge>
              <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
                Until the official ordering number is published here, go through
                the Director of Programs &amp; Events, who can direct you to an
                authorised supplier.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/structure/national-director-programs-events">
                  Contact that office
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-10">
        <div className="border-brand-red/30 bg-brand-red/5 rounded-lg border p-5">
          <h2 className="font-display font-semibold">Before you pay anyone</h2>
          <ul className="text-muted-foreground list-disc space-y-2 pt-3 pl-5 text-sm leading-relaxed">
            <li>
              NOkM does not sell positions, memberships or PVCs. Membership is
              free.
            </li>
            <li>
              Confirm any seller through an office listed in the structure
              directory before sending money.
            </li>
            <li>
              No officer will contact you asking for your bank details or BVN.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
