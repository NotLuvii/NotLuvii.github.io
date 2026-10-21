"use client";

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Chevron } from "@/components/ui/links";

/** Which ends of the row the scroll touches. */
type Ends = "start" | "middle" | "end" | "both";
/**
 * Where the row is: which ends it touches, the first and last cards wholly in view (from 0), and
 * whether it scrolls at all. One card shows at a time on a phone and at 768px; two at about 1024.
 */
type Position = { ends: Ends; first: number; last: number; scrollable: boolean };

/** The snapshot is a string, so React sees the same value until the position really changes. */
const NONE = "none";
const key = (p: Position) => `${p.ends}|${p.first}|${p.last}|${p.scrollable ? 1 : 0}`;
const parse = (k: string): Position | null => {
  if (k === NONE) return null;
  const [ends, first, last, scrollable] = k.split("|");
  return { ends: ends as Ends, first: Number(first), last: Number(last), scrollable: scrollable === "1" };
};

function measure(ul: HTMLUListElement): Position {
  const atStart = ul.scrollLeft <= 2;
  const atEnd = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2;
  const ends: Ends = atStart && atEnd ? "both" : atStart ? "start" : atEnd ? "end" : "middle";
  const view = ul.getBoundingClientRect();
  const boxes = ([...ul.children] as HTMLElement[]).map((c) => c.getBoundingClientRect());
  const whole = boxes.flatMap((b, i) => (b.left >= view.left - 2 && b.right <= view.right + 2 ? [i] : []));
  // Mid-swipe, or on a screen too narrow for a whole card: the card nearest the start.
  const nearest = boxes.reduce((best, b, i) => (Math.abs(b.left - view.left) < Math.abs(boxes[best].left - view.left) ? i : best), 0);
  const [first, last] = whole.length ? [whole[0], whole[whole.length - 1]] : [nearest, nearest];
  return { ends, first, last, scrollable: ul.scrollWidth > ul.clientWidth + 2 };
}

/**
 * The selected work as a row of cards (CSS: .carousel). From 1100px all three fit the column side
 * by side and nothing else shows. Narrower, the row scrolls sideways (by touch, trackpad or Tab,
 * snapping to each card) and says where you are: the cards wholly in view ("2 of 3", or "1–2 of 3"
 * where two fit) and a dot per project, the ones in view marked (aria-current), each dot showing
 * its card; from 768px Previous and Next buttons beside the heading bring in the card before or
 * after those in view, each saying it's unavailable at its end (aria-disabled, so a button that
 * reaches its end keeps focus). A card that receives focus is scrolled fully into view. Without
 * JavaScript the row still scrolls and there are no controls.
 */
export function WorkCarousel({ children, label, header, names }: { children: ReactNode; label: string; header: ReactNode; names: string[] }) {
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
  const position = parse(
    useSyncExternalStore(
      subscribe,
      () => (list.current ? key(measure(list.current)) : NONE),
      () => NONE,
    ),
  );

  const show = (i: number) => (list.current?.children[i] as HTMLElement | undefined)?.scrollIntoView({ inline: "start", block: "nearest" });
  const move = (dir: -1 | 1) => position && show(Math.max(0, Math.min(names.length - 1, dir < 0 ? position.first - 1 : position.last + 1)));
  const prevOff = position?.ends === "start" || position?.ends === "both";
  const nextOff = position?.ends === "end" || position?.ends === "both";
  const scrolls = !!position?.scrollable;

  return (
    <>
      <div className="mx-auto flex max-w-[1200px] items-end justify-between gap-f21 px-gutter">
        <div className="min-w-0">{header}</div>
        {scrolls && (
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
      {scrolls && position && (
        <div className="carousel-position mx-auto max-w-[1200px] px-gutter">
          <div className="flex items-center gap-f8">
            <p className="carousel-count" aria-live="polite">
              {position.first === position.last ? position.first + 1 : `${position.first + 1}–${position.last + 1}`} of {names.length}
            </p>
            <ul className="carousel-dots">
              {names.map((name, i) => (
                <li key={name}>
                  <button type="button" aria-label={`Show project ${i + 1}: ${name}`} aria-current={i >= position.first && i <= position.last ? "true" : undefined} onClick={() => show(i)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
