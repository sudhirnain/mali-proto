"use client";

import Link from "next/link";

/**
 * Shared floating action button.
 * Lives bottom-right inside the (prototype) layout above the tab bar.
 *
 * Slide 9 / round-2 s7 ("Keep plus button big and visible at all times") —
 * the FAB no longer dims or shrinks while scrolling. It stays at full size
 * and opacity throughout, with only the press feedback (active:scale-95).
 */
export function PrimaryFAB({ href = "/log", label = "Add to Journal" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed z-40 bottom-20 right-4 md:absolute md:bottom-24 md:right-5 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 ease-out"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
