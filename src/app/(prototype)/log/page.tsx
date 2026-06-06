"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  categoriesByGroup,
  categoriesForPhase,
  getCategory,
  tileColor,
} from "@/lib/categories";
import { usePhase, type Phase } from "@/lib/phase";
import { useEntries } from "@/lib/journal-store";
import { Illustration } from "@/components/Illustration";

// Section order + labels for the composer live inline in the render (see
// `displaySections` below): Memory-first framing, and Food + Activity are
// merged into one "Care" section (Jonas round-3 s6 "Combine in Care like in
// Memories"), matching how the Moments tab already groups them.

/**
 * Phase-appropriate fallback pool for the "Right now" picks.
 *
 * The grid is driven by the user's most-logged categories (per Jonas's slide 14:
 * "babies sleep and eat at all sorts of times — just show the top 4 they use the
 * most"). When usage data is thin (cold mode / a fresh phase) these sensible
 * defaults backfill so the grid is always 4 tiles.
 */
function fallbackPicks(phase: Phase): string[] {
  if (phase === "pregnancy") return ["weight-mom", "kicks", "hydration", "symptoms"];
  return ["sleep", "nursing", "diaper", "bottle"];
}

export default function AddEventPage() {
  const { phase } = usePhase();
  const router = useRouter();
  const entries = useEntries();
  const groups = categoriesByGroup(phase);

  // Jonas 2026-06-02: during pregnancy, preview the baby-tracking categories that
  // unlock after birth — shown below the menu, greyed + non-clickable so users
  // know it's coming ("blend it out").
  const comingSoon =
    phase === "pregnancy"
      ? categoriesForPhase("parenting").filter(
          (c) => !c.phases.includes("pregnancy") && c.group !== "Memories",
        )
      : [];

  // "Right now" = the 4 categories this phase logs the most. Count entries per
  // category (restricted to this phase's catalog), rank by frequency, then
  // backfill from the phase fallback pool so the grid never shows fewer than 4.
  const phaseCats = categoriesForPhase(phase);
  const phaseCatIds = new Set(phaseCats.map((c) => c.id));
  // Count usage over trackable categories only — Memories (note/photo/quote)
  // shouldn't surface as "Right now" quick-logs even in a memory-heavy phase.
  const trackableIds = new Set(
    phaseCats.filter((c) => c.group !== "Memories").map((c) => c.id),
  );
  const usage = new Map<string, number>();
  for (const e of entries) {
    if (trackableIds.has(e.categoryId)) {
      usage.set(e.categoryId, (usage.get(e.categoryId) ?? 0) + 1);
    }
  }
  const topUsed = [...usage.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
  const orderedIds: string[] = [];
  for (const id of [...topUsed, ...fallbackPicks(phase)]) {
    if (orderedIds.length >= 4) break;
    if (phaseCatIds.has(id) && !orderedIds.includes(id)) orderedIds.push(id);
  }
  const suggestions = orderedIds
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
        {/* Right now — the phase's most-logged categories */}
        <section className="bg-[var(--color-primary-softer)] rounded-2xl p-4 space-y-3">
          {/* Jonas s14: the "✦ Right now" title is CROSSED OUT on the slide (an
              X drawn over it) — only the small usage caption remains. Don't
              re-add a heading here. */}
          <div className="flex items-baseline justify-end">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              based on your use
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
                  style={{ color: `var(--color-${tileColor(c)})` }}
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

        {/* Full grouped list — Memories first; Food + Activity merged into one
         *  "Care" section (Jonas round-3 s6), matching the Moments tab. */}
        {([
          ["Memories", groups["Memories"]],
          ["Care", [...groups["Food"], ...groups["Activity"]]],
          ["Growth rate", groups["Growth rate"]],
          ["Health", groups["Health"]],
          ["Mom's wellbeing", groups["Wellbeing"]],
          ["Pregnancy", groups["Pregnancy"]],
        ] as const).map(([label, cats]) => {
          if (!cats || cats.length === 0) return null;
          return (
            <section key={label} className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
                {label}
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
                          backgroundColor: `var(--color-${tileColor(c)}-soft)`,
                          color: `var(--color-${tileColor(c)})`,
                        }}
                      >
                        <Illustration name={c.iconName} className="w-8 h-8" />
                      </div>
                      {c.forMom && phase === "parenting" && (
                        <span
                          className="absolute -top-1 -right-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--color-coral)] text-white ring-2 ring-white leading-none"
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

        {comingSoon.length > 0 && (
          <section className="space-y-3" aria-hidden>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
                After your baby arrives
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                A peek at what you&rsquo;ll track once baby is born.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3 opacity-50 grayscale pointer-events-none select-none">
              {comingSoon.map((c) => (
                <div key={c.id} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `var(--color-${tileColor(c)}-soft)`,
                      color: `var(--color-${tileColor(c)})`,
                    }}
                  >
                    <Illustration name={c.iconName} className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-medium text-neutral-500 text-center leading-tight">
                    {c.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
