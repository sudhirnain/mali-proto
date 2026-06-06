import type { Phase } from "./phase";

export type CategoryGroup =
  | "Food"
  | "Activity"
  | "Growth rate"
  | "Health"
  | "Mood"
  | "Wellbeing"
  | "Pregnancy"
  | "Memories";

export type FormKind =
  | "timer" // Sleep, Nursing, Bottle, Pumping, Stroll, Bathing
  | "event" // Diaper, Vaccinations, Temperature, etc.
  | "measurement" // Weight, Length, Head
  | "kicks"
  | "contractions"
  | "milestone"
  | "note";

export type Category = {
  id: string;
  label: string;
  group: CategoryGroup;
  color: string; // tailwind var name without the `--color-` prefix, e.g. `cat-sleep`
  formKind: FormKind;
  phases: Phase[]; // which phases expose this category
  hasGraph?: boolean;
  iconName: string; // for <Illustration name="..." />
  forMom?: boolean;
};

export const CATEGORIES: Category[] = [
  // Food
  { id: "nursing", label: "Nursing", group: "Food", color: "cat-food", formKind: "timer", phases: ["parenting"], iconName: "nursing" },
  { id: "bottle", label: "Bottle", group: "Food", color: "cat-food", formKind: "timer", phases: ["parenting"], iconName: "bottle" },
  { id: "solids", label: "Solids", group: "Food", color: "cat-food", formKind: "event", phases: ["parenting"], iconName: "bowl" },
  { id: "pumping", label: "Pumping", group: "Food", color: "cat-food", formKind: "timer", phases: ["parenting"], iconName: "pump" },

  // Activity
  { id: "diaper", label: "Diaper", group: "Activity", color: "cat-diaper", formKind: "event", phases: ["parenting"], iconName: "diaper" },
  { id: "sleep", label: "Sleep", group: "Activity", color: "cat-sleep", formKind: "timer", phases: ["parenting"], iconName: "crib" },
  { id: "stroll", label: "Stroll", group: "Activity", color: "cat-care", formKind: "timer", phases: ["parenting"], iconName: "stroller" },
  { id: "bathing", label: "Bathing", group: "Activity", color: "cat-care", formKind: "timer", phases: ["parenting"], iconName: "bath" },

  // Growth rate (parenting only)
  { id: "weight-baby", label: "Weight", group: "Growth rate", color: "cat-growth", formKind: "measurement", phases: ["parenting"], hasGraph: true, iconName: "scale" },
  { id: "length", label: "Length", group: "Growth rate", color: "cat-growth", formKind: "measurement", phases: ["parenting"], hasGraph: true, iconName: "ruler" },
  { id: "head", label: "Head circumference", group: "Growth rate", color: "cat-growth", formKind: "measurement", phases: ["parenting"], hasGraph: true, iconName: "head" },

  // Health — baby Mood leads (Jonas round-2 s13: "reduce to one, same like MOM
  // … move it up to Health" — one tile that opens a mood picker).
  { id: "mood", label: "Mood", group: "Health", color: "cat-mood", formKind: "event", phases: ["parenting"], iconName: "mood-fine" },
  { id: "doctor", label: "Doctor's visit", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting", "pregnancy"], iconName: "doctor" },
  { id: "vaccinations", label: "Vaccinations", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting"], iconName: "syringe" },
  { id: "temperature", label: "Temperature", group: "Health", color: "cat-health", formKind: "measurement", phases: ["parenting"], iconName: "thermometer" },
  { id: "illnesses", label: "Illnesses", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting"], iconName: "heart-pulse" },
  { id: "medications", label: "Medications", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting"], iconName: "pill" },

  // Wellbeing — mom-experience tracks; present in BOTH phases (mom keeps
  // tracking after birth per Jonas's slide 13 + slide 29 comments).
  // "My" prefix dropped (Jonas round-3 s6 "Take out My") — the pink MOM
  // treatment + the "Mom's wellbeing" section already signal these are mom's,
  // so "My Weight"/etc. just read long. Labels now collide with the baby
  // Weight/Mood/Sleep by design; color + section disambiguate.
  { id: "weight-mom", label: "Weight", group: "Wellbeing", color: "cat-growth", formKind: "measurement", phases: ["pregnancy", "parenting"], hasGraph: true, iconName: "scale", forMom: true },
  { id: "mom-mood", label: "Mood", group: "Wellbeing", color: "cat-mood", formKind: "event", phases: ["pregnancy", "parenting"], iconName: "mood-fine", forMom: true },
  { id: "symptoms", label: "Symptoms", group: "Wellbeing", color: "cat-health", formKind: "event", phases: ["pregnancy", "parenting"], iconName: "heart-pulse", forMom: true },
  { id: "hydration", label: "Water", group: "Wellbeing", color: "cat-care", formKind: "event", phases: ["pregnancy", "parenting"], iconName: "bath", forMom: true },
  { id: "sleep-mom", label: "Sleep", group: "Wellbeing", color: "cat-sleep", formKind: "timer", phases: ["pregnancy", "parenting"], iconName: "crib", forMom: true },

  // Pregnancy — baby-emergent tracks, pregnancy-only.
  { id: "kicks", label: "Kicks", group: "Pregnancy", color: "cat-kicks", formKind: "kicks", phases: ["pregnancy"], hasGraph: true, iconName: "kick" },
  { id: "contractions", label: "Contractions", group: "Pregnancy", color: "cat-contractions", formKind: "contractions", phases: ["pregnancy"], hasGraph: true, iconName: "contraction" },

  // Memories (both phases)
  { id: "milestone", label: "Milestone", group: "Memories", color: "cat-milestone", formKind: "milestone", phases: ["parenting"], iconName: "milestone" },
  { id: "quote", label: "Quote", group: "Memories", color: "cat-memory", formKind: "note", phases: ["parenting"], iconName: "quote" },
  { id: "note", label: "Note", group: "Memories", color: "cat-memory", formKind: "note", phases: ["pregnancy", "parenting"], iconName: "note" },
  { id: "picture", label: "Picture", group: "Memories", color: "cat-memory", formKind: "note", phases: ["pregnancy", "parenting"], iconName: "picture" },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/**
 * Tile accent color — colored by DOMAIN, not per-category, so every labelled
 * section reads as one coherent color block instead of a scatter of per-category
 * hues that looks random in aggregate. Keyed off the composer `group`, but Food
 * and Activity share one green: the Moments "Care logs" section merges both
 * composer groups, so they must match or that section splits two-tone. (Food +
 * Activity is the only cross-surface merge — every other section maps 1:1.)
 * Mom-experience categories (`forMom`) override to coral so "Mom's wellbeing"
 * is one pink group across both phases (Jonas round-2 s13 "make it all pink"),
 * using the non-flipping `--color-coral*` so it stays pink in parenting too.
 * Entry rows + charts keep the per-category `cat.color` for data legibility —
 * this only affects tiles.
 */
const TILE_GROUP_COLOR: Partial<Record<CategoryGroup, string>> = {
  Memories: "cat-memory", // taupe
  Food: "cat-food", // green ┐ both = "Care logs" in Moments —
  Activity: "cat-food", // green ┘ share one color so that section stays coherent
  "Growth rate": "cat-growth", // rose
  Health: "cat-health", // blue
  Pregnancy: "cat-contractions", // brick red
};

export function tileColor(cat: Category): string {
  // "mom" = maliRed icon on azalea circle (globals.css). Plain "coral"
  // stopped working when froly became the brand primary — froly icon on
  // mildPeach bg had ~1.4:1 contrast (2026-06-02 palette adoption).
  if (cat.forMom) return "mom";
  return TILE_GROUP_COLOR[cat.group] ?? cat.color;
}

export function categoriesForPhase(phase: Phase): Category[] {
  return CATEGORIES.filter((c) => c.phases.includes(phase));
}

export function categoriesByGroup(phase: Phase): Record<CategoryGroup, Category[]> {
  const cats = categoriesForPhase(phase);
  const groups: Record<CategoryGroup, Category[]> = {
    Food: [],
    Activity: [],
    "Growth rate": [],
    Health: [],
    Mood: [],
    Wellbeing: [],
    Pregnancy: [],
    Memories: [],
  };
  for (const c of cats) groups[c.group].push(c);
  return groups;
}

/* ----------------------------------------------------------------------- */
/*  Journal sections — the "Categories" tab grouping                        */
/* ----------------------------------------------------------------------- */
/*  Separate from the `group` field above (which organizes /log's category  */
/*  picker by Food/Activity/Growth-rate/etc.). The Journal Categories tab   */
/*  uses a coarser, emotion-first taxonomy:                                 */
/*                                                                          */
/*    Parenting:  Memories · Development(hero=milestones) · Care logs       */
/*                · Health · Growth                                         */
/*    Pregnancy:  Memories · Your journey(hero=weekly) · Body & symptoms    */
/*                · Health · Growth                                         */
/*                                                                          */
/*  Order privileges family-record framing — memories surface before        */
/*  tracking. Mood categories are intentionally excluded (they're entry     */
/*  actions, not browsable verticals) and still appear in Timeline.          */

export type JournalSectionId =
  | "memories"
  | "development"
  | "journey"
  | "care"
  | "body"
  | "wellbeing"
  | "health"
  | "growth";

export type JournalSectionHero = "milestones" | "weekly-journey";

export type JournalSection = {
  id: JournalSectionId;
  label: string;
  categoryIds: string[];
  /** If set, render this section's hero element above (or in place of) the tile grid. */
  hero?: JournalSectionHero;
};

export const JOURNAL_SECTIONS_PARENTING: JournalSection[] = [
  { id: "memories", label: "Memories", categoryIds: ["note", "picture", "quote"] },
  { id: "development", label: "Development", categoryIds: ["weight-baby", "length", "head"], hero: "milestones" },
  { id: "care", label: "Care logs", categoryIds: ["nursing", "bottle", "solids", "pumping", "diaper", "sleep", "stroll", "bathing"] },
  { id: "health", label: "Health", categoryIds: ["mood", "doctor", "vaccinations", "temperature", "illnesses", "medications"] },
  { id: "wellbeing", label: "Mom's wellbeing", categoryIds: ["weight-mom", "mom-mood", "symptoms", "hydration", "sleep-mom"] },
];

export const JOURNAL_SECTIONS_PREGNANCY: JournalSection[] = [
  { id: "memories", label: "Memories", categoryIds: ["note", "picture"] },
  { id: "journey", label: "Your journey", categoryIds: [], hero: "weekly-journey" },
  { id: "body", label: "Body", categoryIds: ["kicks", "contractions"] },
  { id: "wellbeing", label: "Mom's wellbeing", categoryIds: ["weight-mom", "mom-mood", "symptoms", "hydration", "sleep-mom"] },
  { id: "health", label: "Health", categoryIds: ["doctor"] },
];

export function journalSectionsForPhase(phase: Phase): JournalSection[] {
  return phase === "pregnancy" ? JOURNAL_SECTIONS_PREGNANCY : JOURNAL_SECTIONS_PARENTING;
}

/**
 * Default quick-log cards for the header per phase.
 * Pregnancy = mom's weight + kicks + contractions (the most active-tracking
 * surface; unifies the old T1-2 / T3 split).
 */
export function defaultQuickLogs(phase: Phase): string[] {
  if (phase === "pregnancy") return ["weight-mom", "mom-mood", "kicks"];
  return ["sleep", "nursing", "diaper"];
}

/** Extra icons shown below the 3 main cards in the expanded header. */
export function expandedHeaderExtras(phase: Phase): string[] {
  if (phase === "parenting") return ["bottle", "solids", "pumping", "bathing", "weight-baby"];
  // Pregnancy expanded row leans into mom-experience tracking; contractions
  // moves here from the default trio (T3-specific, not daily).
  return ["symptoms", "hydration", "sleep-mom", "contractions"];
}
