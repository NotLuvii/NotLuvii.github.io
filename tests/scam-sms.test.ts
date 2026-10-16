/**
 * The scam tool's own text-message rules, copied from Fraud-Detection-Tool (js/detectors.js), as
 * the home page runs them on a visitor's text. See src/lib/scam-sms.ts.
 */
import { describe, expect, it } from "vitest";
import { featured } from "@/content/projects";
import { checkSms, markRanges, sms } from "@/lib/scam-sms";

const story = featured[0].story!;

describe("scam rules", () => {
  it("scores the README sample like the story: 94, High, the story's rules in order", () => {
    const result = checkSms(story.text);
    expect(result.risk).toBe(94);
    expect(result.level).toBe("high");
    expect(result.issues.map((i) => i.msg)).toEqual(story.steps.map((s) => s.rule));
  });

  it("gives the same answer every time (the original's global regex is reset)", () => {
    expect(checkSms("see bit.ly/x").risk).toBe(25);
    checkSms("hi");
    expect(checkSms("see bit.ly/x").risk).toBe(25);
    expect(checkSms("see bit.ly/x").risk).toBe(25);
  });

  it("nothing to check gives 0, Low", () => {
    for (const text of ["", "   \n"]) expect(checkSms(text)).toEqual({ risk: 0, level: "low", issues: [] });
  });

  it("levels follow the tool's thresholds", () => {
    expect(checkSms("urgent")).toMatchObject({ risk: 18, level: "low" });
    expect(checkSms("urgent your bank")).toMatchObject({ risk: 36, level: "medium" });
    expect(checkSms("urgent your bank verify refund")).toMatchObject({ risk: 72, level: "high" });
  });

  it("marks every phrase that fired, merged and in order", () => {
    const ranges = markRanges(story.text, checkSms(story.text));
    for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBeGreaterThan(ranges[i - 1][1]);
    const marked = ranges.map(([a, b]) => story.text.slice(a, b).toLowerCase()).join(" | ");
    for (const s of story.steps) for (const word of s.phrase.toLowerCase().split(" ")) expect(marked).toContain(word);
    expect(markRanges("claim your prize now", checkSms("claim your prize now"))).toEqual([[0, 16]]);
  });

  it("keeps the tool's own phrase list", () => {
    expect(sms.scamPhrases).toHaveLength(27);
    expect(sms.scamPhrases.slice(0, 3)).toEqual(["you have won", "you won", "congratulations you"]);
  });
});
