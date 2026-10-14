export type Part = { text: string; strong: boolean };

/**
 * Splits `text` into plain and strong parts, marking each phrase in `phrases` (in the order they
 * appear). The parts join back into the original text. Throws if a phrase isn't found, so a typo in
 * the content fails the build instead of silently losing the emphasis.
 */
export function emphasize(text: string, phrases: readonly string[]): Part[] {
  const parts: Part[] = [];
  let at = 0;
  for (const phrase of phrases) {
    const i = text.indexOf(phrase, at);
    if (i === -1) throw new Error(`Key phrase "${phrase}" isn't in the text (after position ${at}).`);
    if (i > at) parts.push({ text: text.slice(at, i), strong: false });
    parts.push({ text: phrase, strong: true });
    at = i + phrase.length;
  }
  if (at < text.length) parts.push({ text: text.slice(at), strong: false });
  return parts;
}
