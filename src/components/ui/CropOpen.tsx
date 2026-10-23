"use client";

import type { Screenshot as Shot } from "@/content/projects";
import { Magnifier, useScreenshotViewer } from "./ScreenshotViewer";

/**
 * The button over a crop's window: it opens the whole capture full screen (the shared viewer), so a
 * crop never hides what's around it. It covers exactly the visible window, answers the press at
 * once, and shows a magnifying glass on hover, on focus and on touch screens.
 */
export function CropOpen({ shot }: { shot: Shot }) {
  const { show, viewer } = useScreenshotViewer(shot);
  return (
    <>
      <button type="button" onClick={show} aria-haspopup="dialog" aria-label={`View the whole screenshot: ${shot.caption}`} className="crop-open group">
        <span data-magnifier className="crop-magnifier">
          <Magnifier />
        </span>
      </button>
      {viewer}
    </>
  );
}
