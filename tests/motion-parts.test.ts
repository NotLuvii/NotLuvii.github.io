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
