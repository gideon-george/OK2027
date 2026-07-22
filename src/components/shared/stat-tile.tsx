import { cn } from "@/lib/utils";

const accentBar: Record<string, string> = {
  default: "bg-muted-foreground/30",
  blue: "bg-brand-blue",
  red: "bg-brand-red",
  green: "bg-brand-green",
};

const valueTone: Record<string, string> = {
  default: "",
  blue: "text-gradient-blue",
  red: "text-gradient-red",
  green: "text-brand-green",
};

/**
 * A single counted fact. Every value shown must come from real structure data
 * or the database — never an estimate.
 */
export function StatTile({
  value,
  label,
  hint,
  tone = "default",
  className,
}: {
  value: string | number;
  label: string;
  hint?: string;
  tone?: "default" | "blue" | "red" | "green";
  className?: string;
}) {
  return (
    <div className={cn("bg-card rounded-xl border p-4", className)}>
      <span
        aria-hidden
        className={cn("mb-3 block h-1 w-8 rounded-full", accentBar[tone])}
      />
      <p
        className={cn(
          "font-display text-3xl font-extrabold tracking-tight tabular-nums",
          valueTone[tone]
        )}
      >
        {value}
      </p>
      <p className="pt-1.5 text-sm font-medium">{label}</p>
      {hint && <p className="text-muted-foreground pt-0.5 text-xs">{hint}</p>}
    </div>
  );
}
