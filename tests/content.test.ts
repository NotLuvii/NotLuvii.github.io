import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chapters, more, roles, site, thread } from "../src/content";

const manifest = (name: string) => JSON.parse(readFileSync(`public/sequences/${name}/manifest.json`, "utf8"));
const chapter = (id: string) => chapters.find((c) => c.id === id)!;

describe("the captions say what the recordings show", () => {
  it("scam detection: 100 out of 100, high risk, and the five rules in the tool's words", () => {
    const m = manifest("scam").result;
    expect(m.score).toBe("100");
    expect(m.level).toBe("High risk");
    const [, verdict, reasons] = chapter("scam-detection").moments;
    expect(verdict.text).toBe("100 out of 100: high risk.");
    expect(m.issues).toHaveLength(5);
    // "urgent wording, a generic greeting, a lookalike domain and a request to click or verify"
    expect(m.issues.filter((i: string) => i.startsWith("Urgency language")).length).toBeGreaterThan(0);
    expect(m.issues.some((i: string) => i.startsWith("Generic greeting"))).toBe(true);
    expect(m.issues.some((i: string) => i.startsWith("Suspicious domain-like text"))).toBe(true);
    expect(m.issues.some((i: string) => i.startsWith("Asks for sensitive info or to click/verify"))).toBe(true);
    expect(reasons.text).toContain("urgent wording, a generic greeting, a lookalike domain and a request to click or verify");
  });

  it("the thread's phrases are the ones the scam tool marked", () => {
    expect(thread.phrases).toEqual(manifest("scam").result.marks);
  });

  it("resume analyzer: the score and the missing skills are the recorded run's", () => {
    const m = manifest("resume").result;
    const [, score, missing] = chapter("resume-analyzer").moments;
    expect(score.text.startsWith(m.score + ":")).toBe(true);
    for (const s of m.missing) expect(missing.text).toContain(s);
    expect(missing.text).toContain(`${m.missing.slice(0, -1).join(", ")} and ${m.missing.at(-1)} are missing`);
  });

  it("the thread's skills are skills the resume matched in that run", () => {
    const matched = manifest("resume").result.matched;
    for (const s of thread.skills) expect(matched).toContain(s);
  });

  it("the vehicle counter credits its clip and states how it counts", () => {
    const c = chapter("vehicle-counter");
    expect(c.credit).toContain("Thomas1313");
    expect(c.credit).toContain("CC BY-SA 4.0");
    expect(c.credit).toContain("same licence");
    expect(c.limitation).toContain("counted twice");
  });
});

describe("the content", () => {
  it("has three chapters, in story order, each with three moments and a limitation", () => {
    expect(chapters.map((c) => c.id)).toEqual(["scam-detection", "resume-analyzer", "vehicle-counter"]);
    for (const c of chapters) {
      expect(c.moments).toHaveLength(3);
      expect(c.limitation.length).toBeGreaterThan(40);
      expect(c.recorded).toContain("redesign-2026");
    }
  });

  it("links each chapter's code to the redesign branch", () => {
    for (const c of chapters) expect(c.links[0].href).toMatch(/^https:\/\/github\.com\/NotLuvii\/[\w-]+\/tree\/redesign-2026$/);
  });

  it("only uses figures that come from the resume or the recordings", () => {
    const text = JSON.stringify({ chapters, more, roles, site });
    const figures = new Set(text.match(/\b\d+(\.\d+)?%/g));
    // 75%, 50% and 40% are on the resume; 60% is the recorded Resume Analyzer run.
    expect([...figures].sort()).toEqual(["40%", "50%", "60%", "75%"]);
  });

  it("keeps the resume file the links point to", () => {
    expect(existsSync(`public/${site.resume}`)).toBe(true);
  });

  it("keeps the old site's address for the resume, so links to it still work", () => {
    expect(site.resume).toBe("Luvneet_Bamrah_Resume.pdf");
  });
});

describe("the vehicle counter's numbers are the run's", () => {
  const m = JSON.parse(readFileSync("public/sequences/traffic/manifest.json", "utf8"));
  it("credits the clip as its manifest records it", () => {
    const c = chapters.find((c) => c.id === "vehicle-counter")!;
    expect(c.credit).toContain(m.source.author);
    expect(c.credit).toContain(m.source.licence);
    expect(c.credit).toContain(m.source.title);
  });
  it("only ever counts up, frame by frame", () => {
    const counts = m.desktop.counts as { car: number; bus: number; truck: number }[];
    for (let i = 1; i < counts.length; i++) for (const k of ["car", "bus", "truck"] as const) expect(counts[i][k]).toBeGreaterThanOrEqual(counts[i - 1][k]);
    expect(counts[0]).toEqual({ car: 0, bus: 0, truck: 0 });
  });
  it("was counted the way the app counts", () => {
    expect(m.result.model).toBe("yolov8l.pt");
    expect(m.result.tracker).toBe("DeepSORT max_age=30");
    expect(m.result.counting).toBe("each confirmed track ID once");
  });
});
