import Link from "next/link";
import { UserRound, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusLabels, type Appointment } from "@/lib/structure";

/**
 * One post in the structure. Filled posts carry the brand colour; vacant posts
 * are deliberately muted and lead to the application flow — an open post is a
 * recruitment opportunity, not something to hide.
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
        "hover:border-primary/50 flex h-full flex-col gap-1 rounded-lg border p-4 transition-colors",
        !filled && "border-dashed bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm leading-snug font-semibold text-balance">
          {showScope && scopeLabel !== "National"
            ? `${scopeLabel} — ${office.shortTitle}`
            : office.title}
        </h3>
        {filled ? (
          <UserRound className="text-brand-blue mt-0.5 size-4 shrink-0" />
        ) : (
          <UserRoundPlus className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        )}
      </div>

      {filled ? (
        <p className="text-muted-foreground text-sm">{holderName}</p>
      ) : (
        <Badge
          variant="outline"
          className="border-brand-red/40 text-brand-red mt-1 w-fit"
        >
          {statusLabels[status]}
        </Badge>
      )}
    </Link>
  );
}
