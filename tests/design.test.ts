/**
 * The design rules from the redesign spec, enforced on the source. They keep the site clear of the
 * visual habits that make a page read as AI-generated: default fonts, purple gradients, gradient
 * text, frosted glass, oversized radii, emoji and all-caps labels. Contrast is checked from the
 * colour tokens themselves.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIB, onScale } from "@/lib/golden";

const SRC = join(process.cwd(), "src");

function files(dir = SRC, pattern = /\.(ts|tsx|css)$/): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return files(p, pattern);
    return pattern.test(f) ? [p] : [];
  });
}

const sources = files().map((path) => ({ path: path.replace(process.cwd() + "/", ""), text: readFileSync(path, "utf8") }));
const css = readFileSync(join(SRC, "app/globals.css"), "utf8");

/** Lines matching a pattern, as "file: line" strings, for readable failures. */
function offenders(pattern: RegExp, skip: (path: string) => boolean = () => false) {
  return sources.flatMap(({ path, text }) =>
    skip(path) ? [] : text.split("\n").filter((line) => pattern.test(line)).map((line) => `${path}: ${line.trim()}`),
  );
}

function hexToHsl(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  return { h: hue, s, l };
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** A colour token from the @theme block in globals.css. */
function token(name: string) {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`No colour token --color-${name}`);
  return m[1];
}

describe("type", () => {
  it("uses IBM Plex Sans and Plex Mono, not Inter or the other default faces", () => {
    expect(existsSync(join(SRC, "fonts/ibm-plex-sans-latin-variable.woff2"))).toBe(true);
    expect(existsSync(join(SRC, "fonts/ibm-plex-mono-latin-400.woff2"))).toBe(true);
    expect(readdirSync(join(SRC, "fonts")).filter((f) => /inter/i.test(f))).toEqual([]);
    expect(offenders(/\b(Inter|Geist|Space Grotesk|Instrument Serif)\b/)).toEqual([]);
  });
});

describe("colour", () => {
  it("has no purple, indigo or violet anywhere", () => {
    const purple = sources.flatMap(({ path, text }) =>
      [...text.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)]
        .map((m) => m[0])
        .filter((hex) => {
          const { h, s } = hexToHsl(hex);
          return h >= 250 && h <= 300 && s > 0.3;
        })
        .map((hex) => `${path}: ${hex}`),
    );
    expect(purple).toEqual([]);
    expect(offenders(/\b(purple|violet|indigo|fuchsia)-\d/)).toEqual([]);
  });

  it("has no gradient text", () => {
    expect(offenders(/background-clip:\s*text|bg-clip-text/)).toEqual([]);
  });

  it("has one see-through surface, the site bar, with solid fallbacks", () => {
    // Only the .site-bar rules in globals.css may blur what's behind them.
    const blur = offenders(/backdrop-filter|backdrop-blur|backdrop-saturate/);
    expect(blur.length).toBeGreaterThan(0);
    for (const line of blur) expect(line.startsWith("src/app/globals.css")).toBe(true);
    const rules = [...css.matchAll(/([^{}]+)\{[^{}]*backdrop-filter[^{}]*\}/g)].map((m) => m[1].trim());
    for (const selector of rules) expect(selector).toMatch(/\.site-bar/);
    expect(css).toMatch(/prefers-reduced-transparency:\s*reduce[\s\S]*?\.site-bar/);
    expect(css).toMatch(/@supports not \(backdrop-filter/);
    expect(readFileSync(join(SRC, "components/layout/SiteHeader.tsx"), "utf8")).toContain("site-bar");
  });

  it("one gradient, the hero's amber glow, never blue or purple", () => {
    const gradients = sources.flatMap(({ path, text }) =>
      [...text.matchAll(/(?:linear|radial|conic)-gradient\(([^;]*?)\)\s*;|bg-gradient-to-\w+|bg-linear-\w+|bg-radial/g)].map((m) => ({ path, body: m[0] })),
    );
    expect(gradients.length).toBe(1);
    expect(gradients[0].body).toContain("255 176 0");
    for (const { path, body } of gradients) {
      const colours = [...body.matchAll(/rgba?\((\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/g)].map(
        (m) => "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join(""),
      );
      colours.push(...[...body.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0]));
      for (const c of colours) {
        const { h, s } = hexToHsl(c);
        expect(h >= 180 && h <= 300 && s > 0.2, `${path}: ${c} is blue or purple`).toBe(false);
      }
    }
  });

  it("the defect red is used only by the diagram on the first screen", () => {
    const uses = offenders(/#ff5a4e|--color-defect/i).map((line) => line.split(":")[0]);
    expect(uses.length).toBeGreaterThan(0);
    for (const file of new Set(uses)) expect(["src/app/globals.css", "src/components/sections/ReconcileDiagram.tsx"]).toContain(file);
    // In globals.css: the token, and rules for the diagram only.
    const rules = [...css.matchAll(/([^{}]*)\{[^{}]*var\(--color-defect\)[^{}]*\}/g)].map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim());
    expect(rules.length).toBeGreaterThan(0);
    for (const selector of rules) for (const part of selector.split(",")) expect(part.trim()).toMatch(/^\.(reconcile|rc-)/);
  });

  it("sets the page in true black, like Apple's dark tiles", () => {
    expect(token("page")).toBe("#000000");
    expect(css).toMatch(/\.site-bar\s*\{[^}]*background:\s*rgb\(0 0 0 \/ 0\.78\)/);
  });

  it("uses one accent, signal amber", () => {
    expect(token("amber")).toBe("#ffb000");
  });

  it("meets contrast targets on the dark page and panels", () => {
    for (const bg of [token("page"), token("panel")]) {
      expect(contrast(token("text"), bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(token("text-2"), bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(token("text-3"), bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token("amber"), bg)).toBeGreaterThanOrEqual(4.5);
    }
    // Screenshot bezels and code panels sit on a slightly lighter surface.
    expect(contrast(token("text"), token("raised"))).toBeGreaterThanOrEqual(7);
    expect(contrast(token("text-3"), token("raised"))).toBeGreaterThanOrEqual(4.5);
    // Sections alternate between the page and panel tones, so the step must be visible.
    expect(luminance(token("panel")) - luminance(token("page"))).toBeGreaterThan(0.003);
    expect(contrast(token("on-amber"), token("amber"))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("ink", () => {
  it("the resting state is drawn; drawing in is guarded", () => {
    expect(css).toContain("@keyframes ink-draw");
    expect(css).toMatch(/\n\[data-ink\] path\s*\{[^}]*stroke-dashoffset:\s*0[;\s]/);
    // pathLength dashes are measured in the SVG's own units; a non-scaling stroke measures them on
    // screen instead, so a stretched mark would rest half-drawn.
    expect(css.match(/\n\[data-ink\] path\s*\{[^}]*\}/)![0]).not.toContain("non-scaling-stroke");
    // Drawing in only ever happens inside the reduced-motion guard, and drawing on view only
    // where scroll timelines exist: elsewhere the marks rest fully drawn.
    const motion = css.indexOf("prefers-reduced-motion: no-preference) {\n  /* Ink");
    expect(motion).toBeGreaterThan(-1);
    const guarded = css.slice(motion);
    const supports = guarded.indexOf("@supports (animation-timeline: view())");
    expect(supports).toBeGreaterThan(-1);
    const uses = [...css.matchAll(/animation-timeline:\s*--ink/g)].map((m) => m.index!);
    expect(uses.length).toBeGreaterThan(0);
    for (const at of uses) expect(at).toBeGreaterThan(motion + supports);
    expect([...css.matchAll(/animation:\s*ink-draw/g)].every((m) => m.index! > motion)).toBe(true);
  });

  it("no client component imports the ink library", () => {
    const client = sources.filter(({ text }) => /^["']use client["']/m.test(text));
    expect(client.length).toBeGreaterThan(0);
    for (const { path, text } of client) expect(/@\/lib\/ink|roughjs/.test(text), path).toBe(false);
  });

  it("writes notes in Gochi Hand, self-hosted with its licence, and nowhere but the ink", () => {
    expect(existsSync(join(SRC, "fonts/gochi-hand-latin-400.woff2"))).toBe(true);
    expect(readFileSync(join(SRC, "fonts/Gochi-Hand-LICENSE.txt"), "utf8")).toContain("SIL Open Font License");
    const uses = offenders(/--font-hand|font-hand\b/, (path) => /app\/(fonts\.ts|layout\.tsx)$/.test(path));
    expect(uses.length).toBeGreaterThan(0);
    for (const line of uses) expect(line.startsWith("src/app/globals.css"), line).toBe(true);
  });
});

describe("type, continued", () => {
  it("sets monospace only for code", () => {
    const mono = offenders(/font-mono|--font-mono|type-label/, (path) => /(ui\/CodeBlock\.tsx|app\/fonts\.ts|app\/layout\.tsx)$/.test(path));
    // globals.css may define the token and apply it to code and pre, nothing else.
    expect(mono.every((line) => line.startsWith("src/app/globals.css"))).toBe(true);
    expect(mono).toHaveLength(2);
  });
});

describe("touch", () => {
  it("turns off the browser's grey tap flash and the double-tap delay", () => {
    expect(css).toMatch(/-webkit-tap-highlight-color:\s*transparent/);
    expect(css).toMatch(/touch-action:\s*manipulation/);
  });
});

describe("shape and labels", () => {
  it("keeps corner radii at 12px or less, pills aside", () => {
    expect(offenders(/rounded-(2xl|3xl|4xl)\b|rounded-\[(1[3-9]|[2-9]\d)px\]|border-radius:\s*(1[3-9]|[2-9]\d)px/)).toEqual([]);
  });

  it("puts shadows only on the full-screen screenshot viewer", () => {
    expect(offenders(/\bshadow-(sm|md|lg|xl|2xl|\[)|box-shadow:/, (path) => path.endsWith("ui/Screenshot.tsx"))).toEqual([]);
  });

  it("draws outline pills with an outline, not a border or a shadow, and keeps the amber focus ring", () => {
    const links = readFileSync(join(SRC, "components/ui/links.tsx"), "utf8");
    expect(links).toMatch(/"outline"/);
    expect(links).toMatch(/outline-1/);
    expect(links).toMatch(/focus-visible:outline-amber/);
  });

  it("uses no emoji", () => {
    expect(offenders(/\p{Extended_Pictographic}/u)).toEqual([]);
  });

  it("sets no labels in all caps: capitals are for the display face only", () => {
    expect(offenders(/\buppercase\b|text-transform:\s*uppercase/, (path) => path.endsWith("app/globals.css"))).toEqual([]);
    // In globals.css, only the display utility (the name and section titles) is set in capitals.
    const caps = [...css.matchAll(/([^{}]*)\{[^{}]*text-transform:\s*uppercase[^{}]*\}/g)].map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim());
    expect(caps).toEqual(["@utility type-display"]);
  });
});

describe("the golden ratio, in the CSS", () => {
  it("every font size the CSS declares sits on the φ scale", () => {
    const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim()).filter((v) => !v.includes("cqw") && !/inherit|var\(/.test(v));
    expect(sizes.length).toBeGreaterThan(5);
    const px = (v: string) => {
      const parts = v.startsWith("clamp(") ? v.slice(6, -1).split(/,(?![^(]*\))/) : [v];
      const last = parts[parts.length - 1].trim();
      const m = last.match(/^([\d.]+)(px|rem)$/);
      if (!m) throw new Error(`Unreadable font-size: ${v}`);
      return Number(m[1]) * (m[2] === "rem" ? 16 : 1);
    };
    const off = sizes.filter((v) => !onScale(px(v)));
    expect(off).toEqual([]);
  });

  it("spacing tokens are Fibonacci", () => {
    const tokens = [...css.matchAll(/--spacing-f(\d+):\s*([\d.]+)px;/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(tokens.map(([, v]) => v)).toEqual([...FIB]);
    for (const [name, v] of tokens) expect(name).toBe(v);
    expect(css).toMatch(/--spacing-gutter:\s*clamp\(21px, 5vw, 55px\);/);
  });
});
