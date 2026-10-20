import { alsoUsed, background, skills } from "@/content/experience";
import { site } from "@/content/site";
import { emphasize } from "@/lib/emphasize";

/**
 * About and skills, as tiles: what I do, wide and centred (grey, its key phrases in white, so it
 * can be read at a glance), with a line on how I work under it; then the
 * skills. It names no company: the work history, and the degree, are in Experience.
 */
export function About() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="pt-f89 md:pt-f144">
      <div className="mx-auto max-w-[1200px] px-gutter pb-f34 md:pb-f34">
        <h2 id="skills-title" className="type-display section-title text-text">
          About and skills
        </h2>
      </div>

      <div className="tile-grid">
        <div className="tile tile-wide px-gutter py-f55 text-center md:py-f89">
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
            <p key={p} className="mx-auto mt-f34 max-w-[62ch] text-[17px] leading-[1.618] text-text-2">
              {p}
            </p>
          ))}
        </div>

        <div className="tile tile-wide p-f21 md:p-f55">
          <h3 className="type-lede text-text">Skills</h3>
          <dl className="mt-f13 grid gap-x-f55 gap-y-f34 min-[834px]:grid-cols-2">
            {skills.map((s) => (
              <div key={s.group}>
                <dt className="text-[17px] font-semibold text-text">{s.group}</dt>
                <dd className="text-[17px] leading-[1.618] text-text-2">{s.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
          <p className="type-small mt-f34 text-text-3">Also: {alsoUsed.join(", ")}.</p>
        </div>
      </div>
    </section>
  );
}
