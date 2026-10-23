/**
 * Projects. Three are featured, chosen for the strength of their evidence (public code, solo
 * work, screenshots of the running app) and their relevance to data and quality work; the rest are
 * listed compactly underneath.
 *
 * Everything here was checked against the repositories in October 2026. Screenshots were taken
 * from each app running locally, with the inputs named in their captions. Code excerpts are copied
 * verbatim from the linked files.
 */

export type Link = { label: string; href: string };

export type Screenshot = {
  /** Path under /public without extension: `${src}.webp` is 1x and `${src}@2x.webp` is 2x. */
  src: string;
  /** Size of the 1x file, in pixels. */
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Also exported at 3x (`${src}@3x.webp`), for pictures shown larger than their 1x width. */
  large?: boolean;
};

/** A figure from a project's result, shown large on the home page with a line saying what it measures. */
export type Stat = { value: string; label: string };

/** A rectangle in a capture's 1x pixels. */
export type Rect = { x: number; y: number; w: number; h: number };

/**
 * A window onto a real capture, cut in CSS (components/ui/Crop.tsx): `rect` is what shows,
 * `narrow` what shows below 640px, `marks` are ink underlines (each at its rect's bottom edge) and
 * `ring` an ink ring, all in the capture's 1x pixels. Nothing is redrawn: the pixels are the
 * capture's own, and the whole capture opens full screen.
 */
export type Crop = { shot: Screenshot; rect: Rect; narrow?: Rect; alt: string; marks?: Rect[]; ring?: Rect };

export type CodeExcerpt = {
  /** File path inside the repository, shown above the code. */
  file: string;
  href: string;
  language: string;
  code: string;
  caption: string;
};

export type FeaturedProject = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  team: string;
  /** Who it's for and the problem, in one or two sentences. */
  summary: string;
  /** Two or three figures from the result, each true of the project; the case study states them in prose. */
  stats: Stat[];
  /**
   * The home page's chapter for this project: a benefit headline, a lede, one known limitation, and
   * either steps (each with a crop) or a visual (crops shown together, with a caption).
   */
  chapter?: {
    headline: string;
    lede: string;
    limitation: string;
    steps?: { title: string; text: string; crop: CropName }[];
    visual?: CropName[];
    caption?: string;
  };
  stack: string[];
  repo: Link;
  /** Whether there's a live demo, said plainly. */
  availability: string;
  caseStudy: {
    context: string[];
    role: string;
    built: string[];
    decision: { title: string; body: string[]; code?: CodeExcerpt };
    outcome: string[];
    limitations: string[];
    figures: Screenshot[];
    figuresNote?: string;
    code?: CodeExcerpt;
    files: Link[];
  };
};

export type MoreProject = {
  title: string;
  year?: string;
  kind?: string;
  /** One line; names the main technologies. */
  summary: string;
  links: Link[];
  /** Said instead of a link when the code isn't public. */
  note?: string;
};

const GH = "https://github.com/NotLuvii";

/** The scam tool's email check on the README's sample (captured October 2026): the source of its crops. */
const scamApp: Screenshot = {
  src: "/images/scam-detection/app",
  width: 592,
  height: 899,
  alt: "The Scam & Fraud Detection page with the Phishing email tab open. The sample email is in the text box. The result shows a risk score of 100 percent, High risk, and five issues: two urgency phrases, a generic greeting, the text paypal-secure, and a request to click or verify.",
  caption: "Email check on the README’s sample phishing email: 100, High, with five red flags.",
};

/** Resume Analyzer's result for my resume against a sample posting (captured October 2026). */
const resumeResults: Screenshot = {
  src: "/images/resume-analyzer/results",
  width: 872,
  height: 1191,
  alt: "The Resume Analyzer web page. A sample job description is in the text box and Luvneet_Bamrah_Resume.pdf is selected. The relevance score is 55.6 percent, shown with a bar. Gap analysis lists teamwork and communication as missing soft skills and Docker and Kubernetes as missing technical skills; matched technical skills are AWS, TypeScript, React, SQL and Python.",
  caption:
    "My resume scored 55.6% against a sample posting: “Software developer. You will build web applications in React and TypeScript, write SQL and Python to validate data, and deploy services on AWS. Experience with Docker and Kubernetes is an asset. We value communication, teamwork and problem-solving.”",
};

const scam: FeaturedProject = {
  slug: "scam-detection",
  title: "Scam detection tool",
  kind: "Personal project",
  year: "2026",
  team: "Solo",
  summary:
    "A browser tool that checks a suspicious email, text message, listing or link, scores it from 0 to 100 and lists the red flags behind the score.",
  // From the outcome below: the README's sample inputs, scored by the tool.
  stats: [
    { value: "100", label: "The README’s sample phishing email, flagged High" },
    { value: "70", label: "The lookalike link paypal-secure.com/verify-now, flagged High" },
    { value: "0", label: "www.amazon.com, reported as a recognised domain" },
  ],
  stack: ["JavaScript", "HTML and CSS", "Node.js", "Express", "Cheerio"],
  repo: { label: "Code on GitHub", href: `${GH}/Fraud-Detection-Tool` },
  chapter: {
    headline: "A risk score that shows its reasons.",
    lede: "Paste a suspicious email, text message, listing or link. Rule-based detectors score it from 0 to 100 and list each warning sign behind the score, so the result can be checked rather than trusted.",
    // The case study's first limitation, word for word.
    limitation:
      "Rule-based only: keyword and pattern lists, with no machine learning or live threat data. New wording can slip through, and a safe message that uses an urgent phrase can be flagged.",
    steps: [
      { title: "The message", text: "The README’s sample phishing email, pasted into the tool.", crop: "scamMessage" },
      {
        title: "The warning signs",
        text: "Each rule that matched, in the tool’s own words: urgent wording, a generic greeting, a lookalike domain and a request to click or verify.",
        crop: "scamSigns",
      },
      { title: "The verdict", text: "The points add up to a score from 0 to 100, with the level spelled out: 100%, High risk.", crop: "scamVerdict" },
    ],
  },
  availability: "No live demo; it runs locally.",
  caseStudy: {
    context: [
      "Phishing emails, scam texts, fake listings and lookalike links give themselves away in different ways: urgent wording, a generic greeting, a shortened link, a request to pay by wire transfer, a misspelled domain.",
      "The tool takes any of the four, scores it from 0 to 100 and lists the specific signals behind the score, so the result can be checked rather than taken on trust.",
    ],
    role: "Solo: the detection rules, the interface, the Node.js server and the README.",
    built: [
      "Four detectors in one file, js/detectors.js. Each adds weighted points for the signals it finds (15 for each urgent phrase in an email, 25 for a shortened link in a text message), caps the total at 100, and maps it to Low, Medium or High with thresholds set for each input type.",
      "A single page with a tab for each input type, a risk bar and the list of issues. Results are announced to screen readers through an aria-live region.",
      "An optional Express server. POST /api/fetch-listing accepts only http and https addresses, loads the page with axios (12-second timeout, up to five redirects), strips scripts, navigation and footers with Cheerio, and takes the listing text from marketplace-specific selectors before falling back to the page body.",
      "When a page is fetched, the link and listing results are combined: the higher of the two scores is used rather than their sum, and each issue is labelled URL or Listing.",
    ],
    decision: {
      title: "Match domains exactly, not by substring",
      body: [
        "The link checker parses the input with the browser’s URL parser and compares the hostname with a list of official marketplace and payment domains. A host counts as official only if it equals one of them or ends with a dot followed by one, so www.ebay.ca is recognised but amazon.com.example.net is not.",
        "Hosts that aren’t official go through further rules: patterns for misspelled brands such as amaz0n and paypa1, brand names used as a subdomain of another site, hyphenated brand domains like paypal-secure.com, suspicious top-level domains, IP addresses, plain HTTP and login-style paths. amazon.com.example.net scores 100.",
      ],
      code: {
        file: "js/detectors.js, lines 232–239",
        href: `${GH}/Fraud-Detection-Tool/blob/main/js/detectors.js#L232-L239`,
        language: "javascript",
        code: `for (const official of this.officialDomains) {
  const officialBase = official.split('/')[0];
  if (fullHost === officialBase || fullHost.endsWith('.' + officialBase)) {
    isOfficial = true;
    issues.push({ type: 'legit', msg: \`Recognized official domain: \${officialBase}\` });
    break;
  }
}`,
        caption: "The official-domain check: an exact match, or a subdomain of the official domain.",
      },
    },
    outcome: [
      "With the README’s sample inputs, the phishing email and the fake listing score 100, the scam text 94 and the lookalike link 70, all High. The official www.amazon.com address scores 0 and is reported as a recognised domain.",
      "If a page can’t be fetched because the site blocks the request, the page is missing or the request times out, the server returns the reason rather than an error, and the result still shows the link check with the failure listed as an issue.",
    ],
    limitations: [
      "Rule-based only: keyword and pattern lists, with no machine learning or live threat data. New wording can slip through, and a safe message that uses an urgent phrase can be flagged.",
      "The list of official domains covers major marketplaces and payment sites only.",
      "There are no automated tests.",
      "In the tool, two regular expressions are global and reused with test(), so a second check can miss what the first found: the listing “Selling bike $50, contact me” scores 32, then 12. The checker on this site resets them before each run; the fix belongs in the tool.",
      "In Chrome, the link check takes text with spaces in it, such as “not a url at all”, as a web address and scores it 0, because Chrome’s URL parser lets spaces into a host name where the URL standard rejects them. The checker on this site rejects such text, as the tool does in other browsers; the fix belongs in the tool.",
    ],
    figuresNote: "Screenshots of the tool running locally, October 2026, using the example inputs from its README.",
    figures: [
      scamApp,
      {
        src: "/images/scam-detection/listing",
        width: 592,
        height: 754,
        alt: "The Fake listing tab with the sample listing entered. The result shows 100 percent, High risk, with red flags for wire transfer, Western Union, WhatsApp, must sell today and moving overseas, plus a very short ad with a negotiable price.",
        caption: "Listing check on the README’s sample fake listing: 100, High.",
      },
      {
        src: "/images/scam-detection/url-lookalike",
        width: 592,
        height: 544,
        large: true,
        alt: "The Link / URL tab with paypal-secure.com/verify-now entered. Risk score 70 percent, High risk, with two issues: a brand name with a hyphen and an extra word, and a path that suggests login or verification.",
        caption: "Lookalike link: paypal-secure.com/verify-now scores 70, High.",
      },
      {
        src: "/images/scam-detection/url-official",
        width: 592,
        height: 495,
        alt: "The Link / URL tab with https://www.amazon.com/ entered. Risk score 0 percent, Low risk, with one note: recognized official domain amazon.com.",
        caption: "Official link: www.amazon.com scores 0 and is recognised.",
      },
    ],
    files: [
      { label: "Detection rules: js/detectors.js", href: `${GH}/Fraud-Detection-Tool/blob/main/js/detectors.js` },
      { label: "Page fetching: server.js", href: `${GH}/Fraud-Detection-Tool/blob/main/server.js` },
      { label: "README and example inputs", href: `${GH}/Fraud-Detection-Tool/blob/main/README.md` },
    ],
  },
};

const immensa: FeaturedProject = {
  slug: "immensa-inquiry-app",
  title: "Immensa inquiry app",
  kind: "Professional app",
  year: "2024",
  team: "Solo",
  summary:
    "An Android app for sales inquiries about 3D-printed industrial parts: one form for the part, material, files, criticality and testing, sent as one structured email.",
  // From the case study: the required fields, and the tools screen's currencies and alloys.
  stats: [
    { value: "3", label: "Fields required before an inquiry can be sent: client, part and material" },
    { value: "6", label: "Currencies in the converter, from the UAE dirham to the Canadian dollar" },
    { value: "9", label: "Alloys in the part-weight calculator, including Inconel 718 and Ti-6Al-4V" },
  ],
  stack: ["Kotlin", "Android SDK"],
  repo: { label: "Code on GitHub", href: `${GH}/Mobile-app` },
  availability: "Android app; the source and a release build are on GitHub.",
  caseStudy: {
    context: [
      "Quoting a 3D-printed industrial part takes a lot of detail: what the part is and what it’s made of, which drawings or CAD files exist, how critical it is, which testing standard applies, and the conditions it will run in.",
      "The app puts all of it into one form on a phone and sends each inquiry as an email with the same fields in the same order, with the photos attached.",
    ],
    role: "Solo: the design and all of the code.",
    built: [
      "The inquiry form: client, part and material; a description; options for digitization, material change, repeat order and 2D drawings; the CAD formats available (STP, STL); machining, balancing and assembly; criticality from CR1 to CR3; the testing standard (API or DNV); and annual demand, operating conditions, medium, coating, additional testing and delivery scope.",
      "Photos taken in the app through Android’s FileProvider, all attached to the outgoing email.",
      "A sign-in screen that keeps the user’s name and email address on the device (SharedPreferences). That address is the inquiry’s recipient.",
      "A tools screen: currency conversion between the UAE dirham, Saudi riyal, Kuwaiti dinar, US dollar, euro and Canadian dollar; part weight from volume and the density of nine alloys, including Inconel 718, Ti-6Al-4V and AlSi10Mg; and inches and feet to metric.",
    ],
    decision: {
      title: "Make missing information visible",
      body: [
        "An inquiry without a part or a material can’t be quoted, and a blank line in an email is ambiguous: not applicable, or forgotten?",
        "So the app won’t send until client, part and material are filled in, and marks each empty one with an error on the field. Optional fields left empty are written into the email as “Not Entered”, and every inquiry uses the same subject line and field order.",
      ],
      code: {
        // The Intent block: type, address, subject, body, attachments.
        file: "app/src/main/java/com/example/app/MainActivity.kt, lines 477–511",
        href: `${GH}/Mobile-app/blob/master/app/src/main/java/com/example/app/MainActivity.kt#L477-L511`,
        language: "kotlin",
        code: `private fun sendEmail(to: String, subject: String, body: String, imageUris: List<Uri>) {
    if(findViewById<EditText>(R.id.clientEditText).text.toString().isNotEmpty() &&
       findViewById<EditText>(R.id.partEditText).text.toString().isNotEmpty() &&
       findViewById<EditText>(R.id.materialEditText).text.toString().isNotEmpty())
    {
        val emailIntent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
            type = "message/rfc822"
            putExtra(Intent.EXTRA_EMAIL, arrayOf(to))
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, body)
            putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(imageUris))
        }
        try {
            startActivity(Intent.createChooser(emailIntent, "Send email..."))
        } catch (ex: android.content.ActivityNotFoundException) {
            Toast.makeText(this@MainActivity, "There are no email clients installed.", Toast.LENGTH_SHORT).show()
        }
    }
    else
    {
        if(findViewById<EditText>(R.id.clientEditText).text.toString().isEmpty())
        {
            findViewById<EditText>(R.id.clientEditText).error = "Client name is required"
        }
        if(findViewById<EditText>(R.id.partEditText).text.toString().isEmpty())
        {
            findViewById<EditText>(R.id.partEditText).error = "Part name is required"
        }
        if(findViewById<EditText>(R.id.materialEditText).text.toString().isEmpty())
        {
            findViewById<EditText>(R.id.materialEditText).error = "Material name is required"
        }
    }

}`,
        caption: "Sending an inquiry: the three required fields are checked first, and the email goes out with every photo attached.",
      },
    },
    outcome: [
      "Each inquiry opens in the phone’s email app as one message: the subject “Client - Part”, the full set of fields in a fixed order, and every photo taken attached.",
      "The repository holds the Kotlin source and a release build (app-release.apk).",
    ],
    limitations: [
      "Exchange rates are fixed in the code, not fetched live.",
      "Inquiries aren’t stored on the device; once sent, the record lives in email.",
      "There are no automated tests beyond Android Studio’s templates.",
    ],
    figures: [],
    files: [
      { label: "Inquiry form and email: MainActivity.kt", href: `${GH}/Mobile-app/blob/master/app/src/main/java/com/example/app/MainActivity.kt` },
      { label: "Conversions: ConversionActivity.kt", href: `${GH}/Mobile-app/blob/master/app/src/main/java/com/example/app/ConversionActivity.kt` },
    ],
  },
};

const resume: FeaturedProject = {
  slug: "resume-analyzer",
  title: "Resume Analyzer",
  kind: "Personal project",
  year: "2024",
  team: "Solo",
  summary:
    "Compares a resume (PDF or Word) with a job description and gives a relevance score, the shared and missing skills, and interview questions for the role.",
  // From the outcome: my resume against the sample posting shown in the screenshot.
  stats: [
    { value: "55.6%", label: "Relevance score for my resume against a sample posting" },
    { value: "5 of 9", label: "Skills from the posting found in the resume" },
    { value: "2", label: "Technical skills flagged as missing: Docker and Kubernetes" },
  ],
  stack: ["Python", "Flask", "PyMuPDF", "python-docx", "Tkinter", "Matplotlib", "pytest", "JavaScript"],
  repo: { label: "Code on GitHub", href: `${GH}/Resume-Analyze` },
  chapter: {
    headline: "Match a resume to a job posting, skill by skill.",
    lede: "Upload a resume and paste a posting. It scores the weighted share of the posting’s skills the resume mentions, lists the shared and missing ones, and suggests interview questions.",
    // The case study's first limitation, shortened.
    limitation: "Text is split into single words before matching, so skills with spaces or punctuation, like Power BI, C++ and problem-solving, can’t match yet.",
    visual: ["resumeScore", "resumeGap"],
    caption: "My resume against a sample posting: 55.6%, with communication, teamwork, Docker and Kubernetes missing.",
  },
  availability: "No live demo; it runs locally with Flask.",
  caseStudy: {
    context: [
      "Tailoring a resume to a job posting starts with a comparison: which of the role’s skills the resume already shows, and which it doesn’t.",
      "The tool makes that comparison from the two texts and suggests interview questions for the skills the posting asks for.",
    ],
    role: "Solo: the desktop version and the web version.",
    built: [
      "Relevance score: each skill in the job description is weighted by how often the description names it, counting whole words, and the score is the weighted share of those skills the resume also mentions, from 0 to 100%.",
      "Desktop version (November 2024): a Tkinter app with drag-and-drop resumes, a results table with each resume’s score, and Matplotlib charts of matched skills and the spread of scores.",
      "Web version (December 2024): a Flask endpoint, POST /upload, that takes the posting and a resume, reads PDFs with PyMuPDF and Word files with python-docx, and returns the analysis as JSON to a small JavaScript front end that shows the score as a bar.",
      "Skill extraction: the text is lower-cased, punctuation and stop words are removed, and the words that remain are kept only if they appear in the technical or soft-skill list.",
      "Interview questions from templates for each skill found in the posting, followed by general, behavioural and technical questions.",
      "October 2026 update: the score restored in both versions, the desktop version brought back in line with the current backend, and tests added (pytest) for the scoring, the web endpoint and the desktop window.",
    ],
    decision: {
      title: "Curated skill lists instead of word overlap",
      body: [
        "Comparing every word of a posting with every word of a resume would report ordinary words as matches. Matching only against curated lists of 279 technical and 49 soft skills keeps the output to actual skills, and splits it into technical and soft.",
        "The cost is coverage: a skill that isn’t on a list is never found, and synonyms aren’t recognised. The README lists this as a known issue.",
      ],
      code: {
        file: "backend/analyzer.py, lines 143–154",
        href: `${GH}/Resume-Analyze/blob/main/backend/analyzer.py#L143-L154`,
        language: "python",
        code: `def extract_keywords_pipeline(text):
    text = re.sub(r"[^\\w\\s]", "", text.lower())
    filtered_words = remove_stopwords(text)

    technical_skills = [word for word in filtered_words if word in TECHNICAL_KEYWORDS]
    soft_skills = [word for word in filtered_words if word in SOFT_SKILLS_KEYWORDS]

    return {
        "technical_skills": sorted(set(technical_skills)),
        "soft_skills": sorted(set(soft_skills)),
        "weights": calculate_keyword_weights(text)
    }`,
        caption: "Skill extraction: words are kept only if they’re on one of the two lists, and each skill’s weight for the score comes from how often the posting names it.",
      },
    },
    outcome: [
      "The screenshot compares my own resume with a short sample posting that names nine listed skills once each. The tool scored it 55.6%: it found SQL, React, TypeScript, AWS and Python in both, listed Docker and Kubernetes as missing technical skills, and communication and teamwork as missing soft skills, since my resume doesn’t use those words.",
      "Twelve automated tests cover the weighting (including that short skill names like R are counted as whole words), the score from 0 to 100%, the web endpoint and the desktop window.",
    ],
    limitations: [
      "Text is split into single words before matching, so list entries with spaces or punctuation can’t match: 58 of the 279 technical entries, including Power BI, C++ and scikit-learn, and 25 of the 49 soft skills, including problem-solving. In the screenshot above, “problem-solving” is in the posting but isn’t reported.",
      "Only listed skills count towards the score, so a posting whose requirements aren’t on the lists scores 0.",
    ],
    figuresNote: "Screenshot of the web version running locally, October 2026.",
    figures: [
      resumeResults,
    ],
    files: [
      { label: "Skill lists and matching: backend/analyzer.py", href: `${GH}/Resume-Analyze/blob/main/backend/analyzer.py` },
      { label: "Web endpoint: app.py", href: `${GH}/Resume-Analyze/blob/main/app.py` },
      { label: "Tests: tests/test_scoring.py", href: `${GH}/Resume-Analyze/blob/main/tests/test_scoring.py` },
    ],
  },
};

/** In display order: one card each on the home page, the scam detection tool first. */
export const featured: FeaturedProject[] = [scam, resume, immensa];

export const more: MoreProject[] = [
  {
    title: "Monitoring and reporting dashboards",
    kind: "Professional project",
    summary:
      "Reduced troubleshooting effort by 40% by improving monitoring views, interface clarity and system transparency, with root-cause fixes for data display issues.",
    links: [],
    note: "Code not public",
  },
  {
    title: "Sensor management system",
    kind: "Professional project",
    summary: "Sensor health in one place, automated fault detection, role-based access and real-time status views.",
    links: [],
    note: "Code not public",
  },
  {
    title: "Vehicle counter",
    year: "2025",
    kind: "Personal project",
    summary: "Counts cars, buses and trucks in traffic video with YOLOv8 detection and DeepSORT tracking.",
    links: [{ label: "Code on GitHub", href: `${GH}/Traffic-Detection` }],
  },
  {
    title: "F1 lap time predictor",
    year: "2026",
    kind: "Personal project",
    summary: "Estimates lap times across drivers, car eras and five circuits, rating drivers from 2024 OpenF1 lap data.",
    links: [],
    note: "Private repository",
  },
  {
    title: "StockPredict",
    year: "2024",
    kind: "Personal project",
    summary: "Portfolio tracker with price charts, volatility and Sharpe ratio, and a scikit-learn price prediction.",
    links: [{ label: "Code on GitHub", href: `${GH}/StockPredictor` }],
  },
  {
    title: "Music stem separator",
    year: "2025",
    kind: "Personal project",
    summary: "Splits songs into vocal, drum, bass and other stems with Demucs, with Spotify integration.",
    links: [],
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
];

export const projectHref = (slug: string) => `/projects/${slug}/`;

/** The crops the home page and case studies show, measured from the captures (1x pixels). */
export type CropName = "scamResult" | "scamMessage" | "scamSigns" | "scamVerdict" | "resumeScore" | "resumeGap";

export const crops: Record<CropName, Crop> = {
  scamResult: {
    shot: scamApp,
    rect: { x: 20, y: 595, w: 552, h: 281 },
    alt: "The scam detection tool’s result for the README’s sample phishing email: the risk score bar full at 100 percent, the verdict “High risk — treat as suspicious and avoid clicking links or sharing info.”, and five issues: two urgency phrases, a generic greeting, the text paypal-secure, and a request to click or verify.",
  },
  scamMessage: {
    shot: scamApp,
    rect: { x: 33, y: 208, w: 526, h: 184 },
    alt: "The sample phishing email in the tool’s text box: “Dear Customer, Your account has been suspended due to unusual activity. Verify your identity immediately: https://paypal-secure.com/verify-now Click here to restore access. Do not ignore this message.” The phrases the tool quotes are underlined.",
    // Under "Dear Customer", "immediately", "paypal-secure" (across a line break) and "Click here to restore".
    marks: [
      { x: 71, y: 282, w: 100, h: 4 },
      { x: 208, y: 328, w: 80, h: 4 },
      { x: 357, y: 328, w: 45, h: 4 },
      { x: 71, y: 351, w: 46, h: 4 },
      { x: 71, y: 376, w: 138, h: 4 },
    ],
  },
  scamSigns: {
    shot: scamApp,
    rect: { x: 33, y: 714, w: 340, h: 146 },
    alt: "The five issues the tool lists: Urgency language: “immediately”; Urgency language: “click here to restore”; Generic greeting (e.g. “Dear Customer”); Suspicious domain-like text: “paypal-secure”; Asks for sensitive info or to click/verify.",
  },
  scamVerdict: {
    shot: scamApp,
    rect: { x: 33, y: 606, w: 527, h: 112 },
    alt: "The tool’s risk score bar, full at 100 percent, and its verdict: High risk — treat as suspicious and avoid clicking links or sharing info.",
  },
  resumeScore: {
    shot: resumeResults,
    rect: { x: 50, y: 422, w: 772, h: 192 },
    narrow: { x: 50, y: 422, w: 470, h: 140 },
    alt: "Resume Analyzer’s relevance score: 55.6 percent, with a bar and the note that it is the share of the job description’s skills the resume mentions, weighted by how often the description names each one.",
    // Around "55.6%".
    ring: { x: 56, y: 488, w: 126, h: 46 },
  },
  resumeGap: {
    shot: resumeResults,
    rect: { x: 50, y: 623, w: 420, h: 264 },
    alt: "Resume Analyzer’s gap analysis: missing soft skills, teamwork and communication; missing technical skills, docker and kubernetes.",
  },
};
