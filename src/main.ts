import { mountChecker } from "./checker";

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

/* Motion only when it's welcome; otherwise the stills stay. */
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reduce.matches) {
  import("./motion").then((m) => m.startMotion());
}
