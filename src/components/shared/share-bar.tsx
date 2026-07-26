"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { socialGlyphs, WhatsAppGlyph } from "@/components/shared/brand-icons";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Sharing, WhatsApp first.
 *
 * Distribution for this movement is a WhatsApp forward, not a tweet, so
 * WhatsApp gets the primary button and everything else is secondary. The
 * native share sheet is offered where the browser has one, because on Android
 * it reaches WhatsApp Status, which is where political messages actually
 * travel in Nigeria.
 */
export function ShareBar({
  message,
  path,
  title = "Share this",
  className,
}: {
  /** The text that travels with the link. Written for the page it sits on. */
  message: string;
  /** Route to share, e.g. "/coverage". Joined to the canonical site URL. */
  path: string;
  title?: string;
  className?: string;
}) {
  // Inline feedback rather than a toast: mounting a global Toaster on every
  // page for one confirmation message is not worth the bytes.
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const url = `${siteUrl.replace(/\/+$/, "")}${path}`;
  const text = `${message} ${url}`;
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const Telegram = socialGlyphs.Telegram;
  const XGlyph = socialGlyphs.X;
  const Facebook = socialGlyphs.Facebook;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("failed");
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ text: message, url });
    } catch {
      /* the user dismissed the sheet */
    }
  }

  const secondary =
    "text-muted-foreground hover:text-foreground hover:border-primary/50 flex size-9 items-center justify-center rounded-full border transition-colors";

  return (
    <div className={cn("border-t pt-6", className)}>
      <p className="eyebrow text-muted-foreground/70 pb-3">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`https://wa.me/?text=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-green flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
        >
          <WhatsAppGlyph className="size-[1.15rem]" />
          Share on WhatsApp
        </a>

        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={secondary}
          title="Share on Telegram"
        >
          <Telegram className="size-[1.15rem]" />
          <span className="sr-only">Share on Telegram</span>
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className={secondary}
          title="Share on X"
        >
          <XGlyph className="size-4" />
          <span className="sr-only">Share on X</span>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={secondary}
          title="Share on Facebook"
        >
          <Facebook className="size-[1.15rem]" />
          <span className="sr-only">Share on Facebook</span>
        </a>

        <button type="button" onClick={copy} className={secondary} title="Copy link">
          {status === "copied" ? (
            <Check className="text-brand-green size-4" />
          ) : (
            <Link2 className="size-4" />
          )}
          <span className="sr-only">Copy link</span>
        </button>

        <button
          type="button"
          onClick={nativeShare}
          className={cn(secondary, "sm:hidden")}
          title="More sharing options"
        >
          <Share2 className="size-4" />
          <span className="sr-only">More sharing options</span>
        </button>
      </div>

      <p aria-live="polite" className="text-muted-foreground pt-2 text-xs">
        {status === "copied" && "Link copied."}
        {status === "failed" &&
          "Could not copy automatically — long-press the address bar to copy the link."}
      </p>
    </div>
  );
}
