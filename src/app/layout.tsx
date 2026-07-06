import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OK2027 — Civic participation for 2027",
    template: "%s | OK2027",
  },
  description:
    "A community and civic-participation app for Nigerian supporters ahead of the 2027 elections. Learn, organise your polling unit, and participate peacefully.",
  manifest: "/OK2027/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0B7A3B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolageGrotesque.variable} ${dmSans.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
