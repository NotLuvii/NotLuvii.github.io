import { Fragment } from "react";

/** Sets percentages in a sentence in semibold, so measured results stand out when skimming. */
export function Figures({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+(?:\.\d+)?%)/).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
