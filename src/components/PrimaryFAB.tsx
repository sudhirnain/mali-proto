import Link from "next/link";

/**
 * Shared floating action button.
 * Lives bottom-right inside the (prototype) layout above the tab bar.
 * Single tap → /log (Add Event sheet). Phase color (coral pregnancy, teal parenting).
 */
export function PrimaryFAB({ href = "/log", label = "Add to Journal" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed z-40 bottom-20 right-4 md:absolute md:bottom-24 md:right-5 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg active:scale-95 transition"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
