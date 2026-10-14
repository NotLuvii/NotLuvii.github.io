import { describe, expect, it } from "vitest";
import { edges, nearestIndex, stepIndex } from "@/lib/carousel";
import { countAt, easeOutCubic } from "@/lib/count";

describe("carousel", () => {
  const lefts = [0, 420, 840, 1260];

  it("finds the card whose start is nearest the scroll position", () => {
    expect(nearestIndex(0, lefts)).toBe(0);
    expect(nearestIndex(200, lefts)).toBe(0);
    expect(nearestIndex(211, lefts)).toBe(1);
    expect(nearestIndex(5000, lefts)).toBe(3);
    expect(nearestIndex(0, [])).toBe(0);
  });

  it("steps one card at a time and stops at either end", () => {
    expect(stepIndex(0, 1, 4)).toBe(1);
    expect(stepIndex(3, 1, 4)).toBe(3);
    expect(stepIndex(0, -1, 4)).toBe(0);
    expect(stepIndex(2, -1, 4)).toBe(1);
  });

  it("knows when there is nothing further to scroll, with a couple of pixels of slack", () => {
    expect(edges(0, 1000)).toEqual({ atStart: true, atEnd: false });
    expect(edges(999, 1000)).toEqual({ atStart: false, atEnd: true });
    expect(edges(500, 1000)).toEqual({ atStart: false, atEnd: false });
    expect(edges(0, 0)).toEqual({ atStart: true, atEnd: true });
  });
});

describe("counting up", () => {
  it("eases from 0 to 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("shows whole numbers that start at zero and land exactly on the target", () => {
    expect(countAt(75, 0)).toBe(0);
    expect(countAt(75, 1)).toBe(75);
    expect(countAt(75, 2)).toBe(75);
    expect(Number.isInteger(countAt(75, 0.37))).toBe(true);
  });
});
