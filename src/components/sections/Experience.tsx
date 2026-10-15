import { roles } from "@/content/experience";
import { Figures, figureClaim } from "@/components/ui/Figures";

/**
 * Experience, as tiles. First the two measured results, each set very large on a tile of its own
 * with what it measured under it, as apple.com sets a headline figure; they repeat a bullet below,
 * so screen readers skip them. Then the three roles side by side, every bullet word for word,
 * with its figure in white.
 */
export function Experience() {
  const highlights = roles.flatMap((r) =>
    r.points.flatMap((point) => {
      const fc = figureClaim(point);
      return fc ? [{ ...fc, who: `${r.title}, ${r.organization}` }] : [];
    }),
  );

  return (
    <section id="experience" aria-labelledby="experience-title" className="pt-24 md:pt-32">
      <div className="mx-auto max-w-[1200px] px-gutter pb-8 md:pb-10">
        <h2 id="experience-title" className="type-section text-text">
          Experience
        </h2>
      </div>

      <div aria-hidden className="tile-grid">
        {highlights.map((h) => (
          <div key={h.figure} className="tile px-gutter py-16 text-center md:py-24">
            <p data-figure className="type-figure text-text">
              {h.figure}
            </p>
            <p className="type-lede mt-5 text-text-2">{h.claim}</p>
            <p className="mt-1 text-[17px] text-text-3">{h.who}</p>
          </div>
        ))}
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
