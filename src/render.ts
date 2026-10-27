import { about, chapters, education, more, openingWords, roles, site, thread, type Chapter } from "./content";

/** Escape text for HTML. */
export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const ext = (href: string) => /^https?:/.test(href);
const link = (label: string, href: string, cls = "text-link") =>
  `<a class="${cls}" href="${esc(href)}"${ext(href) ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}${
    ext(href) ? '<span class="visually-hidden"> (opens in a new tab)</span><span class="arrow" aria-hidden="true">↗</span>' : ""
  }</a>`;

function opening() {
  // Drawn as generated content: pure decoration, not text a reader or a screen reader meets.
  const words = (band: string) =>
    `<div class="opening-words ${band}" aria-hidden="true">${openingWords
      .filter((w) => w.band === band)
      .map((w) => `<span class="word${w.phone ? " on-phone" : ""}" data-w="${esc(w.text)}" style="--x:${w.x}%;--y:${w.y}%;--s:${w.s};--o:${w.o}"></span>`)
      .join("")}</div>`;
  return `
<section class="opening" id="top" aria-labelledby="title">
  ${words("above")}
  ${words("beside")}
  <div class="opening-copy">
    <p class="eyebrow">${esc(site.name)} · ${esc(site.role)} · ${esc(site.city)}, ${esc(site.regionShort)}</p>
    <h1 id="title" class="display">${esc(site.title).replace("shows its work.", 'shows its <span class="signal-word">work.</span>')}</h1>
    <p class="lede">${esc(site.lede)}</p>
    <p class="opening-links">
      <a class="pill primary" href="#work">See the work</a>
      <a class="pill" href="${esc(site.resume)}" download>Resume <span class="pill-note">(PDF)</span></a>
    </p>
  </div>
  ${words("below")}
  <p class="scroll-hint" aria-hidden="true">Scroll</p>
</section>`;
}

/** Each sequence's still sizes, from its manifest (set by the build before rendering). */
export type StillSizes = Record<string, [number, number][]>;
let stillSizes: StillSizes = {};
export const setStillSizes = (s: StillSizes) => {
  stillSizes = s;
};
const stillSize = (c: Chapter, i: number) => stillSizes[c.sequence]?.[i] ?? [1280, c.device === "wide" ? 720 : 800];

function moments(c: Chapter) {
  return c.moments
    .map(
      (m, i) => `
      <li class="moment" data-moment="${i}">
        <img class="still" src="sequences/${c.sequence}/still-${i + 1}.webp" width="${stillSize(c, i)[0]}" height="${stillSize(c, i)[1]}" alt="${esc(m.alt)}" loading="lazy" decoding="async">
        <div class="moment-copy">
          <p class="moment-step" aria-hidden="true">${i + 1}</p>
          <h3>${esc(m.title)}</h3>
          <p>${esc(m.text)}</p>
        </div>
      </li>`
    )
    .join("");
}

function checker() {
  return `
  <section class="try" id="try" aria-labelledby="try-title">
    <h3 id="try-title" class="try-title">Try it on your own text</h3>
    <p class="try-note">The tool’s own rules, copied from its source and running in your browser. Nothing is sent anywhere.</p>
    <div class="try-card" data-checker>
      <div class="segmented" role="tablist" aria-label="What are you checking?">
        <button type="button" role="tab" aria-selected="true" data-kind="phishing">Email</button>
        <button type="button" role="tab" aria-selected="false" tabindex="-1" data-kind="sms">Text</button>
        <button type="button" role="tab" aria-selected="false" tabindex="-1" data-kind="listing">Listing</button>
        <button type="button" role="tab" aria-selected="false" tabindex="-1" data-kind="link">Link</button>
      </div>
      <label class="visually-hidden" for="try-input">Text to check</label>
      <textarea id="try-input" class="try-input" rows="5" spellcheck="false" placeholder="Paste an email to check" disabled></textarea>
      <div class="try-result" aria-live="polite">
        <p class="try-empty">Paste something, or <button type="button" class="link-button" data-sample disabled>try a sample</button>.</p>
      </div>
      <noscript><p class="try-empty">The checker needs JavaScript. The recording above shows the tool itself.</p></noscript>
    </div>
  </section>`;
}

function chapter(c: Chapter, index: number) {
  return `
<article class="chapter" id="${c.id}" data-chapter="${c.sequence}" data-device="${c.device}" aria-labelledby="${c.id}-title">
  <header class="chapter-head">
    <p class="eyebrow"><span class="chapter-index" aria-hidden="true">0${index + 1}</span> ${esc(c.name)} · ${esc(c.year)}</p>
    <h2 id="${c.id}-title" class="chapter-title">${esc(c.headline)}</h2>
    <p class="chapter-lede">${esc(c.lede)}</p>
    <p class="chapter-links">${c.links.map((l) => link(l.label, l.href)).join("")}</p>
  </header>
  <div class="stage-track">
  <div class="stage" data-stage>
    <div class="device device-${c.device}" data-device-frame>
      <div class="screen"><canvas class="sequence" data-sequence="${c.sequence}" aria-hidden="true"></canvas></div>
    </div>
    <div class="side">
      <ol class="moments">${moments(c)}</ol>
      ${
        c.sequence === "traffic"
          ? `<dl class="counts" data-counts aria-hidden="true"><div><dt>Cars</dt><dd data-car>0</dd></div><div><dt>Buses</dt><dd data-bus>0</dd></div><div><dt>Trucks</dt><dd data-truck>0</dd></div></dl>`
          : ""
      }
    </div>
  </div>
  </div>
  <p class="recorded">${esc(c.recorded)}${c.credit ? ` ${esc(c.credit)}` : ""}</p>
  ${c.sequence === "scam" ? checker() : ""}
  <p class="limit"><span class="limit-label">Known limitation</span> ${esc(c.limitation)}</p>
</article>`;
}

function threadSection(id: string, from: string[], to: string[], line: string, kind: "chips" | "boxes") {
  const chips = from
    .map((f, i) => `<span class="thread-chip" data-i="${i}"><span class="from">${esc(f)}</span><span class="to">${esc(to[i] ?? "")}</span></span>`)
    .join("");
  return `
<section class="thread thread-${kind}" id="${id}" aria-label="${esc(line)}">
  <div class="thread-stage">
    <div class="thread-chips" aria-hidden="true">${chips}</div>
    <p class="thread-line">${esc(line)}</p>
  </div>
</section>`;
}

function alsoBuilt() {
  return `
<section class="section" id="more" aria-labelledby="more-title">
  <h2 id="more-title" class="section-title">Also built</h2>
  <ul class="more-list">${more
    .map(
      (p) => `
    <li>
      <h3>${esc(p.title)}</h3>
      <p class="meta">${esc([p.kind, p.year].filter(Boolean).join(", "))}${p.note ? ` · ${esc(p.note)}` : ""}</p>
      <p>${esc(p.summary)}</p>
      ${p.links ? `<p class="more-links">${p.links.map((l) => link(l.label, l.href)).join("")}</p>` : ""}
    </li>`
    )
    .join("")}
  </ul>
</section>`;
}

function experience() {
  const role = roles
    .map(
      (r) => `
    <li class="entry">
      <p class="when">${esc(r.period)}</p>
      <div>
        <h3>${esc(r.title)}, ${esc(r.organization)}</h3>
        <p class="meta">${esc([r.about, r.place].filter(Boolean).join(" · "))}</p>
        <ul class="points">${r.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </div>
    </li>`
    )
    .join("");
  return `
<section class="section" id="experience" aria-labelledby="experience-title">
  <h2 id="experience-title" class="section-title">Experience</h2>
  <ol class="entries">${role}
    <li class="entry">
      <p class="when">${esc(education.date)}</p>
      <div>
        <h3>${esc(education.degree)}</h3>
        <p class="meta">${esc(education.school)} · ${esc(education.place)}</p>
        <p class="coursework">Coursework: ${esc(education.coursework)}</p>
      </div>
    </li>
  </ol>
</section>`;
}

function aboutSection() {
  return `
<section class="section" id="about" aria-labelledby="about-title">
  <h2 id="about-title" class="section-title">About</h2>
  <div class="about-grid">
    <div>
      <p class="about-text">${esc(about.interests)}</p>
      <h3 class="small-title">How I work</h3>
      <ul class="approach">${about.approach.map((a) => `<li>${esc(a.point)} <span class="from">From ${esc(a.from)}.</span></li>`).join("")}</ul>
    </div>
    <div>
      <h3 class="small-title">Skills</h3>
      <dl class="skills">${about.skills.map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(", ")}</dd></div>`).join("")}</dl>
      <p class="also-used">Also: ${about.alsoUsed.map(esc).join(", ")}.</p>
    </div>
  </div>
</section>`;
}

function contact() {
  return `
<section class="contact" id="contact" aria-labelledby="contact-title">
  <h2 id="contact-title" class="visually-hidden">Contact</h2>
  <p class="contact-line">${esc(site.availability)}</p>
  <p class="contact-email"><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
  <p class="contact-actions">
    <a class="pill primary" href="mailto:${esc(site.email)}">Write an email</a>
    <button type="button" class="pill" data-copy="${esc(site.email)}" hidden>Copy email address</button>
  </p>
  <p class="copy-status" role="status" data-copy-status></p>
  <p class="contact-links">${link("LinkedIn", site.linkedin)}${link("GitHub", site.github)}<a class="text-link" href="${esc(site.resume)}" download>Resume (PDF)</a></p>
</section>`;
}

export function renderBody() {
  return `
<a class="skip" href="#work">Skip to the work</a>
<header class="bar" data-bar>
  <div class="bar-inner">
    <a class="wordmark" href="#top">${esc(site.name)}</a>
    <nav aria-label="Main">
      <ul class="nav">
        <li><a href="#work">Work</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
    <a class="pill small" href="${esc(site.resume)}" download>Resume</a>
  </div>
</header>
<main>
  ${opening()}
  <div id="work" class="work">
    <h2 class="visually-hidden">Work</h2>
    ${chapter(chapters[0], 0)}
    ${threadSection("thread-1", thread.phrases, thread.skills, thread.toResume, "chips")}
    ${chapter(chapters[1], 1)}
    ${threadSection("thread-2", thread.skills, ["", "", "", ""], thread.toTraffic, "boxes")}
    ${chapter(chapters[2], 2)}
  </div>
  ${alsoBuilt()}
  ${experience()}
  ${aboutSection()}
  ${contact()}
</main>
<footer class="foot">
  <p>${esc(site.name)}, ${esc(site.role.toLowerCase())} in ${esc(site.city)}, ${esc(site.region)}.</p>
  <a class="text-link" href="#top">Back to top</a>
</footer>`;
}

export function renderHead() {
  return `
<title>${esc(site.name)}: ${esc(site.title.replace(/\.$/, ""))}</title>
<meta name="description" content="${esc(site.description)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="${esc(site.url)}/">
<meta property="og:title" content="${esc(site.name)}: ${esc(site.title)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(site.url)}/">`;
}
