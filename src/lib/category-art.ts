/**
 * Maps category IDs to the colored hero illustrations from the "drive-download"
 * archive (production hand-drawn cartoons used as growth/measurement art).
 * Returns null for categories without a matching illustration — callers fall
 * back to the existing Phosphor icon.
 */
const ART: Record<string, string> = {
  length: "/mali-art/category/length.png",
  head: "/mali-art/category/head.png",
  "weight-baby": "/mali-art/category/weight-baby.png",
  "weight-mom": "/mali-art/category/weight-mom.png",
  kicks: "/mali-art/category/kicks.png",
};

export function categoryArt(id: string): string | null {
  return ART[id] ?? null;
}
