"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/config";

export interface OfficerPhoto {
  url: string;
  alt: string;
  credit: string | null;
}

const PhotoContext = createContext<Map<string, OfficerPhoto>>(new Map());

const EMPTY = new Map<string, OfficerPhoto>();

interface PhotoRow {
  appointment_slug: string;
  storage_path: string;
  alt_text: string;
  credit: string | null;
}

/**
 * Approved officer photographs, fetched once per page.
 *
 * The pages that show officers are static — they are prerendered long before
 * anyone uploads a portrait — so photos arrive after mount and swap in over the
 * initials. That order is deliberate: the initials are the real fallback and
 * they render server-side, so the page is complete and readable before any
 * network call and stays complete if the call fails.
 *
 * When no Supabase project is configured, nothing is fetched and supabase-js is
 * never imported.
 */
export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Map<string, OfficerPhoto>>(EMPTY);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("approved_officer_photos")
          .select("appointment_slug, storage_path, alt_text, credit");
        if (error || !data || cancelled) return;

        const base = `${supabaseUrl}/storage/v1/object/public/officer-photos/`;
        const next = new Map<string, OfficerPhoto>();
        for (const row of data as PhotoRow[]) {
          next.set(row.appointment_slug, {
            url: `${base}${row.storage_path}`,
            alt: row.alt_text,
            credit: row.credit,
          });
        }
        setPhotos(next);
      } catch {
        /* the initials already on screen remain correct */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PhotoContext.Provider value={photos}>{children}</PhotoContext.Provider>
  );
}

export function usePhoto(appointmentSlug: string): OfficerPhoto | null {
  const photos = useContext(PhotoContext);
  return photos.get(appointmentSlug) ?? null;
}

export function usePhotoCount(): number {
  return useContext(PhotoContext).size;
}

export function useAllPhotos(): OfficerPhoto[] {
  const photos = useContext(PhotoContext);
  return useMemo(() => Array.from(photos.values()), [photos]);
}
