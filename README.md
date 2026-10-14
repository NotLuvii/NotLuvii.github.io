# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: hero, selected projects (one large, two supporting, then a compact list of the
  rest), experience, skills and background, contact.
- **Case studies (`/projects/<slug>/`)**: context, what I built, the key decision (with a verbatim
  code excerpt linked to the file on GitHub), outcome, limitations, screenshots, and links into
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

To replace one, keep the file name, export a 2x WebP and a 1x WebP at half the width, and update
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
| `npm test` | Vitest: content rules, link allow-list, screenshot files and sizes |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: every link, the case-study routes and their images, the resume, the phone menu, the skip link, focus outlines, anchors below the sticky header, copying the email (including when the clipboard is refused), no sideways scrolling at 375, 390, 768, 1024 and 1440px, 44px tap targets, heading order, reduced motion and no-JavaScript |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

- **Colour**: white and `#f5f5f7` surfaces, `#1d1d1f` text, `#6e6e73` secondary text, `#0071e3`
  for buttons and `#0066cc` for links. Contrast ratios are listed at the top of
  `src/app/globals.css`; all text meets WCAG AA.
- **Type**: Inter 4, self-hosted with its optical-size axis (licence in
  `src/fonts/Inter-LICENSE.txt`).
- **Motion**: cards and rows fade up the first time they scroll into view. Nothing is hidden in the
  HTML: elements are only marked for the effect after the page loads, if they start below the fold
  and the visitor hasn't asked for reduced motion.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yml`: every push to `main` builds the static export
(`output: "export"`, `trailingSlash: true` in `next.config.ts`) and publishes `out/`. Each page is a
folder with an `index.html`, so no server configuration is needed.
