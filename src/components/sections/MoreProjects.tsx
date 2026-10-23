import { more, type MoreProject } from "@/content/projects";
import { site } from "@/content/site";
import { TextLink } from "@/components/ui/links";

function MoreItem({ p }: { p: MoreProject }) {
  const meta = [p.note, [p.kind, p.year].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
  return (
    <li>
      <h3 className="type-lede text-text">{p.title}</h3>
      <p className="mt-f8 text-[17px] leading-[1.618] break-words text-text-2">
        {p.summary}
      </p>
      {meta && <p className="type-small mt-f5 text-text-3">{meta}</p>}
      {p.links.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-f21">
          {p.links.map((l) => (
            <TextLink key={l.href} href={l.href} external>
              {l.label}
              <span className="sr-only">: {p.title}</span>
            </TextLink>
          ))}
        </div>
      )}
    </li>
  );
}

/**
 * The other projects, in a section of their own, as a compact plain list: name, one line (figures
 * as written, with no emphasis), what kind of project and when (and why there's no link, if there
 * isn't one), then its links; two columns from 834px and one below, with nothing boxed. The last
 * item points to everything else on GitHub.
 */
export function MoreProjects() {
  return (
    <section id="more" aria-labelledby="more-title" className="mx-auto max-w-[1200px] px-gutter pt-f89 md:pt-f144">
      <h2 id="more-title" className="type-display section-title text-text">
        More projects
      </h2>
      <ul aria-labelledby="more-title" className="mt-f34 grid grid-cols-1 gap-x-f55 gap-y-f34 min-[834px]:grid-cols-2">
        {more.map((p) => (
          <MoreItem key={p.title} p={p} />
        ))}
        <li className="flex items-center">
          <TextLink href={site.github.url} external>
            Everything else on GitHub
          </TextLink>
        </li>
      </ul>
    </section>
  );
}
