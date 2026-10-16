import { Fragment } from "react";
import { ring as ringPaths } from "@/lib/ink";
import { Ink } from "@/components/ink/Ink";

/**
 * Sets percentages in a sentence in white semibold, so measured results stand out in grey text.
 * With `ring`, each one is also circled by hand in ink, where it stands (globals.css, ".ink-ring").
 */
export function Figures({ text, ring = false }: { text: string; ring?: boolean }) {
  return (
    <>
      {text.split(/(\d+(?:\.\d+)?%)/).map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const figure = (
          <strong key={i} className="font-semibold text-text">
            {part}
          </strong>
        );
        return ring ? (
          <span key={i} className="ink-ring">
            {figure}
            <Ink paths={ringPaths(60, 40, 20 + i)} w={60} h={40} />
          </span>
        ) : (
          figure
        );
      })}
    </>
  );
}
