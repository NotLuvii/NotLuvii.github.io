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
 * pill buttons, centred at the top; then what the project shows, which sits at the bottom of the
 * tile and runs past its edge (CSS: .tile, .tile-picture).
 */
function ProjectTile({ p, wide = false, children }: { p: FeaturedProject; wide?: boolean; children: ReactNode }) {
  return (
    <article className={`tile flex flex-col pt-11 text-center min-[834px]:pt-14 ${wide ? "tile-wide pb-12 md:pb-16" : "min-h-[540px] min-[834px]:min-h-[640px]"}`}>
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

/** What each project's tile shows: the story, a screenshot, or (for Immensa) its figures and code. */
function TileContent({ p }: { p: FeaturedProject }) {
  if (p.story) return <ScanStory story={p.story} />;
  const code = p.caseStudy.decision.code;
  return (
    <>
      {p.tileFigures && (
        <ul className="mx-auto mt-20 flex justify-center gap-10 md:gap-12">
          {p.tileFigures.map((s) => (
            <li key={s.label}>
              <span data-stat-value className="type-stat block text-text">
                {s.value}
              </span>
              <span className="type-small block text-text-3">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="tile-picture mt-10">
        {p.homeShot ? (
          <ScanOnView>
            <Screenshot shot={p.homeShot} scan captionHidden sizes="(min-width: 834px) 600px, 88vw" />
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
 * The projects, as tiles: the scam detection tool full width, telling its story as you scroll,
 * then the other two side by side, then the rest as small tiles (MoreProjects).
 */
export function Projects() {
  const [lead, ...rest] = featured;
  return (
    <section id="projects" aria-labelledby="projects-title">
      <h2 id="projects-title" className="sr-only">
        Projects
      </h2>
      <div className="tile-grid">
        <ProjectTile p={lead} wide>
          <TileContent p={lead} />
        </ProjectTile>
        {rest.map((p) => (
          <ProjectTile key={p.slug} p={p}>
            <TileContent p={p} />
          </ProjectTile>
        ))}
      </div>

      <MoreProjects />
    </section>
  );
}
