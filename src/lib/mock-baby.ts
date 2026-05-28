import type { Phase } from "./phase";

const DAY_MS = 24 * 60 * 60 * 1000;
const GESTATION_DAYS = 40 * 7; // 280

/**
 * Returns a DD.MM.YYYY string for a due date that — relative to today —
 * makes the user read as the given gestational week + day. Keeps the
 * StatStrip / JourneyHero math consistent (days-to-due = 8 weeks ≈ 56 days
 * when week=32, etc.) regardless of when the prototype is opened.
 */
function dueDateForGestation(week: number, dayOfWeek: number): string {
  const daysElapsed = (week - 1) * 7 + (dayOfWeek - 1);
  const daysLeft = GESTATION_DAYS - daysElapsed;
  const due = new Date(Date.now() + daysLeft * DAY_MS);
  const d = String(due.getDate()).padStart(2, "0");
  const m = String(due.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${due.getFullYear()}`;
}

export type Baby = {
  name: string;
  ageLabel: string;
  /** null when no weight has been logged yet (cold-start). */
  weight: string | null;
  /** null when no length has been logged yet (cold-start). */
  length: string | null;
  sizeFruit?: string; // pregnancy only
  weekLabel?: string; // pregnancy only
  /** Gestational week number — used to pick the week-appropriate illustration. Pregnancy only. */
  week?: number;
  /** Due date in DD.MM.YYYY (European) format. Pregnancy only. Editable via the StatStrip right-ring tap. */
  dueDate?: string;
};

/**
 * Mom record — surfaced only in pregnancy phase per the client philosophy
 * "EY baby-first, pregnancy mom-first." Latest mom weight is read live from
 * `useEntries()` (weight-mom category); the `weight` here is the cold-start
 * placeholder a user might have entered during onboarding.
 */
export type Mom = {
  name: string;
  /** null in cold-start until first weight-mom entry. */
  weight: string | null;
};

export const BABIES: Record<Phase, Baby> = {
  pregnancy: {
    name: "Lu",
    ageLabel: "Week 32 · Day 4",
    weight: "220 g", // baby's weight in utero (estimate, backend-sourced)
    length: "—",
    // sizeFruit must match what /mali-art/weekly/wN.png actually shows so
    // the floating size-of pill and the center hero illustration agree.
    // Week 32 art = bunch of kale. (Production art owns the week→item map.)
    sizeFruit: "bunch of kale",
    weekLabel: "Week 32",
    week: 32,
    // Computed at module-load so today reads as Week 32 · Day 4 with a
    // matching due date (~56 days away). Keeps the days/weeks/% all
    // mutually consistent on the demo's primary screen.
    dueDate: dueDateForGestation(32, 4),
  },
  parenting: {
    name: "Lu",
    ageLabel: "3 months, 2 days",
    weight: "5.4 kg",
    length: "63 cm",
  },
};

export const MOMS: Record<Phase, Mom> = {
  pregnancy: { name: "Sarah", weight: "68 kg" },
  parenting: { name: "Sarah", weight: null }, // not currently surfaced in parenting UI
};

/**
 * First-day personas for the ?mode=cold demo path.
 * weight/length null → consumers should show stage-aware fallbacks
 * (a CTA, a tagline) instead of "—" placeholders.
 */
export const FIRST_DAY_BABIES: Record<Phase, Baby> = {
  pregnancy: {
    name: "Lu",
    ageLabel: "Week 24 · Day 1",
    weight: null,
    length: null,
    // Week 24 art = ear of corn. See note above on BABIES.pregnancy.sizeFruit.
    sizeFruit: "ear of corn",
    weekLabel: "Week 24",
    week: 24,
    dueDate: dueDateForGestation(24, 1),
  },
  parenting: {
    name: "Lu",
    ageLabel: "1 day new",
    weight: null,
    length: null,
  },
};

export const FIRST_DAY_MOMS: Record<Phase, Mom> = {
  pregnancy: { name: "Sarah", weight: null },
  parenting: { name: "Sarah", weight: null },
};
