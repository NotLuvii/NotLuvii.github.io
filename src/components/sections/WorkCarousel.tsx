"use client";

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Chevron } from "@/components/ui/links";

/** Where the list is scrolled: "none" before the script runs (no buttons then), else which ends it touches. */
type Ends = "none" | "start" | "middle" | "end" | "both";

const GAP = 16;

/**
 * The selected work as a row of cards that scrolls sideways (CSS: .carousel): by touch, trackpad
 * or Tab, snapping to each card. From 768px, Previous and Next buttons beside the heading move it
 * one card at a time; each says it's unavailable at its end (aria-disabled, so a button that
 * reaches its end keeps focus). A card that receives focus is scrolled fully into view.
 * Without JavaScript the list still scrolls and there are no buttons.
 */
export function WorkCarousel({ children, label, header }: { children: ReactNode; label: string; header: ReactNode }) {
  const list = useRef<HTMLUListElement>(null);

  const subscribe = useCallback((onChange: () => void) => {
    const ul = list.current;
    if (!ul) return () => {};
    ul.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      ul.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);
  const ends = useSyncExternalStore<Ends>(
    subscribe,
    () => {
      const ul = list.current;
      if (!ul) return "none";
      const atStart = ul.scrollLeft <= 2;
      const atEnd = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2;
      return atStart && atEnd ? "both" : atStart ? "start" : atEnd ? "end" : "middle";
    },
    () => "none",
  );

  const move = (dir: -1 | 1) => {
    const ul = list.current;
    const card = ul?.firstElementChild as HTMLElement | null;
    if (!ul || !card) return;
    ul.scrollBy({ left: dir * (card.offsetWidth + GAP) });
  };
  const prevOff = ends === "start" || ends === "both";
  const nextOff = ends === "end" || ends === "both";

  return (
    <>
      <div className="mx-auto flex max-w-[1200px] items-end justify-between gap-6 px-gutter">
        <div className="min-w-0">{header}</div>
        {ends !== "none" && (
          <div className="carousel-controls">
            <button type="button" aria-label="Previous project" aria-disabled={prevOff} onClick={() => !prevOff && move(-1)} className="carousel-button">
              <Chevron left />
            </button>
            <button type="button" aria-label="Next project" aria-disabled={nextOff} onClick={() => !nextOff && move(1)} className="carousel-button">
              <Chevron />
            </button>
          </div>
        )}
      </div>
      <ul
        ref={list}
        aria-label={label}
        className="carousel"
        onFocus={(e) => (e.target as HTMLElement).closest(".carousel > li")?.scrollIntoView({ block: "nearest", inline: "nearest" })}
      >
        {children}
      </ul>
    </>
  );
}
