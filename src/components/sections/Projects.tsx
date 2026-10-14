import Link from "next/link";
import { featured, more, projectHref, type FeaturedProject, type MoreProject } from "@/content/projects";
import { site } from "@/content/site";
import { Figures } from "@/components/ui/Figures";
import { ButtonLink, TextLink } from "@/components/ui/links";
import { Reveal } from "@/components/ui/Reveal";
import { Screenshot } from "@/components/ui/Screenshot";

function Meta({ p }: { p: FeaturedProject }) {
  return (
    <p className="type-label text-ash">
      {p.kind} · {p.year} · {p.team}
    </p>
  );
}

/** The four answers every featured project gives: what was built, a decision, the result, the stack. */
function Facts({ p }: { p: FeaturedProject }) {
  const rows = [
    ["Built", p.built],
    ["Key decision", p.decision],
    ["Result", p.result],
  ] as const;
  return (
    <dl className="mt-5 space-y-3 text-[15px] leading-[1.5]">
      {rows.map(([term, text]) => (
        <div key={term}>
          <dt className="font-semibold text-ink">{term}</dt>
          <dd className="text-ash">{text}</dd>
        </div>
      ))}
      <div>
        <dt className="font-semibold text-ink">Stack</dt>
        <dd className="text-ash">{p.stack.join(", ")}</dd>
      </div>
    </dl>
  );
}

function Actions({ p, primary }: { p: FeaturedProject; primary?: boolean }) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {primary ? (
          <ButtonLink href={projectHref(p.slug)}>
            Read the case study<span className="sr-only">: {p.title}</span>
          </ButtonLink>
        ) : (
          <TextLink href={projectHref(p.slug)} className="font-medium">
            Read the case study<span className="sr-only">: {p.title}</span>
          </TextLink>
        )}
        <TextLink href={p.repo.href} external>
          {p.repo.label}
          <span className="sr-only">: {p.title}</span>
        </TextLink>
      </div>
      <p className="type-caption mt-1 text-ash">{p.availability}</p>
    </div>
  );
}

function LeadProject({ p }: { p: FeaturedProject }) {
  return (
    <Reveal as="article" className="grid gap-8 rounded-2xl border border-hairline bg-white p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10 lg:p-10">
      <div>
        <Meta p={p} />
        <h3 className="type-card mt-2 text-ink">
          <Link href={projectHref(p.slug)} className="underline-offset-4 hover:underline">
            {p.title}
          </Link>
        </h3>
        <p className="mt-3 text-[17px] text-ink">{p.summary}</p>
        <Facts p={p} />
        <Actions p={p} primary />
      </div>
      {p.cover && (
        <div className="md:pt-1">
          <Screenshot shot={p.cover} sizes="(min-width: 1024px) 440px, (min-width: 768px) 45vw, 100vw" />
        </div>
      )}
    </Reveal>
  );
}

function SupportingProject({ p }: { p: FeaturedProject }) {
  return (
    <Reveal as="article" className="flex flex-col rounded-2xl border border-hairline bg-white p-6 sm:p-8">
      <Meta p={p} />
      <h3 className="type-card mt-2 text-ink">
        <Link href={projectHref(p.slug)} className="underline-offset-4 hover:underline">
          {p.title}
        </Link>
      </h3>
      <p className="mt-3 text-[17px] text-ink">{p.summary}</p>
      <Facts p={p} />
      <div className="mt-auto">
        <Actions p={p} />
      </div>
    </Reveal>
  );
}

function MoreRow({ p }: { p: MoreProject }) {
  const meta = [p.year, p.kind].filter(Boolean).join(" · ");
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="text-[17px] font-semibold tracking-[-0.018em] text-ink">{p.title}</h4>
        {meta && <p className="type-caption text-ash">{meta}</p>}
      </div>
      <p className="type-small mt-1 text-ash">
        <Figures text={p.summary} />
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-5">
        {p.links.map((l) => (
          <TextLink key={l.href} href={l.href} external className="type-small">
            {l.label}
            <span className="sr-only">: {p.title}</span>
          </TextLink>
        ))}
        {p.note && <p className="type-caption inline-flex min-h-11 items-center text-ash">{p.note}</p>}
      </div>
    </li>
  );
}

export function Projects() {
  const [lead, ...supporting] = featured;
  const half = Math.ceil(more.length / 2);
  return (
    <section id="projects" aria-labelledby="projects-title" className="bg-mist py-16 md:py-24">
      <div className="mx-auto max-w-[1080px] px-gutter">
        <h2 id="projects-title" className="type-section text-ink">
          Selected projects
        </h2>
        <p className="mt-3 max-w-[60ch] text-[17px] text-ash">Three projects with public code, each with a case study.</p>

        <div className="mt-10 space-y-6">
          <LeadProject p={lead} />
          <div className="grid gap-6 md:grid-cols-2">
            {supporting.map((p) => (
              <SupportingProject key={p.slug} p={p} />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h3 className="type-card text-ink">More projects</h3>
          <div className="mt-2 grid gap-x-10 md:grid-cols-2">
            {[more.slice(0, half), more.slice(half)].map((col, i) => (
              <ul key={i} className="divide-y divide-line border-t border-line">
                {col.map((p) => (
                  <MoreRow key={p.title} p={p} />
                ))}
              </ul>
            ))}
          </div>
          <TextLink href={site.github.url} external className="mt-4">
            Everything else on GitHub
          </TextLink>
        </div>
      </div>
    </section>
  );
}
