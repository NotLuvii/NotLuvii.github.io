/* The tools' own inputs, set very faintly behind the empty stretches of the story: the phishing email,
   the job posting, and the vehicle counter's tracker log. What each tool caught is lit in the signal
   colour. Near the mouse the text comes up a little, as if read; it always stays clear of the sentences
   it sits behind. Drawn on a canvas: decoration for the eye, not text for a reader or screen reader. */

export type Piece = { text: string; mark: boolean };
export type TrackLine = { frame: number; cls: string; id: string; box: [number, number, number, number] };
export type TrackLog = { source: string; model: string; tracker: string; lines: TrackLine[] };

/** A tracker log line: frame, class, ID and box, in columns. */
export const logLine = (l: TrackLine) => `${String(l.frame).padStart(4, "0")}  ${l.cls.padEnd(5)}  ID ${l.id.padEnd(3)}  [${l.box.join(" ")}]`;

/** Split text into runs, marking each whole-word occurrence of a phrase the tool caught. */
export function pieces(text: string, marks: string[]): Piece[] {
  if (!marks.length) return [{ text, mark: false }];
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![\\w-])(${marks.map(escape).join("|")})(?![\\w-])`, "gi");
  const out: Piece[] = [];
  let at = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > at) out.push({ text: text.slice(at, m.index), mark: false });
    out.push({ text: m[0], mark: true });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at), mark: false });
  return out;
}

const FONT = '12px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const LINE = 26;
const PAD = 20;
const NEAR = 220; // radius of the clearer patch around the mouse
const STYLE = {
  plain: "rgba(245, 245, 247, 0.05)",
  mark: "rgba(212, 255, 58, 0.16)",
  plainNear: "rgba(245, 245, 247, 0.3)",
  markNear: "rgba(212, 255, 58, 0.75)",
};

type Row = { y: number; segs: { x: number; text: string; mark: boolean }[] };

/** Lay a stream of runs out in rows of `cols` monospace characters, breaking between words. */
function layout(stream: Piece[], cols: number, rows: number, charW: number): Row[] {
  let text = "";
  const marked: boolean[] = [];
  const one = stream.reduce((n, p) => n + p.text.length, 0);
  if (!one || cols < 8) return [];
  while (text.length < cols * rows * 1.15) {
    for (const p of stream) {
      text += p.text.replace(/\s+/g, " ");
      for (let i = marked.length; i < text.length; i++) marked[i] = p.mark;
    }
  }
  const out: Row[] = [];
  let pos = 0;
  for (let r = 0; r < rows && pos < text.length; r++) {
    while (text[pos] === " ") pos++;
    let end = Math.min(pos + cols, text.length);
    if (end < text.length && text[end] !== " ") {
      const space = text.lastIndexOf(" ", end);
      if (space > pos + cols / 2) end = space;
    }
    const segs: Row["segs"] = [];
    for (let i = pos; i < end; ) {
      let j = i;
      while (j < end && marked[j] === marked[i]) j++;
      segs.push({ x: PAD + (i - pos) * charW, text: text.slice(i, j), mark: marked[i] });
      i = j;
    }
    out.push({ y: PAD + LINE * (r + 0.75), segs });
    pos = end;
  }
  return out;
}

export class SourceText {
  /** The faint layer, drawn once per size. */
  readonly canvas = document.createElement("canvas");
  /** The clearer layer, seen only through a round lens that follows the mouse (moved by transform alone). */
  private lens: HTMLDivElement | null = null;
  private clearer: HTMLCanvasElement | null = null;
  private rows: Row[] = [];
  private charW = 7;
  private dpr = 1;
  private w = 0;
  private h = 0;

  constructor(
    private host: HTMLElement,
    input: string,
    private stream: () => Piece[],
    private holes: () => Element[] = () => [],
    lens = false
  ) {
    this.canvas.className = "source";
    this.canvas.dataset.input = input;
    this.canvas.setAttribute("aria-hidden", "true");
    if (lens) {
      this.lens = document.createElement("div");
      this.lens.className = "source-lens";
      this.lens.setAttribute("aria-hidden", "true");
      this.lens.style.setProperty("--near", `${NEAR * 2}px`);
      this.clearer = document.createElement("canvas");
      this.lens.append(this.clearer);
      host.prepend(this.lens);
    }
    host.prepend(this.canvas);
  }

  /** Give the canvases their pixels (only while near the screen), lay the text out and draw both layers. */
  size() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.w = r.width;
    this.h = r.height;
    const layers: [HTMLCanvasElement, boolean][] = [[this.canvas, false]];
    if (this.clearer) layers.push([this.clearer, true]);
    for (const [c, near] of layers) {
      c.width = Math.round(r.width * this.dpr);
      c.height = Math.round(r.height * this.dpr);
      if (near) {
        // The faint canvas takes its size from CSS (the screen's width); the lens's copy matches it.
        c.style.width = `${r.width}px`;
        c.style.height = `${r.height}px`;
      }
      const ctx = c.getContext("2d")!;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.font = FONT;
      if (!near) {
        this.charW = ctx.measureText("0").width;
        const cols = Math.floor((this.w - PAD * 2) / this.charW);
        const rows = Math.ceil((this.h - PAD) / LINE);
        this.rows = layout(this.stream(), cols, rows, this.charW);
      }
      this.text(ctx, near);
      this.clear(ctx, r);
    }
  }

  /** Free the pixels of a canvas far from the screen. */
  release() {
    for (const c of [this.canvas, this.clearer]) if (c) c.width = c.height = 0;
    this.rows = [];
    this.point(null);
  }

  get live() {
    return this.canvas.width > 0;
  }

  setOpacity(v: number) {
    const o = String(Math.round(v * 1000) / 1000);
    this.canvas.style.opacity = o;
    if (this.lens) this.lens.style.opacity = o;
  }

  /** Put the lens over the mouse, showing the clearer layer beneath it; or hide it. */
  point(pointer: { x: number; y: number } | null) {
    if (!this.lens || !this.clearer) return;
    if (!pointer || !this.live) {
      this.lens.style.visibility = "hidden";
      return;
    }
    const host = this.host.getBoundingClientRect();
    const base = this.canvas.getBoundingClientRect();
    const lx = pointer.x - host.left - NEAR;
    const ly = pointer.y - host.top - NEAR;
    this.lens.style.transform = `translate(${lx}px, ${ly}px)`;
    this.clearer.style.transform = `translate(${base.left - host.left - lx}px, ${base.top - host.top - ly}px)`;
    this.lens.style.visibility = "visible";
  }

  private text(ctx: CanvasRenderingContext2D, near: boolean) {
    for (const row of this.rows)
      for (const seg of row.segs) {
        ctx.fillStyle = seg.mark ? (near ? STYLE.markNear : STYLE.mark) : near ? STYLE.plainNear : STYLE.plain;
        ctx.fillText(seg.text, seg.x, row.y);
      }
  }

  /** Keep a soft clear margin around each line of the sentences this sits behind. */
  private clear(ctx: CanvasRenderingContext2D, box: DOMRect) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (const el of this.holes()) {
      const range = document.createRange();
      range.selectNodeContents(el);
      for (const r of range.getClientRects()) {
        if (!r.width) continue;
        const x = r.left - box.left;
        const y = r.top - box.top;
        for (let k = 0; k < 6; k++) {
          const m = 8 + (5 - k) * 8;
          ctx.fillStyle = `rgba(0, 0, 0, ${k === 5 ? 1 : 0.22})`;
          ctx.beginPath();
          ctx.roundRect(x - m, y - m, r.width + m * 2, r.height + m * 2, 16 + m / 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}

/** Keep every source near the screen drawn, and move the lenses with the mouse and the scroll. */
export function runSources(sources: SourceText[]) {
  if (!sources.length) return { refresh: (_: SourceText) => {} };
  const live = new Set<SourceText>();
  let pointer: { x: number; y: number } | null = null;
  let raf = 0;
  const follow = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        for (const s of live) s.point(pointer);
      });
  };
  const byCanvas = new Map(sources.map((s) => [s.canvas, s]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = byCanvas.get(e.target as HTMLCanvasElement)!;
        if (e.isIntersecting) {
          s.size();
          live.add(s);
        } else {
          s.release();
          live.delete(s);
        }
      }
      follow();
    },
    { rootMargin: "50% 0px" }
  );
  for (const s of sources) io.observe(s.canvas);
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      follow();
    },
    { passive: true }
  );
  document.documentElement.addEventListener("mouseleave", () => {
    pointer = null;
    follow();
  });
  addEventListener("scroll", () => pointer && follow(), { passive: true });
  addEventListener("resize", () => {
    for (const s of live) s.size();
    follow();
  });
  return {
    /** Lay a source out again once text it was waiting for has arrived. */
    refresh(s: SourceText) {
      if (live.has(s)) s.size();
      follow();
    },
  };
}
