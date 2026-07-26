import Link from "next/link";
import { Mail } from "lucide-react";
import { Wordmark } from "@/components/shared/wordmark";
import { SocialLinks } from "@/components/shared/social-links";
import { WhatsAppGlyph } from "@/components/shared/brand-icons";
import {
  builtBy,
  conductDisclaimer,
  inecDisclaimer,
  independenceDisclaimer,
  mailLink,
  nationalCoordinator,
  officialContact,
  site,
  waLink,
} from "@/lib/site";

const groups: Array<{
  heading: string;
  links: Array<{ href: string; label: string }>;
}> = [
  {
    heading: "The movement",
    links: [
      { href: "/leadership", label: "Leadership" },
      { href: "/structure", label: "Structure" },
      { href: "/vacancies", label: "Vacancies" },
      { href: "/diaspora", label: "Diaspora" },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Coverage",
    links: [
      { href: "/coverage", label: "Coverage map" },
      { href: "/baseline", label: "2023 baseline" },
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/action-plan", label: "Action plan" },
      { href: "/rhythm", label: "Weekly rhythm" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { href: "/join", label: "Join the movement" },
      { href: "/support", label: "Support NOkM" },
      { href: "/pvc", label: "PVC drive" },
      { href: "/learn", label: "Civic education" },
      { href: "/dashboard", label: "Officer sign-in" },
    ],
  },
  {
    heading: "Community",
    links: [
      { href: "/aspirants", label: "Aspirants" },
      { href: "/market", label: "Market & trade" },
      { href: "/store", label: "Merchandise" },
      { href: "/support/ledger", label: "Public ledger" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  const wa = waLink("Hello NOkM, I have a question.");

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

            <div className="pt-5">
              <p className="eyebrow text-muted-foreground/70 pb-2.5">Contact</p>
              <address className="text-muted-foreground pb-2.5 text-sm not-italic">
                National Secretariat
                <br />
                {officialContact.secretariat.line1}
                <br />
                {officialContact.secretariat.state}
              </address>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={mailLink()}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
                  >
                    <Mail className="size-4 shrink-0" />
                    {officialContact.email}
                  </a>
                </li>
                {wa && (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
                    >
                      <WhatsAppGlyph className="size-4 shrink-0" />
                      {officialContact.whatsappLabel}
                    </a>
                  </li>
                )}
              </ul>
              <SocialLinks className="pt-4" size="sm" />
            </div>

            <p className="text-muted-foreground pt-5 text-xs">
              Peter Obi · Rabiu Kwankwaso · 2027
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid flex-1 grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 lg:max-w-2xl"
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

        <div className="text-muted-foreground/80 mt-6 flex flex-col gap-1 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            <Link href="/leadership" className="hover:text-foreground">
              {nationalCoordinator.name}
            </Link>
            {" · "}
            {nationalCoordinator.title}
          </p>
          <p>
            Platform built by {builtBy.name} for the National OK Movement.
          </p>
        </div>
      </div>
      <div className="tricolor h-1" aria-hidden />
    </footer>
  );
}
