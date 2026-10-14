import { ARTIFACT } from "@/lib/mode";

/**
 * Identity, links and navigation. Everything a visitor reads lives in /src/content: edit here,
 * not in components. This portfolio is tailored to quality and manufacturing software roles and
 * stands on its own, the way a tailored résumé does.
 */
export const site = {
  name: "Luvneet Bamrah",
  role: "Software engineer",
  headline: "Software that checks out.",
  intro:
    "I build tools that validate data, automate reporting and show what’s happening in real time, with SQL, Python, TypeScript and React.",
  description:
    "Luvneet Bamrah is a software engineer in Fredericton, New Brunswick, building data validation, automated reporting and real-time monitoring tools.",

  location: { city: "Fredericton", region: "New Brunswick", regionShort: "NB", country: "Canada" },

  email: "luvneetbamrah@gmail.com",
  github: { handle: "NotLuvii", url: "https://github.com/NotLuvii" },
  linkedin: { handle: "Luvneet Bamrah", url: "https://www.linkedin.com/in/luvneet-bamrah" },
  /**
   * Set to null (and delete the file in /public) if you'd rather not publish your résumé. The hosted
   * claude.ai version can't serve downloads, so it leaves the résumé out.
   */
  resume: (ARTIFACT ? null : "/Luvneet_Bamrah_Resume.pdf") as string | null,

  /** This site's address, on GitHub Pages. Used for canonical URLs, the sitemap and link previews. */
  url: "https://notluvii.github.io",

  /** Shown in the contact section. Set to null to hide. */
  availability: "Open to quality, manufacturing and data software roles.",
} as const;

export const nav: { href: `#${string}`; label: string }[] = [
  { href: "#highlights", label: "Highlights" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];
