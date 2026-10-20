/**
 * How a card leans toward the pointer (components/motion/Tilt.tsx): rotations in degrees, clamped
 * to ±max, and where the glare sits, in percent of the card. ry is positive when the pointer is
 * right of centre (the right edge comes forward); rx is positive when it is above centre.
 */
export function tiltFor(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
  max = 8,
): { rx: number; ry: number; gx: number; gy: number } {
  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  const u = clamp((px - rect.left) / rect.width, 0, 1);
  const v = clamp((py - rect.top) / rect.height, 0, 1);
  return { rx: (0.5 - v) * 2 * max, ry: (u - 0.5) * 2 * max, gx: u * 100, gy: v * 100 };
}
