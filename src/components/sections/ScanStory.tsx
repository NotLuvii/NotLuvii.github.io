"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { ScanStory as Story } from "@/content/projects";
import { sceneProgress } from "@/components/motion/progress";
import { beamOffset, revealedSteps, storyPosition } from "@/components/motion/story";
import { TextLink } from "@/components/ui/links";

/** Height of the sticky site bar; the story is held just below it. */
const BAR = 56;

const levelFor = (score: number, t: Story["thresholds"]) => (score >= t.high ? "High" : score >= t.medium ? "Medium" : "Low");

/** The message, with each step's phrase wrapped in a <mark> that lights when its rule fires. */
function Message({ story, shown }: { story: Story; shown: number }) {
  const parts: ReactNode[] = [];
  let at = 0;
  story.steps.forEach((step, i) => {
    const start = story.text.indexOf(step.phrase, at);
    parts.push(<Fragment key={`t${i}`}>{story.text.slice(at, start)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="story-mark" data-on={i < shown ? "" : undefined}>
        {step.phrase}
      </mark>,
    );
    at = start + step.phrase.length;
  });
  parts.push(<Fragment key="end">{story.text.slice(at)}</Fragment>);
  return <>{parts}</>;
}

/**
 * A result told as you scroll: the section holds on screen while the amber scan line moves down a
 * sample input, and each time it reaches a phrase a rule fired on, the phrase lights, the rule
 * appears with its weight and the score climbs, crossing the tool's own levels, until it lands on
 * the final result. Then the page carries on.
 *
 * The page is rendered in its finished state (every rule shown, the final score), which is what
 * visitors with reduced motion, or without JavaScript, see: nothing is held. Only when motion is
 * allowed does the script rewind it to the start and hold the stage (CSS: [data-live]).
 */
export function ScanStory({ story }: { story: Story }) {
  const n = story.steps.length;
  const total = story.steps.reduce((sum, s) => sum + s.add, 0);
  // "Live" (motion allowed, script running) is written straight onto the element: it only switches
  // CSS (the hold) and the count-up, so it doesn't need a render of its own.
  const live = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(n);
  const [display, setDisplay] = useState(total);
  const shownValue = useRef(total);
  const pin = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);

  const score = story.steps.slice(0, shown).reduce((sum, s) => sum + s.add, 0);

  // The scroll engine for this one section: progress through the hold, to steps and the line's position.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    live.current = true;
    root.current?.setAttribute("data-live", "");
    let stops: number[] = [];
    let height = 0;
    let frame = 0;
    let last = -1;

    const measure = () => {
      const b = box.current;
      if (!b) return;
      const top = b.getBoundingClientRect().top;
      height = b.clientHeight;
      stops = [...b.querySelectorAll("mark")].map((m) => m.getBoundingClientRect().bottom - top);
    };
    const update = () => {
      frame = 0;
      const el = pin.current;
      const line = beam.current;
      if (!el || !line) return;
      const progress = sceneProgress("pin", el.getBoundingClientRect(), window.innerHeight, BAR);
      const position = storyPosition(progress, n);
      const revealed = revealedSteps(position, n);
      if (revealed !== last) {
        last = revealed;
        setShown(revealed);
      }
      line.style.transform = `translateY(${beamOffset(position, stops, height)}px)`;
      line.style.opacity = progress > 0 && position < n + 1 ? "1" : "0";
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      request();
    };

    const resize = new ResizeObserver(remeasure);
    if (box.current) resize.observe(box.current);
    document.fonts?.ready.then(remeasure);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", remeasure);
    remeasure();
    return () => {
      resize.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", remeasure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [n]);

  // The number counts quickly to each new score rather than jumping (only while live).
  useEffect(() => {
    if (!live.current) return;
    const from = shownValue.current;
    if (from === score) return;
    const start = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 320);
      const value = Math.round(from + (score - from) * (1 - (1 - k) ** 3));
      shownValue.current = value;
      setDisplay(value);
      if (k < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [score]);

  const level = levelFor(display, story.thresholds);

  return (
    <div ref={root} data-story data-frame className="story mt-12 text-left md:mt-16">
      <div ref={pin} data-story-pin className="story-pin">
        <div data-story-stage className="story-stage">
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 px-gutter md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16">
            <div className="min-w-0">
              <p className="type-small text-text-3">{story.label}</p>
              <div ref={box} className="relative mt-3 overflow-hidden rounded-xl bg-raised px-5 py-5 md:px-8 md:py-7">
                <p className="type-statement whitespace-pre-line text-text-3">
                  <Message story={story} shown={shown} />
                </p>
                <div ref={beam} aria-hidden className="story-beam" />
              </div>
              <p className="mt-3 text-[17px] text-text-3">
                The tool’s own rules, applied one at a time.{" "}
                <TextLink href={story.source.href} external>
                  View the rules on GitHub
                </TextLink>
              </p>
            </div>

            <div className="min-w-0">
              <p className="type-small text-text-3">Risk score</p>
              <p aria-hidden className="mt-1 flex items-baseline gap-4">
                <span data-story-score className="type-figure text-text">
                  {display}
                </span>
                <span data-story-level className="type-title text-text">
                  {level}
                </span>
              </p>
              <p className="sr-only">
                Risk score after all {n} rules: {total}, {levelFor(total, story.thresholds)}.
              </p>
              <div aria-hidden className="story-bar">
                <i style={{ transform: `scaleX(${Math.min(display, 100) / 100})` }} />
              </div>
              <ol className="mt-5 space-y-1 md:mt-7">
                {story.steps.map((s, i) => (
                  <li key={s.rule} data-story-rule data-on={i < shown ? "" : undefined} className="story-rule grid grid-cols-[3rem_minmax(0,1fr)] text-[15px] leading-snug md:text-[17px]">
                    <span className="font-semibold text-text">+{s.add}</span>
                    <span>{s.rule}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
