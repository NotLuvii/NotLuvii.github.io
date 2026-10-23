# Luvneet Bamrah, portfolio

**Live: https://notluvii.github.io**

A static Next.js site: one home page and a case study for each featured project.

- **Home (`/`)**: marked up by hand, in one 1200px column, paced like a product page. A first
  screen with my name, what I do, the two main actions and, beside them, a readable crop of the scam
  detection tool's real result. Then the work as chapters: the scam detection tool (a benefit
  headline, the message, the warning signs and the verdict in three real crops, its known
  limitation, and the live checker running the tool's own rules) and Resume Analyzer (its score and
  gap analysis); Immensa as a compact entry until real screenshots exist; the rest of the projects
  as a plain list; experience; about and skills; contact.
- **Case studies (`/projects/<slug>/`)**: the chapter's crops of the project's own capture, beside
  the problem, what I did and the outcome; the details; then more screenshots, how it works, the
  key decision (with a verbatim code excerpt linked to the file on GitHub), the rest of the outcome,
  limitations, and the repository and its files.

## Editing the words

Everything a visitor reads lives in `src/content/`:

| File | What's in it |
| --- | --- |
| `site.ts` | Name, headline, intro, availability (Contact's lead sentence, the same roles as the headline), contact links, resume path, navigation |
| `projects.ts` | Featured projects, each with its home-page `chapter` (headline, lede, limitation, steps or visual) and its case study; the "More projects" list; screenshots and their captions; and `crops`, the windows onto the captures the home page and case studies show (with their ink marks and ring) |
| `experience.ts` | Roles, education, skills, About's `interests` and `approach` (each point with where it comes from), and `timeline()`, which orders them for Experience |

Rules the content follows, enforced by `tests/content.test.ts`:

- Every project link goes to a specific repository or page that was checked by hand. Private
  repositories and projects without public code get a note instead of a link.
- Each figure from the resume (75%, 50%, 40%) appears once, in the resume's own words.
- Every screenshot is a real capture, exists at 1x and 2x with the size declared in
  `projects.ts`, and has alt text and a caption saying what it shows. Every crop lies inside its
  capture, with its own alt text, and its marks and ring lie inside the crop.
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

Clicking a screenshot, or a crop of one, opens the whole 2x capture full screen over the page (a
`<dialog>`, so nothing navigates). A crop is cut in CSS (`components/ui/Crop.tsx`), so no image is
redrawn or edited: change a crop by changing its rectangle in `crops`. To replace one, keep the file name, export a 2x WebP and a 1x WebP at half the width, and update
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
| `npm test` | Vitest: content rules (no company names in About, its approach points traced to their sources, availability matching the headline, the scam limitations naming the tool's defects, the chapters' wording, every crop inside its capture), link allow-list, screenshot files and sizes, the design rules (fonts, true-black page, colours and contrast, one see-through surface, no gradients, outline pills, monospace, touch, ink drawn at rest, capitals for the name only), the ink (same seed, same line), the scam tool's four detectors (each README sample scores as the tool does; repeated runs agree where the tool's don't; trimming; an empty field is no result; an invalid link; thresholds; underline ranges), the timeline's order, the clock (Fredericton time, ADT and AST), the golden ratio (the type steps, Fibonacci spacing, every font size the CSS declares) |
| `npm run build` | Static export to `out/` |
| `npm start` | Serves `out/` on http://localhost:3000, the way GitHub Pages does |
| `npm run test:e2e` | Playwright on desktop (1440px) and phone (Pixel 7) against `out/`: the first screen (live clock and city-only without JavaScript; the name, then the headline, then the intro, by size; the scam tool's result crop at nearly its own size, its caption and its link; fits 1440×900, 1280×720 and 375×667); crops (aligned at odd widths, opening the whole capture and giving focus back, readable at 1440 and 390); the chapters (the scam story in order with its five underlines, the resume chapter with its ring on 55.6%, their links and limitations; Immensa as a compact entry with no picture, and "screenshots to come" nowhere); the checker (inside its chapter; each README sample's verdict; the meter following the score and gone with no result; Clear and spaces give a neutral prompt, not a low risk; typing scores live; the keyboard; only the result announced; odd input for every kind; long pastes; links with spaces; without JavaScript); sentence-case headings, calm section titles, the chapters' headlines as the large moments, a 62-character measure; Experience as a plain list, every point word for word; the case studies (crops lead, the glance in the first screen, more screenshots at a readable size, no paragraph twice, the repository under "Inspect the code"); one column; the motion control (remembered, honoured everywhere); nothing moving with reduced motion or paused, on every page; no glow, no lift, no scroll tilt, nothing snapping sideways; every control answering the press; every link; the full-screen viewer; the resume; the site bar; the phone menu; the skip link; focus outlines; anchors below the sticky header; copying the email; no sideways scrolling; 44px tap targets; heading order; the intro once; About; contact matching the headline; the quiet footer; amber only on the main action, the ink and the signals; no-JavaScript |

`.github/workflows/ci.yml` runs all of it on every push.

## Design

The October 2026 refinements, guided by Apple's design principles and apple.com's product pages:
the work is the subject. Each strong project gets a chapter with a benefit headline, its real
interface at a readable size, a short explanation, its links and an honest limitation; type is
calm and sentence case, with large type kept for a few moments; and anything decorative that
competed with the work is gone (the 3D field, the glow, the diagram, card tilt, the carousel, the
drawn timeline). The pill navigation and the clock come from developer portfolios the owner pointed
to; the tiles are modelled on apple.com/ca.

- **Layout**: one 1200px column for the bar, the first screen, every chapter and section, and the
  footer, with a gutter from 21 to 55px. Chapters sit 144px apart from 1024px; supporting sections
  89px. The Contact tile is the one full-width band.
- **The golden ratio** (φ ≈ 1.618, `src/lib/golden.ts`, the tests check it):
  - every type size is 17px × √φⁿ (13.36, 17, 21.62, 27.51, 34.99, 56.61 and 116.52 on the home page; case studies add 72.01 for their titles);
  - margins, paddings and gaps are Fibonacci numbers (`mt-f21`, `gap-f13`…: 2, 3, 5, 8, 13, 21, 34, 55, 89, 144);
  - reading text has a line height of φ, titles √φ;
  - splits at 1.618 : 1 (a scam step's crop : its words; Resume Analyzer's score : its gap analysis; a case study's crops : its glance), and the first screen at 1 : 1.
- **Type**: IBM Plex Sans (variable weight and width), self-hosted (licence in
  `src/fonts/IBM-Plex-LICENSE.txt`). The display face (Plex Sans at its narrowest and boldest, in
  capitals) is for the name only, at 116.52px and no more than 14% of the screen's height. The
  chapters' headlines (56.61px) are the other large moments; section titles are 34.99px; everything
  is sentence case. Tracking tightens on large type and loosens slightly on small print. Body text
  keeps to about 62 characters a line. IBM Plex Mono is for code only.
- **First screen** (`components/sections/Hero.tsx`): the name; the headline and intro; "See the
  work" and "Download resume"; and beside them (under them below 1024px) a crop of the scam tool's
  real result for the README's phishing email, with a caption and a link to its chapter. The clock
  (`LiveClock.tsx`, America/Moncton) and the motion control sit above in small type.
- **Crops** (`components/ui/Crop.tsx`, data in `crops`): a window onto a capture, cut in CSS: the
  window takes the crop's shape and the whole image sits in it, scaled and shifted. Never shown
  larger than 1.25 times its own size; a narrower crop below 640px where one is set. Ink underlines
  and rings are placed in percentages of the crop, so they stay on their words at any width. A crop
  opens the whole capture full screen (`ScreenshotViewer.tsx`, shared with screenshots).
- **Chapters** (`ProjectChapter.tsx`):
  - **The scam detection tool**: "A risk score that shows its reasons." Three steps, each a crop of
    the same real capture beside a line of text: the message (with the four phrases the tool quoted
    underlined in ink), the warning signs, the verdict. Then its known limitation, and the live
    checker (`ScamChecker.tsx`, `#demo`): pick Email, Text message, Listing or Link, or one of the
    README's five samples; the score, a bar that eases to it, the tool's own messages, the matched
    words underlined and a link to that detector's lines follow as you type. An empty field asks
    for input; it never reports a low risk. `src/lib/scam-rules.ts` is a verbatim copy of the
    tool's four detectors (commit 558fa66) with type annotations only, plus two guards outside the
    copy against the tool's defects (stateful regular expressions; spaces in a link's host in
    Chrome). Nothing is sent anywhere.
  - **Resume Analyzer**: "Match a resume to a job posting, skill by skill." Its score (ringed) and
    its gap analysis, side by side from 1200px, with the sample posting's result in the caption,
    and its known limitation.
  - **Immensa**: a compact entry (summary, kind, stack, year, links) until real screenshots exist.
- **More projects**: a plain two-column list, figures as written.
- **Experience**: a plain list, newest first: the dates, then the role and organisation and every
  point word for word.
- **About and skills**: what I'm interested in and how I work (each point with where it comes
  from); the four skill groups, four across. No company names.
- **Case studies** (`components/CaseStudy.tsx`): the chapter's crops lead, captioned, beside the
  problem, what I did and the outcome; the details; more screenshots, whole, two across; how it
  works; the key decision; the rest of the outcome; limitations; the code. Nothing is printed twice.
- **Site bar**: the monogram "LB" (home), Projects, Experience, About and Contact in a pill that
  marks the section in view, and the resume as an outline pill. The one see-through surface, solid
  where blur isn't supported or less transparency is asked for. On phones the links fold into a menu.
- **Footer**: one quiet row: who and where, and "Back to top".
- **The ink**: an amber marker on the work's real evidence only: the phrases the scam tool quoted,
  the ring round Resume Analyzer's score, and the checker's underlines, drawn by rough.js (MIT) at
  build time from fixed seeds (`src/lib/ink.ts`, server only).
- **Colour**: a true-black page (`#000`), panel tiles (`#161617`), `#1d1d1f` for frames; `#f5f5f7`
  text with two quieter greys; and one accent, signal amber (`#ffb000`): the main action, the ink,
  the signals (`[data-signal]`: the checker's score bar) and keyboard focus. No gradients. Contrast
  ratios are listed at the top of `src/app/globals.css`; all text meets WCAG AA.
- **Interaction and motion**: every control answers the press at once (pills, the checker's
  choices, samples and Clear scale to 0.97 in 100ms; a crop's picture to 0.99); colours change in
  200ms; one easing. What moves is what explains: the checker's score bar easing to a new score,
  the ink drawing in as it scrolls into view, and the full-screen viewer fading in and out on the
  same path. Nothing loops, nothing snaps, scrolling is native. The motion control beside the clock
  ("Pause motion", then "Resume motion", remembered) and reduced motion leave everything finished
  and still; without JavaScript everything is readable.
- **Feel**: taps don't flash the browser's grey highlight or wait for a double-tap; the phone menu
  eases down.
- **House rules** (checked by `tests/design.test.ts` and the end-to-end tests): one see-through
  surface; no gradients; type on the φ scale and spacing on Fibonacci steps; text that moves but
  never fades; no dividing lines (code panels aside); monospace for code only; corners at most
  12px; shadows only on the full-screen viewer; no emoji; capitals for the name only; amber only on
  the main action, the ink and the signals; every mark drawn at rest.

## Needs the owner

What the site can't supply without inventing it, and work that belongs in the projects themselves:

- **Immensa inquiry app**: real Android screenshots or a screen recording. Until then it is a
  compact text entry on the home page, and its case study opens on text alone.
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
