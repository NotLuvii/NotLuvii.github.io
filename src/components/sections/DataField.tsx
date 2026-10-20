"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FieldHandle } from "@/components/three/fieldScene";
import { motionPaused, subscribeMotion } from "@/lib/motion";

/**
 * - drawing: the server's state, and without JavaScript — the SVG data check shows.
 * - running: the 3D field follows the pointer and the scroll, drawing only while it moves.
 * - paused: the field is off screen or the tab is hidden; nothing is drawn.
 * - still: reduced motion, or motion paused on the page — one frame, the camera at rest.
 * - off: no WebGL, or the GPU dropped the context — the SVG shows again.
 */
export type FieldState = "drawing" | "running" | "paused" | "still" | "off";

/**
 * The first screen's data field in 3D (components/three/fieldScene.ts), over the drawing it
 * replaces (`children`, the SVG data check). three is loaded only after the page has loaded and the
 * browser is idle; until then, and whenever 3D isn't possible, the drawing stays. Decoration only.
 * The canvas never takes the pointer: it reads pointer moves from the window.
 */
export function DataField({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<FieldState>("drawing");

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let cancelled = false;
    let handle: FieldHandle | null = null;
    let canvas: HTMLCanvasElement | null = null;
    const undo: (() => void)[] = [];

    const teardown = () => {
      while (undo.length) undo.pop()!();
      handle?.dispose();
      handle = null;
      canvas?.remove();
      canvas = null;
    };

    const begin = async () => {
      if (cancelled) return;
      let scene: typeof import("@/components/three/fieldScene");
      try {
        scene = await import("@/components/three/fieldScene");
      } catch {
        if (!cancelled) setState("off");
        return;
      }
      if (cancelled) return;

      // Still when the system asks for less motion, or the visitor paused it on the page.
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      const isStill = () => reduce.matches || motionPaused();
      canvas = document.createElement("canvas");
      canvas.className = "field-canvas";
      try {
        handle = scene.createField(canvas, {
          still: isStill(),
          onLost: () => {
            teardown();
            setState("off");
          },
          onFrame: (n) => {
            el.dataset.frames = String(n);
          },
        });
      } catch {
        canvas = null;
        setState("off");
        return;
      }
      el.appendChild(canvas);

      const h = handle;
      const size = () => {
        const r = el.getBoundingClientRect();
        h.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2));
      };
      const resizes = new ResizeObserver(size);
      resizes.observe(el);
      undo.push(() => resizes.disconnect());
      size();

      // Still: one frame, drawn when entering the still mode. Otherwise draw only while the field
      // is on screen and the tab is visible. Re-decided whenever any of those changes.
      let onScreen = true;
      let mode: FieldState = "drawing";
      const run = () => {
        const next: FieldState = isStill() ? "still" : onScreen && !document.hidden ? "running" : "paused";
        if (next === mode) return;
        mode = next;
        if (next === "still") h.setStill(true);
        else {
          h.setStill(false);
          if (next === "running") h.start();
          else h.stop();
        }
        setState(next);
      };
      const view = new IntersectionObserver((entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        run();
      });
      view.observe(el);
      document.addEventListener("visibilitychange", run);
      reduce.addEventListener("change", run);
      const unsubscribe = subscribeMotion(run);
      undo.push(() => {
        view.disconnect();
        document.removeEventListener("visibilitychange", run);
        reduce.removeEventListener("change", run);
        unsubscribe();
      });

      // The field turns toward a mouse (not a finger), and tilts back as the first screen scrolls away.
      if (matchMedia("(pointer: fine)").matches) {
        const point = (e: PointerEvent) => h.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        window.addEventListener("pointermove", point, { passive: true });
        undo.push(() => window.removeEventListener("pointermove", point));
      }
      const hero = el.closest("section") ?? el;
      const scrolled = () => {
        const r = hero.getBoundingClientRect();
        h.setScroll(r.height ? -r.top / r.height : 0);
      };
      window.addEventListener("scroll", scrolled, { passive: true });
      undo.push(() => window.removeEventListener("scroll", scrolled));
      scrolled();
      run();
    };

    // After the page has loaded, when the browser is idle.
    const idle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => void begin(), { timeout: 1500 });
      else setTimeout(() => void begin(), 200);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", idle);
      teardown();
    };
  }, []);

  return (
    <div ref={wrap} className="data-field" data-field={state} aria-hidden>
      {children}
    </div>
  );
}
