"use client";

import { Fragment, useMemo, useState, useSyncExternalStore } from "react";
import type { Link } from "@/content/projects";
import { checkSms, markRanges, type SmsResult } from "@/lib/scam-sms";
import { TextLink } from "@/components/ui/links";

const LEVEL = { low: "Low", medium: "Medium", high: "High" } as const;

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
 * The page's one live thing: paste a text message and the scam detection tool's own rules
 * (src/lib/scam-sms.ts) score it as you type, in the browser, with the tool's own messages and the
 * matched words underlined in ink. Nothing is sent anywhere.
 *
 * Before the script runs (and without JavaScript) it shows the sample and its result, worked out
 * at build time, and the field is read-only, so it never looks editable while it can't answer.
 */
export function TryScamRules({ sample, initial, source }: { sample: string; initial: SmsResult; source: Link }) {
  const ready = useScriptReady();
  const [text, setText] = useState(sample);
  const result = useMemo(() => (ready ? checkSms(text) : initial), [ready, text, initial]);
  const ranges = useMemo(() => markRanges(text, result), [text, result]);

  return (
    <div className="mx-auto mt-16 max-w-[1200px] px-gutter text-left md:mt-24">
      <h3 className="type-title text-text">Try the scam checker on your own text</h3>
      <div className="try-grid mt-6">
        <div className="min-w-0">
          <label htmlFor="try-text" className="block text-[17px] text-text-2">
            Paste a text message
          </label>
          <textarea
            id="try-text"
            value={text}
            readOnly={!ready}
            maxLength={1000}
            rows={4}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 block w-full resize-y rounded-xl border-0 bg-raised p-4 text-[17px] leading-relaxed text-text"
          />
          <p className="mt-6 text-[17px] text-text-3">The tool&rsquo;s own rules, running in your browser. Nothing is sent anywhere.</p>
        </div>
        <div className="min-w-0">
          {/* Only the result is announced as it changes, not the text being typed read back. */}
          <div aria-live="polite">
            <p className="flex items-baseline gap-3">
              <span data-try-score className="type-section text-text tabular-nums">
                {result.risk}
              </span>{" "}
              <span className="type-title text-text">
                <span data-try-level>{LEVEL[result.level]}</span> risk
              </span>
            </p>
            <ul data-try-issues className="mt-4 space-y-1 text-[17px] leading-snug text-text-2">
              {result.issues.length ? result.issues.map((issue) => <li key={issue.msg}>{issue.msg}</li>) : <li>Nothing flagged.</li>}
            </ul>
          </div>
          <p data-try-marked className="mt-6 whitespace-pre-wrap text-[17px] leading-relaxed text-text-2 [overflow-wrap:anywhere]">
            <Marked text={text} ranges={ranges} />
          </p>
          <p className="mt-4 text-[17px]">
            <TextLink href={source.href} external>
              Rules from js/detectors.js
            </TextLink>
          </p>
        </div>
      </div>
    </div>
  );
}
