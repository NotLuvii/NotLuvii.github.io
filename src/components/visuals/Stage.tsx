"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotionPreference";
import { ARTIFACT } from "@/lib/mode";
import { visuals, type StageKey } from "./registry";

/**
 * Hosts a drawing. The first time it scrolls into view its strokes draw in (data-active), and its
 * loops (pulses, playheads) run only while it stays on screen.
 */
export function Stage({ visual, className, children }: { visual: StageKey; className?: string; children?: ReactNode }) {
  const Visual = visuals[visual];
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [seen, setSeen] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-active={ARTIFACT || seen || reduced} className={cn("relative", className)}>
      <Visual active={onScreen} reduced={reduced} />
      {children}
    </div>
  );
}
