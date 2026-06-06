/**
 * Mock editorial articles — the targets of every "Read more" link (Jonas
 * round-2: "Show how we display an article"). Production content is CMS-fed
 * (Thai); these are English stand-ins shaped like the production article
 * screen: hero illustration, title, lede, short sections.
 */
export type Article = {
  slug: string;
  eyebrow: string;
  title: string;
  minutes: number;
  /** public/ path of the hero illustration (contained, not cropped). */
  hero: string;
  /** CSS background for the hero block — keeps cartoons on a soft tint. */
  heroBg: string;
  body: string[];
  source?: string;
};

export const ARTICLES: Record<string, Article> = {
  "bottle-feeding-amounts": {
    slug: "bottle-feeding-amounts",
    eyebrow: "Feeding",
    title: "How much milk does a bottle-fed baby need?",
    minutes: 3,
    hero: "/mali-illustrations/happy_hands_up_baby.png",
    heroBg: "var(--color-primary-softer)",
    body: [
      "In the first few weeks most bottle-fed babies take around 450–750 ml of milk across a day, split over 6–8 feeds. As the stomach grows this climbs to roughly 750–950 ml a day, usually in fewer, larger feeds.",
      "Every baby is different, and appetite swings from day to day — a growth spurt can add a feed, a sleepy day can drop one. The daily total over a week tells you far more than any single bottle.",
      "Follow hunger and fullness cues rather than forcing a target: rooting and hands to the mouth mean hungry; turning away and relaxing the hands mean done. A baby gaining steadily with plenty of wet diapers is getting enough.",
      "If your baby consistently takes far more or far less than these ranges, or isn't gaining as expected, raise it at your next check-up.",
    ],
    source: "Mali editorial · reviewed by our medical team",
  },
  "newborn-fever": {
    slug: "newborn-fever",
    eyebrow: "Health",
    title: "Fever in newborns — when it's an emergency",
    minutes: 2,
    hero: "/mali-illustrations/happy_hands_up_baby.png",
    heroBg: "var(--color-primary-softer)",
    body: [
      "For a newborn, a temperature of 38 °C (100.4 °F) or higher is not something to watch at home — it is a medical emergency. Call your doctor or go to the emergency room straight away, even if your baby otherwise seems fine.",
      "Young babies can become seriously unwell very quickly, and a fever may be the only early sign of an infection that needs treatment within hours. The younger the baby, the more urgent it is.",
      "Measure rectally for the most reliable reading in the first months, and don't give any fever medicine to a newborn unless a doctor tells you to — the priority is getting them seen, not bringing the number down.",
      "After the newborn weeks the threshold relaxes, but if you are ever unsure, trust your instinct and call. No one will mind you checking.",
    ],
    source: "Mali editorial · reviewed by our medical team",
  },
  "healthy-weight-gain": {
    slug: "healthy-weight-gain",
    eyebrow: "Your body",
    title: "Weight gain in pregnancy — what's healthy?",
    minutes: 4,
    hero: "/mali-art/category/weight-mom.png",
    heroBg: "var(--color-cat-growth-soft)",
    body: [
      "Gaining weight during pregnancy is not just normal — it's a sign your body is doing exactly what it should. The extra kilos are your baby, the placenta, amniotic fluid, increased blood volume, and the energy reserves your body builds for birth and breastfeeding.",
      "How much gain is healthy depends on where you started. As a rule of thumb, most women in a healthy weight range gain 11–16 kg across the whole pregnancy: roughly 1–2 kg in the first trimester, then about half a kilo per week through the second and third.",
      "The curve matters more than any single number. A steady trend inside the band on your chart is reassuring even if individual weigh-ins jump around — water retention alone can swing a daily reading by a kilo.",
      "Talk to your midwife or doctor if your weight changes very suddenly (more than 1 kg in a week in the third trimester), as this can be a sign of fluid retention worth checking — or if you're losing weight after the first trimester.",
    ],
    source: "Mali editorial · reviewed by our medical team",
  },
  "reading-growth-curves": {
    slug: "reading-growth-curves",
    eyebrow: "Development",
    title: "How to read your baby's growth curve",
    minutes: 3,
    hero: "/mali-art/category/weight-baby.png",
    heroBg: "var(--color-cat-growth-soft)",
    body: [
      "The shaded band on the chart shows the range where most healthy babies fall — from the 3rd to the 97th percentile of the WHO growth standards. Being near the top or bottom of the band is not better or worse; babies are simply different sizes.",
      "What pediatricians look at is the shape of your baby's own curve. A baby tracking steadily along the 10th percentile is growing beautifully; a baby dropping from the 75th to the 25th within a few weeks deserves a closer look, even though both numbers are 'inside the band'.",
      "Weigh-ins bounce around — a feed, a nap, a diaper all move the number. Trust the trend over weeks, not the difference between two visits.",
      "Bring questions to your regular check-ups: that's exactly what they're for. Your doctor sees the same chart you see here, with your baby's full history.",
    ],
    source: "WHO Child Growth Standards",
  },
  "milestones-pace": {
    slug: "milestones-pace",
    eyebrow: "Development",
    title: "Every baby has their own pace",
    minutes: 3,
    hero: "/mali-illustrations/happy_hands_up_baby.png",
    heroBg: "var(--color-primary-softer)",
    body: [
      "Milestone ages are medians, not deadlines. 'Most babies smile around 1 month' means half of all babies smile later than that — and almost all of them are developing perfectly.",
      "The ranges are wide on purpose. Rolling over spans roughly 3 to 7 months; first words anywhere from 9 to 15. A baby who is 'late' on one milestone is very often early on another.",
      "What's worth watching is the overall direction: new skills keep arriving, your baby responds to you, and earlier skills don't disappear. Losing a skill that was solid is the one pattern worth raising with your doctor promptly.",
      "If a milestone sits unchecked well past its range, mention it at your next check-up. One data point is a conversation starter, not a diagnosis.",
    ],
    source: "Denver Developmental Screening Tests",
  },
  "dha-omega3": {
    slug: "dha-omega3",
    eyebrow: "Nutrition",
    title: "The importance of DHA and Omega-3 in pregnancy",
    minutes: 4,
    hero: "/mali-illustrations/belly_heart_illustration.png",
    heroBg: "var(--color-primary-softer)",
    body: [
      "DHA is an omega-3 fatty acid that is vital to your baby's development. It plays a key role in the formation of retinal and brain tissue, so it's very important for developing healthy eyes and brains.",
      "Your baby can't make DHA — it all comes from you. During the third trimester, the brain grows faster than at any other time, and DHA transfer across the placenta peaks with it.",
      "Two portions of low-mercury oily fish a week (salmon, sardines, mackerel) cover most needs. If fish isn't part of your diet, algae-based DHA supplements are a vegetarian-friendly alternative — aim for around 200 mg of DHA per day.",
      "Omega-3s also support you: studies link adequate DHA with lower rates of early preterm birth and may support mood in the postpartum months.",
    ],
    source: "Mali editorial · reviewed by our medical team",
  },
  "safe-to-eat": {
    slug: "safe-to-eat",
    eyebrow: "3rd trimester",
    title: "What's safe to eat — and what to skip",
    minutes: 5,
    hero: "/mali-illustrations/pregnant_2.png",
    heroBg: "var(--color-primary-softer)",
    body: [
      "Keep cravings happy without crossing into risk: pasteurized dairy is fine, soft mould-ripened cheeses aren't. Cooked fish is great; raw or high-mercury fish should sit out the third trimester.",
      "Caffeine is fine in moderation — keep it under about 200 mg a day, roughly one strong coffee. Herbal teas vary, so check the unusual ones.",
      "Deli meats and pre-made salads are about listeria risk, which heat removes: the same ham is fine on a hot pizza. Wash fruit and vegetables, and reheat leftovers until steaming.",
      "Hydrate more than you think you need to — your blood volume is up by almost half, and amniotic fluid is replaced constantly.",
    ],
    source: "Mali editorial · reviewed by our medical team",
  },
  "hospital-bag": {
    slug: "hospital-bag",
    eyebrow: "Preparing",
    title: "Your hospital bag — the short version",
    minutes: 3,
    hero: "/mali-illustrations/pregnant_4.png",
    heroBg: "var(--color-primary-softer)",
    body: [
      "Pack between weeks 35 and 36 — early enough to not think about it during early labor, late enough that you know what you actually want in it.",
      "Three categories. For labor: lip balm, hair tie, slip-on shoes, a long phone cable, snacks for your partner. For after: loose dark pajamas, your own pillow, toiletries in travel sizes, comfortable underwear you won't miss.",
      "For the baby: a going-home outfit in two sizes (newborn sizing is a lottery), a hat, and the car seat installed and tested before week 37 — not in the parking lot on discharge day.",
      "Leave room: you'll come home with more than you brought. Paperwork, gifts, and an entire human.",
    ],
  },
  "sleep-late-pregnancy": {
    slug: "sleep-late-pregnancy",
    eyebrow: "Wellbeing",
    title: "Sleep tips for late pregnancy",
    minutes: 3,
    hero: "/mali-illustrations/pregnant_1.png",
    heroBg: "var(--color-cat-sleep-soft)",
    body: [
      "Side-sleeping — preferably the left side — keeps blood flowing freely to the placenta and helps your kidneys clear fluid, which means less swelling in your ankles by morning.",
      "Build a pillow fort without apology: one between the knees aligns the hips, a small one under the belly takes the weight off your lower back, one behind you stops you rolling flat.",
      "Avoid lying flat on your back after week 28 — the weight of the uterus can compress the vein returning blood to your heart. If you wake up on your back, don't panic; just roll to your side.",
      "If you're awake at 3am anyway: that's hormones, a busy baby, and a bladder with no space. Short daytime naps are a legitimate strategy, not a defeat.",
    ],
  },
  "braxton-hicks": {
    slug: "braxton-hicks",
    eyebrow: "What to expect",
    title: "Braxton-Hicks vs. the real thing",
    minutes: 4,
    hero: "/mali-illustrations/contraction_illustration.png",
    heroBg: "var(--color-cat-contractions-soft)",
    body: [
      "Practice contractions feel like a tightening that comes and goes — irregular, painless or mildly uncomfortable, and they fade if you change position, walk, or drink a glass of water.",
      "Real contractions have a direction: they get closer together, last longer, and grow stronger over time, no matter what you do. Many women describe the difference as 'a wave that builds' versus 'a squeeze that just happens'.",
      "The 5-1-1 rule is the classic threshold: contractions 5 minutes apart, lasting 1 minute each, sustained for 1 hour — time to call your midwife or head in.",
      "Use the contraction timer in Mali to take the guesswork out: it tracks duration and the gap between contractions for you, so you can read the pattern instead of trying to feel it.",
    ],
  },
};

/** Category-detail "Read more" target for a given trackable category. */
export function articleForCategory(catId: string): Article | null {
  if (catId === "weight-mom") return ARTICLES["healthy-weight-gain"];
  if (catId === "weight-baby" || catId === "length" || catId === "head")
    return ARTICLES["reading-growth-curves"];
  return null;
}
