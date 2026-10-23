import localFont from "next/font/local";

/**
 * IBM Plex Sans (variable: weight 100–700, width 75–100%) for text, IBM Plex Mono for labels,
 * captions and code. Plex was drawn for engineering work, which suits a site about software and
 * data tools. Both are self-hosted and licensed under the SIL Open Font License
 * (src/fonts/IBM-Plex-LICENSE.txt).
 */
export const plexSans = localFont({
  src: [{ path: "../fonts/ibm-plex-sans-latin-variable.woff2", style: "normal", weight: "100 700" }],
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  variable: "--font-plex-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const plexMono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400.woff2", style: "normal", weight: "400" },
    { path: "../fonts/ibm-plex-mono-latin-500.woff2", style: "normal", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
});
