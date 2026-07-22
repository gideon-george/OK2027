import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Required by `output: "export"` — metadata routes must be static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The officer dashboard is member data behind auth; keep it out of search.
      disallow: ["/dashboard"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
