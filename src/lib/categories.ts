import type { Phase } from "./phase";

export type CategoryGroup =
  | "Food"
  | "Activity"
  | "Growth rate"
  | "Health"
  | "Mood"
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

  // Health
  { id: "doctor", label: "Doctor's visit", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting", "pregnancy"], iconName: "doctor" },
  { id: "vaccinations", label: "Vaccinations", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting"], iconName: "syringe" },
  { id: "temperature", label: "Temperature", group: "Health", color: "cat-health", formKind: "measurement", phases: ["parenting"], iconName: "thermometer" },
  { id: "illnesses", label: "Illnesses", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting"], iconName: "heart-pulse" },
  { id: "medications", label: "Medications", group: "Health", color: "cat-health", formKind: "event", phases: ["parenting"], iconName: "pill" },

  // Mood
  { id: "cheerful", label: "Cheerful", group: "Mood", color: "cat-mood", formKind: "event", phases: ["parenting"], iconName: "mood-cheerful" },
  { id: "fine", label: "Fine", group: "Mood", color: "cat-mood", formKind: "event", phases: ["parenting"], iconName: "mood-fine" },
  { id: "sad", label: "Sad", group: "Mood", color: "cat-mood", formKind: "event", phases: ["parenting"], iconName: "mood-sad" },
  { id: "crying", label: "Crying", group: "Mood", color: "cat-mood", formKind: "event", phases: ["parenting"], iconName: "mood-crying" },

  // Pregnancy — mom-centric tracks come first, baby-emergent (kicks/contractions) follow
  { id: "weight-mom", label: "My Weight", group: "Pregnancy", color: "cat-growth", formKind: "measurement", phases: ["pregnancy"], hasGraph: true, iconName: "scale" },
  { id: "mom-mood", label: "Mood", group: "Pregnancy", color: "cat-mood", formKind: "event", phases: ["pregnancy"], iconName: "mood-fine" },
  { id: "symptoms", label: "Symptoms", group: "Pregnancy", color: "cat-health", formKind: "event", phases: ["pregnancy"], iconName: "heart-pulse" },
  { id: "hydration", label: "Water", group: "Pregnancy", color: "cat-care", formKind: "event", phases: ["pregnancy"], iconName: "bath" },
  { id: "sleep-mom", label: "Sleep", group: "Pregnancy", color: "cat-sleep", formKind: "timer", phases: ["pregnancy"], iconName: "crib" },
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
  { id: "health", label: "Health", categoryIds: ["doctor", "vaccinations", "temperature", "illnesses", "medications"] },
];

export const JOURNAL_SECTIONS_PREGNANCY: JournalSection[] = [
  { id: "memories", label: "Memories", categoryIds: ["note", "picture"] },
  { id: "journey", label: "Your journey", categoryIds: [], hero: "weekly-journey" },
  { id: "body", label: "Body", categoryIds: ["kicks", "contractions"] },
  { id: "wellbeing", label: "Wellbeing", categoryIds: ["mom-mood", "symptoms", "hydration", "sleep-mom", "weight-mom"] },
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
