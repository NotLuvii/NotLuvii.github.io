import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Built once into a static file for GitHub Pages.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.url}/sitemap.xml` };
}
