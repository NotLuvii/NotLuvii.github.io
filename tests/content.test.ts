import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { featured, heroShot, more, projectHref, type Screenshot } from "@/content/projects";
import { alsoUsed, background, education, roles, skills } from "@/content/experience";
import { nav, site } from "@/content/site";
import { emphasize } from "@/lib/emphasize";

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

const allShots: Screenshot[] = [heroShot, ...featured.flatMap((p) => [...p.caseStudy.figures, ...(p.homeShot ? [p.homeShot] : [])])];

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

  it("each answers the brief: problem, figures from the result, stack and availability", () => {
    for (const p of featured) {
      expect(p.summary.length).toBeGreaterThan(30);
      // The summary's key phrase is shown in white; emphasize() throws if it isn't in the summary.
      expect(emphasize(p.summary, [p.summaryKeyPhrase]).filter((part) => part.strong)).toHaveLength(1);
      // Two or three figures, each with a label that says what it measures.
      expect(p.stats.length).toBeGreaterThanOrEqual(2);
      expect(p.stats.length).toBeLessThanOrEqual(3);
      for (const s of p.stats) {
        expect(s.value.length).toBeGreaterThan(0);
        expect(s.value.length).toBeLessThanOrEqual(6);
        expect(s.label.length).toBeGreaterThan(15);
      }
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

  it("tells the scam detection story with the detector's real rules, adding up to the 94 its case study reports", () => {
    const lead = featured[0];
    const story = lead.story!;
    expect(story).toBeTruthy();
    // The README's sample text message, verbatim.
    expect(story.text).toBe("URGENT: Your bank detected unusual activity. Confirm now: https://bit.ly/xy7z\nReply YES to secure your account.");
    // Each step's phrase appears in the message, in reading order.
    let at = 0;
    for (const step of story.steps) {
      const i = story.text.indexOf(step.phrase, at);
      expect(i, step.phrase).toBeGreaterThanOrEqual(0);
      at = i + step.phrase.length;
    }
    // The weights the rules add (js/detectors.js, sms), and the total the case study reports.
    expect(story.steps.map((s) => s.add)).toEqual([18, 18, 18, 25, 15]);
    const total = story.steps.reduce((sum, s) => sum + s.add, 0);
    expect(total).toBe(94);
    expect(lead.caseStudy.outcome.join(" ")).toContain("the scam text 94");
    // The tool's own thresholds for a text message: Medium from 35, High from 60.
    expect(story.thresholds).toEqual({ medium: 35, high: 60 });
    // Its source is a specific file in the project's repository.
    expect(story.source.href.startsWith(`${lead.repo.href}/blob/`)).toBe(true);
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

describe("professional work", () => {
  it("labels the Immensa app, the dashboards and the sensor system as professional", () => {
    expect(featured.find((p) => p.slug === "immensa-inquiry-app")?.kind).toBe("Professional app");
    for (const title of ["Monitoring and reporting dashboards", "Sensor management system"]) {
      expect(more.find((p) => p.title === title)?.kind, title).toBe("Professional project");
    }
  });
});

describe("Resume Analyzer", () => {
  const p = featured.find((f) => f.slug === "resume-analyzer")!;

  it("describes the restored relevance score and the result in the screenshot", () => {
    expect(p.summary).toMatch(/relevance score/);
    expect(p.stats[0].value).toBe("55.6%");
    expect(p.caseStudy.outcome.join(" ")).toContain("55.6%");
    expect(p.caseStudy.figures[0].caption).toContain("55.6%");
  });

  it("no longer lists limitations that the October 2026 update fixed", () => {
    const limits = p.caseStudy.limitations.join(" ");
    expect(limits).not.toMatch(/no automated tests|only the web version runs/);
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
  it("lists the three roles from the resume, newest first, with two or three distinct points each", () => {
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

  it("links to the right LinkedIn profile", () => {
    expect(site.linkedin.url).toBe("https://www.linkedin.com/in/luvneet-bamrah-157281214");
  });

  it("uses the requested headline", () => {
    expect(site.name).toBe("Luvneet Bamrah");
    expect(site.headline).toBe("Software engineer building reliable web apps and data tools.");
  });

  it("publishes the resume that's in /public", () => {
    expect(site.resume).toBeTruthy();
    expect(existsSync(join(PUBLIC, site.resume!))).toBe(true);
  });
});

describe("intro", () => {
  it("marks each key phrase once and keeps the sentence whole", () => {
    const parts = emphasize(site.intro, site.introKeyPhrases);
    expect(parts.map((p) => p.text).join("")).toBe(site.intro);
    expect(parts.filter((p) => p.strong).map((p) => p.text)).toEqual([...site.introKeyPhrases]);
  });

  it("refuses a key phrase that isn't in the text, so a typo can't silently drop it", () => {
    expect(() => emphasize("I build web apps.", ["data tools"])).toThrow(/data tools/);
  });
});

describe("opening screenshot", () => {
  it("is the result of the scam detection tool's email check, landscape so it fits the first screen", () => {
    expect(heroShot.src).toBe("/images/scam-detection/email-result");
    expect(heroShot.width / heroShot.height).toBeGreaterThan(1.5);
  });

  it("isn't repeated by the lead project's showcase, which tells the text-message story instead", () => {
    const lead = featured[0];
    expect(lead.story?.text).not.toMatch(/Dear Customer/);
    expect(lead.homeShot).toBeUndefined();
  });

  it("has a phone version, from the tool's own phone layout, at 1x, 2x and 3x", () => {
    const phone = heroShot.phone!;
    expect(phone).toBeTruthy();
    expect(phone.width).toBeLessThanOrEqual(400);
    for (const [suffix, scale] of [["", 1], ["@2x", 2], ["@3x", 3]] as const) {
      const file = join(PUBLIC, `${phone.src}${suffix}.webp`);
      const size = webpSize(file);
      expect(size.width, file).toBe(phone.width * scale);
      expect(Math.abs(size.height - phone.height * scale), file).toBeLessThanOrEqual(1);
      expect(statSync(file).size).toBeLessThan(100_000);
    }
  });

  it("also exists at 3x for large screens, still under 100 KB", () => {
    const three = join(PUBLIC, `${heroShot.src}@3x.webp`);
    const size = webpSize(three);
    expect(size.width).toBe(heroShot.width * 3);
    expect(Math.abs(size.height - heroShot.height * 3)).toBeLessThanOrEqual(1);
    expect(statSync(three).size).toBeLessThan(100_000);
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

  it("states each resume figure once, in the resume's own words", () => {
    const figures = {
      "75%": "Increased route data accuracy by 75% through systematic data validation and alignment of system logic.",
      "50%": "Reduced delivery delays by 50% by optimizing front-end workflows and presenting data more clearly.",
      "40%": "Reduced troubleshooting effort by 40% by improving monitoring views, interface clarity and system transparency",
    };
    // Claims live in src/content; CSS percentages elsewhere aren't claims.
    const content = sources(join(process.cwd(), "src/content"))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    for (const [figure, sentence] of Object.entries(figures)) {
      expect(content).toContain(sentence);
      expect(content.split(figure).length - 1, figure).toBe(1);
    }
  });

  it("presents no illustrated interfaces or sample data as evidence", () => {
    for (const leftover of ["Illustrative data", "Illustration", "Sample client", "<svg viewBox=\"0 0 1200"]) expect(text).not.toContain(leftover);
  });

  it("spells resume without accents", () => {
    expect(text).not.toMatch(/r\u00e9sum\u00e9/i);
  });

  it("leaves no editorial placeholders on the page", () => {
    for (const marker of ["TODO", "TBD", "Lorem", "[placeholder", "XXX"]) expect(text).not.toContain(marker);
  });

  it("never links to another portfolio", () => {
    for (const other of ["luvneetbamrah.com", "wind tunnel", "Wind tunnel", "luvneet-portfolio"]) expect(text).not.toContain(other);
  });
});
