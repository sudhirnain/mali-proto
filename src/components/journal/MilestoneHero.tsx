"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MILESTONES,
  bucketLabel,
  currentMilestoneBucket,
} from "@/lib/mock-milestones";
import { useJournalStore } from "@/lib/journal-store";
import { useBaby } from "@/lib/cold-mode";
import { milestoneArt } from "@/lib/milestone-art";

/**
 * Hero tile for the Development section. Shows progress through the
 * current age bucket + next undone milestone. Tap → milestones browser.
 *
 * `variant="header"` drops the soft background so the hero bleeds into a
 * parent that already has a phase-tinted bg (used by FeedHeader).
 */
export function MilestoneHero({ variant = "section" }: { variant?: "section" | "header" } = {}) {
  const { milestoneStatus } = useJournalStore();
  const baby = useBaby();
  const bucket = currentMilestoneBucket(baby.ageLabel);

  const bucketItems = MILESTONES.filter((m) => m.bucket === bucket);
  const done = bucketItems.filter((m) => milestoneStatus(m.id).doneAt);
  const next = bucketItems
    .filter((m) => !milestoneStatus(m.id).doneAt)
    .sort((a, b) => a.medianAgeMonths - b.medianAgeMonths)[0];

  const pct = bucketItems.length
    ? Math.round((done.length / bucketItems.length) * 100)
    : 0;

  const nextArt = next ? milestoneArt(next.id) : null;

  return (
    <Link
      href="/journal/category/milestone"
      className={`
        block rounded-3xl p-4 active:scale-[0.99] transition
        ${variant === "section" ? "mx-1 bg-[var(--color-primary-softer)]" : "bg-white/50 backdrop-blur"}
      `}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0">
          <div className="serif text-[21px] font-semibold text-neutral-900 leading-none tracking-tight">
            Milestones
          </div>
          <div className="text-xs text-neutral-600 mt-1">{bucketLabel(bucket)}</div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/70 flex items-center justify-center shrink-0 overflow-hidden">
          {nextArt ? (
            <Image
              src={nextArt}
              alt=""
              width={56}
              height={56}
              className="object-contain p-1"
              style={{ width: "auto", height: "auto" }}
            />
          ) : (
            <span className="text-2xl" aria-hidden>👶</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-neutral-600 mt-2 font-medium">
          <span>
            {done.length} of {bucketItems.length} done
          </span>
          <span className="truncate ml-3 underline decoration-dotted underline-offset-4">
            {next ? `Next milestone: ${next.label} →` : "All done — nice →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

