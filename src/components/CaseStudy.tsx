import Link from "next/link";
import type { ReactNode } from "react";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { ButtonLink, Chevron, TextLink } from "@/components/ui/links";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Screenshot } from "@/components/ui/Screenshot";

/** A case-study section: its heading stays in the left column while the section scrolls (desktop). */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-14 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 md:py-20">
      <h2 id={id} className="text-[20px] font-semibold text-text md:sticky md:top-24 md:self-start">
        {title}
      </h2>
      {/* Text keeps a readable measure; screenshots may use the column's full width. */}
      <div className="mt-4 min-w-0 space-y-5 text-[17px] leading-[1.7] text-text-2 md:mt-0 [&>*:not(.figures)]:max-w-[68ch]">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[20px_minmax(0,1fr)]">
          <span aria-hidden className="mt-[0.8em] h-px w-3 bg-amber" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CaseStudy({ project: p }: { project: FeaturedProject }) {
  const c = p.caseStudy;
  const index = featured.findIndex((f) => f.slug === p.slug);
  const next = featured[(index + 1) % featured.length];

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <article>
        <header>
          <div className="mx-auto max-w-[1200px] px-gutter pb-16 pt-8 md:pb-24">
            <Link href="/#projects" className="type-label inline-flex min-h-11 items-center gap-2 text-text-2 underline-offset-4 hover:text-amber hover:underline">
              <Chevron left className="translate-y-px" />
              All projects
            </Link>
            <p className="type-label mt-10 text-text-3">
              {p.kind} · {p.year} · {p.team}
            </p>
            <h1 className="type-display mt-3 max-w-[18ch] text-text">{p.title}</h1>
            <p className="type-lede mt-6 max-w-[52ch] text-text-2">{p.summary}</p>
            <dl className="mt-12 grid max-w-[900px] gap-x-10 gap-y-6 border-t border-line pt-8 sm:grid-cols-3">
              <div>
                <dt className="type-label text-text-3">Role</dt>
                <dd className="type-small mt-2 text-text-2">{c.role}</dd>
              </div>
              <div>
                <dt className="type-label text-text-3">Stack</dt>
                <dd className="type-small mt-2 text-text-2">{p.stack.join(", ")}</dd>
              </div>
              <div>
                <dt className="type-label text-text-3">Availability</dt>
                <dd className="type-small mt-2 text-text-2">{p.availability}</dd>
              </div>
            </dl>
            <div className="mt-10">
              <ButtonLink href={p.repo.href} external>
                {p.repo.label}
              </ButtonLink>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1200px] px-gutter pb-12">
          <Section id="context" title="Context">
            {c.context.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </Section>

          <Section id="built" title="What I built">
            <Bullets items={c.built} />
          </Section>

          <Section id="decision" title="Key decision">
            <h3 className="text-[19px] font-semibold text-text">{c.decision.title}</h3>
            {c.decision.body.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {c.decision.code && (
              <div className="pt-2">
                <CodeBlock excerpt={c.decision.code} />
              </div>
            )}
          </Section>

          <Section id="outcome" title="Outcome">
            {c.outcome.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {c.figures.length > 0 && (
              <div className="figures space-y-5 pt-4">
                {c.figuresNote && <p className="type-label text-text-3">{c.figuresNote}</p>}
                <div className={c.figures.length > 1 ? "grid items-start gap-10 sm:grid-cols-2" : "max-w-[560px]"}>
                  {c.figures.map((f) => (
                    <div key={f.src} data-scene="pass" className="frame">
                      <Screenshot shot={f} sizes="(min-width: 1200px) 420px, (min-width: 640px) 45vw, 100vw" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section id="limitations" title="Limitations">
            <Bullets items={c.limitations} />
          </Section>

          <Section id="code" title="Inspect the code">
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

        <nav aria-label="Next project" className="border-t border-line">
          <div className="mx-auto max-w-[1200px] px-gutter py-14">
            <p className="type-label text-text-3">Next project</p>
            <Link href={projectHref(next.slug)} className="group mt-2 inline-flex min-h-11 items-center gap-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-text [font-stretch:90%] hover:text-amber">
              {next.title}
              <Chevron className="translate-y-px transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>
      </article>
    </main>
  );
}
