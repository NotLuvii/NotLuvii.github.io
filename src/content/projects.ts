/**
 * Every project, ordered by how close it is to quality and data work. Descriptions come from the
 * résumé, or from the project briefs where the résumé doesn't describe a project. Before
 * publishing, point each `href` at its repository (they currently go to the GitHub profile).
 */
import type { VisualKey } from "@/components/visuals/keys";

export type Relevance = "quality" | "data" | "range";

export const RELEVANCE: Record<Relevance, { rank: number; label: string }> = {
  quality: { rank: 1, label: "Closest to quality work" },
  data: { rank: 2, label: "Data and analysis" },
  range: { rank: 3, label: "Range" },
};

export type Project = {
  slug: string;
  title: string;
  /** A word or two above the title, like a product category. */
  kicker: string;
  summary: string;
  /** Why it matters for quality and manufacturing software work. */
  why: string;
  figure?: { value: string; label: string; source: string };
  stack?: string[];
  visual: VisualKey;
  relevance: Relevance;
  /** Tile width in the grid: wide takes two of three columns, narrow one, half splits a row. */
  size: "wide" | "narrow" | "half";
  href: string;
};

const GITHUB = "https://github.com/NotLuvii";

export const projects: Project[] = [
  {
    slug: "dashboards",
    title: "Monitoring and reporting dashboards",
    kicker: "Monitoring",
    summary:
      "Interactive dashboards with clearer monitoring views and better system transparency, plus root-cause analysis on data display issues and preventative fixes.",
    why: "Similar in purpose to a shop-floor quality dashboard: show the state of a system so problems are caught early.",
    figure: { value: "40%", label: "less troubleshooting effort", source: "Résumé, Real-Time Monitoring & Reporting Dashboards" },
    visual: "dashboard",
    relevance: "quality",
    size: "wide",
    href: GITHUB,
  },
  {
    slug: "sensors",
    title: "Sensor management system",
    kicker: "Equipment health",
    summary:
      "Centralized sensor health visibility and automated fault detection, with requirements defined for role-based access and real-time status views.",
    why: "Equipment health, fault detection and access by role: the same concerns as keeping test stations and gauges in service.",
    visual: "sensors",
    relevance: "quality",
    size: "narrow",
    href: GITHUB,
  },
  {
    slug: "scam-detection",
    title: "Scam detection tool",
    kicker: "Automated checks",
    summary:
      "Automated risk scoring for phishing and online fraud across suspicious messages, URLs and listings, with a Node.js component that fetches and parses external pages.",
    why: "Scoring messy inputs automatically, case by case: the shape of an automated inspection.",
    stack: ["Node.js", "JavaScript"],
    visual: "risk",
    relevance: "quality",
    size: "narrow",
    href: GITHUB,
  },
  {
    slug: "immensa",
    title: "Immensa inquiry app",
    kicker: "Android",
    summary:
      "An Android application for 3D-printing sales inquiries that keeps customer requirements, measurements, reference images and testing information in one record, with currency conversion for quotes.",
    why: "One structured record per job, from the first measurement to the quote.",
    stack: ["Android", "Java"],
    visual: "inquiry",
    relevance: "quality",
    size: "wide",
    href: GITHUB,
  },
  {
    slug: "f1-race-analysis",
    title: "F1 race analysis",
    kicker: "Telemetry",
    summary: "A data-driven Formula 1 application that turns race telemetry into clear visual comparisons of driver performance.",
    why: "Noisy measurement data, aligned onto a common distance and timing base so comparisons are fair.",
    stack: ["Python", "Pandas", "NumPy"],
    visual: "telemetry",
    relevance: "data",
    size: "half",
    href: GITHUB,
  },
  {
    slug: "resume-analyzer",
    title: "Resume Analyzer",
    kicker: "Scoring",
    summary:
      "A Python application that scores how well a resume fits a job description, identifies the skills it contains and presents the results in interactive visualizations.",
    why: "Checking free-form input against a specification.",
    stack: ["Python"],
    visual: "relevance",
    relevance: "data",
    size: "half",
    href: GITHUB,
  },
  {
    slug: "portfolio-prediction",
    title: "Stock portfolio and prediction",
    kicker: "Markets",
    summary: "A web application for tracking investments, visualizing market information and experimenting with prediction models.",
    why: "Charts that show a forecast as a range, never as a certainty.",
    stack: ["JavaScript", "React", "Python"],
    visual: "markets",
    relevance: "data",
    size: "half",
    href: GITHUB,
  },
  {
    slug: "ai-music",
    title: "AI Music",
    kicker: "Audio and machine learning",
    summary:
      "A music application built around stem separation, pulling a finished track apart into vocals, drums, bass and the rest, with Spotify integration.",
    why: "Signal processing where the output has to be good enough to use.",
    stack: ["Python", "Machine learning", "Spotify Web API"],
    visual: "stems",
    relevance: "range",
    size: "half",
    href: GITHUB,
  },
];
