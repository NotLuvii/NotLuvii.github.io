// Server only: runs at build time. Client components get the paths as props, never this module.
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

/**
 * The ink: the site's hand-drawn marks, made with rough.js (MIT) at build time. Each function
 * returns SVG path `d` strings for a box of the given size, drawn from a fixed seed, so every
 * build draws the same lines and no drawing library reaches the browser. components/ink/Ink.tsx
 * renders them; globals.css ("Ink") colours them amber and draws them in.
 */
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
