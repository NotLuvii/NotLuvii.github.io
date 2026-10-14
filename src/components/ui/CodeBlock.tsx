import type { CodeExcerpt } from "@/content/projects";
import { ExternalIcon } from "./links";

/** A verbatim excerpt from a repository, with the file it came from and a link to it. */
export function CodeBlock({ excerpt }: { excerpt: CodeExcerpt }) {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-xl bg-code text-[#f5f5f7]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-white/10 px-4 py-2">
          <span className="type-caption font-mono text-[#c7c7cc]">{excerpt.file}</span>
          <a
            href={excerpt.href}
            target="_blank"
            rel="noopener noreferrer"
            className="type-caption inline-flex min-h-11 items-center gap-1.5 text-[#64b5ff] underline-offset-[3px] hover:underline"
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
          className="overflow-x-auto p-4 text-[13px] leading-[1.6] focus-visible:outline-offset-[-2px]"
        >
          <code>{excerpt.code}</code>
        </pre>
      </div>
      <figcaption className="type-caption mt-3 text-ash">{excerpt.caption}</figcaption>
    </figure>
  );
}
