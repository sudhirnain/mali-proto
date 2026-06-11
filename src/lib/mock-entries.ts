export type Entry = {
  id: string;
  categoryId: string;
  // ISO datetime
  at: string;
  // for timer-style entries
  durationMin?: number;
  // generic meta line shown under the title
  meta?: string;
  // optional photo url (we'll fake with a gradient swatch)
  photo?: string;
  // milestone entries link back to their milestone via this id so we can
  // route taps on a milestone entry card straight to the rich detail page
  milestoneId?: string;
};

// Anchor "today" to the actual current day at 22:30 local. This way any entry
// the user creates during the demo (which uses `new Date()`) lands in the
// same "Today" bucket as the seeded entries — no orphan "Thursday, May N"
// group floating above the Today section.
const _now = new Date();
const TODAY = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 22, 30, 0);
const iso = (offsetMin: number) => new Date(TODAY.getTime() - offsetMin * 60_000).toISOString();

// Stable Unsplash photo URLs (small thumb crop). Real images make the
// prototype look like a real product instead of pastel placeholders.
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=160&h=160&fit=crop&auto=format&q=70`;

// Anchor "today" at 22:30. Use offset minutes so each entry's *time of day* is
// realistic (a nursing log at 22:00 should look like a late feed, not 02:30 the
// next morning). Day buckets are 24h apart so journal grouping reads cleanly:
//   today      = 0-23h back
//   yesterday  = 24-47h back
//   2 days ago = 48-71h back, etc.
const DAY = 24 * 60;
const HOUR = 60;
export const MOCK_ENTRIES: Entry[] = [
  // Today (May 19, anchored at 22:30) — typical day of logs
  // Slide 11 comment: "Add image. All entries should allow to add an image."
  // Photos sprinkled across care / measurement / event / memory categories so
  // the timeline visually demonstrates the rule — not just on pictures.
  { id: "e1", categoryId: "nursing", at: iso(0), durationMin: 1, meta: "1 min (R), Okay", photo: UNSPLASH("1503454537195-1dcabb73ffb9") },
  { id: "e2", categoryId: "sleep", at: iso(2 * HOUR), durationMin: 80, meta: "1 h 20 min, night", photo: UNSPLASH("1519689680058-324335c77eba") },
  { id: "e3", categoryId: "diaper", at: iso(4 * HOUR), meta: "Mixed" },
  { id: "e4", categoryId: "nursing", at: iso(6 * HOUR), durationMin: 6, meta: "6 min (L)" },
  { id: "e5", categoryId: "bottle", at: iso(10 * HOUR), durationMin: 12, meta: "120 ml", photo: UNSPLASH("1547036967-23d11aacaee0") },
  { id: "e6", categoryId: "diaper", at: iso(13 * HOUR), meta: "Wet" },

  // Yesterday (May 18) — milestone + a typical day
  { id: "e7", categoryId: "milestone", at: iso(DAY + 4 * HOUR), meta: "Smiles spontaneously", milestoneId: "m-smile" },
  { id: "e8", categoryId: "sleep", at: iso(DAY + 7 * HOUR), durationMin: 95, meta: "1 h 35 min, daytime" },
  { id: "e9", categoryId: "nursing", at: iso(DAY + 9 * HOUR), durationMin: 8, meta: "8 min (L 4m · R 4m), Good", photo: UNSPLASH("1547036967-23d11aacaee0") },
  { id: "e10", categoryId: "diaper", at: iso(DAY + 11 * HOUR), meta: "Dirty" },
  { id: "e11", categoryId: "weight-baby", at: iso(DAY + 14 * HOUR), meta: "5.4 kg", photo: UNSPLASH("1502086223501-7ea6ecd79368") },

  // 2 days ago (May 17)
  { id: "e12", categoryId: "picture", at: iso(2 * DAY + 5 * HOUR), meta: "First giggle", photo: UNSPLASH("1519689680058-324335c77eba") },
  { id: "e13", categoryId: "nursing", at: iso(2 * DAY + 8 * HOUR), durationMin: 5, meta: "5 min (R), Poor" },
  { id: "e14", categoryId: "sleep", at: iso(2 * DAY + 12 * HOUR), durationMin: 110, meta: "1 h 50 min, night" },

  // 3 days ago (May 16)
  { id: "e15", categoryId: "vaccinations", at: iso(3 * DAY + 3 * HOUR), meta: "DTP, second dose", photo: UNSPLASH("1503454537195-1dcabb73ffb9") },
  { id: "e16", categoryId: "doctor", at: iso(3 * DAY + 4 * HOUR), meta: "3-month checkup" },
  { id: "e17", categoryId: "note", at: iso(3 * DAY + 5 * HOUR), meta: "Pediatrician very happy with weight", photo: UNSPLASH("1502086223501-7ea6ecd79368") },

  // 4 days ago (May 15)
  { id: "e18", categoryId: "bathing", at: iso(4 * DAY + 6 * HOUR), durationMin: 12, meta: "12 min, evening", photo: UNSPLASH("1617817740234-86b952cf9b04") },

  // 5 days ago (May 14) — milestone
  { id: "e19", categoryId: "milestone", at: iso(5 * DAY + 10 * HOUR), meta: "Holds head up", milestoneId: "m-head" },

  // Anniversary seeds — fuel memory-threading on /feed.
  // 7 days ago (~a week back): bath photo memory
  { id: "e20", categoryId: "picture", at: iso(7 * DAY + 7 * HOUR), meta: "Lu's first bath at home", photo: UNSPLASH("1609220361664-a5cd02bc7345") },
  // 14 days ago (~two weeks): note
  { id: "e21", categoryId: "note", at: iso(14 * DAY + 6 * HOUR), meta: "Held Lu skin-to-skin for an hour. Quietest hour I've ever had." },
  // 30 days ago (~a month): a first
  { id: "e22", categoryId: "picture", at: iso(30 * DAY + 8 * HOUR), meta: "First time meeting grandma", photo: UNSPLASH("1502086223501-7ea6ecd79368") },

  // ─────────────────────────────────────────────────────────────────────
  // PREGNANCY (week-32 user). Without these, pregnancy + Populated showed
  // empty timelines / category lists / Wellbeing section. One entry per
  // pregnancy category at minimum so every category-detail screen
  // populates.
  // ─────────────────────────────────────────────────────────────────────
  { id: "p1", categoryId: "mom-mood", at: iso(3 * HOUR), meta: "Cheerful" },
  { id: "p2", categoryId: "hydration", at: iso(5 * HOUR), meta: "Glass (350ml)" },
  { id: "p3", categoryId: "kicks", at: iso(9 * HOUR), durationMin: 23, meta: "10 kicks, 23 min" },
  { id: "p4", categoryId: "symptoms", at: iso(12 * HOUR), meta: "Back pain" },

  // Yesterday
  { id: "p5", categoryId: "weight-mom", at: iso(DAY + 7 * HOUR), meta: "68 kg" },
  { id: "p6", categoryId: "sleep-mom", at: iso(DAY + 12 * HOUR), durationMin: 440, meta: "7 h 20 min, night" },
  { id: "p7", categoryId: "hydration", at: iso(DAY + 4 * HOUR), meta: "Bottle (500ml)" },

  // 2 days ago
  { id: "p8", categoryId: "mom-mood", at: iso(2 * DAY + 5 * HOUR), meta: "Anxious" },
  { id: "p9", categoryId: "contractions", at: iso(2 * DAY + 14 * HOUR), durationMin: 1, meta: "1 contraction, ~40s" },

  // 3 days ago — pregnancy memory note
  { id: "p10", categoryId: "note", at: iso(3 * DAY + 10 * HOUR), meta: "Felt the strongest kick yet — startled me at dinner." },

  // 4 days ago
  { id: "p11", categoryId: "weight-mom", at: iso(4 * DAY + 7 * HOUR), meta: "67.5 kg" },
  { id: "p12", categoryId: "mom-mood", at: iso(4 * DAY + 8 * HOUR), meta: "Grateful" },
  { id: "p13", categoryId: "kicks", at: iso(4 * DAY + 6 * HOUR), durationMin: 41, meta: "10 kicks, 41 min" },

  // 5 days ago — prenatal checkup
  { id: "p14", categoryId: "doctor", at: iso(5 * DAY + 4 * HOUR), meta: "Routine prenatal checkup, all normal" },

  // ─────────────────────────────────────────────────────────────────────
  // PARENTING — fill the categories that weren't represented in the seed
  // above (solids, pumping, stroll, length, head, temperature, illnesses,
  // medications, mood, quote). One per category so the populated state
  // has SOMETHING for every category-detail screen.
  // ─────────────────────────────────────────────────────────────────────
  { id: "pa1", categoryId: "stroll", at: iso(3 * HOUR), durationMin: 30, meta: "30 min, evening walk" },
  { id: "pa2", categoryId: "solids", at: iso(8 * HOUR), meta: "Fruit, mashed pear" },

  // Yesterday
  { id: "pa3", categoryId: "pumping", at: iso(DAY + 6 * HOUR), durationMin: 8, meta: "8 min, 90ml, both" },
  { id: "pa4", categoryId: "medications", at: iso(DAY + 2 * HOUR), meta: "Vitamin D, 1 drop" },

  // 2 days ago
  { id: "pa5", categoryId: "length", at: iso(2 * DAY + 10 * HOUR), meta: "63 cm" },
  { id: "pa6", categoryId: "temperature", at: iso(2 * DAY + 16 * HOUR), meta: "37.0 °C" },

  // 3 days ago
  { id: "pa7", categoryId: "illnesses", at: iso(3 * DAY + 9 * HOUR), meta: "Cough, mild" },

  // 4 days ago — head circumference
  { id: "pa8", categoryId: "head", at: iso(4 * DAY + 12 * HOUR), meta: "40 cm" },

  // 5 days ago — mood log
  { id: "pa9", categoryId: "mood", at: iso(5 * DAY + 7 * HOUR), meta: "Cheerful — Smiles all day" },

  // 6 days ago — quote
  { id: "pa10", categoryId: "quote", at: iso(6 * DAY + 9 * HOUR), meta: "The best and most beautiful things in the world cannot be seen or touched; they are felt." },
];

// Pregnancy mock kicks
export const MOCK_KICK_SESSIONS = [
  { id: "k1", at: iso(60 * 4), kicks: 10, durationMin: 23 },
  { id: "k2", at: iso(60 * 24), kicks: 10, durationMin: 41 },
  { id: "k3", at: iso(60 * 48), kicks: 10, durationMin: 35 },
  { id: "k4", at: iso(60 * 72), kicks: 8, durationMin: 120 }, // incomplete
];

// Pregnancy mock contractions
export const MOCK_CONTRACTIONS = [
  { id: "c1", at: iso(8), durationSec: 45, intervalMin: 7 },
  { id: "c2", at: iso(15), durationSec: 50, intervalMin: 7 },
  { id: "c3", at: iso(22), durationSec: 55, intervalMin: 7 },
  { id: "c4", at: iso(30), durationSec: 60, intervalMin: 8 },
];

export function entriesForDate(date: Date): Entry[] {
  const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
  return MOCK_ENTRIES.filter((e) => {
    const dt = new Date(e.at);
    return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
  });
}

export function entriesByDay(): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>();
  for (const e of MOCK_ENTRIES) {
    const dt = new Date(e.at);
    const key = dt.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return map;
}

export const TODAY_DATE = TODAY;
