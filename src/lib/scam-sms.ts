/**
 * The scam detection tool's text-message rules, as the home page runs them on a visitor's own text
 * (components/sections/TryScamRules.tsx).
 *
 * `sms` is copied verbatim from Fraud-Detection-Tool, js/detectors.js, lines 79–126, at commit
 * 558fa66 (https://github.com/NotLuvii/Fraud-Detection-Tool/blob/main/js/detectors.js#L79-L126).
 * The only changes are two type annotations TypeScript needs; the rules, weights and thresholds
 * are the tool's own. Edit the tool, then copy it again: don't edit the rules here.
 */
export const sms = {
  scamPhrases: [
    'you have won', 'you won', 'congratulations you', 'claim your prize', 'claim now',
    'text stop to opt out', 'reply stop', 'urgent', 'your bank', 'suspended', 'verify',
    'click here', 'confirm your', 'unusual activity', 'unrecognized', 'refund',
    'delivery problem', 'package held', 'pay a fee', 'tax refund', 'free gift',
    'limited time', 'act now', 'expires today', 'winner', 'claim your', 'cash prize'
  ],
  shortUrlPattern: /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|is\.gd|buff\.ly/gi,
  numberPattern: /\b\d{4,}\b/g,
  run(text: string) {
    const lower = text.toLowerCase();
    const issues: { type: string; msg: string }[] = [];
    let score = 0;

    this.scamPhrases.forEach(phrase => {
      if (lower.includes(phrase)) {
        issues.push({ type: 'phrase', msg: `Scam-like phrase: "${phrase}"` });
        score += 18;
      }
    });

    if (this.shortUrlPattern.test(text)) {
      issues.push({ type: 'link', msg: 'Shortened URL - often used in SMS scams' });
      score += 25;
    }

    const numbers = text.match(this.numberPattern) || [];
    if (numbers.length >= 2) {
      issues.push({ type: 'numbers', msg: 'Multiple long number sequences (account/code impersonation)' });
      score += 15;
    }

    if (text.length < 20 && (lower.includes('http') || lower.includes('click'))) {
      issues.push({ type: 'short', msg: 'Very short message with link - typical smishing' });
      score += 20;
    }

    if (lower.includes('reply') && lower.includes('yes') || lower.includes('reply y')) {
      issues.push({ type: 'reply', msg: 'Asks you to reply to confirm - common in subscription fraud' });
      score += 15;
    }

    const risk = Math.min(100, score);
    const level = risk >= 60 ? 'high' : risk >= 35 ? 'medium' : 'low';
    return { risk, level, issues: [...new Map(issues.map(i => [i.msg, i])).values()] };
  }
};

export type SmsResult = { risk: number; level: "low" | "medium" | "high"; issues: { type: string; msg: string }[] };

/**
 * Scores a text with the tool's rules. The original reuses a global regular expression
 * (`shortUrlPattern`, flag g) with `test()`, which remembers where its last match ended, so a
 * second check could start part-way through the next text and miss a short link. Resetting it
 * first makes every run start from the beginning, without touching the rules.
 */
export function checkSms(text: string): SmsResult {
  sms.shortUrlPattern.lastIndex = 0;
  sms.numberPattern.lastIndex = 0;
  return sms.run(text) as SmsResult;
}

/**
 * Where each rule that fired matched in the text, as sorted, merged, half-open [start, end)
 * ranges: for underlining. Phrases match without regard to case, as the tool does.
 */
export function markRanges(text: string, result: SmsResult): [number, number][] {
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  const every = (needle: string) => {
    for (let at = lower.indexOf(needle); needle && at !== -1; at = lower.indexOf(needle, at + 1)) ranges.push([at, at + needle.length]);
  };
  const matches = (re: RegExp) => {
    for (const m of text.matchAll(re)) ranges.push([m.index, m.index + m[0].length]);
  };
  for (const issue of result.issues) {
    if (issue.type === "phrase") every(/"(.+)"$/.exec(issue.msg)?.[1] ?? "");
    else if (issue.type === "link") matches(new RegExp(sms.shortUrlPattern.source, "gi"));
    else if (issue.type === "numbers") matches(new RegExp(sms.numberPattern.source, "g"));
    else if (issue.type === "short") ["http", "click"].forEach(every);
    else if (issue.type === "reply") ["reply", "yes"].forEach(every);
  }
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: [number, number][] = [];
  for (const [a, b] of ranges) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}
