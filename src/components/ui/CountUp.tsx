"use client";

import { useEffect, useRef, useState } from "react";
import { countAt } from "@/lib/count";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotionPreference";
import { ARTIFACT } from "@/lib/mode";

/**
 * A figure that counts up from zero the first time it is seen. The server renders the final value,
 * screen readers always get the final value, and reduced motion skips the count.
 */
export function CountUp({ value, suffix = "", duration = 1400, className }: { value: number; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(value);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || ARTIFACT || done.current) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        done.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = (now - start) / duration;
          setShown(countAt(value, t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    // Start from zero only if the figure is still off screen, so nothing visibly jumps.
    if (el.getBoundingClientRect().top > window.innerHeight) setShown(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden>
        {shown}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
