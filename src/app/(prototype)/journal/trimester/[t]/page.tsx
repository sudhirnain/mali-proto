"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { useEntries } from "@/lib/journal-store";
import { useBaby } from "@/lib/cold-mode";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryFAB } from "@/components/PrimaryFAB";
import { categoriesForPhase } from "@/lib/categories";
import { TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { isSameDay } from "@/lib/format";
import {
  getTrimester,
  progressThroughTrimester,
  trimesterFromWeek,
  weekOfEntry,
  TRIMESTERS,
  type TrimesterId,
} from "@/lib/trimester";

const DAY_MS = 24 * 60 * 60 * 1000;

function isTrimesterId(v: string): v is TrimesterId {
  return v === "t1" || v === "t2" || v === "t3";
}

export default function TrimesterArchivePage() {
  const params = useParams<{ t: string }>();
  const router = useRouter();
  const baby = useBaby();
  const entries = useEntries();
  const week = baby.week ?? 24;

  if (!isTrimesterId(params.t)) {
    return (
      <div className="pb-24 md:pt-11 p-6">
        <h1 className="text-xl font-semibold">Unknown trimester</h1>
        <Link href="/journal" className="text-[var(--color-primary)] underline text-sm mt-2 inline-block">
          Back to Journal
        </Link>
      </div>
    );
  }

  const t = getTrimester(params.t);
  const isCurrent = trimesterFromWeek(week) === t.id;
  const isPast = week > t.weekEnd;
  const pct = progressThroughTrimester(week, t.id);

  // Pregnancy-relevant entries that fall in this trimester window.
  const inThis = useMemo(() => {
    const pregIds = new Set(categoriesForPhase("pregnancy").map((c) => c.id));
    return entries
      .filter((e) => pregIds.has(e.categoryId))
      .filter((e) => {
        const w = weekOfEntry(e.at, week);
        return w >= t.weekStart && w <= t.weekEnd;
      })
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [entries, week, t.weekStart, t.weekEnd]);

  const byWeek = useMemo(() => groupByWeek(inThis, week), [inThis, week]);

  return (
    <div className="pb-24">
      {/* Tinted header — bleeds to top:0 of the phone shell */}
      <header className="px-3 pt-4 pb-5 md:pt-[60px] bg-[var(--color-primary-softer)]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 flex items-center justify-center text-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{t.label}</h1>
          <div className="w-9 h-9" aria-hidden />
        </div>

        <div className="px-2 mt-3">
          <div className="serif text-[26px] font-semibold text-neutral-900 leading-tight">
            Weeks {t.weekStart}–{t.weekEnd}
          </div>
          <div className="text-xs text-neutral-700 mt-1">
            {inThis.length} {inThis.length === 1 ? "entry" : "entries"} logged
            {isCurrent && ` · you are in week ${week}`}
            {isPast && " · chapter complete"}
          </div>
          <div className="h-1.5 rounded-full bg-white/70 overflow-hidden mt-3">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* T1 · T2 · T3 spine for navigation between chapters */}
        <div className="px-2 mt-5">
          <div className="flex gap-2">
            {TRIMESTERS.map((tri) => {
              const here = tri.id === t.id;
              const reached = week >= tri.weekStart;
              return (
                <Link
                  key={tri.id}
                  href={`/journal/trimester/${tri.id}`}
                  aria-current={here ? "page" : undefined}
                  className={`flex-1 rounded-2xl px-3 py-2 text-center transition active:scale-[0.98] ${
                    here
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : reached
                      ? "bg-white/70 text-[var(--color-primary-dark)]"
                      : "bg-white/40 text-neutral-500"
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider">{tri.label.replace("Trimester ", "T")}</div>
                  <div className={`text-[10.5px] mt-0.5 ${here ? "text-white/90" : "text-neutral-500"}`}>
                    Wk {tri.weekStart}–{tri.weekEnd}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body — entries grouped by week */}
      {byWeek.length === 0 ? (
        <EmptyState
          icon="note"
          title="No entries this trimester"
          subtitle={
            isCurrent
              ? "Capture your first moment from this chapter."
              : isPast
              ? "This chapter passed without entries — that's OK."
              : "Future you will fill this in."
          }
          cta={isCurrent ? { href: "/log", label: "Add to Journal" } : undefined}
        />
      ) : (
        byWeek.map(([weekNum, weekEntries]) => (
          <WeekSection key={weekNum} weekNum={weekNum} entries={weekEntries} currentWeek={week} />
        ))
      )}

      <PrimaryFAB />
    </div>
  );
}

function WeekSection({
  weekNum,
  entries,
  currentWeek,
}: {
  weekNum: number;
  entries: Entry[];
  currentWeek: number;
}) {
  const isCurrent = weekNum === currentWeek;
  const byDay = useMemo(() => groupByDay(entries), [entries]);

  return (
    <section className="px-5 mt-6 first:mt-5">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="serif text-[19px] font-semibold text-neutral-900 leading-none">
          Week {weekNum}
        </h2>
        {isCurrent && (
          <span className="text-[10.5px] uppercase tracking-wider font-bold text-[var(--color-primary-dark)]">
            This week
          </span>
        )}
      </div>
      {byDay.map(([dayKey, dayEntries]) => (
        <div key={dayKey} className="mb-3">
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-2">
            {formatDayLabel(new Date(dayKey), TODAY_DATE)}
          </p>
          <div className="space-y-2">
            {dayEntries.map((e) => (
              <JournalEntryCard key={e.id} entry={e} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function groupByWeek(entries: Entry[], currentWeek: number): [number, Entry[]][] {
  const map = new Map<number, Entry[]>();
  for (const e of entries) {
    const w = weekOfEntry(e.at, currentWeek);
    if (!map.has(w)) map.set(w, []);
    map.get(w)!.push(e);
  }
  // Descending — most recent week first
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

function groupByDay(entries: Entry[]): [string, Entry[]][] {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = new Date(e.at).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

function formatDayLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) return "Today";
  const yesterday = new Date(today.getTime() - DAY_MS);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
