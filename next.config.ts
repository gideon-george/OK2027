import type { NextConfig } from "next";

// Static export for GitHub Pages. The site is served from a repository
// sub-path, so every route and asset lives under a base path (in dev too, for
// consistency). Moving to a custom domain such as nokm.ng is then a one-line
// change: set NEXT_PUBLIC_BASE_PATH to an empty string.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/OK2027";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
  experimental: {
    // `radix-ui` is an umbrella package re-exporting 55 primitives, so a bare
    // `import { Slot } from "radix-ui"` in a shadcn component drags most of
    // Radix into the bundle. Members are on metered data over patchy
    // networks — this keeps each page to the primitives it actually uses.
    optimizePackageImports: ["radix-ui", "lucide-react"],
  },
};

export default nextConfig;
