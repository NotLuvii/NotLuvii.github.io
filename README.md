# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: a stack of tiles, as on apple.com: the opening screen (a recording of the scam
  detection tool at work), the three featured projects (the scam detection story full width, then
  Immensa and Resume Analyzer side by side), more projects, experience (two headline figures and
  the three roles), about and skills, contact.
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
  `projects.ts`, and has alt text and a caption saying what it shows. The opening recording is
  of the real tool too, with the README input it checks recorded word for word.

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

### The opening recording

`public/images/scam-detection/recording-{desktop,phone}.{webm,mp4}` and their stills (the last
frame, `.webp` at 1x, 2x and 3x) are made by `scripts/record-scam-tool.mjs` from a local checkout
of the tool, on 14 October 2026:

```bash
node scripts/record-scam-tool.mjs ../Fraud-Detection-Tool   # needs ffmpeg with libx264, libvpx-vp9, libwebp
```

Every frame is a screenshot of the running tool, held for as long as the film shows it: the
result (2.5s), the tool as it opens (0.8s), the README's phishing email pasted in (1s),
"Analyze email" held down (0.15s), the result again (2.55s), about 7 seconds in all, starting and
ending on the result so it loops cleanly. The desktop crop starts at the tool's tabs so its risk
score is on the first screen; the phone crop is the tool's own phone layout. WebM (VP9) plays
where supported, MP4 (H.264) elsewhere; each file is about 150–200 KB.

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
| `npm test` | Vitest: content rules, link allow-list, screenshot and recording files and sizes, the design rules (fonts, true-black page, colours and contrast, one see-through surface, gradient hues, outline pills, monospace, touch), the scroll-progress and story maths, the story's steps against the case study, the recording's source choice, the resume-figure split |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: every link, the case-study routes and their images, opening a screenshot full screen and closing it (Escape, close button, click outside) without leaving the page, the resume, the phone menu, the skip link, focus outlines, anchors below the sticky header, copying the email (including when the clipboard is refused), no sideways scrolling and no text past the edge of a phone screen, 44px tap targets, heading order, the opening (centred, scanned once, turning flat as you scroll, the phone crop on phones, running into the tile's edge), the recording (plays after the scan with the right crop, pauses and resumes from its button and the keyboard, pauses off screen, waits for the button with reduced motion, shows the still without JavaScript, keeps the still when autoplay is refused or the file won't load), the project tiles (12px apart, sizes), More projects (four across, a sideways row on phones, nothing scrolling sideways at 320px), the experience figures, the contact tile, the scroll story (held while the score climbs through the real steps; finished at once with reduced motion or no JavaScript; fits a phone screen), the type scale, monospace only in code, no dividing lines, amber kept for the main action, the see-through bar, press feedback, the menu and viewer transitions, reduced motion and no-JavaScript |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

Modelled on apple.com/ca (the homepage's tiles) and Apple's product pages (studied on the iPad
Pro page), without their gradient text.

- **Tiles**: the home page is a stack of tiles in the dark-grey panel tone (`#161617`) on a
  true-black page (`#000`), 12px apart and two across from 834px (`.tile-grid`, `.tile` in
  `globals.css`). Each project tile has its name, one line (`tileLine` in `projects.ts`) and two
  pill buttons at the top, and what it shows at the bottom, cut off by the tile's edge. Tiles clip
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
  `src/fonts/IBM-Plex-LICENSE.txt`), on eight sizes at desktop width: 144 (the largest figures),
  63, 56, 35, 28, 21, 17 and 14px. Most reading happens at 17–21px; body copy is grey with key
  phrases in white. IBM Plex Mono is used for code only.
- **Site bar**: the one see-through surface: it blurs the sections scrolling under it instead of
  drawing a line. Solid where blur isn't supported or the visitor asks for less transparency.
- **Opening screen**: name, headline and the two main actions, centred, a line of small print
  saying what the picture is, then the scam detection tool at work (`heroRecording` in
  `projects.ts`), large, in a frame that runs into the bottom edge of the first tile. Phones get
  the tool's own phone layout. On load the frame rises into place and an amber scan line passes
  down it once; as you scroll, the frame turns from tilted back to facing you and the words lift
  away, on CSS scroll timelines.
- **The recording** (`components/motion/HeroRecording.tsx`): the still loads first. With motion
  allowed, the recording starts once the scan line has passed and plays only while at least half
  of it is on screen; its file is fetched only then. A round button in the frame's corner pauses
  and plays it, and its choice sticks. With reduced motion nothing plays until the button is
  pressed; without JavaScript, or if the browser refuses or the file won't load, the still stays.
- **Projects**: the scam detection tile tells its story full width; Immensa's tile shows its three
  figures and its code; Resume Analyzer's shows its screenshot, which the scan line passes over
  once as it arrives (`components/motion/ScanOnView.tsx`). More projects are small tiles, four
  across, and on phones a row that scrolls sideways and snaps to each tile (`.more-row`).
- **Experience**: the two measured results from the resume, 75% and 50%, each set at 144px on a
  tile of its own with what it measured under it (split from the bullet by `figureClaim` in
  `components/ui/Figures.tsx`, so the claim is written once); then the three roles as tiles with
  every bullet word for word.
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
