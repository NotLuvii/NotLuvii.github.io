import type { CodeExcerpt } from "@/content/projects";
import { cn } from "@/lib/cn";
import { bracket } from "@/lib/ink";
import { Ink } from "@/components/ink/Ink";
import { ExternalIcon } from "./links";

/**
 * A verbatim excerpt from a repository, with the file it came from and a link to it. It's an
 * interface fragment (data-code, data-ui): the only place the site uses monospace type or
 * outlines. `teaser`, for a home-page tile that cuts it off like a picture: it doesn't scroll and
 * isn't a stop for Tab (the whole excerpt is on the case study), and its caption is read out, not
 * shown. `scan` carries the scan overlay, run by a surrounding ScanOnView. `mark` brackets the
 * excerpt's `mark` lines in ink, in the left margin of the code.
 */
export function CodeBlock({ excerpt, teaser = false, scan = false, mark = false }: { excerpt: CodeExcerpt; teaser?: boolean; scan?: boolean; mark?: boolean }) {
  // 13px type at 1.65 line height, under 16px of padding.
  const line = 13 * 1.65;
  const lines = excerpt.mark && mark ? excerpt.mark : null;
  const height = lines ? (lines.to - lines.from + 1) * line : 0;
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
            {...(teaser ? {} : { tabIndex: 0, role: "region", "aria-label": `Code from ${excerpt.file}` })}
            className={cn("p-4 text-[13px] leading-[1.65] text-text-2 focus-visible:outline-offset-[-2px]", teaser ? "overflow-hidden" : "overflow-auto")}
          >
            <code>{excerpt.code}</code>
          </pre>
          {lines && (
            <Ink
              paths={bracket(Math.round(height), 8)}
              w={12}
              h={Math.round(height)}
              // Drawn at rest: inside the code's clipped box, a scroll timeline would never finish.
              draw="none"
              className="absolute"
              style={{ left: 3, top: 16 + (lines.from - 1) * line, width: 10, height }}
            />
          )}
          {scan && (
            <>
              <div aria-hidden className="scan-cover" />
              <div aria-hidden className="scan-beam" />
            </>
          )}
        </div>
      </div>
      <figcaption className={teaser ? "sr-only" : "type-small mt-3 text-text-3"}>{excerpt.caption}</figcaption>
    </figure>
  );
}
