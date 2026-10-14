/**
 * The design rules from the redesign spec, enforced on the source. They keep the site clear of the
 * visual habits that make a page read as AI-generated: default fonts, purple gradients, gradient
 * text, frosted glass, oversized radii, emoji and all-caps labels. Contrast is checked from the
 * colour tokens themselves.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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

  it("has no frosted glass", () => {
    expect(offenders(/backdrop-filter|backdrop-blur|backdrop-saturate/)).toEqual([]);
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
    expect(contrast(token("on-amber"), token("amber"))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("shape and labels", () => {
  it("keeps corner radii at 12px or less, pills aside", () => {
    expect(offenders(/rounded-(2xl|3xl|4xl)\b|rounded-\[(1[3-9]|[2-9]\d)px\]|border-radius:\s*(1[3-9]|[2-9]\d)px/)).toEqual([]);
  });

  it("puts shadows only on the full-screen screenshot viewer", () => {
    expect(offenders(/\bshadow-(sm|md|lg|xl|2xl|\[)|box-shadow:/, (path) => path.endsWith("ui/Screenshot.tsx"))).toEqual([]);
  });

  it("uses no emoji", () => {
    expect(offenders(/\p{Extended_Pictographic}/u)).toEqual([]);
  });

  it("sets no labels in all caps", () => {
    expect(offenders(/\buppercase\b|text-transform:\s*uppercase/)).toEqual([]);
  });
});
