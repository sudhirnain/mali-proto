"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { CATEGORIES, categoriesForPhase } from "@/lib/categories";
import { usePhase } from "@/lib/phase";
import { useBaby } from "@/lib/cold-mode";
import {
  getTrimester,
  trimesterFromWeek,
  weekOfEntry,
  type TrimesterId,
} from "@/lib/trimester";
import { useEntries } from "@/lib/journal-store";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryFAB } from "@/components/PrimaryFAB";
import { suggestionsForPhase } from "@/components/WelcomeCard";
import { Illustration } from "@/components/Illustration";
import { isSameDay } from "@/lib/format";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDayLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) return "Today";
  const yesterday = new Date(today.getTime() - DAY_MS);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function JournalPage() {
  const { phase } = usePhase();
  const entries = useEntries();

  const phaseCatIds = useMemo(
    () => new Set(categoriesForPhase(phase).map((c) => c.id)),
    [phase]
  );

  const phaseEntryCount = useMemo(
    () => entries.filter((e) => phaseCatIds.has(e.categoryId)).length,
    [phaseCatIds, entries]
  );

  const weekEntryCount = useMemo(() => {
    const cutoff = new Date(TODAY_DATE.getTime() - 7 * 24 * 60 * 60 * 1000);
    return entries.filter(
      (e) => phaseCatIds.has(e.categoryId) && new Date(e.at) >= cutoff
    ).length;
  }, [phaseCatIds, entries]);

  if (phaseEntryCount === 0) {
    return <JournalCold />;
  }

  return (
    <div className="pb-24 md:pt-11">
      <header className="px-5 pt-7 pb-2">
        <h1 className="serif text-[28px] font-semibold text-neutral-900 leading-none">
          Journal
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {weekEntryCount} {weekEntryCount === 1 ? "entry" : "entries"} this week
        </p>
      </header>

      <ViewTabs current="timeline" />

      <TimeView />

      <PrimaryFAB />
    </div>
  );
}

/**
 * Three views: Timeline (time) · Moments (type) · Calendar (date).
 *
 * Moments replaced the old Milestones tab — milestone was a content type
 * dressed as a view-mode. Milestones is now the hero tile inside the
 * Development section of /journal/moments, with progress + next-up.
 */
export function ViewTabs({ current }: { current: "timeline" | "moments" | "calendar" }) {
  return (
    <nav className="px-5 mt-3 pb-1 border-b border-neutral-100">
      <div className="flex items-center gap-5 text-[13px]">
        <TabLink href="/journal" label="Timeline" active={current === "timeline"} />
        <TabLink href="/journal/moments" label="Moments" active={current === "moments"} />
        <TabLink href="/journal/calendar" label="Calendar" active={current === "calendar"} />
      </div>
    </nav>
  );
}

function TabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`pb-2 -mb-px border-b-2 transition ${
        active
          ? "border-[var(--color-primary)] text-neutral-900 font-semibold"
          : "border-transparent text-neutral-500 font-medium"
      }`}
    >
      {label}
    </Link>
  );
}

function TimeView() {
  const { phase } = usePhase();
  const entries = useEntries();
  const baby = useBaby();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const phaseCategoryIds = useMemo(
    () => new Set(categoriesForPhase(phase).map((c) => c.id)),
    [phase]
  );

  const chipCategories = useMemo(() => {
    const ids = new Set(
      entries.filter((e) => phaseCategoryIds.has(e.categoryId)).map((e) => e.categoryId)
    );
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [phaseCategoryIds, entries]);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => phaseCategoryIds.has(e.categoryId))
      .filter((e) => selected.size === 0 || selected.has(e.categoryId))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [phaseCategoryIds, selected, entries]);

  const byDay = useMemo(() => groupByDay(filtered), [filtered]);

  // Pregnancy phase: wrap day groups in trimester chapters. Each day's
  // trimester is computed from its first entry's estimated gestational week.
  const isPregnancy = phase === "pregnancy";
  const currentWeek = baby.week ?? 24;
  const byTrimester = useMemo<[TrimesterId, [string, Entry[]][]][]>(() => {
    if (!isPregnancy) return [];
    const map = new Map<TrimesterId, [string, Entry[]][]>();
    for (const [dayKey, dayEntries] of byDay) {
      if (dayEntries.length === 0) continue;
      const t = trimesterFromWeek(weekOfEntry(dayEntries[0].at, currentWeek));
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push([dayKey, dayEntries]);
    }
    const order: Record<TrimesterId, number> = { t3: 3, t2: 2, t1: 1 };
    return Array.from(map.entries()).sort((a, b) => order[b[0]] - order[a[0]]);
  }, [byDay, isPregnancy, currentWeek]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // When exactly one category is filtered, offer a shortcut to its detail page
  // (chart + headline). This replaces the dropped "By category" tab.
  const singleSelectedCat = selected.size === 1
    ? CATEGORIES.find((c) => c.id === [...selected][0])
    : null;

  return (
    <>
      {/* Filter chips — "All" matches the category chip shape (circle + label below). */}
      <div className="mt-4">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 pb-2 items-start">
          <button
            onClick={() => setSelected(new Set())}
            aria-pressed={selected.size === 0}
            className="shrink-0 flex flex-col items-center gap-1.5 w-[54px] active:scale-95 transition"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                selected.size === 0
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor" aria-hidden>
                <circle cx="4" cy="4" r="1.6" />
                <circle cx="12" cy="4" r="1.6" />
                <circle cx="4" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
              </svg>
            </div>
            <span
              className={`text-[11px] leading-tight text-center truncate w-full ${
                selected.size === 0 ? "text-neutral-900 font-semibold" : "text-neutral-500 font-medium"
              }`}
            >
              All
            </span>
          </button>

          {chipCategories.map((c) => {
            const on = selected.has(c.id);
            return (
              <FilterChip
                key={c.id}
                label={c.label}
                active={on}
                style={
                  on
                    ? { backgroundColor: `var(--color-${c.color})`, color: "white" }
                    : { backgroundColor: `var(--color-${c.color}-soft)`, color: `var(--color-${c.color})` }
                }
                onClick={() => toggle(c.id)}
              >
                <Illustration name={c.iconName} className="w-5 h-5" />
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* Single-filter → category-detail shortcut, surfaced as a real banner */}
      {singleSelectedCat && (
        <div className="px-5 mt-2">
          <Link
            href={`/journal/category/${singleSelectedCat.id}`}
            className="flex items-center justify-between bg-[var(--color-primary-softer)] rounded-2xl px-4 py-2.5 active:scale-[0.99] transition"
          >
            <span className="text-[13px] font-semibold text-[var(--color-primary-dark)]">
              See {singleSelectedCat.label} chart & stats
            </span>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[var(--color-primary-dark)]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      )}

      <div>
        {byDay.length === 0 && (
          <EmptyState
            icon="note"
            title="No matches"
            subtitle="Try fewer filters or a different category."
          />
        )}

        {/* Pregnancy: chapter-style trimester groupings. Parenting: flat day list. */}
        {isPregnancy
          ? byTrimester.map(([t, days]) => (
              <div key={t}>
                <TrimesterHeader t={t} currentWeek={currentWeek} />
                {days.map(([dayKey, dayEntries]) => (
                  <DayBucket key={dayKey} dayKey={dayKey} dayEntries={dayEntries} />
                ))}
              </div>
            ))
          : byDay.map(([dayKey, dayEntries]) => (
              <DayBucket key={dayKey} dayKey={dayKey} dayEntries={dayEntries} />
            ))}
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  label,
  style,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex flex-col items-center gap-1.5 w-[54px] active:scale-95 transition"
      aria-pressed={active}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center transition"
        style={style}
      >
        {children}
      </div>
      <span
        className={`text-[11px] leading-tight text-center truncate w-full ${
          active ? "text-neutral-900 font-semibold" : "text-neutral-500 font-medium"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function DayBucket({ dayKey, dayEntries }: { dayKey: string; dayEntries: Entry[] }) {
  return (
    <section key={dayKey} className="px-5 mt-7 first:mt-5">
      <h2 className="serif text-[19px] font-semibold text-neutral-900 leading-none mb-1">
        {formatDayLabel(new Date(dayKey), TODAY_DATE)}
      </h2>
      <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-3">
        {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
      </p>
      <div className="space-y-2">
        {dayEntries.map((e) => (
          <JournalEntryCard key={e.id} entry={e} />
        ))}
      </div>
    </section>
  );
}

/**
 * Trimester chapter divider in the pregnancy timeline. Tapping opens the
 * Trimester Archive (curated chapter view of the same entries).
 */
function TrimesterHeader({ t, currentWeek }: { t: TrimesterId; currentWeek: number }) {
  const tri = getTrimester(t);
  const isCurrent = trimesterFromWeek(currentWeek) === t;
  return (
    <div className="px-5 mt-8 first:mt-6">
      <Link
        href={`/journal/trimester/${t}`}
        className="flex items-baseline justify-between gap-2 active:opacity-70 transition"
      >
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
            {tri.label}
          </div>
          <div className="serif text-[15px] font-semibold text-neutral-700 leading-tight mt-0.5">
            Weeks {tri.weekStart}–{tri.weekEnd}
            {isCurrent && (
              <span className="ml-2 text-[10.5px] uppercase tracking-wider font-bold text-[var(--color-primary)]">
                · you are here
              </span>
            )}
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-primary-dark)] underline decoration-dotted underline-offset-4 shrink-0">
          Open chapter →
        </span>
      </Link>
      <div className="h-px bg-neutral-200 mt-3" aria-hidden />
    </div>
  );
}

function JournalCold() {
  const { phase } = usePhase();
  const baby = useBaby();
  const suggestions = suggestionsForPhase(phase, baby.name);

  return (
    <div className="pb-24 md:pt-11">
      <header className="px-5 pt-7 pb-2">
        <h1 className="serif text-[28px] font-semibold text-neutral-900 leading-none">Journal</h1>
        <p className="text-xs text-neutral-500 mt-1">Nothing logged yet</p>
      </header>

      <ViewTabs current="timeline" />

      <div className="px-5 pt-5">{/* welcome card */}
        <div className="bg-[var(--color-primary-softer)] rounded-3xl p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 shadow-sm relative border-2 border-white/50">
            <Image
              src={
                phase === "parenting"
                  ? "/mali-illustrations/pregnant_9.png"
                  : "/mali-illustrations/belly_heart_illustration.png"
              }
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <h2 className="serif text-xl font-semibold text-neutral-900 mb-1.5 leading-snug">
            Your journal starts here
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-5 px-2">
            Every moment with {baby.name} — every nursing, every smile, every photo — lives here.
          </p>

          <div className="bg-white rounded-2xl p-1.5 space-y-0.5 text-left shadow-sm">
            {suggestions.map((s) => (
              <Link
                key={s.href + s.label}
                href={s.href}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl active:bg-neutral-50 transition"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
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
      </div>

      <p className="text-[11px] text-neutral-400 text-center mt-6 px-8 leading-relaxed">
        Tap <span className="font-semibold text-neutral-600">Moments</span> above to browse every
        kind of moment you can capture.
      </p>

      <PrimaryFAB />
    </div>
  );
}

function groupByDay(entries: Entry[]): [string, Entry[]][] {
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = new Date(e.at).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return Array.from(groups.entries());
}
