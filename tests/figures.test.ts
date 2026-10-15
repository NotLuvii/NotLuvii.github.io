import { describe, expect, it } from "vitest";
import { figureClaim } from "@/components/ui/Figures";

describe("figureClaim", () => {
  it("splits a resume bullet that opens with a claim and its figure", () => {
    expect(figureClaim("Increased route data accuracy by 75% through systematic data validation and alignment of system logic.")).toEqual({
      figure: "75%",
      claim: "Increased route data accuracy",
    });
    expect(figureClaim("Reduced delivery delays by 50% by optimizing front-end workflows and presenting data more clearly.")).toEqual({
      figure: "50%",
      claim: "Reduced delivery delays",
    });
  });

  it("returns null for a sentence without a figure", () => {
    expect(figureClaim("Built real-time tracking and monitoring workflows on AWS API Gateway WebSockets, streaming live driver and location updates.")).toBeNull();
  });
});
