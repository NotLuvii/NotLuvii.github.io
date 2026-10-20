import { describe, expect, it } from "vitest";
import { COLS, CYCLE, MARKS, REST, ROWS, SWEEP, barHeight, passed, scanAt } from "@/lib/field";

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

  it("the scan sweeps in 5.6 s and holds to 7 s", () => {
    expect([SWEEP, CYCLE]).toEqual([5.6, 7]);
    expect(scanAt(0)).toBe(0);
    expect(scanAt(2.8)).toBeCloseTo(0.5, 6);
    expect(scanAt(5.6)).toBe(1);
    expect(scanAt(6.5)).toBe(1);
    expect(scanAt(7)).toBe(0);
    expect(scanAt(9.8)).toBeCloseTo(0.5, 6);
  });

  it("rows count as checked once the scan has passed them", () => {
    expect(passed(0, 0)).toBe(true);
    expect(passed(20, 0.9)).toBe(false);
    expect(passed(20, 1)).toBe(true);
    // At rest the scan waits at the golden section, past every mark.
    expect(REST).toBe(0.618);
    for (const m of MARKS) expect(passed(m.row, REST)).toBe(true);
  });
});
