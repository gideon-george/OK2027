"use client";

import { OfficerPortrait } from "@/components/shared/officer-portrait";
import { usePhoto } from "@/components/shared/photo-provider";

/**
 * An officer portrait that upgrades to a photograph if an approved one exists.
 *
 * Falls back to exactly what OfficerPortrait renders on the server, so a page
 * with no photos — which is every page until officers start uploading — looks
 * and behaves the same as before.
 */
export function LivePortrait({
  appointmentSlug,
  name,
  tone = "blue",
  size = "md",
  className,
}: {
  appointmentSlug: string;
  name: string | null;
  tone?: "blue" | "red" | "green" | "muted";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const photo = usePhoto(appointmentSlug);

  return (
    <OfficerPortrait
      name={name}
      photoUrl={photo?.url ?? null}
      alt={photo?.alt}
      tone={tone}
      size={size}
      className={className}
    />
  );
}
