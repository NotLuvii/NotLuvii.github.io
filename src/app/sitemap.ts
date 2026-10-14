import type { MetadataRoute } from "next";
import { featured, projectHref } from "@/content/projects";
import { site } from "@/content/site";

// Built once into a static file for GitHub Pages.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1 },
    ...featured.map((p) => ({ url: `${site.url}${projectHref(p.slug)}`, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
