import { crops, featured, projectHref, type FeaturedProject } from "@/content/projects";
import { MoreProjects } from "@/components/sections/MoreProjects";
import { ProjectChapter } from "@/components/sections/ProjectChapter";
import { ScamChecker } from "@/components/sections/ScamChecker";
import { ScamSteps } from "@/components/sections/ScamSteps";
import { checkScam, SAMPLES } from "@/lib/scam-rules";
import { Crop } from "@/components/ui/Crop";
import { ButtonLink, TextLink } from "@/components/ui/links";

/** Resume Analyzer's visual: its score (ringed) and its gap analysis, two crops of one capture. */
function ResumeVisual({ p }: { p: FeaturedProject }) {
  const [score, gap] = p.chapter!.visual!;
  return (
    <figure>
      <div className="resume-visual">
        <Crop crop={crops[score]} sizes="(min-width: 1200px) 640px, 90vw" />
        <Crop crop={crops[gap]} sizes="(min-width: 1200px) 420px, 90vw" />
      </div>
      <figcaption className="type-small mt-f13 max-w-[62ch] text-text-3">{p.chapter!.caption}</figcaption>
    </figure>
  );
}

/**
 * A project with a case study but no pictures yet (Immensa): one compact row, its name, what it is,
 * what kind and when, and its two links. No frame, and nothing made up to fill one.
 */
function CompactEntry({ p }: { p: FeaturedProject }) {
  return (
    <div className="mx-auto max-w-[1200px] px-gutter">
      <div id={p.slug} className="compact-entry">
        <div>
          <h3 className="type-title text-text">{p.title}</h3>
          <p className="mt-f8 max-w-[62ch] text-[17px] leading-[1.618] text-text-2">{p.summary}</p>
          <p className="type-small mt-f8 text-text-3">
            {p.kind} · {p.stack.slice(0, 2).join(", ")} · {p.year}
          </p>
        </div>
        <div className="flex flex-wrap gap-f13 min-[834px]:justify-end">
          <ButtonLink href={projectHref(p.slug)} variant="light">
            Read the case study<span className="sr-only">: {p.title}</span>
          </ButtonLink>
          <ButtonLink href={p.repo.href} external variant="outline">
            {p.repo.label}
            <span className="sr-only">: {p.title}</span>
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

/**
 * The selected work, told as chapters: the scam detection tool (its story in three crops, then the
 * live checker), Resume Analyzer (its score and its gap analysis), and Immensa as a compact entry
 * until real screenshots exist. Then the rest, as a plain list, in a section of its own.
 */
export function Projects() {
  const sample = SAMPLES.find((s) => s.kind === "text")!;
  const bySlug = (slug: string) => featured.find((p) => p.slug === slug)!;
  const scam = bySlug("scam-detection");
  const resume = bySlug("resume-analyzer");
  const immensa = bySlug("immensa-inquiry-app");
  return (
    <>
      <section id="projects" aria-labelledby="projects-title">
        <h2 id="projects-title" className="sr-only">
          Selected work
        </h2>
        <ProjectChapter
          p={scam}
          links={
            <TextLink href="#demo" className="chapter-try">
              Try it on your own text
            </TextLink>
          }
          after={<ScamChecker initial={checkScam(sample.kind, sample.text)!} />}
        >
          <ScamSteps p={scam} />
        </ProjectChapter>
        <ProjectChapter p={resume}>
          <ResumeVisual p={resume} />
        </ProjectChapter>
        <CompactEntry p={immensa} />
      </section>
      <MoreProjects />
    </>
  );
}
