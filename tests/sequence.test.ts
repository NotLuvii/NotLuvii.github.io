import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chapters } from "../src/content";
import { countsAt, frameUrl, loadOrder, nearest, viewAt, type Form, type Manifest } from "../src/sequence";

describe("loading and drawing", () => {
  it("loads every frame exactly once, a sparse set first", () => {
    const order = loadOrder(75);
    expect(new Set(order).size).toBe(75);
    expect(order).toHaveLength(75);
    expect(order[0]).toBe(0);
    expect(order.slice(0, 6)).toContain(74);
    expect(order.slice(0, 5)).toEqual([0, 74, 16, 32, 48]);
  });

  it("draws the nearest frame that has loaded", () => {
    const loaded = [true, false, false, false, true];
    expect(nearest(loaded, 1)).toBe(0);
    expect(nearest(loaded, 3)).toBe(4);
    expect(nearest([false, false], 1)).toBe(-1);
  });

  it("eases from one moment's view to the next", () => {
    const form: Form = { width: 100, height: 100, frames: 30, moments: [[0, 10], [10, 20], [20, 30]], views: [[0, 0, 100, 100], [50, 0, 50, 50], [0, 0, 100, 100]] };
    expect(viewAt(form, 5)).toEqual([0, 0, 100, 100]);
    expect(viewAt(form, 10)).toEqual([0, 0, 100, 100]);
    expect(viewAt(form, 18)).toEqual([50, 0, 50, 50]);
    const mid = viewAt(form, 14)!;
    expect(mid[0]).toBeGreaterThan(0);
    expect(mid[0]).toBeLessThan(50);
  });
});

describe("the recorded sequences", () => {
  for (const c of chapters) {
    const file = `public/sequences/${c.sequence}/manifest.json`;
    it.skipIf(!existsSync(file))(`${c.sequence}: every frame, still and view is there and in range`, () => {
      const m: Manifest = JSON.parse(readFileSync(file, "utf8"));
      for (const [name, form] of Object.entries(m).filter(([k]) => k === "desktop" || k === "phone") as [string, Form][]) {
        for (let i = 0; i < form.frames; i++) expect(existsSync(`public/${frameUrl(c.sequence, name, i)}`), `${name} ${i}`).toBe(true);
        expect(existsSync(`public/${frameUrl(c.sequence, name, form.frames)}`)).toBe(false);
        // The three moments cover the whole sequence, in order, without gaps.
        expect(form.moments).toHaveLength(3);
        expect(form.moments[0][0]).toBe(0);
        expect(form.moments[1][0]).toBe(form.moments[0][1]);
        expect(form.moments[2][0]).toBe(form.moments[1][1]);
        expect(form.moments[2][1]).toBe(form.frames);
        for (const v of form.views ?? []) {
          expect(v[0]).toBeGreaterThanOrEqual(0);
          expect(v[1]).toBeGreaterThanOrEqual(0);
          expect(v[0] + v[2]).toBeLessThanOrEqual(form.width);
          expect(v[1] + v[3]).toBeLessThanOrEqual(form.height);
        }
        if (form.counts) expect(form.counts).toHaveLength(form.frames);
      }
      for (let k = 1; k <= 3; k++) expect(existsSync(`public/sequences/${c.sequence}/still-${k}.webp`)).toBe(true);
    });
  }
});

describe("the counter's totals at a frame", () => {
  const counts = [
    { car: 0, bus: 0, truck: 0 },
    { car: 2, bus: 0, truck: 1 },
    { car: 5, bus: 1, truck: 1 },
  ];
  const form = { counts } as unknown as Form;
  it("are the run's totals at that frame", () => {
    expect(countsAt(form, 1)).toEqual(counts[1]);
  });
  it("before the footage starts, are the totals before anything was counted", () => {
    expect(countsAt(form, -1)).toEqual(counts[0]);
  });
  it("past the last frame, stay at the final totals", () => {
    expect(countsAt(form, 99)).toEqual(counts[2]);
  });
  it("are absent for a recording with no counter", () => {
    expect(countsAt({} as Form, 0)).toBeNull();
  });
});
