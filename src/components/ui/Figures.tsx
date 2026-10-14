import { Fragment } from "react";

/** Sets percentages in a sentence in amber, so measured results stand out when skimming. */
export function Figures({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+(?:\.\d+)?%)/).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-amber">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** The first percentage in a sentence, if it has one. */
export const firstFigure = (text: string) => text.match(/\d+(?:\.\d+)?%/)?.[0];
