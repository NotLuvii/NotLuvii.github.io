# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: marked up by hand, in one 1200px column. A first screen that is only who I am
  and what I do: my local time, the name set huge, the headline, intro and two buttons, and beside
  them a diagram of the work (report figures checked against their source, the mismatch traced to
  its root cause). Then the three featured projects as comparable cards (the scam detection tool,
  Resume Analyzer, Immensa); the scam checker, running the tool's own four detectors on what you
  paste; the rest of the projects as a plain list; experience as a drawn timeline; about and
  skills; contact. Its proportions follow the golden ratio.
- **Case studies (`/projects/<slug>/`)**: the first screenshot, then the problem, what I did and
  the outcome at a glance, and the details; farther down, more screenshots, how it works, the key
  decision (with a verbatim code excerpt linked to the file on GitHub), the rest of the outcome,
  limitations, and the repository and its files.

## Editing the words

Everything a visitor reads lives in `src/content/`:

| File | What's in it |
| --- | --- |
| `site.ts` | Name, headline, intro, availability (Contact's lead sentence, the same roles as the headline), contact links, resume path, navigation |
| `projects.ts` | Featured projects and their case studies, the "More projects" list, screenshots and their captions, each card's line (`tileLine`) and the ring on Resume Analyzer's score (`ring`) |
| `experience.ts` | Roles, education, skills, About's `interests` and `approach` (each point with where it comes from), and `timeline()`, which orders them for Experience |

Rules the content follows, enforced by `tests/content.test.ts`:

- Every project link goes to a specific repository or page that was checked by hand. Private
  repositories and projects without public code get a note instead of a link.
- Each figure from the resume (75%, 50%, 40%) appears once, in the resume's own words.
- Every screenshot is a real capture, exists at 1x and 2x with the size declared in
  `projects.ts`, and has alt text and a caption saying what it shows.
- About and skills names no company I worked at; those names belong to Experience. Its "How I
  work" points each come from something the site shows: the reports work, or a case study.
- The scam checker's samples are the README's example inputs, verbatim, and the case study's scores
  are the ones the checker computes from them.

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
| `npm test` | Vitest: content rules (no company names in About, its approach points traced to their sources, availability matching the headline, the scam limitation naming the regex defect), link allow-list, screenshot files and sizes, the design rules (fonts, true-black page, colours and contrast, one see-through surface, one gradient, outline pills, monospace, touch, ink drawn at rest, the defect red kept to the diagram), the ink (same seed, same line), the scam tool's four detectors (each README sample scores as the tool does; repeated runs agree where the tool's don't; an empty field is no result; an invalid link; thresholds; underline ranges), the timeline's order, the scroll-progress maths, the clock (Fredericton time, ADT and AST), the golden ratio (the type steps, Fibonacci spacing, every font size the CSS declares) |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: one column (every block's left edge at 1440), section titles at most 57px and 89px apart; the first screen (live clock and city-only without JavaScript, name, headline, intro, buttons, the diagram with its caption, 8 rows, 7 ticks, 1 flag and the trace; finished with reduced motion or motion paused, run once otherwise; fits 1440×900, 1280×720 and 375×667; no project, no status pill, no scan line); the motion control ("Pause motion" / "Resume motion", remembered, honoured on case studies); nothing decorative left (no canvas, three.js, marquee, dots, tilt or grid); the cards (three, comparable, one golden frame each, screenshots or Immensa's "Android screenshots to come", no code; all in view at 1440 with no controls; "1 of 3", dots and Previous/Next when the row scrolls, following a resize; keyboard focus brings a card into view; the ring on the score); the scam checker (its own section; each README sample's verdict; Clear and spaces give a neutral prompt, not a low risk; typing scores live; the keyboard; only the result announced; odd input stays text for every kind; without JavaScript); the case studies (visual, problem, what I did and outcome first; no paragraph twice; the repository under "Inspect the code"; routes and images); every link; opening a screenshot full screen and closing it; the resume; the site bar; the phone menu; the skip link; focus outlines; anchors below the sticky header; copying the email; no sideways scrolling; 44px tap targets; heading order; the intro once; About's interests and approach; contact matching the headline; the footer name; the type scale; monospace only in code; no dividing lines; amber only on the main action, the ink and the signals; reduced motion and no-JavaScript; the golden ratio |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

The pill navigation, the huge name and the clock come from developer portfolios the owner
pointed to; the tiles are modelled on apple.com/ca. The hand-drawn ink stays where it marks real
evidence. The October 2026 refinement put understanding the work ahead of effects: one column,
smaller titles, one diagram of the work instead of a 3D field, comparable project cards, the scam
checker promoted, and case studies that open with the result.

- **Layout**: one 1200px column for the bar, the first screen, every section and the footer row,
  with a gutter from 21 to 55px. Three exceptions, on purpose: the project row runs to the screen's
  edge while it scrolls, the footer name spans the screen, and the Contact tile is a full-width band.
- **The golden ratio** (φ ≈ 1.618, `src/lib/golden.ts`, the tests check it):
  - every type size is 17px × √φⁿ (13.36, 17, 21.62, 27.51, 34.99, 56.61 and 188.53 on the home page; case studies add 72.01 for their titles);
  - margins, paddings and gaps are Fibonacci numbers (`mt-f21`, `gap-f13`…: 2, 3, 5, 8, 13, 21, 34, 55, 89, 144); sections sit 55px apart on a phone and 89px from 768px;
  - reading text has a line height of φ, titles √φ;
  - the first screen splits 1.618 : 1 (words : diagram), and so does the scam checker (field : result);
  - card pictures are golden rectangles, and the glow sits on the golden point (61.8% across, 38.2% down).
- **First screen** (`components/sections/Hero.tsx`): who I am and what I do, and no project.
  Fredericton and the time there (`LiveClock.tsx`, `src/lib/clock.ts`: America/Moncton, so ADT or
  AST), added in the browser, so without JavaScript only the city shows, and the motion control
  beside it; the name across the column (188.53px at 1440, never more than 21% of the screen's
  height); the headline, intro, "See the work" and "Download resume"; and beside them from 1024px
  (under them below that) the diagram.
- **The diagram** (`ReconcileDiagram.tsx`): what the resume describes, "Wrote SQL to check report
  figures against source systems and trace discrepancies to their root cause". Report and source
  bars side by side, row by row: seven match and get an amber tick, one doesn't and gets a red
  flag, and a red line traces it to "Root cause". No numbers, so it invents nothing. The drawing is
  `aria-hidden`; the labels are text and the caption says what it shows. It runs once on load
  (ticks, then the flag, then the trace, about two seconds) and is simply finished with reduced
  motion, motion paused or no JavaScript. No scan line.
- **Selected work** (`Projects.tsx`, `WorkCarousel.tsx`): three cards, each a real screenshot in
  the same golden frame (the scam tool's result, Resume Analyzer's ringed score, held at their
  foot) or, for Immensa, a frame reading "Android screenshots to come"; then its name, one line,
  three tools and two links. From 1100px the three share the column with no controls. Narrower,
  the row scrolls and snaps, and says where you are: "2 of 3", a dot per project (the one in view
  marked with `aria-current`) and, from 768px, Previous and Next (each unavailable at its end). A
  card that gets focus scrolls into view.
- **The scam checker** (`ScamChecker.tsx`, `#demo`): pick Email, Text message, Listing or Link, or
  one of the README's five samples; the score, the tool's own messages, the matched words
  underlined and a link to that detector's lines in `js/detectors.js` follow as you type. An empty
  field asks for input; it never reports a low risk. Only the result is announced. Without
  JavaScript it shows the text sample's result with the field read-only. `src/lib/scam-rules.ts`
  is a verbatim copy of the tool's four detectors (Fraud-Detection-Tool, `js/detectors.js`, commit
  558fa66) with type annotations only. The tool reuses two global regular expressions with
  `test()`, so its second check of a text can miss what the first found ("Selling bike $50,
  contact me" scores 32, then 12); the checker resets them before each run. In Chrome the tool also
  takes text with spaces as a link (Chrome's URL parser lets spaces into a host name); the checker
  gives the tool's own "not a valid URL" answer there. It trims what you paste first, as the tool's
  page does, and checks up to 10,000 characters, saying so when it reaches that. The fixes belong
  in the tool. Nothing is sent anywhere.
- **Case studies** (`components/CaseStudy.tsx`): the title and summary; the first screenshot in
  the cards' frame; the problem, what I did and the outcome, three across from 834px; the project,
  stack and availability; then more screenshots, how it works, the key decision, the rest of the
  outcome, the limitations and the code. Nothing is printed twice.
- **Site bar**: the monogram "LB" (home), the section links in a pill that marks the section in
  view on the home page (`useActiveSection.ts`, an IntersectionObserver), and the resume as an
  outline pill. The one see-through surface: it blurs what scrolls under it, solid where blur
  isn't supported or the visitor asks for less transparency. On phones the links fold into a menu.
- **Footer**: the name in the display face across the width of the screen; the role, city and
  "Back to top" in the column.
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
  (`#ffb000`): the main action, the ink, the signals (`[data-signal]`: the diagram's ticks) and
  keyboard focus. One red, `--color-defect`, for the diagram's flag, trace and root cause only.
  Contrast ratios are listed at the top of `src/app/globals.css`; all text meets WCAG AA and the
  tests recheck them.
- **Type**: IBM Plex Sans (variable weight and width), self-hosted (licence in
  `src/fonts/IBM-Plex-LICENSE.txt`). The display face (`type-display`) is Plex Sans at its
  narrowest (75%) and boldest, in capitals: the name (188.53px at 1440), section titles (56.61px)
  and the footer name; it is the only place capitals are used. Reading happens at 17–21.62px.
  IBM Plex Mono is used for code only.
- **Buttons**: pills, as on apple.com (`button()` in `components/ui/links.tsx`): amber for the one
  main action, a light pill for a card's main link, and outline pills (drawn with `outline`, not a
  border) beside it and for the header's resume. On phones a pair stacks at one width.
- **Experience**: a timeline drawn by hand: the three roles and the degree, newest first, each
  year written once in the margin, every bullet word for word, each resume figure white and
  circled where it stands.
- **About and skills**: what I'm interested in (the line on my work and the personal projects
  under More projects) and how I work (four points, each with where it comes from: the reports
  work, or a case study, linked); then the four skill groups, once. No company names.
- **Motion**: the diagram's one check on load; the words lift away as you scroll; the case
  studies' later screenshots tilt flat as they arrive (`ScrollScenes.tsx` writes `--p`, 0 to 1,
  and the CSS reads it, falling back to the finished state); the ink draws as it scrolls in. The
  motion control beside the clock (`MotionToggle.tsx`, `src/lib/motion.ts`) says what it will do
  ("Pause motion", then "Resume motion"), stops all of it on every page, and is remembered, as
  WCAG 2.2.2 asks. With reduced motion nothing moves; without JavaScript everything is readable.
  Text may move, but never fades (the hero's words lifting away as you scroll is the one fade).
- **Feel**: buttons shrink slightly the moment they're pressed; taps don't flash the browser's
  grey highlight or wait for a double-tap; the phone menu eases down; a full-screen screenshot
  fades in and out.
- **House rules** (checked by `tests/design.test.ts` and the end-to-end tests): one see-through
  surface (the site bar); one gradient, the first screen's amber glow, and never a blue or purple
  one; type on the φ scale and spacing on Fibonacci steps; text that moves but never fades; no
  gradient text; no dividing lines (code panels aside); monospace for code only; corners at most
  12px; shadows only on the screenshot viewer; no emoji; capitals only in the display face; none
  of the default fonts that make sites look generated; amber only on the main action, the ink and
  the signals; and every mark drawn at rest.

## Needs the owner

What the site can't supply without inventing it, and work that belongs in the projects themselves:

- **Immensa inquiry app**: real Android screenshots or a screen recording. Until then its card and
  case study say "Android screenshots to come".
- **The resume's three percentages**: how each was measured. "Increased route data accuracy by 75%"
  (SafeTrack), "Reduced delivery delays by 50%" (Immensa Tech) and "Reduced troubleshooting effort
  by 40%" (the monitoring dashboards) are shown as written on the resume.
- **About**: any interests beyond what the site already shows.
- **Fraud-Detection-Tool**: make `sms.shortUrlPattern` and `listing.pricePattern` non-global (or
  reset them); reject a link whose host has a space, which Chrome's URL parser lets through; and
  add tests. The case study lists each as a limitation, and the checker guards against both.
- **Resume-Analyze**: match multi-word and punctuated skills (Power BI, C++, scikit-learn,
  problem-solving); the case study lists it as a limitation.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yml`: every push to `main` builds the static export
(`output: "export"`, `trailingSlash: true` in `next.config.ts`) and publishes `out/`. Each page is a
folder with an `index.html`, so no server configuration is needed.
