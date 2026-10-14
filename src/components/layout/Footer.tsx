import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="type-small mx-auto flex max-w-[1080px] flex-col gap-1 px-gutter py-6 text-ash sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.name} · {site.location.city}, {site.location.region}
        </p>
        <a href="#top" className="inline-flex min-h-11 items-center text-link underline-offset-[3px] hover:underline">
          Back to top
        </a>
      </div>
    </footer>
  );
}
