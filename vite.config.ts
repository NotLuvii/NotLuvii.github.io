/// <reference types="vitest/config" />
import { existsSync, readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import { chapters } from "./src/content";
import { renderBody, renderHead, setStillSizes, type StillSizes } from "./src/render";

/** Still sizes from each sequence's manifest, so the stills reserve their space. */
function stillSizes(): StillSizes {
  const out: StillSizes = {};
  for (const c of chapters) {
    const file = `public/sequences/${c.sequence}/manifest.json`;
    if (existsSync(file)) out[c.sequence] = JSON.parse(readFileSync(file, "utf8")).desktop.stills ?? [];
  }
  return out;
}

/** The page is written from src/content.ts at build time, so all of it reads without JavaScript. */
function story(): Plugin {
  return {
    name: "story-html",
    transformIndexHtml: {
      order: "pre",
      handler: (html) => {
        setStillSizes(stillSizes());
        return html.replace("<!--head-->", renderHead()).replace("<!--body-->", renderBody());
      },
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [story()],
  build: { target: "es2022", assetsInlineLimit: 0 },
  server: { port: 5173 },
  // The unit tests; the browser tests in e2e/ run under Playwright.
  test: { include: ["tests/**/*.test.ts"] },
});
