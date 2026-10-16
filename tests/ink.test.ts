/**
 * The ink: hand-drawn marks made by rough.js at build time, from fixed seeds, so every build draws
 * the same lines. See src/lib/ink.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ring, spine, underline } from "@/lib/ink";

const kinds: Record<string, () => string[]> = {
  ring: () => ring(100, 50, 3),
  underline: () => underline(200, 4),
  spine: () => spine(1000, 31),
};

describe("ink", () => {
  it("each kind draws paths, the same every time", () => {
    for (const [name, draw] of Object.entries(kinds)) {
      const first = draw();
      expect(first.length, name).toBeGreaterThan(0);
      for (const d of first) expect(d, name).toMatch(/^M/);
      expect(draw(), name).toEqual(first);
    }
  });

  it("seeds change the line", () => {
    expect(ring(100, 50, 1)).not.toEqual(ring(100, 50, 2));
  });

  it("marks stay near their box", () => {
    const numbers = ring(100, 50, 3)
      .join(" ")
      .match(/-?\d+(\.\d+)?/g)!
      .map(Number);
    for (const n of numbers) {
      expect(n).toBeGreaterThanOrEqual(-12);
      expect(n).toBeLessThanOrEqual(112);
    }
  });

  it("the CSS underline is the drawn one", () => {
    const svg = readFileSync(join(process.cwd(), "public/ink/underline.svg"), "utf8");
    expect(svg).toContain('stroke="#ffb000"');
    for (const d of underline(200, 4)) expect(svg).toContain(d);
  });
});
