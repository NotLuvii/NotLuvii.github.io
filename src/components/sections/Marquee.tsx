import { Fragment } from "react";
import { alsoUsed, skills } from "@/content/experience";

const items = [...skills.flatMap((g) => g.items), ...alsoUsed];

/**
 * The tools I use, sliding past under the first screen (CSS: .marquee). Two copies of the list, so
 * the loop has no seam. Decoration only: the same skills are listed in About for screen readers.
 * With reduced motion it stands still.
 */
export function Marquee() {
  return (
    <div aria-hidden className="marquee">
      <div className="marquee-track type-display">
        {[0, 1].map((copy) =>
          items.map((item) => (
            <Fragment key={`${copy}-${item}`}>
              <span>{item}</span>
              <i data-signal="">·</i>
            </Fragment>
          )),
        )}
      </div>
    </div>
  );
}
