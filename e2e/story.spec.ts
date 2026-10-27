import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { chapters, greeting, site } from "../src/content";

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
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(greeting.label);
    await expect(page.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "#work");
    await expect(page.locator(`a[href="${site.resume}"][download]`).first()).toBeVisible();
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
      // Everything in the bar, the pause button and the resume included, fits on the screen.
      const over = await page.locator(".bar-inner > *").evaluateAll((els) =>
        els.filter((e) => getComputedStyle(e).display !== "none" && e.getBoundingClientRect().right > innerWidth).map((e) => e.className)
      );
      expect(over, `${width}`).toEqual([]);
      await ctx.close();
    }
  });

  test("large screens get a larger page; laptops keep theirs", async ({ browser }) => {
    const at = async (width: number, height: number) => {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
      const r = await page.evaluate(() => ({
        root: parseFloat(getComputedStyle(document.documentElement).fontSize),
        device: document.querySelector("#scam-detection .device")!.getBoundingClientRect().width,
        sideways: document.documentElement.scrollWidth - innerWidth,
      }));
      await ctx.close();
      return r;
    };
    const laptop = await at(1440, 900);
    const big = await at(2560, 1300);
    expect(laptop.root).toBe(16);
    expect(big.root).toBe(20);
    expect(big.device).toBeGreaterThan(laptop.device * 1.2);
    expect(big.sideways).toBe(0);
  });

  test("no sideways scrolling, at any width", async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440, 2560]) {
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
    await expect(page.locator("h1")).toHaveText(`${greeting.lead} ${greeting.phrases[0]}`);
    await expect(page.locator("canvas.field")).toHaveCount(0);
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
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(greeting.label);
  });
});

test.describe("the greeting and the field of dots", () => {
  /** A fingerprint of a canvas's pixels, to tell whether it changed. */
  const print = (page: Page, sel = "canvas.field") =>
    page.locator(sel).evaluate((cv: HTMLCanvasElement) => {
      const d = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height).data;
      let h = 0;
      let ink = 0;
      for (let i = 3; i < d.length; i += 4 * 5) {
        if (d[i]) ink++;
        h = (h * 31 + d[i] * (i % 9973)) % 1000000007;
      }
      return { h, ink };
    });

  test("the greeting turns the name into each phrase, and nothing below it moves or spills", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const now = page.locator(".cycle-now");
    await expect(now).toHaveText(greeting.phrases[0]);
    const lede = page.locator(".opening-copy .lede");
    const at = async () => ({ lede: (await lede.boundingBox())!.y, h1: (await page.locator("h1").boundingBox())!.height });
    const first = await at();
    let scrambled = false;
    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await page.waitForTimeout(150);
      expect(await at()).toEqual(first);
      if (await page.locator(".cycle-now .glyph").count()) {
        scrambled = true;
        // Mid-scramble, the phrase stays inside the headline and on the screen.
        const spill = await page.evaluate(() => {
          const now = document.querySelector(".cycle-now")!;
          const box = document.querySelector(".cycle")!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(now);
          const r = range.getBoundingClientRect();
          return { below: r.bottom > box.bottom + 1, off: r.right > innerWidth || r.left < 0 };
        });
        expect(spill).toEqual({ below: false, off: false });
      }
      reached = (await now.textContent()) === greeting.phrases[1];
    }
    expect(reached, "reached the second phrase").toBe(true);
    expect(scrambled, "passed through random characters").toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(greeting.label);
  });

  test("the dots drift behind every section, faintly", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const field = page.locator("canvas.field");
    await expect(field).toHaveCount(1);
    await expect(field).toHaveCSS("position", "fixed");
    await expect(field).toHaveAttribute("aria-hidden", "true");
    const a = await print(page);
    await page.waitForTimeout(500);
    const b = await print(page);
    expect(a.ink).toBeGreaterThan(30);
    expect(b.h).not.toBe(a.h);
    // Still there, and still moving, far down the page.
    await page.locator("#experience").scrollIntoViewIfNeeded();
    const c = await print(page);
    await page.waitForTimeout(400);
    expect((await print(page)).h).not.toBe(c.h);
    // Behind the content: the page's sections paint over it.
    expect(await page.evaluate(() => Number(getComputedStyle(document.querySelector("main")!).zIndex) > Number(getComputedStyle(document.querySelector("canvas.field")!).zIndex))).toBe(true);
    // Fewer dots on a small screen.
    const count = Number(await field.getAttribute("data-count"));
    expect(count).toBeGreaterThan(isPhone(page) ? 20 : 50);
    if (isPhone(page)) expect(count).toBeLessThan(50);
  });

  test("the dots stay put when the page scrolls", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Paused, the only thing that could change them is the scroll.
    await page.getByRole("button", { name: "Pause motion" }).click();
    await page.mouse.move(5, 300);
    await page.waitForTimeout(200);
    const a = await print(page);
    await page.evaluate(() => scrollTo({ top: 2400, behavior: "instant" }));
    await page.waitForTimeout(300);
    expect((await print(page)).h).toBe(a.h);
  });

  test("the dots reach for the mouse", async ({ page }) => {
    test.skip(isPhone(page), "touch screens have no pointer");
    await page.goto("/", { waitUntil: "networkidle" });
    const field = page.locator("canvas.field");
    await expect(field).toHaveAttribute("data-reach", "0");
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(500 + i * 30, 300 + i * 20);
      await page.waitForTimeout(30);
    }
    await expect.poll(async () => Number(await field.getAttribute("data-reach"))).toBeGreaterThan(0);
  });

  test("Pause motion stops the greeting and the dots, and the page remembers it", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const pause = page.getByRole("button", { name: "Pause motion" });
    await expect(pause).toBeVisible();
    await pause.click();
    const play = page.getByRole("button", { name: "Play motion" });
    await expect(play).toBeVisible();
    await expect(page.locator(".cycle-now .glyph")).toHaveCount(0);
    const text = await page.locator(".cycle-now").textContent();
    const a = await print(page);
    await page.waitForTimeout(3800);
    expect(await page.locator(".cycle-now").textContent()).toBe(text);
    expect((await print(page)).h).toBe(a.h);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
    const b = await print(page);
    await page.waitForTimeout(500);
    expect((await print(page)).h).toBe(b.h);
    await page.getByRole("button", { name: "Play motion" }).click();
    await page.waitForTimeout(500);
    expect((await print(page)).h).not.toBe(b.h);
  });

  test("with reduced motion, the dots are drawn still and the greeting stays on the name", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("canvas.field")).toHaveCount(1);
    const a = await print(page);
    expect(a.ink).toBeGreaterThan(30);
    await page.waitForTimeout(3800);
    expect((await print(page)).h).toBe(a.h);
    await expect(page.locator(".cycle-now")).toHaveText(greeting.phrases[0]);
    await expect(page.getByRole("button", { name: /motion/ })).toBeHidden();
    await ctx.close();
  });
});

test.describe("scroll animations", () => {
  /** Scroll so the element's top sits at a fraction of the screen's height (0 = top edge, 1 = bottom). */
  const placeTop = async (page: Page, sel: string, frac: number) => {
    await page.evaluate(
      ([sel, frac]) => {
        const el = document.querySelector(sel as string)!;
        scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * (frac as number), behavior: "instant" });
      },
      [sel, frac] as const
    );
    await page.waitForTimeout(250);
  };
  const ready = async (page: Page) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#vehicle-counter")).toHaveClass(/has-sequence/);
  };
  /** Vertical offset of each element's transform, in px. */
  const lifts = (page: Page, sel: string) => page.locator(sel).evaluateAll((els) => els.map((e) => new DOMMatrix(getComputedStyle(e).transform).m42));
  const colours = (page: Page, sel: string) => page.locator(sel).evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
  const LIT = "rgb(245, 245, 247)";
  const DIM = "rgb(134, 134, 139)";

  test("headings rise into place word by word as they scroll in, and still read whole", async ({ page }) => {
    await ready(page);
    const c = chapters[1];
    const h = `#${c.id} .chapter-title`;
    await placeTop(page, h, 0.99);
    const low = await lifts(page, `${h} .rise-in`);
    expect(low.length).toBe(c.headline.split(" ").length);
    for (const y of low) expect(y).toBeGreaterThan(20);
    await placeTop(page, h, 0.35);
    for (const y of await lifts(page, `${h} .rise-in`)) expect(Math.abs(y)).toBeLessThan(0.5);
    await expect(page.getByRole("heading", { name: c.headline })).toBeVisible();
  });

  test("the greeting zooms back and fades as you scroll into the work", async ({ page }) => {
    await ready(page);
    const look = () => page.locator(".opening-copy").evaluate((e) => ({ scale: new DOMMatrix(getComputedStyle(e).transform).a, opacity: Number(getComputedStyle(e).opacity) }));
    expect(await look()).toEqual({ scale: 1, opacity: 1 });
    await page.evaluate(() => scrollTo({ top: document.querySelector(".opening")!.clientHeight * 0.5, behavior: "instant" }));
    await page.waitForTimeout(250);
    const away = await look();
    expect(away.scale).toBeLessThan(0.97);
    expect(away.opacity).toBeLessThan(1);
  });

  test("chapter intros light up word by word as you read down", async ({ page }) => {
    await ready(page);
    const p = "#scam-detection .chapter-lede";
    await placeTop(page, p, 0.95);
    let c = await colours(page, `${p} .read`);
    expect(c.length).toBeGreaterThan(10);
    expect(c[0]).toBe(DIM);
    expect(c.at(-1)).toBe(DIM);
    await placeTop(page, p, 0.66);
    c = await colours(page, `${p} .read`);
    expect(c[0]).toBe(LIT);
    expect(c.at(-1)).toBe(DIM);
    await placeTop(page, p, 0.3);
    c = await colours(page, `${p} .read`);
    expect(c.every((x) => x === LIT)).toBe(true);
  });

  test("the experience line draws down, each role arrives, and the figures count up", async ({ page }) => {
    await ready(page);
    const list = "#experience .entries";
    const drawn = () => page.locator(list).evaluate((e) => Number(getComputedStyle(e).getPropertyValue("--drawn")));
    const figures = () => page.locator(`${list} .figure`).evaluateAll((els) => els.map((e) => [e.textContent, (e as HTMLElement).dataset.to + "%"]));
    await placeTop(page, list, 0.97);
    expect(await drawn()).toBeLessThan(0.05);
    const before = await figures();
    expect(before.length).toBeGreaterThan(0);
    for (const [shown] of before) expect(shown).toBe("0%");
    expect(Number(await page.locator(`${list} > .entry`).first().evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(0.5);
    await page.evaluate((list) => {
      const el = document.querySelector(list)!;
      scrollTo({ top: el.getBoundingClientRect().bottom + scrollY - innerHeight * 0.4, behavior: "instant" });
    }, list);
    await page.waitForTimeout(250);
    expect(await drawn()).toBeGreaterThan(0.99);
    for (const [shown, final] of await figures()) expect(shown).toBe(final);
    for (const o of await page.locator(`${list} > .entry`).evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity))) expect(o).toBe("1");
  });

  test("cards slide up into place as they enter", async ({ page }) => {
    await ready(page);
    const first = "#more .more-list > li";
    await placeTop(page, first, 1.02);
    expect(Number(await page.locator(first).first().evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(0.2);
    await placeTop(page, first, 0.45);
    const card = await page.locator(first).first().evaluate((e) => ({ o: getComputedStyle(e).opacity, y: new DOMMatrix(getComputedStyle(e).transform).m42 }));
    expect(card.o).toBe("1");
    expect(Math.abs(card.y)).toBeLessThan(0.5);
  });

  test("with reduced motion, everything is simply in place", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".rise-in, .read")).toHaveCount(0);
    for (const [shown, to] of await page.locator(".figure").evaluateAll((els) => els.map((e) => [e.textContent, (e as HTMLElement).dataset.to + "%"]))) expect(shown).toBe(to);
    await page.locator("#more").scrollIntoViewIfNeeded();
    expect(await page.locator("#more .more-list > li").first().evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    await ctx.close();
  });
});
