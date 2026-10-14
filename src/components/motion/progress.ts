export type SceneMode = "pass" | "span";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * How far through its scroll range an element is, from 0 to 1.
 *
 * - `pass`: an element arriving. 0 as its top enters at the bottom of the screen, 1 once its top is
 *   40% of the way down.
 * - `span`: a long section. Follows a line 60% down the screen from the section's top to its end.
 */
export function sceneProgress(mode: SceneMode, rect: { top: number; height: number }, viewport: number): number {
  if (mode === "pass") {
    return clamp01((viewport - rect.top) / (viewport * 0.6));
  }
  return clamp01((viewport * 0.6 - rect.top) / rect.height);
}
