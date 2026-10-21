import Link from "next/link";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { MoreProjects } from "@/components/sections/MoreProjects";
import { ScamChecker } from "@/components/sections/ScamChecker";
import { WorkCarousel } from "@/components/sections/WorkCarousel";
import { checkScam, SAMPLES } from "@/lib/scam-rules";
import { ButtonLink } from "@/components/ui/links";
import { Screenshot } from "@/components/ui/Screenshot";
import { Ink } from "@/components/ink/Ink";
import { ring } from "@/lib/ink";

/**
 * A card's picture, in one frame for all three: a real screenshot, held at its foot, where the
 * evidence is (the scam tool's result, Resume Analyzer's score, ringed by hand). Immensa has no
 * screenshots yet, so its frame says so and shows nothing made up; its code is in its case study.
 * The window is a golden rectangle and cuts the rest off (CSS: .card-picture).
 */
function CardPicture({ p }: { p: FeaturedProject }) {
  const shot = p.slug === "scam-detection" ? p.caseStudy.figures[0] : p.homeShot;
  if (shot)
    return (
      <div className="card-picture card-picture-foot">
        <Screenshot
          shot={shot}
          captionHidden
          sizes="(min-width: 768px) 620px, 85vw"
          annotation={
            p.ring && (
              // Drawn at rest: inside the picture's clipped window, a scroll timeline would never finish.
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
      </div>
    );
  return (
    <div className="card-picture card-picture-pending">
      <p>Android screenshots to come</p>
    </div>
  );
}

/** One project: its picture, its name (a link to the case study), one line, three tools and the two links. */
function WorkCard({ p }: { p: FeaturedProject }) {
  return (
    <article className="work-card">
      <CardPicture p={p} />
      <div className="card-body">
        <h3 className="type-title text-text">
          <Link href={projectHref(p.slug)} className="decoration-2 underline-offset-[6px] hover:underline">
            {p.title}
          </Link>
        </h3>
        <p className="mt-f8 text-[17px] text-text-2">{p.tileLine}</p>
        <ul aria-label="Built with" className="card-tags">
          {p.stack.slice(0, 3).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="mt-f21 flex flex-wrap gap-f13">
          <ButtonLink href={projectHref(p.slug)} variant="light">
            Read the case study<span className="sr-only">: {p.title}</span>
          </ButtonLink>
          <ButtonLink href={p.repo.href} external variant="outline">
            {p.repo.label}
            <span className="sr-only">: {p.title}</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/**
 * The selected work: a heading, then the three projects with public code and a case study as a
 * row of cards (WorkCarousel); then the scam checker to try, in its own section (#demo); then the
 * rest as a plain list.
 */
export function Projects() {
  const sample = SAMPLES.find((s) => s.kind === "text")!;
  return (
    <section id="projects" aria-labelledby="projects-title" className="pb-f34 pt-f55 md:pt-f89">
      <WorkCarousel
        label="Selected work"
        names={featured.map((p) => p.title)}
        header={
          <>
            <h2 id="projects-title" className="type-display section-title text-text">
              Selected work
            </h2>
            <p className="type-lede mt-f13 text-text-3">Three with public code and a case study each, then the rest.</p>
          </>
        }
      >
        {featured.map((p) => (
          <li key={p.slug}>
            <WorkCard p={p} />
          </li>
        ))}
      </WorkCarousel>

      <ScamChecker initial={checkScam(sample.kind, sample.text)!} />

      <MoreProjects />
    </section>
  );
}
