import { alsoUsed, background, education, skills } from "@/content/experience";
import { site } from "@/content/site";
import { emphasize } from "@/lib/emphasize";

/**
 * About and skills, as tiles: the intro, wide and centred (grey, its key phrases in white, so it
 * can be read at a glance), with the background line under it; then education beside the skills,
 * each skill group tied to where it was used.
 */
export function About() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="pt-24 md:pt-32">
      <div className="mx-auto max-w-[1200px] px-gutter pb-8 md:pb-10">
        <h2 id="skills-title" className="type-section text-text">
          About and skills
        </h2>
      </div>

      <div className="tile-grid">
        <div className="tile tile-wide px-gutter py-14 text-center md:py-20">
          <p className="type-statement mx-auto max-w-[48ch] text-text-3">
            {emphasize(site.intro, site.introKeyPhrases).map((part, i) =>
              part.strong ? (
                <strong key={i} className="font-[inherit] text-text">
                  {part.text}
                </strong>
              ) : (
                part.text
              ),
            )}
          </p>
          {background.map((p) => (
            <p key={p} className="mx-auto mt-8 max-w-[62ch] text-[17px] leading-relaxed text-text-2">
              {p}
            </p>
          ))}
        </div>

        <div className="tile p-6 md:p-12">
          <h3 className="type-lede text-text">Education</h3>
          <p className="mt-4 text-[17px] font-semibold text-text">{education.degree}</p>
          <p className="text-[17px] text-text-2">
            {education.school}, {education.date}
          </p>
          <p className="type-small mt-3 text-text-3">Coursework: {education.coursework.join(", ")}.</p>
        </div>

        <div className="tile p-6 md:p-12">
          <h3 className="type-lede text-text">Skills</h3>
          <dl className="mt-4 space-y-7">
            {skills.map((s) => (
              <div key={s.group}>
                <dt className="text-[17px] font-semibold text-text">{s.group}</dt>
                <dd>
                  <p className="text-[17px] leading-relaxed text-text-2">{s.items.join(", ")}</p>
                  <p className="type-small mt-1 text-text-3">Used in: {s.usedIn}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="type-small mt-8 text-text-3">Also: {alsoUsed.join(", ")}.</p>
        </div>
      </div>
    </section>
  );
}
