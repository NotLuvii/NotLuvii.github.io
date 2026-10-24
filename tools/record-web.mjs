/**
 * Records a scripted session of one of the redesigned web apps, frame by frame, for the story's
 * scroll-scrubbed sequences. The app must be running from its redesign-2026 branch:
 *   scam:   Fraud-Detection-Tool, `npm start`  (http://localhost:3035)
 *   resume: Resume-Analyze, `python app.py`    (http://localhost:5000)
 *
 *   node tools/record-web.mjs <scam|resume> <rawDir> [--resume path/to/resume.pdf]
 *
 * Writes PNG frames to <rawDir>/<form>/NNN.png and <rawDir>/session.json: the frame ranges of the
 * three moments, the view (focus rectangle) for each, and what the app actually showed (score, level,
 * skills), so the story's captions can be checked against the recording.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const [, , app, rawDir] = process.argv;
const resumeArg = process.argv.indexOf("--resume");
const RESUME = resumeArg > 0 ? process.argv[resumeArg + 1] : undefined;
if (!["scam", "resume"].includes(app) || !rawDir) throw new Error("usage: record-web.mjs <scam|resume> <rawDir> [--resume file]");

const EMAIL =
  "Dear Customer, Your account has been suspended due to unusual activity.\nVerify your identity immediately: https://paypal-secure.com/verify-now\nClick here to restore access. Do not ignore this message.";
const POSTING =
  "Software Developer. We are looking for a developer with experience in Python, JavaScript, React and SQL. Experience with Docker and Kubernetes is a plus. Strong communication and teamwork skills required. You will build REST APIs and work with AWS.";

const FORMS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
const session = { app, recordedAt: new Date().toISOString(), forms: {} };

for (const [formName, opts] of Object.entries(FORMS)) {
  const dir = `${rawDir}/${formName}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ ...opts, colorScheme: "dark", reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  let n = 0;
  const shot = async () => {
    await page.screenshot({ path: `${dir}/${String(++n).padStart(3, "0")}.png` });
  };
  const hold = async (k) => {
    for (let i = 0; i < k; i++) await shot();
  };
  const frames = async (k, ms) => {
    for (let i = 0; i < k; i++) {
      await page.waitForTimeout(ms);
      await shot();
    }
  };
  const rect = (sel) =>
    page.evaluate((s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map(Math.round);
    }, sel);
  // Type by setting the field's text in steps, the way a paste-and-edit would appear; the app receives
  // a real input event each time.
  const type = async (sel, text, steps) => {
    for (let i = 1; i <= steps; i++) {
      const part = text.slice(0, Math.round((text.length * i) / steps));
      await page.evaluate(
        ([s, v]) => {
          const el = document.querySelector(s);
          el.value = v;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        [sel, part]
      );
      await shot();
    }
  };
  const scrollToWorkspace = async () => {
    await page.evaluate(() => {
      const ws = document.querySelector(".workspace");
      window.scrollTo(0, ws.getBoundingClientRect().top + window.scrollY - 20);
    });
    await page.waitForTimeout(300);
  };

  if (app === "scam") {
    await page.goto("http://localhost:3035/", { waitUntil: "networkidle" });
    if (formName === "desktop") await scrollToWorkspace();
    else await page.evaluate(() => window.scrollTo(0, document.querySelector(".compose").getBoundingClientRect().top + scrollY - 12));
    await page.waitForTimeout(200);
    await hold(4);
    await type("#input-email", EMAIL, 28);
    await hold(4);
    const m1 = [0, n];
    await page.click('[data-detect="email"]');
    // The verdict settles in (and on a phone, the page brings it into view).
    await frames(formName === "phone" ? 20 : 14, 45);
    await hold(10);
    const m2 = [m1[1], n];
    const result = await page.evaluate(() => ({
      score: document.getElementById("risk-value").textContent,
      level: document.getElementById("risk-level").textContent,
      issues: [...document.querySelectorAll("#issues-list li")].map((l) => l.textContent),
      marks: [...document.querySelectorAll("#panel-email .mirror mark")].map((m) => m.textContent),
    }));
    let views;
    if (formName === "phone") {
      // Read on through the reasons, as a visitor would.
      for (let i = 0; i < 18; i++) {
        await page.mouse.wheel(0, 22);
        await page.waitForTimeout(30);
        await shot();
      }
      await hold(8);
      views = null;
    } else {
      await hold(14);
      const card = await rect(".result");
      const verdict = await rect(".score");
      views = { result: card, verdict, compose: await rect(".compose") };
    }
    const m3 = [m2[1], n];
    session.forms[formName] = { frames: n, moments: [m1, m2, m3], views, result, viewport: opts.viewport, scale: opts.deviceScaleFactor };
  } else {
    if (!RESUME) throw new Error("--resume is required for the resume recording");
    await page.goto("http://localhost:5000/", { waitUntil: "networkidle" });
    if (formName === "desktop") await scrollToWorkspace();
    else await page.evaluate(() => window.scrollTo(0, document.querySelector(".compose").getBoundingClientRect().top + scrollY - 12));
    await page.waitForTimeout(200);
    await hold(4);
    await type("#job-description", POSTING, 26);
    await hold(2);
    await page.setInputFiles("#resume", RESUME);
    await page.waitForTimeout(100);
    await hold(4);
    const m1 = [0, n];
    await page.click("#analyze-btn");
    await frames(3, 30);
    await page.waitForFunction(() => !document.getElementById("analysis-container").hidden);
    await frames(formName === "phone" ? 20 : 12, 45);
    await hold(10);
    const m2 = [m1[1], n];
    const result = await page.evaluate(() => ({
      score: document.getElementById("relevance-score").textContent,
      matched: [...document.querySelectorAll(".chip.matched")].map((c) => c.firstChild.textContent),
      missing: [...document.querySelectorAll(".chip.missing")].map((c) => c.firstChild.textContent),
    }));
    let views;
    if (formName === "phone") {
      // The skills are already in view under the score; settle a little further down to them.
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 12);
        await page.waitForTimeout(30);
        await shot();
      }
      await hold(8);
      views = null;
    } else {
      await hold(14);
      views = { result: await rect(".result"), verdict: await rect(".score"), skills: await rect(".skills"), compose: await rect(".compose") };
    }
    const m3 = [m2[1], n];
    session.forms[formName] = { frames: n, moments: [m1, m2, m3], views, result, viewport: opts.viewport, scale: opts.deviceScaleFactor };
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${rawDir}/session.json`, JSON.stringify(session, null, 2));
console.log(JSON.stringify(session, null, 2));
