# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: opening screen (with a real screenshot of the scam detection tool), a short
  introduction, three project showcases (each with a large real screenshot or code excerpt and a
  row of figures from its result), more projects, experience, skills and background, contact.
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

`public/images/` holds WebP screenshots at 1x and 2x, plus a 3x copy of the opening screenshot (all under 100 KB). They were captured on
13 October 2026 (the 3x copy on 14 October) from each project running locally:

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
| `npm test` | Vitest: content rules, link allow-list, screenshot files and sizes, the design rules (fonts, colours and contrast, one see-through surface, gradient hues, monospace, touch), the scroll-progress maths |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: every link, the case-study routes and their images, opening a screenshot full screen and closing it (Escape, close button, click outside) without leaving the page, the resume, the phone menu, the skip link, focus outlines, anchors below the sticky header, copying the email (including when the clipboard is refused), no sideways scrolling and no text past the edge of a phone screen, 44px tap targets, heading order, the opening screenshot (centred, scanned once, turning flat as you scroll, the phone crop on phones), the project showcases and their figures, the type scale, monospace only in code, no dividing lines, amber kept for the main action, the see-through bar, press feedback, the menu and viewer transitions, reduced motion and no-JavaScript |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

Modelled on Apple's product pages (studied on the iPad Pro page), without their gradient text.

- **Colour**: a near-black page (`#0a0a0b`) and a dark-grey panel tone (`#161617`) that sections
  alternate between, so they're separated by tone rather than lines; a slightly lighter `#1d1d1f`
  for screenshot bezels and code; `#f5f5f7` text with two quieter greys; and one accent, signal
  amber (`#ffb000`), kept for the main action, the scan line and keyboard focus. Contrast ratios
  are listed at the top of `src/app/globals.css`; all text meets WCAG AA and the tests recheck them.
- **Type**: IBM Plex Sans (variable weight and width), self-hosted (licence in
  `src/fonts/IBM-Plex-LICENSE.txt`), on seven sizes at desktop width: 64, 56, 36, 28, 21, 17 and
  14px. Most reading happens at 17–21px; body copy is grey with key phrases in white. IBM Plex
  Mono is used for code only.
- **Site bar**: the one see-through surface: it blurs the sections scrolling under it instead of
  drawing a line. Solid where blur isn't supported or the visitor asks for less transparency.
- **Opening screen**: name, headline and the two main actions, centred, then the scam detection
  tool's result panel (`heroShot` in `projects.ts`, also exported at 3x) framed and large on the
  first screen; phones get the same result from the tool's own phone layout. On load the frame
  rises into place and an amber scan line passes down the screenshot once. As you scroll, the
  frame turns from tilted back to facing you and the words lift away, on CSS scroll timelines.
- **Project showcases**: each project gets a centred title, a grey summary with its key phrase in
  white, a large picture, two or three figures from its result (`stats` in `projects.ts`) and its
  links. The same scan line passes over each picture once as it arrives
  (`components/motion/ScanOnView.tsx`).
- **Scroll scenes**: `src/components/motion/ScrollScenes.tsx` writes a progress value (`--p`,
  0 to 1) on each `[data-scene]` element while it is on screen; the CSS in `globals.css` reads it.
  Project pictures tilt flat as they arrive, and the experience timeline's track fills. Text
  never animates. Every rule falls back to the finished state, so with JavaScript off or reduced
  motion on, nothing moves and everything is readable. The progress maths is in `progress.ts` and
  unit tested.
- **Feel**: buttons shrink slightly the moment they're pressed; taps don't flash the browser's
  grey highlight or wait for a double-tap; the phone menu eases down; a full-screen screenshot
  fades in and out.
- **House rules** (checked by `tests/design.test.ts` and the end-to-end tests): one see-through
  surface (the site bar); one gradient, the scan line's amber glow, and never a blue or purple
  one; no gradient text; no dividing lines (code panels aside); monospace for code only;
  corners at most 12px; shadows only on the screenshot viewer; no emoji; no all-caps labels; and
  none of the default fonts that make sites look generated.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yml`: every push to `main` builds the static export
(`output: "export"`, `trailingSlash: true` in `next.config.ts`) and publishes `out/`. Each page is a
folder with an `index.html`, so no server configuration is needed.
