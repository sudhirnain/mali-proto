"use client";

import Link from "next/link";
import { Illustration } from "./Illustration";
import { usePhase } from "@/lib/phase";
import { useBaby } from "@/lib/cold-mode";

export type Suggestion = {
  href: string;
  label: string;
  iconName: string;
  /** color var name without the `--color-` prefix, e.g. `cat-food`. */
  color: string;
};

/**
 * Cold-start welcome card shown in the /feed Today panel when there are no
 * entries yet. Three phase-aware suggestion rows reduce the "what should I
 * log?" cognitive load.
 *
 * Differentiation: this is what Mali shows instead of My Baby's bare
 * "Add an event by pressing +". Mali's first surface is warm, named, and
 * specific — not a blank invitation.
 */
export function WelcomeCard() {
  const { phase } = usePhase();
  const baby = useBaby();

  const headline =
    phase === "parenting"
      ? `Welcome, ${baby.name} — let's capture today.`
      : "Let's start your journal today.";

  const suggestions = suggestionsForPhase(phase, baby.name);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm">
      <h3 className="serif text-base font-semibold text-neutral-900 leading-snug px-1">
        {headline}
      </h3>
      <div className="mt-3 space-y-1">
        {suggestions.map((s) => (
          <Link
            key={s.href + s.label}
            href={s.href}
            className="flex items-center gap-3 px-2 py-2.5 rounded-2xl active:scale-[0.98] active:bg-neutral-50 transition"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `var(--color-${s.color}-soft)`,
                color: `var(--color-${s.color})`,
              }}
            >
              <Illustration name={s.iconName} className="w-5 h-5" />
            </div>
            <span className="flex-1 text-sm font-medium text-neutral-800 leading-tight">
              {s.label}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-neutral-400 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function suggestionsForPhase(phase: string, name: string): Suggestion[] {
  if (phase === "pregnancy") {
    return [
      { href: "/log/picture", label: "Take this week's bump photo", iconName: "picture", color: "cat-memory" },
      { href: "/log/kicks", label: "Log a kick session", iconName: "kick", color: "cat-kicks" },
      { href: "/log/note", label: "Note how you're feeling", iconName: "note", color: "cat-memory" },
    ];
  }
  return [
    { href: "/log/nursing", label: `Log ${name}'s first nursing`, iconName: "nursing", color: "cat-food" },
    { href: "/log/picture", label: `Take ${name}'s first Mali photo`, iconName: "picture", color: "cat-memory" },
    { href: "/log/note", label: "Note how today's going", iconName: "note", color: "cat-memory" },
  ];
}
