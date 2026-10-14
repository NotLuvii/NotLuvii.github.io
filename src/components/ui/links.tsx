import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Apple's small right chevron, drawn to sit on the text baseline. */
export function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 14" width="7" height="12" aria-hidden className={cn("inline-block shrink-0", className)}>
      <path d="M1 1l5.5 6L1 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; external?: boolean };

/** "Learn more >" style text link. `tone="dark"` for black sections. */
export function ChevronLink({ children, className, external, tone = "light", ...rest }: LinkProps & { tone?: "light" | "dark" }) {
  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group inline-flex items-center gap-1.5 hover:underline hover:underline-offset-[3px]",
        tone === "light" ? "text-link" : "text-link-dark",
        className,
      )}
    >
      {children}
      <Chevron className="translate-y-px transition-transform duration-200 group-hover:translate-x-0.5" />
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/** Apple's pill button: solid blue for the main action, outlined for the second. */
export const pill = (variant: "solid" | "outline" = "solid", size: "md" | "sm" = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-normal transition-colors duration-200",
    size === "md" ? "min-h-11 px-[22px] py-[11px] text-[17px]" : "min-h-7 px-[11px] py-1 text-[12px]",
    variant === "solid" ? "bg-blue text-white hover:bg-blue-hover" : "text-blue ring-1 ring-inset ring-blue hover:bg-blue hover:text-white",
  );
