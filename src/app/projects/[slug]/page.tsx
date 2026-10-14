import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { featured, projectHref } from "@/content/projects";
import { site } from "@/content/site";
import { CaseStudy } from "@/components/CaseStudy";

// Only the featured projects have case studies; every page is built ahead of time.
export const dynamicParams = false;

export function generateStaticParams() {
  return featured.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const shareImage = { url: "/opengraph-image.png", width: 1200, height: 630, alt: `${site.name}, software engineer building reliable web apps and data tools.` };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = featured.find((f) => f.slug === slug);
  if (!p) return {};
  const title = `${p.title}, case study`;
  return {
    title,
    description: p.summary,
    alternates: { canonical: projectHref(p.slug) },
    // Child metadata replaces the parent's openGraph object, so the site-wide preview image is restated.
    openGraph: { type: "article", url: projectHref(p.slug), title, description: p.summary, images: [shareImage] },
    twitter: { card: "summary_large_image", title, description: p.summary, images: [shareImage] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = featured.find((f) => f.slug === slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
