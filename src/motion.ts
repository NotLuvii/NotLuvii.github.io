import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { countsAt, Sequence, viewAt, type Manifest } from "./sequence";

/**
 * Scroll-linked motion. Nothing moves unless the visitor scrolls; scrolling stays native (no snapping,
 * no hijacking, no pinning: stages are CSS sticky). Each chapter's stage holds still while its recording scrubs through three moments;
 * the thread between chapters carries the same signal colour from one tool to the next.
 * Not loaded at all with reduced motion: the page then shows each moment as a still.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export async function startMotion() {
  gsap.registerPlugin(ScrollTrigger);
  // A link to a section (/#contact) is followed before the chapters take their full length, which moves
  // everything below the first one. Unless the visitor has started moving, go to it again once they have.
  let moved = false;
  const move = () => (moved = true);
  for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) addEventListener(type, move, { once: true, passive: true });
  document.documentElement.classList.add("motion");
  opening();
  // Each stage is position: sticky inside a tall track (CSS), so scrolling stays native and no spacers
  // are needed; the triggers only read how far through its track the visitor is.
  const sections = [...document.querySelectorAll<HTMLElement>("[data-chapter], .thread")];
  const manifests = await Promise.all(
    sections.map((el) =>
      el.dataset.chapter
        ? fetch(`sequences/${el.dataset.chapter}/manifest.json`).then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null)).catch(() => null)
        : Promise.resolve(null)
    )
  );
  sections.forEach((el, i) => (el.dataset.chapter ? chapter(el, manifests[i]) : thread(el)));
  ScrollTrigger.refresh();
  const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (target && !moved) target.scrollIntoView({ block: "start", behavior: "instant" });
}

/* ── Opening: the scattered words drift into the line as you start to scroll ── */
function opening() {
  const section = document.querySelector<HTMLElement>(".opening");
  if (!section) return;
  const words = [...section.querySelectorAll<HTMLElement>(".word")];
  const copy = section.querySelector<HTMLElement>(".opening-copy");
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: ({ progress }) => {
      const t = ease(span(progress, 0, 0.7));
      const box = section.getBoundingClientRect();
      for (const w of words) {
        const x = (parseFloat(w.style.getPropertyValue("--x")) / 100 - 0.5) * box.width;
        const y = (parseFloat(w.style.getPropertyValue("--y")) / 100 - 0.5) * box.height;
        w.style.transform = `translate(${-x * t * 0.9}px, ${-y * t * 0.9}px) scale(${1 - t * 0.5})`;
        w.style.opacity = String(Number(w.style.getPropertyValue("--o")) * (1 - t));
      }
      if (copy) copy.style.opacity = String(1 - span(progress, 0.55, 0.95));
    },
  });
}

/* ── Chapters: rise, hold, scrub ── */
function chapter(el: HTMLElement, manifest: Manifest | null) {
  const name = el.dataset.chapter!;
  const stage = el.querySelector<HTMLElement>("[data-stage]")!;
  const device = el.querySelector<HTMLElement>("[data-device-frame]")!;
  const canvas = el.querySelector<HTMLCanvasElement>("canvas.sequence")!;
  const moments = [...el.querySelectorAll<HTMLElement>(".moment")];
  if (!manifest) {
    // Without its footage the chapter stays as stills.
    el.classList.add("no-sequence");
    return;
  }
  const phone = window.matchMedia("(max-width: 43.75rem)").matches && manifest.phone && el.dataset.device === "laptop";
  const formName = phone ? "phone" : "desktop";
  const form = phone ? manifest.phone! : manifest.desktop;
  const seq = new Sequence(canvas, name, formName, form);
  const counts = el.querySelector<HTMLElement>("[data-counts]");

  // Load the frames as the stage approaches: within a quarter of a screen, which leaves the chapter's
  // heading to read while they arrive, and keeps the first screen light.
  new IntersectionObserver(
    (entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        seq.load();
        obs.disconnect();
      }
    },
    { rootMargin: "25% 0px" }
  ).observe(stage.parentElement!);

  const show = (frame: number) => {
    form.moments.forEach(([a, b], i) => {
      const inside = frame >= a && frame < b;
      moments[i]?.style.setProperty("opacity", inside ? "1" : "0");
    });
    const c = countsAt(form, frame);
    if (counts && c) {
      counts.querySelector("[data-car]")!.textContent = String(c.car);
      counts.querySelector("[data-bus]")!.textContent = String(c.bus);
      counts.querySelector("[data-truck]")!.textContent = String(c.truck);
    }
  };

  const apply = (progress: number) => {
    const rise = ease(span(progress, 0, 0.12));
    device.style.transform = `translateY(${(1 - rise) * 24}vh) scale(${0.86 + 0.14 * rise})`;
    const p = span(progress, 0.12, 0.94);
    const frame = seq.seek(p, viewAt(form, seq.frameAt(p)));
    show(progress < 0.08 ? -1 : frame);
  };

  el.classList.add("has-sequence");
  // The stage takes the state for wherever the visitor already is, which isn't always the top: a
  // reload keeps the scroll position, and the triggers start only after the manifests arrive.
  const st = ScrollTrigger.create({
    trigger: stage.parentElement!,
    start: "top top",
    end: "bottom bottom",
    onRefresh: (self) => {
      seq.resize();
      apply(self.progress);
    },
    onUpdate: ({ progress }) => apply(progress),
  });
  apply(st.progress);
  window.addEventListener("resize", () => seq.resize());
}

/* ── The thread: phrases become chips, chips become skills; then skills become boxes ── */
function thread(el: HTMLElement) {
  const chips = [...el.querySelectorAll<HTMLElement>(".thread-chip")];
  const line = el.querySelector<HTMLElement>(".thread-line")!;
  const boxes = el.classList.contains("thread-boxes");
  // The chips start scattered and gather into a row. Each one's scatter is held so the whole chip stays
  // on the screen; measured from the gathered layout (offsets ignore transforms) on every refresh,
  // which follows every resize.
  const stage = el.querySelector<HTMLElement>(".thread-stage")!;
  let spread: { x: number; y: number }[] = [];
  const measure = () => {
    const width = document.documentElement.clientWidth;
    const edge = 16;
    const step = Math.min(140, width / 8);
    const left0 = stage.getBoundingClientRect().left;
    spread = chips.map((c, i) => {
      const left = left0 + c.offsetLeft;
      const want = (i - (chips.length - 1) / 2) * step;
      const x = Math.max(edge - left, Math.min(width - edge - (left + c.offsetWidth), want));
      return { x, y: (i % 2 ? 1 : -1) * 90 };
    });
  };
  measure();
  const apply = (progress: number) => {
    const gather = ease(span(progress, 0, 0.4));
    const swap = ease(span(progress, 0.4, 0.7));
    chips.forEach((c, i) => {
      const s = spread[i];
      const from = c.querySelector<HTMLElement>(".from")!;
      const to = c.querySelector<HTMLElement>(".to")!;
      c.style.transform = `translate(${s.x * (1 - gather)}px, ${s.y * (1 - gather)}px)`;
      if (boxes) {
        // The chip empties into an outline: the box the counter will draw.
        c.style.background = `rgba(212, 255, 58, ${1 - swap})`;
        c.style.boxShadow = `inset 0 0 0 ${2 * swap}px #d4ff3a`;
        c.style.borderRadius = `${999 * (1 - swap) + 6 * swap}px`;
        from.style.opacity = String(1 - swap);
        c.style.minWidth = `${swap * (90 + i * 18)}px`;
        c.style.minHeight = `${44 + swap * (30 + (i % 2) * 22)}px`;
      } else {
        from.style.opacity = String(1 - swap);
        to.style.opacity = String(swap);
      }
    });
    line.style.opacity = String(span(progress, 0.45, 0.75));
  };
  const st = ScrollTrigger.create({
    trigger: el,
    start: "top top",
    end: "bottom bottom",
    onRefresh: (self) => {
      measure();
      apply(self.progress);
    },
    onUpdate: ({ progress }) => apply(progress),
  });
  apply(st.progress);
}
