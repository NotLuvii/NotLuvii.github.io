/**
 * The maths of the scroll story (components/sections/ScanStory.tsx). Progress through the held
 * stretch (0 to 1) becomes a position from 0 to n + 1: a short lead-in, then one unit per step, and a
 * short hold on the result at the end. Step i is revealed once the position reaches i, and the scan
 * line moves from the top of the message, to each flag's underline in turn, then to the bottom.
 */
const LEAD_IN = 0.06;
const RUN = 0.8;

export function storyPosition(progress: number, steps: number): number {
  const t = Math.min(1, Math.max(0, (progress - LEAD_IN) / RUN));
  return t * (steps + 1);
}

export function revealedSteps(position: number, steps: number): number {
  return Math.min(steps, Math.max(0, Math.floor(position + 1e-9)));
}

/** The line's offset from the top of the message: 0, then each step's underline, then `height`. */
export function beamOffset(position: number, stops: number[], height: number): number {
  const points = [0, ...stops, height];
  const i = Math.min(points.length - 2, Math.max(0, Math.floor(position)));
  const f = Math.min(1, Math.max(0, position - i));
  return points[i] + (points[i + 1] - points[i]) * f;
}
