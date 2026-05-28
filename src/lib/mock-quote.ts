export type Quote = { text: string; author: string };

export const MOCK_QUOTE: Quote = {
  text: "The best and most beautiful things in the world cannot be seen or touched; they are felt.",
  author: "Helen Keller",
};

/**
 * Phase-aware quote pool. Slide 56 "Nice idea!" was anchored to the inline
 * quote card in the parenting feed — Jonas approved the pattern. Picking
 * deterministically by day keeps the surface fresh without storing state.
 */
const PREGNANCY_QUOTES: Quote[] = [
  { text: "The moment a child is born, the mother is also born.", author: "Rajneesh" },
  {
    text: "A baby is something you carry inside you for nine months, in your arms for three years, and in your heart till the day you die.",
    author: "Mary Mason",
  },
  MOCK_QUOTE,
];

const PARENTING_QUOTES: Quote[] = [
  MOCK_QUOTE,
  {
    text: "There is no way to be a perfect mother, and a million ways to be a good one.",
    author: "Jill Churchill",
  },
  { text: "The days are long, but the years are short.", author: "Gretchen Rubin" },
];

export function quoteForPhase(phase: "pregnancy" | "parenting"): Quote {
  const pool = phase === "pregnancy" ? PREGNANCY_QUOTES : PARENTING_QUOTES;
  const dayIdx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % pool.length;
  return pool[dayIdx];
}

export const MOCK_FEED_TIP = {
  intro: "Lu is nearly doubling in weight each week at this point.",
};

export const MOCK_FEED_QUESTION = {
  question: "Do you travel internationally often?",
  answer: "More than 2 times per year",
};
