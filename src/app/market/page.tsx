import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketBoard } from "@/components/market/market-board";

export const metadata: Metadata = {
  title: "Market & Trade board",
  description:
    "The NOkM Market/Trade advertisement centre — members promote their own businesses to the movement. Your market, your trade, your voice.",
};

const offers = [
  {
    title: "Market & trade",
    points: [
      "Connect buyers and sellers",
      "Product and service promotion",
      "Market visibility boost",
      "Business networking",
    ],
  },
  {
    title: "Advertising services",
    points: [
      "Brand and business advertisements",
      "Digital marketing",
      "Flyers, posters and banners",
      "Content creation",
    ],
  },
  {
    title: "Business growth",
    points: [
      "Event coverage",
      "Consultancy and business support",
      "Marketing strategy",
      "Business development",
    ],
  },
];

export default function MarketPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Market &amp; Trade board
        </h1>
        <p className="text-muted-foreground pt-3 leading-relaxed">
          Your market. Your trade. Your voice. Our platform. Friday is the
          movement&apos;s business day — members promote what they do, and the
          movement looks after its own.
        </p>
      </header>

      <div className="grid gap-4 pt-8 sm:grid-cols-3">
        {offers.map((offer) => (
          <div key={offer.title} className="rounded-lg border p-4">
            <h2 className="font-display font-semibold">{offer.title}</h2>
            <ul className="text-muted-foreground space-y-1 pt-2 text-sm">
              {offer.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
          <h2 className="font-display text-2xl font-bold">Listings</h2>
        </div>
        <p className="text-muted-foreground pb-6 text-sm">
          Every listing is reviewed by an officer before it appears. Contact
          details belong to the business owner, not to the movement.
        </p>
        <MarketBoard />
      </section>

      <section className="pt-12">
        <div className="rounded-lg border p-6">
          <h2 className="font-display text-lg font-semibold">
            Advertise your business
          </h2>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            Registered members can post a listing. It goes into a moderation
            queue and appears here once an officer approves it.
          </p>
          <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
            <strong className="text-foreground font-medium">
              Listings are free.
            </strong>{" "}
            NOkM does not charge for placement and holds no payment details. If
            anyone asks you to pay the movement to be listed, it is not us.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register to post</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/rhythm">See the weekly rhythm</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
