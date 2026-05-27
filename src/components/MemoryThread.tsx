"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useEntries } from "@/lib/journal-store";
import { usePhase } from "@/lib/phase";
import { Illustration } from "@/components/Illustration";
import { getCategory, categoriesForPhase } from "@/lib/categories";
import { TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { formatTime, isSameDay } from "@/lib/format";

type Anniversary = { daysAgo: number; label: string };

const ANNIVERSARIES: Anniversary[] = [
  { daysAgo: 7, label: "A week ago today" },
  { daysAgo: 14, label: "Two weeks ago today" },
  { daysAgo: 30, label: "A month ago today" },
  { daysAgo: 90, label: "Three months ago today" },
  { daysAgo: 365, label: "A year ago today" },
];

const MEMORY_CATEGORY_IDS = new Set(["note", "picture", "quote", "milestone"]);

/**
 * Pulls the most recent anniversary match (a week ago / month ago / year ago)
 * and surfaces it as a soft "memory thread" card on /feed. Differentiator vs
 * My Baby — the journal resurfaces moments instead of just collecting data.
 */
export function MemoryThread() {
  const entries = useEntries();
  const { phase } = usePhase();

  const memory = useMemo(() => {
    const phaseIds = new Set(categoriesForPhase(phase).map((c) => c.id));
    const phaseEntries = entries.filter((e) => phaseIds.has(e.categoryId));
    return findAnniversaryMemory(phaseEntries, TODAY_DATE);
  }, [entries, phase]);

  if (!memory) return null;

  return <MemoryCard label={memory.label} entry={memory.entry} />;
}

function MemoryCard({ label, entry }: { label: string; entry: Entry }) {
  const cat = getCategory(entry.categoryId);
  if (!cat) return null;

  return (
    <Link
      href={`/journal/entry/${entry.id}`}
      className="block bg-white rounded-3xl shadow-sm p-4 active:scale-[0.99] transition"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[var(--color-primary-dark)]" aria-hidden>
          ✦
        </span>
        <span className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {entry.photo ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
            <Image src={entry.photo} alt="" fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `var(--color-${cat.color}-soft)`,
              color: `var(--color-${cat.color})`,
            }}
            aria-hidden
          >
            <Illustration name={cat.iconName} className="w-7 h-7" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="serif text-[16px] font-semibold text-neutral-900 leading-snug line-clamp-2">
            {entry.meta || cat.label}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {cat.label} · {formatTime(entry.at)}
          </div>
        </div>

        <span className="text-neutral-300 text-lg shrink-0" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}

function findAnniversaryMemory(
  entries: Entry[],
  today: Date
): { label: string; entry: Entry } | null {
  for (const a of ANNIVERSARIES) {
    const target = new Date(today.getTime() - a.daysAgo * 24 * 3600 * 1000);
    const dayEntries = entries.filter((e) => isSameDay(new Date(e.at), target));
    if (dayEntries.length === 0) continue;
    const best = pickMostMemorable(dayEntries);
    return { label: a.label, entry: best };
  }
  return null;
}

function pickMostMemorable(entries: Entry[]): Entry {
  const withPhoto = entries.find((e) => e.photo);
  if (withPhoto) return withPhoto;
  const memory = entries.find((e) => MEMORY_CATEGORY_IDS.has(e.categoryId));
  if (memory) return memory;
  return entries[0];
}
