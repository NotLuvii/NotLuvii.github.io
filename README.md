# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: opening screen, a one-line introduction, three selected projects (each with a
  real screenshot or code excerpt), more projects, experience, skills and background, contact.
- **Case studies (`/projects/<slug>/`)**: context, what I built, the key decision (with a verbatim
  code excerpt linked to the file on GitHub), outcome with screenshots, limitations, and links into
  the repository.

## Editing the words

Everything a visitor reads lives in `src/content/`:

| File | What's in it |
| --- | --- |
| `site.ts` | Name, headline, intro, contact links, resume path, navigation |
| `projects.ts` | Featured projects and their case studies, the "More projects" list, screenshots and their captions |
| `experience.ts` | Roles, education, background, skills |

Rules the content follows, enforced by `tests/content.test.ts`:

- Every project link goes to a specific repository or page that was checked by hand. Private
  repositories and projects without public code get a note instead of a link.
- Each figure from the resume (75%, 50%, 40%) appears once, in the resume's own words.
- Every screenshot is a real capture, exists at 1x and 2x with the size declared in
  `projects.ts`, and has alt text and a caption saying what it shows.

## Screenshots

`public/images/` holds WebP screenshots at 1x and 2x (all under 100 KB). They were captured on
13 October 2026 from each project running locally:

- **Scam detection tool**: `node server.js` from
  [Fraud-Detection-Tool](https://github.com/NotLuvii/Fraud-Detection-Tool), with the example
  inputs from its README.
- **Resume Analyzer**: the Flask web version of
  [Resume-Analyze](https://github.com/NotLuvii/Resume-Analyze), comparing the published resume with
  a short sample job description (quoted in the caption).

Clicking a screenshot opens the 2x file full screen over the page (a `<dialog>`, so nothing
navigates). To replace one, keep the file name, export a 2x WebP and a 1x WebP at half the width, and update
`width` and `height` in `projects.ts`. The unit tests check that the sizes match.

## Run it

Node 22.12 or later.

```bash
npm install
npm run dev            # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run typecheck` | Generates Next.js route types, then TypeScript in strict mode |
| `npm run lint` | ESLint with the Next.js rules |
| `npm test` | Vitest: content rules, link allow-list, screenshot files and sizes, the design rules, the scroll-progress maths |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: every link, the case-study routes and their images, opening a screenshot full screen and closing it (Escape, close button, click outside) without leaving the page, the resume, the phone menu, the skip link, focus outlines, anchors below the sticky header, copying the email (including when the clipboard is refused), no sideways scrolling at 375, 390, 768, 1024 and 1440px, 44px tap targets, heading order, the word-by-word introduction, the scan line pausing off screen, reduced motion and no-JavaScript |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

- **Colour**: a near-black page (`#0a0a0b`), `#141416` panels, `#f5f5f7` text with two quieter
  greys, `#2c2c2e` lines and one accent, signal amber (`#ffb000`). Contrast ratios are listed at
  the top of `src/app/globals.css`; all text meets WCAG AA and the tests recheck them.
- **Type**: IBM Plex Sans (variable weight and width) and IBM Plex Mono, self-hosted (licence in
  `src/fonts/IBM-Plex-LICENSE.txt`). Headings use a slightly condensed width; labels, dates and
  file names are set in Plex Mono.
- **Opening screen**: the background is real code, lines 201 to 260 of `js/detectors.js` from the
  scam detection tool (`src/content/heroCode.ts`, linked from the caption). An amber line sweeps
  down it and the lines light as it passes. Only transforms animate, and it pauses off screen.
- **Scroll scenes**: `src/components/motion/ScrollScenes.tsx` writes a progress value (`--p`,
  0 to 1) on each `[data-scene]` element while it is on screen; the CSS in `globals.css` reads it.
  The introduction lights word by word, screenshots and code tilt flat as they arrive, and the
  experience timeline fills with amber. Every rule falls back to the finished state, so with
  JavaScript off or reduced motion on, nothing is pinned, nothing animates and everything is
  readable. The progress maths is in `progress.ts` and unit tested.
- **Entrance**: below-the-fold blocks fade up the first time they scroll into view. Nothing is
  hidden in the HTML: elements are only marked for the effect after the page loads.
- **House rules** (checked by `tests/design.test.ts`): no gradient text, no frosted glass or
  blur, no purple, corners at most 12px, shadows only on the screenshot viewer, no emoji, no
  all-caps labels, and none of the default fonts that make sites look generated.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yml`: every push to `main` builds the static export
(`output: "export"`, `trailingSlash: true` in `next.config.ts`) and publishes `out/`. Each page is a
folder with an `index.html`, so no server configuration is needed.
