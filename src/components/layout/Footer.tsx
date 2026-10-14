import { site } from "@/content/site";

/** A plain close: the name once more, where I am, and the way back up. */
export function Footer() {
  return (
    <footer className="bg-page">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-gutter py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-title text-text">{site.name}</p>
          <p className="type-small mt-1 text-text-3">
            {site.role} in {site.location.city}, {site.location.region}
          </p>
        </div>
        <a href="#top" className="type-small inline-flex min-h-11 items-center text-text-2 underline-offset-4 hover:underline">
          Back to top
        </a>
      </div>
    </footer>
  );
}
