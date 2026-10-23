import type { CSSProperties } from "react";
import type { Crop as CropData } from "@/content/projects";
import { ring as ringPaths, underline } from "@/lib/ink";
import { Ink } from "@/components/ink/Ink";
import { cn } from "@/lib/cn";
import { CropOpen } from "./CropOpen";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * A window onto a real capture (content: `crops`), cut in CSS: the window has the crop's aspect
 * ratio and the whole image sits inside it, scaled and shifted so only the crop shows (CSS:
 * .crop-window). Below 640px a crop with a `narrow` rect shows that instead. Ink marks and the ring
 * are placed in percentages of the crop, so they stay on their words at any width; they draw in as
 * the crop scrolls into view when motion is allowed, and otherwise rest drawn. A crop is never shown
 * larger than 1.25 times its own size. The button over it opens the whole capture.
 *
 * Server component: the ink paths are drawn here, at build time.
 */
export function Crop({ crop, sizes, priority = false, className }: { crop: CropData; sizes: string; priority?: boolean; className?: string }) {
  const { shot, rect, narrow, marks = [], ring } = crop;
  const vars = {
    "--W": shot.width,
    "--H": shot.height,
    "--x": rect.x,
    "--y": rect.y,
    "--w": rect.w,
    "--h": rect.h,
    ...(narrow && { "--nx": narrow.x, "--ny": narrow.y, "--nw": narrow.w, "--nh": narrow.h }),
  } as CSSProperties;
  const one = `${shot.src}.webp`;
  return (
    <div data-crop data-w={rect.w} data-nw={narrow?.w} className={cn("crop", narrow && "crop-has-narrow", className)} style={vars}>
      <div className="crop-window">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export: pre-sized WebP files, no image optimizer */}
        <img
          src={one}
          srcSet={`${one} ${shot.width}w, ${shot.src}@2x.webp ${shot.width * 2}w`}
          sizes={sizes}
          width={shot.width}
          height={shot.height}
          alt={crop.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
        <div className="crop-overlay" aria-hidden>
          {marks.map((m, i) => (
            <Ink
              key={i}
              data-mark=""
              paths={underline(m.w, 31 + i)}
              w={m.w}
              h={12}
              className="crop-mark"
              style={{ left: pct(m.x - rect.x, rect.w), top: pct(m.y - 6 - rect.y, rect.h), width: pct(m.w, rect.w), height: pct(12, rect.h) }}
            />
          ))}
          {ring && (
            <Ink
              data-ring=""
              paths={ringPaths(120, 40, 7)}
              w={120}
              h={40}
              className="crop-mark"
              style={{ left: pct(ring.x - rect.x, rect.w), top: pct(ring.y - rect.y, rect.h), width: pct(ring.w, rect.w), height: pct(ring.h, rect.h) }}
            />
          )}
        </div>
        <CropOpen shot={shot} />
      </div>
    </div>
  );
}
