import { alsoUsed, background, education, skills } from "@/content/experience";
import { Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="bg-mist py-16 md:py-24">
      <div className="mx-auto max-w-[1080px] px-gutter">
        <h2 id="skills-title" className="type-section text-ink">
          Skills and background
        </h2>

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
          <Reveal>
            {background.map((p) => (
              <p key={p} className="mb-4 text-[17px] text-ink/85">
                {p}
              </p>
            ))}
            <h3 className="type-label mt-8 text-ash">Education</h3>
            <p className="mt-2 text-[17px] font-semibold text-ink">{education.degree}</p>
            <p className="type-small text-ash">
              {education.school}, {education.date}
            </p>
            <p className="type-small mt-2 text-ash">Coursework: {education.coursework.join(", ")}.</p>
          </Reveal>

          <Reveal>
            <dl className="divide-y divide-line border-y border-line">
              {skills.map((s) => (
                <div key={s.group} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)]">
                  <dt className="text-[15px] font-semibold text-ink">{s.group}</dt>
                  <dd>
                    <p className="text-[15px] text-ink">{s.items.join(", ")}</p>
                    <p className="type-caption mt-0.5 text-ash">Used in: {s.usedIn}</p>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="type-small mt-4 text-ash">Also: {alsoUsed.join(", ")}.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
