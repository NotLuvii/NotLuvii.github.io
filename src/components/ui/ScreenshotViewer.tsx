"use client";

import { useRef, useState } from "react";
import type { Screenshot as Shot } from "@/content/projects";

/** Magnifying glass with a plus: "make this bigger". */
export function Magnifier() {
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
 * The full-screen viewer for a capture, shared by Screenshot and Crop: a modal dialog on the same
 * page, with no navigation, showing the whole 2x capture and its caption. Escape, the close button
 * or a click outside the image closes it, and focus goes back to what opened it. The large image
 * loads the first time the viewer opens, then stays, so it can fade out.
 */
export function useScreenshotViewer(shot: Shot) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const two = `${shot.src}@2x.webp`;
  const show = () => {
    setLoaded(true);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const viewer = (
    <dialog
      ref={dialog}
      aria-label={shot.caption}
      // A click on the dark area around the image (the dialog itself) closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="lightbox m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-transparent p-0 text-white backdrop:bg-black/95"
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-f13 px-f13 pb-f21 pt-f55 sm:px-f34"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {loaded && (
          // eslint-disable-next-line @next/next/no-img-element -- static export: pre-sized WebP files, no image optimizer
          <img
            src={two}
            width={shot.width * 2}
            height={shot.height * 2}
            alt={shot.alt}
            decoding="async"
            className="block h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-full rounded-lg bg-white object-contain shadow-2xl"
          />
        )}
        <p className="type-small max-w-[70ch] text-center text-white/80">{shot.caption}</p>
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
  );
  return { show, viewer };
}
