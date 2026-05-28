"use client";

import Link from "next/link";
import { useScrollIdleState } from "@/lib/scroll";

/**
 * Shared floating action button.
 * Lives bottom-right inside the (prototype) layout above the tab bar.
 *
 * Slide 9 ("Plus button disappears") — softer interpretation: rather than
 * hiding the FAB outright while scrolling, dim + shrink it while the user
 * is actively reading, then return to full presence ~500ms after they stop.
 * Stays discoverable (you can still tap mid-scroll) but quiets down.
 */
export function PrimaryFAB({ href = "/log", label = "Add to Journal" }: { href?: string; label?: string }) {
  const idle = useScrollIdleState();
  const scrolling = idle === "scrolling";
  return (
    <Link
      href={href}
      aria-label={label}
      className={`fixed z-40 bottom-20 right-4 md:absolute md:bottom-24 md:right-5 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 ease-out ${
        scrolling ? "opacity-40 scale-[0.72] shadow-none" : "opacity-100 scale-100"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
