# notluvii.github.io

Luvneet Bamrah's portfolio, live at **https://notluvii.github.io**.

It tells one story by scroll: three tools I built that explain each answer they give. A scam
detector that names every warning sign behind its score, a resume analyzer that shows which of a
posting's skills are missing, and a vehicle counter that boxes and numbers what it counted. Each
chapter is a real recording of the app, scrubbed as you scroll. A thread in one signal colour
carries the evidence from one tool to the next, and the scam detector's own rules run on the page.

## How it works

- **One page, written at build time.** `src/content.ts` holds every word on the page and
  `src/render.ts` turns it into HTML in a small Vite plugin (`vite.config.ts`). The page reads
  completely without JavaScript.
- **Scroll-scrubbed recordings.** Each chapter's stage is `position: sticky` inside a tall track.
  GSAP ScrollTrigger only reads how far through the track the visitor is, and `src/sequence.ts`
  draws the matching frame of a WebP image sequence on a canvas. Scrolling stays native: no
  hijacking, no snapping, and nothing moves unless the visitor scrolls.
- **Light first screen.** Frames load only as their chapter approaches, sparse frames first
  (the first, the last, then every 16th, 8th and so on), and phones get recordings made at phone size.
- **Reduced motion and no JavaScript.** With `prefers-reduced-motion: reduce` or without
  JavaScript, every moment is a still with its caption, and nothing is sticky.
- **The faint background.** Behind the hand-offs between chapters, and behind each stage until its
  recording rises, the tools' own inputs are set very faintly on a canvas: the phishing email, the job
  posting and the vehicle counter's tracker log (`public/sequences/traffic/log.json`, from the run).
  With a mouse, a lens shows them more clearly around the pointer and the pointer leaves a faint track,
  boxed and labelled the way the counter labels a car. Touch screens get the text without the lens or
  the track; reduced motion and no JavaScript get neither.
- **The checker.** `public/vendor/detectors.js` is a verbatim copy of the scam detector's rules,
  so the "try it" box scores text exactly as the tool does.

## Run it

```sh
npm ci
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves dist/ on http://localhost:4173
```

## Tests

```sh
npm test           # unit tests (Vitest)
npm run test:e2e   # browser tests (Playwright) against the built site; run `npm run build` first
```

The unit tests hold the captions to the recordings: each manifest records what the app showed
(the score, the rules that matched, the skills, the running totals), and a caption that says
anything else fails. The browser tests cover the scrub, lazy loading, phone and desktop
recordings, sideways overflow from 320 to 1440 pixels, keyboard focus, reduced motion, no
JavaScript, the old site's addresses and an axe accessibility pass.

Set `PW_CHROMIUM_PATH` to use an installed Chromium instead of Playwright's. Set
`SCAM_TOOL_DETECTORS` to the tool's `js/detectors.js` to check the vendored rules against it.

## Deploying

`.github/workflows/site.yml` runs both test suites on every push and pull request. A push to
`main` that passes them is published to GitHub Pages; one that fails leaves the live site as it
was.

## Making the footage

The recordings come from each app's `redesign-2026` branch, running locally.

```sh
# Scam detector (Fraud-Detection-Tool, `npm start`) and Resume Analyzer (Resume-Analyze, `python app.py`)
node tools/record-web.mjs scam <rawDir>
node tools/record-web.mjs resume <rawDir> --resume path/to/resume.pdf
python tools/encode_sequence.py <scam|resume> <rawDir> public/sequences/<scam|resume>

# Vehicle counter (Traffic-Detection): `python app.py --input clip.webm` writes tracks.json; then, in that repo,
python render.py clip.webm tracks.json annotated.mp4 --frames-dir <framesDir> --every 3 --width 1600 --max-frames 360
python tools/encode_traffic.py <framesDir> <tracks.json> public/sequences/traffic --every 3 --count 120
python tools/track_log.py <tracks.json> public/sequences/traffic/manifest.json public/sequences/traffic/log.json
```

## Credits

The vehicle counter chapter uses
[“Intersection Pie-IX-Sherbrooke”](https://commons.wikimedia.org/wiki/File:Intersection_Pie-IX-Sherbrooke.webm)
by Thomas1313, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia
Commons. The annotated frames in `public/sequences/traffic/` are shared under the same licence.
