import { expect, test, type Page } from "@playwright/test";
import { featured, more, projectHref } from "../src/content/projects";
import { alsoUsed, background, roles, skills } from "../src/content/experience";
import { site } from "../src/content/site";
import { checkSms } from "../src/lib/scam-sms";

const PAGES = ["/", ...featured.map((p) => projectHref(p.slug))];
const WIDTHS = [320, 375, 390, 768, 1024, 1440];

/** External destinations the site may link to: verified repositories and profiles only. */
const EXTERNAL = [
  /^https:\/\/github\.com\/NotLuvii$/,
  /^https:\/\/github\.com\/NotLuvii\/(Fraud-Detection-Tool|Mobile-app|Resume-Analyze|Traffic-Detection|StockPredictor|CS3035-Individual-Graphing-Project)(\/blob\/(main|master)\/[\w./-]+(#L\d+-L\d+)?)?$/,
  /^https:\/\/www\.linkedin\.com\/in\/luvneet-bamrah-157281214$/,
  /^https:\/\/youtu\.be\/qHmMMeWLiNo$/,
  /^mailto:luvneetbamrah@gmail\.com$/,
];

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

/** Scroll through the page, then wait for lazy images to load and entrance animations to finish. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 10_000 });
  await page.waitForTimeout(700);
}

test.describe("home page", () => {
  test("says who, what and where, with the two main actions", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(site.name);
    await expect(page.getByText(site.headline)).toBeVisible();
    const view = page.getByRole("link", { name: "See the work" });
    await expect(view).toHaveAttribute("href", "#projects");
    const resume = page.locator("main").getByRole("link", { name: /Download resume/ });
    await expect(resume).toHaveAttribute("href", site.resume!);
    await expect(resume).toHaveAttribute("download", "");
  });

  test("runs Hero, Projects, Experience, About and skills, Contact, in that order", async ({ page }) => {
    await page.goto("/");
    const headings = await page.locator("main h2").allTextContents();
    expect(headings).toEqual(["Projects", "Experience", "About and skills", "Contact"]);
  });

  test("features three projects, each linking to its case study and its own repository", async ({ page }) => {
    await page.goto("/");
    const articles = page.locator("#projects article");
    await expect(articles).toHaveCount(3);
    // All three tiles share one set of buttons.
    const caseStudyClasses = await page.locator("#projects article").evaluateAll((as) =>
      as.map((a) => [...a.querySelectorAll("a")].find((l) => l.textContent?.startsWith("Read the case study"))?.className),
    );
    expect(new Set(caseStudyClasses).size).toBe(1);
    for (const [i, p] of featured.entries()) {
      const a = articles.nth(i);
      await expect(a.getByRole("heading", { level: 3 })).toHaveText(p.title);
      await expect(a.getByRole("link", { name: new RegExp(`^Read the case study\\s*: ${p.title}$`) })).toHaveAttribute("href", projectHref(p.slug));
      await expect(a.getByRole("link", { name: new RegExp(`^Code on GitHub\\s*: ${p.title}`) })).toHaveAttribute("href", p.repo.href);
    }
  });

  test("the first project tells its story", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("#projects article").first();
    await expect(first.locator("[data-story]")).toHaveCount(1);
  });

  test("the intro is one paragraph with its key phrases in white and the rest in grey", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator("#skills p.type-statement");
    await expect(intro).toHaveText(site.intro);
    expect(await intro.locator("strong").allTextContents()).toEqual([...site.introKeyPhrases]);
    expect(await intro.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(152, 152, 157)");
    const strong = await intro.locator("strong").evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
    for (const c of strong) expect(c).toBe("rgb(245, 245, 247)");
  });
});


test.describe("first screen", () => {
  test("nothing removed is left behind", async ({ page }) => {
    await page.goto("/");
    for (const sel of ["[data-recording]", ".hero-frame", ".more-row", "[data-figure]", "video", ".role-grid", ".sketch"]) await expect(page.locator(sel), sel).toHaveCount(0);
  });

  test("says who and what: the status, the clock, the name, the headline, the intro, two buttons and the data check", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section.hero");
    await expect(hero.locator(".now-pill")).toContainText(`Now: ${site.availability}`);
    await expect(hero.locator("[data-clock]")).toHaveText(/^Fredericton, NB · \d{1,2}:\d{2} [ap]m A[DS]T$/);
    await expect(hero.locator("h1")).toHaveText(site.name);
    await expect(hero.getByText(site.headline)).toBeVisible();
    await expect(hero.getByText(site.intro)).toBeVisible();
    await expect(hero.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "#projects");
    await expect(hero.getByRole("link", { name: /Download resume/ })).toHaveAttribute("download", "");
    await expect(hero.locator(".data-check")).toHaveAttribute("aria-hidden", "true");
    await expect(hero.locator("img, video, picture")).toHaveCount(0);
    for (const p of featured) await expect(hero).not.toContainText(p.title);
  });

  test("without JavaScript the clock shows the city", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-clock]")).toHaveText("Fredericton, NB");
    await context.close();
  });

  test("the first screen fits: the words and the data check on screen, clear of the bar", async ({ page }) => {
    for (const [w, h] of [[1440, 900], [1280, 720]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      const box = await page.locator("section.hero").evaluate((s) => {
        const c = s.querySelector(".hero-copy")!.getBoundingClientRect();
        const d = s.querySelector(".data-check")!.getBoundingClientRect();
        return { top: c.top, bottom: c.bottom, dTop: d.top, dBottom: d.bottom, dWidth: d.width, vh: innerHeight };
      });
      expect(box.top, `${w}x${h}`).toBeGreaterThanOrEqual(56);
      expect(box.bottom, `${w}x${h}`).toBeLessThanOrEqual(box.vh);
      expect(box.dTop, `${w}x${h} data check`).toBeGreaterThanOrEqual(56);
      expect(box.dBottom, `${w}x${h} data check`).toBeLessThanOrEqual(box.vh);
      expect(box.dWidth, `${w}x${h} data check`).toBeGreaterThanOrEqual(360);
    }
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const phone = await page.locator("section.hero").evaluate((s) => ({
      top: s.querySelector(".hero-copy")!.getBoundingClientRect().top,
      buttons: Math.max(...[...s.querySelectorAll(".hero-copy a")].map((a) => a.getBoundingClientRect().bottom)),
      vh: innerHeight,
    }));
    expect(phone.top).toBeGreaterThanOrEqual(56);
    expect(phone.buttons).toBeLessThanOrEqual(phone.vh);
  });

  test("with reduced motion the hero is still and complete", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const state = await page.evaluate(() => ({
      hero: document.querySelector(".hero")!.getAnimations({ subtree: true }).length,
      marquee: document.querySelector(".marquee")!.getAnimations({ subtree: true }).length,
      clip: getComputedStyle(document.querySelector(".dc-marks")!).clipPath,
      marks: document.querySelectorAll(".dc-marks .dc-tick, .dc-marks .dc-defect").length,
    }));
    expect(state).toEqual({ hero: 0, marquee: 0, clip: "none", marks: 8 });
  });

  test("the marks are revealed in step with the scan line: both measure the whole drawing", async ({ page }) => {
    await page.goto("/");
    // The clip on the marks resolves against the marks' own box; it keeps time with the line only
    // if that box is the whole 600×525 drawing, the line's box.
    const box = await page.locator(".dc-marks").evaluate((g) => {
      const b = (g as SVGGraphicsElement).getBBox();
      return [b.x, b.y, b.width, b.height].map(Math.round);
    });
    expect(box).toEqual([0, 0, 600, 525]);
  });

  test("with motion allowed the scan line and the marquee run", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const names = await page.evaluate(() =>
      [".dc-line", ".dc-marks", ".marquee-track"].map((sel) => (document.querySelector(sel)!.getAnimations()[0] as CSSAnimation | undefined)?.animationName ?? null),
    );
    expect(names).toEqual(["dc-scan", "dc-reveal", "marquee"]);
  });

  test("the marquee lists the real skills, and is hidden from screen readers", async ({ page }) => {
    await page.goto("/");
    const marquee = page.locator(".marquee");
    await expect(marquee).toHaveAttribute("aria-hidden", "true");
    const items = await marquee.locator(".marquee-track > span").allTextContents();
    const expected = [...skills.flatMap((g) => g.items), ...alsoUsed];
    expect(items).toEqual([...expected, ...expected]);
    expect(await marquee.evaluate((el) => getComputedStyle(el).overflow)).toBe("hidden");
  });
});

/** Visible text in main, as { size, family, words, inCode } per text node. */
const textNodes = (page: Page) =>
  page.evaluate(() => {
    const out: { size: number; family: string; words: number; inCode: boolean }[] = [];
    const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode.textContent!.trim();
      const el = walker.currentNode.parentElement!;
      if (!t || !el.getBoundingClientRect().width || el.closest(".sr-only, dialog")) continue;
      const cs = getComputedStyle(el);
      out.push({ size: Math.round(parseFloat(cs.fontSize)), family: cs.fontFamily, words: t.split(/\s+/).length, inCode: !!el.closest("[data-code]") });
    }
    return out;
  });

test.describe("after the Apple audit", () => {
  test("no text runs past the edge of a phone screen", async ({ page }) => {
    for (const width of [320, 375, 390]) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of PAGES) {
        await page.goto(path);
        const past = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          return [...document.querySelectorAll("main p, main h1, main h2, main h3, main li, main a, main dt, main dd, main .marquee, footer p, footer a")]
            .filter((el) => !el.closest("pre, [data-code]") && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > vw + 1)
            .map((el) => el.textContent!.trim().slice(0, 40));
        });
        expect(past, `${path} at ${width}px`).toEqual([]);
      }
    }
  });

  test("type keeps to a short scale, with most words at reading size", async ({ page }) => {
    test.skip(isPhone(page), "measured on the desktop layout");
    await page.goto("/");
    // Code excerpts keep their own size and aren't counted.
    const nodes = (await textNodes(page)).filter((n) => !n.inCode);
    const sizes = new Set(nodes.map((n) => n.size));
    expect([...sizes].sort((a, b) => a - b).length, [...sizes].join(", ")).toBeLessThanOrEqual(8);
    const words = nodes.reduce((sum, n) => sum + n.words, 0);
    const small = nodes.filter((n) => n.size < 16).reduce((sum, n) => sum + n.words, 0);
    expect(small / words).toBeLessThan(0.2);
  });

  test("monospace is only used for code", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const mono = (await textNodes(page)).filter((n) => /mono/i.test(n.family) && !n.inCode);
      expect(mono, path).toEqual([]);
    }
  });

  test("sections are separated by tone, not by lines", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const lines = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter((el) => {
            if (el.closest("[data-code], dialog") || !el.getBoundingClientRect().width) return false;
            const cs = getComputedStyle(el);
            return ["Top", "Right", "Bottom", "Left"].some((side) => {
              const w = parseFloat(cs.getPropertyValue(`border-${side.toLowerCase()}-width`));
              return w > 0 && cs.getPropertyValue(`border-${side.toLowerCase()}-style`) !== "none";
            });
          })
          .map((el) => `${el.tagName}.${(el.className as string).toString().slice(0, 40)}`),
      );
      expect(lines, path).toEqual([]);
    }
    await page.goto("/");
    const panels = await page.evaluate(() => [...document.querySelectorAll("main > *, main section, main article")].filter((el) => getComputedStyle(el).backgroundColor === "rgb(22, 22, 23)").length);
    expect(panels).toBeGreaterThanOrEqual(3);
  });

  test("notes are 28px on a desktop and 24px on a phone, in blocks of their own", async ({ page }) => {
    await page.goto("/");
    const notes = await page.locator(".note").evaluateAll((ns) => ns.map((n) => ({ size: getComputedStyle(n).fontSize, display: getComputedStyle(n).display })));
    expect(notes.length).toBeGreaterThanOrEqual(4);
    for (const n of notes) {
      expect(n.size).toBe(isPhone(page) ? "24px" : "28px");
      expect(n.display).toBe("block");
    }
  });

  test("amber is only the main action, the ink and the signals", async ({ page }) => {
    await page.goto("/");
    const stray = await page.evaluate(() =>
      [...document.querySelectorAll("main *")]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const amber = "rgb(255, 176, 0)";
          const visible = el.getBoundingClientRect().width > 0;
          const usesAmber = cs.color === amber || cs.backgroundColor === amber || (el instanceof SVGElement && cs.stroke === amber);
          return visible && usesAmber && !el.closest('[data-ink], [data-variant="primary"], [data-signal]');
        })
        .map((el) => `${el.tagName}.${String(el.getAttribute("class")).slice(0, 40)}`),
    );
    expect(stray).toEqual([]);
  });

  test("the headline fits on two lines on a desktop screen", async ({ page }) => {
    test.skip(isPhone(page), "desktop only");
    await page.goto("/");
    const lines = await page.getByText(site.headline).evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBeLessThanOrEqual(2);
  });


  test("Immensa's code is cut off by its tile like a picture: not a scroll region, caption read out", async ({ page }) => {
    await page.goto("/");
    const code = page.locator("#projects article").nth(2).locator("[data-code]");
    await expect(code.locator("pre")).not.toHaveAttribute("tabindex", /.*/);
    expect(await code.locator("pre").evaluate((el) => getComputedStyle(el).overflowY)).not.toMatch(/auto|scroll/);
    await expect(code.locator("figcaption")).toHaveClass(/sr-only/);
  });

  test("projects stack one tile per row, 12px apart, all the same width", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#projects h2")).toHaveText("Projects");
    await expect(page.locator("#projects h2 + p")).toHaveText("Three with public code and a case study each, then the rest.");
    const boxes = await page.locator("#projects article").evaluateAll((as) =>
      as.map((a) => {
        const r = a.getBoundingClientRect();
        return { x: Math.round(r.x), y: r.y + scrollY, w: Math.round(r.width), h: r.height };
      }),
    );
    expect(new Set(boxes.map((b) => b.x)).size).toBe(1);
    expect(new Set(boxes.map((b) => b.w)).size).toBe(1);
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].y).toBeCloseTo(boxes[i - 1].y + boxes[i - 1].h + 12, 0);
  });

  test("project tiles annotate their evidence", async ({ page }) => {
    await page.goto("/");
    const [, resume, immensa] = await page.locator("#projects article").all();
    await expect(resume.locator(".note")).toHaveText("my own resume against a sample posting");
    await expect(resume.getByText("my own resume against a sample posting")).toBeVisible();
    await resume.scrollIntoViewIfNeeded();
    const inside = await resume.locator("figure img").evaluate((img) => {
      const ring = img.parentElement!.querySelector("svg[data-ink]")!.getBoundingClientRect();
      const box = img.getBoundingClientRect();
      const cx = ring.left + ring.width / 2;
      const cy = ring.top + ring.height / 2;
      return cx > box.left && cx < box.right && cy > box.top && cy < box.bottom;
    });
    expect(inside).toBe(true);
    await expect(immensa.locator(".note")).toHaveText("the whole form goes out as one email, photos attached");
    await expect(immensa.locator("[data-code] svg[data-ink]")).toHaveCount(1);
  });

  test("the evidence each note points at is inside its picture window, phone to desktop", async ({ page }) => {
    for (const width of [390, 768, 1000, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const [, resume, immensa] = await page.locator("#projects article").all();
      for (const [tile, mark] of [[resume, "figure svg[data-ink]"], [immensa, "[data-code] svg[data-ink]"]] as const) {
        const box = await tile.evaluate((t, sel) => {
          const w = t.querySelector(".tile-picture")!.getBoundingClientRect();
          const m = t.querySelector(sel)!.getBoundingClientRect();
          return { w: { top: w.top, bottom: w.bottom, left: w.left, right: w.right }, m: { top: m.top, bottom: m.bottom, left: m.left, right: m.right } };
        }, mark);
        expect(box.m.top, `${width}px ${mark}`).toBeGreaterThanOrEqual(box.w.top - 1);
        expect(box.m.bottom, `${width}px ${mark}`).toBeLessThanOrEqual(box.w.bottom + 1);
        expect(box.m.left, `${width}px ${mark}`).toBeGreaterThanOrEqual(box.w.left - 1);
        expect(box.m.right, `${width}px ${mark}`).toBeLessThanOrEqual(box.w.right + 1);
      }
    }
  });

  test("tiles read left to right on a desktop", async ({ page }) => {
    test.skip(isPhone(page), "desktop only");
    await page.goto("/");
    for (const i of [1, 2]) {
      const tile = page.locator("#projects article").nth(i);
      const h3 = await tile.locator("h3").boundingBox();
      const pic = await tile.locator(".tile-picture").boundingBox();
      expect(h3!.x).toBeLessThan(pic!.x);
      expect(Math.abs(h3!.y - pic!.y)).toBeLessThan(200);
    }
  });

  test("more projects: a plain list, two columns on desktop and one on a phone, no boxes", async ({ page }) => {
    await page.goto("/");
    const list = page.locator("#projects ul[aria-labelledby=more-title]");
    await expect(page.locator("#more-title")).toBeVisible();
    await expect(list.locator(":scope > li")).toHaveCount(more.length + 1);
    const lefts = await list.locator(":scope > li").evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(isPhone(page) ? 1 : 2);
    const bgs = await list.locator(":scope > li").evaluateAll((ls) => ls.map((l) => getComputedStyle(l).backgroundColor));
    for (const bg of bgs) expect(bg).toBe("rgba(0, 0, 0, 0)");
    for (const p of more) await expect(list).toContainText(p.summary);
  });



  test("more projects says what kind of project each one is and when, links or not", async ({ page }) => {
    await page.goto("/");
    const items = page.locator("#projects ul[aria-labelledby=more-title] > li");
    for (const [i, p] of more.entries()) {
      const when = [p.kind, p.year].filter(Boolean).join(", ");
      if (when) await expect(items.nth(i), p.title).toContainText(when);
    }
  });

  test("at 320px one long unbroken word in more projects stays inside its own item", async ({ page }) => {
    // html and body clip sideways overflow, so the page never scrolls; check the boxes instead.
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");
    const past = await page.evaluate(() => {
      const list = document.querySelector("#projects ul[aria-labelledby=more-title]")!;
      list.querySelector("li p")!.textContent = "x".repeat(60);
      const vw = document.documentElement.clientWidth;
      return [...list.querySelectorAll("li, li p, li h4")]
        .filter((el) => el.getBoundingClientRect().right > vw + 1)
        .map((el) => el.textContent!.trim().slice(0, 30));
    });
    expect(past).toEqual([]);
  });

  test("resume figures are white, not amber", async ({ page }) => {
    await page.goto("/");
    const colours = await page.locator("#experience strong, #experience [data-figure]").evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
    expect(colours.length).toBeGreaterThan(0);
    for (const c of colours) expect(c).toBe("rgb(245, 245, 247)");
  });

  test("the top bar is see-through, so the sections show through it", async ({ page }) => {
    await page.goto("/");
    const bar = await page.locator("header").first().evaluate((el) => ({ filter: getComputedStyle(el).backdropFilter, bg: getComputedStyle(el).backgroundColor }));
    expect(bar.filter).toContain("blur");
    expect(bar.bg).toMatch(/rgba\(.*0\.\d+\)$/);
  });

  test("buttons respond the moment they're pressed", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("link", { name: "See the work" });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Tailwind sets the press through the CSS `scale` property; read it, or the transform if that's used.
    const scale = () =>
      button.evaluate((el) => {
        const cs = getComputedStyle(el);
        return cs.scale && cs.scale !== "none" ? parseFloat(cs.scale) : new DOMMatrixReadOnly(cs.transform === "none" ? undefined : cs.transform).a;
      });
    await expect.poll(scale).toBeLessThan(0.99);
    await page.mouse.up();
  });

  test("the phone menu eases in", async ({ page }) => {
    test.skip(!isPhone(page), "phone layout only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    expect(await page.locator("header nav.menu-panel").evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
  });

  test("a full-screen screenshot fades out when closed, rather than vanishing", async ({ page }) => {
    await page.goto(projectHref(featured[0].slug));
    await page.getByRole("button", { name: /^View screenshot full screen/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    expect(await page.locator("dialog.lightbox").first().evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
    await expect(dialog).toBeHidden();
  });

  test("each project's picture is scanned once as it arrives, and ends fully revealed", async ({ page }) => {
    await page.goto("/");
    // The scam detection tile tells its story and Immensa's shows code; Resume Analyzer's picture is scanned.
    for (const i of [1]) {
      const frame = page.locator("#projects article").nth(i).locator("[data-scan]");
      // Waiting, dimmed, before it's on screen; then scanned once it arrives.
      await expect(frame).toHaveAttribute("data-scan", "wait");
      await frame.scrollIntoViewIfNeeded();
      await expect(frame).toHaveAttribute("data-scan", "run");
      const cover = frame.locator(".scan-cover");
      await expect.poll(() => cover.evaluate((el) => el.getAnimations().every((a) => a.playState === "finished")), { timeout: 6000 }).toBe(true);
      expect(await cover.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);
    }
  });

  test("with reduced motion or no JavaScript, project pictures are never covered", async ({ browser }) => {
    for (const options of [{ reducedMotion: "reduce" as const }, { javaScriptEnabled: false }]) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      await page.goto("/");
      const heights = await page.locator("#projects .scan-cover").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
      expect(heights.length).toBe(1);
      for (const h of heights) expect(h).toBe(0);
      await context.close();
    }
  });

  test("experience is a drawn timeline: three roles and the degree, newest first, every bullet word for word", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#experience h3")).toHaveText(["Developer, AiKnod", "BSc, Software Engineering", "Front end developer, SafeTrack", "Developer, Immensa Tech"]);
    for (const r of roles) for (const point of r.points) await expect(page.locator("#experience")).toContainText(point);
    const years = await page.locator("#experience .timeline-year").evaluateAll((ys) => ys.map((y) => y.textContent!.trim()).filter(Boolean));
    expect(years).toEqual(["2026", "2025", "2024"]);
    // The spine sits beside the list, not in it: an <ol> may only hold list items.
    const spine = await page.locator("#experience .timeline").evaluate((t) => {
      const svg = t.querySelector(":scope > svg[data-ink]");
      return svg ? svg.getBoundingClientRect().height / t.querySelector(":scope > ol")!.getBoundingClientRect().height : 0;
    });
    expect(spine).toBeGreaterThanOrEqual(0.9);
  });

  test("figures are ringed by hand and stay white", async ({ page }) => {
    await page.goto("/");
    const strong = page.locator("#experience strong");
    await expect(strong).toHaveText(["75%", "50%"]);
    const rings = await strong.evaluateAll((els) => els.map((e) => ({ ring: !!e.closest(".ink-ring")?.querySelector("svg[data-ink]"), colour: getComputedStyle(e).color })));
    for (const r of rings) {
      expect(r.ring).toBe(true);
      expect(r.colour).toBe("rgb(245, 245, 247)");
    }
  });

  test("education lives in the timeline, not in About", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#experience")).toContainText("University of New Brunswick");
    expect(await page.locator("#skills").innerText()).not.toContain("University of New Brunswick");
  });

  test("key phrases are underlined in ink, line by line", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    const phrases = await page.locator("#skills p.type-statement strong").evaluateAll((els) =>
      els.map((e) => {
        const cs = getComputedStyle(e);
        return { bg: cs.backgroundImage, clone: cs.getPropertyValue("box-decoration-break") || cs.getPropertyValue("-webkit-box-decoration-break"), lines: e.getClientRects().length };
      }),
    );
    expect(phrases).toHaveLength(2);
    for (const p of phrases) {
      expect(p.bg).toContain("underline.svg");
      expect(p.clone).toBe("clone");
      expect(p.lines).toBeGreaterThanOrEqual(1);
    }
  });

  test("about and skills names no company I worked at", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("#skills").innerText();
    for (const name of ["AiKnod", "SafeTrack", "Immensa Tech", "Used in"]) expect(text).not.toContain(name);
    await expect(page.locator("#skills")).toContainText(background[0]);
  });
});

test.describe("scam detection story", () => {
  const story = featured[0].story!;

  /** Scroll so the held stretch is a given fraction of the way through (0 = it has just reached the header). */
  const through = (page: Page, f: number) =>
    page.locator("[data-story-pin]").evaluate((el: HTMLElement, f) => {
      const top = el.getBoundingClientRect().top + scrollY - 56;
      const distance = el.offsetHeight - (innerHeight - 56);
      window.scrollTo({ top: top + Math.max(0, distance) * f, behavior: "instant" });
    }, f);

  test("holds on screen while the score climbs to 94 through the detector's real steps", async ({ page }) => {
    await page.goto("/");
    const score = page.locator("[data-story-score]");
    const level = page.locator("[data-story-level]");
    await through(page, 0);
    await expect(score).toHaveText("0");
    await expect(level).toHaveText("Low");
    await through(page, 0.45);
    await expect(level).toHaveText("Medium");
    // The number counts quickly to each new score; once settled it's one of the real totals.
    await expect.poll(() => score.textContent()).toMatch(/^(36|54)$/);
    // Held: the stage stays just under the bar while the page scrolls on.
    expect(await page.locator("[data-story-stage]").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(56);
    await through(page, 1);
    await expect(score).toHaveText(String(story.steps.reduce((sum, st) => sum + st.add, 0)));
    await expect(level).toHaveText("High");
    await expect(page.locator("[data-story-rule][data-on]")).toHaveCount(story.steps.length);
    await expect(page.locator("mark[data-on]")).toHaveCount(story.steps.length);
  });

  test("with reduced motion or no JavaScript, shows the result at once and holds nothing", async ({ browser }) => {
    for (const options of [{ reducedMotion: "reduce" as const }, { javaScriptEnabled: false }]) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("[data-story-score]")).toHaveText("94");
      await expect(page.locator("[data-story-level]")).toHaveText("High");
      await expect(page.locator("[data-story-rule][data-on]")).toHaveCount(story.steps.length);
      const held = await page.locator("[data-story-pin]").evaluate((el: HTMLElement) => el.offsetHeight - (el.querySelector("[data-story-stage]") as HTMLElement).offsetHeight);
      expect(held).toBeLessThanOrEqual(2);
      expect(await page.locator("[data-story-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
      await context.close();
    }
  });

  test("the story underlines each matched phrase in ink", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const marks = await page.locator(".story-mark[data-on]").evaluateAll((ms) =>
      ms.map((m) => ({ bg: getComputedStyle(m).backgroundImage, line: getComputedStyle(m).textDecorationLine })),
    );
    expect(marks.length).toBeGreaterThan(0);
    for (const m of marks) {
      expect(m.bg).toContain("underline.svg");
      expect(m.line).toBe("none");
    }
    await context.close();
  });

  test("screen readers get the message, every rule and the final score as text", async ({ page }) => {
    await page.goto("/");
    const root = page.locator("[data-story]");
    await expect(root).toContainText("Reply YES to secure your account.");
    for (const st of story.steps) await expect(root).toContainText(st.rule);
    await expect(root.locator(".sr-only", { hasText: "94, High" })).toHaveCount(1);
    await expect(root.getByRole("link", { name: /rules on GitHub/ })).toHaveAttribute("href", story.source.href);
  });

  test("on a phone the held stage fits on one screen", async ({ page }) => {
    test.skip(!isPhone(page), "phone only");
    await page.goto("/");
    await through(page, 0.5);
    const fits = await page.locator("[data-story-stage]").evaluate((el) => el.scrollHeight <= innerHeight - 56 + 1);
    expect(fits).toBe(true);
  });
});

test.describe("try the rules", () => {
  const field = (page: Page) => page.getByLabel("Paste a text message");

  test("scores your own text with the tool's rules", async ({ page }) => {
    await page.goto("/");
    const text = "Congratulations you have won a free gift! Claim now at bit.ly/abc";
    const expected = checkSms(text);
    await expect(field(page)).toBeEditable();
    await field(page).fill(text);
    await expect(page.locator("[data-try-score]")).toHaveText(String(expected.risk));
    await expect(page.locator("[data-try-level]")).toHaveText("High");
    for (const issue of expected.issues) await expect(page.locator("[data-try-issues]")).toContainText(issue.msg);
    const marked = await page.locator("[data-try-marked] mark").allTextContents();
    expect(marked.length).toBeGreaterThan(0);
    for (const m of marked) expect(text.toLowerCase()).toContain(m.toLowerCase());
  });

  test("the result says its level in words, with no label over the score, and repeats the text in reading grey", async ({ page }) => {
    await page.goto("/");
    const result = page.locator("[aria-live=polite]").filter({ has: page.locator("[data-try-score]") });
    await expect(result).not.toContainText("Risk score");
    await expect(result).toContainText("94 High risk");
    expect(await page.locator("[data-try-marked]").evaluate((el) => getComputedStyle(el).color)).toBe("rgb(199, 199, 204)");
  });

  test("only the result is announced, not the text being typed", async ({ page }) => {
    await page.goto("/");
    const live = page.locator("[aria-live]").filter({ has: page.locator("[data-try-score]") });
    await expect(live).toHaveCount(1);
    await expect(live.locator("[data-try-issues]")).toHaveCount(1);
    await expect(live.locator("[data-try-marked]")).toHaveCount(0);
    await expect(live.locator("a")).toHaveCount(0);
  });

  test("an empty field scores 0 and flags nothing", async ({ page }) => {
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    await field(page).fill("");
    await expect(page.locator("[data-try-score]")).toHaveText("0");
    await expect(page.locator("[data-try-level]")).toHaveText("Low");
    await expect(page.locator("[data-try-issues]")).toHaveText("Nothing flagged.");
  });

  test("without JavaScript it shows the sample's result", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-try-score]")).toHaveText("94");
    await expect(page.locator("[data-try-level]")).toHaveText("High");
    await expect(field(page)).toHaveAttribute("readonly", "");
    await context.close();
  });

  test("odd input stays text and inside the page", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    const text = `<b>hi</b> 🎉\n${"x".repeat(200)} urgent`;
    await field(page).fill(text);
    await expect(page.locator("[data-try-score]")).toHaveText(String(checkSms(text).risk));
    await expect(page.locator("[data-try-score]")).toHaveText("18");
    await expect(page.locator("[data-try-marked] b")).toHaveCount(0);
    await expect(page.locator("[data-try-marked]")).toContainText("<b>hi</b>");
    const past = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      return [...document.querySelectorAll("#projects *")].filter((el) => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > vw + 1 && !el.closest("pre, [data-code], .tile-picture")).map((el) => el.tagName);
    });
    expect(past).toEqual([]);
  });

  test("the field is labelled, focusable and read-only until ready", async ({ page }) => {
    await page.goto("/");
    const f = field(page);
    await expect(f).toBeEditable();
    await f.focus();
    await expect(f).toBeFocused();
    const outline = await f.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    await expect(page.locator("#try-text")).toHaveAttribute("maxlength", "1000");
    await expect(page.getByText(/^the tool[’']s own rules, running in your browser\. Nothing is sent anywhere\.$/)).toBeVisible();
  });
});

test.describe("case studies", () => {
  for (const p of featured) {
    test(`${p.slug}: loads with its title, sections, code link and working images`, async ({ page }) => {
      const res = await page.goto(projectHref(p.slug));
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(p.title);
      await expect(page).toHaveTitle(`${p.title}, case study | ${site.name}`);
      for (const h of ["Context", "What I built", "Key decision", "Outcome", "Limitations", "Inspect the code"]) {
        await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
      }
      await expect(page.getByRole("link", { name: "All projects" })).toHaveAttribute("href", "/#projects");
      // Screenshots sit in the Outcome section, next to the text that describes them.
      await expect(page.locator("main img")).toHaveCount(p.caseStudy.figures.length);
      await expect(page.locator('section[aria-labelledby="outcome"] img')).toHaveCount(p.caseStudy.figures.length);
      // Fails if any image is missing or never loads.
      await scrollThrough(page);
    });
  }

  test("unknown project paths get the 404 page", async ({ page }) => {
    const res = await page.goto("/projects/not-a-project/");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("This page can’t be found.");
  });
});

test.describe("links", () => {
  for (const path of PAGES) {
    test(`${path}: every link has a real destination`, async ({ page, request }) => {
      await page.goto(path);
      const hrefs = await page.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
      expect(hrefs.length).toBeGreaterThan(5);
      for (const href of new Set(hrefs)) {
        expect(href, "empty or placeholder link").not.toMatch(/^(#?|javascript:.*)$/);
        if (href.startsWith("#")) {
          expect(await page.locator(href).count(), `missing anchor ${href}`).toBe(1);
        } else if (href.startsWith("/")) {
          const [route, hash] = href.split("#");
          const res = await request.get(route);
          expect(res.status(), href).toBe(200);
          if (hash) expect(await res.text(), `missing anchor ${href}`).toContain(`id="${hash}"`);
        } else {
          expect(EXTERNAL.some((re) => re.test(href)), `unexpected external link ${href}`).toBe(true);
        }
      }
    });
  }

  test("external links open in a new tab and say so", async ({ page }) => {
    await page.goto("/");
    const external = page.locator('a[href^="https://"]');
    for (const a of await external.all()) {
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", /noopener/);
      await expect(a).toContainText("(opens in a new tab)");
    }
  });

  test("the resume is a PDF", async ({ request }) => {
    const res = await request.get(site.resume!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });
});

test.describe("navigation", () => {
  test("the bar shows the monogram, the section pills and the resume", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('header a[aria-label="Luvneet Bamrah, home"]')).toHaveText("LB");
    if (!isPhone(page)) await expect(page.locator("header nav[aria-label=Main] .nav-pill a")).toHaveText(["Projects", "Experience", "Skills", "Contact"]);
    await expect(page.locator("header a[download]").first()).toHaveAttribute("href", site.resume!);
    if (isPhone(page)) {
      // On a phone the resume lives in the menu, and the bar keeps the monogram and Menu on one row.
      await expect(page.locator("header > div a[download]")).toBeHidden();
      const mono = (await page.locator('header a[aria-label="Luvneet Bamrah, home"]').boundingBox())!;
      const menu = (await page.getByRole("button", { name: "Menu" }).boundingBox())!;
      expect(Math.abs(mono.y + mono.height / 2 - (menu.y + menu.height / 2))).toBeLessThan(4);
    }
  });

  test("the nav follows the section in view", async ({ page }) => {
    test.skip(isPhone(page), "desktop nav");
    await page.goto("/");
    await page.locator("#experience").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3));
    const nav = page.locator("header nav[aria-label=Main]");
    await expect(nav.getByRole("link", { name: "Experience", exact: true })).toHaveAttribute("aria-current", "true");
    await expect(nav.getByRole("link", { name: "Projects", exact: true })).not.toHaveAttribute("aria-current", "true");
  });

  test("on a case study the nav marks nothing current", async ({ page }) => {
    await page.goto("/projects/scam-detection/");
    await page.waitForTimeout(400);
    await expect(page.locator("header [aria-current]")).toHaveCount(0);
  });

  test("section dots show on a wide screen and hide on a phone", async ({ page }) => {
    await page.goto("/");
    const dots = page.locator("nav[aria-label=Sections]");
    if (isPhone(page)) {
      await expect(dots).toBeHidden();
      return;
    }
    await expect(dots.locator("a")).toHaveCount(5);
    await expect(dots).toBeVisible();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(dots.getByRole("link", { name: "Contact" })).toHaveAttribute("aria-current", "true");
  });

  test("the footer closes with the name at full width", async ({ page }) => {
    await page.goto("/");
    const name = page.locator("footer .footer-name");
    await expect(name).toHaveText(site.name);
    if (!isPhone(page)) {
      const ratio = await name.evaluate((el) => el.getBoundingClientRect().width / document.documentElement.clientWidth);
      expect(ratio).toBeGreaterThanOrEqual(0.8);
    }
  });

  test("section links land below the sticky header", async ({ page }) => {
    await page.goto("/");
    for (const id of ["experience", "skills", "contact", "projects"]) {
      if (isPhone(page)) {
        await page.getByRole("button", { name: "Menu" }).click();
        await page.locator("header nav:not([hidden])").getByRole("link", { name: { experience: "Experience", skills: "Skills", contact: "Contact", projects: "Projects" }[id] }).click();
      } else {
        await page.locator("header nav").getByRole("link", { name: { experience: "Experience", skills: "Skills", contact: "Contact", projects: "Projects" }[id], exact: true }).click();
      }
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      // The heading ends up fully in view, not tucked under the header (polled while smooth scrolling settles).
      await expect
        .poll(
          () =>
            page.evaluate(async (sid) => {
              const before = window.scrollY;
              await new Promise((r) => setTimeout(r, 250));
              if (window.scrollY !== before) return false; // still scrolling
              const header = document.querySelector("header")!.getBoundingClientRect().bottom;
              const h = document.querySelector(`#${sid} h2`)!.getBoundingClientRect();
              return h.top >= header && h.bottom <= window.innerHeight;
            }, id),
          { message: `${id} heading in view below the header`, timeout: 5000 },
        )
        .toBe(true);
    }
  });

  test("the phone menu opens, closes with Escape and returns focus", async ({ page }) => {
    test.skip(!isPhone(page), "phone layout only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const close = page.getByRole("button", { name: "Close" });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("header nav:not([hidden])").getByRole("link", { name: "Experience" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("the first Tab shows a skip link that moves focus to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("keyboard focus is always visible", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const s = getComputedStyle(el);
        return { tag: el.tagName, style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
      });
      expect(outline.style, `${outline.tag} has no focus outline`).not.toBe("none");
      expect(outline.width).toBeGreaterThanOrEqual(2);
    }
  });
});

test.describe("contact", () => {
  test("contact is one wide tile with the address and two pill buttons", async ({ page }) => {
    await page.goto("/");
    const tile = page.locator("#contact .tile");
    await expect(tile.getByRole("link", { name: "Write an email" })).toHaveAttribute("href", `mailto:${site.email}`);
    await expect(tile.getByRole("button", { name: "Copy email address" })).toBeVisible();
    expect(await tile.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(22, 22, 23)");
  });

  test("contact says where the email goes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact .note")).toHaveText("goes straight to my inbox");
    await expect(page.locator("#contact .note")).toBeVisible();
    expect(await page.locator("#contact svg[data-ink]").count()).toBeGreaterThan(0);
  });

  test("copies the email address and confirms it", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Copy email address" }).click();
    await expect(page.getByRole("status")).toHaveText("Email address copied to your clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(site.email);
  });

  test("when the clipboard is refused, selects the address and says how to copy it", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) } });
    });
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Copy email address" }).click();
    await expect(page.getByRole("status")).toContainText("Couldn’t copy automatically");
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(site.email);
  });
});

test.describe("screenshots", () => {
  const PAGE = projectHref("scam-detection");

  test("have no Full size links", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.getByRole("link", { name: "Full size" })).toHaveCount(0);
      await expect(page.locator('a[href$=".webp"]')).toHaveCount(0);
    }
  });

  test("show a magnifying glass on hover", async ({ page }) => {
    test.skip(isPhone(page), "hover is a pointer interaction");
    await page.goto(PAGE);
    const trigger = page.getByRole("button", { name: /^View screenshot full screen/ }).first();
    const glass = trigger.locator("[data-magnifier]");
    await expect(glass).toHaveCSS("opacity", "0");
    await trigger.hover();
    await expect(glass).toHaveCSS("opacity", "1");
    await expect(trigger).toHaveCSS("cursor", "zoom-in");
  });

  test("open full screen on the same page, then close with Escape, the close button or a click outside", async ({ page, context }) => {
    await page.goto(PAGE);
    const url = page.url();
    const triggers = page.getByRole("button", { name: /^View screenshot full screen/ });
    await expect(triggers).toHaveCount(featured[0].caseStudy.figures.length);
    const trigger = triggers.first();

    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Same page, same tab: nothing navigated or opened.
    expect(page.url()).toBe(url);
    expect(context.pages()).toHaveLength(1);
    // The large image fills most of the screen and is the 2x file.
    const big = dialog.locator("img");
    await expect(big).toHaveAttribute("src", /@2x\.webp$/);
    await expect.poll(() => big.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    const box = (await big.boundingBox())!;
    const vp = page.viewportSize()!;
    expect(Math.max(box.width / vp.width, box.height / vp.height)).toBeGreaterThan(0.6);
    // The page behind can't scroll while it's open.
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();

    await trigger.click();
    await page.mouse.click(5, vp.height - 5);
    await expect(dialog).toBeHidden();
    expect(page.url()).toBe(url);
  });

  test("open from the keyboard", async ({ page }) => {
    await page.goto(PAGE);
    const trigger = page.getByRole("button", { name: /^View screenshot full screen/ }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("button", { name: "Close" })).toBeFocused();
  });

  test("project screenshots on the home page open too", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^View screenshot full screen/ }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // The first screenshot on the page that opens full screen is the Resume Analyzer's score.
    await expect(page.getByRole("dialog").locator("img")).toHaveAttribute("src", /score@2x\.webp$/);
  });
});

test.describe("layout", () => {
  for (const path of PAGES) {
    test(`${path}: no sideways scrolling at ${WIDTHS.join(", ")} px`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await scrollThrough(page);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${width}px`).toBe(0);
        // Images never spill out of their frames.
        const spill = await page.evaluate(() =>
          [...document.images].filter((i) => i.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).map((i) => i.src),
        );
        expect(spill, `${width}px`).toEqual([]);
      }
    });
  }

  test("the email address stays on one line on a 375px phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/#contact");
    const lines = await page.getByText(site.email, { exact: true }).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return Math.round(r.height / parseFloat(getComputedStyle(el).lineHeight || "30"));
    });
    expect(lines).toBe(1);
  });

  test("tap targets outside running text are at least 44px tall", async ({ page }) => {
    test.skip(!isPhone(page), "phone layout only");
    for (const path of PAGES) {
      await page.goto(path);
      const small = await page.locator("a:visible, button:visible").evaluateAll((els) =>
        els
          // Inline links in sentences are exempt; so is the skip link until it's focused.
          .filter((el) => getComputedStyle(el).display !== "inline" && !el.classList.contains("sr-only"))
          .map((el) => {
            // offsetHeight ignores transforms, so a frame mid-tilt doesn't shrink its links.
            const h = (el as HTMLElement).offsetHeight;
            const after = getComputedStyle(el, "::after");
            const extra = after.position === "absolute" ? -2 * parseFloat(after.top || "0") : 0;
            return { text: (el.textContent ?? "").trim().slice(0, 40), h: h + extra };
          })
          .filter((t) => t.h < 44),
      );
      expect(small, path).toEqual([]);
    }
  });

  test("each page has one h1 and no skipped heading levels", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
      expect(levels.filter((l) => l === 1), path).toHaveLength(1);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `${path}: h${levels[i - 1]} then h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("motion", () => {
  test("with reduced motion, nothing is hidden, held or animated", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await scrollThrough(page);
    expect(await page.locator("[data-reveal]").count()).toBe(0);
    // The scroll engine never starts, so no scene gets a progress value.
    expect(await page.locator('[data-scene][style*="--p"]').count()).toBe(0);
    // The first screen is still.
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.locator(".hero").evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    await context.close();
  });

  test("with reduced motion every mark is drawn", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await scrollThrough(page);
    const marks = await page.locator("[data-ink] path").evaluateAll((ps) => ps.map((p) => getComputedStyle(p).strokeDashoffset));
    expect(marks.length).toBeGreaterThan(0);
    for (const offset of marks) expect(["0", "0px"]).toContain(offset);
    const drawing = await page.evaluate(() => document.getAnimations().filter((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest?.("[data-ink]")).length);
    expect(drawing).toBe(0);
    await context.close();
  });

  test("with motion allowed, every mark ends fully drawn once scrolled past", async ({ page }) => {
    for (const [w, h] of [[1440, 900], [1920, 1200]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await scrollThrough(page);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(800);
      const undrawn = await page.locator("[data-ink] path").evaluateAll((ps) =>
        ps
          .filter((p) => p.getBoundingClientRect().width > 0 || p.getBoundingClientRect().height > 0)
          .map((p) => ({ at: (p.closest("[data-ink]") as Element).getAttribute("class") ?? p.closest("section")?.id, offset: parseFloat(getComputedStyle(p).strokeDashoffset) }))
          .filter((m) => m.offset > 0.01),
      );
      expect(undrawn, `${w}x${h}`).toEqual([]);
    }
  });

  test("without JavaScript, all content is visible", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("[data-reveal]").count()).toBe(0);
    await expect(page.locator("#contact").getByText(site.availability!)).toBeVisible();
    await expect(page.getByText(site.headline)).toBeVisible();
    await expect(page.locator("section.hero .now-pill")).toContainText(`Now: ${site.availability}`);
    await expect(page.locator("#skills p.type-statement")).toHaveText(site.intro);
    await context.close();
  });

  test("text never waits for an entrance: nothing is marked to fade in", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    expect(await page.locator("[data-reveal]").count()).toBe(0);
  });
});
