import type { CSSProperties } from "react";

/**
 * Renders marks from src/lib/ink.ts (paths drawn for a w×h box) as an SVG that stretches to its
 * container. Hidden from screen readers: a mark only points at something that is already text.
 * `draw` picks how it appears when motion is allowed (globals.css, "Ink"): "load" draws it in
 * once on arrival, "view" as it scrolls into view, "none" never; at rest it is always drawn.
 * No rough.js here, so client components can use it with paths passed in as props.
 */
export function Ink({
  paths,
  w,
  h,
  draw = "view",
  className,
  style,
}: {
  paths: string[];
  w: number;
  h: number;
  draw?: "view" | "load" | "none";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg aria-hidden focusable="false" data-ink data-draw={draw} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} style={style}>
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ "--i": i } as CSSProperties} />
      ))}
    </svg>
  );
}
