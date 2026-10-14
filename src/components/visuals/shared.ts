/** Seeded PRNG so every illustration renders identically on server and client. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rounds to 2 decimals so SSR and client markup match exactly. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

export function toPath(points: Array<[number, number]>, close = false) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${r2(x)} ${r2(y)}`).join(" ") + (close ? " Z" : "");
}

/** Arc path for gauges, angles in degrees, 0° = 3 o'clock, clockwise. */
export function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${r2(x1)} ${r2(y1)} A${r} ${r} 0 ${large} 1 ${r2(x2)} ${r2(y2)}`;
}

export type VisualProps = { active: boolean; reduced: boolean };

export { cssVars as vars } from "@/lib/cn";
