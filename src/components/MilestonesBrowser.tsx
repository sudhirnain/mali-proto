"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Illustration } from "./Illustration";
import {
  MILESTONES,
  MILESTONE_CATEGORIES,
  type AgeBucket,
  type Milestone,
  type MilestoneCategory,
} from "@/lib/mock-milestones";
import { useJournalStore } from "@/lib/journal-store";
import { milestoneArtOrFallback } from "@/lib/milestone-art";

const BUCKETS: { id: AgeBucket; label: string }[] = [
  { id: "0-3", label: "0 – 3 months" },
  { id: "4-6", label: "4 – 6 months" },
  { id: "7-12", label: "7 – 12 months" },
];

type Tab = MilestoneCategory | "All";

/** Milestone presets browser — rendered as the Milestones tab inside Journal. */
export function MilestonesBrowser() {
  const [tab, setTab] = useState<Tab>("All");
  const { milestoneStatus, customMilestones } = useJournalStore();

  const isDone = (id: string) => Boolean(milestoneStatus(id).doneAt);

  // Per Jonas email 2026-05-28: custom user-added milestones (id `custom-*`)
  // appear in the overview alongside presets. Filter chips only filter
  // presets — custom items always show under "All" (they have no category).
  const allMilestones = useMemo(
    () => [...customMilestones, ...MILESTONES],
    [customMilestones]
  );

  const filtered = useMemo(() => {
    if (tab === "All") return allMilestones;
    return MILESTONES.filter((m) => m.category === tab);
  }, [tab, allMilestones]);

  return (
    <div>
      {/* Category filter chips — same pill style as journal filter chips */}
      <div className="px-5 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {(["All", ...MILESTONE_CATEGORIES] as Tab[]).map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                on
                  ? "bg-[var(--color-primary)] text-white border-transparent"
                  : "bg-white text-neutral-700 border-neutral-200"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-5 space-y-8">
        {BUCKETS.map((b) => {
          const items = filtered.filter((m) => m.bucket === b.id);
          if (items.length === 0) return null;
          const done = items.filter((m) => isDone(m.id)).length;
          return (
            <section key={b.id} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="serif text-xl font-semibold text-neutral-900">{b.label}</h2>
                <span className="text-xs text-neutral-500">
                  {done} of {items.length} completed
                </span>
              </div>
              {/* progress bar */}
              <div className="h-1.5 rounded-full bg-[var(--color-primary-softer)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${(done / items.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                {items.map((m) => (
                  <MilestoneTile key={m.id} milestone={m} done={isDone(m.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MilestoneTile({ milestone, done }: { milestone: Milestone; done: boolean }) {
  const art = milestoneArtOrFallback(milestone.id);
  return (
    <Link
      href={`/journal/category/milestone/${milestone.id}`}
      className="flex flex-col gap-1.5 active:scale-[0.97] transition"
    >
      {/* Tile: square, illustration fills it edge-to-edge. Done = darker tint
       *  + check badge; undone = lighter tint. No opacity reduction on the
       *  illustration itself — black line-art reads at full contrast either way. */}
      <div
        className={`relative aspect-square rounded-2xl overflow-hidden ${
          done ? "bg-[var(--color-primary-soft)]" : "bg-[var(--color-primary-softer)]"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-1 text-[var(--color-primary-dark)]">
          {art ? (
            <Image src={art} alt="" fill sizes="160px" className="object-contain p-1" />
          ) : (
            <Illustration name={milestone.iconName} className="w-3/4 h-3/4" />
          )}
        </div>
        {done && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        )}
      </div>
      {/* Label below the tile */}
      <span className="text-[11px] font-medium text-neutral-700 text-center leading-tight px-0.5">
        {milestone.label}
      </span>
    </Link>
  );
}
