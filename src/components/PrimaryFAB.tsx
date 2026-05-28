"use client";

import Link from "next/link";
import { useScrollingDown } from "@/lib/scroll";

/**
 * Shared floating action button.
 * Lives bottom-right inside the (prototype) layout above the tab bar.
 *
 * Slide 9 ("Plus button disappears") — the FAB fades out when the user is
 * scrolling down through content, and slides back when they scroll up or
 * reach the top. Same hide-on-scroll-down behavior as iOS's compose buttons.
 */
export function PrimaryFAB({ href = "/log", label = "Add to Journal" }: { href?: string; label?: string }) {
  const scrollingDown = useScrollingDown();
  return (
    <Link
      href={href}
      aria-label={label}
      className={`fixed z-40 bottom-20 right-4 md:absolute md:bottom-24 md:right-5 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 ${
        scrollingDown ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
