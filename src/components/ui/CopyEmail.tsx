"use client";

import { useRef, useState } from "react";
import { button } from "./links";

/**
 * The address as selectable text, with a button that copies it. If the browser refuses clipboard
 * access, the address is selected instead and the message says how to finish copying.
 */
export function CopyEmail({ email }: { email: string }) {
  const text = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");

  const selectAddress = () => {
    const el = text.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      selectAddress();
      setState("selected");
    }
  };

  return (
    <div>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <span
          ref={text}
          className="select-all text-[clamp(1.375rem,2.4vw,2.25rem)] font-semibold text-text [font-stretch:92%] [overflow-wrap:anywhere]"
        >
          {email}
        </span>
        <button type="button" onClick={copy} className={button("secondary")}>
          {state === "copied" ? "Copied" : "Copy email address"}
        </button>
      </div>
      <p className="type-small mt-3 min-h-[1.5em] text-text-3" role="status" aria-live="polite">
        {state === "copied" ? "Email address copied to your clipboard." : state === "selected" ? "Couldn’t copy automatically. The address is selected: press Ctrl+C, or ⌘C on a Mac." : ""}
      </p>
    </div>
  );
}
