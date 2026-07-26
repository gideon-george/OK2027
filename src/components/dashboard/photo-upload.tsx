"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { currentPolicyVersion } from "@/lib/site";

/** Long edge, in pixels, after client-side resize. */
const MAX_EDGE = 1000;
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

/**
 * Downscales and re-encodes the picture in the browser.
 *
 * Officers upload 6 MB photos straight off a phone camera over mobile data.
 * Sending that to Storage costs them money and often simply fails; 1000px on
 * the long edge is more than a 4:5 portrait card ever needs.
 */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image on this device.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not process the image.")),
      "image/webp",
      0.82
    );
  });
}

export function PhotoUpload({
  appointmentSlug,
  holderName,
  existingUrl,
  onChanged,
}: {
  appointmentSlug: string;
  holderName: string;
  existingUrl?: string | null;
  onChanged?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [altText, setAltText] = useState(`${holderName}, National OK Movement`);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError("That image is very large. Choose one under 12 MB.");
      return;
    }

    setBusy(true);
    try {
      const resized = await downscale(file);
      setBlob(resized);
      setPreview((old) => {
        if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
        return URL.createObjectURL(resized);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!blob || !consent) return;
    setBusy(true);
    setError(null);

    try {
      const supabase = await getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session has expired. Sign in again.");

      const path = `${appointmentSlug}/${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("officer-photos")
        .upload(path, blob, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;

      // Consent is recorded in the same statement that creates the row. The
      // database refuses to publish a photo without it.
      const { error: insertError } = await supabase
        .from("officer_photos")
        .insert({
          appointment_slug: appointmentSlug,
          storage_path: path,
          alt_text: altText.trim(),
          consent_recorded_at: new Date().toISOString(),
          consent_source: `web form, policy ${currentPolicyVersion}`,
          uploaded_by: user.id,
          status: "pending",
        });
      if (insertError) throw insertError;

      setDone(true);
      onChanged?.();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Try again on a better connection."
      );
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    setBusy(true);
    setError(null);
    try {
      const supabase = await getSupabase();
      const { error: rpcError } = await supabase.rpc("withdraw_officer_photo", {
        p_appointment_slug: appointmentSlug,
      });
      if (rpcError) throw rpcError;
      setPreview(null);
      setBlob(null);
      setDone(false);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not withdraw the photo.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        <p className="font-medium">Sent for approval</p>
        <p className="text-muted-foreground pt-1 leading-relaxed">
          The National Publicity Secretary reviews every portrait before it
          appears on the public site. You can withdraw it at any time.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={withdraw}
          disabled={busy}
        >
          <Trash2 className="size-3.5" /> Withdraw it
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-display font-semibold">Your portrait</h3>
      <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
        A head-and-shoulders photograph, shown on the structure and leadership
        pages. Resized on your phone before it is sent, so it costs very little
        data.
      </p>

      <div className="flex flex-wrap items-start gap-4 pt-4">
        <div className="bg-muted flex aspect-[4/5] w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview of the portrait you are about to submit"
              className="size-full object-cover"
            />
          ) : (
            <Camera className="text-muted-foreground size-6" />
          )}
        </div>

        <div className="min-w-[14rem] flex-1 space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={pick}
            className="sr-only"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Camera className="size-3.5" />
            )}
            {preview ? "Choose a different photo" : "Choose a photo"}
          </Button>

          <div>
            <Label htmlFor="alt-text" className="text-xs">
              Description for screen readers
            </Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              maxLength={140}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="bg-muted/40 mt-4 flex items-start gap-3 rounded-md border p-3">
        <Checkbox
          id="photo-consent"
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="photo-consent"
          className="text-sm leading-relaxed font-normal"
        >
          I consent to NOkM publishing this photograph of me on its public
          website, and I understand I may withdraw this at any time.
        </Label>
      </div>

      {error && (
        <p role="alert" className="text-destructive pt-3 text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-4">
        <Button
          type="button"
          size="sm"
          disabled={!blob || !consent || busy || altText.trim().length < 3}
          onClick={submit}
        >
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          Submit for approval
        </Button>
        {existingUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={withdraw}
            disabled={busy}
          >
            <Trash2 className="size-3.5" /> Take my photo down
          </Button>
        )}
      </div>
      <p className="text-muted-foreground pt-2 text-xs">
        Withdrawal is immediate and needs no approval.
      </p>
    </div>
  );
}
