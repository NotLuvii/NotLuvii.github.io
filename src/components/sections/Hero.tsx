import { site } from "@/content/site";
import { ButtonLink, pairedPill } from "@/components/ui/links";
import { DataCheck } from "./DataCheck";
import { LiveClock } from "./LiveClock";

/**
 * The first screen: who I am and what I do, and no project. A status line (what I'm looking for,
 * and where I am with the time there); the name, set huge in the display face; the headline and
 * the intro; the two main actions; and beside them (under them below 1024px) the data check, a
 * scan line checking rows of data.
 *
 * Motion (CSS, globals.css "First screen"): the scan line runs and, as you scroll, the words lift
 * away. With reduced motion, everything is simply there.
 */
export function Hero() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section id="intro" aria-labelledby="hero-title" className="hero">
      <div className="hero-wrap mx-auto w-full max-w-[1440px] px-gutter">
        <div className="hero-status">
          {site.availability && (
            <p className="now-pill type-small">
              <span data-signal="" className="now-dot" aria-hidden />
              Now: {site.availability}
            </p>
          )}
          <LiveClock city={`${site.location.city}, ${site.location.regionShort}`} />
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title" className="type-display hero-name text-text">
              <span className="block">{first}</span> <span className="block">{rest.join(" ")}</span>
            </h1>
            <p className="type-statement mt-f21 max-w-[21em] text-text">{site.headline}</p>
            <p className="type-lede mt-f13 max-w-[26em] font-normal text-text-3">{site.intro}</p>
            <div className="mt-f34 flex flex-col items-start gap-f13 sm:flex-row sm:gap-f13">
              <ButtonLink href="#projects" className={pairedPill}>
                See the work
              </ButtonLink>
              {site.resume && (
                <ButtonLink href={site.resume} download variant="outline" className={pairedPill}>
                  Download resume
                </ButtonLink>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <DataCheck />
          </div>
        </div>
      </div>
    </section>
  );
}
