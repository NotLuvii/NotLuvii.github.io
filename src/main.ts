import { mountChecker } from "./checker";
import { startField } from "./field";
import { startGreeting } from "./greeting";

/* The checker and copy-email work with or without motion. */
function whenRulesLoaded(fn: () => void) {
  if (typeof (window as unknown as { Detectors?: unknown }).Detectors !== "undefined" || document.readyState === "complete") fn();
  else window.addEventListener("load", fn, { once: true });
}
const checker = document.querySelector<HTMLElement>("[data-checker]");
if (checker) whenRulesLoaded(() => mountChecker(checker));

const copy = document.querySelector<HTMLButtonElement>("[data-copy]");
const copyStatus = document.querySelector<HTMLElement>("[data-copy-status]");
if (copy && navigator.clipboard?.writeText) {
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy!);
      copy.textContent = "Copied";
      if (copyStatus) copyStatus.textContent = "Email address copied to your clipboard.";
    } catch {
      if (copyStatus) copyStatus.textContent = "Couldn’t copy automatically. Select the address above and copy it.";
    }
  });
}

/* In-page links glide only once the page has loaded (see html.settled in the stylesheet). */
const settle = () => requestAnimationFrame(() => document.documentElement.classList.add("settled"));
if (document.readyState === "complete") settle();
else addEventListener("load", settle, { once: true });

/* Motion only when it's welcome; otherwise the stills stay. */
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reduce.matches) {
  import("./motion").then((m) => m.startMotion());
}

/* The field of dots behind every section (drawn still with reduced motion), and the greeting. Both move
   on their own, so they come with a way to pause them, remembered on this device. */
const field = startField({ still: reduce.matches });
const cycle = document.querySelector<HTMLElement>("[data-cycle]");
// The phrases are on the page already, as the hidden copies that hold the headline's height.
const phrases = [...document.querySelectorAll<HTMLElement>(".cycle-ghost")].map((g) => g.dataset.w!);
const greet = cycle && phrases.length > 1 && !reduce.matches ? startGreeting(cycle, phrases) : null;
const toggle = document.querySelector<HTMLButtonElement>("[data-motion-toggle]");
if (toggle && !reduce.matches) {
  const label = toggle.querySelector<HTMLElement>("[data-motion-label]")!;
  const remember = (paused: boolean) => {
    try {
      if (paused) localStorage.setItem("motion", "paused");
      else localStorage.removeItem("motion");
    } catch {
      /* storage can be unavailable; the choice then lasts for this visit */
    }
  };
  const set = (paused: boolean) => {
    toggle.classList.toggle("paused", paused);
    label.textContent = paused ? "Play motion" : "Pause motion";
    if (paused) {
      field.pause();
      greet?.pause();
    } else {
      field.play();
      greet?.play();
    }
  };
  let paused = false;
  try {
    paused = localStorage.getItem("motion") === "paused";
  } catch {
    paused = false;
  }
  set(paused);
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    paused = !paused;
    set(paused);
    remember(paused);
  });
}
