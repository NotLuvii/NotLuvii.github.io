import { roles } from "@/content/experience";
import { Figures, firstFigure } from "@/components/ui/Figures";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Roles on a timeline whose line fills with amber as you scroll through the section (CSS:
 * .timeline-fill). A bullet that contains a resume figure also shows that figure large in the
 * margin beside it; the sentence itself stays whole.
 */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="border-t border-line py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="experience-title" className="type-section text-text">
          Experience
        </h2>

        <div data-scene="span" className="relative mt-16 pl-7 md:pl-12">
          <div aria-hidden className="absolute inset-y-0 left-0 w-px bg-line">
            <div className="timeline-fill h-full w-full bg-amber" />
          </div>

          <ol className="space-y-20 md:space-y-24">
            {roles.map((r) => (
              <Reveal as="li" key={r.organization} className="relative grid gap-x-12 gap-y-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <span aria-hidden className="absolute -left-7 top-[0.8em] h-px w-4 bg-amber md:-left-12 md:w-6" />
                <div className="type-label text-text-3">
                  <p>{r.period}</p>
                  <p>{r.place}</p>
                </div>
                <div>
                  <h3 className="text-[22px] font-semibold leading-snug text-text">
                    {r.title}, {r.organization}
                  </h3>
                  {r.about && <p className="type-small mt-1 text-text-3">{r.about}</p>}
                  <ul className="mt-7 space-y-5">
                    {r.points.map((point) => {
                      const figure = firstFigure(point);
                      return (
                        <li key={point} className="grid gap-x-6 sm:grid-cols-[96px_minmax(0,1fr)]">
                          <span aria-hidden className="hidden text-[40px] font-semibold leading-none text-amber [font-stretch:85%] sm:block">
                            {figure ?? ""}
                          </span>
                          <span className="max-w-[64ch] text-[16px] leading-[1.65] text-text-2">
                            <Figures text={point} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
