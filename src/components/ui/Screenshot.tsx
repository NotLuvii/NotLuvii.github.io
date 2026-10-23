"use client";

import type { ReactNode } from "react";
import type { Screenshot as Shot } from "@/content/projects";
import { cn } from "@/lib/cn";
import { Magnifier, useScreenshotViewer } from "./ScreenshotViewer";

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
  captionHidden = false,
  annotation,
}: {
  shot: Shot;
  priority?: boolean;
  className?: string;
  /** Rendered width, for picking 1x or 2x. Defaults to the image's own width. */
  sizes?: string;
  /** For a picture cut off by its card: the caption is read out, not shown (it would be clipped). */
  captionHidden?: boolean;
  /** Drawn over the image, in the image's own box (so percentages place it on the picture): an ink mark. */
  annotation?: ReactNode;
}) {
  const { show, viewer } = useScreenshotViewer(shot);
  const one = `${shot.src}.webp`;
  const srcSet = [`${one} ${shot.width}w`, `${shot.src}@2x.webp ${shot.width * 2}w`, ...(shot.large ? [`${shot.src}@3x.webp ${shot.width * 3}w`] : [])].join(", ");

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="group relative rounded-xl bg-raised p-f5">
        <div className="relative overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export: pre-sized WebP files, no image optimizer */}
          <img
            src={one}
            srcSet={srcSet}
            sizes={sizes ?? `(min-width: 768px) ${shot.width}px, 100vw`}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className="block h-auto w-full"
          />
          {annotation}
        </div>
        <button
          type="button"
          onClick={show}
          aria-haspopup="dialog"
          aria-label={`View screenshot full screen: ${shot.caption}`}
          className="absolute inset-0 flex cursor-zoom-in items-center justify-center rounded-xl bg-black/0 transition-colors duration-200 hover:bg-black/20 focus-visible:bg-black/20 focus-visible:outline-offset-[-3px]"
        >
          <span
            data-magnifier
            className="flex size-12 scale-90 items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-has-[:focus-visible]:scale-100 group-has-[:focus-visible]:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100"
          >
            <Magnifier />
          </span>
        </button>
      </div>
      <figcaption className={captionHidden ? "sr-only" : "type-small mt-f13 text-text-3"}>{shot.caption}</figcaption>

      {viewer}
    </figure>
  );
}
