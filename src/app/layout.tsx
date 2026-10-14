import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { inter } from "./fonts";
import { site } from "@/content/site";
import "./globals.css";

const title = `${site.name}, ${site.role.toLowerCase()}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: ["Luvneet Bamrah", "software engineer", "data validation", "automated reporting", "quality", "manufacturing", "Python", "SQL", "React"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title, description: site.description, locale: "en_CA" },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/** Marks that JavaScript is running, before first paint, so scroll reveals never hide content without it. */
const boot = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
