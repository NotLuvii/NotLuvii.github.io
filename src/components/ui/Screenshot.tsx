import type { Screenshot as Shot } from "@/content/projects";
import { cn } from "@/lib/cn";

/**
 * A real screenshot, framed, with its caption directly underneath and a link to the full-size
 * file. Width and height are set so the page doesn't shift while it loads; everything except the
 * hero image loads lazily.
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
  const one = `${shot.src}.webp`;
  const two = `${shot.src}@2x.webp`;
  return (
    <figure className={cn("min-w-0", className)}>
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.18)]">
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
      </div>
      <figcaption className="type-caption mt-3 text-ash">
        {shot.caption}{" "}
        <a href={two} className="whitespace-nowrap text-link underline underline-offset-[3px] hover:decoration-2">
          Full size
        </a>
      </figcaption>
    </figure>
  );
}
