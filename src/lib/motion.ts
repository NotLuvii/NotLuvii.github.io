/**
 * The visitor's own "pause motion" choice (components/motion/MotionToggle.tsx), kept in
 * localStorage and mirrored on <html data-motion="paused"> so the CSS can stop the loops. The
 * layout sets the attribute before first paint (MOTION_SCRIPT), so a paused page never starts
 * moving. Browser only; every storage call is guarded, since storage can be blocked.
 */
const KEY = "motion";
const listeners = new Set<() => void>();
let paused: boolean | null = null;

/** Runs in <head> before the page paints. */
export const MOTION_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="paused")document.documentElement.dataset.motion="paused"}catch(e){}`;

export function motionPaused(): boolean {
  if (paused === null) paused = document.documentElement.dataset.motion === "paused";
  return paused;
}

export function setMotionPaused(on: boolean): void {
  paused = on;
  if (on) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
  try {
    if (on) localStorage.setItem(KEY, "paused");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the choice holds for this page only.
  }
  for (const l of listeners) l();
}

export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
