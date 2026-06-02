"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePhase, isPregnancy } from "@/lib/phase";
import { useBaby, useMom, useColdMode } from "@/lib/cold-mode";
import { useEntries } from "@/lib/journal-store";
import { Illustration } from "./Illustration";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Top stats row of the header.
 *
 * Parenting (baby-first): Length | Lu photo + age | Weight
 * Pregnancy (mom-first):  Your weight | weekly watercolor + Sarah + ageLabel | Baby weight (estimate)
 *
 * Right stat in pregnancy = the backend-sourced baby-weight estimate (not
 * user-editable per A5c). Days-countdown + due-date editing live in
 * JourneyHero (slide 6 layout: "Due date YYYY →" row inside the expanded card).
 */
export function StatStrip() {
  const { phase } = usePhase();
  const preg = isPregnancy(phase);

  return preg ? <PregnancyStatStrip /> : <ParentingStatStrip />;
}

function ParentingStatStrip() {
  const baby = useBaby();

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="grid grid-cols-[80px_1fr_80px] items-end gap-2">
        <SideStat
          buttonAria="Length chart"
          buttonIcon={<Illustration name="ruler" className="w-6 h-6" />}
          value={baby.length}
          caption="Length"
          href="/journal/category/length"
        />

        <CenterHero
          imageSrc="/mali-illustrations/happy_hands_up_baby.png"
          welcome={baby.name}
          subline={baby.ageLabel}
        />

        <SideStat
          buttonAria="Weight chart"
          buttonIcon={<Illustration name="scale-outline" className="w-6 h-6" />}
          value={baby.weight}
          caption="Weight"
          href="/journal/category/weight-baby"
        />
      </div>
    </div>
  );
}

function PregnancyStatStrip() {
  const baby = useBaby();
  const mom = useMom();
  const cold = useColdMode();
  const entries = useEntries();
  const week = baby.week ?? 20;

  const momWeight = useMemo(() => {
    const ws = entries
      .filter((e) => e.categoryId === "weight-mom")
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return ws[0]?.meta ?? mom.weight;
  }, [entries, mom.weight]);

  // Stale-weight signal — small red dot on the left side-stat when the user
  // HAS logged mom-weight before but the latest entry is >7d old. We don't
  // fire the dot when there are zero entries: in that case the SideStat's
  // own "Add weight" empty CTA already conveys it, and showing a dot
  // alongside a fallback "68 kg" value reads contradictory.
  const weightDue = useMemo(() => {
    if (cold) return false;
    const ws = entries.filter((e) => e.categoryId === "weight-mom");
    if (ws.length === 0) return false;
    const mostRecent = Math.max(...ws.map((e) => new Date(e.at).getTime()));
    return Date.now() - mostRecent > WEEK_MS;
  }, [entries, cold]);

  // Per-week watercolor illustration replaces the static mom-figure in the
  // center hero (slide 4 comment: "change to weekly image"). The original
  // illustration falls back via the onError handler if the weekly art is
  // missing for that week.
  const weekArt = `/mali-art/weekly/w${week}.png`;

  return (
    <div className="px-4 pt-2 pb-3">
      <div className="grid grid-cols-[80px_1fr_80px] items-end gap-2">
        <SideStat
          buttonAria="Your weight chart"
          buttonIcon={<Illustration name="scale-outline" className="w-6 h-6" />}
          value={momWeight}
          caption="Your weight"
          href="/journal/category/weight-mom"
          emptyCta={{ href: "/log/weight-mom", label: "Add weight" }}
          dueDot={weightDue}
        />

        {/* Slide 4: "Needs to be the baby name" — pregnancy center reads Lu
         *  (baby), matching the floating size-of pill that morphs into the
         *  week pill on scroll. Mom-first lives in the side stats + quick-logs.
         *  Cold-state greeting ("Welcome, Sarah") lives in the WelcomeCard
         *  in the feed body, not here — Lu is in utero, not a user. */}
        <CenterHero
          imageSrc={weekArt}
          imageFallback="/mali-illustrations/pregnant_9.png"
          welcome={baby.name}
          subline={baby.ageLabel}
        />

        {/* Right — baby weight readout (backend-sourced estimate). Mirrors
         *  the left mom-weight stat so the strip reads Mom · Sarah · Baby.
         *  Per A5c the value is not user-editable — tapping goes to the
         *  baby-growth context (Moments → Your journey). Days countdown +
         *  due-date editing live in JourneyHero. */}
        <SideStat
          buttonAria="Baby weight"
          buttonIcon={<Illustration name="newborn" className="w-6 h-6" />}
          value={baby.weight}
          caption="Baby's weight"
          href="/journal/moments"
        />
      </div>
    </div>
  );
}

function CenterHero({
  imageSrc,
  imageFallback,
  welcome,
  subline,
}: {
  imageSrc: string;
  imageFallback?: string;
  welcome: string;
  subline: string;
}) {
  const [src, setSrc] = useState(imageSrc);
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/50 shadow-sm relative bg-white">
        <Image
          src={src}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
          onError={() => {
            if (imageFallback && src !== imageFallback) setSrc(imageFallback);
          }}
        />
      </div>
      <div className="serif text-lg leading-tight mt-2 font-semibold text-neutral-900">
        {welcome}
      </div>
      <div className="text-xs text-neutral-700 text-center px-1">{subline}</div>
    </div>
  );
}

function SideStat({
  buttonAria,
  buttonIcon,
  value,
  caption,
  href,
  emptyCta,
  dueDot,
}: {
  buttonAria: string;
  buttonIcon: React.ReactNode;
  value: string | null;
  caption: string;
  href?: string;
  emptyCta?: { href: string; label: string };
  /** Renders a small red dot in the top-right of the icon ring. */
  dueDot?: boolean;
}) {
  const ringClass = "border border-[var(--color-primary)]/40";

  const linkHref = value ? href : emptyCta?.href;

  const body = (
    <>
      <div className="relative">
        <div
          aria-label={buttonAria}
          className={`w-12 h-12 rounded-full ${ringClass} flex items-center justify-center text-[var(--color-primary)] bg-white/40`}
        >
          {buttonIcon}
        </div>
        {dueDot && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[var(--color-primary-bright)]"
            aria-label="Needs update"
          />
        )}
      </div>
      {value ? (
        <>
          <div className="text-xs font-semibold text-neutral-900 leading-tight mt-1 tabular-nums">
            {value}
          </div>
          <div className="text-xs text-neutral-700 -mt-0.5">{caption}</div>
        </>
      ) : emptyCta ? (
        <div className="text-xs font-semibold text-[var(--color-primary-dark)] mt-1 underline decoration-dotted underline-offset-2 text-center leading-tight">
          {emptyCta.label} →
        </div>
      ) : (
        // No value, no CTA (e.g. cold pregnancy baby-weight — backend-sourced
        // and not user-actionable). Show em-dash placeholder so the layout
        // structure matches the populated state: ring + value + caption.
        <>
          <div className="text-xs font-semibold text-neutral-400 leading-tight mt-1 tabular-nums">
            —
          </div>
          <div className="text-xs text-neutral-700 -mt-0.5">{caption}</div>
        </>
      )}
    </>
  );

  const wrapperClass =
    "flex flex-col items-center gap-1 min-h-[84px] active:scale-[0.98] transition";

  if (linkHref) {
    return (
      <Link href={linkHref} className={wrapperClass}>
        {body}
      </Link>
    );
  }
  return <div className={wrapperClass}>{body}</div>;
}


