"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motionPaused, subscribeMotion } from "@/lib/motion";
import { sceneProgress, type SceneMode } from "./progress";

/**
 * The scroll engine. While a `[data-scene]` element is on screen, this writes its progress
 * (0 to 1, see ./progress.ts) to the element's `--p` custom property once per animation frame;
 * the CSS does the rest. It never starts under reduced motion, and it stops, leaving everything at
 * rest, while the visitor has paused motion (src/lib/motion.ts); it starts again when they resume.
 * The CSS treats a missing `--p` as the resting state, so nothing depends on it running.
 */
export function ScrollScenes() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop: (() => void) | null = null;
    const sync = () => {
      if (motionPaused()) {
        stop?.();
        stop = null;
      } else if (!stop) {
        stop = run();
      }
    };
    sync();
    const unsubscribe = subscribeMotion(sync);
    return () => {
      unsubscribe();
      stop?.();
    };
  }, [pathname]);

  return null;
}

/** Starts the engine; the function it returns stops it and puts every scene back at rest. */
function run(): () => void {
  const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
  const visible = new Set<HTMLElement>();
  let frame = 0;

  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    for (const el of visible) {
      const mode = el.dataset.scene as SceneMode;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--p", sceneProgress(mode, rect, vh).toFixed(4));
    }
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) {
          visible.add(el);
        } else {
          // Leaving the screen: settle at the end it left from, so it never freezes mid-way.
          visible.delete(el);
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--p", sceneProgress(el.dataset.scene as SceneMode, rect, window.innerHeight).toFixed(4));
        }
      }
      request();
    },
    { rootMargin: "10% 0px" },
  );
  for (const el of scenes) io.observe(el);

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  request();

  return () => {
    io.disconnect();
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    cancelAnimationFrame(frame);
    for (const el of scenes) el.style.removeProperty("--p");
  };
}
