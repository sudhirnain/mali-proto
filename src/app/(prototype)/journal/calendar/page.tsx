"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { useEntries } from "@/lib/journal-store";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryFAB } from "@/components/PrimaryFAB";
import { ViewTabs } from "../page";
import { isSameDay } from "@/lib/format";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date(TODAY_DATE.getFullYear(), TODAY_DATE.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date>(TODAY_DATE);

  const allEntries = useEntries();
  const cells = useMemo(() => buildMonthCells(cursor), [cursor]);
  const entriesByDay = useMemo(() => groupByDayKey(allEntries), [allEntries]);

  // Count of entries within the cursor's month
  const monthEntryCount = useMemo(() => {
    const m = cursor.getMonth();
    const y = cursor.getFullYear();
    return allEntries.filter((e) => {
      const d = new Date(e.at);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  }, [allEntries, cursor]);

  const selectedKey = selectedDay.toDateString();
  const selectedEntries = entriesByDay.get(selectedKey) ?? [];

  function shiftMonth(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  return (
    <div className="pb-24 md:pt-11">
      <header className="px-5 pt-7 pb-2">
        <h1 className="serif text-[28px] font-semibold text-neutral-900 leading-none">Journal</h1>
        <p className="text-xs text-neutral-500 mt-1">
          {monthEntryCount} {monthEntryCount === 1 ? "entry" : "entries"} · {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
      </header>

      <ViewTabs current={"calendar"} />

      {/* Month grid — clean white surface, primary color carries the rhythm */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 transition"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <div className="serif text-[17px] font-semibold text-neutral-900">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </div>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 transition"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="text-[10px] text-neutral-400 text-center font-semibold uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" aria-hidden />;
            const dayEntries = entriesByDay.get(cell.toDateString()) ?? [];
            const photoEntry = dayEntries.find((e) => e.photo);
            const isToday = isSameDay(cell, TODAY_DATE);
            const isSelected = isSameDay(cell, selectedDay);
            const tint = tintFor(dayEntries.length);

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(cell)}
                className={`
                  aspect-square rounded-xl relative overflow-hidden
                  flex items-center justify-center transition active:scale-95
                  ${isSelected ? "ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-white" : ""}
                `}
                style={
                  photoEntry
                    ? undefined
                    : tint
                    ? { backgroundColor: tint }
                    : undefined
                }
              >
                {photoEntry && (
                  <>
                    <Image
                      src={photoEntry.photo!}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </>
                )}

                <span
                  className={`relative text-[12px] font-semibold leading-none tabular-nums ${
                    isToday
                      ? "bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center"
                      : photoEntry
                      ? "bg-white/90 text-neutral-900 px-1.5 py-0.5 rounded-md shadow-sm"
                      : "text-neutral-700"
                  }`}
                >
                  {cell.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected-day entries */}
      <section className="px-5 mt-7">
        <h2 className="serif text-[19px] font-semibold text-neutral-900 leading-none mb-1">
          {dayHeading(selectedDay)}
        </h2>
        <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-3">
          {selectedEntries.length} {selectedEntries.length === 1 ? "entry" : "entries"}
        </p>
        {selectedEntries.length === 0 ? (
          <EmptyState
            icon="note"
            title="Nothing logged that day"
            subtitle="Tap a tinted tile or a photo tile to see what's there."
            cta={{ href: "/log", label: "Add an entry" }}
          />
        ) : (
          <div className="space-y-2">
            {selectedEntries
              .slice()
              .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
              .map((e) => (
                <JournalEntryCard key={e.id} entry={e} />
              ))}
          </div>
        )}
      </section>

      <PrimaryFAB />
    </div>
  );
}

/** Returns a primary-color tint that intensifies with entry count. Five stops
 *  so a steady-logging week visibly differs from a slow week even when both
 *  sit under 5 entries/day. */
function tintFor(count: number): string | null {
  if (count === 0) return null;
  if (count === 1) return "color-mix(in srgb, var(--color-primary-softer) 60%, white)";
  if (count === 2) return "var(--color-primary-softer)";
  if (count <= 4) return "var(--color-primary-soft)";
  if (count <= 7) return "var(--color-primary-bright)";
  return "var(--color-primary)";
}

function buildMonthCells(monthStart: Date): (Date | null)[] {
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function groupByDayKey(entries: Entry[]): Map<string, Entry[]> {
  const m = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = new Date(e.at).toDateString();
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(e);
  }
  return m;
}

function dayHeading(date: Date): string {
  if (isSameDay(date, TODAY_DATE)) return "Today";
  const yesterday = new Date(TODAY_DATE.getTime() - 24 * 60 * 60 * 1000);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
