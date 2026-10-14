/**
 * Roles, newest first, taken from the résumé. Bullets are the ones most relevant to quality and
 * manufacturing software. Measured results live in content/numbers.ts.
 */
export type Role = {
  organization: string;
  title: string;
  period: string;
  place: string;
  points: string[];
  figure?: { value: string; label: string };
};

export const roles: Role[] = [
  {
    organization: "AiKnod",
    title: "Developer",
    period: "Feb – Aug 2026",
    place: "Remote",
    points: [
      "Built core features of an AI-powered education platform in React and TypeScript: tutoring, assessments and personalized learning.",
      "Built and tested the logic for multi-step assessment workflows, including answer validation, follow-up questions and correctness tracking.",
      "Integrated asynchronous REST APIs across several services, and diagnosed defects across UI components, integrations and business logic, adding the error handling and polling that improved stability.",
    ],
  },
  {
    organization: "SafeTrack",
    title: "Front end developer",
    period: "Sep 2024 – Apr 2025",
    place: "Fredericton, NB",
    points: [
      "Built real-time tracking and monitoring workflows on AWS API Gateway WebSockets for a university rideshare service.",
      "Translated safety and stakeholder requirements into functional specifications and maintainable components.",
      "Documented workflows, implementation details and handoff notes so issues could be reproduced, escalated and resolved consistently.",
    ],
    figure: { value: "75%", label: "increase in route data accuracy through systematic data validation" },
  },
  {
    organization: "Immensa Tech",
    title: "Developer",
    period: "Jan – May 2024",
    place: "Remote",
    points: [
      "Automated a manual email reporting process with scheduled SQL notifications and Databricks outputs built into generated reports.",
      "Wrote SQL to validate data and trace discrepancies between source systems and reports to their root cause.",
      "Authored maintenance steps, usage instructions and escalation procedures that reduced follow-up clarification requests.",
    ],
    figure: { value: "50%", label: "reduction in delivery delays, from optimizing front-end workflows and presenting data more clearly" },
  },
];

export const education = {
  school: "University of New Brunswick",
  degree: "BSc, Software Engineering",
  date: "May 2025",
  coursework: ["System analysis and project management", "Statistics", "Operating systems", "Cybersecurity", "Discrete mathematics"],
};

/** Toolkit: the résumé's skills section, plus Next.js (this site is built in it). */
export const toolkit: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL", "C#", "Java", "C++", "C"] },
  { group: "Web and services", items: ["React", "Next.js", "Node.js", "REST APIs", "AWS API Gateway", "WebSockets"] },
  { group: "Data and reporting", items: ["MySQL", "Databricks", "Power BI", "Pandas", "NumPy", "Data validation", "Automated reporting"] },
  { group: "Practice", items: ["Git", "Testing and debugging", "Root-cause analysis", "Requirements gathering", "Technical documentation"] },
];
