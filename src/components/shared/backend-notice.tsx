import { Info } from "lucide-react";

/**
 * Shown wherever a feature needs the database and the database is not yet
 * provisioned. Being explicit is deliberate: the alternative — a form that
 * looks live and silently discards what people type — would lose real member
 * registrations.
 */
export function BackendNotice({ action }: { action: string }) {
  return (
    <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
      <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">Not live yet</p>
        <p className="text-muted-foreground pt-1 leading-relaxed">
          {action} becomes available as soon as the movement&apos;s member
          database is switched on. Nothing typed here would be saved right now,
          so the form is disabled rather than pretending to work.
        </p>
      </div>
    </div>
  );
}
