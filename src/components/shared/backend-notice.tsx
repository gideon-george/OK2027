import { Info } from "lucide-react";
import { ContactActions } from "@/components/shared/contact-actions";

/**
 * Shown wherever a feature needs the database and the database is not yet
 * provisioned. Being explicit is deliberate: the alternative — a form that
 * looks live and silently discards what people type — would lose real member
 * registrations.
 *
 * A disabled form must never be a dead end. The official contact line is
 * offered alongside it so the person can still reach the movement today.
 */
export function BackendNotice({
  action,
  contactMessage,
}: {
  action: string;
  /** Prefilled WhatsApp/email message for this specific dead end. */
  contactMessage?: string;
}) {
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
        <p className="text-muted-foreground pt-2 leading-relaxed">
          In the meantime, reach the movement directly:
        </p>
        <ContactActions
          className="pt-3"
          size="sm"
          message={
            contactMessage ?? "Hello NOkM, I tried to use the website and it is not live yet."
          }
        />
      </div>
    </div>
  );
}
