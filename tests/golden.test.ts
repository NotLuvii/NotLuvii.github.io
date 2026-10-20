import { describe, expect, it } from "vitest";
import { FIB, PHI, TYPE_SCALE, isFib, onScale, typeStep } from "@/lib/golden";

describe("the golden ratio", () => {
  it("φ and its type steps", () => {
    expect(PHI).toBeCloseTo(1.6180339887, 9);
    expect(typeStep(0)).toBe(17);
    expect(typeStep(10)).toBeCloseTo(188.53, 2);
    expect(typeStep(-1)).toBeCloseTo(13.36, 2);
    expect(TYPE_SCALE[0]).toBeCloseTo(13.36, 2);
    expect(TYPE_SCALE.at(-1)).toBeCloseTo(188.53, 2);
    expect(onScale(116.5)).toBe(true);
    expect(onScale(115)).toBe(false);
  });

  it("Fibonacci spacing", () => {
    expect([...FIB]).toEqual([2, 3, 5, 8, 13, 21, 34, 55, 89, 144]);
    expect(isFib(55)).toBe(true);
    expect(isFib(48)).toBe(false);
  });
});
