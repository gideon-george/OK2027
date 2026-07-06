import type { NextConfig } from "next";

// Static export for GitHub Pages. The site is served from
// https://gideon-george.github.io/OK2027/, so every route and asset lives
// under the /OK2027 base path (in dev too, for consistency).
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/OK2027",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
