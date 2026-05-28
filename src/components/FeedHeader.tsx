"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePhase } from "@/lib/phase";
import { useColdMode, useBaby } from "@/lib/cold-mode";
import { defaultQuickLogs, expandedHeaderExtras } from "@/lib/categories";
import { useEntries } from "@/lib/journal-store";
import { TODAY_DATE } from "@/lib/mock-entries";
import { useScrollY } from "@/lib/scroll";
import { StatStrip } from "./StatStrip";
import { QuickLogCard, MiniLogTile } from "./QuickLogCard";
import { JournalPulse } from "./JournalPulse";
import { MilestoneHero } from "./journal/MilestoneHero";
import { JourneyHero } from "./journal/JourneyHero";

/**
 * Compact pregnancy quick-log row. 4 MiniLogTiles. Dropped hydration to
 * give each tile more width (labels no longer wrap). Water remains reachable
 * via /log/hydration and Moments → Wellbeing.
 */
const PREGNANCY_COMPACT_TILES = [
  "symptoms",
  "sleep-mom",
  "contractions",
  "mom-mood",
] as const;

/**
 * Phase-aware feed header — the journal's command center.
 *
 * Contents:
 *  1. StatStrip (phase-first: baby for parenting, mom for pregnancy)
 *  2. 3 quick-log cards (phase-appropriate)
 *  3. JournalPulse — "X entries today · last Y ago →"
 *  4. Progress hero — MilestoneHero (parenting) / JourneyHero (pregnancy)
 *  5. Chevron-revealed secondary tracker grid (both phases)
 */
export function FeedHeader() {
  const { phase } = usePhase();
  const cold = useColdMode();
  const entries = useEntries();
  const baby = useBaby();
  const [expanded, setExpanded] = useState(false);
  // Slide 8 — 3-state scroll transition. scrollY drives two stacked pills
  // that cross-fade based on position:
  //   0 → 40px   nothing (full header is the show)
  //   40 → 180px size-of explainer fades in/out
  //   180+ px    "Week N · Day D" compact pill takes over
  // See ScrollPills below.
  const scrollY = useScrollY();

  const isPreg = phase === "pregnancy";
  const quickLogs = defaultQuickLogs(phase);
  const extras = expandedHeaderExtras(phase);

  // Per-card "today" counter: per slide 4 annotation, the badge in parenting
  // is a legitimate counter ("5 feeds today"), not a stale-log nudge. Each
  // card surfaces its own count of today's entries. Suppressed in cold and in
  // pregnancy (pregnancy's stale-weight signal moved to the StatStrip left
  // ring as a red "due" dot).
  const todayCounts = useMemo(() => {
    if (cold || isPreg) return {} as Record<string, number>;
    const today = new Date(TODAY_DATE);
    today.setHours(0, 0, 0, 0);
    const map: Record<string, number> = {};
    for (const e of entries) {
      const t = new Date(e.at);
      t.setHours(0, 0, 0, 0);
      if (t.getTime() !== today.getTime()) continue;
      map[e.categoryId] = (map[e.categoryId] ?? 0) + 1;
    }
    return map;
  }, [entries, cold, isPreg]);

  const bgClass = isPreg ? "bg-[var(--color-primary-bright)]" : "bg-[var(--color-primary-soft)]";

  return (
    <section className={`${bgClass} relative md:pt-11`}>
      {/* Slide 8 — single floating pill that morphs between two phases as
       *  the user scrolls past the StatStrip:
       *   1. "Lu is the size of an avocado"  (the fruit explainer)
       *   2. "Week 32 · Day 4"               (the at-a-glance anchor)
       *  No in-place morph inside the StatStrip — that approach overlapped the
       *  watercolor visually. */}
      {isPreg && (
        <ScrollPills
          scrollY={scrollY}
          ageLabel={baby.ageLabel}
          babyName={baby.name}
          sizeFruit={baby.sizeFruit}
          week={baby.week}
        />
      )}

      <StatStrip />

      {/* Quick-log row — pregnancy uses 4 mini tiles (tighter, daily
       *  mom-experience trackers); parenting keeps the 3 big QuickLogCards.   */}
      {isPreg ? (
        <div className="px-4 grid grid-cols-4 gap-2">
          {PREGNANCY_COMPACT_TILES.map((id) => (
            <MiniLogTile key={id} id={id} />
          ))}
        </div>
      ) : (
        <div className="px-4 flex items-stretch gap-2">
          {quickLogs.map((id) => (
            <QuickLogCard
              key={id}
              id={id}
              badge={todayCounts[id] || undefined}
            />
          ))}
        </div>
      )}

      {/* Today's pulse — heartbeat of the journal */}
      <JournalPulse />

      {/* Expanded: progress hero. Parenting also gets a secondary tracker grid
       *  (extras aren't already shown elsewhere). Pregnancy drops the grid —
       *  the 5 compact tiles above already cover the mom-experience set, so a
       *  second row would just duplicate them. */}
      {expanded && (
        <>
          <div className="px-4 mt-4">
            {isPreg ? <JourneyHero variant="header" /> : <MilestoneHero variant="header" />}
          </div>
          {!isPreg && extras.length > 0 && (
            <div className="px-4 pt-5 pb-2">
              <div className="grid grid-cols-5 gap-2">
                {extras.map((id) => (
                  <MiniLogTile key={id} id={id} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Expand toggle — always present (reveals progress hero + extras). */}
      <div className="flex justify-center pt-4 pb-3">
        <button
          onClick={() => setExpanded((x) => !x)}
          aria-label={expanded ? "Collapse" : "Show progress and more trackers"}
          className="w-10 h-7 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-[var(--color-primary-dark)] shadow-sm active:scale-95 transition"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function rampOpacity(y: number, inStart: number, inEnd: number, outStart: number, outEnd: number): number {
  if (y < inStart) return 0;
  if (y < inEnd) return (y - inStart) / (inEnd - inStart);
  if (y < outStart) return 1;
  if (y < outEnd) return 1 - (y - outStart) / (outEnd - outStart);
  return 0;
}

function articleFor(word: string | undefined): string {
  if (!word) return "a";
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/**
 * Slide 8 — single floating pill anchored to the top of the phone shell.
 * Morphs through two phases as the user scrolls. Both phases share the same
 * fixed anchor so the morph reads as one element changing content.
 *
 *  scrollY ranges (tuned for the actual StatStrip + quick-logs height):
 *
 *   0   – 120  hidden (header still visible, no need)
 *   120 – 180  "Lu is the size of an avocado" fades in
 *   180 – 360  holds at full opacity
 *   360 – 420  cross-fade to "Week 32 · Day 4"
 *   420 +      "Week 32 · Day 4" holds, tappable → scroll back to top
 */
function ScrollPills({
  scrollY,
  ageLabel,
  babyName,
  sizeFruit,
  week,
}: {
  scrollY: number;
  ageLabel: string;
  babyName: string;
  sizeFruit?: string;
  week?: number;
}) {
  const sizeOpacity = rampOpacity(scrollY, 120, 180, 360, 420);
  const weekOpacity = rampOpacity(scrollY, 360, 420, Infinity, Infinity);
  if (sizeOpacity <= 0 && weekOpacity <= 0) return null;

  const weekArt = week ? `/mali-art/weekly/w${week}.png` : null;

  return (
    <>
      {sizeOpacity > 0 && sizeFruit && (
        <div
          aria-hidden
          style={{ opacity: sizeOpacity }}
          className="fixed top-2 md:top-[80px] left-1/2 -translate-x-1/2 z-40 pl-1 pr-4 py-1 rounded-full bg-white/95 backdrop-blur shadow-md text-[12px] font-medium text-neutral-700 pointer-events-none whitespace-nowrap flex items-center gap-2"
        >
          {weekArt && (
            <span className="relative w-7 h-7 rounded-full overflow-hidden bg-[var(--color-primary-softer)] shrink-0">
              <Image
                src={weekArt}
                alt=""
                fill
                sizes="28px"
                className="object-cover"
              />
            </span>
          )}
          <span>
            <span className="font-semibold text-neutral-900">{babyName}</span> is the size of {articleFor(sizeFruit)} {sizeFruit.toLowerCase()}
          </span>
        </div>
      )}
      {weekOpacity > 0 && (
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("phone-scroll");
            (el ?? window).scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ opacity: weekOpacity }}
          className="fixed top-2 md:top-[80px] left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur shadow-md text-[12px] font-semibold text-neutral-900 active:scale-95 transition-transform whitespace-nowrap"
          aria-label="Scroll back to top"
        >
          {ageLabel}
        </button>
      )}
    </>
  );
}
