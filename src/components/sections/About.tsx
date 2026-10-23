import Link from "next/link";
import { alsoUsed, approach, interests, skills } from "@/content/experience";
import { projectHref } from "@/content/projects";

/**
 * About, and skills, from what the site already shows: what I'm interested in, and how I work, each
 * point with where it comes from (a case study, linked, or the reports work); then the skills, once.
 * It names no company: the work history, and the degree, are in Experience.
 */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="pt-f55 md:pt-f89">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="about-title" className="section-title text-text">
          About
        </h2>

        <div className="mt-f34 grid gap-x-f55 gap-y-f34 min-[834px]:grid-cols-2">
          <div>
            <h3 className="type-lede text-text">What I&rsquo;m interested in</h3>
            <p className="mt-f13 max-w-[62ch] text-[17px] leading-[1.618] text-text-2">{interests}</p>
          </div>
          <div>
            <h3 className="type-lede text-text">How I work</h3>
            <ul className="mt-f13 space-y-f13">
              {approach.map((a) => (
                <li key={a.point} className="text-[17px] leading-[1.618]">
                  <span className="block text-text">{a.point}</span>
                  <span className="type-small block text-text-3">
                    From{" "}
                    {a.slug ? (
                      <Link href={projectHref(a.slug)} className="text-text-2 underline decoration-text-3 underline-offset-4 hover:text-text">
                        {a.from}
                      </Link>
                    ) : (
                      a.from
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-f55 rounded-xl bg-panel p-f21 md:p-f55">
          <h3 className="type-lede text-text">Skills</h3>
          <dl className="mt-f13 grid gap-x-f34 gap-y-f21 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-4">
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
