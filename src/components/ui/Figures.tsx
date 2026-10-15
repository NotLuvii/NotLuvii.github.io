import { Fragment } from "react";

/** Sets percentages in a sentence in white semibold, so measured results stand out in grey text. */
export function Figures({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+(?:\.\d+)?%)/).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-text">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
