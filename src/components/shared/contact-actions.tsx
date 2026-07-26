import { Mail } from "lucide-react";
import { WhatsAppGlyph } from "@/components/shared/brand-icons";
import { Button } from "@/components/ui/button";
import { mailLink, officialContact, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The movement's human point of contact, offered alongside every form.
 *
 * WhatsApp is how Nigeria actually communicates, so no call to action is ever
 * form-only. When no number is published the email carries the whole job
 * rather than a dead WhatsApp link being rendered.
 */
export function ContactActions({
  message,
  subject,
  variant = "outline",
  size = "default",
  className,
}: {
  /** Prefilled WhatsApp message, written for the page it sits on. */
  message: string;
  /** Email subject. Falls back to the WhatsApp message. */
  subject?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const wa = waLink(message);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {wa && (
        <Button asChild variant={variant} size={size}>
          <a href={wa} target="_blank" rel="noopener noreferrer">
            <WhatsAppGlyph className="size-4" />
            Chat on WhatsApp
          </a>
        </Button>
      )}
      <Button asChild variant={wa ? "outline" : variant} size={size}>
        <a href={mailLink(subject ?? message)}>
          <Mail className="size-4" />
          {officialContact.email}
        </a>
      </Button>
    </div>
  );
}
