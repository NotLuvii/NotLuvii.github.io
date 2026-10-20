/**
 * The golden ratio, φ, and the two scales built on it (globals.css uses the same numbers):
 *
 * - type: 17px times √φ to the n, so every second step is φ times larger;
 * - spacing: the Fibonacci numbers, whose neighbours approach φ.
 */
export const PHI = (1 + Math.sqrt(5)) / 2;

/** A size on the type scale: 17 × √φⁿ px. */
export function typeStep(n: number): number {
  return 17 * PHI ** (n / 2);
}

/** Steps −1 to 10 (13.36px to 188.58px), rounded to two decimals as the CSS writes them. */
export const TYPE_SCALE: number[] = Array.from({ length: 12 }, (_, i) => Math.round(typeStep(i - 1) * 100) / 100);

/** The spacing steps, in px. */
export const FIB = [2, 3, 5, 8, 13, 21, 34, 55, 89, 144] as const;

/** Whether a computed font size is one of the type steps. */
export function onScale(px: number, tolerance = 0.5): boolean {
  return TYPE_SCALE.some((s) => Math.abs(s - px) <= tolerance);
}

/** Whether a computed margin, padding or gap is one of the spacing steps. */
export function isFib(px: number, tolerance = 0.5): boolean {
  return FIB.some((f) => Math.abs(f - px) <= tolerance);
}
