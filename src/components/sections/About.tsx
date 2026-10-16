import { alsoUsed, background, skills } from "@/content/experience";
import { site } from "@/content/site";
import { emphasize } from "@/lib/emphasize";

/**
 * About and skills, as tiles: what I do, wide and centred (grey, its key phrases in white and
 * underlined in ink, so it can be read at a glance), with a line on how I work under it; then the
 * skills. It names no company: the work history, and the degree, are in Experience.
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
                <strong key={i} className="ink-underline font-[inherit] text-text">
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

        <div className="tile tile-wide p-6 md:p-12">
          <h3 className="type-lede text-text">Skills</h3>
          <dl className="mt-4 grid gap-x-16 gap-y-7 min-[834px]:grid-cols-2">
            {skills.map((s) => (
              <div key={s.group}>
                <dt className="text-[17px] font-semibold text-text">{s.group}</dt>
                <dd className="text-[17px] leading-relaxed text-text-2">{s.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
          <p className="type-small mt-8 text-text-3">Also: {alsoUsed.join(", ")}.</p>
        </div>
      </div>
    </section>
  );
}
