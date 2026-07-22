"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface ChapterRow {
  chapter_id: string;
  country: string;
  city: string | null;
  slug: string;
  members: number;
}

export function ChapterList() {
  const [chapters, setChapters] = useState<ChapterRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("diaspora_chapter_counts")
          .select("*")
          .order("members", { ascending: false });
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setChapters((data ?? []) as ChapterRow[]);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <BackendNotice action="The diaspora chapter directory" />;
  }

  if (failed) {
    return (
      <p className="text-muted-foreground text-sm">
        Chapters could not be loaded. Check your connection and refresh.
      </p>
    );
  }

  if (!chapters) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">No chapters established yet</p>
        <p className="text-muted-foreground pt-1 text-sm">
          The first Nigerians to organise in their country start the first
          chapter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {chapters.map((chapter) => (
        <div key={chapter.chapter_id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{chapter.country}</h3>
              {chapter.city && (
                <p className="text-muted-foreground text-sm">{chapter.city}</p>
              )}
            </div>
            <Badge variant="secondary">
              {chapter.members} member{chapter.members === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
