"use client";

import { useEffect, useState } from "react";

/**
 * Which of these sections is crossing the middle of the screen (a band from 45% to 50% down), for
 * the site bar's pills and the section dots. Null before the script runs, and on pages that have
 * none of these sections (the case studies), so nothing is marked current there.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const targets = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);
  return active;
}
