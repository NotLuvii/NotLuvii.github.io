/**
 * An image sequence drawn on a canvas and scrubbed by scroll, the way Apple's product pages play
 * footage. Frames load only as the chapter approaches: first a sparse set (so the whole range can be
 * scrubbed at once), then the rest. Drawing picks the nearest frame already loaded.
 */

export type Form = {
  width: number;
  height: number;
  frames: number;
  /** Frame ranges [start, end) for the chapter's three moments. */
  moments: [number, number][];
  /** A focus rectangle [x, y, w, h] in frame pixels for each moment (desktop only). */
  views?: View[];
  /** Running totals per frame (the vehicle counter only). */
  counts?: { car: number; bus: number; truck: number }[];
};
export type View = [number, number, number, number];

/** The view for a frame: each moment's view, eased in over its first frames. */
export function viewAt(form: Form, frame: number, settle = 8): View | null {
  const views = form.views;
  if (!views) return null;
  let i = form.moments.findIndex(([a, b]) => frame >= a && frame < b);
  if (i === -1) i = frame < form.moments[0][0] ? 0 : form.moments.length - 1;
  if (i === 0) return views[0];
  const t = Math.min(1, Math.max(0, (frame - form.moments[i][0]) / settle));
  const e = t * t * (3 - 2 * t);
  const from = views[i - 1];
  const to = views[i];
  return from.map((v, k) => v + (to[k] - v) * e) as View;
}
export type Manifest = { desktop: Form; phone?: Form };

/** The counter's running totals at a frame: the first frame's before the footage starts, the last frame's after it ends. */
export function countsAt(form: Form, frame: number): { car: number; bus: number; truck: number } | null {
  if (!form.counts?.length) return null;
  return form.counts[Math.min(form.counts.length - 1, Math.max(0, frame))];
}

export const frameUrl = (name: string, form: string, i: number) =>
  `sequences/${name}/${form}/${String(i + 1).padStart(3, "0")}.webp`;

/** Load order: every 16th frame, then every 8th, 4th, 2nd, then the rest. */
export function loadOrder(n: number): number[] {
  // The first and last frames come first, so either end of the scrub can show at once.
  const order = n > 1 ? [0, n - 1] : [0];
  const seen = new Set(order);
  for (const step of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < n; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

/** The loaded frame nearest to `target`, or -1. */
export function nearest(loaded: ArrayLike<unknown>, target: number): number {
  const n = loaded.length;
  for (let d = 0; d < n; d++) {
    if (target - d >= 0 && loaded[target - d]) return target - d;
    if (target + d < n && loaded[target + d]) return target + d;
  }
  return -1;
}

export class Sequence {
  readonly form: Form;
  private images: (HTMLImageElement | undefined)[];
  private ready: boolean[];
  private started = false;
  private current = -1;
  private wanted = 0;
  private view: View | null = null;
  private drawnView = "";
  private ctx: CanvasRenderingContext2D | null;

  constructor(
    private canvas: HTMLCanvasElement,
    private name: string,
    private formName: "desktop" | "phone",
    form: Form
  ) {
    this.form = form;
    this.images = new Array(form.frames);
    this.ready = new Array(form.frames).fill(false);
    this.ctx = canvas.getContext("2d");
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.current = -1;
      this.draw(this.wanted);
    }
  }

  /** Start loading frames (idempotent). */
  load(concurrency = 6) {
    if (this.started) return;
    this.started = true;
    const queue = loadOrder(this.form.frames);
    const next = () => {
      const i = queue.shift();
      if (i === undefined) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        this.ready[i] = true;
        this.images[i] = img;
        if (Math.abs(i - this.wanted) < Math.abs(this.current - this.wanted) || this.current === -1) this.draw(this.wanted);
        next();
      };
      img.onerror = () => next();
      img.src = frameUrl(this.name, this.formName, i);
    };
    for (let k = 0; k < concurrency; k++) next();
  }

  /** The frame index for a progress from 0 to 1. */
  frameAt(progress: number): number {
    return Math.round(Math.min(1, Math.max(0, progress)) * (this.form.frames - 1));
  }

  /** Draw the frame for a progress from 0 to 1, through an optional view. Returns the frame index. */
  seek(progress: number, view: View | null = null): number {
    const i = this.frameAt(progress);
    this.wanted = i;
    this.view = view;
    this.draw(i);
    return i;
  }

  private draw(target: number) {
    const i = nearest(this.ready, target);
    const key = this.view ? this.view.map((v) => v.toFixed(1)).join() : "";
    if (i === -1 || !this.ctx || (i === this.current && key === this.drawnView)) return;
    const img = this.images[i]!;
    const { width: cw, height: ch } = this.canvas;
    const [sx, sy, sw, sh] = this.view ?? [0, 0, img.naturalWidth, img.naturalHeight];
    // Cover the canvas with the view, keeping its aspect.
    const scale = Math.max(cw / sw, ch / sh);
    const w = sw * scale;
    const h = sh * scale;
    this.ctx.drawImage(img, sx, sy, sw, sh, (cw - w) / 2, (ch - h) / 2, w, h);
    this.current = i;
    this.drawnView = key;
  }
}
