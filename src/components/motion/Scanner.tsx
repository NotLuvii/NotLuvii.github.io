"use client";

import { useEffect, useRef } from "react";
import { heroCode } from "@/content/heroCode";

/**
 * The opening screen's scanner: real code from the scam detection tool, faint, with an amber line
 * sweeping down it (CSS in globals.css, "The scanner"). Purely decorative, so it's hidden from
 * screen readers; the caption next to it names the file. The animation pauses whenever the
 * scanner is off screen.
 */
export function Scanner({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) delete el.dataset.paused;
      else el.dataset.paused = "";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scanner ${className ?? ""}`} aria-hidden>
      <pre className="scanner-code scanner-dim">{heroCode.code}</pre>
      <div className="scanner-window">
        <pre className="scanner-code scanner-lit">{heroCode.code}</pre>
      </div>
      <div className="scanner-beam" />
    </div>
  );
}
