import { describe, expect, it } from "vitest";
import { formatClock } from "@/lib/clock";

describe("the first screen's clock", () => {
  it("formats Fredericton time in summer and winter", () => {
    expect(formatClock(new Date("2026-07-01T17:41:00Z"))).toBe("2:41 pm ADT");
    expect(formatClock(new Date("2026-01-15T18:05:00Z"))).toBe("2:05 pm AST");
  });

  it("writes the morning in lower case too, and keeps a zone it is given", () => {
    expect(formatClock(new Date("2026-07-01T12:07:00Z"))).toBe("9:07 am ADT");
    expect(formatClock(new Date("2026-07-01T17:41:00Z"), "UTC")).toBe("5:41 pm UTC");
  });
});
