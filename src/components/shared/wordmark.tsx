import { cn } from "@/lib/utils";

/**
 * NOkM wordmark. The "O" and "k" carry the movement's meaning — Obi and
 * Kwankwaso — so the O takes the movement red and the M the party blue, with
 * a tricolor keel underneath when the subtitle is shown.
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
      <span className="font-display text-xl font-extrabold tracking-tight">
        <span>N</span>
        <span className="text-brand-red">O</span>
        <span>k</span>
        <span className="text-brand-blue">M</span>
      </span>
      {withSubtitle && (
        <>
          <span className="tricolor mt-1 block h-0.5 w-9 rounded-full" />
          <span className="text-muted-foreground pt-1 text-[0.6rem] font-semibold tracking-[0.16em] uppercase">
            National OK Movement
          </span>
        </>
      )}
    </span>
  );
}
