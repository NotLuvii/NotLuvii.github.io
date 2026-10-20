import { describe, expect, it } from "vitest";
import { tiltFor } from "@/lib/tilt";

const box = { left: 0, top: 0, width: 100, height: 100 };

describe("card tilt", () => {
  it("the centre is level", () => {
    const t = tiltFor(50, 50, box);
    expect([t.rx, t.ry].map((n) => n + 0)).toEqual([0, 0]);
  });

  it("leans toward the pointer, at most 8°", () => {
    const corner = tiltFor(100, 0, box);
    expect(corner.ry).toBeCloseTo(8);
    expect(corner.rx).toBeCloseTo(8);
    const below = tiltFor(50, 100, box);
    expect(below.rx).toBeCloseTo(-8);
    const far = tiltFor(900, -900, box);
    expect([far.rx, far.ry]).toEqual([8, 8]);
    expect(tiltFor(0, 50, box, 5).ry).toBeCloseTo(-5);
  });

  it("glare follows the pointer", () => {
    const t = tiltFor(25, 75, box);
    expect([t.gx, t.gy]).toEqual([25, 75]);
    expect(tiltFor(-50, 300, box).gx).toBe(0);
  });
});
