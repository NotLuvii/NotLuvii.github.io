import Link from "next/link";
import { featured, more, projectHref, type FeaturedProject, type MoreProject } from "@/content/projects";
import { site } from "@/content/site";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Figures } from "@/components/ui/Figures";
import { TextLink } from "@/components/ui/links";
import { Reveal } from "@/components/ui/Reveal";
import { Screenshot } from "@/components/ui/Screenshot";

/**
 * The picture beside each project: one of its screenshots (the first, unless the project names
 * another), or for a project without screenshots, the code excerpt from its case study. Both are
 * real. It tilts flat and brightens as it arrives (CSS: .frame).
 */
function ProjectFrame({ p }: { p: FeaturedProject }) {
  const shot = p.caseStudy.figures[p.homeFigure ?? 0];
  const code = p.caseStudy.decision.code;
  return (
    <div data-scene="pass" data-frame className="frame mx-auto w-full max-w-[540px] lg:mx-0 lg:ml-auto">
      {shot ? <Screenshot shot={shot} sizes="(min-width: 1024px) 540px, 100vw" /> : code ? <CodeBlock excerpt={code} /> : null}
    </div>
  );
}

/** One featured project. All three use this same chapter layout. */
function Chapter({ p }: { p: FeaturedProject }) {
  const facts = [
    ["Built", p.built],
    ["Key decision", p.decision],
    ["Result", p.result],
    ["Stack", p.stack.join(", ")],
  ] as const;
  return (
    <article className="border-t border-line py-20 md:py-28">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <p className="type-label text-text-3">
            {p.kind} · {p.year} · {p.team}
          </p>
          <h3 className="type-title mt-3 text-text">
            <Link href={projectHref(p.slug)} className="underline-offset-[6px] hover:text-amber hover:underline">
              {p.title}
            </Link>
          </h3>
          <p className="type-lede mt-5 max-w-[46ch] text-text-2">{p.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-1">
            <TextLink href={projectHref(p.slug)} className="font-medium">
              Read the case study<span className="sr-only">: {p.title}</span>
            </TextLink>
            <TextLink href={p.repo.href} external>
              {p.repo.label}
              <span className="sr-only">: {p.title}</span>
            </TextLink>
          </div>
          <p className="type-label mt-1 text-text-3">{p.availability}</p>
        </div>
        <ProjectFrame p={p} />
      </div>
      <dl className="mt-16 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([term, text]) => (
          <div key={term}>
            <dt className="type-label text-text-3">{term}</dt>
            <dd className="type-small mt-2 text-text-2">{text}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function MoreRow({ p }: { p: MoreProject }) {
  const meta = [p.year, p.kind].filter(Boolean).join(" · ");
  return (
    <li className="-mx-4 px-4 py-6 transition-colors hover:bg-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="text-[18px] font-semibold text-text">{p.title}</h4>
        {meta && <p className="type-label text-text-3">{meta}</p>}
      </div>
      <p className="type-small mt-2 text-text-2">
        <Figures text={p.summary} />
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-6">
        {p.links.map((l) => (
          <TextLink key={l.href} href={l.href} external className="type-small">
            {l.label}
            <span className="sr-only">: {p.title}</span>
          </TextLink>
        ))}
        {p.note && <p className="type-label inline-flex min-h-11 items-center text-text-3">{p.note}</p>}
      </div>
    </li>
  );
}

export function Projects() {
  const half = Math.ceil(more.length / 2);
  return (
    <section id="projects" aria-labelledby="projects-title" className="pt-24 md:pt-36">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="projects-title" className="type-section text-text">
          Selected projects
        </h2>
        <p className="type-lede mt-4 max-w-[52ch] text-text-2">Three projects with public code, each with a case study.</p>

        <div className="mt-16">
          {featured.map((p) => (
            <Chapter key={p.slug} p={p} />
          ))}
        </div>

        <div className="border-t border-line pb-24 pt-20 md:pb-36">
          <h3 className="type-title text-text">More projects</h3>
          <div className="mt-8 grid gap-x-16 md:grid-cols-2">
            {[more.slice(0, half), more.slice(half)].map((col, i) => (
              <Reveal as="ul" key={i} className="divide-y divide-line border-y border-line">
                {col.map((p) => (
                  <MoreRow key={p.title} p={p} />
                ))}
              </Reveal>
            ))}
          </div>
          <TextLink href={site.github.url} external className="mt-6">
            Everything else on GitHub
          </TextLink>
        </div>
      </div>
    </section>
  );
}
