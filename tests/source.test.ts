import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inputs } from "../src/content";
import { logLine, pieces, type TrackLog } from "../src/source";
import { fade } from "../src/trail";

const manifest = (name: string) => JSON.parse(readFileSync(`public/sequences/${name}/manifest.json`, "utf8"));
const recorded = (name: string) => {
  const src = readFileSync("tools/record-web.mjs", "utf8");
  const m = src.match(new RegExp(`const ${name} =\\s*("(?:[^"\\\\]|\\\\.)*")`));
  return JSON.parse(m![1]) as string;
};

describe("the faint source text is the tools' real input", () => {
  it("uses the email and the posting the apps were recorded with", () => {
    expect(inputs.email).toBe(recorded("EMAIL"));
    expect(inputs.posting).toBe(recorded("POSTING"));
  });

  it("takes the tracker log from the counter's run, for the frames the story shows", () => {
    const log: TrackLog = JSON.parse(readFileSync("public/sequences/traffic/log.json", "utf8"));
    const m = manifest("traffic");
    expect(log.source).toBe(m.source.title);
    expect(log.model).toBe(m.result.model);
    expect(log.tracker).toBe(m.result.tracker);
    expect(log.lines.length).toBeGreaterThan(100);
    const frames = new Set(m.sourceFrames);
    for (const l of log.lines) {
      expect(frames.has(l.frame)).toBe(true);
      expect(["car", "bus", "truck"]).toContain(l.cls);
    }
  });

  it("writes a log line the way a tracker prints it", () => {
    expect(logLine({ frame: 3, cls: "bus", id: "1", box: [321, 521, 408, 608] })).toBe("0003  bus    ID 1    [321 521 408 608]");
  });
});

describe("splitting the text into marked and plain runs", () => {
  it("marks each phrase the tool caught, and nothing else", () => {
    expect(pieces("Dear Customer, verify immediately.", ["Dear Customer", "immediately"])).toEqual([
      { text: "Dear Customer", mark: true },
      { text: ", verify ", mark: false },
      { text: "immediately", mark: true },
      { text: ".", mark: false },
    ]);
  });

  it("marks whole words only, so React is not found inside Reactive", () => {
    expect(pieces("Reactive React", ["React"])).toEqual([
      { text: "Reactive ", mark: false },
      { text: "React", mark: true },
    ]);
  });

  it("leaves text with nothing to mark as one plain run", () => {
    expect(pieces("0003  bus", [])).toEqual([{ text: "0003  bus", mark: false }]);
  });
});

describe("the cursor's track", () => {
  it("fades from full to nothing over its life", () => {
    expect(fade(0, 1600)).toBe(1);
    expect(fade(800, 1600)).toBeCloseTo(0.5);
    expect(fade(1600, 1600)).toBe(0);
    expect(fade(5000, 1600)).toBe(0);
  });
});
