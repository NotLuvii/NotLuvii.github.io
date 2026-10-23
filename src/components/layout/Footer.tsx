import { site } from "@/content/site";

/**
 * The close, quiet: who and where, and the way back up, in the column. The name is set large once,
 * on the first screen.
 */
export function Footer() {
  return (
    <footer className="bg-page pb-f34 pt-f89">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <div className="footer-meta flex flex-col gap-f8 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-small text-text-3">
            {site.name}, {site.role.toLowerCase()} in {site.location.city}, {site.location.region}
          </p>
          <a href="#top" className="type-small inline-flex min-h-11 items-center text-text-2 underline-offset-4 hover:underline">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
