"use client";

import type { ComponentProps } from "react";

/**
 * A list that scrolls sideways (More projects on a phone). When Tab moves focus to a link in a
 * tile that's only partly on screen, the browser leaves it there; this brings the whole tile into
 * view, and the row then snaps to it.
 */
export function FocusRow({ children, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      onFocus={(e) => {
        (e.target as HTMLElement).closest("li")?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }}
    >
      {children}
    </ul>
  );
}
