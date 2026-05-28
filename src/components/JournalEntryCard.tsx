"use client";

import Image from "next/image";
import Link from "next/link";
import { Illustration } from "./Illustration";
import { useLightbox } from "./PhotoLightbox";
import { getCategory, type Category } from "@/lib/categories";
import { formatTime } from "@/lib/format";
import type { Entry } from "@/lib/mock-entries";

/**
 * Journal entry card with three variants — driven by category type so the
 * journal feels like a record, not a database:
 *
 *   memory      — note / picture / quote / milestone. Rich card. Photo bleeds
 *                 edge-to-edge if present; serif title; generous padding.
 *   measurement — weight-baby / weight-mom / length / head. Compact row, the
 *                 value (e.g. "5.4 kg") is the prominent element.
 *   care        — everything else. Tight horizontal row, low visual weight.
 *
 * Memories breathe; trackers compress. The Timeline reads as a family record
 * with care logs as connective tissue.
 */

const MEMORY_IDS = new Set(["note", "picture", "quote", "milestone"]);
const MEASUREMENT_IDS = new Set(["weight-baby", "weight-mom", "length", "head"]);

type Variant = "memory" | "measurement" | "care";

function variantOf(catId: string): Variant {
  if (MEMORY_IDS.has(catId)) return "memory";
  if (MEASUREMENT_IDS.has(catId)) return "measurement";
  return "care";
}

export function JournalEntryCard({ entry }: { entry: Entry }) {
  const cat = getCategory(entry.categoryId);
  if (!cat) return null;

  const v = variantOf(cat.id);
  if (v === "memory") return <MemoryEntryCard entry={entry} cat={cat} />;
  if (v === "measurement") return <MeasurementRow entry={entry} cat={cat} />;
  return <CareRow entry={entry} cat={cat} />;
}

function MemoryEntryCard({ entry, cat }: { entry: Entry; cat: Category }) {
  const hasPhoto = Boolean(entry.photo);
  const isQuote = cat.id === "quote";
  const lightbox = useLightbox();

  return (
    <Link
      href={`/journal/entry/${entry.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm active:scale-[0.99] transition"
    >
      {hasPhoto && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            lightbox.open([entry.photo!]);
          }}
          aria-label="View photo full screen"
          className="relative w-full aspect-[16/10] bg-neutral-100 block active:opacity-95"
        >
          <Image
            src={entry.photo!}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover"
          />
        </button>
      )}
      <div className="px-4 py-3.5">
        <div
          className={`serif font-semibold text-neutral-900 leading-snug ${
            hasPhoto ? "text-[16px]" : "text-[17px]"
          } ${isQuote ? "italic" : ""}`}
        >
          {isQuote && <span className="text-neutral-400" aria-hidden>“</span>}
          {entry.meta || cat.label}
          {isQuote && <span className="text-neutral-400" aria-hidden>”</span>}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: `var(--color-${cat.color})` }}
            aria-hidden
          />
          <span>
            {cat.label} · {formatTime(entry.at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PhotoThumb({ src }: { src: string }) {
  const lightbox = useLightbox();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        lightbox.open([src]);
      }}
      aria-label="View photo full screen"
      className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-neutral-100 active:opacity-90"
    >
      <Image src={src} alt="" fill sizes="36px" className="object-cover" />
    </button>
  );
}

function CareRow({ entry, cat }: { entry: Entry; cat: Category }) {
  return (
    <Link
      href={`/journal/entry/${entry.id}`}
      className="flex items-center gap-3 bg-white rounded-xl border border-neutral-100 px-3 py-2.5 active:scale-[0.99] transition"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `var(--color-${cat.color}-soft)`,
          color: `var(--color-${cat.color})`,
        }}
        aria-hidden
      >
        <Illustration name={cat.iconName} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-[13px] font-semibold text-neutral-900 leading-tight shrink-0">
          {cat.label}
        </span>
        {entry.meta && (
          <span className="text-[12px] text-neutral-500 leading-tight truncate min-w-0">
            {entry.meta}
          </span>
        )}
      </div>
      {entry.photo && <PhotoThumb src={entry.photo} />}
      <span className="text-[11px] text-neutral-400 tabular-nums shrink-0 leading-tight">
        {formatTime(entry.at)}
      </span>
    </Link>
  );
}

function MeasurementRow({ entry, cat }: { entry: Entry; cat: Category }) {
  return (
    <Link
      href={`/journal/entry/${entry.id}`}
      className="flex items-center gap-3 bg-white rounded-xl border border-neutral-100 px-3 py-2.5 active:scale-[0.99] transition"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `var(--color-${cat.color}-soft)`,
          color: `var(--color-${cat.color})`,
        }}
        aria-hidden
      >
        <Illustration name={cat.iconName} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="serif text-[16px] font-semibold text-neutral-900 leading-tight tabular-nums shrink-0">
          {entry.meta || "—"}
        </span>
        <span className="text-[11px] text-neutral-500 leading-tight truncate min-w-0">
          {cat.label}
        </span>
      </div>
      {entry.photo && <PhotoThumb src={entry.photo} />}
      <span className="text-[11px] text-neutral-400 tabular-nums shrink-0 leading-tight">
        {formatTime(entry.at)}
      </span>
    </Link>
  );
}
