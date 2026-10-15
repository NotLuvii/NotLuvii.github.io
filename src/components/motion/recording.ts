import type { Recording } from "@/content/projects";

/** Screens that get the phone crop; the same query picks the phone still in the hero's <picture>. */
export const PHONE_QUERY = "(max-width: 599px)";

/** The hero's scan line takes 3.2s (0.6s delay, 2.6s pass); playback waits at most this long for it. */
export const SCAN_FALLBACK_MS = 3400;

/** The crop for the screen, in a format this browser plays: WebM (VP9) where supported, otherwise MP4 (H.264). */
export function recordingSource(r: Recording, phone: boolean, webm: boolean): string {
  return `${(phone ? r.phone : r.desktop).src}.${webm ? "webm" : "mp4"}`;
}
