import { site } from "@/content/site";

/**
 * The close: the name once more in the display face, filling the width of the screen on one line
 * (CSS: .footer-name); then the role and city, and the way back up.
 */
export function Footer() {
  return (
    <footer className="bg-page">
      <div className="footer-inner px-gutter pb-10 pt-20">
        <p aria-hidden className="type-display footer-name text-text">
          {site.name}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="type-small text-text-3">
            {site.role} in {site.location.city}, {site.location.region}
          </p>
          <a href="#top" className="type-small inline-flex min-h-11 items-center text-text-2 underline-offset-4 hover:underline">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
