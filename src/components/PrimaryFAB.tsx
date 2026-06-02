"use client";

import Link from "next/link";
import { useScrolledPast } from "@/lib/scroll";

/**
 * Shared floating action button.
 * Lives bottom-right inside the (prototype) layout above the tab bar.
 *
 * Default: stays big and visible at all times (round-2 s7, Journal).
 *
 * `hideOnScroll` (round-2 s3, Feed: "Make this disappear when scrolling down —
 * we prefer not to have it"): once the user scrolls into the content the FAB
 * fully fades out (not just dims) and stops catching taps; it returns near the
 * top. The two screens want opposite behavior, hence the per-screen flag.
 */
export function PrimaryFAB({
  href = "/log",
  label = "Add to Journal",
  hideOnScroll = false,
}: {
  href?: string;
  label?: string;
  hideOnScroll?: boolean;
}) {
  const scrolled = useScrolledPast(80);
  const hidden = hideOnScroll && scrolled;
  return (
    <Link
      href={href}
      aria-label={label}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className={`fixed z-40 bottom-20 right-4 md:absolute md:bottom-24 md:right-5 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg transition-all duration-300 ease-out ${
        hidden ? "opacity-0 scale-75 translate-y-2 pointer-events-none" : "opacity-100 scale-100 active:scale-95"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
