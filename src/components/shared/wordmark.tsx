import { cn } from "@/lib/utils";

/**
 * NOkM wordmark. The "O" and "k" carry the movement's meaning — Obi and
 * Kwankwaso — so they are the letters that get the brand colours.
 */
export function Wordmark({
  className,
  withSubtitle = false,
}: {
  className?: string;
  withSubtitle?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-lg font-extrabold tracking-tight">
        <span>N</span>
        <span className="text-brand-red">O</span>
        <span>k</span>
        <span className="text-brand-blue">M</span>
      </span>
      {withSubtitle && (
        <span className="text-muted-foreground pt-0.5 text-[0.625rem] font-medium tracking-[0.14em] uppercase">
          National OK Movement
        </span>
      )}
    </span>
  );
}
