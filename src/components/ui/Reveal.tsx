"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * A gentle fade-and-rise the first time content scrolls into view.
 *
 * Nothing is hidden by the server-rendered HTML. After the page loads, an element is marked
 * "pending" (and hidden by CSS) only if it starts below the fold, the browser supports
 * IntersectionObserver, and the visitor hasn't asked for reduced motion. So without JavaScript,
 * with reduced motion, or if anything here fails, the content is simply there.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
