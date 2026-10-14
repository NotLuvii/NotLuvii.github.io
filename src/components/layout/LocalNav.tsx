"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { pill } from "@/components/ui/links";

/**
 * Apple's local navigation bar: the name on the left, section links and one blue pill on the right,
 * frosted glass that picks up a hairline once the page has scrolled.
 */
export function LocalNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-[env(safe-area-inset-top,0px)] z-40 border-b backdrop-blur-xl backdrop-saturate-[1.8] transition-colors duration-300",
        scrolled ? "border-black/[0.16] bg-white/[0.72]" : "border-transparent bg-white/[0.72]",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded-full focus:bg-blue focus:px-4 focus:py-2 focus:text-[14px] focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[52px] max-w-[1180px] items-center justify-between gap-6 px-gutter">
        <a href="#top" className="text-[21px] font-semibold tracking-[0.011em] text-ink">
          {site.name}
        </a>
        <div className="flex items-center gap-7">
          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-6 text-[12px] tracking-[-0.01em]">
              {/* Without a résumé to download, the pill goes to Contact, so the text link would repeat it. */}
              {nav.filter((n) => site.resume || n.href !== "#contact").map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-ink/80 transition-colors hover:text-link">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {site.resume ? (
            <a href={site.resume} download className={pill("solid", "sm")}>
              Résumé
            </a>
          ) : (
            <a href="#contact" className={pill("solid", "sm")}>
              Get in touch
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
