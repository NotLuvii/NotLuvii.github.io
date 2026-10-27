import { describe, expect, it } from "vitest";
import { chapters, openingWords, roles, site } from "../src/content";
import { esc, renderBody, renderHead } from "../src/render";

const body = renderBody();

describe("the page as written at build time", () => {
  it("has one h1, and the chapters in order, each an article with its h2", () => {
    expect(body.match(/<h1\b/g)).toHaveLength(1);
    const ids = [...body.matchAll(/<article class="chapter" id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(chapters.map((c) => c.id));
    for (const c of chapters) expect(body).toContain(`<h2 id="${c.id}-title" class="chapter-title">${esc(c.headline)}</h2>`);
  });

  it("reads without JavaScript: every moment is a still with its caption", () => {
    for (const c of chapters) {
      for (const [i, m] of c.moments.entries()) {
        expect(body).toContain(`src="sequences/${c.sequence}/still-${i + 1}.webp"`);
        expect(body).toContain(`alt="${esc(m.alt)}"`);
        expect(body).toContain(`<h3>${esc(m.title)}</h3>`);
        expect(body).toContain(`<p>${esc(m.text)}</p>`);
      }
      expect(body).toContain(esc(c.limitation));
    }
  });

  it("keeps every role and its points", () => {
    for (const r of roles) {
      expect(body).toContain(`${esc(r.title)}, ${esc(r.organization)}`);
      for (const p of r.points) expect(body).toContain(esc(p));
    }
  });

  it("opens outside links in a new tab, and says so", () => {
    const external = [...body.matchAll(/<a [^>]*href="https?:[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]).filter((a) => !a.includes("mailto"));
    expect(external.length).toBeGreaterThan(8);
    for (const a of external) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener"');
      expect(a).toContain("(opens in a new tab)");
    }
  });

  it("has the contact details and the resume", () => {
    expect(body).toContain(`mailto:${site.email}`);
    expect(body).toContain(`href="${site.resume}" download`);
    expect(body).toContain(esc(site.availability));
  });

  it("describes the page for search and sharing", () => {
    const head = renderHead();
    expect(head).toContain("<title>Luvneet Bamrah: Software that shows its work</title>");
    expect(head).toContain(esc(site.description));
  });
});

describe("the opening's words", () => {
  it("are all drawn, as decoration a screen reader skips", () => {
    // Three bands (above, beside and below the copy), each hidden from screen readers.
    expect(body.match(/<div class="opening-words (above|beside|below)" aria-hidden="true">/g)).toHaveLength(3);
    expect(body.match(/<span class="word/g)).toHaveLength(openingWords.length);
    expect(body.match(/<span class="word on-phone"/g)).toHaveLength(openingWords.filter((w) => w.phone).length);
  });
});
