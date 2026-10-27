/* A field of dots behind the whole page. They drift slowly and draw a faint line to any dot close by,
   fading with distance; near the mouse they reach for it too. The field is fixed to the screen and stays
   put as the page scrolls over it. With reduced motion it is drawn once and
   holds still. Decoration only: hidden from screen readers, never in front of the content. */

const INK = "245, 245, 247";

/** How many dots for a screen: about one per 16,000 square pixels, between 24 and 110. */
export const countFor = (w: number, h: number) => Math.round(Math.min(110, Math.max(24, (w * h) / 16000)));

/** Pairs of dots closer than `reach`, with a strength from 1 (touching) down towards 0 (at reach). */
export function links(dots: { x: number; y: number }[], reach: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const r2 = reach * reach;
  for (let i = 0; i < dots.length; i++)
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2) {
        const s = 1 - Math.sqrt(d2) / reach;
        out.push([i, j, s * s]);
      }
    }
  return out;
}

type Dot = { x: number; y: number; vx: number; vy: number };
const MARGIN = 40;
const POINTER_REACH = 180;
const BUCKETS = 5;

export function startField({ still }: { still: boolean }) {
  const canvas = document.createElement("canvas");
  canvas.className = "field";
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.reach = "0";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d")!;
  const fine = !still && matchMedia("(hover: hover) and (pointer: fine)").matches;
  let w = 0;
  let h = 0;
  let reach = 120;
  let dots: Dot[] = [];
  let pointer: { x: number; y: number } | null = null;
  let raf = 0;
  let last = 0;
  let paused = false;

  const spawn = (): Dot => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 10; // px per second: a drift, not a swarm
    return { x: Math.random() * (w + MARGIN * 2) - MARGIN, y: Math.random() * (h + MARGIN * 2) - MARGIN, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  };

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    reach = Math.min(140, Math.max(100, w * 0.09));
    const n = countFor(w, h);
    while (dots.length < n) dots.push(spawn());
    dots.length = n;
    canvas.dataset.count = String(n);
  };

  const wrap = (v: number, size: number) => ((((v + MARGIN) % (size + MARGIN * 2)) + size + MARGIN * 2) % (size + MARGIN * 2)) - MARGIN;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const at = dots;
    // Lines, batched by strength so each batch is one stroke.
    const batches: number[][] = Array.from({ length: BUCKETS }, () => []);
    for (const [i, j, s] of links(at, reach)) batches[Math.min(BUCKETS - 1, Math.floor(s * BUCKETS))].push(at[i].x, at[i].y, at[j].x, at[j].y);
    ctx.lineWidth = 1;
    batches.forEach((b, k) => {
      if (!b.length) return;
      ctx.strokeStyle = `rgba(${INK}, ${(0.05 + 0.16 * ((k + 0.5) / BUCKETS)).toFixed(3)})`;
      ctx.beginPath();
      for (let n = 0; n < b.length; n += 4) {
        ctx.moveTo(b[n], b[n + 1]);
        ctx.lineTo(b[n + 2], b[n + 3]);
      }
      ctx.stroke();
    });
    // The mouse: the dots near it reach for it.
    let reached = 0;
    if (pointer) {
      for (const p of at) {
        const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (d >= POINTER_REACH) continue;
        const s = (1 - d / POINTER_REACH) ** 2;
        ctx.strokeStyle = `rgba(${INK}, ${(0.08 + 0.3 * s).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
        reached++;
      }
    }
    if (canvas.dataset.reach !== String(reached)) canvas.dataset.reach = String(reached);
    ctx.fillStyle = `rgba(${INK}, 0.42)`;
    ctx.beginPath();
    for (const p of at) {
      ctx.moveTo(p.x + 1.2, p.y);
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    }
    ctx.fill();
  };

  // The drift is slow enough to look the same at 30 frames a second, which halves the cost; the field
  // only runs at full rate while the mouse is moving through it.
  let moved = -Infinity;
  let odd = false;
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    odd = !odd;
    if (odd && now - moved > 1000) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    for (const d of dots) {
      d.x = wrap(d.x + d.vx * dt, w);
      d.y = wrap(d.y + d.vy * dt, h);
    }
    draw();
  };

  const run = () => {
    if (still || paused || raf) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  };

  size();
  draw();
  addEventListener("resize", () => {
    size();
    draw();
  });
  if (fine) {
    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY };
        moved = performance.now();
        if (paused) draw();
      },
      { passive: true }
    );
    document.documentElement.addEventListener("mouseleave", () => {
      pointer = null;
      if (paused) draw();
    });
  }
  run();

  return {
    pause() {
      paused = true;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    play() {
      paused = false;
      run();
    },
  };
}
