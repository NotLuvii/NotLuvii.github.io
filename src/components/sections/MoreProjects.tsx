import { more, type MoreProject } from "@/content/projects";
import { FocusRow } from "@/components/motion/FocusRow";
import { site } from "@/content/site";
import { Figures } from "@/components/ui/Figures";
import { TextLink } from "@/components/ui/links";

function MoreTile({ p }: { p: MoreProject }) {
  const meta = [p.kind, p.year].filter(Boolean).join(", ");
  return (
    <li className="tile flex flex-col p-7 md:p-8">
      <h4 className="type-title text-text">{p.title}</h4>
      {meta && <p className="type-small mt-1 text-text-3">{meta}</p>}
      <p className="mt-4 flex-1 text-[17px] leading-relaxed text-text-2">
        <Figures text={p.summary} />
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6">
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

/**
 * The other projects as small tiles: four across on a wide screen, two on a tablet, and on a
 * phone a row that scrolls sideways and snaps to each tile, so the page stays short
 * (CSS: .more-row). The last tile points to everything else on GitHub.
 */
export function MoreProjects() {
  return (
    <div>
      <h3 id="more-title" className="sr-only">
        More projects
      </h3>
      <FocusRow aria-labelledby="more-title" className="more-row">
        {more.map((p) => (
          <MoreTile key={p.title} p={p} />
        ))}
        <li className="tile grid place-items-center p-7 text-center md:p-8">
          <TextLink href={site.github.url} external>
            Everything else on GitHub
          </TextLink>
        </li>
      </FocusRow>
    </div>
  );
}
