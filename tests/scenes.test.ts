import { describe, expect, it } from "vitest";
import { sceneProgress } from "@/components/motion/progress";

const VH = 1000;

describe("sceneProgress", () => {
  it("pass: 0 as the element enters at the bottom, 1 once its top is 40% down the screen", () => {
    expect(sceneProgress("pass", { top: 1000, height: 400 }, VH)).toBe(0);
    expect(sceneProgress("pass", { top: 700, height: 400 }, VH)).toBe(0.5);
    expect(sceneProgress("pass", { top: 400, height: 400 }, VH)).toBe(1);
  });

  it("span: follows a line 60% down the screen from the element's top to its bottom", () => {
    expect(sceneProgress("span", { top: 600, height: 2000 }, VH)).toBe(0);
    expect(sceneProgress("span", { top: -400, height: 2000 }, VH)).toBe(0.5);
    expect(sceneProgress("span", { top: -1400, height: 2000 }, VH)).toBe(1);
  });

  it("stays between 0 and 1 far outside the range", () => {
    for (const mode of ["pass", "span"] as const) {
      expect(sceneProgress(mode, { top: 99999, height: 500 }, VH)).toBe(0);
      expect(sceneProgress(mode, { top: -99999, height: 500 }, VH)).toBe(1);
    }
  });
});
