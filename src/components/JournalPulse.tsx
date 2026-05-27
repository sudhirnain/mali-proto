"use client";

import Link from "next/link";
import { useEntries } from "@/lib/journal-store";
import { usePhase } from "@/lib/phase";
import { categoriesForPhase } from "@/lib/categories";
import { TODAY_DATE } from "@/lib/mock-entries";
import { formatRelative, isSameDay } from "@/lib/format";
import { useMemo } from "react";

/**
 * One-line "today's pulse" strip for the FeedHeader. Surfaces the journal's
 * heartbeat right next to the quick-log cards: "X entries today · last Y ago"
 * tappable into /journal Timeline. Empty: "Start your journal — tap a card."
 */
export function JournalPulse() {
  const { phase } = usePhase();
  const entries = useEntries();

  const { todayCount, last } = useMemo(() => {
    const ids = new Set(categoriesForPhase(phase).map((c) => c.id));
    const today = entries.filter(
      (e) => ids.has(e.categoryId) && isSameDay(new Date(e.at), TODAY_DATE)
    );
    const all = entries.filter((e) => ids.has(e.categoryId));
    const recent = all.reduce<typeof all[0] | null>(
      (acc, e) => (!acc || new Date(e.at) > new Date(acc.at) ? e : acc),
      null
    );
    return { todayCount: today.length, last: recent };
  }, [entries, phase]);

  if (todayCount === 0 && !last) {
    return (
      <div className="px-4 mt-4 flex items-center justify-between text-[12px] text-neutral-700/90">
        <span className="font-medium">Start your journal — tap a card above</span>
      </div>
    );
  }

  return (
    <Link
      href="/journal"
      className="mx-4 mt-4 flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-white/60 backdrop-blur text-[12px] font-semibold text-[var(--color-primary-dark)] active:scale-[0.99] transition"
    >
      <span>
        {todayCount > 0
          ? `${todayCount} ${todayCount === 1 ? "entry" : "entries"} today`
          : "Nothing today yet"}
        {last && (
          <span className="text-neutral-600 font-medium">
            {" · last "}
            {formatRelative(last.at, TODAY_DATE)}
          </span>
        )}
      </span>
      <span aria-hidden className="text-[var(--color-primary-dark)]">→</span>
    </Link>
  );
}
