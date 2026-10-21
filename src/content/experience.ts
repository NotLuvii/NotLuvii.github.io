/**
 * Work history, education, skills, and what About says about interests and approach, from the resume
 * (public/Luvneet_Bamrah_Resume.pdf). Figures are quoted in the resume's own words.
 */
export type Role = {
  organization: string;
  /** One line on what the organization or product is, where the resume says. */
  about?: string;
  title: string;
  period: string;
  place: string;
  points: string[];
};

export const roles: Role[] = [
  {
    organization: "AiKnod",
    about: "AI-powered education platform",
    title: "Developer",
    period: "Feb 2026 – Aug 2026",
    place: "Remote",
    points: [
      "Built tutoring, assessment and personalized-learning features in React and TypeScript, on asynchronous REST APIs for misconception detection, concept recommendations and AI feedback.",
      "Implemented multi-step assessment logic: answer validation, follow-up questions and correctness tracking.",
      "Diagnosed defects across the UI, API integrations and business logic, adding error handling and polling that improved stability.",
    ],
  },
  {
    organization: "SafeTrack",
    about: "University rideshare management, built by a team",
    title: "Front end developer",
    period: "Sep 2024 – Apr 2025",
    place: "Fredericton, NB",
    points: [
      "Built real-time tracking and monitoring workflows on AWS API Gateway WebSockets, streaming live driver and location updates.",
      "Increased route data accuracy by 75% through systematic data validation and alignment of system logic.",
      "Turned safety and stakeholder requirements into functional specifications and components.",
    ],
  },
  {
    organization: "Immensa Tech",
    title: "Developer",
    period: "Jan 2024 – May 2024",
    place: "Remote",
    points: [
      "Replaced a manual email report with scheduled SQL notifications and Databricks outputs built into generated reports.",
      "Wrote SQL to check report figures against source systems and trace discrepancies to their root cause.",
      "Reduced delivery delays by 50% by optimizing front-end workflows and presenting data more clearly.",
    ],
  },
];

export const education = {
  school: "University of New Brunswick",
  degree: "BSc, Software Engineering",
  date: "May 2025",
  place: "Fredericton, NB",
  coursework: ["System analysis and project management", "statistics", "operating systems", "cybersecurity", "discrete mathematics"],
};

export type TimelineEntry = { year: string; showYear: boolean } & ({ kind: "role"; role: Role } | { kind: "education"; education: typeof education });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Feb 2026 – Aug 2026" or "May 2025" → its start, as a sortable number (2026.01). */
function start(when: string): number {
  const [month, year] = when.split(" ");
  return Number(year) + MONTHS.indexOf(month) / 100;
}

/**
 * Experience as a timeline: the roles and the degree, newest first by when each began. Each entry
 * carries its start year; the year is shown once, on the first entry that has it.
 */
export function timeline(): TimelineEntry[] {
  const entries = [
    ...roles.map((role) => ({ kind: "role" as const, role, at: start(role.period) })),
    { kind: "education" as const, education, at: start(education.date) },
  ].sort((a, b) => b.at - a.at);
  return entries.map(({ at, ...entry }, i) => {
    const year = String(Math.floor(at));
    const previous = i > 0 ? String(Math.floor(entries[i - 1].at)) : null;
    return { ...entry, year, showYear: year !== previous };
  });
}

/** A line on how I work, under the intro. It says what I do, not where: no company names. */
/** What I'm interested in: the line on my work, and the personal projects listed under More projects. */
export const interests =
  "Most of my work sits where software meets data: validating it, finding the defects that let it go wrong, and writing things down so a fix stays fixed. Outside work I build my own tools: a vehicle counter for traffic video, an F1 lap-time predictor, a stock tracker with charts and a price prediction, and a music stem separator.";

/**
 * How I work, each point taken from something on this site that shows it: the reports work in
 * Experience (named here without the company, as About names none), and three case studies (linked
 * by slug).
 */
export const approach: { point: string; from: string; slug?: string }[] = [
  { point: "Check figures against their source, and trace a discrepancy to its root cause.", from: "work on reports" },
  { point: "Show the reasons behind a score, so it can be checked rather than trusted.", from: "the scam detection tool", slug: "scam-detection" },
  { point: "Make missing information visible instead of leaving a blank.", from: "the inquiry app", slug: "immensa-inquiry-app" },
  { point: "Add tests when I come back to code.", from: "Resume Analyzer", slug: "resume-analyzer" },
];

/**
 * Skills in four groups, each tied to where it was used. Only what the resume lists or a linked
 * repository shows.
 */
export const skills: { group: string; items: string[] }[] = [
  {
    group: "Frontend",
    items: ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
  },
  {
    group: "Data and automation",
    items: ["SQL", "MySQL", "Python", "Databricks", "Power BI", "Pandas", "NumPy"],
  },
  {
    group: "APIs and cloud",
    items: ["REST APIs", "Node.js", "Express", "Flask", "AWS API Gateway", "WebSockets"],
  },
  {
    group: "Engineering practices",
    items: ["Git", "testing and debugging", "root-cause analysis", "requirements gathering"],
  },
];

/** Languages and libraries outside the four groups, from the resume and the linked repositories. */
export const alsoUsed = ["Java", "Kotlin (Android)", "C#", "C++", "C", "TensorFlow/Keras", "OpenCV"];
