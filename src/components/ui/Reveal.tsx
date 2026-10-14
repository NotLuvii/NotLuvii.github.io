"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn, cssVars } from "@/lib/cn";
import { ARTIFACT } from "@/lib/mode";

/**
 * Fades and lifts its content into place the first time it scrolls into view. The hiding is
 * done in CSS under html.js and prefers-reduced-motion: no-preference, so without JavaScript, or
 * with reduced motion, content is simply there.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  // The hosted artifact must be complete at rest, so nothing there waits on scroll to appear.
  if (ARTIFACT) {
    return (
      <Tag id={id} className={cn(className)}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} id={id} data-reveal data-shown={shown} className={cn(className)} style={delay ? cssVars({ "--reveal-delay": `${delay}s` }) : undefined}>
      {children}
    </Tag>
  );
}
