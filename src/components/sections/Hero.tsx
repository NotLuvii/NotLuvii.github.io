import Link from "next/link";
import { site } from "@/content/site";
import { featured, heroRecording, projectHref } from "@/content/projects";
import { HeroRecording } from "@/components/motion/HeroRecording";
import { ButtonLink, Chevron, pairedPill } from "@/components/ui/links";

/**
 * The opening screen, laid out as a tile on apple.com: name, headline and two pill buttons,
 * centred, with a line of small print under them saying what the picture is. Then the lead
 * project itself, large: a recording of the scam detection tool at work (HeroRecording), in a
 * frame that runs into the bottom edge of the screen's first tile. Phones get the tool's own phone
 * layout, so its text stays readable.
 *
 * Motion (all CSS, in globals.css under "Opening"): on load the frame rises into place and an amber
 * scan line passes down it once, lighting it as it goes (.hero-arrive, .scan-cover, .scan-beam).
 * As you scroll, the frame turns from tilted back to facing you and the words lift away
 * (.hero-frame, .hero-copy, on scroll timelines). With reduced motion, or in a browser without
 * scroll timelines, the frame simply sits flat and uncovered.
 */
export function Hero() {
  const lead = featured[0];
  return (
    <section aria-labelledby="hero-title" className="hero overflow-clip">
      <div className="hero-copy mx-auto max-w-[1200px] px-gutter pt-[clamp(2rem,6svh,4rem)] text-center">
        <h1 id="hero-title" className="type-title text-text">
          {site.name}
        </h1>
        {/* 17em: wide enough for two lines on a desktop screen. */}
        <p className="type-hero mx-auto mt-3 max-w-[17em] text-text">{site.headline}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
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

      <figure className="hero-stage mx-auto mt-4">
        <figcaption className="type-small mx-auto max-w-[62ch] text-center text-text-3">
          {heroRecording.caption}{" "}
          {/* Inline, so the two lines of small print keep their spacing; links in running text are exempt from the 44px target. */}
          <Link href={projectHref(lead.slug)} className="whitespace-nowrap text-text underline decoration-text-3 underline-offset-4 hover:decoration-text">
            Read the case study<span className="sr-only">: {lead.title}</span>
            <Chevron className="ml-1 translate-y-px" />
          </Link>
        </figcaption>
        <div className="hero-arrive mt-[clamp(0.5rem,2svh,1.5rem)]">
          <div className="hero-frame rounded-t-xl bg-raised p-2 pb-0 md:p-2.5 md:pb-0">
            <HeroRecording recording={heroRecording} />
          </div>
        </div>
      </figure>
    </section>
  );
}
