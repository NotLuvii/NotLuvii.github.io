import { describe, expect, it } from "vitest";
import { beamOffset, revealedSteps, storyPosition } from "@/components/motion/story";
import { sceneProgress } from "@/components/motion/progress";

describe("pin progress (the held story)", () => {
  const VH = 1000;
  it("is 0 when the container's top reaches the header, 1 when its end reaches the bottom of the screen", () => {
    // A 2500px container held for 1556px of scrolling below a 56px header.
    expect(sceneProgress("pin", { top: 56, height: 2500 }, VH, 56)).toBe(0);
    expect(sceneProgress("pin", { top: 56 - 778, height: 2500 }, VH, 56)).toBeCloseTo(0.5);
    expect(sceneProgress("pin", { top: 56 - 1556, height: 2500 }, VH, 56)).toBe(1);
  });

  it("stays between 0 and 1 outside the hold", () => {
    expect(sceneProgress("pin", { top: 3000, height: 2500 }, VH, 56)).toBe(0);
    expect(sceneProgress("pin", { top: -9000, height: 2500 }, VH, 56)).toBe(1);
  });
});

describe("story position", () => {
  it("runs from 0 to n + 1 across the hold, with a short lead-in and a hold at the end", () => {
    expect(storyPosition(0, 5)).toBe(0);
    expect(storyPosition(0.04, 5)).toBe(0);
    expect(storyPosition(0.5, 5)).toBeGreaterThan(2);
    expect(storyPosition(0.5, 5)).toBeLessThan(4);
    expect(storyPosition(0.9, 5)).toBe(6);
    expect(storyPosition(1, 5)).toBe(6);
  });

  it("reveals step i once the position reaches i, never more than n", () => {
    expect(revealedSteps(0, 5)).toBe(0);
    expect(revealedSteps(0.99, 5)).toBe(0);
    expect(revealedSteps(1, 5)).toBe(1);
    expect(revealedSteps(3.5, 5)).toBe(3);
    expect(revealedSteps(6, 5)).toBe(5);
  });

  it("moves the line from the top, to each flag's underline as it's revealed, to the bottom", () => {
    // Underlines at 40, 40 (same line), 80, 120 and 160px in a 200px message.
    const stops = [40, 40, 80, 120, 160];
    expect(beamOffset(0, stops, 200)).toBe(0);
    expect(beamOffset(0.5, stops, 200)).toBe(20);
    expect(beamOffset(1, stops, 200)).toBe(40);
    expect(beamOffset(1.5, stops, 200)).toBe(40); // two flags on one line: it waits there
    expect(beamOffset(3, stops, 200)).toBe(80);
    expect(beamOffset(5, stops, 200)).toBe(160);
    expect(beamOffset(6, stops, 200)).toBe(200);
  });
});
