import { expect, test } from "@playwright/test";

// Tests in one worker run one at a time, so a module-level list is safe.
let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
});

test.afterEach(() => {
  expect(errors, "errors in the browser console").toEqual([]);
});

test("stands alone: no link to another portfolio, and outside links only to profiles", async ({ page }) => {
  const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  const outside = hrefs.filter((h) => /^https?:/.test(h));
  expect(outside.length).toBeGreaterThan(0);
  for (const h of outside) expect(h).toMatch(/^https:\/\/(github\.com|www\.linkedin\.com)\//);
  await expect(page.getByText(/main portfolio|wind tunnel/i)).toHaveCount(0);
});

test("shows all eight projects, closest to quality work first", async ({ page }) => {
  const titles = page.locator("#projects article h3");
  await expect(titles).toHaveCount(8);
  await expect(titles.first()).toHaveText("Monitoring and reporting dashboards");
});

test("the highlights move with the arrows and the keyboard", async ({ page }) => {
  const prev = page.getByRole("button", { name: "Previous highlight" });
  const next = page.getByRole("button", { name: "Next highlight" });
  await page.locator("#highlights").scrollIntoViewIfNeeded();
  await expect(prev).toBeDisabled();
  await next.click();
  await expect(page.getByRole("button", { name: /Show highlight 2:/ })).toHaveAttribute("aria-current", "true");
  await expect(prev).toBeEnabled();
  await page.getByRole("region", { name: "Highlights", exact: true }).press("ArrowLeft");
  await expect(page.getByRole("button", { name: /Show highlight 1:/ })).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: /Show highlight 6:/ }).click();
  await expect(next).toBeDisabled();
});

test("the numbers land on the figures from the résumé", async ({ page }) => {
  const figures = page.getByRole("heading", { name: "Results you can measure." });
  await figures.scrollIntoViewIfNeeded();
  for (const value of ["75%", "50%", "40%"]) {
    await expect(page.locator("section", { has: figures }).getByText(value, { exact: true }).first()).toBeVisible();
  }
  await expect(page.locator("section", { has: figures }).locator("[aria-hidden]").filter({ hasText: /^75%$/ })).toHaveCount(1, { timeout: 4000 });
});

test("the résumé link serves the PDF", async ({ page, request }) => {
  const href = await page.getByRole("link", { name: "Résumé" }).first().getAttribute("href");
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("never scrolls sideways", async ({ page }) => {
  const [scrollWidth, innerWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("shows everything at once, without waiting for scroll", async ({ page }) => {
    const last = page.locator("[data-reveal]").last();
    expect(await last.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test("shows the email address and copies it", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only here");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const contact = page.locator("#contact");
  await expect(contact.getByText("luvneetbamrah@gmail.com", { exact: true })).toBeVisible();
  await contact.getByRole("button", { name: "Copy email address" }).click();
  await expect(contact.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("luvneetbamrah@gmail.com");
});
