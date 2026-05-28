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
import { PrimaryFAB } from "@/components/PrimaryFAB";
import { categoryArt } from "@/lib/category-art";
import { useBaby } from "@/lib/cold-mode";
import { MILESTONES, currentMilestoneBucket } from "@/lib/mock-milestones";
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
    <div className="pb-16">
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
          <Link
            href={`/log/${cat.id}`}
            aria-label="Add entry"
            className="w-9 h-9 flex items-center justify-center text-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
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

      {cat.hasGraph && <ChartSection cat={cat} />}
      {PATTERN_CATEGORIES.has(cat.id) && <PatternSection cat={cat} entries={entries} />}

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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Milestone page — phase-tinted hero with overall progress + up-next */
/* ------------------------------------------------------------------ */

function MilestonePage() {
  const router = useRouter();
  const { milestoneStatus } = useJournalStore();
  const baby = useBaby();
  const bucket = currentMilestoneBucket(baby.ageLabel);

  const allDone = MILESTONES.filter((m) => milestoneStatus(m.id).doneAt);
  const pct = Math.round((allDone.length / MILESTONES.length) * 100);

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
            {allDone.length} of {MILESTONES.length} reached
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
      <PrimaryFAB />
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
// short-period story. Growth metrics (weight/length/head) keep the line + 12-week
// trend with the reference band.
const DOTS_CATEGORIES = new Set(["kicks", "contractions", "sleep"]);

function ChartSection({ cat }: { cat: Category }) {
  const w = 320;
  const h = 140;
  const padX = 16;
  const padY = 18;

  const isDots = DOTS_CATEGORIES.has(cat.id);

  // Sample points: growth = 12 smooth weeks; dots = 7 daily dots with realistic variance
  const points: [number, number][] = isDots
    ? [[0, 0.42], [1, 0.31], [2, 0.55], [3, 0.48], [4, 0.62], [5, 0.40], [6, 0.71]]
    : [
        [0, 0.30], [1, 0.34], [2, 0.39], [3, 0.43], [4, 0.49], [5, 0.55],
        [6, 0.60], [7, 0.66], [8, 0.71], [9, 0.76], [10, 0.81], [11, 0.86],
      ];
  const N = points.length - 1;
  const sx = (i: number) => padX + (i / N) * (w - padX * 2);
  const sy = (v: number) => h - padY - v * (h - padY * 2);

  const path = points
    .map(([i, v], idx) => `${idx === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`)
    .join(" ");
  const lastIdx = points.length - 1;
  const [lx, lv] = points[lastIdx];

  const unit =
    cat.id === "head" || cat.id === "length"
      ? "cm"
      : cat.id === "kicks"
        ? "kicks"
        : cat.id === "contractions"
          ? "contractions"
          : cat.id === "sleep"
            ? "hours"
            : "kg";
  const periodLabel = isDots ? "Last 7 days" : "Last 12 weeks";

  return (
    <div className="px-4 pt-5">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Trend
          </div>
          <div className="text-xs text-neutral-500">{periodLabel} · {unit}</div>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          {/* ideal band — only for growth metrics with a real reference range */}
          {!isDots && (
            <rect
              x={padX}
              y={sy(0.85)}
              width={w - padX * 2}
              height={sy(0.25) - sy(0.85)}
              fill="var(--color-cat-food-soft)"
              opacity={0.55}
            />
          )}
          {/* baseline */}
          <line
            x1={padX}
            y1={sy(0.55)}
            x2={w - padX}
            y2={sy(0.55)}
            stroke="var(--color-cat-food)"
            strokeDasharray="3 3"
            strokeWidth={1}
            opacity={0.4}
          />
          {isDots ? (
            // Dots only — no connecting line. Kicks/contractions are counts,
            // not a continuous signal (transcript: "It's a count and it
            // doesn't need any [line]").
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
              {/* now marker */}
              <line
                x1={sx(lx)}
                y1={padY}
                x2={sx(lx)}
                y2={h - padY}
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
            </>
          )}
        </svg>
        <p className="text-sm text-neutral-700 leading-relaxed mt-3">
          Lu is{" "}
          <span className="font-semibold text-neutral-900">on track</span> for healthy growth.{" "}
          <span className="text-[var(--color-primary)] font-semibold">Read more</span>
        </p>
      </div>
    </div>
  );
}
