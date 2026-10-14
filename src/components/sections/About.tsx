import { alsoUsed, background, education, skills } from "@/content/experience";
import { Reveal } from "@/components/ui/Reveal";

/** Background and education beside a plain specification table of skills. */
export function About() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="border-t border-line py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="skills-title" className="type-section text-text">
          Skills and background
        </h2>

        <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            {background.map((p) => (
              <p key={p} className="type-lede text-text-2">
                {p}
              </p>
            ))}
            <h3 className="type-label mt-12 text-text-3">Education</h3>
            <p className="mt-3 text-[18px] font-semibold text-text">{education.degree}</p>
            <p className="type-small text-text-2">
              {education.school}, {education.date}
            </p>
            <p className="type-small mt-3 text-text-3">Coursework: {education.coursework.join(", ")}.</p>
          </Reveal>

          <Reveal>
            <dl className="border-t border-line">
              {skills.map((s) => (
                <div key={s.group} className="grid gap-x-8 gap-y-2 border-b border-line py-6 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-[17px] font-semibold text-text">{s.group}</dt>
                  <dd>
                    <p className="text-[17px] text-text">{s.items.join(", ")}</p>
                    <p className="type-label mt-2 text-text-3">Used in: {s.usedIn}</p>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="type-small mt-6 text-text-3">Also: {alsoUsed.join(", ")}.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
