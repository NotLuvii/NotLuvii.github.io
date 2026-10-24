/**
 * "Try it on your own text": the scam detection tool's own rules (public/vendor/detectors.js, a verbatim
 * copy from its redesign-2026 branch) running in the page.
 *
 * Two guards sit outside the copy, against defects in the tool itself, both described in its case study:
 * - some of its regular expressions are global and reused with test(), so a second check could miss what
 *   the first found; every RegExp in the rules is reset before each run;
 * - Chrome's URL parser accepts spaces in a host name where the URL standard rejects them, so text like
 *   "not a url at all" passes as a link; text with spaces is reported as not a valid URL, as the tool
 *   does in other browsers.
 */

type Issue = { type: string; msg: string };
type Result = { risk: number; level: "high" | "medium" | "low"; issues: Issue[] };
type Kind = "phishing" | "sms" | "listing" | "link";
type Rules = Record<Kind, { run(text: string): Result }>;

declare const Detectors: Rules | undefined;

export const SAMPLES: Record<Kind, string> = {
  phishing:
    "Dear Customer, Your account has been suspended due to unusual activity.\nVerify your identity immediately: https://paypal-secure.com/verify-now\nClick here to restore access. Do not ignore this message.",
  sms: "URGENT: Your bank detected unusual activity. Confirm now: https://bit.ly/xy7z\nReply YES to secure your account.",
  listing: "iPhone 15 Pro - brand new, must sell today. Moving overseas.\nContact me on WhatsApp. Wire transfer or Western Union only. Price negotiable.",
  link: "https://www.amazon.com.secure-login.xyz/verify",
};

const PLACEHOLDER: Record<Kind, string> = {
  phishing: "Paste an email to check",
  sms: "Paste a text message to check",
  listing: "Paste a listing to check",
  link: "Paste a link to check",
};

const LEVEL: Record<Result["level"], [string, string]> = {
  high: ["High risk", "Treat as suspicious and avoid clicking links or sharing info."],
  medium: ["Medium risk", "Review the flagged items before trusting this content."],
  low: ["Low risk", "Few or no obvious red flags, but stay cautious."],
};

function resetRegExps(value: unknown, seen = new Set<unknown>()) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (value instanceof RegExp) {
    value.lastIndex = 0;
    return;
  }
  for (const v of Object.values(value as Record<string, unknown>)) resetRegExps(v, seen);
}

export function check(rules: Rules, kind: Kind, text: string): Result | null {
  const input = text.trim();
  if (!input) return null;
  resetRegExps(rules);
  if (kind === "link" && /\s/.test(input)) {
    return { risk: 100, level: "high", issues: [{ type: "invalid", msg: "This is not a valid URL." }] };
  }
  return rules[kind].run(input);
}

export function mountChecker(root: HTMLElement) {
  const rules = typeof Detectors === "undefined" ? undefined : Detectors;
  const input = root.querySelector<HTMLTextAreaElement>(".try-input")!;
  const result = root.querySelector<HTMLElement>(".try-result")!;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-kind]")];
  const sampleButton = () => root.querySelector<HTMLButtonElement>("[data-sample]");
  if (!rules) return;
  let kind: Kind = "phishing";

  const empty = () => {
    result.innerHTML = `<p class="try-empty">Paste something, or <button type="button" class="link-button" data-sample>try a sample</button>.</p>`;
    sampleButton()!.addEventListener("click", () => {
      input.value = SAMPLES[kind];
      render();
      input.focus();
    });
  };

  const render = () => {
    const r = check(rules, kind, input.value);
    if (!r) return empty();
    const [name, guidance] = LEVEL[r.level];
    const warnings = r.issues.filter((i) => i.type !== "legit");
    result.innerHTML = "";
    const score = document.createElement("p");
    score.className = "try-score";
    score.innerHTML = `<span class="try-num" data-try-score>${r.risk}</span><span class="try-level ${r.level}">${name}</span>`;
    const guide = document.createElement("p");
    guide.className = "try-empty";
    guide.textContent = guidance;
    const list = document.createElement("ul");
    list.className = "try-issues";
    list.setAttribute("aria-label", warnings.length ? `${warnings.length} warning signs` : "No warning signs");
    (r.issues.length ? r.issues : [{ type: "none", msg: "No specific issues detected by this checker." }]).forEach((i) => {
      const li = document.createElement("li");
      li.textContent = i.msg;
      if (i.type === "legit") li.className = "legit";
      list.append(li);
    });
    result.append(score, guide, list);
  };

  const select = (tab: HTMLButtonElement, focus: boolean) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    kind = tab.dataset.kind as Kind;
    input.placeholder = PLACEHOLDER[kind];
    if (focus) tab.focus();
    render();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      const step = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key];
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
  input.addEventListener("input", render);
  input.disabled = false;
  empty();
}
