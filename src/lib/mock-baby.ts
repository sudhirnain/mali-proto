import type { Phase } from "./phase";

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
    ageLabel: "Week 32, Day 4",
    weight: "220 g", // baby's weight in utero
    length: "—",
    sizeFruit: "Avocado",
    weekLabel: "Week 32",
    week: 32,
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
    ageLabel: "Week 24",
    weight: null,
    length: null,
    sizeFruit: "Avocado",
    weekLabel: "Week 24",
    week: 24,
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
