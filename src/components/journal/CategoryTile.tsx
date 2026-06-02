"use client";

import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { getCategory, tileColor } from "@/lib/categories";
import { TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { isSameDay } from "@/lib/format";

/**
 * Tile for the Journal → Moments grid. Shows a category icon, label, and a
 * "X today · last Y ago" recency summary (every populated tile gets the same
 * shape so scanning is consistent). Empty tiles read "Not yet" — discovery
 * stays alive after first entry.
 */
export function CategoryTile({
  categoryId,
  entries,
}: {
  categoryId: string;
  entries: Entry[];
}) {
  const cat = getCategory(categoryId);
  if (!cat) return null;

  const own = entries.filter((e) => e.categoryId === categoryId);
  const empty = own.length === 0;

  return (
    <Link
      href={`/journal/category/${cat.id}`}
      className={`
        flex flex-col gap-1.5 rounded-2xl border p-3
        min-h-[106px] active:scale-[0.98] transition
        ${empty ? "bg-neutral-50 border-neutral-100" : "bg-white border-neutral-100"}
      `}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `var(--color-${tileColor(cat)}-soft)`,
          color: `var(--color-${tileColor(cat)})`,
        }}
        aria-hidden
      >
        {/* Icons in tiles (Jonas s15); the colored cartoon stays on the
            category-detail hero only, so small tiles read cleanly. */}
        <Illustration name={cat.iconName} className="w-4 h-4" />
      </div>

      <div className="text-[13px] font-semibold text-neutral-900 leading-tight">
        {cat.label}
      </div>

      <div
        className={`text-[10.5px] leading-tight mt-auto ${
          empty ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        {empty ? "Not yet" : tileMeta(own)}
      </div>
    </Link>
  );
}

function tileMeta(own: Entry[]): string {
  const today = own.filter((e) => isSameDay(new Date(e.at), TODAY_DATE)).length;
  const last = own.reduce((a, b) => (new Date(a.at) > new Date(b.at) ? a : b));
  if (today > 0) return `${today} today · last ${shortAgo(last.at)}`;
  return `${own.length} ${own.length === 1 ? "entry" : "entries"} · ${shortAgo(last.at)}`;
}

function shortAgo(iso: string): string {
  const ms = TODAY_DATE.getTime() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}
