"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Recording } from "@/content/projects";
import { PHONE_QUERY, SCAN_FALLBACK_MS, recordingSource } from "./recording";

/** A still's srcset: the 1x, 2x and 3x files by their widths. */
const stills = ({ src, width }: { src: string; width: number }) => `${src}.webp ${width}w, ${src}@2x.webp ${width * 2}w, ${src}@3x.webp ${width * 3}w`;

/** True once the page is running in a browser with JavaScript (false in the static HTML). */
const noop = () => () => {};
const useScripted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/** Whether the screen gets the phone crop, kept current as a phone turns or a window is resized. */
const watchPhone = (change: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};
const usePhone = () =>
  useSyncExternalStore(
    watchPhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );

/**
 * The opening's picture: a still of the tool's finished result, with the recording of it played
 * over the top. The still is what loads first, and all that visitors without JavaScript see.
 *
 * With motion allowed, the recording starts once the hero's scan line has passed (or after 3.4s),
 * and plays only while at least half of it is on screen. Its source is set at that moment, so
 * nothing is downloaded before. With reduced motion it waits for the button. The button (pause or
 * play) is the visitor's choice and is never overridden; its focus ring is drawn inside its dark
 * disc, where it shows over the light recording. If the screen changes size class (a phone turned
 * sideways), the other crop takes over from the same moment. If the browser refuses to play, or
 * the file can't load, the still simply stays.
 */
export function HeroRecording({ recording }: { recording: Recording }) {
  const { desktop, phone } = recording;
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const chosen = useRef(false);
  const scripted = useScripted();
  const onPhone = usePhone();
  const [wanted, setWanted] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Start on our own only when motion is allowed, after the scan has passed.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let done = false;
    const start = () => {
      if (done || chosen.current) return;
      done = true;
      setWanted(true);
    };
    const timer = window.setTimeout(start, SCAN_FALLBACK_MS);
    const beam = root.current?.querySelector(".scan-beam");
    const scans = beam?.getAnimations() ?? [];
    Promise.all(scans.map((a) => a.finished)).then(start, start);
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Watch whether at least half of it is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play while wanted and on screen; pause otherwise.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!(wanted && inView)) {
      v.pause();
      return;
    }
    // Set the source the first time, and switch crops (from the same moment) if the screen changed.
    const source = recordingSource(recording, onPhone, v.canPlayType('video/webm; codecs="vp9"') !== "");
    const current = v.getAttribute("src");
    if (current !== source) {
      const at = v.currentTime;
      v.src = source;
      if (current) v.currentTime = at;
    }
    v.play().catch((e: unknown) => {
      // Interrupted by a pause (scrolled away): nothing to do. Refused or unplayable: keep the still.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setWanted(false);
    });
  }, [wanted, inView, onPhone, recording]);

  const toggle = () => {
    chosen.current = true;
    setWanted((w) => !w);
  };

  return (
    <div ref={root} data-recording className="relative overflow-hidden rounded-t-md">
      <picture className="block">
        <source media={PHONE_QUERY} srcSet={stills(phone)} sizes="calc(100vw - 52px)" width={phone.width} height={phone.height} />
        <img
          src={`${desktop.src}@2x.webp`}
          srcSet={stills(desktop)}
          sizes="(min-width: 1080px) 880px, calc(100vw - 52px)"
          width={desktop.width}
          height={desktop.height}
          alt={recording.alt}
          fetchPriority="high"
          className="block h-auto w-full"
        />
      </picture>
      <video
        ref={video}
        aria-hidden
        muted
        playsInline
        loop
        preload="none"
        data-playing={playing ? "" : undefined}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-0 data-[playing]:opacity-100 motion-safe:transition-opacity motion-safe:duration-300"
      />
      <div aria-hidden className="scan-cover" />
      <div aria-hidden className="scan-beam" />
      {scripted && (
        <button
          type="button"
          onClick={toggle}
          aria-label={wanted ? "Pause the recording" : "Play the recording"}
          className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-page/70 text-text transition-[scale,background-color] duration-150 hover:bg-page/85 focus-visible:outline-offset-[-5px] active:scale-[0.94]"
        >
          {wanted ? (
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
              <path d="M3 2h3v10H3zM8 2h3v10H8z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
              <path d="M4 2.2v9.6a.5.5 0 0 0 .76.43l7.6-4.8a.5.5 0 0 0 0-.86l-7.6-4.8A.5.5 0 0 0 4 2.2z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
