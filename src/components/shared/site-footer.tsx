import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground">
        <p>
          OK2027 is an independent community project for civic participation
          ahead of Nigeria&apos;s 2027 elections. It celebrates participation
          and documents facts — it never encourages confrontation.
        </p>
        <p>
          Not affiliated with INEC. Always confirm registration and election
          details on official INEC channels.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/learn" className="hover:text-foreground">
            Civic education
          </Link>
          <Link href="/network" className="hover:text-foreground">
            Pilot network
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
