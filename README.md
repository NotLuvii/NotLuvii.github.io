# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: marked up by hand. A first screen that is only who I am and what I do: a status
  line with my local time, the name set huge, the headline and intro, and a 3D field of data
  being checked beside them (three.js); a marquee of the tools I use; the three featured projects
  as a row of cards that scrolls sideways and leans toward the pointer (the scam detection tool,
  Resume Analyzer, Immensa), then a box to try the scam tool's rules on your own text; the rest of
  the projects as a plain list; experience as a drawn timeline that unfolds as you reach it; about
  and skills; contact. A faint 3D grid sits behind it all. Its proportions follow the golden ratio.
- **Case studies (`/projects/<slug>/`)**: context, what I built, the key decision (with a verbatim
  code excerpt linked to the file on GitHub), outcome with screenshots, limitations, and links into
  the repository.

## Editing the words

Everything a visitor reads lives in `src/content/`:

| File | What's in it |
| --- | --- |
| `site.ts` | Name, headline, intro, availability (the first screen's status line), contact links, resume path, navigation, and the sections the dots point to |
| `projects.ts` | Featured projects and their case studies, the "More projects" list, screenshots and their captions, each card's line (`tileLine`) and the ring on Resume Analyzer's score (`ring`) |
| `experience.ts` | Roles, education, background, skills (also the marquee's list), and `timeline()`, which orders them for Experience |

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
| `npm test` | Vitest: content rules (including no company names in About), link allow-list, screenshot files and sizes, the design rules (fonts, true-black page, colours and contrast, one see-through surface, gradient hues, outline pills, monospace, touch, ink drawn at rest), the ink (same seed, same line), the scam tool's copied rules (the sample scores 94, High; repeated runs agree; thresholds; underline ranges), the timeline's order, the scroll-progress maths, the clock (Fredericton time, ADT and AST), the defect red kept to the data check, the golden ratio (the type steps, Fibonacci spacing, every font size the CSS declares), the 3D field's layout and timing, the card tilt, the grid's projection and glow |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: every link, the case-study routes and their images, opening a screenshot full screen and closing it (Escape, close button, click outside) without leaving the page, the resume, the site bar (monogram, section pills that follow the scroll, nothing marked on case studies), the section dots, the phone menu, the skip link, focus outlines, anchors below the sticky header, copying the email (including when the clipboard is refused), no sideways scrolling and no text past the edge of a phone screen, 44px tap targets, heading order, the first screen (status, live clock and city-only without JavaScript, name, headline, intro, buttons, the data check; no project; fits short and narrow screens; still and complete with reduced motion; the reveal in step with the scan line), the marquee, the selected-work carousel (three cards and their links, Previous and Next and their ends, keyboard focus brings a card into view, the ring on the score, nothing of the old story left), trying the scam rules (your own text scored like the tool; empty and odd input; without JavaScript), More projects, Experience as a drawn timeline with its figures ringed, About naming no company, section titles in the display face, the footer name, the type scale, monospace only in code, no dividing lines, amber only on the main action, the ink and the signals, every mark drawn with reduced motion, the see-through bar, press feedback, the menu and viewer transitions, reduced motion and no-JavaScript; the golden ratio (every type size on the scale, Fibonacci spacing at 1440 and 390, the 1.618 : 1 split, line height φ, golden card pictures); the 3D field (running and its frames advancing, still with reduced motion, paused off screen, the drawing without WebGL, after a lost context and without JavaScript, never taking the pointer, three not in the first load); cards that tilt and settle (not on a phone or with reduced motion), titles and timeline that turn in and rest flat, no text fading; the grid (behind and inert, glowing under a mouse and then stopping, still on a phone) |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

The first screen, the marquee, the pill navigation, the section dots and the carousel come from
developer portfolios the owner pointed to (Aaftab's status line, clock, marquee and dots;
Redoyan's huge name and project carousel; Sawad's condensed capitals and pill navigation; the
scroll-following navigation of the sites in emmabostian/developer-portfolios). The 3D comes from
four more (Anil Peter's three.js hero and tilting cards, Aditya Seth's grid behind the sections,
Aneeth Kumaar's tilting bento, Sharujan V.'s ticker and type). The tiles are modelled on
apple.com/ca. The hand-drawn ink stays where it marks real evidence.

- **The golden ratio** (φ ≈ 1.618, `src/lib/golden.ts`, the tests check it):
  - every type size is 17px × √φⁿ (13.36, 17, 21.62, 27.51, 34.99, 56.61, 72.01, 116.52, 188.53);
  - margins, paddings and gaps are Fibonacci numbers (`mt-f21`, `gap-f13`…: 2, 3, 5, 8, 13, 21, 34, 55, 89, 144), the gutter runs from 21 to 55px;
  - reading text has a line height of φ, titles √φ;
  - the first screen splits 1.618 : 1 (words : field), the scam checker 1 : 1.618 (field : result), and the timeline keeps to 61.8% of the width;
  - card pictures and the phone's field band are golden rectangles, cards are 610px wide, and the glow sits on the golden point (61.8% across, 38.2% down).
- **The 3D data field** (`components/sections/DataField.tsx`, `components/three/fieldScene.ts`,
  layout and timing in `src/lib/field.ts`):
  - 13 × 21 bars of three fixed heights, an amber scan plane with a light riding on it, and seven bars lit amber and one red once the scan has passed them (no data, so nothing invented);
  - it turns toward a mouse and tilts back as the first screen scrolls away, and never takes the pointer;
  - three is loaded only after the page has loaded and the browser is idle (133 KB gzipped, never in the first load), drawn at most at 2× pixel ratio (1.5× on phones), and paused off screen or in a hidden tab;
  - with reduced motion it renders one still frame with every mark lit; without WebGL, without JavaScript, or if the GPU drops the context, the SVG drawing (`DataCheck.tsx`) stays;
  - `data-field` on its wrapper says which: drawing, running, paused, still or off.
- **3D motion in CSS**:
  - cards (and, gently, the skills tile) lean toward the pointer with a soft white glare (`components/motion/Tilt.tsx`, `src/lib/tilt.ts`), with a mouse only;
  - section titles swing up and the timeline's entries unfold from the spine as they scroll in (CSS view timelines that finish while they are still entering);
  - with reduced motion, or without view timelines, everything rests flat.
- **The 3D grid** (`components/motion/GridBackdrop.tsx`, `src/lib/grid3d.ts`): a faint tile grid
  turned in 3D behind the black parts of the page; with a mouse, tiles near the pointer glow amber
  and fade over 1.5 s, and it stops drawing once they have faded. On touch screens and with reduced
  motion it is drawn once and stays still.

- **First screen** (`components/sections/Hero.tsx`): who I am and what I do, and no project. A
  status pill ("Now: " and `site.availability`) with an amber dot; Fredericton and the time there
  (`LiveClock.tsx`, `src/lib/clock.ts`: America/Moncton, so ADT or AST), added in the browser, so
  without JavaScript only the city shows; the name in the display face; the headline and intro;
  "See the work" and "Download resume". Beside them from 1024px (a band under them below that),
  the 3D data field (above) over its drawing (`DataCheck.tsx`): an amber line scans down a grid
  of bars, and the rows it has passed show their marks, seven ticked and one defect in red. It
  holds no numbers or records, and it is decoration only (`aria-hidden`). A soft amber glow sits
  behind it. As you scroll, the words lift away.
- **Marquee** (`Marquee.tsx`): the skills from `experience.ts`, in the display face, sliding left
  with amber dots between them. Hidden from screen readers (About lists the same skills).
- **Selected work** (`Projects.tsx`, `WorkCarousel.tsx`): three cards in a row that scrolls
  sideways and snaps to each card, by touch, trackpad or Tab; from 768px, Previous and Next
  buttons move it one card (each says it's unavailable at its end), and a card that gets focus
  scrolls fully into view. Each card has its picture in a 16:10 window (the scam tool's result and
  Resume Analyzer's ringed score, held at their foot; Immensa's code), its name, one line, three
  tools and two links. Under the cards, "Try the scam checker on your own text"; then More
  projects as a plain list.
- **Try the scam checker**: runs the tool's own text-message rules on your text as you type and
  underlines what they matched. `src/lib/scam-sms.ts` is a verbatim copy of the `sms` detector in
  Fraud-Detection-Tool's `js/detectors.js` (commit 558fa66) with two type annotations; it resets
  the original's global short-link regex before each run, so repeated checks agree. Nothing is
  sent anywhere. Without JavaScript it shows the sample's result.
- **Site bar**: the monogram "LB" (home), the section links in a pill that marks the section in
  view on the home page (`useActiveSection.ts`, an IntersectionObserver), and the resume as an
  outline pill. The one see-through surface: it blurs what scrolls under it, solid where blur
  isn't supported or the visitor asks for less transparency. On phones the links fold into a menu.
- **Section dots** (`SectionDots.tsx`): from 1280px, a dot per home-page section down the right
  edge; the one in view is amber and shows its name. Without JavaScript they are plain links.
- **Footer**: the name in the display face across the width of the screen.
- **The ink**: an amber marker on the page's real evidence: the timeline's spine, years and
  rings, the ring round Resume Analyzer's score, and the checker's underlines. The marks are drawn
  by rough.js (MIT) at build time, from fixed seeds (`src/lib/ink.ts`, server only), so every
  build draws the same lines and no drawing library reaches the browser; `components/ink/Ink.tsx`
  renders them. The years are set in Gochi Hand (SIL Open Font License,
  `src/fonts/Gochi-Hand-LICENSE.txt`), which is used for nothing else. At rest every mark is fully
  drawn; when motion is allowed they draw as they scroll into view (CSS scroll timelines, where
  the browser has them). To change a mark's shape, change its seed.
- **Colour**: a true-black page (`#000`), panel tiles (`#161617`), a slightly lighter `#1d1d1f`
  for frames and code; `#f5f5f7` text with two quieter greys; and one accent, signal amber
  (`#ffb000`): the main action, the ink, the signals (`[data-signal]`: the status dot, the active
  section dot, the scan line and its ticks, the marquee's dots) and keyboard focus. One red,
  `--color-defect`, for the data check's flagged bar only. Contrast ratios are listed at the top of
  `src/app/globals.css`; all text meets WCAG AA and the tests recheck them.
- **Type**: IBM Plex Sans (variable weight and width), self-hosted (licence in
  `src/fonts/IBM-Plex-LICENSE.txt`). The display face (`type-display`) is Plex Sans at its
  narrowest (75%) and boldest, in capitals: the name (188.53px at 1440), section titles (116.52px)
  and the footer name; it is the only place capitals are used. Every size is on the φ scale above.
  Reading happens at 17–21.62px; body copy is grey with key phrases in white. The home page keeps
  to eight sizes at desktop width. IBM Plex Mono is used for code only.
- **Buttons**: pills, as on apple.com (`button()` in `components/ui/links.tsx`): amber for the one
  main action, a light pill for a card's main link, and outline pills (drawn with `outline`, not a
  border) beside it and for the header's resume. On phones a pair stacks at one width.
- **Experience**: a timeline drawn by hand: the three roles and the degree, newest first, each
  year written once in the margin, every bullet word for word, each resume figure white and
  circled where it stands.
- **About and skills**: what I do, set large, its key phrases in white; a line on how I work; and
  the four skill groups. No company names.
- **Motion**: the 3D field, the cards, titles, timeline and grid (above); the marquee loops; the
  words lift away as you scroll; the case studies' pictures tilt flat as they arrive
  (`ScrollScenes.tsx` writes `--p`, 0 to 1, and the CSS reads it, falling back to the finished
  state). With reduced motion nothing moves and the field shows every mark; without JavaScript
  everything is readable. Text may move, but never fades (the hero's words lifting away as you
  scroll is the one fade). A "Pause motion" button beside the clock (`MotionToggle.tsx`,
  `src/lib/motion.ts`) stops all of it on the page and is remembered, as WCAG 2.2.2 asks.
- **Feel**: buttons shrink slightly the moment they're pressed; taps don't flash the browser's
  grey highlight or wait for a double-tap; the phone menu eases down; a full-screen screenshot
  fades in and out.
- **House rules** (checked by `tests/design.test.ts` and the end-to-end tests): one see-through
  surface (the site bar); two gradients, the first screen's amber glow and the cards' white glare,
  and never a blue or purple one; type on the φ scale and spacing on Fibonacci steps; text that
  moves but never fades; no gradient text; no dividing lines (code panels aside); monospace for code only; corners
  at most 12px; shadows only on the screenshot viewer; no emoji; capitals only in the display
  face; none of the default fonts that make sites look generated; amber only on the main action,
  the ink and the signals; and every mark drawn at rest.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yml`: every push to `main` builds the static export
(`output: "export"`, `trailingSlash: true` in `next.config.ts`) and publishes `out/`. Each page is a
folder with an `index.html`, so no server configuration is needed.
