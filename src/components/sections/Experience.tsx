import { timeline, type TimelineEntry } from "@/content/experience";
import { spine } from "@/lib/ink";
import { Ink } from "@/components/ink/Ink";
import { Figures } from "@/components/ui/Figures";

function Entry({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === "education") {
    const e = entry.education;
    return (
      <>
        <h3 className="type-title text-text">{e.degree}</h3>
        <p className="mt-f5 text-[17px] text-text-2">
          {e.school}, {e.date}
        </p>
        <p className="type-small mt-f13 text-text-3">Coursework: {e.coursework.join(", ")}.</p>
      </>
    );
  }
  const r = entry.role;
  return (
    <>
      <h3 className="type-title text-text">
        {r.title}, {r.organization}
      </h3>
      {r.about && <p className="mt-f5 text-[17px] text-text-3">{r.about}</p>}
      <p className="type-small mt-f5 text-text-3">
        {r.period} · {r.place}
      </p>
      <ul className="mt-f21 space-y-f13">
        {r.points.map((point) => (
          <li key={point} className="text-[17px] leading-[1.618] text-text-2">
            <Figures text={point} ring />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Experience as a timeline drawn by hand: one amber spine, and each role (and the degree) hanging
 * off it, newest first, with its year written in the margin. Every bullet word for word, its
 * figure circled in ink where it stands.
 */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="pt-f55 md:pt-f89">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="experience-title" className="type-display section-title text-text">
          Experience
        </h2>
        <div className="timeline mt-f34 md:mt-f55">
          <Ink paths={spine(1000, 31)} w={20} h={1000} className="timeline-spine" />
          <ol className="space-y-f55">
            {timeline().map((entry) => (
              <li key={entry.kind === "role" ? entry.role.organization : entry.education.degree} className="timeline-entry">
                <p aria-hidden data-ink className="timeline-year">
                  {entry.showYear ? entry.year : ""}
                </p>
                <div className="timeline-body min-w-0 max-w-[68ch]">
                  <Entry entry={entry} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
