/**
 * The evidence matrix: what quality and manufacturing software roles commonly ask for, traced to
 * where it has actually been done. Everything marked "work" or "project" comes from the résumé or
 * from this repository.
 *
 * Honest by default. If you have more experience with a "learning" row than shown here, edit it,
 * and if a row stops being true, change its status rather than its wording.
 */
export type EvidenceStatus = "work" | "project" | "learning";

export const STATUS: Record<EvidenceStatus, { label: string; meaning: string }> = {
  work: { label: "At work", meaning: "Done in a professional role" },
  project: { label: "In projects", meaning: "Done in my own projects" },
  learning: { label: "Learning", meaning: "Not done yet, and said plainly" },
};

export type EvidenceRow = {
  requirement: string;
  evidence: string[];
  status: EvidenceStatus;
};

export const evidence: EvidenceRow[] = [
  {
    requirement: "Web applications in React and TypeScript",
    evidence: [
      "AiKnod: core features of an AI education platform in React and TypeScript.",
      "SafeTrack: real-time tracking and monitoring workflows on AWS API Gateway WebSockets.",
    ],
    status: "work",
  },
  {
    requirement: "SQL and data validation",
    evidence: [
      "Immensa Tech: wrote SQL to validate data and trace discrepancies between source systems and reports to their root cause.",
      "SafeTrack: raised route data accuracy by 75% through systematic validation and aligning system logic.",
    ],
    status: "work",
  },
  {
    requirement: "Automating manual work",
    evidence: [
      "Immensa Tech: replaced a manual email reporting process with scheduled SQL notifications and Databricks outputs built into generated reports.",
    ],
    status: "work",
  },
  {
    requirement: "Multi-step workflows with validation",
    evidence: [
      "AiKnod: built and tested multi-step assessment workflows with answer validation, follow-up questions and correctness tracking.",
    ],
    status: "work",
  },
  {
    requirement: "APIs and integration between systems",
    evidence: [
      "AiKnod: asynchronous REST APIs across several services, with error handling and polling that improved stability.",
      "SafeTrack: live driver and location updates over AWS API Gateway WebSockets.",
    ],
    status: "work",
  },
  {
    requirement: "Turning stakeholder requirements into specifications",
    evidence: [
      "SafeTrack: translated safety and stakeholder requirements into functional specifications and maintainable components.",
      "Sensor management system (project): defined the requirements for role-based access and real-time status views.",
    ],
    status: "work",
  },
  {
    requirement: "Troubleshooting and root-cause analysis",
    evidence: [
      "AiKnod: diagnosed defects across UI components, API integrations and business logic.",
      "Monitoring dashboards (project): root-cause analysis on data display issues, with preventative fixes.",
    ],
    status: "work",
  },
  {
    requirement: "Documentation, procedures and handoff",
    evidence: [
      "Immensa Tech: maintenance steps, usage instructions and escalation procedures that cut follow-up questions.",
      "SafeTrack: workflow, implementation and handoff notes so issues could be reproduced and escalated consistently.",
    ],
    status: "work",
  },
  {
    requirement: "Automated reporting",
    evidence: ["Immensa Tech: scheduled SQL notifications, with Databricks outputs built into generated reports."],
    status: "work",
  },
  {
    requirement: "Dashboards and Power BI",
    evidence: [
      "Real-time monitoring and reporting dashboards (project), which cut troubleshooting effort by 40%.",
      "Power BI is in my skill set; I haven’t used it in a professional role yet.",
    ],
    status: "project",
  },
  {
    requirement: "Next.js",
    evidence: ["This site is a Next.js application."],
    status: "project",
  },
  {
    requirement: "Python for data work and automation",
    evidence: [
      "Resume Analyzer, a Python application.",
      "Pandas and NumPy are part of my toolkit.",
    ],
    status: "project",
  },
  {
    requirement: "Version control and CI",
    evidence: [
      "Git throughout.",
      "This site’s repository has a GitHub Actions workflow set up to run type checks, linting, tests and a production build on every push.",
    ],
    status: "project",
  },
  {
    requirement: "Statistical process control and inspection data",
    evidence: ["Statistics coursework at the University of New Brunswick. Not yet applied to production or inspection data."],
    status: "learning",
  },
  {
    requirement: "Microsoft Power Apps and Power Automate",
    evidence: ["Not used yet. Power BI, also part of the Power Platform, is in my skill set."],
    status: "learning",
  },
  {
    requirement: "Azure",
    evidence: ["Not used yet. My cloud work so far is on AWS: API Gateway and WebSockets."],
    status: "learning",
  },
  {
    requirement: "ISO 9001 quality systems, MES and ERP",
    evidence: ["No hands-on work yet."],
    status: "learning",
  },
];
