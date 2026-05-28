"use client";

import Image from "next/image";
import { useMemo } from "react";
import { FeedHeader } from "@/components/FeedHeader";
import { PrimaryFAB } from "@/components/PrimaryFAB";
import { WelcomeCard } from "@/components/WelcomeCard";
import { MemoryThread } from "@/components/MemoryThread";
import { usePhase } from "@/lib/phase";
import { useEntries } from "@/lib/journal-store";
import { categoriesForPhase } from "@/lib/categories";
import { quoteForPhase, MOCK_FEED_TIP, MOCK_FEED_QUESTION } from "@/lib/mock-quote";

/**
 * The home tab.
 *
 * Mali's home is a CONTENT feed (tips / quotes / editorial), not a journal
 * feed. The journal surfaces only via the header (stat strip + quick-log
 * cards showing "last logged X ago"). Today-pills have been removed from
 * the body -- chronology lives on /journal exclusively.
 *
 * Cold-state difference: the WelcomeCard appears between header and progress
 * cards as a standalone block, giving a new user a friendly first action
 * before the editorial content begins.
 */
export default function FeedPage() {
  const { phase } = usePhase();
  const entries = useEntries();
  const quote = quoteForPhase(phase);

  // Cold state when this phase has no entries at all
  const phaseHasEntries = useMemo(() => {
    const phaseCatIds = new Set(categoriesForPhase(phase).map((c) => c.id));
    return entries.some((e) => phaseCatIds.has(e.categoryId));
  }, [phase, entries]);

  const showWelcome = !phaseHasEntries;

  return (
    <div className="pb-24">
      <FeedHeader />

      {showWelcome && (
        <section className="px-4 pt-4">
          <WelcomeCard />
        </section>
      )}

      {/* MyWeekCard removed per slide 4 comment "We don't need the Weekly
       *  Update" — the weekly watercolor migrated into the StatStrip center
       *  hero (A5d), making the standalone content card redundant. */}

      {/* Memory thread — anniversary memories resurfaced. Renders only when
       *  an anniversary entry exists (7 / 14 / 30 / 90 / 365 days ago). */}
      <section className="px-4 pt-5">
        <MemoryThread />
      </section>

      {/* Content feed -- Mali's distinctive layer */}
      <div className="px-4 pt-5 space-y-4">
        {/* Tip card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-primary-softer)",
                color: "var(--color-primary)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
              </svg>
            </div>
            <div className="serif text-[var(--color-primary)] text-lg font-semibold flex-1">
              Your baby
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                3
              </span>
              <span className="inline-flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
                </svg>
                1.4K
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">{MOCK_FEED_TIP.intro}</p>
        </div>

        {/* Quote card */}
        <div className="bg-[var(--color-primary-softer)] rounded-3xl px-6 py-7 text-center relative overflow-hidden">
          {/* Mali mascot -- baby face with speech bubble */}
          <div className="absolute top-3 right-3 w-14 h-14 rounded-full overflow-hidden opacity-90">
            <Image
              src="/mali-illustrations/quote_illustration.png"
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div
            aria-hidden
            className="serif text-[80px] leading-none text-[var(--color-primary)] mb-1 select-none"
            style={{ fontStyle: "italic" }}
          >
            "
          </div>
          <p className="serif text-lg leading-relaxed text-neutral-800 italic px-2 -mt-6">
            {quote.text}
          </p>
          <p className="text-xs tracking-wide text-neutral-500 mt-5 uppercase">
            -- {quote.author}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
              </svg>
              1.4K
            </span>
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              0
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-2">
          <div className="serif text-base text-neutral-900 font-medium mb-3">
            {MOCK_FEED_QUESTION.question}
          </div>
          <button className="bg-[var(--color-primary)] text-white text-sm font-semibold px-5 py-2 rounded-full">
            {MOCK_FEED_QUESTION.answer}
          </button>
        </div>
      </div>

      <PrimaryFAB />
    </div>
  );
}

