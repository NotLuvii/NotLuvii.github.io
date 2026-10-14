import { site } from "@/content/site";
import { emphasize } from "@/lib/emphasize";

/**
 * The intro, in one pass: a grey paragraph with its key phrases in white, so it can be read at a
 * glance. Static; nothing is held or animated.
 */
export function Intro() {
  return (
    <div id="intro" className="mx-auto max-w-[1200px] px-gutter pb-28 pt-24 md:pb-40 md:pt-36">
      <p className="type-statement mx-auto max-w-[32ch] text-center text-text-3">
        {emphasize(site.intro, site.introKeyPhrases).map((part, i) =>
          part.strong ? (
            <strong key={i} className="font-[inherit] text-text">
              {part.text}
            </strong>
          ) : (
            part.text
          ),
        )}
      </p>
    </div>
  );
}
