import type { CodeExcerpt } from "@/content/projects";
import { ExternalIcon } from "./links";

/** A verbatim excerpt from a repository, with the file it came from and a link to it. */
export function CodeBlock({ excerpt }: { excerpt: CodeExcerpt }) {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line px-4 py-1">
          <span className="type-label text-text-3">{excerpt.file}</span>
          <a
            href={excerpt.href}
            target="_blank"
            rel="noopener noreferrer"
            className="type-label inline-flex min-h-11 items-center gap-1.5 text-text-2 underline-offset-4 hover:text-amber hover:underline"
          >
            View on GitHub
            <ExternalIcon />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <pre
          tabIndex={0}
          role="region"
          aria-label={`Code from ${excerpt.file}`}
          className="overflow-x-auto p-4 text-[13px] leading-[1.65] text-text-2 focus-visible:outline-offset-[-2px]"
        >
          <code>{excerpt.code}</code>
        </pre>
      </div>
      <figcaption className="type-caption mt-3 text-text-3">{excerpt.caption}</figcaption>
    </figure>
  );
}
