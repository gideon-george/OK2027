import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";
import { navLinks } from "@/lib/nav";
import {
  conductDisclaimer,
  inecDisclaimer,
  independenceDisclaimer,
  site,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <Wordmark withSubtitle />
            <p className="text-muted-foreground pt-3 text-sm">{site.motto}</p>
            <p className="text-brand-blue pt-1 text-sm font-medium">
              {site.rallyingCry}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:max-w-md"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              Officer sign-in
            </Link>
          </nav>
        </div>

        <div className="text-muted-foreground mt-8 space-y-2 border-t pt-6 text-xs leading-relaxed">
          <p>
            <strong className="text-foreground font-medium">
              Independent support group.
            </strong>{" "}
            {independenceDisclaimer}
          </p>
          <p>{conductDisclaimer}</p>
          <p>{inecDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
