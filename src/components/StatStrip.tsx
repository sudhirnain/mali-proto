"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePhase, isPregnancy } from "@/lib/phase";
import { useBaby, useMom, useColdMode } from "@/lib/cold-mode";
import { useEntries } from "@/lib/journal-store";
import { Illustration } from "./Illustration";

/** Trimester-bucketed mom illustration for the pregnancy center hero. */
function momIllustration(week: number): string {
  if (week <= 13) return "/mali-illustrations/pregnant_3.png";
  if (week <= 27) return "/mali-illustrations/pregnant_6.png";
  return "/mali-illustrations/pregnant_9.png";
}

/**
 * Top stats row of the header.
 *
 * Parenting (baby-first): Length | Lu photo + age | Weight
 * Pregnancy (mom-first):  Your weight | Mom illustration + name + "Week N · X weeks to go" | Baby ring "Lu (avocado)"
 *
 * Cold-state copy reads "Welcome, Sarah" in pregnancy (the mom) and
 * "Welcome, Lu" in parenting (the baby) — aligning with the brief.
 */
export function StatStrip() {
  const { phase } = usePhase();
  const preg = isPregnancy(phase);

  return preg ? <PregnancyStatStrip /> : <ParentingStatStrip />;
}

function ParentingStatStrip() {
  const baby = useBaby();
  const cold = useColdMode();

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="grid grid-cols-[80px_1fr_80px] items-end gap-2">
        <SideStat
          buttonAria="Length chart"
          buttonIcon={<Illustration name="ruler" className="w-6 h-6" />}
          buttonStyle="ring"
          value={baby.length}
          caption="Length"
          href="/journal/category/length"
        />

        <CenterHero
          imageSrc="/mali-illustrations/happy_hands_up_baby.png"
          welcome={cold ? `Welcome, ${baby.name}` : baby.name}
          subline={baby.ageLabel}
        />

        <SideStat
          buttonAria="Weight chart"
          buttonIcon={<Illustration name="scale-outline" className="w-6 h-6" />}
          buttonStyle="ring"
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

  return (
    <div className="px-4 pt-2 pb-3">
      <div className="grid grid-cols-[80px_1fr_80px] items-end gap-2">
        <SideStat
          buttonAria="Your weight chart"
          buttonIcon={<Illustration name="scale-outline" className="w-6 h-6" />}
          buttonStyle="ring"
          value={momWeight}
          caption="Your weight"
          href="/journal/category/weight-mom"
          emptyCta={{ href: "/log/weight-mom", label: "Add weight" }}
        />

        <CenterHero
          imageSrc={momIllustration(week)}
          welcome={cold ? `Welcome, ${mom.name}` : mom.name}
          subline={baby.ageLabel}
        />

        {/* Right — baby weight readout, mirrors the left mom-weight stat
         *  so the strip reads Mom · Sarah · Baby. */}
        <SideStat
          buttonAria="Baby weight"
          buttonIcon={<Illustration name="newborn" className="w-6 h-6" />}
          buttonStyle="ring"
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
  welcome,
  subline,
}: {
  imageSrc: string;
  welcome: string;
  subline: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/50 shadow-sm relative bg-white">
        {/* object-cover + no padding so the illustration fills the circle —
         *  the mom/baby figure reads tight against the ring instead of
         *  floating inside it with visible header bg around the edges. */}
        <Image src={imageSrc} alt="" fill sizes="80px" className="object-cover" />
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
  buttonStyle,
  value,
  caption,
  href,
  emptyCta,
}: {
  buttonAria: string;
  buttonIcon: React.ReactNode;
  buttonStyle: "ring" | "ring-strong";
  value: string | null;
  caption: string;
  /** When the value is present, tapping anywhere on the stat opens this chart. */
  href?: string;
  /** When the value is null, tapping opens the log form via this CTA. */
  emptyCta?: { href: string; label: string };
}) {
  const ringClass =
    buttonStyle === "ring-strong"
      ? "border-2 border-[var(--color-primary)]"
      : "border border-[var(--color-primary)]/40";

  const linkHref = value ? href : emptyCta?.href;

  const body = (
    <>
      <div
        aria-label={buttonAria}
        className={`w-12 h-12 rounded-full ${ringClass} flex items-center justify-center text-[var(--color-primary)] bg-white/40`}
      >
        {buttonIcon}
      </div>
      {value ? (
        <>
          <div className="text-xs font-semibold text-neutral-900 leading-tight mt-1 tabular-nums">{value}</div>
          <div className="text-xs text-neutral-700 -mt-0.5">{caption}</div>
        </>
      ) : emptyCta ? (
        <div className="text-[11px] font-semibold text-[var(--color-primary-dark)] mt-1 underline decoration-dotted underline-offset-2 text-center leading-tight">
          {emptyCta.label} →
        </div>
      ) : (
        <div className="h-[26px]" aria-hidden />
      )}
    </>
  );

  // min-h locks the side-stat total height so the icon position is consistent
  // across filled (value + caption = 2 text lines) and empty (CTA = 1 line)
  // states. Without it, items-end on the parent grid lands the icons at
  // different y values, misaligning the left scale icon vs the right emoji.
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
