/** Number animation for the stats: fast at first, settling onto the value like Apple's counters. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

/** The whole number to show at progress t (0 to 1, clamped). */
export function countAt(target: number, t: number): number {
  return t >= 1 ? target : Math.round(target * easeOutCubic(t));
}
