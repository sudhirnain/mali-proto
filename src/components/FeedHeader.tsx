"use client";

import { useMemo, useState } from "react";
import { usePhase } from "@/lib/phase";
import { useColdMode } from "@/lib/cold-mode";
import { defaultQuickLogs, expandedHeaderExtras } from "@/lib/categories";
import { useEntries } from "@/lib/journal-store";
import { TODAY_DATE } from "@/lib/mock-entries";
import { StatStrip } from "./StatStrip";
import { QuickLogCard, MiniLogTile } from "./QuickLogCard";
import { JournalPulse } from "./JournalPulse";
import { MilestoneHero } from "./journal/MilestoneHero";
import { JourneyHero } from "./journal/JourneyHero";

/**
 * Compact pregnancy quick-log row. Replaces the 3 big QuickLogCards (used
 * in parenting) with 5 MiniLogTiles in a single row — matches the tight
 * pregnancy header Jonas mocked. weight-mom moves out of this row (it's now
 * the left side-stat above), so this row is the full mom-experience tracker
 * set: symptoms · hydration · sleep · contractions · mood.
 */
const PREGNANCY_COMPACT_TILES = [
  "symptoms",
  "hydration",
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
  const [expanded, setExpanded] = useState(false);

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
      <StatStrip />

      {/* Quick-log row — pregnancy uses 5 mini tiles (tighter, all mom-experience
       *  trackers visible at once); parenting keeps the 3 big QuickLogCards.   */}
      {isPreg ? (
        <div className="px-4 grid grid-cols-5 gap-2">
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
