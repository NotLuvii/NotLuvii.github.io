import { describe, expect, it } from "vitest";
import { ROT, glowAlpha, project, tilesNear } from "@/lib/grid3d";

describe("the 3D grid behind the sections", () => {
  it("is turned by the reference's angles", () => {
    expect(ROT).toEqual({ x: 30, y: -5, z: 20 });
  });

  it("the grid's centre projects to the screen's centre", () => {
    const p = project(0, 0, 400, 300, 28);
    expect(p.x).toBeCloseTo(400, 6);
    expect(p.y).toBeCloseTo(300, 6);
  });

  it("rotation keeps neighbouring points one tile-ish apart", () => {
    const a = project(0, 0, 400, 300, 28);
    const b = project(1, 0, 400, 300, 28);
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    expect(d).toBeGreaterThan(0.5 * 28);
    expect(d).toBeLessThanOrEqual(28 + 1e-9);
  });

  it("tiles near the pointer, nearest first", () => {
    // The pointer over the centre of tile (0, 0): that tile comes first, right under it.
    const centre = project(0.5, 0.5, 400, 300, 28);
    const near = tilesNear(centre.x, centre.y, 400, 300, 28, 3, 17);
    expect(near.length).toBeGreaterThan(4);
    expect(near[0]).toMatchObject({ gx: 0, gy: 0 });
    expect(near[0].d).toBeLessThan(0.01);
    for (let i = 1; i < near.length; i++) expect(near[i].d).toBeGreaterThanOrEqual(near[i - 1].d);
    for (const t of near) expect(t.d).toBeLessThanOrEqual(1);
    expect(tilesNear(-5000, -5000, 400, 300, 28, 3, 17)).toEqual([]);
  });

  it("glow fades out in 1.5 s", () => {
    expect(glowAlpha(0, 0)).toBeCloseTo(0.16);
    expect(glowAlpha(0, 0.75)).toBeCloseTo(0.08);
    expect(glowAlpha(0, 1.5)).toBe(0);
    expect(glowAlpha(0, 3)).toBe(0);
    expect(glowAlpha(1, 0)).toBe(0);
  });
});
