"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Wordmark } from "@/components/shared/wordmark";
import { navLinks, primaryNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0" aria-label="NOkM home">
          <Wordmark withSubtitle />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/join">Join the movement</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full overflow-y-auto sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle asChild>
                  <span>
                    <Wordmark />
                  </span>
                </SheetTitle>
                <SheetDescription>National OK Movement</SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-1 px-4 pb-8">
                <Button asChild className="mb-3 w-full">
                  <Link href="/join" onClick={() => setOpen(false)}>
                    Join the movement
                  </Link>
                </Button>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2.5 transition-colors",
                      isActive(link.href) ? "bg-accent" : "hover:bg-accent"
                    )}
                  >
                    <span className="block text-sm font-medium">
                      {link.label}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {link.description}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent mt-2 rounded-md border px-3 py-2.5"
                >
                  <span className="block text-sm font-medium">
                    Officer sign-in
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    Submit reports and see your scorecard.
                  </span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
