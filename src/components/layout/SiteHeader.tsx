"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { nav, site } from "@/content/site";
import { button } from "@/components/ui/links";
import { cn } from "@/lib/cn";

/**
 * Sticky header: a see-through bar (CSS: .site-bar) with the name, the section links and the
 * resume, so the sections' tones show through it as they scroll under. Below 768px the links fold
 * into a menu button; the menu eases down when it opens (CSS: .menu-panel). Escape or choosing a
 * link closes it and returns focus to the button.
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
    <header id="top" className="site-bar sticky top-0 z-40">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-amber focus:px-5 focus:text-[17px] focus:font-semibold focus:text-on-amber"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-gutter">
        <Link href="/" className="inline-flex min-h-11 items-center text-[17px] font-semibold text-text">
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="inline-flex min-h-11 items-center px-3 text-[14px] text-text-2 transition-colors hover:text-text">
                  {n.label}
                </a>
              </li>
            ))}
            {site.resume && (
              <li className="ml-3">
                <a href={site.resume} download className={button("secondary", "sm")}>
                  Resume <span className="sr-only">(PDF)</span>
                </a>
              </li>
            )}
          </ul>
        </nav>

        <button
          ref={toggle}
          type="button"
          className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-3 text-[17px] font-medium text-text transition-opacity active:opacity-60 md:hidden"
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

      <nav id={menuId} aria-label="Main" hidden={!open} className="menu-panel md:hidden">
        <div className="mx-auto max-w-[1200px] px-gutter pb-4 pt-1">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-[21px] font-semibold text-text active:opacity-60">
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
