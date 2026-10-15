import { describe, expect, it } from "vitest";
import { heroRecording } from "@/content/projects";
import { recordingSource } from "@/components/motion/recording";

describe("recordingSource", () => {
  it("picks the crop for the screen and a format the browser plays", () => {
    expect(recordingSource(heroRecording, true, true)).toBe("/images/scam-detection/recording-phone.webm");
    expect(recordingSource(heroRecording, false, false)).toBe("/images/scam-detection/recording-desktop.mp4");
  });
});
