/**
 * Builds the portfolio as one self-contained page for hosting as a claude.ai artifact:
 * prerendered HTML (complete before any script runs), Tailwind CSS, the Inter font as a data URI,
 * and the app's own script inline. React and ReactDOM load from cdnjs, the one script host the
 * artifact allows. Output: artifact/dist/index.html.
 *
 *   npm --prefix artifact install && node artifact/build.mjs
 */
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = join(here, "dist");
mkdirSync(out, { recursive: true });

const REACT_VERSION = "18.3.1";
const define = {
  "process.env.NEXT_PUBLIC_ARTIFACT": '"1"',
  "process.env.NODE_ENV": '"production"',
};
const shared = {
  bundle: true,
  jsx: "automatic",
  alias: { "@": join(root, "src") },
  // Our React 18 copies, not the app's React 19: React 18 is the newest with browser (UMD) builds.
  nodePaths: [join(here, "node_modules")],
  define,
  logLevel: "warning",
  logOverride: { "unsupported-directive": "silent" },
};

// 1. Prerender the page with React 18 on the server side.
const serverFile = join(out, "server.mjs");
// React stays external here, so Node loads it from artifact/node_modules.
await build({ ...shared, entryPoints: [join(here, "entry-server.tsx")], platform: "node", format: "esm", packages: "external", outfile: serverFile });
const { render } = await import(pathToFileURL(serverFile).href + `?t=${Date.now()}`);
const html = render();
rmSync(serverFile);

// 2. Client script: React and ReactDOM come from the page's globals. React 18's browser build has
//    no JSX runtime, so a three-line one is supplied on top of React.createElement.
const JSX_RUNTIME = `
  const React = window.React;
  const jsx = (type, props, key) => React.createElement(type, key === undefined ? props : { ...props, key });
  module.exports = { jsx, jsxs: jsx, Fragment: React.Fragment };
`;
const globals = {
  name: "react-globals",
  setup(b) {
    const map = { react: "module.exports = window.React;", "react-dom": "module.exports = window.ReactDOM;", "react-dom/client": "module.exports = window.ReactDOM;" };
    b.onResolve({ filter: /^react(-dom(\/client)?|\/jsx-runtime|\/jsx-dev-runtime)?$/ }, (args) => ({ path: args.path, namespace: "global" }));
    b.onLoad({ filter: /.*/, namespace: "global" }, (args) => ({ contents: map[args.path] ?? JSX_RUNTIME, loader: "js" }));
  },
};
const client = await build({
  ...shared,
  entryPoints: [join(here, "entry-client.tsx")],
  platform: "browser",
  format: "iife",
  target: "es2020",
  minify: true,
  write: false,
  plugins: [globals],
});
const js = client.outputFiles[0].text;

// 3. CSS: the app's own Tailwind stylesheet, plus the rules a host page's reset would otherwise win.
const globalsPath = join(root, "src/app/globals.css");
const css = (await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(readFileSync(globalsPath, "utf8"), { from: globalsPath })).css;
const font = readFileSync(join(root, "src/fonts/inter-latin-opsz-normal.woff2")).toString("base64");
const host = `
@font-face{font-family:"Inter";src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}
:root{--font-inter:"Inter"}
body{margin:0;background:#ffffff;color:#1d1d1f;font-family:var(--font-sans);font-optical-sizing:auto;font-size:17px;line-height:1.47;letter-spacing:-0.022em;-webkit-font-smoothing:antialiased}
`;

const cdn = (lib, file) => `https://cdnjs.cloudflare.com/ajax/libs/${lib}/${REACT_VERSION}/umd/${file}`;
const page = `<title>Luvneet Bamrah Portfolio</title>
<meta name="description" content="Luvneet Bamrah, software engineer: data validation, automated reporting and real-time monitoring tools.">
<style>${css}${host}</style>
<div id="root">${html}</div>
<script src="${cdn("react", "react.production.min.js")}"></script>
<script src="${cdn("react-dom", "react-dom.production.min.js")}"></script>
<script>${js}</script>
`;
writeFileSync(join(out, "index.html"), page);
console.log(`artifact/dist/index.html: ${(page.length / 1024).toFixed(0)} KB (font ${(font.length / 1024).toFixed(0)} KB, css ${(css.length / 1024).toFixed(0)} KB, js ${(js.length / 1024).toFixed(0)} KB)`);
