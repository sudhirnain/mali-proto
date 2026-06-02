"use client";

import Image from "next/image";
import Link from "next/link";
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

        {/* Editorial filler so the scroll interactions have content to scroll
         *  past. Mali's home is a content feed by design — these article and
         *  FAQ cards approximate the production look (slide 9 reference). */}
        <ArticleCard
          eyebrow="Nutrition"
          title="The importance of DHA and Omega-3 in pregnancy"
          slug="dha-omega3"
          stats={{ comments: 2, hearts: "951" }}
          body="DHA is an omega-3 fatty acid that is vital to your baby's development. It plays a key role in the formation of retinal and brain tissue, so it's very vital in developing healthy eyes and brains."
        />

        <FaqCard
          question="I think my baby is moving less. Is there something wrong?"
          answer="Baby moving less can be caused by a medication or your stress level. Normally, you should feel at least 10 movements in two hours during late pregnancy. If you're worried, lie on your side, drink something cold, and count again — if still under 10, call your provider."
          stats={{ comments: 7, hearts: "923" }}
        />

        <ArticleCard
          eyebrow="3rd trimester"
          title="What's safe to eat — and what to skip"
          slug="safe-to-eat"
          stats={{ comments: 12, hearts: "1.2K" }}
          body="Keep cravings happy without crossing into risk: pasteurized dairy is fine, soft cheeses aren't. Cooked fish is great, raw or high-mercury fish should sit out the third trimester. Caffeine under 200mg a day. Hydrate more than you think you need to."
        />

        <ArticleCard
          eyebrow="Preparing"
          title="Your hospital bag — the short version"
          slug="hospital-bag"
          stats={{ comments: 4, hearts: "688" }}
          body="Pack between weeks 35 and 36. Three categories: things for labor (lip balm, hair tie, slip-on shoes), things for after (loose pajamas, your own pillow), and things for the baby (going-home outfit in two sizes, car-seat tested ahead of time)."
        />

        <ArticleCard
          eyebrow="Wellbeing"
          title="Sleep tips for late pregnancy"
          slug="sleep-late-pregnancy"
          stats={{ comments: 6, hearts: "1.1K" }}
          body="Side-sleeping (preferably left) keeps blood flowing to the placenta. A pillow between your knees aligns the hips; a small one under the belly takes the weight off the lower back. Avoid lying flat on your back after week 28."
        />

        <ArticleCard
          eyebrow="What to expect"
          title="Braxton-Hicks vs. the real thing"
          slug="braxton-hicks"
          stats={{ comments: 9, hearts: "844" }}
          body="Practice contractions feel like a tightening that comes and goes — irregular, no progression. Real contractions get closer together, longer, and stronger over time. The 5-1-1 rule: contractions 5 minutes apart, lasting 1 minute, for 1 hour — time to call."
        />
      </div>

      <PrimaryFAB hideOnScroll />
    </div>
  );
}

function ArticleCard({
  eyebrow,
  title,
  body,
  stats,
  slug,
}: {
  eyebrow: string;
  title: string;
  body: string;
  stats: { comments: number; hearts: string };
  /** Article slug — wires "Read more →" to the article reader (round-2 s10). */
  slug?: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]/80">
          {eyebrow}
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {stats.comments}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
            </svg>
            {stats.hearts}
          </span>
        </div>
      </div>
      <h3 className="serif text-[19px] font-semibold text-neutral-900 leading-tight tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-700 leading-relaxed">{body}</p>
      {slug ? (
        <Link
          href={`/article/${slug}`}
          className="inline-block text-sm font-semibold text-[var(--color-primary-dark)] mt-3 active:opacity-70"
        >
          Read more →
        </Link>
      ) : (
        <button
          type="button"
          className="text-sm font-semibold text-[var(--color-primary-dark)] mt-3 active:opacity-70"
        >
          Read more →
        </button>
      )}
    </div>
  );
}

function FaqCard({
  question,
  answer,
  stats,
}: {
  question: string;
  answer: string;
  stats: { comments: number; hearts: string };
}) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-primary)]"
          style={{ backgroundColor: "var(--color-primary-softer)" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </div>
        <div className="serif text-[var(--color-primary)] text-lg font-semibold flex-1">
          FAQ
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {stats.comments}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
            </svg>
            {stats.hearts}
          </span>
        </div>
      </div>
      <div className="rounded-2xl bg-[var(--color-primary-softer)] p-4">
        <p className="text-sm text-neutral-800 leading-relaxed">
          <span className="inline-block mr-1.5" aria-hidden>💬</span>
          {question}
        </p>
        <p className="text-sm text-neutral-700 leading-relaxed mt-3">
          <span className="inline-block mr-1.5" aria-hidden>👩‍⚕️</span>
          {answer}
        </p>
      </div>
    </div>
  );
}

