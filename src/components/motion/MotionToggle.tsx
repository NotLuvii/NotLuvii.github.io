"use client";

import { useSyncExternalStore } from "react";
import { motionPaused, setMotionPaused, subscribeMotion } from "@/lib/motion";

/**
 * Pauses the page's looping motion (the 3D field, its drawing, the marquee, the turning titles,
 * the tilt and the grid's glow), and remembers it (src/lib/motion.ts): the on-page way to stop
 * moving content that WCAG 2.2.2 asks for, besides the system's reduced-motion setting. It is a
 * toggle button (aria-pressed). It appears once the script runs; without JavaScript there is
 * nothing for it to stop but the CSS loops, which reduced motion still stops.
 */
export function MotionToggle() {
  const paused = useSyncExternalStore(subscribeMotion, motionPaused, () => null);
  if (paused === null) return null;
  return (
    <button type="button" aria-pressed={paused} onClick={() => setMotionPaused(!paused)} className="motion-toggle">
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
        {paused ? <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />}
      </svg>
      Pause motion
    </button>
  );
}
