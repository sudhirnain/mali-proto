"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { getCategory, type Category } from "@/lib/categories";
import { TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { useEntries, useJournalStore } from "@/lib/journal-store";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { EmptyState } from "@/components/EmptyState";
import { Illustration } from "@/components/Illustration";
import { isSameDay } from "@/lib/format";
import { MilestonesBrowser } from "@/components/MilestonesBrowser";
import { categoryArt } from "@/lib/category-art";
import { useBaby } from "@/lib/cold-mode";
import { MILESTONES, currentMilestoneBucket } from "@/lib/mock-milestones";
import { CustomMilestoneSheet } from "@/components/CustomMilestoneSheet";
import { articleForCategory } from "@/lib/articles";
import { useState } from "react";
import Image from "next/image";

const PATTERN_CATEGORIES = new Set(["nursing", "sleep", "diaper", "bottle", "pumping"]);

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDayLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) return "Today";
  const yesterday = new Date(today.getTime() - DAY_MS);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cat = getCategory(params.id);
  const allEntries = useEntries();

  const entries = useMemo(
    () =>
      allEntries
        .filter((e) => e.categoryId === params.id)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [params.id, allEntries]
  );

  const byDay = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of entries) {
      const k = new Date(e.at).toDateString();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return Array.from(m.entries());
  }, [entries]);

  if (!cat) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unknown category</h1>
        <Link href="/journal" className="text-[var(--color-primary)] underline text-sm mt-2 inline-block">
          Back to Journal
        </Link>
      </div>
    );
  }

  // Milestone is a normal category detail, but with its own hero header:
  // phase-tinted (not the coral category color), overall progress, and an
  // "Up next" link to the next undone milestone in the current age bucket.
  // No ViewTabs — Milestones is no longer a peer view.
  if (cat.id === "milestone") {
    return <MilestonePage />;
  }

  return (
    <div className="pb-24">
      {/* Tinted header bleeds to top:0 of the phone shell (no parent pt-11
       *  in MobileFrame). md:pt-[60px] clears the fake iOS status bar. */}
      <header
        className="px-3 pt-4 pb-5 md:pt-[60px]"
        style={{ backgroundColor: `var(--color-${cat.color}-soft)` }}
      >
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
          <h1 className="text-lg font-semibold text-neutral-900">{cat.label}</h1>
          <span className="w-9" aria-hidden />
        </div>

        {/* Big icon + headline metric. Categories with production hero art
         *  (length/head/weight/kicks/mom-weight) use a larger illustration. */}
        <div className="flex items-center gap-4 mt-3 px-1">
          {(() => {
            const art = categoryArt(cat.id);
            return art ? (
              <div className="relative w-20 h-20 shrink-0">
                <Image src={art} alt="" fill sizes="80px" className="object-contain" />
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center shrink-0"
                style={{ color: `var(--color-${cat.color})` }}
              >
                <Illustration name={cat.iconName} className="w-8 h-8" />
              </div>
            );
          })()}
          <div>
            <div className="serif text-2xl font-semibold text-neutral-900 leading-tight">
              {headlineFor(cat, entries)}
            </div>
            <div className="text-xs text-neutral-700">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} logged
            </div>
          </div>
        </div>
      </header>

      {/* Fever warning (Jonas round-3 s16): for newborns, 38°C+ is an emergency.
       *  Static, always shown on Temperature — independent of the chart. */}
      {cat.id === "temperature" && (
        <div className="mx-4 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex gap-2.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-[13px] text-red-700 leading-relaxed">
            For newborns, a temperature of <span className="font-semibold">38&thinsp;°C or higher</span> is a medical emergency — see a doctor immediately.
          </p>
        </div>
      )}

      {cat.hasGraph && entries.length > 0 && <ChartSection cat={cat} />}
      {PATTERN_CATEGORIES.has(cat.id) && entries.length > 0 && <PatternSection cat={cat} entries={entries} />}

      {/* Entries */}
      <div className="mt-2">
        {byDay.length === 0 && (
          <EmptyState
            icon={cat.iconName}
            title={`No ${cat.label.toLowerCase()} entries yet`}
            subtitle="Once you start logging, you'll see your history and trends here."
            cta={{ href: `/log/${cat.id}`, label: "Add the first one" }}
          />
        )}
        {byDay.map(([dayKey, dayEntries]) => (
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
        ))}
      </div>

      {/* Always-visible primary add control. Jonas round-2 s8 circled the
       *  empty space on My Weight ("Fix this") and asked for an obvious +
       *  that opens the tracking form. The header chevron-style + was too
       *  faint, so this FAB mirrors the milestone-variant button. */}
      <Link
        href={`/log/${cat.id}`}
        aria-label={`Log ${cat.label}`}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center active:scale-95 transition md:absolute md:right-5"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Milestone page — phase-tinted hero with overall progress + up-next */
/* ------------------------------------------------------------------ */

function MilestonePage() {
  const router = useRouter();
  const { milestoneStatus, customMilestones } = useJournalStore();
  const baby = useBaby();
  const bucket = currentMilestoneBucket(baby.ageLabel);
  const [addOpen, setAddOpen] = useState(false);

  // Progress counts include user-added milestones (always complete by definition).
  const totalCount = MILESTONES.length + customMilestones.length;
  const presetDone = MILESTONES.filter((m) => milestoneStatus(m.id).doneAt).length;
  const customDone = customMilestones.length;
  const doneCount = presetDone + customDone;
  const pct = Math.round((doneCount / totalCount) * 100);

  const nextInBucket = MILESTONES
    .filter((m) => m.bucket === bucket && !milestoneStatus(m.id).doneAt)
    .sort((a, b) => a.medianAgeMonths - b.medianAgeMonths)[0];

  return (
    <div className="pb-24">
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
          <h1 className="text-lg font-semibold text-neutral-900">Milestones</h1>
          <div className="w-9 h-9" aria-hidden />
        </div>

        <div className="px-2 mt-3">
          <div className="serif text-[26px] font-semibold text-neutral-900 leading-tight">
            {doneCount} of {totalCount} reached
          </div>
          <div className="text-xs text-neutral-700 mt-1">
            {pct}% through {baby.name}&rsquo;s 0–12 month milestones
          </div>
          <div className="h-1.5 rounded-full bg-white/70 overflow-hidden mt-3">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {nextInBucket && (
            <Link
              href={`/journal/category/milestone/${nextInBucket.id}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-primary-dark)] mt-3.5 underline decoration-dotted underline-offset-4 active:opacity-70"
            >
              <span>Up next: {nextInBucket.label}</span>
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </header>

      <MilestonesBrowser />

      {/* Custom-milestone add affordance. Replaces PrimaryFAB on this page —
       *  Jonas email 2026-05-28: tap + → date / image / title / notes form,
       *  saved as a checked tile in the overview. */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Add custom milestone"
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center active:scale-95 transition md:absolute md:right-5"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {addOpen && (
        <CustomMilestoneSheet
          bucket={bucket}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Headline metric for the category-detail hero. Replaces "show the last meta
 * line" with a computed summary so opening Nursing reads "Avg 5 min · 4
 * today" instead of the raw "1 min, right, Lots" from the most recent feed.
 */
function headlineFor(cat: Category, entries: Entry[]): string {
  if (entries.length === 0) return cat.label;
  const today = entries.filter((e) => isSameDay(new Date(e.at), TODAY_DATE));
  switch (cat.id) {
    case "nursing":
    case "bottle":
    case "pumping": {
      const withDur = today.filter((e) => typeof e.durationMin === "number");
      if (withDur.length === 0) return `${today.length} today`;
      const avg = Math.round(
        withDur.reduce((s, e) => s + (e.durationMin ?? 0), 0) / withDur.length
      );
      return `${avg} min avg · ${today.length} today`;
    }
    case "sleep": {
      const totalMin = today.reduce((s, e) => s + (e.durationMin ?? 0), 0);
      if (totalMin === 0) return `${today.length} today`;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      const hr = m === 0 ? `${h} h` : `${h} h ${m} min`;
      return `${hr} today · ${today.length} ${today.length === 1 ? "nap" : "naps"}`;
    }
    case "diaper": {
      const wet = today.filter((e) => /wet/i.test(e.meta ?? "")).length;
      const dirty = today.filter((e) => /dirty|mixed/i.test(e.meta ?? "")).length;
      if (today.length === 0) return entries[0]?.meta ?? cat.label;
      return `${today.length} today · ${wet} wet · ${dirty} soiled`;
    }
    case "weight-baby":
    case "weight-mom":
    case "length":
    case "head":
      return entries[0]?.meta ?? cat.label;
    default:
      return entries[0]?.meta ?? cat.label;
  }
}

/* ------------------------------------------------------------------ */
/*  Pattern section — 24-hour band of event times across last 7 days  */
/* ------------------------------------------------------------------ */

function PatternSection({ cat, entries }: { cat: Category; entries: Entry[] }) {
  const cutoff = new Date(TODAY_DATE.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = entries.filter((e) => new Date(e.at) >= cutoff);
  // Bucket by hour of day (0..23) for a dot-density view
  const byHour: number[] = Array(24).fill(0);
  for (const e of recent) byHour[new Date(e.at).getHours()] += 1;
  const max = Math.max(1, ...byHour);

  const w = 320;
  const h = 70;
  const padL = 6;
  const padR = 6;
  const padT = 6;
  const padB = 18;
  const col = (i: number) => padL + (i / 23) * (w - padL - padR);
  const dotR = (count: number) => 2 + (count / max) * 5; // 2-7px radius

  return (
    <div className="px-4 pt-5">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Pattern · last 7 days
          </div>
          <div className="text-xs text-neutral-500">{recent.length} entries</div>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          {/* Hour gridlines at 6am / noon / 6pm / midnight */}
          {[0, 6, 12, 18].map((hr) => (
            <line
              key={hr}
              x1={col(hr)}
              y1={padT}
              x2={col(hr)}
              y2={h - padB}
              stroke="var(--color-neutral-200)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          ))}
          {/* Event dots */}
          {byHour.map((count, hr) => {
            if (count === 0) return null;
            return (
              <circle
                key={hr}
                cx={col(hr)}
                cy={(h - padB + padT) / 2}
                r={dotR(count)}
                fill={`var(--color-${cat.color})`}
                opacity={0.7}
              />
            );
          })}
          {/* X-axis hour labels */}
          {[
            { hr: 0, label: "12a" },
            { hr: 6, label: "6a" },
            { hr: 12, label: "12p" },
            { hr: 18, label: "6p" },
            { hr: 23, label: "11p" },
          ].map((t) => (
            <text
              key={t.hr}
              x={col(t.hr)}
              y={h - 4}
              textAnchor="middle"
              fontSize="9"
              fill="var(--color-neutral-400)"
            >
              {t.label}
            </text>
          ))}
        </svg>
        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
          Dot size = how often {cat.label.toLowerCase()} happens at that hour across the week.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart section — decorative for the prototype                      */
/* ------------------------------------------------------------------ */

// Per slide 17/18 + transcript: kicks/contractions are counts, not continuous
// signals — render as dots over "Last 7 days", not a line. Sleep is the same
// short-period story. Growth metrics (weight/length/head) keep the line +
// reference band, with a range picker (3m / 1y / 5y / 10y) per slide 38/39
// "Allow users to track for 5 or 10 years."
const DOTS_CATEGORIES = new Set(["kicks", "contractions", "sleep"]);
const LONG_RANGE_CATEGORIES = new Set(["weight-baby", "length", "head"]);

type ChartRange = "3m" | "1y" | "5y" | "10y";

const RANGE_TABS: { id: ChartRange; label: string; periodLabel: string }[] = [
  { id: "3m", label: "3m", periodLabel: "Last 12 weeks" },
  { id: "1y", label: "1y", periodLabel: "Last year" },
  { id: "5y", label: "5y", periodLabel: "Last 5 years" },
  { id: "10y", label: "10y", periodLabel: "Last 10 years" },
];

// Demo sample shapes per range. Growth flattens with age, so longer ranges
// rise quickly early then taper.
const RANGE_POINTS: Record<ChartRange, [number, number][]> = {
  "3m": [
    [0, 0.50], [1, 0.53], [2, 0.55], [3, 0.58], [4, 0.61], [5, 0.63],
    [6, 0.66], [7, 0.69], [8, 0.71], [9, 0.74], [10, 0.77], [11, 0.80],
  ],
  "1y": [
    [0, 0.22], [1, 0.30], [2, 0.38], [3, 0.45], [4, 0.51], [5, 0.56],
    [6, 0.60], [7, 0.64], [8, 0.68], [9, 0.72], [10, 0.76], [11, 0.80],
  ],
  "5y": [
    [0, 0.12], [1, 0.32], [2, 0.46], [3, 0.55], [4, 0.62],
    [5, 0.67], [6, 0.71], [7, 0.74], [8, 0.77], [9, 0.80],
  ],
  "10y": [
    [0, 0.10], [1, 0.28], [2, 0.40], [3, 0.50],
    [4, 0.58], [5, 0.65], [6, 0.71], [7, 0.76], [8, 0.79], [9, 0.82],
  ],
};

// WHO-style percentile band: upper and lower envelope curves that rise with
// age, since healthy weight/length at month 0 ≠ healthy weight/length at year
// 5. The trend line sits inside this band when growth is "on track."
const BAND_UPPER: Record<ChartRange, number[]> = {
  "3m":  [0.65, 0.67, 0.70, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87, 0.89, 0.92, 0.95],
  "1y":  [0.40, 0.47, 0.54, 0.60, 0.66, 0.71, 0.76, 0.80, 0.84, 0.88, 0.91, 0.95],
  "5y":  [0.30, 0.48, 0.62, 0.72, 0.79, 0.84, 0.87, 0.89, 0.91, 0.93],
  "10y": [0.30, 0.45, 0.58, 0.67, 0.75, 0.81, 0.85, 0.88, 0.91, 0.94],
};
const BAND_LOWER: Record<ChartRange, number[]> = {
  "3m":  [0.35, 0.37, 0.40, 0.42, 0.45, 0.47, 0.50, 0.52, 0.55, 0.57, 0.59, 0.60],
  "1y":  [0.10, 0.16, 0.22, 0.28, 0.33, 0.38, 0.43, 0.47, 0.51, 0.55, 0.58, 0.62],
  "5y":  [0.05, 0.18, 0.30, 0.40, 0.48, 0.54, 0.59, 0.62, 0.64, 0.66],
  "10y": [0.05, 0.18, 0.28, 0.38, 0.46, 0.53, 0.58, 0.62, 0.65, 0.68],
};

// Y-axis value ranges per category per range, in real units (kg / cm). These
// drive both the Y-axis tick labels and the "now" value annotation so the
// chart reads as a scientific growth chart instead of a decorative blob.
const Y_RANGE: Record<string, Partial<Record<ChartRange, [number, number]>>> = {
  "weight-baby": { "3m": [2, 8], "1y": [2, 12], "5y": [2, 25], "10y": [2, 45] },
  length:        { "3m": [48, 65], "1y": [48, 80], "5y": [48, 115], "10y": [48, 145] },
  head:          { "3m": [33, 42], "1y": [33, 48], "5y": [33, 53], "10y": [33, 57] },
  "weight-mom":  { "3m": [60, 80] },
};

// X-axis ticks per range: which point indices to label, and what to call them.
const X_TICKS: Record<ChartRange, { idx: number; label: string }[]> = {
  "3m":  [{ idx: 0, label: "0" }, { idx: 4, label: "1m" },  { idx: 8, label: "2m" },  { idx: 11, label: "3m" }],
  "1y":  [{ idx: 0, label: "0" }, { idx: 3, label: "3m" },  { idx: 6, label: "6m" },  { idx: 9, label: "9m" },  { idx: 11, label: "12m" }],
  "5y":  [{ idx: 0, label: "0" }, { idx: 2, label: "1y" },  { idx: 4, label: "2y" },  { idx: 6, label: "3y" },  { idx: 8, label: "4y" },  { idx: 9, label: "5y" }],
  "10y": [{ idx: 0, label: "0" }, { idx: 2, label: "2y" },  { idx: 4, label: "4y" },  { idx: 6, label: "6y" },  { idx: 8, label: "8y" },  { idx: 9, label: "10y" }],
};

function unitFor(catId: string): string {
  if (catId.startsWith("weight")) return "kg";
  if (catId === "length" || catId === "head") return "cm";
  return "";
}

function formatTick(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(v < 10 ? 1 : 0);
}

function ChartSection({ cat }: { cat: Category }) {
  const w = 320;
  const h = 175;
  const padL = 26;
  const padR = 10;
  // padT leaves a clear row above the plot for the unit label — at 14 the
  // unit collided with the top tick value (Jonas circled "kg"/"80").
  const padT = 20;
  const padB = 22;

  const isDots = DOTS_CATEGORIES.has(cat.id);
  const hasRangePicker = LONG_RANGE_CATEGORIES.has(cat.id);
  const [range, setRange] = useState<ChartRange>("3m");

  const longRange = range === "5y" || range === "10y";
  const bandRange: ChartRange = hasRangePicker ? range : "3m";

  const points: [number, number][] = isDots
    ? [[0, 0.42], [1, 0.31], [2, 0.55], [3, 0.48], [4, 0.62], [5, 0.40], [6, 0.71]]
    : RANGE_POINTS[bandRange];

  const N = points.length - 1;
  const sx = (i: number) => padL + (i / N) * (w - padL - padR);
  const sy = (v: number) => h - padB - v * (h - padB - padT);

  // Curving WHO-style band: upper envelope L→R, then lower envelope R→L, closed.
  const upper = BAND_UPPER[bandRange];
  const lower = BAND_LOWER[bandRange];
  const bandPath =
    upper.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ") +
    " " +
    [...lower]
      .reverse()
      .map((v, i) => `L${sx(lower.length - 1 - i).toFixed(1)},${sy(v).toFixed(1)}`)
      .join(" ") +
    " Z";

  const path = points
    .map(([i, v], idx) => `${idx === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`)
    .join(" ");
  const lastIdx = points.length - 1;
  const [lx, lv] = points[lastIdx];

  const periodLabel = isDots
    ? "Last 7 days"
    : hasRangePicker
      ? RANGE_TABS.find((t) => t.id === range)!.periodLabel
      : "Last 12 weeks";

  const lineDotStep = longRange ? 2 : 1;

  // Real-unit axis: maps the normalized trend back to kg / cm for the labels.
  const yRange = Y_RANGE[cat.id]?.[bandRange];
  const yUnit = unitFor(cat.id);
  const yTicks = yRange
    ? [0, 0.25, 0.5, 0.75, 1].map((pos) => ({
        pos,
        label: formatTick(yRange[0] + pos * (yRange[1] - yRange[0])),
      }))
    : [];
  const xTicks = isDots ? [] : X_TICKS[bandRange];
  const nowValue = yRange ? yRange[0] + lv * (yRange[1] - yRange[0]) : null;
  const nowLabel = nowValue != null ? `${formatTick(nowValue)} ${yUnit}` : "";

  return (
    <div className="px-4 pt-5">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Trend
          </div>
          <div className="text-xs text-neutral-500">{periodLabel}</div>
        </div>
        {hasRangePicker && (
          <div className="flex gap-1 mb-3 bg-neutral-100 rounded-full p-0.5">
            {RANGE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-full transition ${
                  range === t.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          {/* Horizontal gridlines at each Y tick. Faint, decorative. */}
          {!isDots && yTicks.map((t, i) => (
            <line
              key={`gh-${i}`}
              x1={padL}
              y1={sy(t.pos)}
              x2={w - padR}
              y2={sy(t.pos)}
              stroke="var(--color-neutral-200)"
              strokeWidth={1}
              opacity={i === 0 ? 1 : 0.55}
            />
          ))}
          {/* Y-axis tick labels (kg / cm). */}
          {!isDots && yTicks.map((t, i) => (
            <text
              key={`yl-${i}`}
              x={padL - 4}
              y={sy(t.pos) + 3}
              textAnchor="end"
              fontSize="8"
              fill="var(--color-neutral-500)"
            >
              {t.label}
            </text>
          ))}
          {/* Y-axis unit — its own row above the plot, clear of the top tick. */}
          {!isDots && yUnit && (
            <text
              x={padL - 4}
              y={9}
              textAnchor="end"
              fontSize="8"
              fontWeight="600"
              fill="var(--color-neutral-700)"
            >
              {yUnit}
            </text>
          )}
          {/* WHO-style healthy-range band — curves upward with age. */}
          {!isDots && (
            <path
              d={bandPath}
              fill="var(--color-cat-food-soft)"
              opacity={0.6}
            />
          )}
          {/* Band percentile legend (matches the My Baby "Top 3% to Bottom 3%"
           *  treatment so the band reads as a scientific reference, not
           *  a vague tinted shape). Bottom-right — the band's lower envelope
           *  stays well above it at every range, and the top-right corner
           *  belongs to the "now" value label (they collided — Jonas circled
           *  "3rd – 97th percentile"/"76 kg"). */}
          {!isDots && (
            <text
              x={w - padR - 4}
              y={h - padB - 5}
              textAnchor="end"
              fontSize="7.5"
              fill="var(--color-cat-food)"
              opacity={0.85}
            >
              3rd – 97th percentile
            </text>
          )}
          {isDots ? (
            // Dots only — no connecting line. Kicks/contractions are counts.
            points.map(([i, v], idx) => (
              <circle
                key={idx}
                cx={sx(i)}
                cy={sy(v)}
                r={4}
                fill={`var(--color-${cat.color})`}
                opacity={idx === lastIdx ? 1 : 0.75}
              />
            ))
          ) : (
            <>
              {/* trend line */}
              <path
                d={path}
                fill="none"
                stroke={`var(--color-${cat.color})`}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* sample dots along the line (sparser at long ranges) */}
              {points
                .filter((_, idx) => idx % lineDotStep === 0 && idx !== lastIdx)
                .map(([i, v], idx) => (
                  <circle
                    key={`d-${idx}`}
                    cx={sx(i)}
                    cy={sy(v)}
                    r={2}
                    fill={`var(--color-${cat.color})`}
                    opacity={0.6}
                  />
                ))}
              {/* now marker — vertical line through the chart, dot at value */}
              <line
                x1={sx(lx)}
                y1={padT}
                x2={sx(lx)}
                y2={h - padB}
                stroke="var(--color-neutral-300)"
                strokeWidth={1}
              />
              <circle
                cx={sx(lx)}
                cy={sy(lv)}
                r={5}
                fill={`var(--color-${cat.color})`}
                stroke="white"
                strokeWidth={2}
              />
              {/* now value label above the dot — what makes this read as "data"
               *  rather than decoration. */}
              {nowLabel && (
                <text
                  x={sx(lx)}
                  y={sy(lv) - 10}
                  textAnchor={lx > N / 2 ? "end" : "middle"}
                  fontSize="10"
                  fontWeight="700"
                  fill={`var(--color-${cat.color})`}
                >
                  {nowLabel}
                </text>
              )}
            </>
          )}
          {/* X-axis tick labels (time). */}
          {!isDots && xTicks.map((t, i) => (
            <text
              key={`xl-${i}`}
              x={sx(t.idx)}
              y={h - 6}
              textAnchor="middle"
              fontSize="8"
              fill="var(--color-neutral-500)"
            >
              {t.label}
            </text>
          ))}
        </svg>
        <p className="text-sm text-neutral-700 leading-relaxed mt-3">
          {/* Mom-weight category is about Sarah's pregnancy gain, not baby's
           *  growth — copy needs to match the subject of the graph. */}
          {cat.id === "weight-mom" ? "You are " : "Lu is "}
          <span className="font-semibold text-neutral-900">on track</span>{" "}
          {cat.id === "weight-mom" ? "with healthy weight gain." : "for healthy growth."}{" "}
          {articleForCategory(cat.id) ? (
            <Link
              href={`/article/${articleForCategory(cat.id)!.slug}`}
              className="text-[var(--color-primary)] font-semibold active:opacity-70"
            >
              Read more
            </Link>
          ) : (
            <span className="text-[var(--color-primary)] font-semibold">Read more</span>
          )}
        </p>
      </div>
    </div>
  );
}
