import { site } from "@/content/site";
import { featured, heroShot, projectHref } from "@/content/projects";
import { ButtonLink, TextLink } from "@/components/ui/links";

/**
 * The opening screen, laid out like a product page: name, headline and the two main actions,
 * centred, then the lead project itself: a real screenshot of the scam detection tool's result,
 * framed and large, on the first screen.
 *
 * Motion (all CSS, in globals.css under "Opening"): on load the frame rises into place and an amber
 * scan line passes down the screenshot once, lighting it as it goes (.hero-arrive, .scan-cover,
 * .scan-beam). As you scroll, the frame turns from tilted back to facing you and the words lift
 * away (.hero-frame, .hero-copy, on scroll timelines). Nothing is held in place. With reduced
 * motion, or in a browser without scroll timelines, the frame simply sits flat and uncovered.
 */
export function Hero() {
  const lead = featured[0];
  const src = (suffix: string) => `${heroShot.src}${suffix}.webp`;
  return (
    <section aria-labelledby="hero-title" className="hero pb-4">
      <div className="hero-copy mx-auto max-w-[1200px] px-gutter pt-[clamp(2rem,6svh,4rem)] text-center">
        <h1 id="hero-title" className="text-[clamp(1.25rem,1.7vw,1.625rem)] font-semibold text-text">
          {site.name}
        </h1>
        <p className="type-hero mx-auto mt-3 max-w-[19ch] text-text">{site.headline}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-x-8 gap-y-2 sm:flex-row">
          <ButtonLink href="#projects">View projects</ButtonLink>
          {site.resume && (
            <TextLink href={site.resume} download className="underline decoration-white/40">
              Download resume (PDF)
            </TextLink>
          )}
        </div>
      </div>

      <figure className="hero-stage mx-auto mt-[clamp(1.5rem,4svh,3.5rem)]">
        <div className="hero-arrive">
          <div className="hero-frame rounded-xl border border-line bg-panel p-2 md:p-2.5">
            <div className="relative overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export: pre-sized WebP files, no image optimizer */}
              <img
                src={src("@2x")}
                srcSet={`${src("")} ${heroShot.width}w, ${src("@2x")} ${heroShot.width * 2}w, ${src("@3x")} ${heroShot.width * 3}w`}
                sizes="(min-width: 940px) 840px, calc(100vw - 52px)"
                width={heroShot.width}
                height={heroShot.height}
                alt={heroShot.alt}
                fetchPriority="high"
                className="block h-auto w-full"
              />
              <div aria-hidden className="scan-cover" />
              <div aria-hidden className="scan-beam" />
            </div>
          </div>
        </div>
        <figcaption className="type-caption mx-auto mt-4 max-w-[62ch] px-gutter text-center text-text-3">
          {heroShot.caption}{" "}
          <TextLink href={projectHref(lead.slug)} className="inline-flex">
            Read the case study<span className="sr-only">: {lead.title}</span>
          </TextLink>
        </figcaption>
      </figure>
    </section>
  );
}
