import { alsoUsed, background, education, skills } from "@/content/experience";

/** Background and education beside a plain specification list of skills, separated by space alone. */
export function About() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="skills-title" className="type-section text-text-3">
          Skills and background
        </h2>

        <div className="mt-14 grid gap-16 md:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            {background.map((p) => (
              <p key={p} className="type-lede text-text-2">
                {p}
              </p>
            ))}
            <h3 className="type-lede mt-12 text-text">Education</h3>
            <p className="mt-2 text-[17px] font-semibold text-text">{education.degree}</p>
            <p className="text-[17px] text-text-2">
              {education.school}, {education.date}
            </p>
            <p className="type-small mt-3 text-text-3">Coursework: {education.coursework.join(", ")}.</p>
          </div>

          <div>
            <dl className="space-y-9">
              {skills.map((s) => (
                <div key={s.group} className="grid gap-x-8 gap-y-1 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <dt className="type-lede text-text">{s.group}</dt>
                  <dd>
                    <p className="text-[17px] leading-relaxed text-text sm:pt-0.5">{s.items.join(", ")}</p>
                    <p className="type-small mt-1 text-text-3">Used in: {s.usedIn}</p>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="type-small mt-10 text-text-3">Also: {alsoUsed.join(", ")}.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
