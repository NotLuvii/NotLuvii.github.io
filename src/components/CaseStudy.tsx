import Link from "next/link";
import type { ReactNode } from "react";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { ButtonLink, Chevron, TextLink } from "@/components/ui/links";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Screenshot } from "@/components/ui/Screenshot";

/**
 * A case-study section: its heading stays in the left column while the section scrolls (desktop).
 * Sections are separated by space, not lines.
 */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="py-f55 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-f55 md:py-f55">
      <h2 id={id} className="type-title text-text md:sticky md:top-24 md:self-start">
        {title}
      </h2>
      {/* Text keeps a readable measure; screenshots may use the column's full width. */}
      <div className="mt-f13 min-w-0 space-y-f21 text-[17px] leading-[1.618] text-text-2 md:mt-0 [&>*:not(.figures)]:max-w-[68ch]">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-f13">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[20px_minmax(0,1fr)]">
          <span aria-hidden className="mt-[0.7em] size-1.5 rounded-full bg-text-3" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A case study, in the order a reviewer needs it: the title and summary; the first screenshot (or,
 * for Immensa, the frame saying its screenshots are to come); at a glance, the problem, what I did
 * and the outcome; the details; then, farther down, the other screenshots, how it works, the key
 * decision, the rest of the outcome, the limitations and the code. Nothing is printed twice: the
 * glance takes the first paragraph of the context and of the outcome, and the later sections the
 * rest.
 */
export function CaseStudy({ project: p }: { project: FeaturedProject }) {
  const c = p.caseStudy;
  const index = featured.findIndex((f) => f.slug === p.slug);
  const next = featured[(index + 1) % featured.length];
  const [lead, ...screens] = c.figures;
  const [problem, ...context] = c.context;
  const [outcome, ...moreOutcome] = c.outcome;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <article>
        <header>
          <div className="mx-auto max-w-[1200px] px-gutter pb-f34 pt-f34">
            <Link href="/#projects" className="type-small inline-flex min-h-11 items-center gap-f8 text-text-2 underline-offset-4 hover:underline">
              <Chevron left className="translate-y-px" />
              All projects
            </Link>
            <h1 className="type-hero mt-f34 max-w-[16ch] text-text">{p.title}</h1>
            <p className="type-lede mt-f21 max-w-[52ch] text-text-2">{p.summary}</p>
          </div>
        </header>

        <div className="mx-auto max-w-[1200px] px-gutter">
          {lead ? (
            <figure className="cs-lead-figure">
              <div className="cs-lead card-picture card-picture-foot">
                <Screenshot shot={lead} captionHidden sizes="(min-width: 800px) 734px, 90vw" />
              </div>
              {c.figuresNote && <figcaption className="type-small mt-f13 text-text-3">{c.figuresNote}</figcaption>}
            </figure>
          ) : (
            <div className="cs-lead card-picture card-picture-pending">
              <p>Android screenshots to come</p>
            </div>
          )}

          <section id="glance" aria-labelledby="glance-title" className="mt-f55">
            <h2 id="glance-title" className="sr-only">
              At a glance
            </h2>
            <div className="cs-glance">
              <div>
                <h3 className="type-lede text-text">The problem</h3>
                <p className="mt-f8 text-[17px] leading-[1.618] text-text-2">{problem}</p>
              </div>
              <div>
                <h3 className="type-lede text-text">What I did</h3>
                <p className="mt-f8 text-[17px] leading-[1.618] text-text-2">{c.role}</p>
              </div>
              <div>
                <h3 className="type-lede text-text">Outcome</h3>
                <p className="mt-f8 text-[17px] leading-[1.618] text-text-2">{outcome}</p>
              </div>
            </div>
          </section>

          <dl className="mt-f34 grid gap-x-f34 gap-y-f21 rounded-xl bg-panel p-f21 sm:grid-cols-3 md:p-f34">
            <div>
              <dt className="type-small text-text-3">Project</dt>
              <dd className="mt-f5 text-[17px] text-text">
                {p.kind}, {p.year}
              </dd>
            </div>
            <div>
              <dt className="type-small text-text-3">Stack</dt>
              <dd className="mt-f5 text-[17px] text-text">{p.stack.join(", ")}</dd>
            </div>
            <div>
              <dt className="type-small text-text-3">Availability</dt>
              <dd className="mt-f5 text-[17px] text-text">{p.availability}</dd>
            </div>
          </dl>
        </div>

        <div className="mx-auto max-w-[1200px] px-gutter pb-f55 pt-f34">
          {screens.length > 0 && (
            <Section id="screens" title="More screenshots">
              <div className="figures">
                <div className={screens.length > 1 ? "grid items-start gap-f34 sm:grid-cols-2" : "max-w-[560px]"}>
                  {screens.map((f) => (
                    <div key={f.src} data-scene="pass" className="frame">
                      <Screenshot shot={f} sizes="(min-width: 1200px) 420px, (min-width: 640px) 45vw, 100vw" />
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          <Section id="built" title="How it works">
            {context.map((t) => (
              <p key={t}>{t}</p>
            ))}
            <Bullets items={c.built} />
          </Section>

          <Section id="decision" title="Key decision">
            <h3 className="type-lede text-text">{c.decision.title}</h3>
            {c.decision.body.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {c.decision.code && (
              <div className="pt-f8">
                <CodeBlock excerpt={c.decision.code} />
              </div>
            )}
          </Section>

          {moreOutcome.length > 0 && (
            <Section id="outcome" title="More on the outcome">
              {moreOutcome.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </Section>
          )}

          <Section id="limitations" title="Limitations">
            <Bullets items={c.limitations} />
          </Section>

          <Section id="code" title="Inspect the code">
            <div>
              <ButtonLink href={p.repo.href} external>
                {p.repo.label}
              </ButtonLink>
            </div>
            <ul>
              {c.files.map((f) => (
                <li key={f.href}>
                  <TextLink href={f.href} external>
                    {f.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <nav aria-label="Next project" className="bg-panel">
          <div className="mx-auto max-w-[1200px] px-gutter py-f55 md:py-f89">
            <p className="type-small text-text-3">Next project</p>
            <Link
              href={projectHref(next.slug)}
              className="type-section group mt-f8 inline-flex min-h-11 items-center gap-f13 text-text decoration-2 underline-offset-[8px] hover:underline"
            >
              {next.title}
              <Chevron className="translate-y-px transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>
      </article>
    </main>
  );
}
