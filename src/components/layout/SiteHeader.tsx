"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { nav, site } from "@/content/site";
import { button } from "@/components/ui/links";
import { cn } from "@/lib/cn";

/**
 * Sticky header: the name, the section links and the resume. Below 768px the links fold into a
 * menu button. Escape or choosing a link closes the menu and returns focus to the button.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header id="top" className="sticky top-0 z-40 border-b border-hairline bg-white/85 backdrop-blur-xl backdrop-saturate-150">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-blue focus:px-5 focus:text-[15px] focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between gap-4 px-gutter">
        <Link href="/" className="inline-flex min-h-11 items-center text-[17px] font-semibold tracking-[-0.02em] text-ink">
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="inline-flex min-h-11 items-center rounded-full px-3 text-[14px] text-ink/80 transition-colors hover:text-link">
                  {n.label}
                </a>
              </li>
            ))}
            {site.resume && (
              <li className="ml-2">
                <a href={site.resume} download className={button("primary", "sm")}>
                  Resume <span className="sr-only">(PDF)</span>
                </a>
              </li>
            )}
          </ul>
        </nav>

        <button
          ref={toggle}
          type="button"
          className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-[15px] font-medium text-ink md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={cn("transition-transform duration-200", open && "rotate-180")}>
            <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <nav id={menuId} aria-label="Main" hidden={!open} className="border-t border-hairline bg-white md:hidden">
        <div className="mx-auto max-w-[1080px] px-gutter pb-4 pt-1">
          <ul className="divide-y divide-hairline">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-[17px] text-ink">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          {site.resume && (
            <a href={site.resume} download onClick={() => setOpen(false)} className={cn(button("primary"), "mt-3 w-full")}>
              Download resume (PDF)
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
