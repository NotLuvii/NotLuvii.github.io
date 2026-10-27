import { describe, expect, it } from "vitest";
import { greeting, roles, site } from "../src/content";
import { countFor, links } from "../src/field";
import { frame, plan } from "../src/greeting";

/** A repeatable stand-in for Math.random. */
const seeded = (seed = 7) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

describe("the greeting", () => {
  it("starts and ends on the name, and every phrase is true to the resume or the site", () => {
    expect(greeting.lead).toBe("Hi, I am");
    expect(greeting.phrases[0]).toBe("Luvneet.");
    expect(greeting.phrases).toContain(`a ${roles.find((r) => r.organization === "SafeTrack")!.title.toLowerCase()}.`);
    expect(greeting.phrases).toContain(`a ${site.role.toLowerCase()}.`);
    expect(greeting.phrases).toContain("a problem solver.");
    expect(new Set(greeting.phrases).size).toBe(greeting.phrases.length);
  });

  it("names the whole sequence for screen readers, in one sentence that doesn't change", () => {
    expect(greeting.label).toBe("Hi, I am Luvneet Bamrah: a front end developer, a problem solver and a software engineer.");
  });
});

describe("scrambling one phrase into the next", () => {
  const p = plan("Luvneet.", "a problem solver.", seeded());

  it("shows the first phrase at the start and the second at the end", () => {
    expect(frame(p, 0, seeded()).text).toBe("Luvneet.");
    expect(frame(p, 1, seeded()).text).toBe("a problem solver.");
  });

  it("is random characters in between, never longer than the longer phrase", () => {
    const mid = frame(p, 0.5, seeded());
    expect(mid.text.length).toBeLessThanOrEqual("a problem solver.".length);
    expect(mid.scrambled.some(Boolean)).toBe(true);
    expect(mid.text).not.toBe("Luvneet.");
    expect(mid.text).not.toBe("a problem solver.");
  });

  it("settles each character for good: once a position has landed it stays", () => {
    const to = "a problem solver.";
    let landed: number[] = [];
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const f = frame(p, Math.min(1, t), seeded());
      for (const i of landed) expect(f.chars[i]).toBe(to[i] ?? "");
      landed = p.end.map((e, i) => (t >= e ? i : -1)).filter((i) => i >= 0);
    }
  });
});

describe("the field of dots", () => {
  it("scales with the screen, within limits", () => {
    expect(countFor(390, 844)).toBeGreaterThanOrEqual(24);
    expect(countFor(390, 844)).toBeLessThan(countFor(1440, 900));
    expect(countFor(3840, 2160)).toBe(110);
    expect(countFor(200, 200)).toBe(24);
  });

  it("links only dots that are close, more strongly the closer they are", () => {
    const dots = [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 90, y: 0 },
      { x: 400, y: 0 },
    ];
    const l = links(dots, 100);
    const pair = (i: number, j: number) => l.find((x: [number, number, number]) => x[0] === i && x[1] === j);
    expect(pair(0, 3)).toBeUndefined();
    expect(pair(0, 1)![2]).toBeGreaterThan(pair(0, 2)![2]);
    for (const [, , s] of l) {
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});

describe("scroll animation helpers", () => {
  it("staggers items: the first starts at once, the last finishes at the end, each in order", async () => {
    const { stagger } = await import("../src/reveal");
    expect(stagger(0, 0, 4)).toBe(0);
    expect(stagger(1, 3, 4)).toBe(1);
    expect(stagger(0.2, 0, 4)).toBeGreaterThan(stagger(0.2, 1, 4));
    expect(stagger(0.2, 3, 4)).toBe(0);
    expect(stagger(0.5, 0, 1)).toBe(0.5);
    // Many items still each get a real span of the scroll, never a jump.
    for (let i = 0; i < 40; i++) expect(stagger(0.999, i, 40)).toBeGreaterThan(0.9);
  });

  it("counts a figure up from 0 to its value, ending exactly on it", async () => {
    const { countTo } = await import("../src/reveal");
    expect(countTo(75, 0)).toBe(0);
    expect(countTo(75, 1)).toBe(75);
    const mid = countTo(75, 0.5);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(75);
  });

  it("mixes the dim and the lit text colours", async () => {
    const { mix } = await import("../src/reveal");
    expect(mix([134, 134, 139], [245, 245, 247], 0)).toBe("rgb(134, 134, 139)");
    expect(mix([134, 134, 139], [245, 245, 247], 1)).toBe("rgb(245, 245, 247)");
    expect(mix([0, 0, 0], [100, 100, 100], 0.5)).toBe("rgb(50, 50, 50)");
  });
});
