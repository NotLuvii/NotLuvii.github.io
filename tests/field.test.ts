import { describe, expect, it } from "vitest";
import { COLS, MARKS, ROWS, barHeight } from "@/lib/field";

describe("the 3D data field", () => {
  it("a 13 by 21 field of three bar heights", () => {
    expect([COLS, ROWS]).toEqual([13, 21]);
    const heights = new Set<number>();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) heights.add(barHeight(r, c));
    expect([...heights].sort()).toEqual([0.6, 1, 1.4]);
  });

  it("seven ticks and one defect, inside the field", () => {
    expect(MARKS).toHaveLength(8);
    expect(MARKS.filter((m) => m.kind === "defect")).toHaveLength(1);
    for (const m of MARKS) {
      expect(m.row).toBeGreaterThanOrEqual(0);
      expect(m.row).toBeLessThan(ROWS);
      expect(m.col).toBeGreaterThanOrEqual(0);
      expect(m.col).toBeLessThan(COLS);
    }
    expect(new Set(MARKS.map((m) => `${m.row},${m.col}`)).size).toBe(8);
  });
});
