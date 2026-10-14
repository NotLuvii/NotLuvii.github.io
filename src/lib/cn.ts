import type { CSSProperties } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Typed escape hatch for CSS custom properties in style props. */
export const cssVars = (o: Record<string, string | number>) => o as CSSProperties;
