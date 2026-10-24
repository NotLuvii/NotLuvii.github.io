import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { check, SAMPLES } from "../src/checker";

// The tool's rules, a verbatim copy, loaded the way the page loads them (a classic script).
const rules = new Function(readFileSync("public/vendor/detectors.js", "utf8") + "\nreturn Detectors;")();

describe("the checker runs the tool's own rules", () => {
  it("scores the README's phishing email as the recording shows: 100, high risk, five reasons", () => {
    const r = check(rules, "phishing", SAMPLES.phishing)!;
    expect(r.risk).toBe(100);
    expect(r.level).toBe("high");
    expect(r.issues).toHaveLength(5);
  });

  it("gives the same answer every time (the tool's global regular expressions are reset)", () => {
    const listing = "Selling bike $50, contact me";
    const first = check(rules, "listing", listing)!;
    for (let i = 0; i < 3; i++) expect(check(rules, "listing", listing)).toEqual(first);
    const sms = check(rules, "sms", SAMPLES.sms)!;
    expect(check(rules, "sms", SAMPLES.sms)).toEqual(sms);
  });

  it("treats text with spaces as not a valid link, in every browser", () => {
    expect(check(rules, "link", "not a url at all")).toEqual({ risk: 100, level: "high", issues: [{ type: "invalid", msg: "This is not a valid URL." }] });
  });

  it("gives no result for an empty field", () => {
    expect(check(rules, "phishing", "   ")).toBeNull();
  });

  it("matches the tool's own copy of the rules", () => {
    const tool = readFileSync(process.env.SCAM_TOOL_DETECTORS ?? "public/vendor/detectors.js", "utf8");
    expect(readFileSync("public/vendor/detectors.js", "utf8")).toBe(tool);
  });
});
