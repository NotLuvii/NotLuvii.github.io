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
        "group inline-flex min-h-11 items-center gap-1.5 text-text underline-offset-4 hover:underline active:opacity-70",
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

export type ButtonVariant = "primary" | "secondary" | "light" | "outline";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-amber font-semibold text-on-amber hover:bg-amber-hover",
  secondary: "bg-raised text-text hover:bg-[#2c2c2e]",
  light: "bg-text text-on-amber hover:bg-white",
  // A 1px ring drawn as an outline (no borders or shadows on this site). Utilities outrank the
  // base focus style, so the amber focus ring is restated here.
  outline:
    "text-text outline outline-1 -outline-offset-1 outline-text-3 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
};

/**
 * Pill buttons, as on apple.com: solid amber for the one main action, a light pill for a tile's
 * main link, an outline pill beside it, and a filled grey for the header's resume button. All
 * shrink slightly the moment they're pressed, so a tap is answered before the finger lifts.
 */
export const button = (variant: ButtonVariant = "primary", size: "md" | "sm" = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium",
    "transition-[scale,background-color] duration-150 ease-out active:scale-[0.97]",
    size === "md" ? "min-h-11 px-[22px] text-[17px]" : "relative min-h-9 px-4 text-[14px] after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    variants[variant],
  );

/** For a pair of pills that stack on a phone: the same width there, so they line up; natural width from 640px. */
export const pairedPill = "w-60 sm:w-auto";

/** Same as `button`, as a link, with the new-tab note and arrow for external destinations. */
export function ButtonLink({
  children,
  className,
  external,
  variant = "primary",
  size = "md",
  ...rest
}: AnchorProps & { variant?: ButtonVariant; size?: "md" | "sm" }) {
  return (
    <Anchor {...rest} {...(external ? externalProps : {})} data-variant={variant} className={cn(button(variant, size), className)}>
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
