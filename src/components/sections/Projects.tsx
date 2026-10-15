import Link from "next/link";
import type { ReactNode } from "react";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { ScanOnView } from "@/components/motion/ScanOnView";
import { MoreProjects } from "@/components/sections/MoreProjects";
import { ScanStory } from "@/components/sections/ScanStory";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ButtonLink, pairedPill } from "@/components/ui/links";
import { Screenshot } from "@/components/ui/Screenshot";

/**
 * One project as a tile, as on apple.com: the name (a link to the case study), one line, and two
 * pill buttons, centred at the top; then what the project shows: the story, or a picture that sits
 * at the bottom of the tile and runs past its edge (CSS: .tile, .tile-picture).
 */
function ProjectTile({ p, children }: { p: FeaturedProject; children: ReactNode }) {
  return (
    <article className={`tile flex flex-col pt-11 text-center min-[834px]:pt-14 ${p.story ? "pb-12 md:pb-16" : ""}`}>
      <div className="px-gutter">
        <h3 className="type-section text-text">
          <Link href={projectHref(p.slug)} className="decoration-2 underline-offset-[8px] hover:underline">
            {p.title}
          </Link>
        </h3>
        <p className="type-lede mx-auto mt-2 max-w-[48ch] text-text-2">{p.tileLine}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={projectHref(p.slug)} variant="light" className={pairedPill}>
            Read the case study<span className="sr-only">: {p.title}</span>
          </ButtonLink>
          <ButtonLink href={p.repo.href} external variant="outline" className={pairedPill}>
            {p.repo.label}
            <span className="sr-only">: {p.title}</span>
          </ButtonLink>
        </div>
      </div>
      {children}
    </article>
  );
}

/** What each project's tile shows: the story, a screenshot, or (for Immensa, which has none) its code. */
function TileContent({ p }: { p: FeaturedProject }) {
  if (p.story) return <ScanStory story={p.story} />;
  const code = p.caseStudy.decision.code;
  return (
    <>
      <div className="tile-picture">
        {p.homeShot ? (
          <ScanOnView>
            <Screenshot shot={p.homeShot} scan captionHidden sizes="(min-width: 870px) 760px, 88vw" />
          </ScanOnView>
        ) : code ? (
          <div className="text-left">
            <CodeBlock excerpt={code} teaser />
          </div>
        ) : null}
      </div>
    </>
  );
}

/**
 * The projects: a heading, then one full-width tile per project, stacked (CSS: .tile-stack), the
 * scam detection tool first, telling its story as you scroll; then the rest as a plain list.
 */
export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="mx-auto max-w-[1200px] px-gutter pb-8 pt-24 md:pb-10 md:pt-32">
        <h2 id="projects-title" className="type-section text-text">
          Projects
        </h2>
        <p className="type-lede mt-3 text-text-3">Three with public code and a case study each, then the rest.</p>
      </div>
      <div className="tile-stack">
        {featured.map((p) => (
          <ProjectTile key={p.slug} p={p}>
            <TileContent p={p} />
          </ProjectTile>
        ))}
      </div>

      <MoreProjects />
    </section>
  );
}
