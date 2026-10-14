import Link from "next/link";
import { featured, more, projectHref, type FeaturedProject, type MoreProject } from "@/content/projects";
import { site } from "@/content/site";
import { emphasize } from "@/lib/emphasize";
import { ScanOnView } from "@/components/motion/ScanOnView";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Figures } from "@/components/ui/Figures";
import { TextLink } from "@/components/ui/links";
import { Screenshot } from "@/components/ui/Screenshot";

/**
 * The project's picture, large: its home-page screenshot (or first case-study figure), or for a
 * project without screenshots, the code excerpt from its case study. Both are real. It tilts flat
 * and brightens as it arrives (CSS: .frame), and the opening's scan line passes over it once
 * (ScanOnView).
 */
function ProjectFrame({ p }: { p: FeaturedProject }) {
  const shot = p.homeShot ?? p.caseStudy.figures[0];
  const code = p.caseStudy.decision.code;
  return (
    <div data-scene="pass" data-frame className="frame mx-auto mt-12 w-full max-w-[680px] md:mt-16">
      <ScanOnView>
        {shot ? <Screenshot shot={shot} scan sizes="(min-width: 760px) 668px, calc(100vw - 44px)" /> : code ? <CodeBlock excerpt={code} compact scan /> : null}
      </ScanOnView>
    </div>
  );
}

/**
 * One featured project as a showcase, in the manner of a product page: the title and a grey
 * summary with its key phrase in white, centred; the picture, large; a row of figures from the
 * result, set big in white with a line saying what each measures; then the links. All three use
 * this same layout; they alternate in tone (CSS: .showcase).
 */
function Showcase({ p }: { p: FeaturedProject }) {
  return (
    <article className="showcase py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <div className="mx-auto max-w-[780px] text-center">
          <h3 className="type-section text-text">
            <Link href={projectHref(p.slug)} className="decoration-2 underline-offset-[8px] hover:underline">
              {p.title}
            </Link>
          </h3>
          <p className="type-lede mx-auto mt-5 max-w-[40ch] text-text-3">
            {emphasize(p.summary, [p.summaryKeyPhrase]).map((part, i) =>
              part.strong ? (
                <strong key={i} className="font-[inherit] text-text">
                  {part.text}
                </strong>
              ) : (
                part.text
              ),
            )}
          </p>
        </div>

        <ProjectFrame p={p} />

        <ul className="mx-auto mt-14 grid max-w-[920px] gap-x-10 gap-y-8 text-center sm:grid-cols-3 md:mt-16">
          {p.stats.map((s) => (
            <li key={s.value}>
              <p>
                <span data-stat-value className="type-stat block text-text">
                  {s.value}
                </span>
                <span className="mt-2 block text-[17px] leading-snug text-text-3">{s.label}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
          <TextLink href={projectHref(p.slug)} className="font-medium">
            Read the case study<span className="sr-only">: {p.title}</span>
          </TextLink>
          <TextLink href={p.repo.href} external>
            {p.repo.label}
            <span className="sr-only">: {p.title}</span>
          </TextLink>
        </div>
        <p className="mx-auto mt-2 max-w-[62ch] text-center text-[17px] text-text-3">
          {p.kind}, {p.year}, {p.team.toLowerCase()}. {p.availability} Built with {p.stack.join(", ")}.
        </p>
      </div>
    </article>
  );
}

function MoreRow({ p }: { p: MoreProject }) {
  const meta = [p.kind, p.year].filter(Boolean).join(", ");
  return (
    <li>
      <h4 className="type-title text-text">{p.title}</h4>
      {meta && <p className="type-small mt-1 text-text-3">{meta}</p>}
      <p className="mt-3 text-[17px] leading-relaxed text-text-2">
        <Figures text={p.summary} />
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-6">
        {p.links.map((l) => (
          <TextLink key={l.href} href={l.href} external>
            {l.label}
            <span className="sr-only">: {p.title}</span>
          </TextLink>
        ))}
        {p.note && <p className="type-small inline-flex min-h-11 items-center text-text-3">{p.note}</p>}
      </div>
    </li>
  );
}

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="mx-auto max-w-[1200px] px-gutter pb-16 pt-24 md:pb-20 md:pt-32">
        <h2 id="projects-title" className="type-section text-text-3">
          Selected projects
        </h2>
        <p className="type-lede mt-4 max-w-[46ch] text-text-3">
          Three projects with public code, <strong className="font-[inherit] text-text">each with a case study</strong>.
        </p>
      </div>

      {featured.map((p) => (
        <Showcase key={p.slug} p={p} />
      ))}

      <div className="mx-auto max-w-[1200px] px-gutter py-24 md:py-32">
        <h3 className="type-section text-text-3">More projects</h3>
        <ul className="mt-12 grid gap-x-16 gap-y-20 md:grid-cols-2">
          {more.map((p) => (
            <MoreRow key={p.title} p={p} />
          ))}
        </ul>
        <TextLink href={site.github.url} external className="mt-10">
          Everything else on GitHub
        </TextLink>
      </div>
    </section>
  );
}
