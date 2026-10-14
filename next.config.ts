import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A fully static site: `npm run build` writes it to /out, which GitHub Pages serves as is.
  output: "export",
  // Each page becomes a folder with an index.html (/projects/scam-detection/index.html), which
  // GitHub Pages and any other static host serve without extra configuration.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
