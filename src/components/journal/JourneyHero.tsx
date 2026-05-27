"use client";

import Link from "next/link";
import Image from "next/image";
import { useBaby } from "@/lib/cold-mode";
import { trimesterFromWeek } from "@/lib/trimester";

/**
 * Hero tile for the pregnancy "Your journey" section. Shows the current
 * gestational week + trimester + countdown. Tap → weekly content on feed
 * (no dedicated week detail page yet; P2 work).
 */
export function JourneyHero({ variant = "section" }: { variant?: "section" | "header" } = {}) {
  const baby = useBaby();
  const week = baby.week ?? 24;
  const weeksLeft = Math.max(0, 40 - week);
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
  const pct = Math.min(100, Math.round((week / 40) * 100));

  const weekArt = `/mali-art/weekly/w${week}.png`;
  const t = trimesterFromWeek(week);

  return (
    <Link
      href={`/journal/trimester/${t}`}
      className={`
        block rounded-3xl p-4 active:scale-[0.99] transition
        ${variant === "section" ? "mx-1 bg-[var(--color-primary-softer)]" : "bg-white/50 backdrop-blur"}
      `}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0">
          <div className="serif text-[21px] font-semibold text-neutral-900 leading-none tracking-tight">
            Week {week}
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            Trimester {trimester} · {weeksLeft} {weeksLeft === 1 ? "week" : "weeks"} to go
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/70 flex items-center justify-center shrink-0 overflow-hidden relative">
          <Image
            src={weekArt}
            alt=""
            width={64}
            height={64}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-neutral-600 mt-2 font-medium">
          <span>{pct}% through pregnancy</span>
          <span>Read this week →</span>
        </div>
      </div>
    </Link>
  );
}
