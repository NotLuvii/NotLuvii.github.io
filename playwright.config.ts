import { defineConfig, devices } from "@playwright/test";

/** End-to-end tests against the built site (`npm run build` first). Set PW_CHROMIUM_PATH to use an installed Chromium. */
const executablePath = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4174",
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "npx vite preview --port 4174 --strictPort", port: 4174, reuseExistingServer: !process.env.CI },
});
