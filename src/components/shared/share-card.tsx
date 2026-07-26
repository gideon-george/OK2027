"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { WhatsAppGlyph } from "@/components/shared/brand-icons";
import { Button } from "@/components/ui/button";
import {
  canvasToBlob,
  drawCard,
  type CardContent,
  type CardShape,
} from "@/lib/share-card";
import { cn } from "@/lib/utils";

/**
 * A downloadable, shareable card.
 *
 * Square for a WhatsApp or Instagram post, story for a WhatsApp Status — which
 * is where political messages actually travel in Nigeria, so it gets its own
 * button rather than being buried behind a menu.
 */
export function ShareCard({
  content,
  fileName,
  shareText,
  className,
}: {
  content: CardContent;
  fileName: string;
  /** Text that accompanies the image in the native share sheet. */
  shareText: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shape, setShape] = useState<CardShape>("square");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Re-draw once webfonts are ready, so the card is not rendered in the
    // fallback typeface on a first, cold visit.
    drawCard(canvas, content, shape);
    document.fonts?.ready.then(() => {
      if (canvasRef.current) drawCard(canvasRef.current, content, shape);
    });
  }, [content, shape]);

  async function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setNote(null);
    try {
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-${shape}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setNote("Saved. Post it to your WhatsApp Status.");
    } catch {
      setNote("Could not save the image. Long-press it to save instead.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setNote(null);
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], `${fileName}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        await download();
        setNote("Saved. Attach it to your WhatsApp Status.");
      }
    } catch {
      /* the user dismissed the sheet */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("rounded-xl border p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h3 className="font-display font-bold">Your card</h3>
        <div
          role="group"
          aria-label="Card shape"
          className="bg-muted inline-flex rounded-full p-1"
        >
          {(
            [
              ["square", "Post"],
              ["story", "Status"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setShape(value)}
              aria-pressed={shape === value}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                shape === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${content.eyebrow}. ${content.headline}`}
        className={cn(
          "mx-auto block h-auto w-full rounded-lg border shadow-sm",
          shape === "story" ? "max-w-[15rem]" : "max-w-[22rem]"
        )}
      />

      <div className="flex flex-wrap justify-center gap-2 pt-4">
        <Button onClick={share} disabled={busy} className="bg-brand-green hover:bg-brand-green/90 text-white">
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <WhatsAppGlyph className="size-4" />
          )}
          Share it
        </Button>
        <Button onClick={download} disabled={busy} variant="outline">
          <Download className="size-4" /> Save image
        </Button>
        <Button
          onClick={() => navigator.share?.({ text: shareText })}
          variant="ghost"
          className="sm:hidden"
        >
          <Share2 className="size-4" /> Text only
        </Button>
      </div>

      {note && (
        <p aria-live="polite" className="text-muted-foreground pt-3 text-center text-xs">
          {note}
        </p>
      )}
    </div>
  );
}
