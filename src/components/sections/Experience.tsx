import { roles } from "@/content/experience";
import { Reveal } from "@/components/ui/Reveal";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1080px] px-gutter">
        <h2 id="experience-title" className="type-section text-ink">
          Experience
        </h2>
        <ol className="mt-8 divide-y divide-hairline border-y border-hairline">
          {roles.map((r) => (
            <Reveal as="li" key={r.organization} className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="type-small text-ash">
                <p>{r.period}</p>
                <p>{r.place}</p>
              </div>
              <div>
                <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
                  {r.title}, {r.organization}
                </h3>
                {r.about && <p className="type-small mt-0.5 text-ash">{r.about}</p>}
                <ul className="mt-4 max-w-[68ch] space-y-2.5 text-[16px] leading-[1.55] text-ink/85">
                  {r.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-ash" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
