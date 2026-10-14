import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-page">
      <div className="type-label mx-auto flex max-w-[1200px] flex-col gap-1 px-gutter py-6 text-text-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.name} · {site.location.city}, {site.location.region}
        </p>
        <a href="#top" className="inline-flex min-h-11 items-center text-text-2 underline-offset-4 hover:text-amber hover:underline">
          Back to top
        </a>
      </div>
    </footer>
  );
}
