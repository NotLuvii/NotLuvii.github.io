# Luvneet Bamrah, portfolio for quality and manufacturing software roles

A one-page portfolio in the style of an Apple product page, tailored to quality, manufacturing and
data software roles. It stands on its own, the way a tailored résumé does.

1. **Opening section.** Name, the line "Software that checks out." and an illustrated app window: data checked
   against its source with one discrepancy traced, a report that sends itself, a live feed.
2. **Get the highlights.** Six cards, one strength each, every one backed by a line from the résumé.
3. **The work.** All eight projects, the ones closest to quality and data work first, each with a drawing.
4. **Results you can measure.** The three figures on the résumé, with footnotes.
5. **Experience**, **What I bring** (requirements traced to where they've been done, with an honest
   "Learning" status), **Toolkit**, and **Let's talk**.

## Before you change anything

1. Read `src/content/evidence.ts`. The "Learning" rows (statistical process control, Power Apps and
   Power Automate, Azure, ISO 9001/MES/ERP) are written for someone who hasn't used them. If you
   have, change the status and the wording.
2. Point each project's `href` in `src/content/projects.ts` at its repository. They all go to the
   GitHub profile for now.

Every word on the page lives in `src/content/`: `site.ts`, `highlights.ts`, `projects.ts`,
`numbers.ts`, `experience.ts` and `evidence.ts`.

## Run it

Node 22.12 or later.

```bash
npm install
npm run dev            # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run typecheck` | Generates Next.js types, then TypeScript in strict mode |
| `npm run lint` | ESLint with the Next.js and React Compiler rules |
| `npm test` | Vitest: content checks (all eight projects, ordering, every figure sourced, no links to other portfolios) and the carousel and counter logic |
| `npm run build && npm run test:e2e` | Playwright on desktop and phone, against the static build in `out/`: links, projects, the highlights carousel, figures, the résumé PDF, copying the email, no sideways scrolling, reduced motion |
| `npm run check` | Type check, lint and unit tests |

`.github/workflows/ci.yml` runs all of it, plus the build and the end-to-end tests, on every push
once the repository is on GitHub.

## Design

- **Colour:** Apple's palette. White and `#f5f5f7` sections, `#1d1d1f` text, `#6e6e73` secondary text, one
  black section for the work, and `#0071e3` blue only for things you can click. Figures are set
  in a blue-to-violet gradient. All text pairs meet WCAG AA.
- **Type:** Inter 4, self-hosted with its optical-size axis, the closest open typeface to SF Pro
  (licence in `src/fonts/Inter-LICENSE.txt`).
- **Motion:** headlines and tiles rise into place once, drawings draw in when first seen, figures
  count up. All of it is off under reduced motion, and nothing is hidden if JavaScript doesn't run.

## Deploy

**GitHub Pages: https://notluvii.github.io.** The site is a static export (`output: "export"` in
`next.config.ts`; `npm run build` writes it to `out/`). `.github/workflows/deploy.yml` builds it and
publishes it to GitHub Pages on every push to `main`, so editing a file in `src/content/` and pushing
is all an update takes. The deploy takes a minute or two; watch it under the repository's Actions tab.

**claude.ai copy.** `artifact/` builds the same page as one self-contained file for hosting as a
claude.ai artifact:

```bash
npm --prefix artifact install   # React 18 and esbuild, kept apart from the app's React 19
node artifact/build.mjs         # writes artifact/dist/index.html
```

That copy differs in two ways (`NEXT_PUBLIC_ARTIFACT=1`, see `src/lib/mode.ts`): everything is
visible at load, with no scroll reveals or counting figures, and there's no résumé download, because
artifacts can't serve files.
