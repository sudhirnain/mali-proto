"use client";

import Link from "next/link";
import { Illustration } from "./Illustration";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { useEntries } from "@/lib/journal-store";
import { formatRelative } from "@/lib/format";

type Props = {
  /** Category id from the registry. */
  id: string;
  /** Optional override for the last-event subtext. */
  subtext?: string;
  badge?: number;
};

export function QuickLogCard({ id, subtext, badge }: Props) {
  const cat = getCategory(id);
  const entries = useEntries();
  if (!cat) return null;

  const label = cat.label;
  const icon = cat.iconName;
  const color = cat.color;
  const href = `/log/${cat.id}`;

  // Derive last-event time
  let sub = subtext;
  if (!sub) {
    const last = entries.find((e) => e.categoryId === cat.id);
    sub = last ? formatRelative(last.at) : "Not yet";
  }

  return (
    <Link
      href={href}
      className="relative flex-1 min-w-0 bg-white rounded-3xl pt-3 pb-3 px-2 shadow-sm flex flex-col items-center gap-1 active:scale-[0.98] transition"
    >
      {/* Tinted icon circle + badge */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `var(--color-${color}-soft)`,
            color: `var(--color-${color})`,
          }}
        >
          <Illustration name={icon} className="w-7 h-7" />
        </div>
        {badge !== undefined && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-xs font-bold flex items-center justify-center px-1 ring-2 ring-white"
            style={{ backgroundColor: `var(--color-${color})` }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="text-sm font-semibold text-neutral-900 leading-tight truncate w-full text-center mt-1">
        {label}
      </div>
      <div className="text-xs text-neutral-500 leading-tight truncate w-full text-center">{sub}</div>
    </Link>
  );
}

/** Smaller pill-style icon shown in the expanded grid below the 3 main cards. */
export function MiniLogTile({ id }: { id: string }) {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return null;
  return (
    <Link
      href={`/log/${cat.id}`}
      className="flex flex-col items-center gap-1 bg-white rounded-2xl p-2 shadow-sm active:scale-[0.96] transition"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: `var(--color-${cat.color}-soft)`,
          color: `var(--color-${cat.color})`,
        }}
      >
        <Illustration name={cat.iconName} className="w-5 h-5" />
      </div>
      {/* 2-line, tight wrap: "Contractions" survives without an ugly "Contr…"
       *  truncation. "Symptoms" fits on one line at this size. */}
      <div className="text-[10.5px] font-medium text-neutral-700 leading-[1.15] w-full text-center break-words">
        {cat.label}
      </div>
    </Link>
  );
}
