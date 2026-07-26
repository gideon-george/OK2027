"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LivePortrait } from "@/components/shared/live-portrait";
import { PhotoProvider } from "@/components/shared/photo-provider";
import { cn } from "@/lib/utils";

export interface GalleryEntry {
  slug: string;
  holderName: string | null;
  officeTitle: string;
  scopeLabel: string;
  level: "National" | "Diaspora" | "Zonal" | "State";
  stateCode: string | null;
  filled: boolean;
  statusLabel: string;
}

const levels = ["National", "Diaspora", "Zonal", "State"] as const;

/**
 * The movement as faces.
 *
 * Vacant posts are shown, not hidden. An empty chair on a wall of people is
 * the most effective recruitment the structure page has — it says a specific
 * job in a specific place has nobody doing it.
 */
export function GalleryView({
  entries,
  states,
}: {
  entries: GalleryEntry[];
  states: Array<{ code: string; name: string }>;
}) {
  const [view, setView] = useState<"gallery" | "list">("gallery");
  const [level, setLevel] = useState<string>("all");
  const [stateCode, setStateCode] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (level !== "all" && e.level !== level) return false;
      if (stateCode !== "all" && e.stateCode !== stateCode) return false;
      if (!q) return true;
      return (
        (e.holderName ?? "").toLowerCase().includes(q) ||
        e.officeTitle.toLowerCase().includes(q) ||
        e.scopeLabel.toLowerCase().includes(q)
      );
    });
  }, [entries, level, stateCode, query]);

  const openCount = filtered.filter((e) => !e.filled).length;

  return (
    <PhotoProvider>
      {/* ---------------------------------------------------------- controls */}
      <div className="flex flex-wrap items-end gap-3 pb-6">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="gallery-search" className="pb-1.5 block text-xs font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="gallery-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, office or place"
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-36">
          <label htmlFor="gallery-level" className="pb-1.5 block text-xs font-medium">
            Level
          </label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger id="gallery-level" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label htmlFor="gallery-state" className="pb-1.5 block text-xs font-medium">
            State
          </label>
          <Select value={stateCode} onValueChange={setStateCode}>
            <SelectTrigger id="gallery-state" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          role="group"
          aria-label="View as"
          className="bg-muted inline-flex rounded-full p-1"
        >
          {(
            [
              ["gallery", LayoutGrid, "Gallery"],
              ["list", List, "List"],
            ] as const
          ).map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-pressed={view === value}
              title={label}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                view === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground pb-5 text-sm">
        {filtered.length} post{filtered.length === 1 ? "" : "s"}
        {openCount > 0 && (
          <>
            {" · "}
            <span className="text-brand-red font-medium">{openCount} open</span>
          </>
        )}
      </p>

      {/* ----------------------------------------------------------- gallery */}
      {view === "gallery" ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((entry) => (
            <li key={entry.slug}>
              <Link href={`/structure/${entry.slug}`} className="group block">
                {entry.filled ? (
                  <LivePortrait
                    appointmentSlug={entry.slug}
                    name={entry.holderName}
                    tone={entry.level === "State" ? "green" : "blue"}
                    size="lg"
                    className="group-hover:ring-primary/40 transition-shadow group-hover:ring-2"
                  />
                ) : (
                  <div className="border-brand-red/40 bg-brand-red/5 text-brand-red group-hover:bg-brand-red/10 flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center transition-colors">
                    <UserPlus className="size-6" />
                    <span className="text-xs leading-tight font-semibold">
                      This seat is open
                    </span>
                    <span className="text-[0.65rem] leading-tight opacity-80">
                      Step forward
                    </span>
                  </div>
                )}
                <p className="font-display pt-2.5 text-sm leading-tight font-bold text-balance">
                  {entry.holderName ?? entry.officeTitle}
                </p>
                <p className="text-muted-foreground pt-0.5 text-xs leading-tight text-pretty">
                  {entry.holderName ? entry.officeTitle : entry.scopeLabel}
                </p>
                {entry.scopeLabel !== "National" && entry.holderName && (
                  <p className="text-muted-foreground/80 text-[0.7rem]">
                    {entry.scopeLabel}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y rounded-lg border">
          {filtered.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/structure/${entry.slug}`}
                className="hover:bg-accent/50 flex items-center gap-3 px-4 py-3 transition-colors"
              >
                <span className="w-10 shrink-0">
                  <LivePortrait
                    appointmentSlug={entry.slug}
                    name={entry.holderName}
                    tone={entry.filled ? "blue" : "muted"}
                    size="sm"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {entry.holderName ?? entry.officeTitle}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {entry.holderName ? entry.officeTitle : "Open post"} ·{" "}
                    {entry.scopeLabel}
                  </span>
                </span>
                {!entry.filled && (
                  <Badge
                    variant="outline"
                    className="border-brand-red/40 text-brand-red shrink-0 text-[0.65rem]"
                  >
                    {entry.statusLabel}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {filtered.length === 0 && (
        <p className="text-muted-foreground py-10 text-center text-sm">
          No posts match that search.
        </p>
      )}
    </PhotoProvider>
  );
}
