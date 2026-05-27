"use client";

import { useBaby } from "@/lib/cold-mode";
import { momContentForWeek } from "@/lib/mom-content";

/**
 * Pregnancy-only content card pinned to the user's current gestational week.
 * Lives at the top of /feed body to lead with mom — parenting users see Lu
 * content; pregnancy users see content about themselves.
 */
export function MyWeekCard() {
  const baby = useBaby();
  const week = baby.week ?? 20;
  const content = momContentForWeek(week);

  return (
    <article className="mx-4 mt-5 rounded-3xl bg-[var(--color-primary-softer)] p-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]/80">
          For you · this week
        </span>
        <span className="text-[11px] text-[var(--color-primary-dark)]/70 font-medium">
          Week {week}
        </span>
      </div>
      <h2 className="serif text-[22px] font-semibold text-neutral-900 leading-tight tracking-tight">
        {content.title}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {content.lines.map((line, i) => (
          <li
            key={i}
            className="text-[13.5px] leading-relaxed text-neutral-700"
          >
            {line}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 mt-4 text-[12px] font-semibold text-[var(--color-primary-dark)] underline decoration-dotted underline-offset-4 active:opacity-70"
      >
        <span>{content.cta}</span>
        <span aria-hidden>→</span>
      </button>
    </article>
  );
}
