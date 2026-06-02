/**
 * Maps our milestone IDs to the production line-art PNGs (Mali "Milestones
 * archieve" set). Most are confident name matches; the File_NNN entries are
 * visual matches catalogued by hand from the unnamed portion of the archive.
 *
 * To add more mappings, drop the file into public/mali-art/milestones/ and add
 * the entry below. Filenames are URL-encoded inline so existing camelCase /
 * spaces in the original archive don't need to be renamed on disk.
 */
const ART: Record<string, string> = {
  // Name-matched from the labeled portion of the archive
  "m-smile":   "begins to smile at people.png",
  "m-suck":    "Sucks on hands to calm down.png",
  "m-look":    "looks at you.png",
  "m-face":    "Pays more attention to faces.png",
  "m-bored":   "Gets bored if activites doesn_t change.png",
  "m-head":    "Can hold head up.png",
  "m-reach":   "Can hold a toy and shake it.png",
  "m-roll":    "Is able to roll over from tummy to back.png",
  "m-mirror":  "MS129 Basic self awareness.PNG",
  "m-sit":     "Sits without support.png",
  "m-name":    "Turns head toward sounds.png",
  "m-pincer":  "MS84 thumb and index.PNG",
  // Visually matched from the unnamed File_NNN portion of the archive
  "m-coo":      "File_046.png", // smiling baby + empty speech bubble
  "m-babble":   "File_108.png", // baby with speech bubble containing an object (sounds + meaning)
  "m-laugh":    "File_087.png", // standing baby, wide-open laughing mouth
  "m-wave":     "File_101.png", // baby with both arms raised
  "m-stranger": "File_119.png", // distressed baby covering face / crying
};

// Generic line-art baby (arms raised in celebration) shown for milestones with
// no specific mapping — e.g. user-added custom milestones. Keeps a hand-drawn
// illustration on every detail screen instead of a utility glyph (Jonas s11:
// "Add default milestone drawing").
const GENERIC_FALLBACK = "File_155.png";

export function milestoneArt(id: string): string | null {
  const file = ART[id];
  return file ? `/mali-art/milestones/${encodeURIComponent(file)}` : null;
}

/** Mapped art for the milestone, or the generic fallback drawing. Always returns
 *  a path so a line-art illustration renders even for unmapped milestones. */
export function milestoneArtOrFallback(id: string): string {
  return (
    milestoneArt(id) ??
    `/mali-art/milestones/${encodeURIComponent(GENERIC_FALLBACK)}`
  );
}
