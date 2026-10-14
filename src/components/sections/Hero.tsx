import { site } from "@/content/site";
import { heroCode } from "@/content/heroCode";
import { ButtonLink, TextLink } from "@/components/ui/links";
import { Scanner } from "@/components/motion/Scanner";

/**
 * The opening screen: your name and headline in the lower left, real code from the scam detection
 * tool on the right with an amber scan line moving down it. Held briefly while you start scrolling
 * (CSS: .hero-pin, .hero-stage), as the text lifts away and the code drifts up.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" data-scene="pin" className="hero-pin relative">
      <div className="hero-stage">
        <div className="hero-code absolute inset-0 md:left-[50%]">
          <Scanner className="opacity-50 md:opacity-100" />
          {/* On phones the code sits behind the text: darken its lower part so the words stay clear. */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-page via-page/85 to-transparent md:hidden" />
          <a
            href={heroCode.href}
            target="_blank"
            rel="noopener noreferrer"
            className="type-label absolute bottom-6 right-gutter hidden min-h-11 items-center bg-page px-2 text-text-3 underline-offset-4 hover:text-amber hover:underline md:inline-flex"
          >
            {heroCode.file}, lines {heroCode.lines} · {heroCode.repo}
            <span className="sr-only">: the code shown in the background</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <div className="hero-copy relative z-10 mx-auto flex h-full max-w-[1200px] flex-col justify-end px-gutter pb-14 md:pb-20">
          <div className="max-w-[640px]">
            <h1 id="hero-title" className="text-[20px] font-semibold text-text">
              {site.name}
            </h1>
            <p className="type-display mt-3 max-w-[16ch] text-text">{site.headline}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
              <ButtonLink href="#projects">View projects</ButtonLink>
              {site.resume && (
                <TextLink href={site.resume} download className="underline decoration-white/40">
                  Download resume (PDF)
                </TextLink>
              )}
            </div>
            <p className="type-label mt-8 text-text-3">
              {site.location.city}, {site.location.region}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
