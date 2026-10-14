"use client";

import { useRef, useState } from "react";
import type { Screenshot as Shot } from "@/content/projects";
import { cn } from "@/lib/cn";

/** Magnifying glass with a plus: "make this bigger". */
function Magnifier() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/**
 * A real screenshot, framed, with its caption underneath. Hovering (or focusing) it shows a
 * magnifying glass; clicking opens the 2x image full screen in a modal dialog on the same page,
 * with no navigation. Escape, the close button or a click outside the image closes it, and focus
 * returns to the screenshot. Width and height are set so the page doesn't shift while it loads;
 * everything except the hero image loads lazily, and the large image only loads when opened.
 */
export function Screenshot({
  shot,
  priority = false,
  className,
  sizes,
}: {
  shot: Shot;
  priority?: boolean;
  className?: string;
  /** Rendered width, for picking 1x or 2x. Defaults to the image's own width. */
  sizes?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const one = `${shot.src}.webp`;
  const two = `${shot.src}@2x.webp`;

  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="group relative overflow-hidden rounded-xl border border-line bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export: pre-sized WebP files, no image optimizer */}
        <img
          src={one}
          srcSet={`${one} ${shot.width}w, ${two} ${shot.width * 2}w`}
          sizes={sizes ?? `(min-width: 768px) ${shot.width}px, 100vw`}
          width={shot.width}
          height={shot.height}
          alt={shot.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="block h-auto w-full"
        />
        <button
          type="button"
          onClick={show}
          aria-haspopup="dialog"
          aria-label={`View screenshot full screen: ${shot.caption}`}
          className="absolute inset-0 flex cursor-zoom-in items-center justify-center rounded-xl bg-black/0 transition-colors duration-200 hover:bg-black/20 focus-visible:bg-black/20 focus-visible:outline-offset-[-3px]"
        >
          <span
            data-magnifier
            className="flex size-12 scale-90 items-center justify-center rounded-full bg-page text-amber opacity-0 ring-1 ring-white/25 transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-has-[:focus-visible]:scale-100 group-has-[:focus-visible]:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100"
          >
            <Magnifier />
          </span>
        </button>
      </div>
      <figcaption className="type-caption mt-3 text-text-3">{shot.caption}</figcaption>

      <dialog
        ref={dialog}
        aria-label={shot.caption}
        onClose={() => setOpen(false)}
        // A click on the dark area around the image (the dialog itself) closes it.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="lightbox m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-transparent p-0 text-white backdrop:bg-black/95"
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 pb-6 pt-16 sm:px-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {open && (
            // eslint-disable-next-line @next/next/no-img-element -- see above
            <img
              src={two}
              width={shot.width * 2}
              height={shot.height * 2}
              alt={shot.alt}
              decoding="async"
              className="block h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-full rounded-lg bg-white object-contain shadow-2xl"
            />
          )}
          <p className="type-caption max-w-[70ch] text-center text-white/80">{shot.caption}</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="fixed right-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5 sm:top-5"
        >
          <CloseIcon />
        </button>
      </dialog>
    </figure>
  );
}
