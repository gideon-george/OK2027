import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { basePath, site, siteOrigin, siteUrl } from "@/lib/site";
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
  metadataBase: new URL(siteOrigin),
  title: {
    default: `${site.name} — ${site.fullName}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.fullName,
  manifest: `${basePath}/manifest.json`,
  // Distribution happens by WhatsApp forward, so link previews are a feature.
  openGraph: {
    type: "website",
    siteName: site.fullName,
    title: `${site.name} — ${site.fullName}`,
    description: site.description,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.fullName}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#1a3a8f",
};

// Identifies NOkM as an independent political support movement, so search
// engines and previews do not present it as the NDC party itself.
const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.fullName,
  alternateName: site.name,
  url: siteUrl,
  slogan: site.tagline,
  description: site.description,
  areaServed: "NG",
  disambiguatingDescription:
    "An independent grassroots support movement. Not an organ of the Nigeria Democratic Congress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolageGrotesque.variable} ${dmSans.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <ThemeProvider>
          <a
            href="#main"
            className="focus:bg-background sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:border focus:px-3 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
