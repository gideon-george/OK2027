import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";
import {
  conductDisclaimer,
  inecDisclaimer,
  independenceDisclaimer,
  site,
} from "@/lib/site";

const groups: Array<{
  heading: string;
  links: Array<{ href: string; label: string }>;
}> = [
  {
    heading: "The movement",
    links: [
      { href: "/structure", label: "Structure" },
      { href: "/vacancies", label: "Vacancies" },
      { href: "/action-plan", label: "Action plan" },
      { href: "/rhythm", label: "Weekly rhythm" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { href: "/join", label: "Join the movement" },
      { href: "/pvc", label: "PVC drive" },
      { href: "/baseline", label: "2023 baseline" },
      { href: "/learn", label: "Civic education" },
      { href: "/dashboard", label: "Officer sign-in" },
    ],
  },
  {
    heading: "Community",
    links: [
      { href: "/market", label: "Market & trade" },
      { href: "/store", label: "Merchandise" },
      { href: "/diaspora", label: "Diaspora" },
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Wordmark withSubtitle />
            <p className="text-muted-foreground pt-4 text-sm leading-relaxed">
              {site.motto}
            </p>
            <p className="font-display text-brand-blue pt-2 text-sm font-bold">
              {site.rallyingCry}
            </p>
            <p className="text-muted-foreground pt-4 text-xs">
              Peter Obi · Rabiu Kwankwaso · 2027
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid flex-1 grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:max-w-2xl"
          >
            {groups.map((group) => (
              <div key={group.heading}>
                <p className="eyebrow text-muted-foreground/70 pb-3">
                  {group.heading}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="text-muted-foreground mt-10 space-y-2 border-t pt-6 text-xs leading-relaxed">
          <p>
            <strong className="text-foreground font-medium">
              Independent support group.
            </strong>{" "}
            {independenceDisclaimer}
          </p>
          <p>{conductDisclaimer}</p>
          <p>{inecDisclaimer}</p>
          <p className="pt-2">
            Election baseline data derived from the open{" "}
            <a
              href="https://forensic.nigeria2.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline"
            >
              Nigeria 2.0 collation
            </a>{" "}
            of INEC IReV result sheets. NOkM is not affiliated with Nigeria 2.0
            or INEC.
          </p>
        </div>
      </div>
      <div className="tricolor h-1" aria-hidden />
    </footer>
  );
}
