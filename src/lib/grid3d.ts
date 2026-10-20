/**
 * The 3D grid behind the home page's sections (components/motion/GridBackdrop.tsx): a flat grid of
 * tiles turned in 3D and drawn without perspective, after adityaseth.in's, and the tiles near the
 * pointer, which glow amber and fade.
 */

/** The grid's turn about x, y and z, in degrees. */
export const ROT = { x: 30, y: -5, z: 20 };

const rad = (d: number) => (d * Math.PI) / 180;
const [cx_, sx_] = [Math.cos(rad(ROT.x)), Math.sin(rad(ROT.x))];
const [cy_, sy_] = [Math.cos(rad(ROT.y)), Math.sin(rad(ROT.y))];
const [cz_, sz_] = [Math.cos(rad(ROT.z)), Math.sin(rad(ROT.z))];
// The first two rows of Rx · Ry · Rz: a point (x, y, 0) on the grid lands at (R00 x + R01 y, R10 x + R11 y).
const R00 = cy_ * cz_;
const R01 = -cy_ * sz_;
const R10 = sx_ * sy_ * cz_ + cx_ * sz_;
const R11 = -sx_ * sy_ * sz_ + cx_ * cz_;

/** Where grid point (gx, gy), in tiles from the grid's centre, lands on screen; the centre sits at (cx, cy). */
export function project(gx: number, gy: number, cx: number, cy: number, tile: number): { x: number; y: number } {
  return { x: cx + (R00 * gx + R01 * gy) * tile, y: cy + (R10 * gx + R11 * gy) * tile };
}

/**
 * The tiles whose centres land within `radius` tiles of the point (px, py), nearest first, with d
 * from 0 (under the point) to 1 (at the edge). The grid runs from −span to span tiles each way.
 */
export function tilesNear(px: number, py: number, cx: number, cy: number, tile: number, radius: number, span: number): { gx: number; gy: number; d: number }[] {
  const out: { gx: number; gy: number; d: number }[] = [];
  const reach = radius * tile;
  for (let gx = -span; gx < span; gx++)
    for (let gy = -span; gy < span; gy++) {
      const c = project(gx + 0.5, gy + 0.5, cx, cy, tile);
      const d = Math.hypot(c.x - px, c.y - py) / reach;
      if (d <= 1) out.push({ gx, gy, d });
    }
  return out.sort((a, b) => a.d - b.d);
}

/** A lit tile's amber alpha: 16% under the pointer, less further out, fading to nothing over 1.5 s. */
export function glowAlpha(d: number, age: number): number {
  if (d >= 1 || age >= 1.5) return 0;
  return 0.16 * (1 - d) * (1 - age / 1.5);
}
