import Link from "next/link";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { MoreProjects } from "@/components/sections/MoreProjects";
import { TryScamRules } from "@/components/sections/TryScamRules";
import { WorkCarousel } from "@/components/sections/WorkCarousel";
import { Tilt } from "@/components/motion/Tilt";
import { checkSms } from "@/lib/scam-sms";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ButtonLink } from "@/components/ui/links";
import { Screenshot } from "@/components/ui/Screenshot";
import { Ink } from "@/components/ink/Ink";
import { ring } from "@/lib/ink";

/**
 * A card's picture: a real screenshot, held at its foot, where the evidence is (the scam tool's
 * result, Resume Analyzer's score, ringed by hand); or, for Immensa, which has no screenshots, the
 * top of its code. The window is 16:10 and cuts the rest off (CSS: .card-picture).
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
  const code = p.caseStudy.decision.code;
  return code ? (
    <div className="card-picture">
      <CodeBlock excerpt={code} teaser />
    </div>
  ) : null;
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
 * row of cards (WorkCarousel); then the scam checker to try; then the rest as a plain list.
 */
export function Projects() {
  const scam = featured.find((p) => p.story)!;
  return (
    <section id="projects" aria-labelledby="projects-title" className="pb-f34 pt-f89 md:pb-f34 md:pt-f144">
      <WorkCarousel
        label="Selected work"
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
            <Tilt className="h-full rounded-xl">
              <WorkCard p={p} />
            </Tilt>
          </li>
        ))}
      </WorkCarousel>

      <TryScamRules sample={scam.story!.text} initial={checkSms(scam.story!.text)} source={scam.story!.source} />

      <MoreProjects />
    </section>
  );
}
