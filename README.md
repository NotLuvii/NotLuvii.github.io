# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: a first screen that is only who I am and what I do; the three featured
  projects, one full-width tile each (the scam detection story, Resume Analyzer, Immensa); the
  rest of the projects as a plain list; experience (the three roles); about and skills; contact.
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
- About and skills says what I do without naming the companies I worked at; those names belong
  to Experience.

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

### A recording of the scam detection tool

The site doesn't show one at the moment. `scripts/record-scam-tool.mjs` makes a short, looping
recording of the real tool (WebM, MP4 and a still) from a local checkout, if one is wanted again:

```bash
node scripts/record-scam-tool.mjs ../Fraud-Detection-Tool   # needs ffmpeg with libx264, libvpx-vp9, libwebp
```

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
| `npm test` | Vitest: content rules (including no company names in About), link allow-list, screenshot files and sizes, the design rules (fonts, true-black page, colours and contrast, one see-through surface, gradient hues, outline pills, monospace, touch), the scroll-progress and story maths, the story's steps against the case study |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: every link, the case-study routes and their images, opening a screenshot full screen and closing it (Escape, close button, click outside) without leaving the page, the resume, the phone menu, the skip link, focus outlines, anchors below the sticky header, copying the email (including when the clipboard is refused), no sideways scrolling and no text past the edge of a phone screen, 44px tap targets, heading order, the first screen (who and what only, no project; fits short and narrow screens), the project tiles (one per row, 12px apart), More projects (a plain list, two columns or one, nothing scrolling sideways at 320px), Experience as the roles, About naming no company, nothing removed left behind, the contact tile, the scroll story (held while the score climbs through the real steps; finished at once with reduced motion or no JavaScript; fits a phone screen), the type scale, monospace only in code, no dividing lines, amber kept for the main action, the see-through bar, press feedback, the menu and viewer transitions, reduced motion and no-JavaScript |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

Modelled on apple.com/ca (the homepage's tiles) and Apple's product pages (studied on the iPad
Pro page), without their gradient text.

- **Tiles**: sections are tiles in the dark-grey panel tone (`#161617`) on a true-black page
  (`#000`), 12px apart (`.tile`, `.tile-grid`, `.tile-stack` in `globals.css`). The project
  tiles stack one per row at every width; each has its name, one line (`tileLine` in
  `projects.ts`) and two pill buttons at the top, and what it shows below. Tiles clip
  with `overflow: clip`, not `hidden`, so the scroll story can still hold its stage inside one.
- **Colour**: black page, panel tiles, a slightly lighter `#1d1d1f` for frames and code;
  `#f5f5f7` text with two quieter greys; and one accent, signal amber (`#ffb000`), kept for the
  main action, the scan line, the story's score bar and keyboard focus. Contrast ratios are listed
  at the top of `src/app/globals.css`; all text meets WCAG AA and the tests recheck them.
- **Buttons**: pills, as on apple.com (`button()` in `components/ui/links.tsx`): amber for the one
  main action, a light pill for a tile's main link, an outline pill beside it (drawn with
  `outline`, not a border), and a grey pill for the header's resume button. On phones a pair stacks
  at one width.
- **Type**: IBM Plex Sans (variable weight and width), self-hosted (licence in
  `src/fonts/IBM-Plex-LICENSE.txt`), on eight sizes at desktop width: 144 (the story's score),
  63, 56, 35, 28, 21, 17 and 14px. Most reading happens at 17–21px; body copy is grey with key
  phrases in white. IBM Plex Mono is used for code only.
- **Site bar**: the one see-through surface: it blurs the sections scrolling under it instead of
  drawing a line. Solid where blur isn't supported or the visitor asks for less transparency.
- **First screen**: who I am and what I do, and nothing else: name, headline, where I am and
  what I'm looking for (`heroLine()` in `site.ts`), and the two main actions, centred on a screen
  of their own. As you scroll the words lift away, on a CSS scroll timeline.
- **Projects**: the scam detection tile tells its story; Resume Analyzer's shows its screenshot,
  which the scan line passes over once as it arrives (`components/motion/ScanOnView.tsx`);
  Immensa's shows its code, cut off by the tile like a picture. More projects follow as a plain
  list, two columns on a wide screen and one on a phone, with nothing boxed: each says what kind of
  project it was and when, then gives its links (or why there are none).
- **Experience**: the three roles as tiles, every bullet word for word, each resume figure in
  white inside its sentence.
- **About and skills**: what I do, set large, with a line on how I work; education; and the four
  skill groups. No company names.
- **Scroll story** (`components/sections/ScanStory.tsx`): the scam detection tile holds on screen for about two screens of scrolling while the scan line moves down the
  README's sample text message. Each time it reaches a phrase a rule fired on, the phrase lights,
  the rule appears with its weight and the score counts up through the tool's own levels, to 94,
  High. The steps (`story` in `projects.ts`) were traced by running the project's
  `js/detectors.js` on that sample, and the tests check they add up to the 94 in the case study.
  The page is rendered finished; with reduced motion or without JavaScript nothing is held and the
  result shows at once. The maths is in `components/motion/story.ts` and unit tested.
- **Scroll scenes**: `src/components/motion/ScrollScenes.tsx` writes a progress value (`--p`,
  0 to 1) on each `[data-scene]` element while it is on screen; the CSS in `globals.css` reads it.
  On the case-study pages, pictures tilt flat as they arrive. Text never animates. Every rule falls back to the finished state, so with JavaScript off or reduced
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
