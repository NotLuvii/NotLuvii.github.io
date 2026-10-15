import { roles } from "@/content/experience";
import { Figures } from "@/components/ui/Figures";

/** Experience: the three roles as tiles, side by side, every bullet word for word, with its figure in white. */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="pt-24 md:pt-32">
      <div className="mx-auto max-w-[1200px] px-gutter pb-8 md:pb-10">
        <h2 id="experience-title" className="type-section text-text">
          Experience
        </h2>
      </div>

      <ul className="role-grid">
        {roles.map((r) => (
          <li key={r.organization} className="tile p-6 md:p-8">
            <h3 className="type-title text-text">
              {r.title}, {r.organization}
            </h3>
            {r.about && <p className="mt-1 text-[17px] text-text-3">{r.about}</p>}
            <p className="type-small mt-1 text-text-3">
              {r.period} · {r.place}
            </p>
            <ul className="mt-6 space-y-4">
              {r.points.map((point) => (
                <li key={point} className="text-[17px] leading-[1.55] text-text-2">
                  <Figures text={point} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
