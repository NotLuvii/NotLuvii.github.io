import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small chevron that sits on the text baseline. `left` points back. */
export function Chevron({ className, left }: { className?: string; left?: boolean }) {
  return (
    <svg viewBox="0 0 8 14" width="7" height="12" aria-hidden className={cn("inline-block shrink-0", left && "rotate-180", className)}>
      <path d="M1 1l5.5 6L1 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Arrow out of a box: marks links that leave the site. */
export function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden className={cn("inline-block shrink-0", className)}>
      <path d="M4.5 1.5h6v6M10.5 1.5 4 8M8.5 7.5v3h-7v-7h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; external?: boolean };

const externalProps = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Another page of this site (not a file, not an in-page jump): rendered with next/link. */
const isPage = (href?: string, download?: unknown) => !!href && href.startsWith("/") && !download && !/\.[a-z0-9]+$/i.test(href.split("#")[0]);

/** An <a>, or a next/link Link for pages of this site. */
function Anchor({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  if (isPage(href, rest.download)) {
    return (
      <Link href={href!} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/**
 * A standalone text link with a chevron (internal) or an arrow (external). At least 44px tall so
 * it's easy to hit on a phone; links inside sentences use plain <a> instead.
 */
export function TextLink({ children, className, external, ...rest }: AnchorProps) {
  return (
    <Anchor
      {...rest}
      {...(external ? externalProps : {})}
      className={cn(
        "group inline-flex min-h-11 items-center gap-1.5 text-text underline-offset-4 transition-colors hover:text-amber hover:underline",
        className,
      )}
    >
      {children}
      {external ? (
        <ExternalIcon className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
      ) : (
        <Chevron className="translate-y-px transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </Anchor>
  );
}

/** Pill buttons: solid amber for the main action, outlined for the second. */
export const button = (variant: "primary" | "secondary" = "primary", size: "md" | "sm" = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors duration-200",
    size === "md" ? "min-h-11 px-5 text-[16px]" : "relative min-h-9 px-4 text-[14px] after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    variant === "primary"
      ? "bg-amber font-semibold text-on-amber hover:bg-amber-hover"
      : "text-text ring-1 ring-inset ring-white/30 hover:ring-amber hover:text-amber",
  );

/** Same as `button`, as a link, with the new-tab note and arrow for external destinations. */
export function ButtonLink({
  children,
  className,
  external,
  variant = "primary",
  size = "md",
  ...rest
}: AnchorProps & { variant?: "primary" | "secondary"; size?: "md" | "sm" }) {
  return (
    <Anchor {...rest} {...(external ? externalProps : {})} className={cn(button(variant, size), className)}>
      {children}
      {external && (
        <>
          <ExternalIcon />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </Anchor>
  );
}
