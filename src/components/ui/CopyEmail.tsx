"use client";

import { useRef, useState } from "react";
import { pill } from "./links";

/**
 * Shows the address as text anyone can select, with a button that copies it. Email links don't
 * open a mail app for every visitor (embedded pages and some browsers ignore them), so the address
 * itself is always on screen.
 */
export function CopyEmail({ email }: { email: string }) {
  const text = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      // Clipboard refused: select the address so Ctrl+C or Cmd+C finishes the job.
      const range = document.createRange();
      if (text.current) {
        range.selectNodeContents(text.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setState("selected");
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <span ref={text} className="select-all break-all text-[clamp(1.375rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-ink">
        {email}
      </span>
      <button type="button" onClick={copy} className={pill("solid")}>
        {state === "copied" ? "Copied" : "Copy email address"}
      </button>
      <p className="type-small min-h-[1.43em] text-ash" aria-live="polite">
        {state === "copied" ? "The address is on your clipboard." : state === "selected" ? "Address selected. Press Ctrl+C or ⌘C to copy it." : ""}
      </p>
    </div>
  );
}
