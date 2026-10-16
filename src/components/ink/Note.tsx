import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A handwritten note in the margin, in amber ink (globals.css, ".note"). Real text, read out like any other. */
export function Note({ children, className, as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" }) {
  return (
    <Tag data-ink className={cn("note", className)}>
      {children}
    </Tag>
  );
}
