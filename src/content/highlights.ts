/**
 * "Get the highlights": one card per strength, each backed by a line from the résumé.
 * `art` picks the small drawing on the card; `tone` alternates the card colour.
 */
export type HighlightArt = "trace" | "schedule" | "route" | "live" | "steps" | "docs";

export type Highlight = { title: string; body: string; source: string; art: HighlightArt; tone: "light" | "dark" };

export const highlights: Highlight[] = [
  {
    title: "Data you can trace.",
    body: "At Immensa Tech I wrote SQL to validate data and trace discrepancies between source systems and reports back to their root cause.",
    source: "Immensa Tech",
    art: "trace",
    tone: "dark",
  },
  {
    title: "Reports that run themselves.",
    body: "I replaced a manual email reporting process with scheduled SQL notifications and Databricks outputs built into the generated reports.",
    source: "Immensa Tech",
    art: "schedule",
    tone: "light",
  },
  {
    title: "Validation built in.",
    body: "At SafeTrack, systematic data validation and better-aligned system logic made route data far more accurate.",
    source: "SafeTrack",
    art: "route",
    tone: "light",
  },
  {
    title: "Live, not later.",
    body: "Real-time tracking and monitoring for a university rideshare service, streaming driver and location updates over AWS API Gateway WebSockets.",
    source: "SafeTrack",
    art: "live",
    tone: "dark",
  },
  {
    title: "Every step checked.",
    body: "At AiKnod I built and tested multi-step assessment workflows with answer validation, follow-up questions and correctness tracking.",
    source: "AiKnod",
    art: "steps",
    tone: "light",
  },
  {
    title: "Written down, handed over.",
    body: "Maintenance steps, usage instructions and escalation procedures at Immensa Tech, and handoff notes at SafeTrack, so issues could be reproduced and resolved the same way every time.",
    source: "Immensa Tech and SafeTrack",
    art: "docs",
    tone: "light",
  },
];
