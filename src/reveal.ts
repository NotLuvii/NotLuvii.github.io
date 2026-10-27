import { ScrollTrigger } from "gsap/ScrollTrigger";

/* The page's other scroll animations, each tied to the scroll position (scroll back and it reverses):
   headings rise into place word by word; chapter intros and About light up as you read down; the
   experience line draws down, each role arrives as it reaches it and the figures count up; cards slide
   up into place. Loaded only with motion, so without it (or without JavaScript) everything is simply
   there, at its final state. */

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
type RGB = [number, number, number];
const DIM: RGB = [134, 134, 139]; // --text-3, which still reads at 5.7:1 on black
const LIT: RGB = [245, 245, 247]; // --text

/** Item i of n's own progress within an overall progress p: the first starts at once, the last finishes at 1. */
export function stagger(p: number, i: number, n: number, spread = 0.12): number {
  if (n <= 1) return clamp(p);
  const step = Math.min(spread, 0.6 / (n - 1));
  return clamp((p - i * step) / (1 - step * (n - 1)));
}

/** A figure counting up from 0 to `to` as t goes from 0 to 1, landing exactly on it. */
export const countTo = (to: number, t: number) => (t >= 1 ? to : Math.round(to * ease(clamp(t))));

/** A colour between two, as CSS. */
export const mix = (a: RGB, b: RGB, t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ")})`;

/** Wrap each word of an element's text in spans of class `cls`; returns the spans that move or change. */
function words(el: HTMLElement, cls: string, mask: boolean): HTMLElement[] {
  const out: HTMLElement[] = [];
  const text = el.textContent ?? "";
  const parts = text.split(/(\s+)/);
  el.replaceChildren(
    ...parts.map((part) => {
      if (!part.trim()) return document.createTextNode(part);
      const word = document.createElement("span");
      word.className = cls;
      word.textContent = part;
      if (!mask) {
        out.push(word);
        return word;
      }
      // A mask that each word rises out of.
      const outer = document.createElement("span");
      outer.className = "rise";
      outer.setAttribute("aria-hidden", "true");
      outer.append(word);
      out.push(word);
      return outer;
    })
  );
  return out;
}

/** A trigger whose progress drives `apply`, also applied at once and after every refresh. */
function scrub(trigger: Element, start: string, end: string, apply: (p: number) => void) {
  const st = ScrollTrigger.create({ trigger, start, end, onRefresh: (s) => apply(s.progress), onUpdate: (s) => apply(s.progress) });
  apply(st.progress);
}

function headings() {
  for (const h of document.querySelectorAll<HTMLElement>(".chapter-title, .section-title, .try-title")) {
    h.setAttribute("aria-label", (h.textContent ?? "").trim());
    const ws = words(h, "rise-in", true);
    scrub(h, "top 95%", "top 62%", (p) =>
      ws.forEach((w, i) => {
        const t = ease(stagger(p, i, ws.length, 0.1));
        w.style.transform = t >= 1 ? "" : `translateY(${(1 - t) * 110}%)`;
      })
    );
  }
}

function readAlong() {
  for (const el of document.querySelectorAll<HTMLElement>(".chapter-lede, .about-text")) {
    const ws = words(el, "read", false);
    scrub(el, "top 88%", "top 38%", (p) => {
      const lit = p * ws.length;
      ws.forEach((w, i) => (w.style.color = mix(DIM, LIT, clamp(lit - i))));
    });
  }
}

function timeline() {
  const list = document.querySelector<HTMLElement>("#experience .entries");
  if (!list) return;
  const entries = [...list.querySelectorAll<HTMLElement>(":scope > .entry")];
  const figures = [...list.querySelectorAll<HTMLElement>(".figure")].map((f) => ({ f, to: Number(f.dataset.to), entry: f.closest<HTMLElement>(".entry")! }));
  scrub(list, "top 80%", "bottom 60%", (p) => {
    list.style.setProperty("--drawn", String(p));
    const reach = p * list.offsetHeight;
    for (const e of entries) {
      // A role arrives over the 140px of line just past its top.
      const t = clamp((reach - e.offsetTop) / 140);
      e.style.setProperty("--arrive", String(t));
      // Hidden until the line reaches it, not half there: faint text would be hard to read.
      e.style.opacity = String(ease(t));
      e.style.transform = t >= 1 ? "" : `translateX(${(1 - ease(t)) * -1}rem)`;
    }
    for (const { f, to, entry } of figures) {
      const t = clamp((reach - entry.offsetTop - 60) / 240);
      f.textContent = `${countTo(to, t)}%`;
    }
  });
}

function cards() {
  const groups = [".more-list > li", ".skills > div", ".approach > li", ".try > .try-note, .try > .try-card", ".limit", ".contact > :not(h2)"];
  for (const sel of groups) {
    const items = [...document.querySelectorAll<HTMLElement>(sel)];
    // Items side by side in a row arrive one after another; each row as it enters.
    let rows = new Map<HTMLElement, [number, number]>();
    const measure = () => {
      rows = new Map();
      const byTop = new Map<string, HTMLElement[]>();
      const parents = new Map<Element | null, number>();
      for (const el of items) {
        if (!parents.has(el.parentElement)) parents.set(el.parentElement, parents.size);
        const key = `${parents.get(el.parentElement)}:${Math.round(el.offsetTop / 8)}`;
        byTop.set(key, [...(byTop.get(key) ?? []), el]);
      }
      for (const row of byTop.values()) row.forEach((el, i) => rows.set(el, [i, row.length]));
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    for (const el of items)
      scrub(el, "top 96%", "top 70%", (p) => {
        const [i, n] = rows.get(el) ?? [0, 1];
        const t = ease(stagger(p, i, n, 0.18));
        el.style.opacity = String(t);
        el.style.transform = t >= 1 ? "" : `translateY(${(1 - t) * 3}rem) scale(${0.97 + 0.03 * t})`;
      });
  }
}

export function startReveals() {
  headings();
  readAlong();
  timeline();
  cards();
}
