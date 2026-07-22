"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { statesByCode } from "@/lib/geo";
import { cn } from "@/lib/utils";

export const listingCategories = [
  { value: "market_trade", label: "Market & trade" },
  { value: "advertising_services", label: "Advertising services" },
  { value: "business_growth", label: "Business growth" },
] as const;

interface Listing {
  id: string;
  business_name: string;
  category: string;
  state_code: string;
  description: string;
  contact_whatsapp: string;
  created_at: string;
}

export function MarketBoard() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("market_listings")
          .select(
            "id, business_name, category, state_code, description, contact_whatsapp, created_at"
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(100);
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setListings((data ?? []) as Listing[]);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <BackendNotice action="The member business board" />;
  }

  if (failed) {
    return (
      <p className="text-muted-foreground text-sm">
        Listings could not be loaded. Check your connection and refresh.
      </p>
    );
  }

  if (!listings) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">No listings yet</p>
        <p className="text-muted-foreground pt-1 text-sm">
          Be the first member to advertise a business here.
        </p>
      </div>
    );
  }

  const shown = category
    ? listings.filter((l) => l.category === category)
    : listings;

  return (
    <div>
      <div className="flex flex-wrap gap-2 pb-5">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            category === null ? "bg-accent" : "hover:bg-accent"
          )}
        >
          All
        </button>
        {listingCategories.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              category === c.value ? "bg-accent" : "hover:bg-accent"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((listing) => (
          <div key={listing.id} className="flex flex-col rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold text-balance">
                {listing.business_name}
              </h3>
              <Badge variant="secondary">
                {statesByCode.get(listing.state_code)?.name ??
                  listing.state_code}
              </Badge>
            </div>
            <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
              {listing.description}
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-4 w-fit"
            >
              <a
                href={`https://wa.me/${listing.contact_whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                Contact on WhatsApp
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
