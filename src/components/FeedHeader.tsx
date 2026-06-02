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
  // Scroll-driven header. In pregnancy, scrollY both collapses the StatStrip
  // hero (CollapsingHero) and cross-fades the floating pill from the size-of
  // line to the compact "Week N · Day D" anchor (ScrollPills). Thresholds are
  // tuned together so the pill arrives exactly as the hero finishes collapsing.
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
      {/* Single floating pill that takes over as the hero collapses:
       *   1. "Lu is the size of a kale"  (reinforces the collapsing hero line)
       *   2. "Week 32 · Day 4"           (the at-a-glance anchor that remains)
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

      {/* R2 s3: "Make this disappear when scrolling down (we prefer not to
       *  have it)." In pregnancy the big StatStrip hero fully collapses as the
       *  user scrolls, handing off to the floating week pill (ScrollPills).
       *  Parenting keeps the static hero — the ask is pregnancy-scoped. */}
      {isPreg ? (
        <CollapsingHero scrollY={scrollY}>
          <StatStrip />
        </CollapsingHero>
      ) : (
        <StatStrip />
      )}

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

// Scroll distance over which the pregnancy StatStrip hero fully collapses.
// Roughly its rendered height (rings row + size-of banner + padding) so it's
// gone — not just dimmed — by the time the user has scrolled past it.
const HERO_COLLAPSE_PX = 160;

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
 * R2 s3 — collapses the pregnancy StatStrip hero to zero height as the user
 * scrolls (0 → HERO_COLLAPSE_PX), then unmounts it so it occupies no space.
 * Fades + lifts on the way out so the handoff to the floating week pill reads
 * as one element shrinking away. Parenting keeps the static hero.
 */
function CollapsingHero({
  scrollY,
  children,
}: {
  scrollY: number;
  children: React.ReactNode;
}) {
  const t = Math.min(1, Math.max(0, scrollY / HERO_COLLAPSE_PX));
  if (t >= 1) return null;
  return (
    <div
      aria-hidden={t > 0.6}
      style={{
        opacity: 1 - t,
        maxHeight: `${(1 - t) * 320}px`,
        transform: `translateY(${-t * 16}px)`,
      }}
      className="overflow-hidden will-change-[opacity,transform]"
    >
      {children}
    </div>
  );
}

/**
 * Single floating pill anchored to the top of the phone shell. As the hero
 * collapses (0 → HERO_COLLAPSE_PX) it hands off to two stacked phases:
 *
 *   60  – 120  "Lu is the size of a kale" fades in (reinforces the hero line
 *              that's collapsing away)
 *   120 – 150  holds
 *   150 – 200  cross-fades to "Week 32 · Day 4"
 *   200 +      "Week 32 · Day 4" holds, tappable → scroll back to top
 *
 * Tuned so the week pill is fully present right as the hero finishes
 * collapsing, leaving exactly one anchor on screen.
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
  const sizeOpacity = rampOpacity(scrollY, 60, 120, 150, 200);
  const weekOpacity = rampOpacity(scrollY, 150, 200, Infinity, Infinity);
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
