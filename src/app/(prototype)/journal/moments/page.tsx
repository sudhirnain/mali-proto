"use client";

import { useMemo } from "react";
import { useEntries } from "@/lib/journal-store";
import { usePhase } from "@/lib/phase";
import {
  categoriesForPhase,
  journalSectionsForPhase,
  type JournalSection,
} from "@/lib/categories";
import { CategoryTile } from "@/components/journal/CategoryTile";
import { MilestoneHero } from "@/components/journal/MilestoneHero";
import { JourneyHero } from "@/components/journal/JourneyHero";
import { PrimaryFAB } from "@/components/PrimaryFAB";
import { ViewTabs } from "../page";
import type { Entry } from "@/lib/mock-entries";

export default function MomentsPage() {
  const { phase } = usePhase();
  const entries = useEntries();
  const sections = useMemo(() => journalSectionsForPhase(phase), [phase]);

  const phaseEntryCount = useMemo(() => {
    const ids = new Set(categoriesForPhase(phase).map((c) => c.id));
    return entries.filter((e) => ids.has(e.categoryId)).length;
  }, [entries, phase]);

  return (
    <div className="pb-24 md:pt-11">
      <header className="px-5 pt-7 pb-2">
        <h1 className="serif text-[28px] font-semibold text-neutral-900 leading-none">
          Journal
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {describeBreadth(phaseEntryCount, sections, entries)}
        </p>
      </header>

      <ViewTabs current="moments" />

      <div className="pt-2">
        {sections.map((s) => (
          <Section key={s.id} section={s} />
        ))}
      </div>

      <PrimaryFAB />
    </div>
  );
}

function Section({ section }: { section: JournalSection }) {
  const entries = useEntries();
  const sectionEntries = entries.filter((e) => section.categoryIds.includes(e.categoryId));
  const heroOnly = Boolean(section.hero) && section.categoryIds.length === 0;
  const hasHero = Boolean(section.hero);
  const hasTiles = section.categoryIds.length > 0;

  return (
    <section className="px-4 pt-6">
      {!heroOnly && (
        <div className="flex items-baseline justify-between px-1 pb-2.5">
          <span className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-neutral-400">
            {section.label}
          </span>
          <span className="text-[11px] text-neutral-400">
            {sectionSummary(section, sectionEntries.length)}
          </span>
        </div>
      )}

      {section.hero === "milestones" && <MilestoneHero />}
      {section.hero === "weekly-journey" && <JourneyHero />}

      {hasTiles && (
        <div className={`grid grid-cols-3 gap-2 px-1 ${hasHero ? "mt-3" : "mt-1"}`}>
          {section.categoryIds.map((id) => (
            <CategoryTile key={id} categoryId={id} entries={entries} />
          ))}
        </div>
      )}
    </section>
  );
}

function sectionSummary(section: JournalSection, entryCount: number): string {
  // Hero-only sections never render their label/summary (heroOnly path).
  // For hero + tiles sections (e.g. Development), the count reflects tile
  // entries only — the hero shows its own progress.
  return `${entryCount} ${entryCount === 1 ? "entry" : "entries"}`;
}

/**
 * "23 entries across memories, care logs, and growth" — names the populated
 * sections so the header reads conversationally instead of "across 5 areas."
 * Hero-only sections (Development, Your journey) speak via their hero tile
 * and are intentionally omitted from this sentence.
 */
function describeBreadth(
  entryCount: number,
  sections: JournalSection[],
  entries: Entry[]
): string {
  const word = entryCount === 1 ? "entry" : "entries";
  const populated = sections
    .filter((s) => s.categoryIds.length > 0)
    .filter((s) => entries.some((e) => s.categoryIds.includes(e.categoryId)))
    .map((s) => s.label.toLowerCase());

  if (populated.length === 0) return `${entryCount} ${word}`;
  const joined =
    populated.length === 1
      ? populated[0]
      : populated.length === 2
      ? `${populated[0]} and ${populated[1]}`
      : `${populated.slice(0, -1).join(", ")}, and ${populated[populated.length - 1]}`;
  return `${entryCount} ${word} across ${joined}`;
}
