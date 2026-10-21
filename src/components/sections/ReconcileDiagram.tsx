import type { CSSProperties } from "react";

/**
 * The first screen's picture of the work the resume describes: report figures checked against the
 * source system, row by row, and the one that doesn't match traced to its root cause. Report bars
 * end at the middle and source bars start there, so a row that matches is the same length on
 * both sides; seven rows match and get an amber tick, one doesn't and gets a red flag, and a red
 * line traces it to a box labelled "Root cause". It holds no numbers, so it invents nothing.
 *
 * The drawing is an aria-hidden SVG; the labels are HTML, placed over it in percentages of its
 * 400 by 200 box (the "Root cause" label fills the box drawn for it), and the caption says what it
 * shows. Motion (CSS: .rc-*): once, on load, the ticks appear row by row, then the flag, then the
 * trace draws, in about two seconds. With reduced motion or motion paused it is simply finished.
 */
const W = 400;
const H = 200;
/** Report bars end here; source bars start here; the tick or flag sits between. */
const REPORT_END = 100;
const SOURCE_START = 156;
const MARK_X = 128;
const FIRST_ROW = 38;
const PITCH = 21;
const BAR_H = 10;
/** The root-cause box, in the drawing's units. */
const CAUSE = { x: 276, y: 150, w: 124, h: 40 };

/** Each row's report and source lengths: equal where the figures match. Row 5 doesn't. */
const ROWS = [
  [92, 92],
  [64, 64],
  [84, 84],
  [74, 74],
  [92, 58],
  [80, 80],
  [56, 56],
  [70, 70],
] as const;
const FLAGGED = 4;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function ReconcileDiagram() {
  let tick = 0;
  const flagY = FIRST_ROW + FLAGGED * PITCH;
  const traceFrom = SOURCE_START + ROWS[FLAGGED][1] + 8;
  const causeMid = CAUSE.x + CAUSE.w / 2;
  return (
    <figure className="reconcile">
      <div className="rc-board">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden focusable="false">
          {ROWS.map(([report, source], i) => {
            const y = FIRST_ROW + i * PITCH;
            const flagged = i === FLAGGED;
            return (
              <g key={i} className="rc-row">
                <rect className="rc-bar" x={REPORT_END - report} y={y - BAR_H / 2} width={report} height={BAR_H} rx={3} />
                <rect className="rc-bar" x={SOURCE_START} y={y - BAR_H / 2} width={source} height={BAR_H} rx={3} />
                <path className={flagged ? "rc-link rc-link-off" : "rc-link"} d={`M${REPORT_END + 6} ${y}H${MARK_X - 9}M${MARK_X + 9} ${y}H${SOURCE_START - 6}`} />
                {flagged ? (
                  <path className="rc-flag" d={`M${MARK_X - 5} ${y - 5}l10 10m0-10l-10 10`} />
                ) : (
                  <path className="rc-tick" data-signal="" style={{ "--i": tick++ } as CSSProperties} d={`M${MARK_X - 6} ${y}l4 4l8-9`} />
                )}
              </g>
            );
          })}
          <path className="rc-trace" pathLength={1} d={`M${traceFrom} ${flagY}H${causeMid}V${CAUSE.y}`} />
          <rect className="rc-cause-box" x={CAUSE.x + 0.75} y={CAUSE.y + 0.75} width={CAUSE.w - 1.5} height={CAUSE.h - 1.5} rx={6} />
        </svg>
        <span className="rc-label" style={{ right: pct(W - REPORT_END, W) }}>
          Report
        </span>
        <span className="rc-label" style={{ left: pct(SOURCE_START, W) }}>
          Source
        </span>
        <span className="rc-cause" style={{ left: pct(CAUSE.x, W), top: pct(CAUSE.y, H), width: pct(CAUSE.w, W), height: pct(CAUSE.h, H) }}>
          Root cause
        </span>
      </div>
      <figcaption className="type-small mt-f13 text-text-3">
        Report figures checked against the source system, row by row; the one that doesn&apos;t match is traced to its root cause.
      </figcaption>
    </figure>
  );
}
