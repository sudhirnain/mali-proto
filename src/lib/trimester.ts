import { TODAY_DATE } from "./mock-entries";

export type TrimesterId = "t1" | "t2" | "t3";

export type Trimester = {
  id: TrimesterId;
  label: string;
  weekStart: number; // inclusive
  weekEnd: number;   // inclusive
};

export const TRIMESTERS: Trimester[] = [
  { id: "t1", label: "Trimester 1", weekStart: 1, weekEnd: 13 },
  { id: "t2", label: "Trimester 2", weekStart: 14, weekEnd: 27 },
  { id: "t3", label: "Trimester 3", weekStart: 28, weekEnd: 40 },
];

export function getTrimester(id: TrimesterId): Trimester {
  return TRIMESTERS.find((t) => t.id === id) ?? TRIMESTERS[0];
}

export function trimesterFromWeek(week: number): TrimesterId {
  if (week <= 13) return "t1";
  if (week <= 27) return "t2";
  return "t3";
}

/**
 * Estimates the gestational week at the time an entry was logged, using
 * today's "current week" and the entry's timestamp. Approximate (assumes
 * even week boundaries) — fine for a prototype where data is sparse.
 */
export function weekOfEntry(entryIso: string, currentWeek: number, today: Date = TODAY_DATE): number {
  const diffDays = Math.floor((today.getTime() - new Date(entryIso).getTime()) / (24 * 3600 * 1000));
  const weeksAgo = Math.floor(diffDays / 7);
  return Math.max(1, currentWeek - weeksAgo);
}

/** Inclusive: returns true if `week` is in this trimester. */
export function inTrimester(week: number, t: TrimesterId): boolean {
  return trimesterFromWeek(week) === t;
}

export function weeksLeftInTrimester(currentWeek: number, t: TrimesterId): number {
  const tri = getTrimester(t);
  if (currentWeek > tri.weekEnd) return 0;
  return Math.max(0, tri.weekEnd - currentWeek);
}

/** Percent through this trimester at the given current week, clamped 0..100. */
export function progressThroughTrimester(currentWeek: number, t: TrimesterId): number {
  const tri = getTrimester(t);
  if (currentWeek < tri.weekStart) return 0;
  if (currentWeek > tri.weekEnd) return 100;
  const span = tri.weekEnd - tri.weekStart + 1;
  const into = currentWeek - tri.weekStart + 1;
  return Math.round((into / span) * 100);
}
