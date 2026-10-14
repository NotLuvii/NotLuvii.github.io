import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { site, nav } from "@/content/site";
import { projects, RELEVANCE } from "@/content/projects";
import { highlights } from "@/content/highlights";
import { numbers, footnotes } from "@/content/numbers";
import { roles, education, toolkit } from "@/content/experience";
import { evidence, STATUS } from "@/content/evidence";
import { VISUAL_KEYS } from "@/components/visuals/keys";

const root = resolve(__dirname, "..");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

describe("projects", () => {
  it("covers all eight projects, each once", () => {
    expect(projects).toHaveLength(8);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(8);
  });

  it("puts the work closest to quality and data first", () => {
    const ranks = projects.map((p) => RELEVANCE[p.relevance].rank);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    expect(projects.slice(0, 4).every((p) => p.relevance === "quality")).toBe(true);
  });

  it("gives every project a drawing that exists, a summary and a reason it matters", () => {
    for (const p of projects) {
      expect(VISUAL_KEYS, p.slug).toContain(p.visual);
      expect(p.summary.length, p.slug).toBeGreaterThan(40);
      expect(p.why.length, p.slug).toBeGreaterThan(20);
    }
  });

  it("only shows a figure where it is sourced, and says where", () => {
    for (const p of projects) if (p.figure) expect(p.figure.source.length, p.slug).toBeGreaterThan(5);
  });

  it("uses each drawing at most once", () => {
    expect(new Set(projects.map((p) => p.visual)).size).toBe(projects.length);
  });
});

describe("highlights", () => {
  it("has a handful of cards, each with a headline and a line of proof", () => {
    expect(highlights.length).toBeGreaterThanOrEqual(4);
    expect(highlights.length).toBeLessThanOrEqual(7);
    for (const h of highlights) {
      expect(h.title.length).toBeGreaterThan(5);
      expect(h.body.length).toBeGreaterThan(40);
      expect(h.source.length).toBeGreaterThan(3);
    }
  });
});

describe("numbers", () => {
  it("shows the three measured results from the résumé, each with its footnote", () => {
    expect(numbers.map((n) => n.value)).toEqual([75, 50, 40]);
    for (const n of numbers) {
      expect(footnotes[n.footnote - 1], n.label).toBeDefined();
    }
  });

  it("ties each number to a role or project on the page", () => {
    const names = [...roles.map((r) => r.organization), ...projects.map((p) => p.title)];
    for (const n of numbers) expect(names, n.label).toContain(n.from);
  });
});

describe("experience", () => {
  it("lists the three roles newest first, then the degree", () => {
    expect(roles.map((r) => r.organization)).toEqual(["AiKnod", "SafeTrack", "Immensa Tech"]);
    expect(education.school).toBe("University of New Brunswick");
    expect(toolkit.length).toBeGreaterThanOrEqual(3);
  });
});

describe("evidence", () => {
  it("uses only known statuses", () => {
    for (const e of evidence) expect(Object.keys(STATUS)).toContain(e.status);
  });

  it("no longer points at the inspection demo, which has been removed", () => {
    const text = JSON.stringify(evidence).toLowerCase();
    for (const gone of ["inspection station", "demo", "batch checker", "this page"]) expect(text).not.toContain(gone);
  });
});

describe("a tailored portfolio stands alone", () => {
  it("has no link or reference to the main portfolio anywhere in the source", () => {
    const offenders = files(join(root, "src"))
      .filter((f) => /\.(ts|tsx|css|json|txt)$/.test(f))
      .filter((f) => /main ?portfolio|wind tunnel|luvneetbamrah\.com/i.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("navigates only within the page", () => {
    for (const n of nav) expect(n.href.startsWith("#")).toBe(true);
    expect(site.email).toContain("@");
  });
});
