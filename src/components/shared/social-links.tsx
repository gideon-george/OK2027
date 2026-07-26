import { socialGlyphs } from "@/components/shared/brand-icons";
import { socials } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Official social accounts.
 *
 * Renders nothing when no handles have been supplied. A guessed handle would
 * send members to an account the movement does not control, so the empty state
 * is the correct state until leadership provides exact URLs.
 */
export function SocialLinks({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "sm";
}) {
  if (socials.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {socials.map((social) => {
        const Glyph = socialGlyphs[social.platform];
        return (
          <li key={social.platform}>
            <a
              href={social.url}
              target="_blank"
              rel="me noopener noreferrer"
              title={`${social.platform} — ${social.handle}`}
              className={cn(
                "text-muted-foreground hover:text-foreground hover:border-primary/50 flex items-center justify-center rounded-full border transition-colors",
                size === "sm" ? "size-8" : "size-9"
              )}
            >
              <Glyph className={size === "sm" ? "size-4" : "size-[1.15rem]"} />
              <span className="sr-only">
                {social.platform}: {social.handle}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Placeholder shown to officers where the social row would go, so the gap is
 * visible internally rather than silently absent.
 */
export function SocialLinksPending() {
  if (socials.length > 0) return null;
  return (
    <p className="text-muted-foreground text-xs">
      Official social accounts are not yet published here. Handles are added
      once National Publicity confirms the exact addresses.
    </p>
  );
}
