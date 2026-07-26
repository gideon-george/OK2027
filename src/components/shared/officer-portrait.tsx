import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  blue: "bg-brand-blue/10 text-brand-blue",
  red: "bg-brand-red/10 text-brand-red",
  green: "bg-brand-green/10 text-brand-green",
  muted: "bg-muted text-muted-foreground",
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-5xl",
} as const;

/** "Comrd. Anaba Henshaw Chigozie" → "AC". Honorifics are not initials. */
export function initialsFor(name: string): string {
  const honorifics =
    /^(hon|chief|dr|mr|mrs|ms|miss|engr|barr|prof|comrd|comrade|alh|alhaji|hajia|pastor|rev|amb|sen|big-gen|gen|col|capt)\.?$/i;
  const parts = name
    .replace(/[()]/g, " ")
    .split(/[\s.]+/)
    .filter((p) => p.length > 0 && !honorifics.test(p));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * An officer's face, or their initials.
 *
 * Never a stock photo and never a silhouette: an anonymous body-shape implies
 * a person holds a post when the roster may not name one. A vacant post shows
 * a dash, and it should look empty, because it is.
 */
export function OfficerPortrait({
  name,
  photoUrl,
  alt,
  tone = "blue",
  size = "md",
  className,
}: {
  name: string | null;
  /** Approved photo from Supabase Storage. Null renders the initials. */
  photoUrl?: string | null;
  alt?: string;
  tone?: "blue" | "red" | "green" | "muted";
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const shell = cn(
    "relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg",
    className
  );

  if (!name) {
    return (
      <div
        className={cn(shell, "border border-dashed", toneClasses.muted)}
        aria-hidden
      >
        <span className="font-display text-2xl font-bold opacity-40">—</span>
      </div>
    );
  }

  if (photoUrl) {
    return (
      <div className={cn(shell, "bg-muted")}>
        {/* Plain <img>: next/image is unoptimized under `output: "export"`, so
            it would add a component wrapper and no optimisation whatever. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={alt ?? `${name}, National OK Movement`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn(shell, toneClasses[tone])}>
      <span
        className={cn("font-display font-extrabold", sizeClasses[size])}
        aria-hidden
      >
        {initialsFor(name)}
      </span>
      <span className="sr-only">{name}</span>
    </div>
  );
}
