import { roles } from "@/content/experience";
import { Figures, firstFigure } from "@/components/ui/Figures";

/**
 * Roles on a timeline: a 3px track that fills as you scroll through the section (CSS: .timeline-fill;
 * the scroll progress is written on the track alone, so nothing else is restyled while scrolling). A
 * bullet that contains a resume figure also shows that figure large, in white, beside it; the
 * sentence itself stays whole.
 */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="bg-panel py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="experience-title" className="type-section text-text-3">
          Experience
        </h2>

        <div className="relative mt-14 pl-7 md:mt-16 md:pl-12">
          <div aria-hidden data-scene="span" className="absolute inset-y-0 left-0 w-[3px] overflow-hidden rounded-full bg-raised">
            <div className="timeline-fill h-full w-full rounded-full bg-text-3" />
          </div>

          <ol className="space-y-20 md:space-y-24">
            {roles.map((r) => (
              <li key={r.organization} className="relative grid gap-x-12 gap-y-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <span aria-hidden className="absolute -left-8 top-[0.55em] size-[11px] rounded-full bg-text-2 md:-left-[52px]" />
                <div className="type-small text-text-3 md:pt-1.5">
                  <p>{r.period}</p>
                  <p>{r.place}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="type-title text-text">
                    {r.title}, {r.organization}
                  </h3>
                  {r.about && <p className="mt-1 text-[17px] text-text-3">{r.about}</p>}
                  <ul className="mt-8 space-y-6">
                    {r.points.map((point) => {
                      const figure = firstFigure(point);
                      return (
                        <li key={point} className="grid gap-x-6 sm:grid-cols-[104px_minmax(0,1fr)]">
                          <span aria-hidden data-figure className="type-stat hidden text-text sm:block">
                            {figure ?? ""}
                          </span>
                          <span className="max-w-[62ch] text-[17px] leading-[1.6] text-text-2 sm:pt-1.5">
                            <Figures text={point} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
