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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

  const quickLogs = defaultQuickLogs(phase);
  const extras = expandedHeaderExtras(phase);

  // Nudge badge: in pregnancy, surface a "log your weight" reminder on the
  // weight-mom card if it's been more than a week since the last entry (or
  // there's no entry yet). In a cold-state demo we skip the badge entirely
  // since "Not yet" already conveys the same message.
  const nudgeBadge = useMemo(() => {
    if (cold || phase === "parenting") return undefined;
    const firstId = quickLogs[0];
    if (!firstId) return undefined;
    const ownEntries = entries.filter((e) => e.categoryId === firstId);
    if (ownEntries.length === 0) return 1; // never logged
    const mostRecentMs = Math.max(...ownEntries.map((e) => new Date(e.at).getTime()));
    return TODAY_DATE.getTime() - mostRecentMs > WEEK_MS ? 1 : undefined;
  }, [entries, cold, phase, quickLogs]);

  const bgClass = phase === "pregnancy" ? "bg-[var(--color-primary-bright)]" : "bg-[var(--color-primary-soft)]";

  return (
    <section className={`${bgClass} relative md:pt-11`}>
      <StatStrip />

      {/* 3 quick-log cards */}
      <div className="px-4 flex items-stretch gap-2">
        {quickLogs.map((id) => (
          <QuickLogCard
            key={id}
            id={id}
            badge={id === quickLogs[0] ? nudgeBadge : undefined}
          />
        ))}
      </div>

      {/* Today's pulse — heartbeat of the journal */}
      <JournalPulse />

      {/* Expanded: progress hero + secondary tracker grid (both behind the chevron). */}
      {expanded && (
        <>
          <div className="px-4 mt-4">
            {phase === "parenting" ? <MilestoneHero variant="header" /> : <JourneyHero variant="header" />}
          </div>
          {extras.length > 0 && (
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
