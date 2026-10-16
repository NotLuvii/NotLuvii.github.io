import { heroLine, site } from "@/content/site";
import { ButtonLink, pairedPill } from "@/components/ui/links";
import { WhatIDoSketch } from "@/components/ink/Sketch";

/**
 * The first screen: who I am and what I do, and no project. The name, set very large; the
 * headline; where I am and what I'm looking for; the two main actions; and beside them (below
 * them on a phone) a hand-drawn sketch of what I do, in the intro's own words.
 *
 * Motion (CSS, globals.css "First screen" and "Opening"): the sketch draws itself on arrival, and
 * as you scroll the words lift away. With reduced motion, everything is simply there.
 */
export function Hero() {
  return (
    <section id="intro" aria-labelledby="hero-title" className="hero">
      <div className="hero-grid mx-auto w-full max-w-[1200px] px-gutter">
        <div className="hero-copy">
          <h1 id="hero-title" className="type-name text-text">
            <span className="block">{site.name.split(" ")[0]}</span> <span className="block">{site.name.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="type-statement mt-6 max-w-[21em] text-text">{site.headline}</p>
          <p className="type-lede mt-4 max-w-[30em] font-normal text-text-3">{heroLine()}</p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
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
        <WhatIDoSketch />
      </div>
    </section>
  );
}
