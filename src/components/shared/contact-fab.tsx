"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Mail } from "lucide-react";
import { WhatsAppGlyph } from "@/components/shared/brand-icons";
import { mailLink, waLink } from "@/lib/site";

const DISMISS_KEY = "nokm.contactFab.dismissed";

/**
 * Prefilled message for the page the visitor is on. Generic enough to be
 * accurate everywhere — the specifics belong to whoever answers.
 */
function messageFor(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  if (p.endsWith("/join")) return "I want to join the National OK Movement.";
  if (p.endsWith("/support") || p.includes("/support/"))
    return "I want to support NOkM.";
  if (p.includes("/vacancies"))
    return "I want to serve in the National OK Movement. Which posts are open?";
  if (p.includes("/coverage"))
    return "I want to cover polling units for NOkM in my area.";
  if (p.includes("/pvc")) return "I need help getting my PVC.";
  if (p.includes("/aspirants"))
    return "I have a question about the NOkM aspirants directory.";
  if (p.includes("/store")) return "I want to order NOkM branded wear.";
  if (p.includes("/market")) return "I have a question about the NOkM market board.";
  if (p.includes("/diaspora"))
    return "I am a Nigerian abroad and want to join my NOkM country chapter.";
  return "Hello NOkM, I have a question.";
}

/**
 * Floating contact button, mobile only.
 *
 * Sits above the thumb rest on the right, clear of primary page controls, and
 * is dismissible — a permanently undismissable overlay on a data-light site
 * used by people on small screens is an obstruction, not a feature.
 */
export function ContactFab() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  // Read the dismissal after mount: the static export is prerendered, so
  // deciding this during render would produce a hydration mismatch.
  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const message = messageFor(pathname);
  const wa = waLink(message);
  const href = wa ?? mailLink(message);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private browsing — the button simply returns next visit */
    }
  }

  return (
    <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-1.5 lg:hidden">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide the contact button"
        className="bg-background/90 text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full border shadow-sm backdrop-blur"
      >
        <X className="size-3.5" />
      </button>
      <a
        href={href}
        {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="bg-brand-green flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform active:scale-95"
      >
        {wa ? (
          <WhatsAppGlyph className="size-5" />
        ) : (
          <Mail className="size-[1.15rem]" />
        )}
        Talk to us
      </a>
    </div>
  );
}
