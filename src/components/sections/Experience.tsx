import { timeline, type TimelineEntry } from "@/content/experience";

function Entry({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === "education") {
    const e = entry.education;
    return (
      <li className="experience-entry">
        <p className="experience-dates">{e.date}</p>
        <div className="min-w-0 max-w-[62ch]">
          <h3 className="type-title text-text">{e.degree}</h3>
          <p className="mt-f5 text-[17px] text-text-2">{e.school}</p>
          <p className="type-small mt-f13 max-w-[62ch] text-text-3">Coursework: {e.coursework.join(", ")}.</p>
        </div>
      </li>
    );
  }
  const r = entry.role;
  return (
    <li className="experience-entry">
      <p className="experience-dates">{r.period}</p>
      <div className="min-w-0 max-w-[62ch]">
        <h3 className="type-title text-text">
          {r.title}, {r.organization}
        </h3>
        <p className="mt-f5 text-[17px] text-text-3">{[r.about, r.place].filter(Boolean).join(" · ")}</p>
        <ul className="mt-f13 space-y-f8">
          {r.points.map((point) => (
            <li key={point} className="text-[17px] leading-[1.618] text-text-2">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/**
 * Experience as a plain list, easy to scan: the three roles and the degree, newest first; for
 * each, the dates, then the role and organisation, and every point word for word. Figures stay as
 * the resume states them, with no emphasis.
 */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="pt-f55 md:pt-f89">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="experience-title" className="section-title text-text">
          Experience
        </h2>
        <ol className="experience-list mt-f34">
          {timeline().map((entry) => (
            <Entry key={entry.kind === "role" ? entry.role.organization : entry.education.degree} entry={entry} />
          ))}
        </ol>
      </div>
    </section>
  );
}
