"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { nav, site } from "@/content/site";
import { useActiveSection } from "./useActiveSection";
import { button } from "@/components/ui/links";
import { cn } from "@/lib/cn";

const navIds = nav.map((n) => n.id);

/**
 * Sticky header: a see-through bar (CSS: .site-bar) with the monogram, the section links in a pill
 * that marks the section in view (on the home page; useActiveSection) and the resume. Below 768px
 * the links fold into a menu button; the menu eases down when it opens (CSS: .menu-panel). Escape
 * or choosing a link closes it and returns focus to the button.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(navIds);

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
      <div className="mx-auto grid h-14 max-w-[1200px] grid-cols-[1fr_auto] items-center gap-4 px-gutter md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label={`${site.name}, home`} className="inline-flex min-h-11 items-center justify-self-start text-[20px] font-bold text-text [font-stretch:75%]">
          LB
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="nav-pill">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} aria-current={active === n.id ? "true" : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {site.resume && (
          <div className="hidden justify-self-end md:block">
            <a href={site.resume} download className={button("outline", "sm")}>
              Resume <span className="sr-only">(PDF)</span>
            </a>
          </div>
        )}

        <button
          ref={toggle}
          type="button"
          className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 justify-self-end px-3 text-[17px] font-medium text-text transition-opacity active:opacity-60 md:hidden"
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
