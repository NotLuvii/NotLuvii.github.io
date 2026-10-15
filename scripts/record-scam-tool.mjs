// Records the opening screen's film: the scam detection tool, running locally, checking the
// sample phishing email from its README. Run it from this repository with a checkout of
// https://github.com/NotLuvii/Fraud-Detection-Tool (with its npm dependencies installed):
//
//   node scripts/record-scam-tool.mjs ../Fraud-Detection-Tool
//
// Needs ffmpeg (libx264, libvpx-vp9, libwebp) on PATH. Set PW_CHROMIUM_PATH to use an installed
// Chromium. Writes public/images/scam-detection/recording-{desktop,phone}.{webm,mp4} and the
// still (the last frame) at 1x, 2x and 3x.
//
// Every frame is a screenshot of the real page, held for as long as the film shows it: the tool
// as it opens, the email pasted in, "Analyze email" held down, then the result (which the tool
// shows at once, its bar already full). The film starts and ends on the result, so it loops
// without a jump.
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const checkout = process.argv[2];
if (!checkout) {
  console.error("usage: node scripts/record-scam-tool.mjs <path-to-Fraud-Detection-Tool>");
  process.exit(2);
}

const PORT = 3299;
const URL = `http://localhost:${PORT}/`;
const OUT = resolve("public/images/scam-detection");
const INPUT =
  "Dear Customer, Your account has been suspended due to unusual activity.\nVerify your identity immediately: https://paypal-secure.com/verify-now\nClick here to restore access. Do not ignore this message.";
const FPS = 30;

/**
 * The two crops, each starting 16px above a part of the tool: its desktop layout from the tabs
 * down, so the risk score sits high enough to be on the first screen, and its phone layout from
 * the form down.
 */
const CROPS = [
  { name: "desktop", width: 1000, height: 640, at: ".tabs", encode: "2000:1280" },
  { name: "phone", width: 390, height: 560, at: "#panel-email", encode: "1170:1680" },
];

const server = spawn("node", ["server.js"], { cwd: resolve(checkout), env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
const stop = () => server.kill();
process.on("exit", stop);

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(URL)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`The tool didn't start on ${URL}`);
}

const ffmpeg = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

async function record(browser, crop) {
  const dir = mkdtempSync(join(tmpdir(), `scam-${crop.name}-`));
  const context = await browser.newContext({ viewport: { width: crop.width, height: crop.height }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  let n = 0;
  const shoot = async () => {
    const file = join(dir, `f${String(n++).padStart(4, "0")}.png`);
    await page.screenshot({ path: file });
    return file;
  };
  const open = async () => {
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.evaluate((sel) => window.scrollTo(0, document.querySelector(sel).getBoundingClientRect().top + scrollY - 16), crop.at);
    await page.mouse.move(4, 4);
    await page.waitForTimeout(300);
  };

  // E: the tool as it opens, on its Phishing email tab.
  await open();
  const empty = await shoot();
  // P: the README's email, pasted into the field.
  await page.fill("#input-email", INPUT);
  await page.waitForTimeout(300);
  const pasted = await shoot();
  // B: "Analyze email" held down.
  await page.hover('[data-detect="email"]');
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.waitForTimeout(150);
  const pressed = await shoot();
  // R: released; the result.
  await page.mouse.up();
  await page.waitForTimeout(600);
  const result = await shoot();
  const score = await page.locator("#risk-value").textContent();
  await context.close();

  // The film, 7 seconds: R 2.5s, E 0.8s, P 1.0s, B 0.15s, R 2.55s.
  const steps = [
    [result, 2.5],
    [empty, 0.8],
    [pasted, 1.0],
    [pressed, 0.15],
    [result, 2.55],
  ];
  const list = join(dir, "list.txt");
  writeFileSync(list, steps.map(([f, d]) => `file '${f}'\nduration ${d}`).join("\n") + `\nfile '${result}'\n`);
  const base = join(OUT, `recording-${crop.name}`);
  const vf = `fps=${FPS},scale=${crop.encode}:flags=lanczos,format=yuv420p`;
  ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-vf", vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-movflags", "+faststart", `${base}.mp4`]);
  ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-vf", vf, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "33", "-row-mt", "1", `${base}.webm`]);
  // The still: the last frame, at 1x, 2x and 3x.
  for (const [suffix, scale] of [["", 1], ["@2x", 2], ["@3x", 3]]) {
    ffmpeg(["-i", result, "-vf", `scale=${crop.width * scale}:-1:flags=lanczos`, "-c:v", "libwebp", "-quality", "82", "-compression_level", "6", `${base}${suffix}.webp`]);
  }
  rmSync(dir, { recursive: true, force: true });

  for (const f of [`${base}.webm`, `${base}.mp4`, `${base}.webp`, `${base}@2x.webp`, `${base}@3x.webp`]) {
    const seconds = f.endsWith(".webp") ? "" : execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim() + "s";
    console.log(`${f}  ${statSync(f).size} bytes  ${seconds}`);
  }
  console.log(`${crop.name}: final score ${score}`);
}

try {
  await waitForServer();
  const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
  for (const crop of CROPS) await record(browser, crop);
  await browser.close();
} finally {
  stop();
}
