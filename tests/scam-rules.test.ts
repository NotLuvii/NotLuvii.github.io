/**
 * The scam tool's four detectors, copied from Fraud-Detection-Tool (js/detectors.js at 558fa66), as
 * the home page's checker runs them. The expected values were produced by running the tool's own
 * file on each input. See src/lib/scam-rules.ts.
 */
import { describe, expect, it } from "vitest";
import { checkScam, Detectors, DETECTOR_LINES, markRanges, SAMPLES, type ScamKind } from "@/lib/scam-rules";

const sample = (id: string) => SAMPLES.find((s) => s.id === id)!;
const msgs = (kind: ScamKind, text: string) => checkScam(kind, text)!.issues.map((i) => i.msg);

describe("scam rules", () => {
  it("offers the README's five samples, verbatim", () => {
    expect(SAMPLES.map((s) => [s.id, s.label, s.kind])).toEqual([
      ["email", "Phishing email", "email"],
      ["text", "Scam text", "text"],
      ["listing", "Fake listing", "listing"],
      ["lookalike", "Lookalike link", "link"],
      ["official", "Real link", "link"],
    ]);
    expect(sample("email").text).toBe(
      "Dear Customer, Your account has been suspended due to unusual activity.\nVerify your identity immediately: https://paypal-secure.com/verify-now\nClick here to restore access. Do not ignore this message.",
    );
    expect(sample("text").text).toBe("URGENT: Your bank detected unusual activity. Confirm now: https://bit.ly/xy7z\nReply YES to secure your account.");
    expect(sample("listing").text).toBe("iPhone 15 Pro - brand new, must sell today. Moving overseas.\nContact me on WhatsApp. Wire transfer or Western Union only. Price negotiable.");
    expect(sample("lookalike").text).toBe("https://paypal-secure.com/verify-now");
    expect(sample("official").text).toBe("https://www.amazon.com/");
  });

  it("the README's samples score as the tool scores them", () => {
    expect(checkScam("email", sample("email").text)).toMatchObject({ risk: 100, level: "high" });
    expect(msgs("email", sample("email").text)).toEqual([
      'Urgency language: "immediately"',
      'Urgency language: "click here to restore"',
      'Generic greeting (e.g. "Dear Customer")',
      'Suspicious domain-like text: "paypal-secure"',
      "Asks for sensitive info or to click/verify",
    ]);
    expect(checkScam("text", sample("text").text)).toMatchObject({ risk: 94, level: "high" });
    expect(msgs("text", sample("text").text)).toEqual([
      'Scam-like phrase: "urgent"',
      'Scam-like phrase: "your bank"',
      'Scam-like phrase: "unusual activity"',
      "Shortened URL - often used in SMS scams",
      "Asks you to reply to confirm - common in subscription fraud",
    ]);
    expect(checkScam("listing", sample("listing").text)).toMatchObject({ risk: 100, level: "high" });
    expect(msgs("listing", sample("listing").text)).toEqual([
      'Listing red flag: "wire transfer"',
      'Listing red flag: "western union"',
      'Listing red flag: "whatsapp"',
      'Listing red flag: "must sell today"',
      'Listing red flag: "moving overseas"',
      'Very short ad with "negotiable" or "OBO" - rush to move off platform',
    ]);
    expect(checkScam("link", sample("lookalike").text)).toMatchObject({ risk: 70, level: "high" });
    expect(msgs("link", sample("lookalike").text)).toEqual([
      "Brand name with hyphen and extra word (e.g. amazon-secure.com) — often fake.",
      "URL path suggests login/verify/account — risky if domain is not official.",
    ]);
    expect(checkScam("link", sample("official").text)).toMatchObject({ risk: 0, level: "low" });
    expect(msgs("link", sample("official").text)).toEqual(["Recognized official domain: amazon.com"]);
  });

  it("every kind gives the same result twice (the tool itself gives 32, then 12)", () => {
    const cases: [ScamKind, string][] = [
      ...SAMPLES.map((s) => [s.kind, s.text] as [ScamKind, string]),
      ["listing", "Selling bike $50, contact me"],
      ["text", "Your code 12345 and 67890 bit.ly"],
    ];
    for (const [kind, text] of cases) {
      const first = checkScam(kind, text);
      expect(checkScam(kind, text), `${kind}: ${text}`).toEqual(first);
    }
    expect(checkScam("listing", "Selling bike $50, contact me")!.risk).toBe(32);
  });

  it("an empty field is no result", () => {
    for (const kind of ["email", "text", "listing", "link"] as const) {
      expect(checkScam(kind, "")).toBeNull();
      expect(checkScam(kind, "   \n")).toBeNull();
    }
  });

  it("an invalid link is the tool's own message", () => {
    expect(checkScam("link", "not a url at all")).toEqual({ risk: 100, level: "high", issues: [{ type: "invalid", msg: "This is not a valid URL." }] });
  });

  it("levels follow the tool's thresholds for a text message", () => {
    expect(checkScam("text", "urgent")).toMatchObject({ risk: 18, level: "low" });
    expect(checkScam("text", "urgent your bank")).toMatchObject({ risk: 36, level: "medium" });
    expect(checkScam("text", "urgent your bank verify refund")).toMatchObject({ risk: 72, level: "high" });
  });

  it("marks every phrase that fired in a text message, merged and in order", () => {
    const text = sample("text").text;
    const ranges = markRanges("text", text, checkScam("text", text)!);
    for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBeGreaterThan(ranges[i - 1][1]);
    const marked = ranges.map(([a, b]) => text.slice(a, b).toLowerCase());
    expect(marked).toEqual(["urgent", "your bank", "unusual activity", "bit.ly", "reply", "yes"]);
    expect(markRanges("text", "claim your prize now", checkScam("text", "claim your prize now")!)).toEqual([[0, 16]]);
  });

  it("marks the quoted phrases for the other kinds", () => {
    const listing = sample("listing").text;
    const marked = markRanges("listing", listing, checkScam("listing", listing)!).map(([a, b]) => listing.slice(a, b).toLowerCase());
    expect(marked).toContain("wire transfer");
    expect(marked).toContain("negotiable");
    const email = sample("email").text;
    const emailMarked = markRanges("email", email, checkScam("email", email)!).map(([a, b]) => email.slice(a, b).toLowerCase());
    expect(emailMarked).toEqual(expect.arrayContaining(["dear customer", "immediately", "paypal-secure", "click here to restore"]));
  });

  it("keeps the tool's own lists and points at their lines", () => {
    expect(Detectors.sms.scamPhrases).toHaveLength(27);
    expect(Detectors.sms.scamPhrases.slice(0, 3)).toEqual(["you have won", "you won", "congratulations you"]);
    expect(Detectors.phishing.urgencyWords).toHaveLength(13);
    expect(Detectors.listing.redFlags).toHaveLength(23);
    expect(Detectors.link.officialDomains).toHaveLength(38);
    expect(DETECTOR_LINES).toEqual({ email: [7, 76], text: [79, 126], listing: [129, 177], link: [180, 310] });
  });
});
