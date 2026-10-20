import type { CodeExcerpt } from "@/content/projects";
import { cn } from "@/lib/cn";
import { ExternalIcon } from "./links";

/**
 * A verbatim excerpt from a repository, with the file it came from and a link to it. It's an
 * interface fragment (data-code, data-ui): the only place the site uses monospace type or
 * outlines. `teaser`, for a home-page card that cuts it off like a picture: it doesn't scroll and
 * isn't a stop for Tab (the whole excerpt is on the case study), and its caption is read out, not
 * shown.
 */
export function CodeBlock({ excerpt, teaser = false }: { excerpt: CodeExcerpt; teaser?: boolean }) {
  return (
    <figure className="min-w-0" data-code data-ui>
      <div className="overflow-hidden rounded-lg border border-line bg-raised">
        <div className="flex flex-wrap items-center justify-between gap-x-f13 border-b border-line px-f13 py-f5">
          <code className="min-w-0 text-[13.36px] text-text-3 [overflow-wrap:anywhere]">{excerpt.file}</code>
          <a
            href={excerpt.href}
            target="_blank"
            rel="noopener noreferrer"
            className="type-small inline-flex min-h-11 items-center gap-f5 text-text-2 underline-offset-4 hover:underline"
          >
            View on GitHub
            <ExternalIcon />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="relative">
          <pre
            {...(teaser ? {} : { tabIndex: 0, role: "region", "aria-label": `Code from ${excerpt.file}` })}
            className={cn("p-f13 text-[13.36px] leading-[1.618] text-text-2 focus-visible:outline-offset-[-2px]", teaser ? "overflow-hidden" : "overflow-auto")}
          >
            <code>{excerpt.code}</code>
          </pre>
        </div>
      </div>
      <figcaption className={teaser ? "sr-only" : "type-small mt-f13 text-text-3"}>{excerpt.caption}</figcaption>
    </figure>
  );
}
