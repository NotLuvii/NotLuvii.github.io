import type { ReactNode } from "react";
import { projectHref, type FeaturedProject } from "@/content/projects";
import { ButtonLink } from "@/components/ui/links";

/**
 * One project told as a chapter, the way a product page tells one product: the project's name
 * (small, its heading), a benefit headline set large, a short lede, the links (the case study and
 * the code, plus `links` for anything the chapter adds), then the chapter's own visual (`children`),
 * one known limitation stated plainly, and anything after it (`after`: the live checker).
 */
export function ProjectChapter({ p, links, children, after }: { p: FeaturedProject; links?: ReactNode; children: ReactNode; after?: ReactNode }) {
  const c = p.chapter!;
  return (
    <article id={p.slug} aria-labelledby={`${p.slug}-name`} className="chapter">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h3 id={`${p.slug}-name`} className="chapter-name">
          {p.title}
        </h3>
        <p className="chapter-headline type-section text-text">{c.headline}</p>
        <p className="chapter-lede type-lede font-normal text-text-2">{c.lede}</p>
        <div className="chapter-links">
          <ButtonLink href={projectHref(p.slug)} variant="light">
            Read the case study<span className="sr-only">: {p.title}</span>
          </ButtonLink>
          <ButtonLink href={p.repo.href} external variant="outline">
            {p.repo.label}
            <span className="sr-only">: {p.title}</span>
          </ButtonLink>
          {links}
        </div>
        <div className="chapter-visual">{children}</div>
        <p className="chapter-limit">
          <span className="chapter-limit-label">Known limitation</span> {c.limitation}
        </p>
        {after}
      </div>
    </article>
  );
}
