import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { featured, heroShot, more, projectHref, type Screenshot } from "@/content/projects";
import { alsoUsed, background, education, roles, skills } from "@/content/experience";
import { nav, site } from "@/content/site";

const PUBLIC = join(process.cwd(), "public");

/** Width and height of a WebP file, read from its header (VP8, VP8L or VP8X). */
function webpSize(file: string) {
  const b = readFileSync(file);
  expect(b.toString("ascii", 0, 4)).toBe("RIFF");
  expect(b.toString("ascii", 8, 12)).toBe("WEBP");
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  throw new Error(`Unknown WebP chunk ${chunk} in ${file}`);
}

const allShots: Screenshot[] = [heroShot, ...featured.flatMap((p) => [...(p.cover ? [p.cover] : []), ...p.caseStudy.figures])];

/** Every repository and page a project links to, checked by hand in October 2026. */
const VERIFIED_LINKS = new Set([
  "https://github.com/NotLuvii/Fraud-Detection-Tool",
  "https://github.com/NotLuvii/Mobile-app",
  "https://github.com/NotLuvii/Resume-Analyze",
  "https://github.com/NotLuvii/Traffic-Detection",
  "https://github.com/NotLuvii/StockPredictor",
  "https://github.com/NotLuvii/CS3035-Individual-Graphing-Project",
  "https://youtu.be/qHmMMeWLiNo",
]);

describe("featured projects", () => {
  it("features exactly three, scam detection first", () => {
    expect(featured).toHaveLength(3);
    expect(featured[0].slug).toBe("scam-detection");
    expect(new Set(featured.map((p) => p.slug)).size).toBe(3);
  });

  it("each links to its own verified repository, never the bare profile", () => {
    for (const p of featured) {
      expect(VERIFIED_LINKS.has(p.repo.href), p.repo.href).toBe(true);
      expect(p.repo.href).not.toBe(site.github.url);
    }
  });

  it("each answers the brief: problem, what was built, a decision, a result, stack and availability", () => {
    for (const p of featured) {
      for (const field of [p.summary, p.built, p.decision, p.result]) expect(field.length).toBeGreaterThan(30);
      expect(p.availability.length).toBeGreaterThan(10);
      expect(p.stack.length).toBeGreaterThan(0);
      const c = p.caseStudy;
      expect(c.context.length).toBeGreaterThan(0);
      expect(c.role).toMatch(/Solo|team/i);
      expect(c.built.length).toBeGreaterThanOrEqual(2);
      expect(c.decision.body.length).toBeGreaterThan(0);
      expect(c.outcome.length).toBeGreaterThan(0);
      expect(c.files.length).toBeGreaterThan(0);
    }
  });

  it("links to specific files inside the project's own repository", () => {
    for (const p of featured) {
      const links = [...p.caseStudy.files, ...(p.caseStudy.decision.code ? [p.caseStudy.decision.code] : [])];
      for (const l of links) expect(l.href.startsWith(`${p.repo.href}/blob/`), l.href).toBe(true);
    }
  });

  it("builds case-study paths with a trailing slash, for the static export", () => {
    expect(projectHref("scam-detection")).toBe("/projects/scam-detection/");
  });
});

describe("screenshots", () => {
  it("every screenshot exists at 1x and 2x with the declared size", () => {
    expect(allShots.length).toBeGreaterThan(0);
    for (const s of allShots) {
      const one = join(PUBLIC, `${s.src}.webp`);
      const two = join(PUBLIC, `${s.src}@2x.webp`);
      expect(existsSync(one), one).toBe(true);
      expect(existsSync(two), two).toBe(true);
      expect(webpSize(one)).toEqual({ width: s.width, height: s.height });
      const big = webpSize(two);
      expect(big.width).toBe(s.width * 2);
      expect(Math.abs(big.height - s.height * 2)).toBeLessThanOrEqual(1);
    }
  });

  it("are small enough to load quickly (under 100 KB each)", () => {
    for (const s of allShots) for (const f of [`${s.src}.webp`, `${s.src}@2x.webp`]) expect(statSync(join(PUBLIC, f)).size).toBeLessThan(100_000);
  });

  it("each has alt text and a caption", () => {
    for (const s of allShots) {
      expect(s.alt.length).toBeGreaterThan(40);
      expect(s.caption.length).toBeGreaterThan(20);
    }
  });
});

describe("more projects", () => {
  it("only link where there is a verified destination, and say why when there isn't", () => {
    for (const p of more) {
      for (const l of p.links) expect(VERIFIED_LINKS.has(l.href), l.href).toBe(true);
      if (p.links.length === 0) expect(p.note).toMatch(/Private repository|Code not public/);
    }
  });

  it("don't repeat a featured project", () => {
    const titles = new Set(featured.map((p) => p.title));
    for (const p of more) expect(titles.has(p.title)).toBe(false);
  });
});

describe("experience and skills", () => {
  it("lists the three roles from the résumé, newest first, with two or three distinct points each", () => {
    expect(roles.map((r) => r.organization)).toEqual(["AiKnod", "SafeTrack", "Immensa Tech"]);
    for (const r of roles) {
      expect(r.points.length).toBeGreaterThanOrEqual(2);
      expect(r.points.length).toBeLessThanOrEqual(3);
      expect(new Set(r.points).size).toBe(r.points.length);
    }
  });

  it("groups skills under the four requested headings, each tied to where it was used", () => {
    expect(skills.map((s) => s.group)).toEqual(["Frontend", "Data and automation", "APIs and cloud", "Engineering practices"]);
    for (const s of skills) expect(s.usedIn.length).toBeGreaterThan(10);
  });

  it("doesn't claim tools only this site's build uses", () => {
    const all = [...skills.flatMap((s) => s.items), ...alsoUsed];
    expect(all).not.toContain("Next.js");
    expect(all).not.toContain("Tailwind CSS");
  });

  it("keeps education and background short", () => {
    expect(education.degree).toMatch(/Software Engineering/);
    expect(background.join(" ").split(/\s+/).length).toBeLessThan(80);
  });
});

describe("site", () => {
  it("navigates to the four sections, in page order", () => {
    expect(nav.map((n) => n.id)).toEqual(["projects", "experience", "skills", "contact"]);
    for (const n of nav) expect(n.href).toBe(`/#${n.id}`);
  });

  it("uses the requested headline", () => {
    expect(site.name).toBe("Luvneet Bamrah");
    expect(site.headline).toBe("Software engineer building reliable web apps and data tools.");
  });

  it("publishes the résumé that's in /public", () => {
    expect(site.resume).toBeTruthy();
    expect(existsSync(join(PUBLIC, site.resume!))).toBe(true);
  });
});

/** Every source file, for checks on what the page says. */
function sources(dir = join(process.cwd(), "src")): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return sources(p);
    return /\.(ts|tsx|css)$/.test(f) ? [p] : [];
  });
}

describe("claims", () => {
  const text = sources()
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

  it("states no percentage improvement whose basis can't be shown yet", () => {
    for (const claim of ["75%", "50%", "40%"]) expect(text).not.toContain(claim);
  });

  it("presents no illustrated interfaces or sample data as evidence", () => {
    for (const leftover of ["Illustrative data", "Illustration", "Sample client", "<svg viewBox=\"0 0 1200"]) expect(text).not.toContain(leftover);
  });

  it("leaves no editorial placeholders on the page", () => {
    for (const marker of ["TODO", "TBD", "Lorem", "[placeholder", "XXX"]) expect(text).not.toContain(marker);
  });

  it("never links to another portfolio", () => {
    for (const other of ["luvneetbamrah.com", "wind tunnel", "Wind tunnel", "luvneet-portfolio"]) expect(text).not.toContain(other);
  });
});
