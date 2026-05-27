/**
 * Mom-centric weekly content for the /feed `MyWeekCard`. Hand-crafted blurbs
 * pinned to representative pregnancy weeks. The card finds the nearest entry
 * at or before the current week so any week renders something.
 *
 * Production version would fetch from a CMS keyed by gestational week.
 */
export type MomWeekContent = {
  week: number;
  title: string;
  lines: string[];
  cta: string;
};

const WEEKS: MomWeekContent[] = [
  {
    week: 6,
    title: "You're 6 weeks in",
    lines: [
      "Many moms feel waves of nausea between weeks 6 and 9 — it's normal and usually peaks soon.",
      "Sipping water through the day helps more than chugging glasses; log a few sips at a time.",
    ],
    cta: "Read about week 6",
  },
  {
    week: 12,
    title: "End of the first trimester",
    lines: [
      "Your energy may start coming back as the placenta takes over hormone production.",
      "Consider a check-in with your provider about routine first-trimester screening.",
    ],
    cta: "Read about week 12",
  },
  {
    week: 20,
    title: "Halfway there — week 20",
    lines: [
      "The anatomy scan often happens around now. It's the longest ultrasound you'll have.",
      "Many moms feel the first quickening — small flutters — between 18 and 22 weeks.",
    ],
    cta: "Read about week 20",
  },
  {
    week: 28,
    title: "Trimester 3 begins",
    lines: [
      "Sleep often gets trickier. A pillow between the knees and side-sleeping tend to help.",
      "Glucose screening usually lands in this window — your provider will walk you through it.",
    ],
    cta: "Read about week 28",
  },
  {
    week: 32,
    title: "Your week 32",
    lines: [
      "Baby may settle head-down this week, which can change how kicks feel.",
      "Swelling in feet and ankles is common — elevation and hydration both help. Track water if you forget.",
    ],
    cta: "Read about week 32",
  },
  {
    week: 36,
    title: "Almost there — week 36",
    lines: [
      "Practice contractions (Braxton-Hicks) often pick up. They're irregular and usually painless.",
      "Bag-packing season. Think comfort items, snacks, and a postpartum outfit.",
    ],
    cta: "Read about week 36",
  },
];

const FALLBACK: MomWeekContent = {
  week: 0,
  title: "Your week",
  lines: [
    "Every week of pregnancy carries change. Log how you're feeling — your future self will thank you.",
  ],
  cta: "Read more",
};

/** Returns the most specific content entry at or below the given week. */
export function momContentForWeek(week: number): MomWeekContent {
  const sorted = [...WEEKS].sort((a, b) => b.week - a.week);
  const match = sorted.find((w) => w.week <= week);
  if (!match) return FALLBACK;
  // Shallow-clone but swap title's week to the actual current week so weeks
  // between entries still feel addressed personally.
  return { ...match, title: match.title.replace(/week \d+/i, `week ${week}`) };
}
