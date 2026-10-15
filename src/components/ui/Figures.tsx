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

/** The first percentage in a sentence, if it has one. */
export const firstFigure = (text: string) => text.match(/\d+(?:\.\d+)?%/)?.[0];

/**
 * A sentence that opens with a claim and its figure ("Reduced delivery delays by 50% by …"): the
 * claim and the figure, so the figure can be set large with the claim under it. Otherwise null.
 */
export function figureClaim(sentence: string): { figure: string; claim: string } | null {
  const m = sentence.match(/^(.+?) by (\d+(?:\.\d+)?%)/);
  return m ? { figure: m[2], claim: m[1] } : null;
}
