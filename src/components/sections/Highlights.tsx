"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { highlights } from "@/content/highlights";
import { edges, nearestIndex, stepIndex } from "@/lib/carousel";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotionPreference";
import { Reveal } from "@/components/ui/Reveal";
import { Chevron } from "@/components/ui/links";
import { HighlightArt } from "@/components/visuals/HighlightArt";

/** Apple's "Get the highlights" gallery: wide cards that snap into place, with arrows and dots. */
export function Highlights() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [ends, setEnds] = useState({ atStart: true, atEnd: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const pad = cards[0]?.offsetLeft ?? 0;
    const e = edges(el.scrollLeft, el.scrollWidth - el.clientWidth);
    // At the far end the last card may not reach the start line, so count it as current there.
    setIndex(e.atEnd && !e.atStart ? cards.length - 1 : nearestIndex(el.scrollLeft, cards.map((c) => c.offsetLeft - pad)));
    setEnds(e);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    raf = requestAnimationFrame(measure);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const pad = cards[0]?.offsetLeft ?? 0;
    el.scrollTo({ left: cards[i].offsetLeft - pad, behavior: reduced ? "auto" : "smooth" });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    go(stepIndex(index, e.key === "ArrowRight" ? 1 : -1, highlights.length));
  };

  return (
    <section id="highlights" aria-labelledby="highlights-title" className="bg-mist py-24 md:py-32">
      <Reveal className="mx-auto max-w-[1180px] px-gutter">
        <h2 id="highlights-title" className="type-headline text-ink">
          Get the highlights.
        </h2>
      </Reveal>

      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label="Highlights"
        tabIndex={0}
        onKeyDown={onKey}
        className="track mt-12 flex gap-5 overflow-x-auto pb-2 [padding-inline:max(var(--spacing-gutter),calc((100vw-1180px)/2+var(--spacing-gutter)))] [scroll-padding-inline:max(var(--spacing-gutter),calc((100vw-1180px)/2+var(--spacing-gutter)))] focus-visible:outline-offset-[-2px]"
      >
        {highlights.map((h, i) => {
          const dark = h.tone === "dark";
          return (
            <article
              key={h.title}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${highlights.length}`}
              className={cn(
                "relative flex min-h-[480px] w-[84vw] shrink-0 flex-col overflow-hidden rounded-[28px] sm:h-[520px] md:w-[min(72vw,880px)] lg:h-[560px]",
                dark ? "bg-black" : "bg-white",
              )}
            >
              <p className={cn("max-w-[30ch] p-8 text-[21px] font-semibold leading-[1.24] tracking-[-0.016em] md:p-12 md:text-[24px]", dark ? "text-silver" : "text-ash")}>
                <span className={dark ? "text-mist" : "text-ink"}>{h.title}</span> {h.body}
              </p>
              <div className="mt-auto flex flex-col-reverse items-end gap-4 px-8 pb-8 sm:flex-row sm:justify-between sm:gap-6 md:px-12 md:pb-10">
                <p className={cn("type-small self-start font-semibold sm:self-auto", dark ? "text-silver" : "text-ash")}>{h.source}</p>
                <div className="h-[160px] w-[240px] shrink-0 sm:h-[240px] sm:w-[360px] lg:h-[300px] lg:w-[450px]">
                  <HighlightArt art={h.art} tone={h.tone} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-8 flex max-w-[1180px] items-center justify-between gap-6 px-gutter">
        <div className="-mx-2 flex items-center" role="group" aria-label="Choose a highlight">
          {highlights.map((h, i) => (
            <button
              key={h.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show highlight ${i + 1}: ${h.title}`}
              aria-current={index === i ? "true" : undefined}
              className="group grid h-6 min-w-6 place-items-center px-2"
            >
              <span
                aria-hidden
                className={cn("block h-2 rounded-full transition-all duration-300", index === i ? "w-8 bg-ink/80" : "w-2 bg-ink/25 group-hover:bg-ink/45")}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-3.5">
          <button
            type="button"
            onClick={() => go(stepIndex(index, -1, highlights.length))}
            disabled={ends.atStart}
            aria-label="Previous highlight"
            className="grid size-9 place-items-center rounded-full bg-[#e8e8ed] text-ink/80 transition-colors hover:bg-[#dcdce1] disabled:opacity-40 disabled:hover:bg-[#e8e8ed]"
          >
            <Chevron className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(stepIndex(index, 1, highlights.length))}
            disabled={ends.atEnd}
            aria-label="Next highlight"
            className="grid size-9 place-items-center rounded-full bg-[#e8e8ed] text-ink/80 transition-colors hover:bg-[#dcdce1] disabled:opacity-40 disabled:hover:bg-[#e8e8ed]"
          >
            <Chevron />
          </button>
        </div>
      </div>
    </section>
  );
}
