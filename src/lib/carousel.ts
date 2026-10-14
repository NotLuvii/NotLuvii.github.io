/** Pure helpers for the highlights carousel, kept apart from the DOM so they can be tested. */

/** Index of the card whose left edge is closest to the current scroll position. */
export function nearestIndex(scrollLeft: number, lefts: readonly number[]): number {
  let best = 0;
  let bestDistance = Infinity;
  lefts.forEach((left, i) => {
    const d = Math.abs(left - scrollLeft);
    if (d < bestDistance) {
      best = i;
      bestDistance = d;
    }
  });
  return best;
}

/** One card forward or back, never past either end. */
export function stepIndex(current: number, direction: 1 | -1, count: number): number {
  return Math.min(Math.max(current + direction, 0), Math.max(count - 1, 0));
}

/** Whether the track can scroll further each way. Two pixels of slack absorb sub-pixel rounding. */
export function edges(scrollLeft: number, maxScroll: number): { atStart: boolean; atEnd: boolean } {
  return { atStart: scrollLeft <= 2, atEnd: scrollLeft >= maxScroll - 2 };
}
