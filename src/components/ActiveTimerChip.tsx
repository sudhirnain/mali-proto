"use client";

import Link from "next/link";
import { useActiveTimer } from "@/lib/active-timer";
import { getCategory } from "@/lib/categories";
import { Illustration } from "./Illustration";

/**
 * Floating chip that surfaces a running timer (sleep, nursing, etc.) across
 * all prototype routes — pinned just above the bottom tab bar inside the
 * phone shell. Tap returns to the originating log form so the user can stop
 * it. Renders nothing when no timer is running.
 */
export function ActiveTimerChip() {
  const { active, elapsedSec } = useActiveTimer();
  if (!active) return null;
  const cat = getCategory(active.categoryId);
  if (!cat) return null;

  const mm = Math.floor(elapsedSec / 60).toString().padStart(2, "0");
  const ss = (elapsedSec % 60).toString().padStart(2, "0");

  return (
    <Link
      href={`/log/${active.categoryId}`}
      className="absolute left-1/2 -translate-x-1/2 bottom-20 z-40 flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full shadow-lg active:scale-[0.98] transition"
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
