import { expect, test, type Locator, type Page } from "@playwright/test";
import { featured, more, projectHref } from "../src/content/projects";
import { alsoUsed, background, roles, skills } from "../src/content/experience";
import { site } from "../src/content/site";
import { checkSms } from "../src/lib/scam-sms";
import { isFib, onScale, PHI } from "../src/lib/golden";

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

/** An init script that makes the browser report no WebGL, as an old or blocked GPU does. */
const noWebGL = () => {
  const original = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) => RenderingContext | null;
  // @ts-expect-error -- the overloads are narrowed; the test only needs the WebGL kinds to fail.
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
    if (/webgl/.test(kind)) return null;
    return original.call(this, kind, ...rest);
  };
};

/** The data field's frame count, as the page reports it. */
const frames = (page: Page) => page.locator("[data-field]").evaluate((el) => Number(el.getAttribute("data-frames") ?? 0));

/**
 * Scroll through the page, and each sideways row of cards to its end and back, then wait for lazy
 * images to load and entrance animations to finish.
 */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const pause = () => new Promise((r) => setTimeout(r, 60));
    for (const row of document.querySelectorAll<HTMLElement>(".carousel")) {
      row.scrollIntoView({ block: "center", behavior: "instant" });
      for (let x = 0; x < row.scrollWidth; x += 300) {
        row.scrollTo({ left: x, behavior: "instant" });
        await pause();
      }
      row.scrollTo({ left: 0, behavior: "instant" });
    }
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await pause();
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
    // Compared without case: the visible titles are set in capitals by CSS, the text is as written.
    const headings = (await page.locator("main h2").allTextContents()).map((h) => h.toLowerCase());
    expect(headings).toEqual(["Selected work", "Experience", "About and skills", "Contact"].map((h) => h.toLowerCase()));
  });

  test("section titles are set in the display face", async ({ page }) => {
    await page.goto("/");
    const titles = await page.locator("main h2:not(.sr-only), #more-title").evaluateAll((hs) =>
      hs.map((h) => ({ text: h.textContent, transform: getComputedStyle(h).textTransform, stretch: getComputedStyle(h).fontStretch })),
    );
    expect(titles.map((t) => t.text)).toEqual(["Selected work", "More projects", "Experience", "About and skills"]);
    for (const t of titles) expect([t.text, t.transform, t.stretch]).toEqual([t.text, "uppercase", "75%"]);
  });

  test("selected work is a carousel of three cards, each linking to its case study and code", async ({ page }) => {
    await page.goto("/");
    const carousel = page.locator("#projects ul.carousel");
    await expect(carousel.locator("> li")).toHaveCount(3);
    expect(await carousel.evaluate((el) => getComputedStyle(el).scrollSnapType)).toContain("x");
    const articles = carousel.locator("> li article");
    // All three cards share one set of buttons.
    const caseStudyClasses = await articles.evaluateAll((as) =>
      as.map((a) => [...a.querySelectorAll("a")].find((l) => l.textContent?.startsWith("Read the case study"))?.className),
    );
    expect(new Set(caseStudyClasses).size).toBe(1);
    for (const [i, p] of featured.entries()) {
      const a = articles.nth(i);
      await expect(a.getByRole("heading", { level: 3 })).toHaveText(p.title);
      await expect(a.getByRole("link", { name: new RegExp(`^Read the case study\\s*: ${p.title}$`) })).toHaveAttribute("href", projectHref(p.slug));
      await expect(a.getByRole("link", { name: new RegExp(`^Code on GitHub\\s*: ${p.title}`) })).toHaveAttribute("href", p.repo.href);
      await expect(a).toContainText(p.tileLine);
      expect(await a.locator(".card-tags li").allTextContents()).toEqual(p.stack.slice(0, 3));
    }
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

  test("with motion allowed the scan line and the marquee run (the drawing's line when there is no WebGL)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(noWebGL);
    await page.goto("/");
    await expect(page.locator("[data-field]")).toHaveAttribute("data-field", "off");
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
            // A card in the carousel scrolls sideways by design: its text must stay inside its own card.
            .filter((el) => !el.closest("pre, [data-code]") && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > (el.closest(".carousel > li")?.getBoundingClientRect().right ?? vw) + 1)
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
    // The site bar counts too: the monogram and the pills share the page's sizes.
    const bar = await page.locator("header").evaluate((h) =>
      [...h.querySelectorAll("a, button")].filter((el) => el.getBoundingClientRect().width > 0 && !el.classList.contains("sr-only")).map((el) => Math.round(parseFloat(getComputedStyle(el).fontSize))),
    );
    const sizes = new Set([...nodes.map((n) => n.size), ...bar]);
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

  test("no notes are left but the timeline years and the ring", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".note")).toHaveCount(0);
    // The ink that stays: the timeline's spine and years, the rings on its figures and on Resume
    // Analyzer's score, and the checker's underlines.
    const ink = await page.locator("main svg[data-ink]").evaluateAll((svgs) => svgs.map((s) => s.closest("#experience") ? "experience" : s.closest("#projects article") ? "card" : "other"));
    expect(ink.filter((k) => k === "other")).toEqual([]);
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


  test("Immensa's code is cut off by its card like a picture: not a scroll region, caption read out", async ({ page }) => {
    await page.goto("/");
    const code = page.locator("#projects article").nth(2).locator("[data-code]");
    await expect(code.locator("pre")).not.toHaveAttribute("tabindex", /.*/);
    expect(await code.locator("pre").evaluate((el) => getComputedStyle(el).overflowY)).not.toMatch(/auto|scroll/);
    await expect(code.locator("figcaption")).toHaveClass(/sr-only/);
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
    // Listen for the transition starting, rather than catching it mid-way: on a busy machine the
    // 0.2s ease can be over before a second round trip reads it.
    await page.locator("header nav.menu-panel").evaluate((el) => {
      (window as unknown as { eased: boolean }).eased = false;
      el.addEventListener("transitionrun", () => ((window as unknown as { eased: boolean }).eased = true));
    });
    await page.getByRole("button", { name: "Menu" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { eased: boolean }).eased)).toBe(true);
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

  test("About's key phrases are white, without ink underlines", async ({ page }) => {
    await page.goto("/");
    const phrases = page.locator("#skills p.type-statement strong");
    await expect(phrases).toHaveCount(2);
    for (const bg of await phrases.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundImage))) expect(bg).toBe("none");
  });

  test("about and skills names no company I worked at", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("#skills").innerText();
    for (const name of ["AiKnod", "SafeTrack", "Immensa Tech", "Used in"]) expect(text).not.toContain(name);
    await expect(page.locator("#skills")).toContainText(background[0]);
  });
});

test.describe("selected work", () => {
  test("the next button scrolls and the ends disable their button", async ({ page }) => {
    test.skip(isPhone(page), "the buttons show from 768px");
    await page.goto("/");
    const carousel = page.locator("#projects ul.carousel");
    const prev = page.getByRole("button", { name: "Previous project" });
    const next = page.getByRole("button", { name: "Next project" });
    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();
    await next.click();
    await expect.poll(() => carousel.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(prev).toBeEnabled();
    await carousel.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
    await expect(next).toBeDisabled();
  });

  test("keyboard reaches every card and the focused one is in view", async ({ page }) => {
    await page.goto("/");
    const carousel = page.locator("#projects ul.carousel");
    for (const p of featured) {
      await page.getByRole("link", { name: new RegExp(`^Read the case study\\s*: ${p.title}$`) }).focus();
      await expect
        .poll(() =>
          carousel.evaluate((ul, title) => {
            const li = [...ul.children].find((c) => c.querySelector("h3")?.textContent === title)!;
            const a = ul.getBoundingClientRect();
            const b = li.getBoundingClientRect();
            return b.left >= a.left - 2 && b.right <= a.right + 2;
          }, p.title),
        )
        .toBe(true);
    }
  });

  test("the ring sits on Resume Analyzer's score", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("#projects article").filter({ has: page.getByRole("heading", { name: "Resume Analyzer" }) });
    const ink = (await card.locator("svg[data-ink]").boundingBox())!;
    const img = (await card.locator("img").boundingBox())!;
    const cx = ink.x + ink.width / 2;
    const cy = ink.y + ink.height / 2;
    expect(cx).toBeGreaterThan(img.x);
    expect(cx).toBeLessThan(img.x + img.width);
    expect(cy).toBeGreaterThan(img.y);
    expect(cy).toBeLessThan(img.y + img.height);
  });

  test("no scroll story is left", async ({ page }) => {
    await page.goto("/");
    for (const sel of ["[data-story]", ".scan-beam", ".scan-cover", ".tile-picture", "[data-scan]"]) await expect(page.locator(sel), sel).toHaveCount(0);
  });

  test("the checker follows the carousel under its own heading, with a plain note", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("#projects h3", { hasText: "Try the scam checker on your own text" });
    await expect(heading).toHaveCount(1);
    await expect(page.locator("#projects .note")).toHaveCount(0);
    await expect(page.locator("#projects")).toContainText("The tool’s own rules, running in your browser. Nothing is sent anywhere.");
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
      return [...document.querySelectorAll("#projects *")].filter((el) => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > vw + 1 && !el.closest("pre, [data-code], .carousel > li")).map((el) => el.tagName);
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
    await expect(page.getByText(/^The tool[’']s own rules, running in your browser\. Nothing is sent anywhere\.$/)).toBeVisible();
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

  test("the section dots stay readable over the cards: the label sits on its own dark ground", async ({ page }) => {
    test.skip(isPhone(page), "dots show from 1280px");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#projects").evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + 300, behavior: "instant" }));
    const label = page.locator('.dot-link[aria-current="true"] .dot-label');
    await expect(label).toBeVisible();
    expect(await label.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
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
    // The first screenshot on the page that opens full screen is the scam tool's result.
    await expect(page.getByRole("dialog").locator("img")).toHaveAttribute("src", /app@2x\.webp$/);
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
        // Images never spill out of their frames. (A card's picture further along the row of cards is
        // off to the side by design; the row itself is checked by the overflow above.)
        const spill = await page.evaluate(() =>
          [...document.images].filter((i) => !i.closest(".carousel > li") && i.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).map((i) => i.src),
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

test.describe("golden ratio", () => {
  test("every type size on the home page is on the φ scale at 1440", async ({ page }) => {
    test.skip(isPhone(page), "measured on the desktop layout");
    await page.goto("/");
    const sizes = await page.evaluate(() => {
      const out = new Set<number>();
      for (const root of [document.querySelector("header")!, document.querySelector("main")!]) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const el = walker.currentNode.parentElement!;
          if (!walker.currentNode.textContent!.trim() || !el.getBoundingClientRect().width || el.closest(".sr-only, pre, [data-code], dialog")) continue;
          out.add(Math.round(parseFloat(getComputedStyle(el).fontSize) * 100) / 100);
        }
      }
      return [...out];
    });
    expect(sizes.filter((s) => !onScale(s))).toEqual([]);
  });

  for (const width of [1440, 390]) {
    test(`margins, paddings and gaps in main are Fibonacci at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const values = await page.evaluate(() => {
        const out: { where: string; prop: string; v: number }[] = [];
        for (const el of document.querySelectorAll("main *")) {
          if (el.closest("pre, [data-code], .sr-only, svg, canvas, dialog") || !(el as HTMLElement).getClientRects().length) continue;
          const cs = getComputedStyle(el);
          for (const prop of ["marginTop", "marginBottom", "paddingTop", "paddingBottom", "rowGap", "columnGap"] as const) {
            const v = parseFloat(cs[prop]);
            if (v > 0) out.push({ where: `${el.tagName.toLowerCase()}.${String(el.getAttribute("class") ?? "").slice(0, 50)}`, prop, v });
          }
        }
        return out;
      });
      expect(values.length).toBeGreaterThan(20);
      expect(values.filter((x) => !isFib(x.v)).map((x) => `${x.where} ${x.prop}=${x.v}`)).toEqual([]);
    });
  }

  test("the first screen splits 1.618 : 1", async ({ page }) => {
    test.skip(isPhone(page), "the split is from 1024px");
    await page.goto("/");
    const ratio = await page.evaluate(() => document.querySelector(".hero-copy")!.getBoundingClientRect().width / document.querySelector(".hero-visual")!.getBoundingClientRect().width);
    expect(Math.abs(ratio - PHI) / PHI).toBeLessThan(0.02);
  });

  test("reading text is set at line height φ", async ({ page }) => {
    await page.goto("/");
    const ratios = await page.locator("#experience li, .type-lede").evaluateAll((els) =>
      els.filter((e) => e.getClientRects().length).map((e) => parseFloat(getComputedStyle(e).lineHeight) / parseFloat(getComputedStyle(e).fontSize)),
    );
    expect(ratios.length).toBeGreaterThan(3);
    for (const r of ratios) expect(r).toBeCloseTo(PHI, 2);
  });

  test("card pictures are golden rectangles", async ({ page }) => {
    await page.goto("/");
    const ratios = await page.locator(".card-picture").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width / e.getBoundingClientRect().height));
    expect(ratios).toHaveLength(3);
    for (const r of ratios) expect(r).toBeCloseTo(PHI, 2);
  });
});

test.describe("3D data field", () => {
  test("runs with motion allowed, and its frames advance", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const field = page.locator("[data-field]");
    await expect(field).toHaveAttribute("data-field", "running", { timeout: 15_000 });
    await expect(field).toHaveAttribute("aria-hidden", "true");
    const first = await frames(page);
    await page.waitForTimeout(1500);
    expect(await frames(page)).toBeGreaterThan(first);
    const ratio = await field.locator("canvas").evaluate((c: HTMLCanvasElement) => c.width / c.clientWidth);
    expect(ratio).toBeLessThanOrEqual(2);
    await expect(page.locator(".data-check")).toBeHidden();
  });

  test("with reduced motion it renders one still frame", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const field = page.locator("[data-field]");
    await expect(field).toHaveAttribute("data-field", "still", { timeout: 15_000 });
    const first = await frames(page);
    await page.waitForTimeout(1000);
    expect(await frames(page)).toBe(first);
    await expect(field.locator("canvas")).toBeVisible();
    await expect(page.locator(".data-check")).toBeHidden();
  });

  test("pauses off screen and runs again on return", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const field = page.locator("[data-field]");
    await expect(field).toHaveAttribute("data-field", "running", { timeout: 15_000 });
    await page.evaluate(() => document.getElementById("contact")!.scrollIntoView({ behavior: "instant" }));
    await expect(field).toHaveAttribute("data-field", "paused");
    const parked = await frames(page);
    await page.waitForTimeout(1000);
    expect(await frames(page)).toBeLessThanOrEqual(parked + 30);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(field).toHaveAttribute("data-field", "running");
  });

  test("without WebGL the drawing stays", async ({ page }) => {
    await page.addInitScript(noWebGL);
    await page.goto("/");
    await expect(page.locator("[data-field]")).toHaveAttribute("data-field", "off", { timeout: 15_000 });
    await expect(page.locator(".data-check")).toBeVisible();
    await expect(page.locator("[data-field] canvas")).toHaveCount(0);
  });

  test("a lost WebGL context brings the drawing back", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const field = page.locator("[data-field]");
    await expect(field).toHaveAttribute("data-field", "running", { timeout: 15_000 });
    await field.locator("canvas").evaluate((c: HTMLCanvasElement) => {
      const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext;
      gl.getExtension("WEBGL_lose_context")!.loseContext();
    });
    await expect(field).toHaveAttribute("data-field", "off");
    await expect(page.locator(".data-check")).toBeVisible();
  });

  test("without JavaScript it is the drawing", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-field]")).toHaveAttribute("data-field", "drawing");
    await expect(page.locator(".data-check")).toBeVisible();
    await context.close();
  });

  test("the field never takes the pointer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-field]")).toHaveAttribute("data-field", /running|still/, { timeout: 15_000 });
    expect(await page.locator("[data-field] canvas").evaluate((c) => getComputedStyle(c).pointerEvents)).toBe("none");
    expect(await page.locator("[data-field]").evaluate((c) => getComputedStyle(c).pointerEvents)).toBe("none");
    await page.getByRole("link", { name: "See the work" }).click();
    await expect(page).toHaveURL(/#projects$/);
  });

  test("three is not in the first-load scripts", async ({ page, request }) => {
    await page.goto("/");
    const srcs = await page.evaluate(() => [...document.querySelectorAll<HTMLScriptElement>("script[src]")].map((s) => s.src));
    const html = await (await request.get("/")).text();
    const initial = srcs.filter((src) => html.includes(new URL(src).pathname));
    expect(initial.length).toBeGreaterThan(0);
    for (const src of initial) expect(await (await request.get(src)).text(), src).not.toContain("isWebGLRenderer");
  });
});

/** The rotation an element's computed transform applies about x and y, in whole degrees (0 for none). */
const rotation = (el: Locator) =>
  el.evaluate((node) => {
    const t = getComputedStyle(node).transform;
    if (!t || t === "none") return { x: 0, y: 0 };
    const m = new DOMMatrix(t);
    // Perspective folds into the matrix's last column; the rotation lives in the upper 3×3.
    return { x: Math.round((Math.atan2(m.m23, m.m33) * 180) / Math.PI) + 0, y: Math.round((Math.asin(Math.max(-1, Math.min(1, -m.m13))) * 180) / Math.PI) + 0 };
  });

test.describe("3D motion", () => {
  test("cards lean toward the pointer and settle back", async ({ page }) => {
    test.skip(isPhone(page), "a mouse is needed");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const tilt = page.locator("#projects .tilt").first();
    await tilt.scrollIntoViewIfNeeded();
    const box = (await tilt.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2, { steps: 4 });
    await page.waitForTimeout(400);
    const leaning = await rotation(tilt);
    expect(leaning.y).toBeGreaterThan(0);
    expect(leaning.x).toBeGreaterThan(0);
    await expect(tilt).toHaveAttribute("data-tilting", "");
    await page.mouse.move(5, 5);
    await page.waitForTimeout(900);
    expect(await rotation(tilt)).toEqual({ x: 0, y: 0 });
  });

  test("the skills tile tilts too", async ({ page }) => {
    test.skip(isPhone(page), "a mouse is needed");
    await page.goto("/");
    await expect(page.locator("#skills .tilt")).toHaveCount(1);
  });

  test("cards don't tilt on a phone or with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: isPhone(page) ? "no-preference" : "reduce" });
    await page.goto("/");
    const tilt = page.locator("#projects .tilt").first();
    await tilt.scrollIntoViewIfNeeded();
    const box = (await tilt.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.15, { steps: 4 });
    await page.waitForTimeout(400);
    expect(await rotation(tilt)).toEqual({ x: 0, y: 0 });
  });

  test("titles swing up as they enter and rest flat", async ({ page }) => {
    test.skip(isPhone(page), "measured on the desktop layout");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const title = page.locator("#experience h2");
    // Placed by its container's top (the title's own box is foreshortened while it turns).
    const at = (fraction: number) =>
      title.evaluate((el, f) => window.scrollTo({ top: el.parentElement!.getBoundingClientRect().top + scrollY - innerHeight * f, behavior: "instant" }), fraction);
    await at(0.97);
    await page.waitForTimeout(150);
    expect((await rotation(title)).x).toBeGreaterThan(10);
    await at(0.4);
    await page.waitForTimeout(150);
    expect(await rotation(title)).toEqual({ x: 0, y: 0 });
  });

  test("timeline entries unfold from the spine", async ({ page }) => {
    test.skip(isPhone(page), "measured on the desktop layout");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const body = page.locator(".timeline-body").nth(1);
    expect(await body.evaluate((el) => getComputedStyle(el).transformOrigin.split(" ")[0])).toBe("0px");
    const at = (fraction: number) =>
      body.evaluate((el, f) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * f, behavior: "instant" }), fraction);
    await at(0.97);
    await page.waitForTimeout(150);
    expect(Math.abs((await rotation(body)).y)).toBeGreaterThan(10);
    await at(0.3);
    await page.waitForTimeout(150);
    expect(await rotation(body)).toEqual({ x: 0, y: 0 });
  });

  test("with reduced motion titles and timeline are flat", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: document.getElementById("experience")!.offsetTop, behavior: "instant" }));
    const transforms = await page.locator(".section-title, .timeline-body").evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
    expect(transforms.length).toBeGreaterThan(5);
    for (const t of transforms) expect(t).toBe("none");
  });

  test("no text fades", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    for (const id of ["projects", "experience", "skills", "contact"]) {
      await page.evaluate((id) => {
        const el = document.getElementById(id)!;
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.85, behavior: "instant" });
      }, id);
      await page.waitForTimeout(150);
      const faded = await page.evaluate(() =>
        [...document.querySelectorAll("main h2, main h3, main p, main li")]
          .filter((el) => !el.closest(".hero, .dot-label, .sr-only") && el.getBoundingClientRect().width > 0)
          .filter((el) => {
            for (let n: Element | null = el; n; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 1) return true;
            return false;
          })
          .map((el) => el.textContent!.trim().slice(0, 30)),
      );
      expect(faded, id).toEqual([]);
    }
  });
});
