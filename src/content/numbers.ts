/** The measured results on the résumé. Nothing else on the page is presented as a figure. */
export type Stat = { value: number; suffix: string; label: string; from: string; footnote: number };

export const numbers: Stat[] = [
  {
    value: 75,
    suffix: "%",
    label: "increase in route data accuracy through systematic data validation",
    from: "SafeTrack",
    footnote: 1,
  },
  {
    value: 50,
    suffix: "%",
    label: "reduction in delivery delays from optimizing front-end workflows and presenting data more clearly",
    from: "Immensa Tech",
    footnote: 1,
  },
  {
    value: 40,
    suffix: "%",
    label: "less troubleshooting effort from clearer monitoring views and system transparency",
    from: "Monitoring and reporting dashboards",
    footnote: 1,
  },
];

/** Shown at the foot of the page, numbered, the way Apple prints its footnotes. */
export const footnotes = [
  "Figures as stated on my résumé, for the role or project named under each one.",
  "Project drawings are illustrations of each project, not screenshots.",
];
