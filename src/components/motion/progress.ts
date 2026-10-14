export type SceneMode = "pin" | "pass" | "span";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * How far through its scroll range an element is, from 0 to 1.
 *
 * - `pin`: a tall container whose child is `position: sticky` at `offset` from the top. 0 when the
 *   container's top reaches `offset`, 1 when its end reaches the bottom of the screen.
 * - `pass`: an element arriving. 0 as its top enters at the bottom of the screen, 1 once its top is
 *   40% of the way down.
 * - `span`: a long section. Follows a line 60% down the screen from the section's top to its end.
 */
export function sceneProgress(mode: SceneMode, rect: { top: number; height: number }, viewport: number, offset = 0): number {
  if (mode === "pin") {
    const distance = rect.height - (viewport - offset);
    if (distance <= 0) return rect.top > offset ? 0 : 1;
    return clamp01((offset - rect.top) / distance);
  }
  if (mode === "pass") {
    return clamp01((viewport - rect.top) / (viewport * 0.6));
  }
  return clamp01((viewport * 0.6 - rect.top) / rect.height);
}
