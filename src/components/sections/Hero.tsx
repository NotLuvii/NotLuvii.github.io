import { site } from "@/content/site";
import { ChevronLink, pill } from "@/components/ui/links";
import { Reveal } from "@/components/ui/Reveal";
import { Stage } from "@/components/visuals/Stage";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="overflow-hidden bg-white pt-14 md:pt-20">
      <div className="mx-auto max-w-[1180px] px-gutter text-center">
        <h1 id="hero-title" className="type-eyebrow text-ink">
          {site.name}
        </h1>
        <p className="type-hero mx-auto mt-3 max-w-[14ch] text-ink">{site.headline}</p>
        <p className="type-intro mx-auto mt-6 max-w-[38ch] text-ash">{site.intro}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <a href="#projects" className={pill("solid")}>
            See the work
          </a>
          {site.resume ? (
            <ChevronLink href={site.resume} download className="text-[17px]">
              Download résumé
            </ChevronLink>
          ) : (
            <ChevronLink href="#contact" className="text-[17px]">
              Get in touch
            </ChevronLink>
          )}
        </div>
      </div>

      <Reveal className="mx-auto mt-14 max-w-[1180px] px-gutter md:mt-20" delay={0.1}>
        <Stage
          visual="hero"
          className="mx-auto max-w-[1100px] overflow-hidden rounded-[22px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45),0_18px_36px_-18px_rgb(0_0_0/0.3)]"
        />
      </Reveal>
      <div className="h-16 md:h-24" />
    </section>
  );
}
