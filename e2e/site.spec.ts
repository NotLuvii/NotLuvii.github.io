import { expect, test, type Page } from "@playwright/test";
import { featured, more, projectHref } from "../src/content/projects";
import { approach, interests, roles, skills } from "../src/content/experience";
import { site } from "../src/content/site";
import { checkScam, SAMPLES } from "../src/lib/scam-rules";
import { isFib, onScale, PHI } from "../src/lib/golden";

const PAGES = ["/", ...featured.map((p) => projectHref(p.slug))];
const WIDTHS = [320, 375, 390, 768, 1024, 1440];

/** External destinations the site may link to: verified repositories and profiles only. */
const EXTERNAL = [
  /^https:\/\/github\.com\/NotLuvii$/,
  /^https:\/\/github\.com\/NotLuvii\/(Fraud-Detection-Tool|Mobile-app|Resume-Analyze|Traffic-Detection|StockPredictor|CS3035-Individual-Graphing-Project)(\/blob\/(main|master|558fa66)\/[\w./-]+(#L\d+-L\d+)?)?$/,
  /^https:\/\/www\.linkedin\.com\/in\/luvneet-bamrah-157281214$/,
  /^https:\/\/youtu\.be\/qHmMMeWLiNo$/,
  /^mailto:luvneetbamrah@gmail\.com$/,
];

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

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
    expect(headings).toEqual(["Selected work", "Try the scam checker", "More projects", "Experience", "About and skills", "Contact"].map((h) => h.toLowerCase()));
  });

  test("section titles are set in the display face", async ({ page }) => {
    await page.goto("/");
    const titles = await page.locator("main h2:not(.sr-only), #more-title").evaluateAll((hs) =>
      hs.map((h) => ({ text: h.textContent, transform: getComputedStyle(h).textTransform, stretch: getComputedStyle(h).fontStretch })),
    );
    expect(titles.map((t) => t.text)).toEqual(["Selected work", "Try the scam checker", "More projects", "Experience", "About and skills"]);
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

  test("the intro appears once", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("main").innerText();
    expect(text.split(site.intro).length - 1).toBe(1);
    await expect(page.locator("section.hero")).toContainText(site.intro);
  });

  test("About explains interests and approach, names no company, and lists skills once", async ({ page }) => {
    await page.goto("/");
    const about = page.locator("#skills");
    await expect(about.getByRole("heading", { level: 3 })).toHaveText(["What I’m interested in", "How I work", "Skills"]);
    await expect(about).toContainText(interests);
    for (const a of approach) await expect(about).toContainText(a.point);
    for (const a of approach.filter((x) => x.slug)) await expect(about.getByRole("link", { name: a.from })).toHaveAttribute("href", projectHref(a.slug!));
    expect(await about.innerText()).not.toContain(site.intro);
    const main = await page.locator("main").innerText();
    for (const s of skills) expect(main.split(s.group).length - 1, s.group).toBe(1);
  });

  test("contact offers the same roles as the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact p.type-statement")).toHaveText(site.availability!);
    expect(site.availability).toContain("web apps and data tools");
    expect(site.headline).toContain("web apps and data tools");
  });
});


test.describe("first screen", () => {
  test("nothing removed is left behind", async ({ page }) => {
    await page.goto("/");
    for (const sel of ["[data-recording]", ".hero-frame", ".more-row", "[data-figure]", "video", ".role-grid", ".sketch", ".data-check"]) await expect(page.locator(sel), sel).toHaveCount(0);
  });

  test("says who and what: the clock, the name, the headline, the intro, two buttons and the diagram, with no status pill", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section.hero");
    // No status pill: the first screen opens on the clock line and the name.
    await expect(hero.locator(".now-pill")).toHaveCount(0);
    await expect(hero).not.toContainText("Now:");
    await expect(hero.locator("[data-clock]")).toHaveText(/^Fredericton, NB · \d{1,2}:\d{2} [ap]m A[DS]T$/);
    await expect(hero.locator("h1")).toHaveText(site.name);
    await expect(hero.getByText(site.headline)).toBeVisible();
    await expect(hero.getByText(site.intro)).toBeVisible();
    await expect(hero.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "#projects");
    await expect(hero.getByRole("link", { name: /Download resume/ })).toHaveAttribute("download", "");
    await expect(hero.locator("figure.reconcile svg")).toHaveAttribute("aria-hidden", "true");
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

  test("the first screen fits: the name, the words and the diagram on screen, clear of the bar", async ({ page }) => {
    for (const [w, h] of [[1440, 900], [1280, 720]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      const box = await page.locator("section.hero").evaluate((s) => {
        const n = s.querySelector("h1")!.getBoundingClientRect();
        const c = s.querySelector(".hero-copy")!.getBoundingClientRect();
        const d = s.querySelector(".hero-visual")!.getBoundingClientRect();
        return { top: n.top, bottom: c.bottom, dTop: d.top, dBottom: d.bottom, dWidth: d.width, vh: innerHeight };
      });
      expect(box.top, `${w}x${h}`).toBeGreaterThanOrEqual(56);
      expect(box.bottom, `${w}x${h}`).toBeLessThanOrEqual(box.vh);
      expect(box.dTop, `${w}x${h} diagram`).toBeGreaterThanOrEqual(56);
      expect(box.dBottom, `${w}x${h} diagram`).toBeLessThanOrEqual(box.vh);
      expect(box.dWidth, `${w}x${h} diagram`).toBeGreaterThanOrEqual(360);
    }
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const phone = await page.locator("section.hero").evaluate((s) => ({
      top: s.querySelector("h1")!.getBoundingClientRect().top,
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
      ticks: document.querySelectorAll(".rc-tick").length,
      flags: document.querySelectorAll(".rc-flag").length,
    }));
    expect(state).toEqual({ hero: 0, ticks: 7, flags: 1 });
  });

  test("no scan line anywhere", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.locator(".dc-line, .rc-scan")).toHaveCount(0);
  });

  test("the hero shows the reconciliation: 8 rows, 7 checked, 1 traced", async ({ page }) => {
    await page.goto("/");
    const figure = page.locator("section.hero figure.reconcile");
    await expect(figure.locator("figcaption")).toHaveText("Report figures checked against the source system, row by row; the one that doesn't match is traced to its root cause.");
    await expect(figure.locator(".rc-row")).toHaveCount(8);
    await expect(figure.locator(".rc-tick")).toHaveCount(7);
    await expect(figure.locator(".rc-flag")).toHaveCount(1);
    await expect(figure.locator(".rc-trace")).toHaveCount(1);
    await expect(figure.locator("svg")).toHaveAttribute("aria-hidden", "true");
    for (const label of ["Report", "Source", "Root cause"]) await expect(figure.getByText(label, { exact: true })).toBeVisible();
    // No numbers: the drawing invents no data.
    expect(await figure.evaluate((f) => /\d/.test(f.querySelector(".rc-board")!.textContent!))).toBe(false);
  });

  test("with reduced motion or motion paused the check shows finished", async ({ browser }) => {
    for (const mode of ["reduce", "paused"] as const) {
      const context = await browser.newContext({ reducedMotion: mode === "reduce" ? "reduce" : "no-preference" });
      if (mode === "paused") await context.addInitScript(() => localStorage.setItem("motion", "paused"));
      const page = await context.newPage();
      await page.goto("/");
      const state = await page.locator("figure.reconcile").evaluate((f) => ({
        running: f.getAnimations({ subtree: true }).length,
        ticks: [...f.querySelectorAll(".rc-tick, .rc-flag")].map((el) => getComputedStyle(el).opacity),
        trace: parseFloat(getComputedStyle(f.querySelector(".rc-trace")!).strokeDashoffset),
      }));
      expect(state.running, mode).toBe(0);
      expect(state.ticks, mode).toEqual(Array(8).fill("1"));
      expect(state.trace, mode).toBe(0);
      await context.close();
    }
  });

  test("with motion allowed the check runs once and ends finished", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.waitForTimeout(2600);
    const state = await page.locator("figure.reconcile").evaluate((f) => ({
      running: f.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
      ticks: [...f.querySelectorAll(".rc-tick, .rc-flag")].map((el) => getComputedStyle(el).opacity),
      trace: parseFloat(getComputedStyle(f.querySelector(".rc-trace")!).strokeDashoffset),
    }));
    expect(state).toEqual({ running: 0, ticks: Array(8).fill("1"), trace: 0 });
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

  test("the headline fits on two lines, on a desktop and on a 390px phone", async ({ page }) => {
    await page.setViewportSize(isPhone(page) ? { width: 390, height: 844 } : { width: 1440, height: 900 });
    await page.goto("/");
    const lines = await page.getByText(site.headline).evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBeLessThanOrEqual(2);
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
      return [...list.querySelectorAll("li, li p, li h3")]
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

  test("about and skills names no company I worked at", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("#skills").innerText();
    for (const name of ["AiKnod", "SafeTrack", "Immensa Tech", "Used in"]) expect(text).not.toContain(name);
    await expect(page.locator("#skills")).toContainText(interests);
  });
});

test.describe("selected work", () => {
  test("the next button scrolls and the ends disable their button", async ({ page }) => {
    test.skip(isPhone(page), "the buttons show from 768px");
    await page.setViewportSize({ width: 768, height: 1024 });
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

  test("card previews are screenshots in one frame, with no code", async ({ page }) => {
    await page.goto("/");
    const pictures = page.locator("#projects .carousel .card-picture");
    await expect(pictures).toHaveCount(3);
    const ratios = await pictures.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width / e.getBoundingClientRect().height));
    for (const r of ratios) expect(Math.abs(r - 1.618)).toBeLessThanOrEqual(0.01);
    await expect(pictures.nth(0).locator("img")).toHaveCount(1);
    await expect(pictures.nth(1).locator("img")).toHaveCount(1);
    await expect(pictures.nth(2)).toHaveClass(/card-picture-pending/);
    await expect(pictures.nth(2)).toHaveText("Android screenshots to come");
    await expect(page.locator("#projects .carousel [data-code]")).toHaveCount(0);
  });

  test("at 1440 all three cards are in view with no position controls", async ({ page }) => {
    test.skip(isPhone(page), "desktop width");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#projects .carousel").scrollIntoViewIfNeeded();
    const boxes = await page.locator("#projects .carousel > li").evaluateAll((lis) => lis.map((li) => li.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right })));
    expect(boxes).toHaveLength(3);
    for (const b of boxes) {
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(1440);
    }
    expect(await page.locator("#projects .carousel").evaluate((ul) => ul.scrollWidth - ul.clientWidth)).toBeLessThanOrEqual(2);
    await expect(page.locator(".carousel-position")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Next project" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Previous project" })).toHaveCount(0);
  });

  test("when the row scrolls, it says where you are", async ({ page }) => {
    if (!isPhone(page)) await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const count = page.locator(".carousel-position .carousel-count");
    const dots = page.locator(".carousel-position .carousel-dots button");
    await expect(count).toHaveText("1 of 3");
    await expect(dots).toHaveCount(3);
    for (const [i, p] of featured.entries()) await expect(dots.nth(i)).toHaveAttribute("aria-label", `Show project ${i + 1}: ${p.title}`);
    await expect(dots.nth(0)).toHaveAttribute("aria-current", "true");
    if (isPhone(page)) await dots.nth(1).click();
    else await page.getByRole("button", { name: "Next project" }).click();
    await expect(count).toHaveText("2 of 3");
    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(dots.nth(0)).not.toHaveAttribute("aria-current", /.*/);
    await dots.nth(2).click();
    await expect(count).toHaveText("3 of 3");
    await expect(dots.nth(2)).toHaveAttribute("aria-current", "true");
    if (!isPhone(page)) await expect(page.getByRole("button", { name: "Next project" })).toBeDisabled();
    await dots.nth(0).click();
    await expect(count).toHaveText("1 of 3");
    if (!isPhone(page)) await expect(page.getByRole("button", { name: "Previous project" })).toBeDisabled();
  });

  test("at 1024, where two cards show, Previous and Next reach every position and the count names the cards in view", async ({ page }) => {
    test.skip(isPhone(page), "desktop widths");
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");
    const count = page.locator(".carousel-position .carousel-count");
    const dots = page.locator(".carousel-position .carousel-dots button");
    const prev = page.getByRole("button", { name: "Previous project" });
    const next = page.getByRole("button", { name: "Next project" });
    await expect(count).toHaveText("1–2 of 3");
    await expect(dots.nth(0)).toHaveAttribute("aria-current", "true");
    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(dots.nth(2)).not.toHaveAttribute("aria-current", /.*/);
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(count).toHaveText("2–3 of 3");
    await expect(next).toBeDisabled();
    await expect(dots.nth(2)).toHaveAttribute("aria-current", "true");
    await prev.click();
    await expect(count).toHaveText("1–2 of 3");
    await expect(prev).toBeDisabled();
    await dots.nth(2).click();
    await expect(count).toHaveText("2–3 of 3");
  });

  test("position follows a resize", async ({ page }) => {
    test.skip(isPhone(page), "desktop widths");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator(".carousel-position")).toHaveCount(0);
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator(".carousel-position .carousel-count")).toHaveText("1 of 3");
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(".carousel-position")).toHaveCount(0);
  });

  test("no scroll story is left", async ({ page }) => {
    await page.goto("/");
    for (const sel of ["[data-story]", ".scan-beam", ".scan-cover", ".tile-picture", "[data-scan]"]) await expect(page.locator(sel), sel).toHaveCount(0);
  });
});

test.describe("the scam checker", () => {
  const field = (page: Page) => page.locator("#demo textarea");
  const LEVEL = { low: "Low", medium: "Medium", high: "High" } as const;
  const KIND = { email: "Email", text: "Text message", listing: "Listing", link: "Link" } as const;

  test("the demo is its own section, right after the cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#demo h2")).toHaveText("Try the scam checker");
    await expect(page.locator("#demo")).toContainText("The tool’s own rules, copied from its source and running in your browser. Nothing is sent anywhere.");
    const order = await page.evaluate(() => {
      const carousel = document.querySelector("#projects .carousel")!;
      const demo = document.querySelector("#demo")!;
      const more = document.querySelector("#more-title")!;
      return [carousel.compareDocumentPosition(demo) & Node.DOCUMENT_POSITION_FOLLOWING, demo.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING];
    });
    expect(order.every(Boolean)).toBe(true);
  });

  test("each README sample gives the tool's verdict", async ({ page }) => {
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    for (const s of SAMPLES) {
      const expected = checkScam(s.kind, s.text)!;
      await page.getByRole("group", { name: "Samples from the tool's README" }).getByRole("button", { name: s.label }).click();
      await expect(page.getByRole("radio", { name: KIND[s.kind] })).toBeChecked();
      await expect(field(page)).toHaveValue(s.text);
      await expect(page.locator("[data-try-score]")).toHaveText(String(expected.risk));
      await expect(page.locator("[data-try-level]")).toHaveText(LEVEL[expected.level]);
      for (const issue of expected.issues) await expect(page.locator("[data-try-issues]")).toContainText(issue.msg);
    }
  });

  test("the result names the detector's lines in the tool's source", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#demo").getByRole("link", { name: /js\/detectors\.js, lines 79–126/ })).toHaveAttribute("href", /558fa66\/js\/detectors\.js#L79-L126$/);
    await page.getByRole("button", { name: "Fake listing" }).click();
    await expect(page.locator("#demo").getByRole("link", { name: /js\/detectors\.js, lines 129–177/ })).toHaveAttribute("href", /#L129-L177$/);
  });

  test("clearing gives a neutral state, not a low risk", async ({ page }) => {
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    await page.locator("#demo").getByRole("button", { name: "Clear" }).click();
    await expect(field(page)).toHaveValue("");
    await expect(page.locator("[data-try-empty]")).toHaveText("Paste something above or pick a sample.");
    await expect(page.locator("[data-try-score]")).toHaveCount(0);
    await expect(page.locator("[data-try-level]")).toHaveCount(0);
    await expect(page.locator("#demo")).not.toContainText("Low risk");
    // Spaces alone are nothing to check either.
    await field(page).fill("   ");
    await expect(page.locator("[data-try-empty]")).toBeVisible();
    // A kind not yet used starts empty and neutral.
    await page.getByRole("radio", { name: "Listing" }).check();
    await expect(field(page)).toHaveValue("");
    await expect(page.locator("[data-try-empty]")).toBeVisible();
  });

  test("typing scores live, with the field labelled for its kind", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Paste a text message")).toBeEditable();
    const text = "Congratulations you have won a free gift! Claim now at bit.ly/abc";
    const expected = checkScam("text", text)!;
    await page.getByLabel("Paste a text message").fill(text);
    await expect(page.locator("[data-try-score]")).toHaveText(String(expected.risk));
    await expect(page.locator("[data-try-level]")).toHaveText("High");
    const marked = await page.locator("[data-try-marked] mark").allTextContents();
    expect(marked.length).toBeGreaterThan(0);
    for (const m of marked) expect(text.toLowerCase()).toContain(m.toLowerCase());
    for (const [kind, label] of [["email", "Paste an email"], ["listing", "Paste a listing"], ["link", "Paste a link"]] as const) {
      await page.getByRole("radio", { name: KIND[kind] }).check();
      await expect(page.getByLabel(label)).toBeVisible();
    }
  });

  test("the demo works from the keyboard", async ({ page }) => {
    test.skip(isPhone(page), "keyboard");
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    await page.getByRole("radio", { name: "Text message" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Listing" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Listing" })).toBeFocused();
    let found = false;
    for (let i = 0; i < 8 && !found; i++) {
      await page.keyboard.press("Tab");
      found = (await page.evaluate(() => document.activeElement?.textContent)) === "Fake listing";
    }
    expect(found).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-try-score]")).toHaveText("100");
    await expect(page.getByRole("button", { name: "Fake listing" })).toBeFocused();
  });

  test("only the result is announced, not the text being typed", async ({ page }) => {
    await page.goto("/");
    const live = page.locator("#demo [aria-live]");
    await expect(live).toHaveCount(1);
    await expect(live.locator("[data-try-score]")).toHaveCount(1);
    await expect(live.locator("[data-try-issues]")).toHaveCount(1);
    await expect(live.locator("[data-try-marked]")).toHaveCount(0);
    await expect(live.locator("a, textarea, button")).toHaveCount(0);
    await expect(live).toContainText("94 High risk");
    await expect(live).not.toContainText("Risk score");
  });

  test("without JavaScript it shows the text sample's result, read-only", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-try-score]")).toHaveText("94");
    await expect(page.locator("[data-try-level]")).toHaveText("High");
    await expect(field(page)).toHaveAttribute("readonly", "");
    await expect(page.getByRole("radio", { name: "Text message" })).toBeChecked();
    await context.close();
  });

  test("odd input stays text for every kind, and inside the page", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    const text = `<b>hi</b> 🎉 <img src=x onerror=alert(1)>\n${"x".repeat(200)} urgent`;
    for (const kind of ["email", "text", "listing", "link"] as const) {
      await page.getByRole("radio", { name: KIND[kind] }).check();
      await field(page).fill(text);
      await expect(page.locator("[data-try-score]")).toHaveText(String(checkScam(kind, text)!.risk));
      await expect(page.locator("#demo b, #demo [data-try-marked] img")).toHaveCount(0);
      await expect(page.locator("[data-try-marked]")).toContainText("<b>hi</b>");
    }
    const past = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      return [...document.querySelectorAll("#demo *")].filter((el) => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > vw + 1).map((el) => el.tagName);
    });
    expect(past).toEqual([]);
  });

  test("the field is focusable and shows focus", async ({ page }) => {
    await page.goto("/");
    const f = field(page);
    await expect(f).toBeEditable();
    await f.focus();
    await expect(f).toBeFocused();
    expect(await f.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  });

  test("a long paste is checked to the end, and the cap says so when reached", async ({ page }) => {
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    await page.getByRole("radio", { name: "Email" }).check();
    const long = `${"Hi team, here is the long weekly update. ".repeat(40)}Verify your identity immediately: https://paypal-secure.com/verify-now`;
    expect(long.length).toBeGreaterThan(1500);
    await field(page).fill(long);
    await expect(page.locator("[data-try-score]")).toHaveText(String(checkScam("email", long)!.risk));
    await expect(page.locator("[data-try-cap]")).toHaveCount(0);
    await field(page).fill("x".repeat(10_050));
    expect((await field(page).inputValue()).length).toBe(10_000);
    await expect(page.locator("[data-try-cap]")).toHaveText("Only the first 10,000 characters are checked.");
  });

  test("in this browser too, text with spaces is not a valid link", async ({ page }) => {
    await page.goto("/");
    await expect(field(page)).toBeEditable();
    await page.getByRole("radio", { name: "Link" }).check();
    for (const text of ["not a url at all", "paypal secure.com", "https://hello world/verify"]) {
      await field(page).fill(text);
      await expect(page.locator("[data-try-score]"), text).toHaveText("100");
      await expect(page.locator("[data-try-issues]"), text).toHaveText("This is not a valid URL.");
    }
    // A space after the address, in its path, is still a link the tool can check.
    await field(page).fill("https://www.amazon.com/a b");
    await expect(page.locator("[data-try-issues]")).toContainText("Recognized official domain: amazon.com");
  });
});

test.describe("case studies", () => {
  for (const p of featured) {
    test(`${p.slug}: loads with its title, sections, code link and working images`, async ({ page }) => {
      const res = await page.goto(projectHref(p.slug));
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(p.title);
      await expect(page).toHaveTitle(`${p.title}, case study | ${site.name}`);
      for (const h of ["How it works", "Key decision", "Limitations", "Inspect the code"]) {
        await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
      }
      await expect(page.getByRole("link", { name: "All projects" })).toHaveAttribute("href", "/#projects");
      // The first screenshot leads; the rest follow under the glance.
      await expect(page.locator("main img")).toHaveCount(p.caseStudy.figures.length);
      await expect(page.locator(".cs-lead img")).toHaveCount(Math.min(1, p.caseStudy.figures.length));
      await expect(page.locator('section[aria-labelledby="screens"] img')).toHaveCount(Math.max(0, p.caseStudy.figures.length - 1));
      // Fails if any image is missing or never loads.
      await scrollThrough(page);
    });
  }

  for (const p of featured) {
    test(`${p.slug}: starts with a visual, the problem, what I did and the outcome`, async ({ page }) => {
      await page.goto(projectHref(p.slug));
      const c = p.caseStudy;
      const glance = page.locator("#glance");
      await expect(glance.getByRole("heading", { level: 3 })).toHaveText(["The problem", "What I did", "Outcome"]);
      await expect(glance).toContainText(c.context[0]);
      await expect(glance).toContainText(c.role);
      await expect(glance).toContainText(c.outcome[0]);
      if (c.figures.length) await expect(page.locator(".cs-lead img")).toHaveCount(1);
      else await expect(page.locator(".cs-lead.card-picture-pending")).toHaveText("Android screenshots to come");
      const order = await page.evaluate(() => {
        const sels = ["h1", ".cs-lead", "#glance", "#built", "#decision", "#limitations", "#code"];
        const els = sels.map((s) => document.querySelector(s));
        if (els.some((e) => !e)) return sels.filter((_, i) => !els[i]).map((s) => `missing ${s}`);
        return els.slice(1).map((e, i) => (els[i]!.compareDocumentPosition(e!) & Node.DOCUMENT_POSITION_FOLLOWING ? "ok" : `${sels[i + 1]} before ${sels[i]}`));
      });
      expect(order.every((o) => o === "ok"), order.join(", ")).toBe(true);
      // The repository is reached from "Inspect the code".
      await expect(page.locator('section[aria-labelledby="code"]').getByRole("link", { name: new RegExp(`^${p.repo.label}`) })).toHaveAttribute("href", p.repo.href);
      // No paragraph is printed twice.
      const paras = await page.locator("main p").allTextContents();
      const repeated = paras.filter((t, i) => t.length > 40 && paras.indexOf(t) !== i);
      expect(repeated).toEqual([]);
    });
  }

  test("the lead screenshot is shown whole, with its caption, beside the glance", async ({ page }) => {
    test.skip(isPhone(page), "desktop layout");
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const p of featured.filter((x) => x.caseStudy.figures.length)) {
      await page.goto(projectHref(p.slug));
      const lead = p.caseStudy.figures[0];
      const box = await page.locator(".cs-lead").evaluate((el) => {
        const img = el.querySelector("img")!.getBoundingClientRect();
        // The picture's visible part: clipped by every ancestor that clips.
        let top = img.top, bottom = img.bottom;
        for (let n = el.querySelector("img")!.parentElement; n; n = n.parentElement) {
          const s = getComputedStyle(n);
          if (s.overflowY !== "visible") {
            const r = n.getBoundingClientRect();
            top = Math.max(top, r.top);
            bottom = Math.min(bottom, r.bottom);
          }
        }
        return { shown: (bottom - top) / img.height, glance: document.querySelector("#glance")!.getBoundingClientRect().top };
      });
      expect(box.shown, p.slug).toBeGreaterThan(0.99);
      expect(box.glance, `${p.slug}: the glance starts in the first screen`).toBeLessThan(900);
      const caption = page.locator(".cs-lead figcaption", { hasText: lead.caption });
      await expect(caption).toBeVisible();
      await expect(caption).not.toHaveClass(/sr-only/);
    }
  });

  test("the scam case study lists the checker's regex defect among its limitations", async ({ page }) => {
    await page.goto(projectHref("scam-detection"));
    await expect(page.locator('section[aria-labelledby="limitations"]')).toContainText("the fix belongs in the tool");
  });

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

  test("the nav keeps up across client-side navigation", async ({ page }) => {
    test.skip(isPhone(page), "desktop nav");
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(`^Read the case study\\s*: ${featured[0].title}$`) }).click();
    await expect(page).toHaveURL(new RegExp(projectHref(featured[0].slug)));
    await expect(page.locator("header nav[aria-label=Main] .nav-pill a[aria-current]")).toHaveCount(0);
    await page.locator('header a[aria-label="Luvneet Bamrah, home"]').click();
    await expect(page.locator("#experience")).toHaveCount(1);
    await page.evaluate(() => {
      const el = document.getElementById("experience")!;
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.3, behavior: "instant" });
    });
    await expect(page.locator("header nav[aria-label=Main] .nav-pill a", { hasText: "Experience" })).toHaveAttribute("aria-current", "true");
  });

  test("on a case study the nav marks nothing current", async ({ page }) => {
    await page.goto("/projects/scam-detection/");
    await page.waitForTimeout(400);
    await expect(page.locator("header [aria-current]")).toHaveCount(0);
  });

  test("the footer closes with the name at full width", async ({ page }) => {
    await page.goto("/");
    const name = page.locator("footer .footer-name");
    await expect(name).toHaveText(site.name);
    // The text itself, not its box: one line across at least 80% of the screen.
    const text = await name.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return { width: range.getBoundingClientRect().width / document.documentElement.clientWidth, lines: range.getClientRects().length };
    });
    expect(text.lines).toBe(1);
    if (!isPhone(page)) expect(text.width).toBeGreaterThanOrEqual(0.8);
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
    await expect(page.locator("section.hero [data-clock]")).toHaveText("Fredericton, NB");
    await context.close();
  });

  test("without JavaScript every section is complete", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("figure.reconcile figcaption")).toBeVisible();
    await expect(page.locator("figure.reconcile .rc-tick")).toHaveCount(7);
    await expect(page.locator("#projects .carousel > li")).toHaveCount(3);
    for (const p of featured) await expect(page.locator("#projects .carousel").getByRole("heading", { name: p.title })).toBeVisible();
    await expect(page.locator("#demo [data-try-score]")).toHaveText("94");
    await expect(page.locator("#experience .timeline-entry").first()).toBeVisible();
    await expect(page.locator("#skills")).toContainText(interests);
    await expect(page.locator("#contact").getByRole("link", { name: /Write an email/ })).toBeVisible();
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

test.describe("motion control, and nothing decorative", () => {
  test("the decorative layer is gone", async ({ page, request }) => {
    await page.goto("/");
    for (const sel of ["canvas", ".marquee", ".section-dots", ".tilt", ".grid-backdrop", "[data-field]"]) await expect(page.locator(sel), sel).toHaveCount(0);
    const srcs = await page.evaluate(() => [...document.querySelectorAll<HTMLScriptElement>("script[src]")].map((s) => s.src));
    for (const src of srcs) expect(await (await request.get(src)).text(), src).not.toContain("isWebGLRenderer");
  });

  test("the motion control says what it will do, and the choice holds", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("button.motion-toggle");
    await expect(toggle).toHaveText("Pause motion");
    await expect(toggle).not.toHaveAttribute("aria-pressed", /.*/);
    await toggle.click();
    await expect(toggle).toHaveText("Resume motion");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    await page.reload();
    await expect(page.locator("button.motion-toggle")).toHaveText("Resume motion");
    await page.locator("button.motion-toggle").click();
    await expect(page.locator("button.motion-toggle")).toHaveText("Pause motion");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", /.*/);
  });

  test("the motion choice holds on a case study", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.locator("button.motion-toggle").click();
    await page.goto(projectHref(featured[0].slug));
    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    const frames = await page.locator(".frame").evaluateAll((els) => els.map((el) => ({ p: (el as HTMLElement).style.getPropertyValue("--p"), transform: getComputedStyle(el).transform, opacity: getComputedStyle(el).opacity })));
    expect(frames.length).toBeGreaterThan(0);
    for (const f of frames) expect(f).toEqual({ p: "", transform: "none", opacity: "1" });
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
          .filter((el) => !el.closest(".hero, .sr-only") && el.getBoundingClientRect().width > 0)
          .filter((el) => {
            for (let n: Element | null = el; n; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 1) return true;
            return false;
          })
          .map((el) => el.textContent!.trim().slice(0, 30)),
      );
      expect(faded, id).toEqual([]);
    }
  });

  test("no caption fades on a case study either", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(projectHref("scam-detection"));
    await page.waitForTimeout(300);
    const faded = await page.evaluate(() =>
      [...document.querySelectorAll("main figcaption, main p, main h2, main h3, main li")]
        .filter((el) => !el.closest(".sr-only") && el.getBoundingClientRect().width > 0)
        .filter((el) => {
          for (let n: Element | null = el; n; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 1) return true;
          return false;
        })
        .map((el) => el.textContent!.trim().slice(0, 30)),
    );
    expect(faded).toEqual([]);
  });
});

test.describe("one column", () => {
  test("every block lines up on one column at 1440", async ({ page }) => {
    test.skip(isPhone(page), "desktop width");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const lefts = await page.evaluate(() => {
      const pick = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].map((el) => ({ sel, left: el.getBoundingClientRect().left }));
      return [
        ...pick(`header a[aria-label$=", home"]`),
        ...pick("section.hero h1"),
        ...pick("main h2:not(.sr-only)"),
        ...pick("#projects .carousel > li:first-child"),
        ...pick("#demo h2"),
        ...pick("#more-title"),
        ...pick(".timeline"),
        ...pick("#skills h2"),
        ...pick("footer .footer-meta"),
      ];
    });
    expect(lefts.length).toBeGreaterThanOrEqual(9);
    for (const { sel, left } of lefts) expect(Math.abs(left - 175), `${sel} at ${left}`).toBeLessThanOrEqual(1);
  });

  test("section titles are 57px at most and sections sit 89px apart", async ({ page }) => {
    test.skip(isPhone(page), "desktop width");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const sizes = await page.locator("main h2:not(.sr-only)").evaluateAll((hs) => hs.map((h) => parseFloat(getComputedStyle(h).fontSize)));
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size).toBeLessThanOrEqual(56.62);
    for (const id of ["projects", "experience", "skills"]) {
      expect(await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).paddingTop), id).toBe("89px");
    }
  });
});
