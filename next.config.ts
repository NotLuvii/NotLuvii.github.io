import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A fully static site: `npm run build` writes it to /out, which GitHub Pages serves as is.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
