import { footnotes } from "@/content/numbers";
import { site } from "@/content/site";

/** Apple's footer: numbered footnotes first, then the fine print. */
export function Footer() {
  const links = [
    { label: "LinkedIn", href: site.linkedin.url, external: true },
    { label: "GitHub", href: site.github.url, external: true },
    ...(site.resume ? [{ label: "Résumé", href: site.resume, download: true }] : []),
  ];
  return (
    <footer className="bg-mist text-ash">
      <div className="type-fine mx-auto max-w-[1180px] px-gutter pb-10 pt-4">
        <ol className="space-y-2 border-b border-line pb-4 pt-4">
          {footnotes.map((f, i) => (
            <li key={f} id={`footnote-${i + 1}`} className="flex gap-1.5 scroll-mt-24">
              <span>{i + 1}.</span>
              <span>{f}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} {site.name}. {site.location.city}, {site.location.region}, {site.location.country}.{" "}
            <span className="select-all text-ink/80">{site.email}</span>
          </p>
          <ul className="flex flex-wrap gap-x-0 gap-y-1">
            {links.map((l, i) => (
              <li key={l.label} className="flex items-center">
                {i > 0 && <span aria-hidden className="mx-2.5 h-3 w-px bg-line" />}
                <a
                  href={l.href}
                  className="text-ink/80 hover:underline"
                  {...("external" in l && l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  {...("download" in l && l.download ? { download: true } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
