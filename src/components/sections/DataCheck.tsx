/**
 * The first screen's picture of what I do, drawn: a grid of bars (rows of data) with seven cells
 * ticked and one defect flagged in red (CSS: .data-check). It holds no numbers or records, so it
 * invents nothing, and it is decoration only (aria-hidden). It doesn't move. It shows wherever the
 * 3D field (DataField) can't run.
 */
const W = 600;
const H = 525;
const ROWS = 14;
const COLS = 9;
const PITCH_X = W / COLS;
const PITCH_Y = H / ROWS;
const BAR_H = 14;

/** [row, column] of the cells that pass, and of the one that doesn't. */
const TICKS = [[1, 2], [2, 8], [3, 6], [5, 1], [6, 4], [7, 0], [8, 7]] as const;
const DEFECT = [4, 3] as const;

const cell = (r: number, c: number) => ({ x: Math.round(c * PITCH_X + 4), y: Math.round(r * PITCH_Y + (PITCH_Y - BAR_H) / 2) });
/** Bars of three lengths, in a fixed pattern, so the grid reads as rows of values. */
const barWidth = (r: number, c: number) => 34 + ((r * 7 + c * 3) % 3) * 6;

export function DataCheck() {
  const bars = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const { x, y } = cell(r, c);
      bars.push(<rect key={`${r}-${c}`} x={x} y={y} width={barWidth(r, c)} height={BAR_H} rx={4} />);
    }
  const d = cell(...DEFECT);
  return (
    <div aria-hidden className="data-check">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" focusable="false">
        <g className="dc-bars">{bars}</g>
        <g className="dc-marks" data-signal="">
          {TICKS.map(([r, c]) => {
            const { x, y } = cell(r, c);
            return (
              <g key={`${r}-${c}`} className="dc-tick">
                <rect x={x} y={y} width={40} height={BAR_H} rx={4} fill="none" stroke="currentColor" strokeWidth={1.5} />
                <path d={`M${x + 47} ${y + 7}l4 4l8-9`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
          <g className="dc-defect">
            <rect x={d.x} y={d.y} width={46} height={BAR_H} rx={4} />
            <path d={`M${d.x + 53} ${d.y + 2}l8 10m0-10l-8 10`} fill="none" strokeWidth={2} strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
