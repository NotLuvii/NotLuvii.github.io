/**
 * The 3D data field's layout, kept apart from three.js so it can be tested: a field of bars (rows
 * of data) and the marks on it, seven cells checked and one defect. Fixed patterns only: it
 * invents no data.
 */

/** Columns and rows: Fibonacci numbers. */
export const COLS = 13;
export const ROWS = 21;

/** One of three heights, in a fixed pattern, so the field reads as rows of values. */
export function barHeight(r: number, c: number): number {
  return [0.6, 1, 1.4][(r * 7 + c * 3) % 3];
}

export type Mark = { row: number; col: number; kind: "tick" | "defect" };

/** Seven cells that pass and one that doesn't: 8 marks. */
export const MARKS: Mark[] = [
  { row: 2, col: 3, kind: "tick" },
  { row: 3, col: 11, kind: "tick" },
  { row: 5, col: 8, kind: "tick" },
  { row: 6, col: 4, kind: "defect" },
  { row: 7, col: 1, kind: "tick" },
  { row: 9, col: 6, kind: "tick" },
  { row: 10, col: 0, kind: "tick" },
  { row: 12, col: 10, kind: "tick" },
];
