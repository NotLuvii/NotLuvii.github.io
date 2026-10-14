import type { CodeExcerpt } from "@/content/projects";
import { cn } from "@/lib/cn";
import { ExternalIcon } from "./links";

/**
 * A verbatim excerpt from a repository, with the file it came from and a link to it. It's an
 * interface fragment (data-code, data-ui): the only place the site uses monospace type or
 * outlines. `compact` caps its height (the rest scrolls), for the home page; `scan` carries the
 * scan overlay, run by a surrounding ScanOnView.
 */
export function CodeBlock({ excerpt, compact = false, scan = false }: { excerpt: CodeExcerpt; compact?: boolean; scan?: boolean }) {
  return (
    <figure className="min-w-0" data-code data-ui>
      <div className="overflow-hidden rounded-lg border border-line bg-raised">
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line px-4 py-1">
          <code className="min-w-0 text-[13px] text-text-3 [overflow-wrap:anywhere]">{excerpt.file}</code>
          <a
            href={excerpt.href}
            target="_blank"
            rel="noopener noreferrer"
            className="type-small inline-flex min-h-11 items-center gap-1.5 text-text-2 underline-offset-4 hover:underline"
          >
            View on GitHub
            <ExternalIcon />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="relative">
          <pre
            tabIndex={0}
            role="region"
            aria-label={`Code from ${excerpt.file}`}
            className={cn("overflow-auto p-4 text-[13px] leading-[1.65] text-text-2 focus-visible:outline-offset-[-2px]", compact && "max-h-[22rem]")}
          >
            <code>{excerpt.code}</code>
          </pre>
          {scan && (
            <>
              <div aria-hidden className="scan-cover" />
              <div aria-hidden className="scan-beam" />
            </>
          )}
        </div>
      </div>
      <figcaption className="type-small mt-3 text-text-3">{excerpt.caption}</figcaption>
    </figure>
  );
}
