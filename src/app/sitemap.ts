import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Built once into a static file for GitHub Pages.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "monthly", priority: 1 }];
}
