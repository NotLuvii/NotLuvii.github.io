import { Fragment, type CSSProperties } from "react";
import { arrow, box, tick } from "@/lib/ink";
import { Note } from "./Note";

/** What the sketch says, for screen readers: the intro sentence, as the sketch draws it. */
export const SKETCH_LABEL =
  "A sketch of what I do: front ends in React and TypeScript; SQL and Python, for automated reports and for data checked against its source.";

type Mark = { d: string[]; at: number };

/**
 * The first screen's picture: what I do, drawn by hand in the words of the intro (site.intro).
 * The marks draw themselves on arrival, one after another, and each label fades in after the
 * mark it belongs to (globals.css, "First screen"); at rest, all of it is simply there.
 */
export function WhatIDoSketch() {
  // In drawing order: each mark's paths, and the step (0.3s apart) it starts on.
  const marks: Mark[] = [
    { d: box(230, 74, 1), at: 0 },
    { d: box(230, 74, 2), at: 2 },
    { d: arrow([[240, 195], [300, 170], [350, 160]], 3), at: 3 },
    { d: arrow([[200, 244], [220, 320], [290, 352], [348, 352]], 5), at: 4 },
    { d: tick(40, 7), at: 6 },
  ];
  const offsets: [number, number][] = [
    [10, 20],
    [10, 170],
    [0, 0],
    [0, 0],
    [548, 318],
  ];
  // Each label: its lines, where its first line's baseline sits in the 600×440 drawing, and the step
  // it fades in on. Set as HTML, sized in container units (30 of 600 = 5cqw), so it scales with the
  // drawing and its computed size is the size you see.
  const labels: { lines: string[]; x: number; y: number; at: number; quiet?: boolean }[] = [
    { lines: ["front ends"], x: 34, y: 66, at: 1 },
    { lines: ["React ", "+ TypeScript"], x: 262, y: 52, at: 1, quiet: true },
    { lines: ["SQL + Python"], x: 34, y: 216, at: 3 },
    { lines: ["reports, ", "automated"], x: 362, y: 168, at: 4 },
    { lines: ["data, checked"], x: 362, y: 346, at: 5 },
    { lines: ["against its source"], x: 362, y: 380, at: 5 },
  ];

  return (
    <figure className="sketch">
      <Note className="sketch-note">what I do, roughly:</Note>
      <div role="img" aria-label={SKETCH_LABEL} className="sketch-board mt-3">
        <svg aria-hidden focusable="false" viewBox="0 0 600 440" className="absolute inset-0 h-full w-full overflow-visible">
          <g data-ink data-draw="load" className="sketch-marks">
            {marks.map((m, i) => (
              <g key={i} transform={`translate(${offsets[i][0]} ${offsets[i][1]})`}>
                {m.d.map((d, j) => (
                  <path key={j} d={d} pathLength={1} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ "--i": m.at + j * 0.4 } as CSSProperties} />
                ))}
              </g>
            ))}
          </g>
        </svg>
        {labels.map((l) => (
          <p
            key={l.lines.join("")}
            aria-hidden
            className={`sketch-label${l.quiet ? " sketch-label-quiet" : ""}`}
            style={{ left: `${(l.x / 600) * 100}%`, top: `${((l.y - 26) / 440) * 100}%`, "--at": l.at } as CSSProperties}
          >
            {l.lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        ))}
      </div>
    </figure>
  );
}
