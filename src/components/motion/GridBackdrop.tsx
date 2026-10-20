"use client";

import { useEffect, useRef } from "react";
import { glowAlpha, project, tilesNear } from "@/lib/grid3d";

/** 34 tiles each way (a Fibonacci number), 55px each: enough to cover a wide screen once turned. */
const SPAN = 17;
const TILE = 55;
const RADIUS = 3;
const LINE = "#1a1a1a";
/** The glow only follows a mouse, and only when the visitor allows motion. */
const CAN_GLOW = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * A faint grid, turned in 3D, behind the home page's black sections (CSS: .grid-backdrop). The
 * hero, the marquee and the tiles are opaque, so it shows only between them. With a mouse, the
 * tiles near the pointer glow amber and fade over 1.5 s; it redraws only while something is fading,
 * and reports how many tiles are lit in data-lit. On touch screens and with reduced motion it is
 * drawn once and stays still. Decoration only.
 */
export function GridBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const lit = new Map<string, { gx: number; gy: number; d: number; t0: number }>();
    let w = 0;
    let h = 0;
    let raf = 0;

    const grid = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      for (let i = -SPAN; i <= SPAN; i++) {
        for (const [a, b] of [
          [project(i, -SPAN, w / 2, h / 2, TILE), project(i, SPAN, w / 2, h / 2, TILE)],
          [project(-SPAN, i, w / 2, h / 2, TILE), project(SPAN, i, w / 2, h / 2, TILE)],
        ]) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const frame = () => {
      raf = 0;
      grid();
      const now = performance.now();
      for (const [key, t] of lit) {
        const a = glowAlpha(t.d, (now - t.t0) / 1000);
        if (a <= 0) {
          lit.delete(key);
          continue;
        }
        const corners = [
          project(t.gx, t.gy, w / 2, h / 2, TILE),
          project(t.gx + 1, t.gy, w / 2, h / 2, TILE),
          project(t.gx + 1, t.gy + 1, w / 2, h / 2, TILE),
          project(t.gx, t.gy + 1, w / 2, h / 2, TILE),
        ];
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (const c of corners.slice(1)) ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `rgb(255 176 0 / ${a.toFixed(3)})`;
        ctx.fill();
      }
      canvas.dataset.lit = String(lit.size);
      if (lit.size) raf = requestAnimationFrame(frame);
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) frame();
    };

    const media = window.matchMedia(CAN_GLOW);
    const move = (e: PointerEvent) => {
      if (!media.matches || e.pointerType === "touch") return;
      const now = performance.now();
      for (const t of tilesNear(e.clientX, e.clientY, w / 2, h / 2, TILE, RADIUS, SPAN)) lit.set(`${t.gx},${t.gy}`, { ...t, t0: now });
      if (!raf) raf = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="grid-backdrop" data-lit="0" />;
}
