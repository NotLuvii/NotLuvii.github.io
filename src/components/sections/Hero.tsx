import { heroLine, site } from "@/content/site";
import { ButtonLink, pairedPill } from "@/components/ui/links";

/**
 * The first screen: who I am and what I do, and nothing else. Name, headline, where I am and what
 * I'm looking for, and the two main actions, centred in a screen of their own.
 *
 * Motion (CSS, in globals.css under "Opening"): as you scroll, the words lift away on a scroll
 * timeline (.hero-copy). With reduced motion, or in a browser without scroll timelines, they stay.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero flex min-h-[calc(100svh-56px)] flex-col justify-center px-gutter py-16">
      <div className="hero-copy mx-auto w-full max-w-[1200px] text-center">
        <h1 id="hero-title" className="type-title text-text">
          {site.name}
        </h1>
        {/* 17em: wide enough for two lines on a desktop screen. */}
        <p className="type-hero mx-auto mt-3 max-w-[17em] text-text">{site.headline}</p>
        <p className="type-lede mx-auto mt-6 max-w-[34em] text-text-3">{heroLine()}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <ButtonLink href="#projects" className={pairedPill}>
            See the projects
          </ButtonLink>
          {site.resume && (
            <ButtonLink href={site.resume} download variant="outline" className={pairedPill}>
              Download resume
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
