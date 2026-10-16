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
        <p className="mt-1 text-[17px] text-text-2">
          {e.school}, {e.date}
        </p>
        <p className="type-small mt-3 text-text-3">Coursework: {e.coursework.join(", ")}.</p>
      </>
    );
  }
  const r = entry.role;
  return (
    <>
      <h3 className="type-title text-text">
        {r.title}, {r.organization}
      </h3>
      {r.about && <p className="mt-1 text-[17px] text-text-3">{r.about}</p>}
      <p className="type-small mt-1 text-text-3">
        {r.period} · {r.place}
      </p>
      <ul className="mt-5 space-y-4">
        {r.points.map((point) => (
          <li key={point} className="text-[17px] leading-[1.55] text-text-2">
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
    <section id="experience" aria-labelledby="experience-title" className="pt-24 md:pt-32">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="experience-title" className="type-section text-text">
          Experience
        </h2>
        <div className="timeline mt-10 md:mt-14">
          <Ink paths={spine(1000, 31)} w={20} h={1000} className="timeline-spine" />
          <ol className="space-y-14">
            {timeline().map((entry) => (
              <li key={entry.kind === "role" ? entry.role.organization : entry.education.degree} className="timeline-entry">
                <p aria-hidden data-ink className="timeline-year">
                  {entry.showYear ? entry.year : ""}
                </p>
                <div className="min-w-0 max-w-[68ch]">
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
