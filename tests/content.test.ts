import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { crops, featured, more, projectHref, type Rect, type Screenshot } from "@/content/projects";
import { alsoUsed, approach, education, interests, roles, skills, timeline } from "@/content/experience";
import { nav, site } from "@/content/site";
import { checkScam, SAMPLES } from "@/lib/scam-rules";

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

const allShots: Screenshot[] = [...featured.flatMap((p) => [...p.caseStudy.figures, ...(p.homeShot ? [p.homeShot] : [])])];

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
    // In the order of the approved home-page design: the scam tool, then Resume Analyzer, then Immensa.
    expect(featured.map((p) => p.slug)).toEqual(["scam-detection", "resume-analyzer", "immensa-inquiry-app"]);
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

  it("the scam tool's limitations name the regex defect, as engineering work left in the tool", () => {
    const limits = featured[0].caseStudy.limitations;
    const defect = limits.find((l) => l.includes("global"));
    expect(defect).toBeDefined();
    expect(defect).toContain("the fix belongs in the tool");
    expect(defect).toContain("32, then 12");
    expect(limits).toContain("There are no automated tests.");
    // Found while building the checker: Chrome's URL parser lets spaces through, so the tool scores them.
    expect(limits.some((l) => /Chrome/.test(l) && /spaces/.test(l))).toBe(true);
  });

  it("case-study copy doesn't point at a screenshot below the text: the screenshot leads", () => {
    for (const p of featured) for (const t of [...p.caseStudy.context, ...p.caseStudy.outcome]) expect(t, p.slug).not.toMatch(/screenshot below/i);
    // The glance sits beside the screenshot on a desktop and under it on a phone: no "above" there either.
    for (const p of featured) for (const t of [p.caseStudy.context[0], p.caseStudy.outcome[0]]) expect(t, p.slug).not.toMatch(/screenshot (above|below)/i);
  });

  it("reports the scores the checker computes from the README's samples", () => {
    const lead = featured[0];
    const score = (id: string) => {
      const s = SAMPLES.find((x) => x.id === id)!;
      return checkScam(s.kind, s.text)!.risk;
    };
    expect(score("text")).toBe(94);
    expect(lead.caseStudy.outcome.join(" ")).toContain("the scam text 94");
    expect(lead.stats.map((s) => s.value)).toEqual([String(score("email")), String(score("lookalike")), String(score("official"))]);
  });


  it("gives each card its one line, true of what its picture shows", () => {
    // The scam card shows the tool itself, whose tabs are email, text, listing and link.
    expect(featured.map((p) => p.tileLine)).toEqual([
      "Checks emails, texts, listings and links for common scam patterns.",
      "Scores a resume against a job posting.",
      "An Android form, sent as one structured email.",
    ]);
  });

  it("rings Resume Analyzer's score inside its picture", () => {
    const resume = featured.find((p) => p.slug === "resume-analyzer")!;
    expect(resume.homeShot!.caption).toContain("relevance score 55.6%");
    const r = resume.ring!;
    expect(r.x).toBeGreaterThan(0);
    expect(r.y).toBeGreaterThan(0);
    expect(r.x + r.w).toBeLessThanOrEqual(100);
    expect(r.y + r.h).toBeLessThanOrEqual(100);
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

describe("crops of real captures", () => {
  const inside = (r: Rect, w: number, h: number) => r.x >= 0 && r.y >= 0 && r.x + r.w <= w && r.y + r.h <= h;

  it("every crop lies inside its capture, and its marks and ring inside the crop", () => {
    for (const [name, c] of Object.entries(crops)) {
      expect(inside(c.rect, c.shot.width, c.shot.height), name).toBe(true);
      if (c.narrow) expect(inside(c.narrow, c.shot.width, c.shot.height), `${name} narrow`).toBe(true);
      for (const m of c.marks ?? []) {
        expect(m.x >= c.rect.x && m.x + m.w <= c.rect.x + c.rect.w, `${name} mark x`).toBe(true);
        expect(m.y >= c.rect.y && m.y + m.h <= c.rect.y + c.rect.h + 4, `${name} mark y`).toBe(true);
      }
      if (c.ring) expect(inside({ ...c.ring, x: c.ring.x - c.rect.x, y: c.ring.y - c.rect.y }, c.rect.w, c.rect.h), `${name} ring`).toBe(true);
      for (const file of [`${c.shot.src}.webp`, `${c.shot.src}@2x.webp`]) expect(existsSync(join(PUBLIC, file)), file).toBe(true);
      expect(c.alt.length, name).toBeGreaterThan(20);
    }
  });

  it("the crops are the spec's, cut from the scam tool's and Resume Analyzer's own captures", () => {
    expect(Object.keys(crops)).toEqual(["scamResult", "scamMessage", "scamSigns", "scamVerdict", "resumeScore", "resumeGap"]);
    expect(crops.scamResult.rect).toEqual({ x: 20, y: 595, w: 552, h: 281 });
    expect(crops.scamMessage.rect).toEqual({ x: 33, y: 208, w: 526, h: 184 });
    expect(crops.scamSigns.rect).toEqual({ x: 33, y: 714, w: 340, h: 146 });
    expect(crops.scamVerdict.rect).toEqual({ x: 33, y: 606, w: 527, h: 112 });
    expect(crops.resumeScore.rect).toEqual({ x: 50, y: 422, w: 772, h: 192 });
    expect(crops.resumeScore.narrow).toEqual({ x: 50, y: 422, w: 470, h: 140 });
    expect(crops.resumeScore.ring).toEqual({ x: 62, y: 492, w: 114, h: 38 });
    expect(crops.resumeGap.rect).toEqual({ x: 50, y: 623, w: 420, h: 264 });
    expect(crops.scamMessage.marks).toHaveLength(5);
    for (const k of ["scamResult", "scamMessage", "scamSigns", "scamVerdict"] as const) expect(crops[k].shot).toBe(featured[0].caseStudy.figures[0]);
    const resume = featured.find((p) => p.slug === "resume-analyzer")!;
    for (const k of ["resumeScore", "resumeGap"] as const) expect(crops[k].shot).toBe(resume.caseStudy.figures[0]);
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

  it("orders the timeline newest first, education between the roles, each year once", () => {
    const t = timeline();
    expect(t.map((e) => e.year)).toEqual(["2026", "2025", "2024", "2024"]);
    expect(t.map((e) => e.showYear)).toEqual([true, true, true, false]);
    expect(t.map((e) => e.kind)).toEqual(["role", "education", "role", "role"]);
    expect(t.flatMap((e) => (e.kind === "role" ? [e.role.organization] : []))).toEqual(["AiKnod", "SafeTrack", "Immensa Tech"]);
  });

  it("groups skills under the four requested headings", () => {
    expect(skills.map((s) => s.group)).toEqual(["Frontend", "Data and automation", "APIs and cloud", "Engineering practices"]);
  });

  it("says what I do without naming the companies I worked at", () => {
    expect(site.intro).toBe("I build front ends in React and TypeScript, and write SQL and Python to automate reports and check data against its source.");
    expect(interests).toBe(
      "Most of my work sits where software meets data: validating it, finding the defects that let it go wrong, and writing things down so a fix stays fixed. Outside work I build my own tools: a vehicle counter for traffic video, an F1 lap-time predictor, a stock tracker with charts and a price prediction, and a music stem separator.",
    );
    const about = [site.intro, interests, ...approach.flatMap((a) => [a.point, a.from]), ...skills.flatMap((s) => [s.group, ...s.items]), ...alsoUsed];
    for (const text of about) for (const company of ["AiKnod", "SafeTrack", "Immensa"]) expect(text).not.toContain(company);
  });

  it("About's approach points come from the work: one from the reports, three from the case studies", () => {
    expect(approach.map((a) => a.point)).toEqual([
      "Check figures against their source, and trace a discrepancy to its root cause.",
      "Show the reasons behind a score, so it can be checked rather than trusted.",
      "Make missing information visible instead of leaving a blank.",
      "Add tests when I come back to code.",
    ]);
    expect(approach[0]).toEqual({ point: approach[0].point, from: "work on reports" });
    expect(approach.slice(1).map((a) => a.slug)).toEqual(["scam-detection", "immensa-inquiry-app", "resume-analyzer"]);
    for (const a of approach.slice(1)) expect(featured.map((p) => p.slug)).toContain(a.slug);
    // Each point is something its source shows.
    expect(roles.some((r) => r.points.some((b) => /check report figures against source systems/i.test(b)))).toBe(true);
    const study = (slug: string) => featured.find((p) => p.slug === slug)!.caseStudy;
    expect(study("scam-detection").context.join(" ")).toMatch(/checked rather than taken on trust/);
    expect(study("immensa-inquiry-app").decision.title).toBe("Make missing information visible");
    expect(study("resume-analyzer").built.join(" ")).toMatch(/tests added/);
  });

  it("availability matches the headline's roles", () => {
    expect(site.availability).toBe("Open to software engineering roles building web apps and data tools.");
    expect(site.headline).toContain("web apps and data tools");
  });

  it("doesn't claim tools only this site's build uses", () => {
    const all = [...skills.flatMap((s) => s.items), ...alsoUsed];
    expect(all).not.toContain("Next.js");
    expect(all).not.toContain("Tailwind CSS");
  });

  it("keeps education and About short", () => {
    expect(education.degree).toMatch(/Software Engineering/);
    expect([interests, ...approach.map((a) => a.point)].join(" ").split(/\s+/).length).toBeLessThan(110);
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


describe("first screen", () => {
  it("the checker opens on the text-message sample, not the email in the scam card's picture", () => {
    const lead = featured[0];
    expect(SAMPLES.find((s) => s.kind === "text")!.text).not.toMatch(/Dear Customer/);
    expect(lead.homeShot).toBeUndefined();
  });

  it("no longer ships the opening recording", () => {
    expect(existsSync(join(PUBLIC, "images/scam-detection/recording-desktop.webm"))).toBe(false);
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
