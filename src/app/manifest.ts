import type { MetadataRoute } from "next";
import { basePath, site } from "@/lib/site";

// Required by `output: "export"` — metadata routes must be static.
export const dynamic = "force-static";

/**
 * The web app manifest.
 *
 * Generated rather than kept as public/manifest.json, which hard-coded
 * "/OK2027" in start_url, scope and every icon path and had to be edited by
 * hand for a custom domain. This follows NEXT_PUBLIC_BASE_PATH like everything
 * else, so moving to nokmofficial.org is still a one-line change.
 */
export default function manifest(): MetadataRoute.Manifest {
  const root = basePath || "";

  return {
    name: `${site.name} — ${site.fullName}`,
    short_name: site.name,
    description: site.description,
    start_url: `${root}/`,
    scope: `${root}/`,
    display: "standalone",
    orientation: "portrait",
    theme_color: "#1a3a8f",
    background_color: "#ffffff",
    categories: ["politics", "education", "social"],
    lang: "en-NG",
    icons: [
      {
        src: `${root}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${root}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${root}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Adopt a polling unit",
        url: `${root}/coverage/adopt`,
      },
      {
        name: "Coverage map",
        url: `${root}/coverage`,
      },
      {
        name: "Join the movement",
        url: `${root}/join`,
      },
    ],
  };
}
