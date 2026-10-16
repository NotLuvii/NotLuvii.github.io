// Server only: runs at build time. Client components get the paths as props, never this module.
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

/**
 * The ink: the site's hand-drawn marks, made with rough.js (MIT) at build time. Each function
 * returns SVG path `d` strings for a box of the given size, drawn from a fixed seed, so every
 * build draws the same lines and no drawing library reaches the browser. components/ink/Ink.tsx
 * renders them; globals.css ("Ink") colours them amber and draws them in.
 */
export type Pt = [number, number];

const generator = rough.generator();
const loose = (seed: number): Options => ({ seed, roughness: 1.1, bowing: 1.2 });
const steady = (seed: number): Options => ({ seed, roughness: 0.6, bowing: 1.2 });

const paths = (drawable: ReturnType<typeof generator.path>) => generator.toPaths(drawable).map((p) => p.d);

/** A loose oval inside a w×h box, for ringing a figure. */
export function ring(w: number, h: number, seed: number): string[] {
  return paths(generator.ellipse(w / 2, h / 2, w - 6, h - 6, loose(seed)));
}

/** A slightly wavy stroke under a phrase, inside w×12. */
export function underline(w: number, seed: number): string[] {
  return paths(
    generator.curve(
      [
        [2, 8],
        [w * 0.3, 5],
        [w * 0.65, 9],
        [w - 2, 4],
      ],
      steady(seed),
    ),
  );
}

/** A curve through the points, with an arrowhead at the last one. */
export function arrow(points: Pt[], seed: number): string[] {
  const [x, y] = points[points.length - 1];
  const [px, py] = points[points.length - 2];
  const angle = Math.atan2(y - py, x - px);
  const head = (turn: number): Pt => [x + 14 * Math.cos(angle + turn), y + 14 * Math.sin(angle + turn)];
  return [...paths(generator.curve(points, steady(seed))), ...paths(generator.linearPath([head(2.6), [x, y], head(-2.6)], steady(seed + 1)))];
}

/** A tick, in a size×size box. */
export function tick(size: number, seed: number): string[] {
  return paths(
    generator.linearPath(
      [
        [size * 0.05, size * 0.55],
        [size * 0.38, size * 0.9],
        [size * 0.95, size * 0.05],
      ],
      steady(seed),
    ),
  );
}

/** A box, inset 4 from a w×h frame. */
export function box(w: number, h: number, seed: number): string[] {
  return paths(generator.rectangle(4, 4, w - 8, h - 8, loose(seed)));
}

/** The timeline's spine: a near-vertical line at x=10 in a 20×h frame. */
export function spine(h: number, seed: number): string[] {
  return paths(generator.line(10, 2, 10, h - 2, steady(seed)));
}

/** A left square bracket in a 12×h frame, for marking lines of code. */
export function bracket(h: number, seed: number): string[] {
  return paths(
    generator.linearPath(
      [
        [11, 1],
        [2, 1],
        [2, h - 1],
        [11, h - 1],
      ],
      steady(seed),
    ),
  );
}
