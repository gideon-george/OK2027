import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusLabels, type Appointment } from "@/lib/structure";

const HONORIFIC =
  /^(hon|mr|mrs|ms|dr|comrd|amb|chief|bar|barr|big-gen|prince|prophet|bro|justice)\.?$/i;

/** "Hon. Agom Augustine" → "AA" — honorifics don't belong in a monogram. */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter((w) => !HONORIFIC.test(w));
  const letters = parts
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return letters || name.slice(0, 2).toUpperCase();
}

/**
 * One post in the structure. Filled posts carry a monogram in the brand
 * colour; vacant posts are deliberately muted and lead to the application
 * flow — an open post is a recruitment opportunity, not something to hide.
 */
export function AppointmentCard({
  appointment,
  showScope = false,
}: {
  appointment: Appointment;
  showScope?: boolean;
}) {
  const { filled, holderName, office, scopeLabel, status, slug } = appointment;

  return (
    <Link
      href={`/structure/${slug}`}
      className={cn(
        "card-lift bg-card hover:border-primary/50 flex h-full items-start gap-3 rounded-xl border p-4",
        !filled && "bg-muted/30 border-dashed"
      )}
    >
      {filled && holderName ? (
        <span
          aria-hidden
          className="bg-brand-blue/10 text-brand-blue font-display flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        >
          {initials(holderName)}
        </span>
      ) : (
        <span
          aria-hidden
          className="border-muted-foreground/40 text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed"
        >
          <Plus className="size-4" />
        </span>
      )}

      <span className="min-w-0">
        <span className="block text-sm leading-snug font-semibold text-balance">
          {showScope && scopeLabel !== "National"
            ? `${scopeLabel} — ${office.shortTitle}`
            : office.title}
        </span>
        {filled ? (
          <span className="text-muted-foreground block pt-0.5 text-sm">
            {holderName}
          </span>
        ) : (
          <Badge
            variant="outline"
            className="border-brand-red/40 text-brand-red mt-1.5"
          >
            {statusLabels[status]}
          </Badge>
        )}
      </span>
    </Link>
  );
}
