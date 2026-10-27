/**
 * Everything the story says, in one place. Every fact comes from Luvneet's resume (the previous site's
 * content files) or from the app repos; nothing here is invented. The page's HTML is generated from this
 * at build time (src/render.ts), so it is all readable without JavaScript.
 */

const GH = "https://github.com/NotLuvii";
const BRANCH = "redesign-2026";

export const site = {
  name: "Luvneet Bamrah",
  role: "Software engineer",
  city: "Fredericton",
  region: "New Brunswick",
  regionShort: "NB",
  email: "luvneetbamrah@gmail.com",
  github: `${GH}`,
  linkedin: "https://www.linkedin.com/in/luvneet-bamrah-157281214",
  resume: "Luvneet_Bamrah_Resume.pdf",
  url: "https://notluvii.github.io",
  title: "Software that shows its work.",
  lede: "Three tools I built that explain each answer they give. Scroll to see how.",
  description:
    "Luvneet Bamrah, a software engineer in Fredericton, New Brunswick. Three tools that explain each answer they give: a scam detector, a resume analyzer and a vehicle counter.",
  availability: "Open to software engineering roles building web apps and data tools.",
};

export type Moment = { title: string; text: string; still: string; alt: string };

export type Chapter = {
  id: string;
  sequence: string;
  name: string;
  year: string;
  headline: string;
  lede: string;
  device: "laptop" | "wide";
  moments: [Moment, Moment, Moment];
  recorded: string;
  links: { label: string; href: string }[];
  limitation: string;
  credit?: string;
};

export const chapters: Chapter[] = [
  {
    id: "scam-detection",
    sequence: "scam",
    name: "Scam detection",
    year: "2026",
    headline: "It tells you why.",
    lede: "Paste a suspicious email, text message, listing or link. Rule-based checks score it from 0 to 100 and list every warning sign behind the score.",
    device: "laptop",
    moments: [
      {
        title: "The message",
        text: "The sample phishing email from the tool’s README, pasted in.",
        still: "scam-1",
        alt: "The scam detection tool with the README’s sample phishing email pasted into the Email box.",
      },
      {
        title: "The verdict",
        text: "100 out of 100: high risk.",
        still: "scam-2",
        alt: "The result: 100 out of 100, High risk, and the guidance to treat it as suspicious, with a full red meter.",
      },
      {
        title: "The reasons",
        text: "Each rule that matched, in its own words: urgent wording, a generic greeting, a lookalike domain and a request to click or verify.",
        still: "scam-3",
        alt: "Five warning signs listed in the tool’s words: two urgency phrases, a generic greeting, the text paypal-secure, and a request to click or verify.",
      },
    ],
    recorded: `Recorded from the tool’s ${BRANCH} branch, October 2026.`,
    links: [
      { label: "Code on GitHub", href: `${GH}/Fraud-Detection-Tool/tree/${BRANCH}` },
      { label: "Try it below", href: "#try" },
    ],
    limitation:
      "Rule-based only: keyword and pattern lists, with no machine learning or live threat data. New wording can slip through, and a safe message that uses an urgent phrase can be flagged.",
  },
  {
    id: "resume-analyzer",
    sequence: "resume",
    name: "Resume Analyzer",
    year: "2024",
    headline: "It shows what’s missing.",
    lede: "Paste a job posting and add a resume. It scores the weighted share of the posting’s skills the resume mentions, and shows which it shares and which are missing.",
    device: "laptop",
    moments: [
      {
        title: "The posting and the resume",
        text: "A sample posting, and my own resume as a PDF.",
        still: "resume-1",
        alt: "Resume Analyzer with a sample software developer posting pasted in and a resume PDF chosen.",
      },
      {
        title: "The score",
        text: "60%: the share of the posting’s skills the resume mentions, weighted by how often the posting names each one.",
        still: "resume-2",
        alt: "A relevance score of 60 percent with its bar and a one-line explanation.",
      },
      {
        title: "What’s missing",
        text: "Each skill the posting names. The ones the resume shares are marked; AWS, Docker, Kubernetes and REST are missing.",
        still: "resume-3",
        alt: "The posting’s skills as chips: JavaScript, Python, React, SQL, communication and teamwork marked as in the resume; AWS, Docker, Kubernetes and REST shown as missing.",
      },
    ],
    recorded: `Recorded from the app’s ${BRANCH} branch, running locally, October 2026. The posting is a sample written for the demo.`,
    links: [{ label: "Code on GitHub", href: `${GH}/Resume-Analyze/tree/${BRANCH}` }],
    limitation:
      "Text is split into single words before matching, so skills with spaces or punctuation, like Power BI, C++ and scikit-learn, can’t match yet.",
  },
  {
    id: "vehicle-counter",
    sequence: "traffic",
    name: "Vehicle counter",
    year: "2025",
    headline: "It shows what it counted.",
    lede: "YOLOv8 finds the cars, buses and trucks in traffic video, DeepSORT follows each one from frame to frame, and every vehicle it counts carries a box and a label.",
    device: "wide",
    moments: [
      {
        title: "Found",
        text: "Each car, bus and truck the model finds gets a box.",
        still: "traffic-1",
        alt: "An intersection in Montreal with vehicles outlined by thin boxes, each labelled with its type.",
      },
      {
        title: "Followed",
        text: "The tracker follows each vehicle from frame to frame under one ID, and it’s the IDs that are counted.",
        still: "traffic-2",
        alt: "The same intersection later, the boxes following the vehicles across the frame.",
      },
      {
        title: "Counted",
        text: "The totals grow as new vehicles are confirmed.",
        still: "traffic-3",
        alt: "The end of the clip, with the totals of cars, buses and trucks counted.",
      },
    ],
    recorded: `Rendered from the app’s ${BRANCH} branch, October 2026.`,
    credit:
      "Video: “Intersection Pie-IX-Sherbrooke” by Thomas1313, CC BY-SA 4.0, via Wikimedia Commons. The annotated version is shared under the same licence.",
    links: [{ label: "Code on GitHub", href: `${GH}/Traffic-Detection/tree/${BRANCH}` }],
    limitation:
      "It counts each confirmed track once, so a vehicle whose tracking ID switches can be counted twice, and one the model mislabels is counted under the wrong type.",
  },
];

/** The thread between chapters: the same signal, new evidence. */
export { inputs } from "./inputs";

export const thread = {
  phrases: ["Dear Customer", "immediately", "paypal-secure", "Click here to restore"],
  skills: ["JavaScript", "Python", "React", "SQL"],
  toResume: "Same idea, new input: a resume against a job posting.",
  toTraffic: "Same idea again, thirty frames a second.",
};

export type Project = { title: string; year?: string; kind: string; summary: string; note?: string; links?: { label: string; href: string }[] };

export const more: Project[] = [
  {
    title: "Immensa inquiry app",
    year: "2024",
    kind: "Professional app",
    summary:
      "An Android app for sales inquiries about 3D-printed industrial parts: one form for the part, material, files, criticality and testing, sent as one structured email.",
    links: [{ label: "Code on GitHub", href: `${GH}/Mobile-app` }],
  },
  {
    title: "StockPredict",
    year: "2024",
    kind: "Personal project",
    summary: "Portfolio tracker with price charts, volatility and Sharpe ratio, and a scikit-learn price prediction.",
    links: [{ label: "Code on GitHub", href: `${GH}/StockPredictor` }],
  },
  {
    title: "F1 lap time predictor",
    year: "2026",
    kind: "Personal project",
    summary: "Estimates lap times across drivers, car eras and five circuits, rating drivers from 2024 OpenF1 lap data.",
    note: "Private repository",
  },
  {
    title: "Music stem separator",
    year: "2025",
    kind: "Personal project",
    summary: "Splits songs into vocal, drum, bass and other stems with Demucs, with Spotify integration.",
    note: "Private repository",
  },
  {
    title: "Data charting app",
    year: "2024",
    kind: "Course project, CS3035",
    summary: "A JavaFX line-chart editor with summary statistics, built on MVC.",
    links: [
      { label: "Code on GitHub", href: `${GH}/CS3035-Individual-Graphing-Project` },
      { label: "Video demo on YouTube", href: "https://youtu.be/qHmMMeWLiNo" },
    ],
  },
  {
    title: "Monitoring and reporting dashboards",
    kind: "Professional project",
    summary:
      "Reduced troubleshooting effort by 40% by improving monitoring views, interface clarity and system transparency, with root-cause fixes for data display issues.",
    note: "Code not public",
  },
  {
    title: "Sensor management system",
    kind: "Professional project",
    summary: "Sensor health in one place, automated fault detection, role-based access and real-time status views.",
    note: "Code not public",
  },
];

export type Role = { organization: string; about?: string; title: string; period: string; place: string; points: string[] };

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
  coursework: "System analysis and project management, statistics, operating systems, cybersecurity, discrete mathematics.",
};

export const about = {
  interests:
    "Most of my work sits where software meets data: validating it, finding the defects that let it go wrong, and writing things down so a fix stays fixed. Outside work I build my own tools: a vehicle counter for traffic video, an F1 lap-time predictor, a stock tracker with charts and a price prediction, and a music stem separator.",
  approach: [
    { point: "Check figures against their source, and trace a discrepancy to its root cause.", from: "work on reports" },
    { point: "Show the reasons behind a score, so it can be checked rather than trusted.", from: "the scam detection tool" },
    { point: "Make missing information visible instead of leaving a blank.", from: "the inquiry app" },
    { point: "Add tests when I come back to code.", from: "Resume Analyzer" },
  ],
  skills: [
    { group: "Frontend", items: ["React", "TypeScript", "JavaScript", "HTML", "CSS"] },
    { group: "Data and automation", items: ["SQL", "MySQL", "Python", "Databricks", "Power BI", "Pandas", "NumPy"] },
    { group: "APIs and cloud", items: ["REST APIs", "Node.js", "Express", "Flask", "AWS API Gateway", "WebSockets"] },
    { group: "Engineering practices", items: ["Git", "testing and debugging", "root-cause analysis", "requirements gathering"] },
  ],
  alsoUsed: ["Java", "Kotlin (Android)", "C#", "C++", "C", "TensorFlow/Keras", "OpenCV"],
};

/** Words from the three apps' real inputs, scattered across the opening. */
/**
 * The opening's words, each from one of the three apps' real inputs. They sit in bands above and below
 * the copy (x and y in % of the band) or, on wide screens, beside it (in % of the opening), so the copy
 * never runs into them whatever its size in the visitor's fonts. s scales the size and o is the opacity.
 * Those marked phone stay on small screens.
 */
export type OpeningWord = { text: string; band: "above" | "below" | "beside"; x: number; y: number; s: number; o: number; phone?: true };
export const openingWords: OpeningWord[] = [
  { text: "paypal-secure", band: "above", x: 14, y: 38, s: 1.15, o: 0.28 },
  { text: "verify", band: "above", x: 32, y: 66, s: 1.2, o: 0.32, phone: true },
  { text: "immediately", band: "above", x: 60, y: 62, s: 0.85, o: 0.26 },
  { text: "Dear Customer", band: "above", x: 78, y: 34, s: 1.05, o: 0.34, phone: true },
  { text: "car", band: "beside", x: 5, y: 40, s: 1.1, o: 0.3 },
  { text: "truck", band: "beside", x: 6, y: 62, s: 0.85, o: 0.22 },
  { text: "track", band: "beside", x: 95, y: 36, s: 0.9, o: 0.26 },
  { text: "bus", band: "beside", x: 94, y: 58, s: 1.2, o: 0.3 },
  { text: "Docker", band: "below", x: 18, y: 40, s: 1.1, o: 0.26, phone: true },
  { text: "Kubernetes", band: "below", x: 36, y: 70, s: 0.85, o: 0.22 },
  { text: "React", band: "below", x: 52, y: 38, s: 0.95, o: 0.24, phone: true },
  { text: "Python", band: "below", x: 68, y: 68, s: 1, o: 0.28 },
  { text: "SQL", band: "below", x: 84, y: 44, s: 1.25, o: 0.32, phone: true },
];
