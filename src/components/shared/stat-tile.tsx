import { cn } from "@/lib/utils";

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
    <div className={cn("rounded-lg border p-4", className)}>
      <p
        className={cn(
          "font-display text-3xl font-bold tabular-nums",
          tone === "blue" && "text-brand-blue",
          tone === "red" && "text-brand-red",
          tone === "green" && "text-brand-green"
        )}
      >
        {value}
      </p>
      <p className="pt-1 text-sm font-medium">{label}</p>
      {hint && <p className="text-muted-foreground pt-0.5 text-xs">{hint}</p>}
    </div>
  );
}
