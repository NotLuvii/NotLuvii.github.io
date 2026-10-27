import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { chapters, site } from "../src/content";

const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 700;

async function axe(page: Page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const r = await (window as unknown as { axe: { run: (d: Document, o: object) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe.run(document, {
      runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"],
    });
    return r.violations.map((v) => `${v.id} x${v.nodes.length}`);
  });
}

/** Scroll to a fraction of the way through a chapter's stage track. */
async function into(page: Page, id: string, f: number) {
  // The tall tracks exist only once the motion code has started; scrolling before then lands elsewhere.
  await expect(page.locator(`#${id}`)).toHaveClass(/has-sequence/);
  await page.evaluate(
    ([id, f]) => {
      const track = document.querySelector(`#${id} .stage-track`)!;
      const top = track.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (track.getBoundingClientRect().height - innerHeight) * (f as number), behavior: "instant" });
    },
    [id, f] as const
  );
  await page.waitForTimeout(350);
}

const visibleMoment = (page: Page, id: string) =>
  page.locator(`#${id} .moment`).evaluateAll((ms) => ms.findIndex((m) => getComputedStyle(m).opacity === "1"));

test.describe("the story", () => {
  test("runs without script errors, top to bottom", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text()));
    page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${new URL(r.url()).pathname}`));
    await page.goto("/", { waitUntil: "networkidle" });
    for (const c of chapters) for (const f of [0, 0.5, 1]) await into(page, c.id, f);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test("opens on the line, with the way in and the resume", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(site.title);
    await expect(page.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "#work");
    await expect(page.locator(`a[href="${site.resume}"][download]`).first()).toBeVisible();
  });

  test("the opening's words keep clear of the copy and of each other, on every screen and in a wide font", async ({ browser }) => {
    const screens = [
      { viewport: { width: 1440, height: 900 } },
      { viewport: { width: 1280, height: 720 } },
      { viewport: { width: 1024, height: 700 } },
      { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
      { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
      { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    ];
    // The copy's size depends on the visitor's fonts; DejaVu Sans is far wider than San Francisco or Inter.
    for (const wide of [false, true])
      for (const opts of screens) {
        const ctx = await browser.newContext(opts);
        const page = await ctx.newPage();
        await page.goto("/", { waitUntil: "networkidle" });
        if (wide) await page.addStyleTag({ content: `.opening-copy, .opening-copy * { font-family: "DejaVu Sans", Verdana, sans-serif !important; }` });
        const problems = await page.evaluate(() => {
          const box = (e: Element) => e.getBoundingClientRect();
          const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          const words = [...document.querySelectorAll<HTMLElement>(".opening .word")].filter((w) => getComputedStyle(w).display !== "none" && box(w).width > 0);
          // The copy as drawn: each line of text, and each button and bar as a whole.
          const copy: [string, DOMRect][] = [];
          for (const e of document.querySelectorAll(".opening-copy > *, .scroll-hint")) {
            const range = document.createRange();
            range.selectNodeContents(e);
            for (const r of range.getClientRects()) if (r.width && r.height) copy.push([e.className || e.tagName, r]);
          }
          for (const e of document.querySelectorAll(".opening-copy .pill, .bar")) copy.push([e.className, box(e)]);
          const out: string[] = [];
          words.forEach((w, i) => {
            const r = box(w);
            if (r.left < 0 || r.right > innerWidth) out.push(`${w.dataset.w} runs off the screen`);
            for (const [name, c] of copy) if (hit(r, c)) out.push(`${w.dataset.w} on ${name}`);
            for (const v of words.slice(i + 1)) if (hit(r, box(v))) out.push(`${w.dataset.w} on ${v.dataset.w}`);
          });
          return { count: words.length, out };
        });
        const label = `${opts.viewport.width}x${opts.viewport.height}${wide ? " wide font" : ""}`;
        expect(problems.out, label).toEqual([]);
        expect(problems.count, label).toBeGreaterThanOrEqual(5);
        await ctx.close();
      }
  });

  test("the chapters come in order, and each scrubs its recording through three moments", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/motion/);
    for (const c of chapters) {
      await expect(page.locator(`#${c.id}`)).toHaveClass(/has-sequence/);
      const seen: number[] = [];
      for (const f of [0.25, 0.6, 0.95]) {
        await into(page, c.id, f);
        seen.push(await visibleMoment(page, c.id));
      }
      expect(seen, c.id).toEqual([0, 1, 2]);
      // The canvas has a frame on it.
      const painted = await page.locator(`#${c.id} canvas.sequence`).evaluate((cv: HTMLCanvasElement) => {
        const d = cv.getContext("2d")!.getImageData(cv.width / 2, cv.height / 2, 1, 1).data;
        return d[3] > 0;
      });
      expect(painted, c.id).toBe(true);
    }
  });

  test("the counter's totals are the run's, frame by frame", async ({ page }) => {
    const m = JSON.parse(readFileSync("public/sequences/traffic/manifest.json", "utf8"));
    await page.goto("/");
    await into(page, "vehicle-counter", 1);
    const last = m.desktop.counts.at(-1);
    await expect(page.locator("[data-car]")).toHaveText(String(last.car));
    await expect(page.locator("[data-bus]")).toHaveText(String(last.bus));
    await expect(page.locator("[data-truck]")).toHaveText(String(last.truck));
    await into(page, "vehicle-counter", 0.2);
    await expect.poll(async () => Number(await page.locator("[data-car]").textContent())).toBeLessThan(last.car);
  });

  test("a chapter shows where the visitor is, even when the page opens part way through it", async ({ page }) => {
    const m = JSON.parse(readFileSync("public/sequences/traffic/manifest.json", "utf8"));
    await page.goto("/", { waitUntil: "networkidle" });
    await into(page, "vehicle-counter", 1);
    await page.reload({ waitUntil: "networkidle" });
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    // No scrolling after the reload: the stage must already be in place.
    await expect(page.locator("[data-car]")).toHaveText(String(m.desktop.counts.at(-1).car));
    await expect.poll(() => visibleMoment(page, "vehicle-counter")).toBe(2);
  });

  test("a link to a section opens at that section, after the chapters take their full length", async ({ context }) => {
    for (const id of ["resume-analyzer", "vehicle-counter", "contact"]) {
      // A fresh load each time: arriving from a link, not moving within the page.
      const page = await context.newPage();
      await page.goto(`/#${id}`, { waitUntil: "networkidle" });
      await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
      await page.waitForTimeout(300);
      const { top, atEnd } = await page.locator(`#${id}`).evaluate((e) => ({
        top: e.getBoundingClientRect().top / innerHeight,
        atEnd: scrollY + innerHeight >= document.documentElement.scrollHeight - 2,
      }));
      // At the top of the screen, or as near as the page allows when the section is the last one.
      expect(top, id).toBeGreaterThanOrEqual(-0.01);
      expect(top < 0.2 || atEnd, `${id} at ${top.toFixed(2)} screens`).toBe(true);
      // Links within the page still glide once it has settled.
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("smooth");
      await page.close();
    }
  });

  test("phones get the phone recording; desktops the desktop one", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (r) => r.url().includes("/sequences/scam/") && requested.push(r.url()));
    await page.goto("/");
    await into(page, "scam-detection", 0.5);
    await page.waitForTimeout(500);
    const form = isPhone(page) ? "phone" : "desktop";
    const other = isPhone(page) ? "desktop" : "phone";
    expect(requested.some((u) => u.includes(`/scam/${form}/`))).toBe(true);
    expect(requested.some((u) => u.includes(`/scam/${other}/`))).toBe(false);
  });

  test("footage loads only as its chapter approaches", async ({ page }) => {
    const frames: string[] = [];
    page.on("request", (r) => /\/sequences\/\w+\/(desktop|phone)\//.test(r.url()) && frames.push(r.url()));
    await page.goto("/");
    await page.waitForTimeout(800);
    expect(frames.filter((u) => u.includes("/resume/"))).toHaveLength(0);
  });

  test("the first screen is light", async ({ page }) => {
    let bytes = 0;
    page.on("response", async (r) => {
      if (r.url().endsWith(".pdf")) return;
      const len = Number(r.headers()["content-length"] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
      bytes += len;
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(bytes).toBeLessThan(900_000);
  });

  test("the thread turns the caught phrases into the matched skills", async ({ page }) => {
    await page.goto("/");
    const at = async (f: number) => {
      await page.evaluate((f) => {
        const t = document.getElementById("thread-1")!;
        scrollTo({ top: t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * f, behavior: "instant" });
      }, f);
      await page.waitForTimeout(300);
      return page.locator("#thread-1 .thread-chip .to").first().evaluate((e) => getComputedStyle(e).opacity);
    };
    expect(await at(0.1)).toBe("0");
    expect(await at(0.95)).toBe("1");
  });

  test("nothing overlaps the next chapter's heading when it arrives", async ({ page }) => {
    await page.goto("/");
    await page.locator("#resume-analyzer .chapter-title").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const over = await page.evaluate(() => {
      const h = document.querySelector("#resume-analyzer .chapter-title")!.getBoundingClientRect();
      return [...document.querySelectorAll(".thread-stage, .stage")].some((s) => {
        const r = s.getBoundingClientRect();
        const style = getComputedStyle(s);
        return style.position === "sticky" && r.top < h.bottom && r.bottom > h.top && s.closest(".thread, .chapter") !== document.getElementById("resume-analyzer") && r.top === 0 && r.bottom > h.top;
      });
    });
    expect(over).toBe(false);
  });

  test("the bar keeps the name on one line, down to the narrowest phone", async ({ browser }) => {
    for (const width of [320, 360, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: 640 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      await page.goto("/");
      const lines = await page.locator(".wordmark").evaluate((e) => {
        const range = document.createRange();
        range.selectNodeContents(e);
        return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
      });
      expect(lines, `${width}`).toBe(1);
      await expect(page.getByRole("link", { name: "Resume" }).first()).toBeVisible();
      await ctx.close();
    }
  });

  test("no sideways scrolling, at any width", async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 860 });
      await page.goto("/");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}`).toBe(0);
    }
  });

  test("on a small phone, the thread's spread chips stay inside the screen", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    for (const id of ["thread-1", "thread-2"]) {
      await page.evaluate((id) => {
        const t = document.getElementById(id)!;
        scrollTo({ top: t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * 0.05, behavior: "instant" });
      }, id);
      await page.waitForTimeout(300);
      const w = await page.evaluate(() => ({ inner: innerWidth, scroll: document.documentElement.scrollWidth }));
      expect(w, id).toEqual({ inner: 320, scroll: 320 });
      // Every chip is whole on the screen, not cut off at an edge.
      const off = await page.locator(`#${id} .thread-chip`).evaluateAll((cs) =>
        cs.map((c) => c.getBoundingClientRect()).filter((r) => r.left < 0 || r.right > innerWidth).length
      );
      expect(off, id).toBe(0);
    }
    await ctx.close();
  });

  test("on a laptop, the thread's spread chips are whole", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await into(page, "scam-detection", 0);
    await page.evaluate(() => {
      const t = document.getElementById("thread-1")!;
      scrollTo({ top: t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * 0.05, behavior: "instant" });
    });
    await page.waitForTimeout(300);
    // Nothing clips them: each chip's box is entirely visible inside the thread's stage.
    const clipped = await page.locator("#thread-1 .thread-chip").evaluateAll((cs) => {
      const stage = cs[0].closest(".thread-stage")!.getBoundingClientRect();
      const clips = getComputedStyle(cs[0].closest(".thread-stage")!).overflowX !== "visible";
      return cs.filter((c) => {
        const r = c.getBoundingClientRect();
        return r.left < 0 || r.right > innerWidth || (clips && (r.left < stage.left || r.right > stage.right));
      }).length;
    });
    expect(clipped).toBe(0);
    await ctx.close();
  });

  test("passes axe", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await axe(page)).toEqual([]);
    await into(page, "scam-detection", 0.6);
    expect(await axe(page)).toEqual([]);
  });
});

test.describe("without motion", () => {
  test("reduced motion: no stage holds; every moment is a still with its caption", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("html")).not.toHaveClass(/motion/);
    for (const c of chapters) {
      const stills = page.locator(`#${c.id} .still`);
      await expect(stills).toHaveCount(3);
      for (const s of await stills.all()) {
        await s.scrollIntoViewIfNeeded();
        await expect(s).toBeVisible();
        await expect.poll(() => s.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      }
    }
    expect(await page.evaluate(() => [...document.querySelectorAll(".stage, .thread-stage")].some((s) => getComputedStyle(s).position === "sticky"))).toBe(false);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
    expect(await axe(page)).toEqual([]);
    await ctx.close();
  });

  test("without JavaScript the whole story reads", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(site.title);
    for (const c of chapters) {
      await expect(page.locator(`#${c.id} .chapter-title`)).toHaveText(c.headline);
      for (const m of c.moments) await expect(page.locator(`#${c.id}`)).toContainText(m.text);
    }
    await expect(page.locator("#contact")).toContainText(site.email);
    await ctx.close();
  });
});

test.describe("the checker", () => {
  test("a sample scores as the tool does, and every control answers by keyboard", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("[data-checker]");
    await card.scrollIntoViewIfNeeded();
    await card.getByRole("button", { name: "try a sample" }).click();
    await expect(card.locator("[data-try-score]")).toHaveText("100");
    await expect(card).toContainText("High risk");
    await card.getByRole("tab", { name: "Email" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(card.getByRole("tab", { name: "Text" })).toBeFocused();
    await expect(card.getByRole("tab", { name: "Text" })).toHaveAttribute("aria-selected", "true");
    await card.locator("textarea").fill("");
    await expect(card).toContainText("Paste something");
  });
});

test.describe("contact", () => {
  test("copies the email address", async ({ browser }) => {
    const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
    const page = await ctx.newPage();
    await page.goto("/");
    const copy = page.getByRole("button", { name: "Copy email address" });
    await copy.scrollIntoViewIfNeeded();
    await copy.click();
    await expect(page.locator("[data-copy-status]")).toHaveText("Email address copied to your clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(site.email);
    await ctx.close();
  });

  test("keyboard: the skip link, then the navigation, all with a visible focus ring", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to the work" })).toBeFocused();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const ring = await page.evaluate(() => {
        const s = getComputedStyle(document.activeElement!);
        return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2;
      });
      expect(ring).toBe(true);
    }
  });
});

test.describe("the old site's addresses", () => {
  // GitHub Pages answers any missing address with 404.html; this serves it the same way.
  const notFound = () => readFileSync("dist/404.html", "utf8");
  for (const [from, to] of [
    ["/projects/scam-detection/", "#scam-detection"],
    ["/projects/resume-analyzer/", "#resume-analyzer"],
    ["/projects/immensa-inquiry-app/", "#more"],
  ]) {
    test(`${from} goes to where that project is now`, async ({ page }) => {
      await page.route(`**${from}`, (r) => r.fulfill({ status: 404, contentType: "text/html", body: notFound() }));
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`:4174/${to}$`));
      await expect(page.locator(to)).toBeAttached();
    });
  }

  test("any other missing address says so, and leads home", async ({ page }) => {
    await page.route("**/no-such-page", (r) => r.fulfill({ status: 404, contentType: "text/html", body: notFound() }));
    await page.goto("/no-such-page");
    await expect(page.locator("h1")).toHaveText("There’s nothing at this address.");
    const home = page.getByRole("link", { name: "Go to the home page" });
    await expect(home).toHaveAttribute("href", "/");
    expect(await axe(page)).toEqual([]);
    await home.click();
    await expect(page.locator("h1")).toHaveText(site.title);
  });
});

test.describe("the faint background", () => {
  /** How many sampled pixels of a canvas have any ink, and whether a given page point has any. */
  const ink = (page: Page, selector: string, at?: { x: number; y: number }) =>
    page.locator(selector).evaluate((cv: HTMLCanvasElement, at) => {
      const ctx = cv.getContext("2d")!;
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let count = 0;
      for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 0) count++;
      let here: number | null = null;
      if (at) {
        const r = cv.getBoundingClientRect();
        const x = Math.round(((at.x - r.left) * cv.width) / r.width);
        const y = Math.round(((at.y - r.top) * cv.height) / r.height);
        here = ctx.getImageData(x, y, 1, 1).data[3];
      }
      return { count, here };
    }, at);

  const throughThread = async (page: Page, id: string, f: number) => {
    await expect(page.locator(`#${id}`)).toBeAttached();
    await page.evaluate(
      ([id, f]) => {
        const t = document.getElementById(id as string)!;
        scrollTo({ top: t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * (f as number), behavior: "instant" });
      },
      [id, f] as const
    );
    await page.waitForTimeout(400);
  };

  test("the hand-offs carry the tools' own inputs, faintly, and keep clear of the sentence", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
    for (const [id, input] of [["thread-1", "email posting"], ["thread-2", "posting log"]]) {
      await throughThread(page, id, 0.85);
      const canvas = page.locator(`#${id} canvas.source`);
      await expect(canvas).toHaveAttribute("data-input", input);
      const line = await page.locator(`#${id} .thread-line`).boundingBox();
      const centre = { x: line!.x + line!.width / 2, y: line!.y + line!.height / 2 };
      await expect.poll(async () => (await ink(page, `#${id} canvas.source`)).count, id).toBeGreaterThan(200);
      expect((await ink(page, `#${id} canvas.source`, centre)).here, `${id}: behind the sentence`).toBe(0);
      if (!isPhone(page)) {
        // Even with the pointer on the sentence, the clearer layer under the lens stays out from behind it.
        await page.mouse.move(centre.x, centre.y);
        await page.waitForTimeout(150);
        await expect(page.locator(`#${id} .source-lens`)).toHaveCSS("visibility", "visible");
        expect((await ink(page, `#${id} .source-lens canvas`, centre)).here, `${id}: under the pointer`).toBe(0);
        // Just beside the sentence the lens does show the clearer text.
        const beside = { x: centre.x, y: line!.y - 90 };
        await page.mouse.move(beside.x, beside.y);
        await page.waitForTimeout(150);
        await expect.poll(async () => (await ink(page, `#${id} .source-lens canvas`)).count, `${id}: the lens`).toBeGreaterThan(200);
      }
    }
  });

  test("the source text reaches both edges of the screen, with nothing trimming it", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
    for (const id of ["thread-1", "scam-detection", "thread-2", "vehicle-counter"]) {
      const reach = await page.locator(`#${id} canvas.source`).evaluate((cv) => {
        const r = cv.getBoundingClientRect();
        const clipped: string[] = [];
        for (let n = cv.parentElement; n && n.tagName !== "MAIN"; n = n.parentElement)
          if (getComputedStyle(n).overflowX !== "visible") clipped.push(n.className || n.tagName);
        return { left: r.left, right: r.right, width: document.documentElement.clientWidth, clipped };
      });
      expect(reach.clipped, id).toEqual([]);
      expect(reach.left, id).toBeLessThanOrEqual(0);
      expect(reach.right, id).toBeGreaterThanOrEqual(reach.width);
    }
  });

  test("each chapter's stage shows its tool's input until the recording rises", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    for (const [id, input] of [["scam-detection", "email"], ["resume-analyzer", "posting"], ["vehicle-counter", "log"]]) {
      const canvas = page.locator(`#${id} canvas.source`);
      await into(page, id, 0);
      await expect(canvas).toHaveAttribute("data-input", input);
      await expect.poll(async () => Number(await canvas.evaluate((c) => getComputedStyle(c).opacity)), id).toBeGreaterThan(0.8);
      await expect.poll(async () => (await ink(page, `#${id} canvas.source`)).count, id).toBeGreaterThan(200);
      await into(page, id, 0.5);
      expect(Number(await canvas.evaluate((c) => getComputedStyle(c).opacity)), id).toBeLessThan(0.01);
    }
  });

  test("the reading sections stay plain", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
    await expect(page.locator(".chapter-head canvas, #try canvas, #more canvas, #experience canvas, #about canvas, #contact canvas")).toHaveCount(0);
  });

  test("the pointer leaves a faint track, which fades away when the pointer rests", async ({ page }) => {
    test.skip(isPhone(page), "touch screens have no pointer to track");
    await page.goto("/", { waitUntil: "networkidle" });
    await throughThread(page, "thread-1", 0.2);
    const trail = page.locator("canvas.trail");
    await expect(trail).toHaveCount(1);
    for (let i = 0; i <= 40; i++) {
      await page.mouse.move(300 + i * 18, 640 - Math.sin(i / 6) * 120);
      await page.waitForTimeout(16);
    }
    expect((await ink(page, "canvas.trail")).count).toBeGreaterThan(20);
    await expect(trail).toHaveAttribute("data-active", "true");
    await page.waitForTimeout(2600);
    await expect(trail).toHaveAttribute("data-active", "false");
    expect((await ink(page, "canvas.trail")).count).toBe(0);
  });

  test("touch screens get no track", async ({ page }) => {
    test.skip(!isPhone(page), "the phone project");
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
    await expect(page.locator("canvas.trail")).toHaveCount(0);
  });

  test("with reduced motion there is neither", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.mouse.move(400, 400);
    await page.mouse.move(600, 500);
    await expect(page.locator("canvas.trail, canvas.source")).toHaveCount(0);
    await ctx.close();
  });
});
