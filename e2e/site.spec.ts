import { expect, test, type Page } from "@playwright/test";
import { featured, heroRecording, more, projectHref } from "../src/content/projects";
import { roles } from "../src/content/experience";
import { site } from "../src/content/site";

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

/** The rotateX angle of an element's current transform, in whole degrees (0 when flat). */
const tilt = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === "none" ? undefined : getComputedStyle(el).transform);
    return Math.round((Math.acos(Math.max(-1, Math.min(1, m.m22))) * 180) / Math.PI);
  });

test.describe("home page", () => {
  test("says who, what and where, with the two main actions", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(site.name);
    await expect(page.getByText(site.headline)).toBeVisible();
    const view = page.getByRole("link", { name: "See the projects" });
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
});

test.describe("opening", () => {
  test("shows the scam detection tool, centred under a centred headline, starting on the first screen", async ({ page }) => {
    await page.goto("/");
    const shot = page.getByRole("img", { name: heroRecording.alt });
    await expect(shot).toBeVisible();
    const box = await shot.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { centre: r.left + r.width / 2, top: r.top, half: document.documentElement.clientWidth / 2, fold: innerHeight };
    });
    expect(Math.abs(box.centre - box.half)).toBeLessThan(2);
    expect(box.top).toBeLessThan(box.fold);
    // Most of it is on the first screen, so the scan can be seen (once the frame has risen into place).
    const onScreen = () => shot.evaluate((el) => { const r = el.getBoundingClientRect(); return (Math.min(r.bottom, innerHeight) - r.top) / r.height; });
    await expect.poll(onScreen, { timeout: 4000 }).toBeGreaterThan(0.6);
    expect(await page.getByText(site.headline).evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    await expect(page.locator("main figure").first().getByRole("link", { name: /case study/ })).toHaveAttribute("href", projectHref(featured[0].slug));
  });

  test("the frame shows most of the tool on a 1440×900 screen and runs into the hero's bottom edge", async ({ page }) => {
    test.skip(isPhone(page), "desktop only");
    await page.goto("/");
    const still = page.getByRole("img", { name: heroRecording.alt });
    await expect
      .poll(() => still.evaluate((el) => { const r = el.getBoundingClientRect(); return (Math.min(r.bottom, innerHeight) - r.top) / r.height; }), { timeout: 4000 })
      .toBeGreaterThan(0.8);
    // Measured once the frame has turned to face you (it starts tilted back, which lifts its bottom edge).
    await page.evaluate(() => window.scrollTo({ top: innerHeight * 0.75, behavior: "instant" }));
    const gap = () => page.locator("section.hero").evaluate((s) => Math.abs(s.getBoundingClientRect().bottom - s.querySelector(".hero-frame")!.getBoundingClientRect().bottom));
    await expect.poll(gap).toBeLessThanOrEqual(1);
  });

  test("the scan passes down the screenshot once and leaves it fully revealed", async ({ page }) => {
    await page.goto("/");
    const cover = page.locator(".hero .scan-cover");
    const beam = page.locator(".hero .scan-beam");
    expect(await cover.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
    await expect
      .poll(() => cover.evaluate((el) => el.getAnimations().every((a) => a.playState === "finished")), { timeout: 8000 })
      .toBe(true);
    expect(await cover.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);
    expect(await beam.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
  });

  test("the screenshot starts tilted back and turns to face you as you scroll", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => tilt(page, ".hero-frame")).toBeGreaterThan(10);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 0.75));
    await expect.poll(() => tilt(page, ".hero-frame")).toBe(0);
  });

  test("the first project doesn't repeat the opening screenshot: it tells its story instead", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("#projects article").first();
    await expect(first.locator("[data-story]")).toHaveCount(1);
    await expect(first.locator(`img[src*="recording-"]`)).toHaveCount(0);
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

  test("the opening and the intro scroll normally: nothing is held in place", async ({ page }) => {
    await page.goto("/");
    // The opening's figure (the headline above it lifts away on purpose) and the intro paragraph.
    for (const selector of ["main figure >> nth=0"]) {
      const at = async (y: number) => {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
        return page.locator(selector).evaluate((el) => el.getBoundingClientRect().top);
      };
      const start = await page.locator(selector).evaluate((el) => el.getBoundingClientRect().top + scrollY - innerHeight / 2);
      const y0 = Math.max(0, Math.round(start));
      expect(Math.round((await at(y0)) - (await at(y0 + 200)))).toBe(200);
    }
  });
});

test.describe("opening recording", () => {
  const video = (page: Page) => page.locator("[data-recording] video");
  const playing = (page: Page) => video(page).evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0);
  const button = (page: Page, name: "Pause the recording" | "Play the recording") => page.locator("[data-recording]").getByRole("button", { name });
  /** Collects uncaught page errors, for the failure cases. */
  const errors = (page: Page) => {
    const list: string[] = [];
    page.on("pageerror", (e) => list.push(String(e)));
    return list;
  };

  test("plays once the scan has passed, using the crop for the screen", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain(isPhone(page) ? "recording-phone.webm" : "recording-desktop.webm");
    await expect(page.locator("[data-recording] video[data-playing]")).toHaveCount(1);
  });

  test("the button pauses and resumes it", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
    await button(page, "Pause the recording").click();
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(button(page, "Play the recording")).toBeVisible();
    await button(page, "Play the recording").click();
    await expect.poll(() => playing(page)).toBe(true);
  });

  test("keyboard: Tab reaches the button, Space toggles it, the focus ring is amber", async ({ page }) => {
    test.skip(isPhone(page), "keyboard on desktop");
    await page.goto("/");
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
    const pause = button(page, "Pause the recording");
    for (let i = 0; i < 30 && !(await pause.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    expect(await pause.evaluate((el) => el === document.activeElement)).toBe(true);
    expect(await pause.evaluate((el) => getComputedStyle(el).outlineColor)).toBe("rgb(255, 176, 0)");
    await page.keyboard.press("Space");
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("turning a phone sideways switches to the crop for the new screen and keeps playing", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain("recording-phone");
    await page.setViewportSize({ width: 844, height: 390 });
    // On a short landscape screen the frame starts below the fold; bring it on screen.
    await page.locator("[data-recording]").evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain("recording-desktop");
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
  });

  test("the button's focus ring is drawn inside its dark disc, so it shows over the light recording", async ({ page }) => {
    test.skip(isPhone(page), "keyboard on desktop");
    await page.goto("/");
    const btn = page.locator("[data-recording] button");
    await btn.focus();
    const ring = await btn.evaluate((el) => ({ offset: parseFloat(getComputedStyle(el).outlineOffset), width: parseFloat(getComputedStyle(el).outlineWidth) }));
    expect(ring.offset + ring.width).toBeLessThanOrEqual(0);
  });

  test("pauses off screen and resumes on return", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: innerHeight * 2, behavior: "instant" }));
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => playing(page)).toBe(true);
  });

  test("with reduced motion nothing loads or plays until asked", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForTimeout(5000);
    expect(await video(page).getAttribute("src")).toBeNull();
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await button(page, "Play the recording").click();
    await expect.poll(() => playing(page), { timeout: 10_000 }).toBe(true);
    await context.close();
  });

  test("without JavaScript the still shows and there is no button", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("img", { name: heroRecording.alt })).toBeVisible();
    await expect(page.locator("[data-recording] button")).toHaveCount(0);
    expect(await video(page).getAttribute("src")).toBeNull();
    await context.close();
  });

  test("autoplay refused: the still stays and the button offers Play", async ({ page }) => {
    const seen = errors(page);
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException("blocked", "NotAllowedError"));
    });
    await page.goto("/");
    await page.waitForTimeout(5000);
    await expect(page.locator("[data-recording] video[data-playing]")).toHaveCount(0);
    await expect(button(page, "Play the recording")).toBeVisible();
    await expect(page.getByRole("img", { name: heroRecording.alt })).toBeVisible();
    expect(seen).toEqual([]);
  });

  test("video fails to load: the still stays and nothing throws", async ({ page }) => {
    const seen = errors(page);
    await page.route(/recording-(desktop|phone)\.(webm|mp4)$/, (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/");
    await page.waitForTimeout(6000);
    await expect(page.locator("[data-recording] video[data-playing]")).toHaveCount(0);
    await expect(page.getByRole("img", { name: heroRecording.alt })).toBeVisible();
    expect(seen).toEqual([]);
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
    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of PAGES) {
        await page.goto(path);
        const past = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          return [...document.querySelectorAll("main p, main h1, main h2, main h3, main li, main a, main dt, main dd, footer p, footer a")]
            // Text in a row that scrolls sideways on purpose (More projects on a phone) is reached by scrolling the row.
            .filter((el) => !el.closest("pre, [data-code], .more-row") && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > vw + 1)
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

  test("amber is kept for the main action", async ({ page }) => {
    await page.goto("/");
    const amber = await page.evaluate(() =>
      [...document.querySelectorAll("main *")].filter((el) => {
        const cs = getComputedStyle(el);
        return el.getBoundingClientRect().width > 0 && (cs.color === "rgb(255, 176, 0)" || cs.backgroundColor === "rgb(255, 176, 0)");
      }).length,
    );
    expect(amber).toBeLessThanOrEqual(2);
  });

  test("the headline fits on two lines on a desktop screen", async ({ page }) => {
    test.skip(isPhone(page), "desktop only");
    await page.goto("/");
    const lines = await page.getByText(site.headline).evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBeLessThanOrEqual(2);
  });

  test("on a phone the opening shows the tool's own phone layout", async ({ page }) => {
    test.skip(!isPhone(page), "phone only");
    await page.goto("/");
    const shot = page.getByRole("img", { name: heroRecording.alt });
    await expect.poll(() => shot.evaluate((img: HTMLImageElement) => img.currentSrc)).toContain(heroRecording.phone.src);
  });

  test("Immensa's code is cut off by its tile like a picture: not a scroll region, caption read out", async ({ page }) => {
    await page.goto("/");
    const code = page.locator("#projects article").nth(1).locator("[data-code]");
    await expect(code.locator("pre")).not.toHaveAttribute("tabindex", /.*/);
    expect(await code.locator("pre").evaluate((el) => getComputedStyle(el).overflowY)).not.toMatch(/auto|scroll/);
    await expect(code.locator("figcaption")).toHaveClass(/sr-only/);
  });

  test("projects are tiles 12px apart: the story full width, the other two side by side and at least 640px tall", async ({ page }) => {
    test.skip(isPhone(page), "desktop layout");
    await page.goto("/");
    const boxes = await page.locator("#projects article").evaluateAll((as) =>
      as.map((a) => {
        const r = a.getBoundingClientRect();
        return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, bg: getComputedStyle(a).backgroundColor };
      }),
    );
    expect(boxes[0].w).toBeGreaterThan(1400);
    expect(boxes[1].y).toBeCloseTo(boxes[0].y + boxes[0].h + 12, 0);
    expect(boxes[2].x - (boxes[1].x + boxes[1].w)).toBeCloseTo(12, 0);
    for (const b of boxes.slice(1)) expect(b.h).toBeGreaterThanOrEqual(640);
    for (const b of boxes) expect(b.bg).toBe("rgb(22, 22, 23)");
  });

  test("more projects: four across on desktop, a sideways row on a phone", async ({ page }) => {
    await page.goto("/");
    const row = page.locator("#projects ul[aria-labelledby=more-title]");
    await expect(row.locator(":scope > li")).toHaveCount(more.length + 1);
    const tops = await row.locator(":scope > li").evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().top)));
    if (isPhone(page)) {
      expect(new Set(tops).size).toBe(1);
      expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    } else {
      expect(new Set(tops).size).toBe(2);
    }
    for (const p of more) await expect(row).toContainText(p.summary);
  });

  test("on a phone, pressing Tab through the row brings its last link fully into view", async ({ page }) => {
    for (const width of [320, 390, 412]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page.getByRole("link", { name: /Video demo on YouTube/ }).focus();
      await page.keyboard.press("Tab");
      const last = page.getByRole("link", { name: /Everything else on GitHub/ });
      await expect(last).toBeFocused();
      await expect
        .poll(() => last.evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), { message: `${width}px` })
        .toBe(true);
    }
  });

  test("no sideways page scroll at 320px, and Tab scrolls row links into view", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    const last = page.getByRole("link", { name: /Everything else on GitHub/ });
    await last.focus();
    await expect.poll(() => last.evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })).toBe(true);
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
    const button = page.getByRole("link", { name: "See the projects" });
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
    for (const i of [2]) {
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

  test("experience leads with its two figures, large and white, then every role and bullet word for word", async ({ page }) => {
    await page.goto("/");
    const figures = page.locator("#experience [data-figure]");
    await expect(figures).toHaveText(["75%", "50%"]);
    for (const s of await figures.evaluateAll((els) => els.map((e) => ({ c: getComputedStyle(e).color, f: parseFloat(getComputedStyle(e).fontSize) })))) {
      expect(s.c).toBe("rgb(245, 245, 247)");
      expect(s.f).toBeGreaterThanOrEqual(80);
    }
    for (const r of roles) for (const point of r.points) await expect(page.locator("#experience")).toContainText(point);
    await expect(page.locator("#experience [data-scene]")).toHaveCount(0);
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
    // The opening screenshot is flat, uncovered and still: no scan, no tilt.
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await tilt(page, ".hero-frame")).toBe(0);
    expect(await page.locator(".hero .scan-cover").evaluate((el) => el.getBoundingClientRect().height)).toBe(0);
    expect(await page.locator(".hero").evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    await context.close();
  });

  test("without JavaScript, all content is visible", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("[data-reveal]").count()).toBe(0);
    await expect(page.getByText(site.availability!)).toBeVisible();
    await expect(page.getByText(site.headline)).toBeVisible();
    await expect(page.getByRole("img", { name: heroRecording.alt })).toBeVisible();
    await expect(page.locator("#skills p.type-statement")).toHaveText(site.intro);
    await context.close();
  });

  test("text never waits for an entrance: nothing is marked to fade in", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    expect(await page.locator("[data-reveal]").count()).toBe(0);
  });
});
