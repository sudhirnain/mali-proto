export type MilestoneCategory = "Cognitive" | "Language" | "Emotional" | "Social";

export type AgeBucket = "0-3" | "4-6" | "7-12";

export type Milestone = {
  id: string;
  category: MilestoneCategory;
  bucket: AgeBucket;
  label: string;
  description: string;
  /** Icon name from Illustration.tsx — used as the tile illustration. */
  iconName: string;
  /** Where the median baby falls on the completion curve, in months (used to position the chart marker). */
  medianAgeMonths: number;
  done?: boolean;
};

/**
 * iconName maps to a Phosphor icon via PHOSPHOR_MAP in Illustration.tsx.
 * Each milestone gets a different Phosphor glyph for per-tile variation.
 * (Mali APK has no per-milestone illustrations — production loads them from CDN.)
 */
export const MILESTONES: Milestone[] = [
  // 0-3 months
  { id: "m-smile", category: "Emotional", bucket: "0-3", label: "Smiles spontaneously", description: "Lu starts smiling spontaneously at you, friends, and even strangers.", iconName: "mascot-arms-up", medianAgeMonths: 2.0, done: true },
  { id: "m-suck", category: "Cognitive", bucket: "0-3", label: "Sucks on hands", description: "Discovers their hands and brings them to the mouth.", iconName: "mascot-hands", medianAgeMonths: 2.5 },
  { id: "m-look", category: "Social", bucket: "0-3", label: "Looks at you", description: "Holds eye contact with familiar faces.", iconName: "baby-face", medianAgeMonths: 1.5 },
  { id: "m-face", category: "Social", bucket: "0-3", label: "Pays attention to faces", description: "Tracks faces in the room.", iconName: "mascot-mirror", medianAgeMonths: 1.0 },
  { id: "m-bored", category: "Emotional", bucket: "0-3", label: "Becomes bored", description: "Cries if activity doesn't change.", iconName: "mood-sad", medianAgeMonths: 2.5 },
  { id: "m-head", category: "Cognitive", bucket: "0-3", label: "Holds head up", description: "Lifts head during tummy time.", iconName: "mascot-tummy", medianAgeMonths: 3.0, done: true },
  { id: "m-coo", category: "Language", bucket: "0-3", label: "Coos and gurgles", description: "Starts making cooing and gurgling sounds.", iconName: "mascot-coo", medianAgeMonths: 2.5 },

  // 4-6 months
  { id: "m-laugh", category: "Emotional", bucket: "4-6", label: "Laughs out loud", description: "First giggles arrive.", iconName: "mood-cheerful", medianAgeMonths: 4.5 },
  { id: "m-reach", category: "Cognitive", bucket: "4-6", label: "Reaches for toys", description: "Reaches with one hand to grasp.", iconName: "mascot-reach", medianAgeMonths: 5.0 },
  { id: "m-roll", category: "Cognitive", bucket: "4-6", label: "Rolls over", description: "Rolls from front to back or back to front.", iconName: "mascot-roll", medianAgeMonths: 5.5 },
  { id: "m-babble", category: "Language", bucket: "4-6", label: "Babbles", description: "Strings together vowel sounds like 'ah-ah-ah'.", iconName: "mascot-babble", medianAgeMonths: 5.5 },
  { id: "m-mirror", category: "Social", bucket: "4-6", label: "Recognizes themselves in mirror", description: "Notices the reflection.", iconName: "mascot-mirror-self", medianAgeMonths: 6.0 },

  // 7-12 months
  { id: "m-sit", category: "Cognitive", bucket: "7-12", label: "Sits without support", description: "Sits independently for short periods.", iconName: "mascot-sit", medianAgeMonths: 7.5 },
  { id: "m-wave", category: "Social", bucket: "7-12", label: "Waves bye-bye", description: "Mimics waving when prompted.", iconName: "mascot-wave", medianAgeMonths: 10.0 },
  { id: "m-name", category: "Language", bucket: "7-12", label: "Responds to name", description: "Turns when called by name.", iconName: "mascot-name", medianAgeMonths: 9.0 },
  { id: "m-stranger", category: "Emotional", bucket: "7-12", label: "Stranger anxiety", description: "Becomes shy or fearful around new people.", iconName: "mascot-stranger", medianAgeMonths: 8.0 },
  { id: "m-pincer", category: "Cognitive", bucket: "7-12", label: "Pincer grasp", description: "Picks up small things with thumb and index finger.", iconName: "mascot-pincer", medianAgeMonths: 10.0 },
];

export function milestonesByBucket(category?: MilestoneCategory) {
  const filtered = category ? MILESTONES.filter((m) => m.category === category) : MILESTONES;
  const buckets: Record<AgeBucket, Milestone[]> = { "0-3": [], "4-6": [], "7-12": [] };
  for (const m of filtered) buckets[m.bucket].push(m);
  return buckets;
}

export const MILESTONE_CATEGORIES: MilestoneCategory[] = ["Cognitive", "Language", "Emotional", "Social"];

export function getMilestone(id: string): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/** Parses "3 months, 2 days" / "1 day new" into the matching age bucket. */
export function currentMilestoneBucket(ageLabel: string): AgeBucket {
  const m = ageLabel.match(/(\d+)\s+month/i);
  const months = m ? parseInt(m[1], 10) : 0;
  if (months <= 3) return "0-3";
  if (months <= 6) return "4-6";
  return "7-12";
}

export function bucketLabel(b: AgeBucket): string {
  if (b === "0-3") return "0–3 months";
  if (b === "4-6") return "4–6 months";
  return "7–12 months";
}
