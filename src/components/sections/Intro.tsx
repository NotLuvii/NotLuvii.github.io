import { Fragment, type CSSProperties } from "react";
import { site } from "@/content/site";

const vars = (o: Record<string, number>) => o as CSSProperties;

/**
 * The intro sentence, held on screen while each word turns from dim to white in reading order
 * (CSS: .intro-pin, .intro-word). Screen readers hear one sentence; the spans are only for the
 * light. Under reduced motion every word is white and nothing is held.
 */
export function Intro() {
  const words = site.intro.split(" ");
  return (
    <div data-scene="pin" className="intro-pin">
      <div className="intro-stage mx-auto max-w-[1200px] px-gutter">
        <p className="type-statement max-w-[30ch] text-text" style={vars({ "--n": words.length })}>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="intro-word" style={vars({ "--i": i })}>
                {w}
              </span>{" "}
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}
