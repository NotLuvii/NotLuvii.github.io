"use client";

import { useEffect, useRef } from "react";
import { alphaBucket, glowAlpha, project, tilesNear } from "@/lib/grid3d";

/** 34 tiles each way (a Fibonacci number), 55px each: enough to cover a wide screen once turned. */
const SPAN = 17;
const TILE = 55;
const RADIUS = 3;
const LINE = "#1a1a1a";
/** The parts of the page that hide the grid: no point lighting tiles under them. */
const OPAQUE = ".hero, .marquee, .tile, .work-card, header, footer";
/** The glow only follows a mouse, and only when the visitor allows motion. */
const CAN_GLOW = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * A faint grid, turned in 3D, behind the home page's black sections (CSS: .grid-backdrop). The
 * hero, the marquee and the tiles are opaque, so it shows only between them. With a mouse, the
 * tiles near the pointer glow amber and fade over 1.5 s; it redraws only while something is fading,
 * and reports how many tiles are lit in data-lit. The lines are drawn once to a layer of their own,
 * the glows in at most eight fills a frame, and a pointer over the parts that hide the grid (the
 * first screen, the tiles, the cards) lights nothing. On touch screens and with reduced motion it is
 * drawn once and stays still. Decoration only.
 */
export function GridBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const lit = new Map<string, { gx: number; gy: number; d: number; t0: number }>();
    // The lines, drawn once per size to their own canvas and copied in each frame.
    const lines = document.createElement("canvas");
    const linesCtx = lines.getContext("2d");
    let w = 0;
    let h = 0;
    let raf = 0;

    const drawLines = (c: CanvasRenderingContext2D) => {
      c.clearRect(0, 0, w, h);
      c.beginPath();
      for (let i = -SPAN; i <= SPAN; i++) {
        for (const [a, b] of [
          [project(i, -SPAN, w / 2, h / 2, TILE), project(i, SPAN, w / 2, h / 2, TILE)],
          [project(-SPAN, i, w / 2, h / 2, TILE), project(SPAN, i, w / 2, h / 2, TILE)],
        ]) {
          c.moveTo(a.x, a.y);
          c.lineTo(b.x, b.y);
        }
      }
      c.strokeStyle = LINE;
      c.lineWidth = 1;
      c.stroke();
    };
    const grid = () => {
      ctx.clearRect(0, 0, w, h);
      if (linesCtx) ctx.drawImage(lines, 0, 0, w, h);
      else drawLines(ctx);
    };

    const frame = () => {
      raf = 0;
      grid();
      const now = performance.now();
      // One path per shade: at most eight fills a frame, however many tiles are lit.
      const shades = new Map<number, Path2D>();
      for (const [key, t] of lit) {
        const a = alphaBucket(glowAlpha(t.d, (now - t.t0) / 1000));
        if (a <= 0) {
          lit.delete(key);
          continue;
        }
        const path = shades.get(a) ?? new Path2D();
        shades.set(a, path);
        const p0 = project(t.gx, t.gy, w / 2, h / 2, TILE);
        path.moveTo(p0.x, p0.y);
        for (const [dx, dy] of [[1, 0], [1, 1], [0, 1]]) {
          const p = project(t.gx + dx, t.gy + dy, w / 2, h / 2, TILE);
          path.lineTo(p.x, p.y);
        }
        path.closePath();
      }
      for (const [a, path] of shades) {
        ctx.fillStyle = `rgb(255 176 0 / ${a.toFixed(2)})`;
        ctx.fill(path);
      }
      canvas.dataset.lit = String(lit.size);
      if (lit.size) raf = requestAnimationFrame(frame);
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = lines.width = Math.round(w * dpr);
      canvas.height = lines.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (linesCtx) {
        linesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawLines(linesCtx);
      }
      if (!raf) frame();
    };

    const media = window.matchMedia(CAN_GLOW);
    const move = (e: PointerEvent) => {
      if (!media.matches || e.pointerType === "touch" || document.documentElement.dataset.motion === "paused") return;
      if (e.target instanceof Element && e.target.closest(OPAQUE)) return;
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
