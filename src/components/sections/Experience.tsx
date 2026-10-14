import { education, roles } from "@/content/experience";
import { Reveal } from "@/components/ui/Reveal";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="bg-mist py-24 md:py-32">
      <Reveal className="mx-auto max-w-[1180px] px-gutter">
        <h2 id="experience-title" className="type-headline text-ink">
          Experience.
        </h2>
      </Reveal>
      <ol className="mx-auto mt-12 grid max-w-[1180px] gap-5 px-gutter md:grid-cols-2">
        {roles.map((r, i) => (
          <Reveal as="li" key={r.organization} delay={(i % 2) * 0.08} className="flex flex-col rounded-[28px] bg-white p-8 md:p-10">
            <p className="type-small font-semibold text-ash">
              {r.period}, {r.place}
            </p>
            <h3 className="type-card mt-3 text-ink">{r.organization}</h3>
            <p className="mt-1 text-[17px] text-ink">{r.title}</p>
            <ul className="mt-6 space-y-3 text-[17px] leading-[1.47] text-ash">
              {r.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden className="mt-[0.62em] size-1.5 shrink-0 rounded-full bg-ash/60" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
        <Reveal as="li" delay={0.08} className="flex flex-col rounded-[28px] bg-white p-8 md:p-10">
          <p className="type-small font-semibold text-ash">{education.date}</p>
          <h3 className="type-card mt-3 text-ink">{education.school}</h3>
          <p className="mt-1 text-[17px] text-ink">{education.degree}</p>
          <p className="mt-6 text-[17px] leading-[1.47] text-ash">
            Coursework in {education.coursework.join(", ").toLowerCase()}.
          </p>
        </Reveal>
      </ol>
    </section>
  );
}
