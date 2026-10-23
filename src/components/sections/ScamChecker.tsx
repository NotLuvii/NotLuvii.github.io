"use client";

import { Fragment, useMemo, useState, useSyncExternalStore } from "react";
import { checkScam, DETECTOR_LINES, detectorHref, markRanges, SAMPLES, type ScamKind, type ScamResult } from "@/lib/scam-rules";
import { TextLink } from "@/components/ui/links";

const LEVEL = { low: "Low", medium: "Medium", high: "High" } as const;
/** Far beyond a real email or listing; the tool itself sets no limit. */
const MAX = 10_000;
const KINDS: { kind: ScamKind; label: string; field: string }[] = [
  { kind: "email", label: "Email", field: "Paste an email" },
  { kind: "text", label: "Text message", field: "Paste a text message" },
  { kind: "listing", label: "Listing", field: "Paste a listing" },
  { kind: "link", label: "Link", field: "Paste a link" },
];

/** False on the server and while the page hydrates, true once the script is running. */
const noSubscription = () => () => {};
const useScriptReady = () =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

/** The text, with each range a rule matched underlined in ink. Text only: nothing in it is ever read as HTML. */
function Marked({ text, ranges }: { text: string; ranges: [number, number][] }) {
  const parts: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([a, b], i) => {
    parts.push(<Fragment key={`t${i}`}>{text.slice(at, a)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="ink-underline text-text">
        {text.slice(a, b)}
      </mark>,
    );
    at = b;
  });
  parts.push(<Fragment key="end">{text.slice(at)}</Fragment>);
  return <>{parts}</>;
}

/**
 * The page's one live demonstration, inside the scam detection chapter: the tool's own four detectors
 * (src/lib/scam-rules.ts) score what you paste as you type, in the browser, with the tool's own
 * messages, the matched words underlined in ink and a link to the detector's lines. Nothing is sent
 * anywhere.
 *
 * Pick what you're checking (each kind keeps its own text, as the tool's tabs do) or one of the
 * README's samples. An empty field gives a neutral prompt, never a score. Only the result is
 * announced as it changes. Under the score a bar shows it, and eases to each new score (instantly
 * with reduced motion or motion paused); with no result there is no bar. Before the script runs, and without JavaScript, it shows the text
 * sample and its result, worked out at build time, with the field read-only and the controls
 * unavailable, so it never looks able to answer while it can't.
 */
export function ScamChecker({ initial }: { initial: ScamResult }) {
  const ready = useScriptReady();
  const textSample = SAMPLES.find((s) => s.kind === "text")!;
  const [kind, setKind] = useState<ScamKind>("text");
  const [texts, setTexts] = useState<Record<ScamKind, string>>({ email: "", text: textSample.text, listing: "", link: "" });
  const text = texts[kind];
  const result = useMemo(() => (ready ? checkScam(kind, text) : initial), [ready, kind, text, initial]);
  const ranges = useMemo(() => (result ? markRanges(kind, text, result) : []), [kind, text, result]);
  const setText = (value: string) => setTexts((t) => ({ ...t, [kind]: value.slice(0, MAX) }));
  const [from, to] = DETECTOR_LINES[kind];
  const current = KINDS.find((k) => k.kind === kind)!;

  return (
    <div id="demo" aria-labelledby="demo-title" className="chapter-demo">
      <div>
        <h4 id="demo-title" className="type-title text-text">
          Try it on your own text
        </h4>
        <p className="mt-f8 max-w-[52ch] text-[17px] leading-[1.618] text-text-3">
          The tool&rsquo;s own rules, copied from its source and running in your browser. Nothing is sent anywhere.
        </p>

        <div className="demo-grid mt-f34">
          <div className="min-w-0">
            <fieldset>
              <legend className="text-[17px] text-text-2">What are you checking?</legend>
              <div className="demo-kinds mt-f8">
                {KINDS.map((k) => (
                  <label key={k.kind} className="demo-kind">
                    <input type="radio" name="demo-kind" value={k.kind} checked={kind === k.kind} disabled={!ready} onChange={() => setKind(k.kind)} />
                    <span>{k.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div role="group" aria-label="Samples from the tool's README" className="mt-f21 flex flex-wrap items-center gap-f8">
              <span aria-hidden className="type-small text-text-3">
                Samples
              </span>
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={!ready}
                  className="demo-chip"
                  onClick={() => {
                    setKind(s.kind);
                    setTexts((t) => ({ ...t, [s.kind]: s.text }));
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-f21 flex items-center justify-between gap-f13">
              <label htmlFor="demo-text" className="block text-[17px] text-text-2">
                {current.field}
              </label>
              <button type="button" disabled={!ready} className="demo-clear" onClick={() => setText("")}>
                Clear
              </button>
            </div>
            <textarea
              id="demo-text"
              value={text}
              readOnly={!ready}
              maxLength={MAX}
              rows={kind === "link" ? 2 : 5}
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
              className="mt-f8 block w-full resize-y rounded-xl border-0 bg-raised p-f13 text-[17px] leading-[1.618] text-text"
            />
            {text.length >= MAX && (
              <p data-try-cap className="type-small mt-f8 text-text-3">
                Only the first 10,000 characters are checked.
              </p>
            )}
          </div>

          <div className="min-w-0">
            {/* Only the result is announced as it changes, not the text being typed read back. */}
            <div aria-live="polite">
              {result ? (
                <>
                  <p className="flex items-baseline gap-f13">
                    <span data-try-score className="type-section text-text tabular-nums">
                      {result.risk}
                    </span>{" "}
                    <span className="type-title text-text">
                      <span data-try-level>{LEVEL[result.level]}</span> risk
                    </span>
                  </p>
                  {/* The score as a bar: it moves to a new score, the one state change on the page worth animating. */}
                  <div aria-hidden className="demo-meter" data-signal="">
                    <span style={{ width: `${result.risk}%` }} />
                  </div>
                  <ul data-try-issues className="mt-f13 space-y-f5 text-[17px] leading-[1.618] text-text-2">
                    {result.issues.length ? result.issues.map((issue) => <li key={issue.msg}>{issue.msg}</li>) : <li>Nothing flagged.</li>}
                  </ul>
                </>
              ) : (
                <p data-try-empty className="text-[17px] leading-[1.618] text-text-3">
                  Paste something above or pick a sample.
                </p>
              )}
            </div>
            {result && (
              <p data-try-marked className="mt-f21 whitespace-pre-wrap text-[17px] leading-[1.618] text-text-2 [overflow-wrap:anywhere]">
                <Marked text={text} ranges={ranges} />
              </p>
            )}
            <p className="mt-f13 text-[17px]">
              <TextLink href={detectorHref(kind)} external>
                The rules: js/detectors.js, lines {from}–{to}
              </TextLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
