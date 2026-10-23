import { site } from "@/content/site";
import { ButtonLink, pairedPill } from "@/components/ui/links";
import { LiveClock } from "./LiveClock";
import { MotionToggle } from "@/components/motion/MotionToggle";
import { Crop } from "@/components/ui/Crop";
import { crops } from "@/content/projects";

/**
 * The first screen, in order of importance: the name, set large in the display face (the page's one
 * oversized moment); what I do, the headline and the intro, with the two main actions; and the
 * work itself, beside them from 1024px (under them below that): a real crop of the scam detection
 * tool's result, which opens the whole capture, with a link down to its chapter. Where I am and
 * the time there, and the motion control, sit above in small type.
 */
export function Hero() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section id="intro" aria-labelledby="hero-title" className="hero">
      <div className="hero-wrap mx-auto w-full max-w-[1200px] px-gutter">
        <div className="hero-status">
          <div className="hero-meta">
            <LiveClock city={`${site.location.city}, ${site.location.regionShort}`} />
            <MotionToggle />
          </div>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title" className="type-display hero-name text-text">
              <span className="block">{first}</span> <span className="block">{rest.join(" ")}</span>
            </h1>
            <p className="type-statement mt-f21 max-w-[18em] text-text">{site.headline}</p>
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
          <figure className="hero-visual">
            <Crop crop={crops.scamResult} sizes="(min-width: 1024px) 552px, 90vw" priority />
            <figcaption className="type-small mt-f13 max-w-[46ch] text-text-3">
              The scam detection tool on the README’s sample phishing email: 100%, High risk, and the five warning signs behind it.{" "}
              <a href="#scam-detection" className="text-text-2 underline underline-offset-4 hover:text-text">
                See how it works
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
