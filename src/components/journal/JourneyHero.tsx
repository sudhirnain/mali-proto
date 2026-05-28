"use client";

import { useBaby } from "@/lib/cold-mode";

const TRIMESTER_LABEL = ["1st", "2nd", "3rd"];

/**
 * Hero tile for the pregnancy "Your journey" section. Slide 6 layout:
 * trimester label · Week N · progress bar · Due date YYYY.
 *
 * No weekly illustration — that's already in the StatStrip center hero
 * and rendering it twice was redundant.
 *
 * No "X weeks to go" subline and no days-to-due counter — the progress
 * bar conveys position and the due date is the absolute reference.
 *
 * No edit affordance for the due date here either — it's read-only text.
 */
export function JourneyHero({ variant = "section" }: { variant?: "section" | "header" } = {}) {
  const baby = useBaby();
  const week = baby.week ?? 24;
  const trimesterIdx = week <= 13 ? 0 : week <= 27 ? 1 : 2;
  const pct = Math.min(100, Math.round((week / 40) * 100));
  const dueDate = baby.dueDate;

  return (
    <div
      className={`
        block rounded-3xl p-4
        ${variant === "section" ? "mx-1 bg-[var(--color-primary-softer)]" : "bg-white/50 backdrop-blur"}
      `}
    >
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
          {TRIMESTER_LABEL[trimesterIdx]} trimester
        </div>
        <div className="serif text-[24px] font-semibold text-neutral-900 leading-none tracking-tight mt-1">
          Week {week}
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
          {dueDate && (
            <span className="font-semibold text-[var(--color-primary-dark)]">
              Due date {dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
