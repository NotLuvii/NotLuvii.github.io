import Link from "next/link";
import type { ReactNode } from "react";
import { featured, projectHref, type FeaturedProject } from "@/content/projects";
import { ButtonLink, Chevron, TextLink } from "@/components/ui/links";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Screenshot } from "@/components/ui/Screenshot";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-hairline py-10 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <h2 id={id} className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      {/* Text keeps a readable measure; screenshots may use the column's full width. */}
      <div className="mt-3 min-w-0 space-y-4 text-[17px] leading-[1.6] text-ink/85 md:mt-0 [&>*:not(.figures)]:max-w-[68ch]">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-[0.75em] size-1 shrink-0 rounded-full bg-ash" />
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
        <header className="bg-white">
          <div className="mx-auto max-w-[1080px] px-gutter pb-12 pt-6 md:pb-16">
            <Link href="/#projects" className="type-small inline-flex min-h-11 items-center gap-2 text-link underline-offset-[3px] hover:underline">
              <Chevron left className="translate-y-px" />
              All projects
            </Link>
            <div className="mt-4">
              <div>
                <p className="type-label text-ash">
                  {p.kind} · {p.year} · {p.team}
                </p>
                <h1 className="type-display mt-2 text-ink">{p.title}</h1>
                <p className="mt-4 max-w-[46ch] text-[clamp(1.1875rem,1.9vw,1.375rem)] leading-[1.4] tracking-[-0.018em] text-ink">{p.summary}</p>
                <dl className="type-small mt-8 grid max-w-[60ch] gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-ink">Role</dt>
                    <dd className="text-ash">{c.role}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Stack</dt>
                    <dd className="text-ash">{p.stack.join(", ")}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold text-ink">Availability</dt>
                    <dd className="text-ash">{p.availability}</dd>
                  </div>
                </dl>
                <div className="mt-8">
                  <ButtonLink href={p.repo.href} external>
                    {p.repo.label}
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1080px] px-gutter pb-8">
          <Section id="context" title="Context">
            {c.context.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </Section>

          <Section id="built" title="What I built">
            <Bullets items={c.built} />
          </Section>

          <Section id="decision" title="Key decision">
            <h3 className="text-[17px] font-semibold text-ink">{c.decision.title}</h3>
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
              <div className="figures space-y-4 pt-4">
                {c.figuresNote && <p className="type-small text-ash">{c.figuresNote}</p>}
                <div className={c.figures.length > 1 ? "grid items-start gap-8 sm:grid-cols-2" : "max-w-[560px]"}>
                  {c.figures.map((f) => (
                    <Screenshot key={f.src} shot={f} sizes="(min-width: 1080px) 370px, (min-width: 640px) 45vw, 100vw" />
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section id="limitations" title="Limitations">
            <Bullets items={c.limitations} />
          </Section>

          <Section id="code" title="Inspect the code">
            <ul className="space-y-0">
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

        <nav aria-label="Next project" className="bg-mist">
          <div className="mx-auto max-w-[1080px] px-gutter py-10">
            <p className="type-label text-ash">Next project</p>
            <Link href={projectHref(next.slug)} className="group mt-1 inline-flex min-h-11 items-center gap-2 text-[22px] font-semibold tracking-[-0.022em] text-ink hover:text-link">
              {next.title}
              <Chevron className="translate-y-px transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </article>
    </main>
  );
}
