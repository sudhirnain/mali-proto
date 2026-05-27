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
  { id: "e1", categoryId: "nursing", at: iso(0), durationMin: 1, meta: "1 min, right, Lots", photo: UNSPLASH("1503454537195-1dcabb73ffb9") },
  { id: "e2", categoryId: "sleep", at: iso(2 * HOUR), durationMin: 80, meta: "1 h 20 min, night" },
  { id: "e3", categoryId: "diaper", at: iso(4 * HOUR), meta: "Mixed" },
  { id: "e4", categoryId: "nursing", at: iso(6 * HOUR), durationMin: 6, meta: "6 min, left" },
  { id: "e5", categoryId: "bottle", at: iso(10 * HOUR), durationMin: 12, meta: "120 ml" },
  { id: "e6", categoryId: "diaper", at: iso(13 * HOUR), meta: "Wet" },

  // Yesterday (May 18) — milestone + a typical day
  { id: "e7", categoryId: "milestone", at: iso(DAY + 4 * HOUR), meta: "Smiles spontaneously", milestoneId: "m-smile" },
  { id: "e8", categoryId: "sleep", at: iso(DAY + 7 * HOUR), durationMin: 95, meta: "1 h 35 min, daytime" },
  { id: "e9", categoryId: "nursing", at: iso(DAY + 9 * HOUR), durationMin: 8, meta: "8 min, both", photo: UNSPLASH("1547036967-23d11aacaee0") },
  { id: "e10", categoryId: "diaper", at: iso(DAY + 11 * HOUR), meta: "Dirty" },
  { id: "e11", categoryId: "weight-baby", at: iso(DAY + 14 * HOUR), meta: "5.4 kg" },

  // 2 days ago (May 17)
  { id: "e12", categoryId: "picture", at: iso(2 * DAY + 5 * HOUR), meta: "First giggle", photo: UNSPLASH("1519689680058-324335c77eba") },
  { id: "e13", categoryId: "nursing", at: iso(2 * DAY + 8 * HOUR), durationMin: 5, meta: "5 min, right" },
  { id: "e14", categoryId: "sleep", at: iso(2 * DAY + 12 * HOUR), durationMin: 110, meta: "1 h 50 min, night" },

  // 3 days ago (May 16)
  { id: "e15", categoryId: "vaccinations", at: iso(3 * DAY + 3 * HOUR), meta: "DTP, second dose" },
  { id: "e16", categoryId: "doctor", at: iso(3 * DAY + 4 * HOUR), meta: "3-month checkup" },
  { id: "e17", categoryId: "note", at: iso(3 * DAY + 5 * HOUR), meta: "Pediatrician very happy with weight" },

  // 4 days ago (May 15)
  { id: "e18", categoryId: "bathing", at: iso(4 * DAY + 6 * HOUR), durationMin: 12, meta: "12 min, evening", photo: UNSPLASH("1492725764893-90b379c2b6e7") },

  // 5 days ago (May 14) — milestone
  { id: "e19", categoryId: "milestone", at: iso(5 * DAY + 10 * HOUR), meta: "Holds head up", milestoneId: "m-head" },

  // Anniversary seeds — fuel memory-threading on /feed.
  // 7 days ago (~a week back): bath photo memory
  { id: "e20", categoryId: "picture", at: iso(7 * DAY + 7 * HOUR), meta: "Lu's first bath at home", photo: UNSPLASH("1492725764893-90b379c2b6e7") },
  // 14 days ago (~two weeks): note
  { id: "e21", categoryId: "note", at: iso(14 * DAY + 6 * HOUR), meta: "Held Lu skin-to-skin for an hour. Quietest hour I've ever had." },
  // 30 days ago (~a month): a first
  { id: "e22", categoryId: "picture", at: iso(30 * DAY + 8 * HOUR), meta: "First time meeting grandma", photo: UNSPLASH("1502086223501-7ea6ecd79368") },
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
