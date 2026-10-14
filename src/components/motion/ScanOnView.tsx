"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Runs the scan (the amber line from the opening screen) over a project's picture once, as it
 * arrives on screen. The picture renders its own .scan-cover and .scan-beam; this only marks the
 * wrapper: data-scan="wait" (dimmed, ahead of the line) once the script runs, then "run" when at
 * least a third of it is in view. With reduced motion, or before or without JavaScript, nothing is
 * marked and the picture is simply shown.
 */
export function ScanOnView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.scan = "wait";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.scan = "run";
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-scan="" className={className}>
      {children}
    </div>
  );
}
