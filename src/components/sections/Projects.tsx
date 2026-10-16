import Link from "next/link";
import type { ReactNode } from "react";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { ScanOnView } from "@/components/motion/ScanOnView";
import { MoreProjects } from "@/components/sections/MoreProjects";
import { ScanStory } from "@/components/sections/ScanStory";
import { TryScamRules } from "@/components/sections/TryScamRules";
import { checkSms } from "@/lib/scam-sms";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ButtonLink, pairedPill } from "@/components/ui/links";
import { Screenshot } from "@/components/ui/Screenshot";
import { Ink } from "@/components/ink/Ink";
import { Note } from "@/components/ink/Note";
import { arrow, ring } from "@/lib/ink";

/**
 * One project as a tile: the name (a link to the case study), one line and two pill buttons, on
 * the left; then what the project shows. A picture sits beside the words from 1024px (under them
 * below that), cut off by the tile's bottom edge, with a note in ink pointing at it; the story runs
 * the full width under the words (CSS: .tile, .tile-split, .tile-picture).
 */
function ProjectTile({ p, children }: { p: FeaturedProject; children: ReactNode }) {
  return (
    <article className={`tile pt-11 min-[834px]:pt-14 ${p.story ? "pb-12 md:pb-16" : "tile-split"}`}>
      <div className="px-gutter">
        <h3 className="type-section text-text">
          <Link href={projectHref(p.slug)} className="decoration-2 underline-offset-[8px] hover:underline">
            {p.title}
          </Link>
        </h3>
        <p className="type-lede mt-2 max-w-[40ch] text-text-2">{p.tileLine}</p>
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={projectHref(p.slug)} variant="light" className={pairedPill}>
            Read the case study<span className="sr-only">: {p.title}</span>
          </ButtonLink>
          <ButtonLink href={p.repo.href} external variant="outline" className={pairedPill}>
            {p.repo.label}
            <span className="sr-only">: {p.title}</span>
          </ButtonLink>
        </div>
        {p.note && (
          <div className="tile-note mt-10 lg:mt-16">
            <Note>{p.note}</Note>
            {/* Towards the picture: to the right beside it, down above it. */}
            <Ink paths={arrow([[4, 34], [52, 14], [112, 28]], 41)} w={120} h={44} className="ml-2 hidden h-[44px] w-[120px] lg:inline-block" />
            <Ink paths={arrow([[18, 2], [8, 26], [20, 50]], 43)} w={32} h={56} className="mt-1 block h-[56px] w-[32px] lg:hidden" />
          </div>
        )}
      </div>
      {children}
    </article>
  );
}

/** What each project's tile shows: the story, a screenshot, or (for Immensa, which has none) its code. */
function TileContent({ p }: { p: FeaturedProject }) {
  if (p.story)
    return (
      <>
        <ScanStory story={p.story} />
        <TryScamRules sample={p.story.text} initial={checkSms(p.story.text)} source={p.story.source} />
      </>
    );
  const code = p.caseStudy.decision.code;
  return (
    <>
      <div className={p.homeShot ? "tile-picture" : "tile-picture tile-picture-code"}>
        {p.homeShot ? (
          <ScanOnView>
            <Screenshot
              shot={p.homeShot}
              scan
              captionHidden
              sizes="(min-width: 1024px) 760px, 92vw"
              annotation={
                p.ring && (
                  // Drawn at rest: inside the image's clipped box, a scroll timeline would never finish.
                  <Ink
                    paths={ring(120, 64, 11)}
                    w={120}
                    h={64}
                    draw="none"
                    className="absolute"
                    style={{ left: `${p.ring.x}%`, top: `${p.ring.y}%`, width: `${p.ring.w}%`, height: `${p.ring.h}%` }}
                  />
                )
              }
            />
          </ScanOnView>
        ) : code ? (
          <div className="text-left">
            <CodeBlock excerpt={code} teaser mark />
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
