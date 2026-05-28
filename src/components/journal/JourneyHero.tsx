"use client";

import Image from "next/image";
import { useBaby } from "@/lib/cold-mode";

const TRIMESTER_LABEL = ["1st", "2nd", "3rd"];

/**
 * Hero tile for the pregnancy "Your journey" section. Shows trimester +
 * gestational week + size comparison + progress + due date (slide 6 layout).
 *
 * Due-date tap action wired in A5b alongside the StatStrip right-ring rework.
 */
export function JourneyHero({ variant = "section" }: { variant?: "section" | "header" } = {}) {
  const baby = useBaby();
  const week = baby.week ?? 24;
  const weeksLeft = Math.max(0, 40 - week);
  const trimesterIdx = week <= 13 ? 0 : week <= 27 ? 1 : 2;
  const pct = Math.min(100, Math.round((week / 40) * 100));

  const weekArt = `/mali-art/weekly/w${week}.png`;

  return (
    <div
      className={`
        block rounded-3xl p-4
        ${variant === "section" ? "mx-1 bg-[var(--color-primary-softer)]" : "bg-white/50 backdrop-blur"}
      `}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
            {TRIMESTER_LABEL[trimesterIdx]} trimester
          </div>
          <div className="serif text-[21px] font-semibold text-neutral-900 leading-none tracking-tight mt-1">
            Week {week}
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {weeksLeft} {weeksLeft === 1 ? "week" : "weeks"} to go
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
    </div>
  );
}
