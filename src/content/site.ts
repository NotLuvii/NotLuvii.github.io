/**
 * Identity, links and navigation. Everything a visitor reads lives in /src/content: edit the words
 * there, not in components. Facts here come from the resume (public/Luvneet_Bamrah_Resume.pdf).
 */
export const site = {
  name: "Luvneet Bamrah",
  role: "Software engineer",
  headline: "Software engineer building reliable web apps and data tools.",
  intro: "I build front ends in React and TypeScript, and write SQL and Python to automate reports and check data against its source.",
  description:
    "Luvneet Bamrah is a software engineer in Fredericton, New Brunswick, building web apps in React and TypeScript and data tools in SQL and Python.",

  location: { city: "Fredericton", region: "New Brunswick", regionShort: "NB", country: "Canada" },

  email: "luvneetbamrah@gmail.com",
  github: { handle: "NotLuvii", url: "https://github.com/NotLuvii" },
  linkedin: { handle: "luvneet-bamrah-157281214", url: "https://www.linkedin.com/in/luvneet-bamrah-157281214" },
  /** Served from /public. Set to null (and delete the file) to stop publishing the resume. */
  resume: "/Luvneet_Bamrah_Resume.pdf" as string | null,

  /** This site's address on GitHub Pages: canonical URLs, the sitemap and link previews. */
  url: "https://notluvii.github.io",

  /** One line in the contact section, the same roles as the headline. Set to null to hide it. */
  availability: "Open to software engineering roles building web apps and data tools." as string | null,
} as const;

/**
 * Section links, in page order. Root-relative so they work from the case-study pages too; on the
 * home page the browser treats them as in-page jumps.
 */
export const nav = [
  { href: "/#projects", id: "projects", label: "Projects" },
  { href: "/#experience", id: "experience", label: "Experience" },
  { href: "/#skills", id: "skills", label: "Skills" },
  { href: "/#contact", id: "contact", label: "Contact" },
] as const;
