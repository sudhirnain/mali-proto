"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveTimer } from "@/lib/active-timer";
import { getCategory } from "@/lib/categories";
import { Illustration } from "./Illustration";

/**
 * Floating timer chips — surface running timers (sleep, pumping, etc.) across
 * all prototype routes, stacked just above the bottom tab bar inside the phone
 * shell. Multiple timers stack vertically so concurrent sessions (Sleep +
 * Pumping) each get their own pill. Tap returns to the originating log form to
 * stop it. Renders nothing when no timer is running.
 */
export function ActiveTimerChip() {
  const { timers } = useActiveTimer();
  const pathname = usePathname();
  // Hide on entry-form routes (/log/<category>) — those have a sticky Save bar
  // pinned to the bottom that the centered chip would collide with.
  if (timers.length === 0 || pathname?.startsWith("/log/")) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-40 flex flex-col-reverse items-center gap-2">
      {timers.map((t) => (
        <TimerPill key={t.categoryId} categoryId={t.categoryId} />
      ))}
    </div>
  );
}

function TimerPill({ categoryId }: { categoryId: string }) {
  const { elapsedSec } = useActiveTimer();
  const cat = getCategory(categoryId);
  if (!cat) return null;

  const sec = elapsedSec(categoryId);
  const mm = Math.floor(sec / 60).toString().padStart(2, "0");
  const ss = (sec % 60).toString().padStart(2, "0");

  return (
    <Link
      href={`/log/${categoryId}`}
      className="flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full shadow-lg active:scale-[0.98] transition"
      style={{ backgroundColor: `var(--color-${cat.color})` }}
      aria-label={`${cat.label} running, tap to manage`}
    >
      <span className="relative w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-white">
        <Illustration name={cat.iconName} className="w-4 h-4" />
        <span
          className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping"
          aria-hidden
        />
      </span>
      <span className="text-white text-sm font-semibold leading-tight">{cat.label}</span>
      <span className="text-white/90 text-sm font-semibold tabular-nums leading-tight">
        {mm}:{ss}
      </span>
    </Link>
  );
}
