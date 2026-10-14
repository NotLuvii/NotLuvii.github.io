import Link from "next/link";
import { site } from "@/content/site";
import { featured, heroShot, projectHref } from "@/content/projects";
import { ButtonLink } from "@/components/ui/links";
import { Screenshot } from "@/components/ui/Screenshot";

const lead = featured[0];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-white">
      <div className="mx-auto grid max-w-[1080px] items-center gap-10 px-gutter pb-14 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-12 md:pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
        <div>
          <h1 id="hero-title" className="type-display text-ink">
            {site.name}
          </h1>
          <p className="type-lede mt-4 max-w-[24ch] text-ink">{site.headline}</p>
          <p className="mt-5 max-w-[50ch] text-[17px] text-ash">{site.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#projects">View projects</ButtonLink>
            {site.resume && (
              <ButtonLink href={site.resume} download variant="secondary">
                Download résumé <span className="text-ash">(PDF)</span>
              </ButtonLink>
            )}
          </div>
          <p className="type-small mt-6 text-ash">
            {site.location.city}, {site.location.region}
          </p>
        </div>

        <div className="mx-auto w-full max-w-[400px] md:max-w-none">
          <Screenshot shot={heroShot} priority sizes="(min-width: 1024px) 440px, (min-width: 768px) 400px, 100vw" />
          <Link href={projectHref(lead.slug)} className="type-caption mt-1 inline-flex min-h-11 items-center gap-1.5 text-link underline-offset-[3px] hover:underline">
            {lead.title} case study
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
