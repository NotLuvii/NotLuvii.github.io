/* The pointer, tracked the way the vehicle counter tracks a car: a fading path behind it and a box with
   its ID. It draws only while the mouse moves and stops itself once the path has faded, so a page at
   rest costs nothing. Touch screens have no pointer to follow and get none of it. */

const LIFE = 1600; // how long a point of the path stays, in ms
const HOLD = 700; // how long the box stays after the pointer stops, before it fades
const BOX_FADE = 900;
const INK = "245, 245, 247";

/** From 1 (just drawn) to 0 (gone) over `life` ms. */
export const fade = (age: number, life: number) => Math.max(0, Math.min(1, 1 - age / life));

export function startTrail() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "trail";
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.active = "false";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d")!;
  const points: { x: number; y: number; t: number }[] = [];
  let raf = 0;
  // Only the area the track covered last frame is cleared, so a frame costs the size of the track.
  let dirty: { x: number; y: number; w: number; h: number } | null = null;

  const size = () => {
    dirty = null;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (now: number) => {
    raf = 0;
    while (points.length && now - points[0].t > LIFE) points.shift();
    if (dirty) ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h);
    dirty = null;
    const last = points[points.length - 1];
    if (!last) {
      canvas.dataset.active = "false";
      return;
    }
    let x0 = last.x - 30, y0 = last.y - 46, x1 = last.x + 30, y1 = last.y + 30;
    for (const p of points) {
      x0 = Math.min(x0, p.x - 4);
      y0 = Math.min(y0, p.y - 4);
      x1 = Math.max(x1, p.x + 4);
      y1 = Math.max(y1, p.y + 4);
    }
    x1 = Math.max(x1, last.x + 60); // the label runs right of the box
    dirty = { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0) + 1, h: Math.ceil(y1 - y0) + 1 };
    // The path: a hairline, with a dot every few samples, like a track's history.
    ctx.lineWidth = 1;
    for (let i = 1; i < points.length; i++) {
      ctx.strokeStyle = `rgba(${INK}, ${0.16 * fade(now - points[i].t, LIFE)})`;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
    for (let i = points.length - 1; i >= 0; i -= 5) {
      ctx.fillStyle = `rgba(${INK}, ${0.4 * fade(now - points[i].t, LIFE)})`;
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // The box, labelled the way the counter labels what it follows.
    const box = fade(now - last.t - HOLD, BOX_FADE);
    if (box > 0) {
      ctx.strokeStyle = `rgba(${INK}, ${0.32 * box})`;
      ctx.strokeRect(Math.round(last.x - 26) + 0.5, Math.round(last.y - 26) + 0.5, 52, 52);
      ctx.font = '11px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
      ctx.fillStyle = `rgba(${INK}, ${0.5 * box})`;
      ctx.fillText("you · ID 1", Math.round(last.x - 26), Math.round(last.y - 32));
    }
    canvas.dataset.active = "true";
    raf = requestAnimationFrame(draw);
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };

  size();
  addEventListener("resize", () => {
    size();
    run();
  });
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (points.length > 240) points.shift();
      run();
    },
    { passive: true }
  );
}
