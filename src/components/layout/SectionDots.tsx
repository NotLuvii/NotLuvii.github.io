"use client";

import { sections } from "@/content/site";
import { useActiveSection } from "./useActiveSection";

const ids = sections.map((s) => s.id);

/**
 * The home page's sections as dots down the right edge, from 1280px (CSS: .section-dots): the one
 * in view is amber and shows its name. Without the script they are plain links.
 */
export function SectionDots() {
  const active = useActiveSection(ids);
  return (
    <nav aria-label="Sections" className="section-dots">
      <ul>
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-label={s.label} aria-current={on ? "true" : undefined} className="dot-link">
                <span aria-hidden className="dot-label">
                  {s.label}
                </span>
                <span aria-hidden className="dot-mark" {...(on ? { "data-signal": "" } : {})} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
