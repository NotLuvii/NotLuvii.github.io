import localFont from "next/font/local";

/**
 * Inter 4, self-hosted, with its optical-size axis: the closest open typeface to Apple's SF Pro.
 * Optical sizing tightens large headlines automatically. Licensed under the SIL Open Font License
 * (src/fonts/Inter-LICENSE.txt).
 */
export const inter = localFont({
  src: [{ path: "../fonts/inter-latin-opsz-normal.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-inter",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
