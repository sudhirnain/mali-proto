"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useJournalStore } from "@/lib/journal-store";
import { getCategory } from "@/lib/categories";
import { Illustration } from "@/components/Illustration";
import { formatTime } from "@/lib/format";

export default function EntryDetailPage() {
  const params = useParams<{ entryId: string }>();
  const router = useRouter();
  const { getEntry, removeEntry } = useJournalStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const entry = getEntry(params.entryId);

  // Milestone entries forward to the rich milestone detail page so there's a
  // single canonical screen per milestone (Overview / Details / Chart).
  useEffect(() => {
    if (entry?.categoryId === "milestone" && entry.milestoneId) {
      router.replace(`/journal/category/milestone/${entry.milestoneId}`);
    }
  }, [entry, router]);

  if (!entry) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Entry not found</h1>
        <Link href="/journal" className="text-[var(--color-primary)] underline text-sm mt-2 inline-block">
          Back to Journal
        </Link>
      </div>
    );
  }

  const cat = getCategory(entry.categoryId);
  if (!cat) return null;

  function doDelete() {
    removeEntry(entry!.id);
    router.back();
  }

  const date = new Date(entry.at);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="pb-16 min-h-full flex flex-col">
      {/* Tinted header — uses category color */}
      <header
        className="px-3 pt-4 pb-12 md:pt-[60px]"
        style={{ backgroundColor: `var(--color-${cat.color}-soft)` }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 flex items-center justify-center text-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{cat.label}</h1>
          <button
            aria-label="More"
            className="w-9 h-9 flex items-center justify-center text-neutral-700"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero: big illustration + meta */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `var(--color-${cat.color}-soft)`,
                color: `var(--color-${cat.color})`,
              }}
            >
              <Illustration name={cat.iconName} className="w-9 h-9" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                {dateLabel}
              </div>
              <div className="serif text-2xl font-semibold text-neutral-900 leading-tight mt-0.5">
                {formatTime(entry.at)}
              </div>
              {entry.meta && (
                <div className="text-sm text-neutral-700 mt-1">{entry.meta}</div>
              )}
            </div>
          </div>

          {/* Photo (if present) */}
          {entry.photo && (
            <div className="mt-4 relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src={entry.photo} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          )}

          {/* Duration callout for timer entries */}
          {entry.durationMin !== undefined && (
            <div className="mt-4 bg-neutral-50 rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                Duration
              </span>
              <span className="text-base font-semibold text-neutral-900 tabular-nums">
                {formatDuration(entry.durationMin)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <Link
          href={`/log/${cat.id}?id=${entry.id}`}
          className="flex items-center justify-center gap-2 py-3 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm active:scale-[0.98] transition"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          Edit
        </Link>
        {confirmDelete ? (
          <button
            onClick={doDelete}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm active:scale-[0.98] transition"
          >
            Confirm delete
          </button>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-white border-2 border-neutral-200 text-neutral-700 font-semibold text-sm active:scale-[0.98] transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            Delete
          </button>
        )}
      </div>

      {/* Category shortcut */}
      <div className="px-4 mt-5">
        <Link
          href={`/journal/category/${cat.id}`}
          className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-neutral-100 active:scale-[0.99] transition"
        >
          <span className="text-sm text-neutral-700">
            See all <span className="font-semibold">{cat.label}</span> entries
          </span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
