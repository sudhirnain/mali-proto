"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { categoriesByGroup, getCategory, type CategoryGroup } from "@/lib/categories";
import { usePhase, type Phase } from "@/lib/phase";
import { TODAY_DATE } from "@/lib/mock-entries";
import { Illustration } from "@/components/Illustration";

// Memory-first ordering: leading the page with notes / photos / milestones /
// quotes frames "Add to Journal" as moment-capture, with care / health / etc.
// following. Pregnancy is at the end for parenting users (mostly empty) and
// surfaces naturally for pregnancy users where Memories is still first.
const GROUP_ORDER: CategoryGroup[] = [
  "Memories",
  "Food",
  "Activity",
  "Growth rate",
  "Health",
  "Mood",
  "Wellbeing",
  "Pregnancy",
];

/**
 * Time-of-day + phase aware "Right now" picks.
 *
 * Mali's lightweight differentiator vs My Baby's flat catalog — the user
 * gets 4 contextual shortcuts before the full grouped list.
 */
function suggestionsForNow(phase: Phase, hour: number): string[] {
  if (phase === "pregnancy") {
    if (hour >= 21 || hour < 5) return ["sleep-mom", "hydration", "symptoms", "weight-mom"]; // night
    if (hour >= 17) return ["contractions", "symptoms", "hydration", "sleep-mom"];           // evening
    if (hour >= 11) return ["hydration", "symptoms", "weight-mom", "contractions"];          // day
    return ["hydration", "weight-mom", "symptoms", "sleep-mom"];                              // morning
  }
  if (hour >= 21 || hour < 5) return ["sleep", "nursing", "diaper", "bottle"]; // night
  if (hour >= 17) return ["bathing", "solids", "diaper", "bottle"]; // evening
  if (hour >= 11) return ["nursing", "diaper", "stroll", "bottle"]; // afternoon
  return ["diaper", "nursing", "bottle", "cheerful"]; // morning
}

export default function AddEventPage() {
  const { phase } = usePhase();
  const router = useRouter();
  const groups = categoriesByGroup(phase);
  // Use the prototype's anchored "today" so demo behavior is deterministic.
  const hour = TODAY_DATE.getHours();
  const suggestions = suggestionsForNow(phase, hour)
    .map(getCategory)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="pb-12 md:pt-11">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-9 h-9 -ml-2 flex items-center justify-center text-neutral-700"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">Add to Journal</h1>
        <span className="w-9" aria-hidden />
      </header>

      <div className="px-4 space-y-7">
        {/* Right now — phase + time-of-day shortcuts */}
        <section className="bg-[var(--color-primary-softer)] rounded-2xl p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-primary-dark)] tracking-tight inline-flex items-center gap-1.5">
              <span aria-hidden>✦</span> Right now
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              based on time of day
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {suggestions.map((c) => (
              <Link
                key={c.id}
                href={`/log/${c.id}`}
                className="flex flex-col items-center gap-1.5 active:scale-[0.96] transition"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-white"
                  style={{ color: `var(--color-${c.color})` }}
                >
                  <Illustration name={c.iconName} className="w-8 h-8" />
                </div>
                <div className="text-xs font-medium text-neutral-700 text-center leading-tight">
                  {c.label}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Full grouped list — Memories first frames the page as moment-first */}
        {GROUP_ORDER.map((group) => {
          const cats = groups[group];
          if (!cats || cats.length === 0) return null;
          return (
            <section key={group} className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
                {group}
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {cats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/log/${c.id}`}
                    className="flex flex-col items-center gap-1.5 active:scale-[0.96] transition"
                  >
                    <div className="relative">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `var(--color-${c.color}-soft)`,
                          color: `var(--color-${c.color})`,
                        }}
                      >
                        <Illustration name={c.iconName} className="w-8 h-8" />
                      </div>
                      {c.forMom && phase === "parenting" && (
                        <span
                          className="absolute -top-1 -right-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white ring-2 ring-white leading-none"
                          aria-label="For mom"
                        >
                          Mom
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-neutral-700 text-center leading-tight">
                      {c.label}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
