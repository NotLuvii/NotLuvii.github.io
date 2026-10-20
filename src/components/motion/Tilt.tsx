"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { tiltFor } from "@/lib/tilt";
import { cn } from "@/lib/cn";

/** Only with a mouse (or trackpad) that can hover, and only when the visitor allows motion. */
const CAN_TILT = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * A card that leans toward the pointer in 3D, with a soft white glare where the pointer is
 * (CSS: .tilt). It writes --rx, --ry, --gx and --gy; the CSS turns them into the transform. On
 * leave it settles back. Touch screens and reduced motion get a flat card. `max` is the steepest
 * lean in degrees: 8 for a card, less for a tile as wide as the page.
 */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia(CAN_TILT);
    let frame = 0;
    const set = (rx: number, ry: number, gx: number, gy: number) => {
      el.style.setProperty("--rx", rx.toFixed(2));
      el.style.setProperty("--ry", ry.toFixed(2));
      el.style.setProperty("--gx", gx.toFixed(1));
      el.style.setProperty("--gy", gy.toFixed(1));
    };
    const move = (e: PointerEvent) => {
      if (!media.matches || e.pointerType === "touch" || document.documentElement.dataset.motion === "paused") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const t = tiltFor(e.clientX, e.clientY, el.getBoundingClientRect(), max);
        el.setAttribute("data-tilting", "");
        set(t.rx, t.ry, t.gx, t.gy);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      el.removeAttribute("data-tilting");
      set(0, 0, 50, 50);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    media.addEventListener("change", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      media.removeEventListener("change", leave);
    };
  }, [max]);

  return (
    <div ref={ref} className={cn("tilt", className)}>
      {children}
    </div>
  );
}
