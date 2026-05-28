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
 * Pregnancy (mom-first):  Your weight | weekly watercolor + Sarah + ageLabel | Due date (with est. baby weight subline)
 *
 * Right ring in pregnancy shows the due date as primary surface (per slide 4
 * "could link to due date"); the backend-sourced baby weight estimate appears
 * as a small caption below. Baby weight is NOT user-editable per transcript.
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
  const [dueDate, setDueDate] = useState(baby.dueDate ?? "24.10.2026");
  const [editingDueDate, setEditingDueDate] = useState(false);

  const momWeight = useMemo(() => {
    const ws = entries
      .filter((e) => e.categoryId === "weight-mom")
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return ws[0]?.meta ?? mom.weight;
  }, [entries, mom.weight]);

  // Stale-weight signal — a small red "due" dot on the left side-stat when the
  // user hasn't logged mom-weight in over a week (or never has). Replaces the
  // numeric "1" badge per slide 4 annotation: in pregnancy, the badge "would
  // only apply to weight … maybe it's just a dot."
  const weightDue = useMemo(() => {
    if (cold) return false;
    const ws = entries.filter((e) => e.categoryId === "weight-mom");
    if (ws.length === 0) return true;
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

        <CenterHero
          imageSrc={weekArt}
          imageFallback="/mali-illustrations/pregnant_9.png"
          welcome={cold ? `Welcome, ${mom.name}` : mom.name}
          subline={baby.ageLabel}
        />

        {/* Right — due date as primary surface, baby weight estimate as caption
         *  below. Tap opens the change-due-date sheet. Per A5b/A5c: baby weight
         *  is backend-sourced and NOT user-editable, surfaced via "(est. ...)" */}
        <SideStat
          buttonAria="Due date"
          buttonIcon={<Illustration name="heart" className="w-6 h-6" />}
          value={dueDate}
          caption="Due date"
          subCaption={baby.weight ? `est. baby ${baby.weight}` : undefined}
          onTap={() => setEditingDueDate(true)}
          valueFontClass="tabular-nums text-[11px]"
        />
      </div>

      {editingDueDate && (
        <DueDateSheet
          value={dueDate}
          onSave={(next) => {
            setDueDate(next);
            setEditingDueDate(false);
          }}
          onClose={() => setEditingDueDate(false)}
        />
      )}
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
  subCaption,
  href,
  emptyCta,
  onTap,
  dueDot,
  valueFontClass,
}: {
  buttonAria: string;
  buttonIcon: React.ReactNode;
  value: string | null;
  caption: string;
  subCaption?: string;
  href?: string;
  emptyCta?: { href: string; label: string };
  /** When provided, the whole stat becomes a button calling onTap instead of a Link. */
  onTap?: () => void;
  /** Renders a small red dot in the top-right of the icon ring. */
  dueDot?: boolean;
  /** Override for the value's typography (e.g. tabular-nums for a date). */
  valueFontClass?: string;
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
          <div className={`font-semibold text-neutral-900 leading-tight mt-1 ${valueFontClass ?? "text-xs tabular-nums"}`}>
            {value}
          </div>
          <div className="text-xs text-neutral-700 -mt-0.5">{caption}</div>
          {subCaption && (
            <div className="text-[10px] text-neutral-500 leading-tight -mt-0.5">
              {subCaption}
            </div>
          )}
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

  const wrapperClass =
    "flex flex-col items-center gap-1 min-h-[84px] active:scale-[0.98] transition";

  if (onTap) {
    return (
      <button onClick={onTap} className={wrapperClass} type="button">
        {body}
      </button>
    );
  }
  if (linkHref) {
    return (
      <Link href={linkHref} className={wrapperClass}>
        {body}
      </Link>
    );
  }
  return <div className={wrapperClass}>{body}</div>;
}

/**
 * Lightweight bottom sheet for editing the due date. Accepts a DD.MM.YYYY
 * string, lets the user pick a new date via the native date input, and
 * formats it back to the same shape. No persistence beyond local state in
 * the prototype — wired through the parent useState above.
 */
function DueDateSheet({
  value,
  onSave,
  onClose,
}: {
  value: string;
  onSave: (next: string) => void;
  onClose: () => void;
}) {
  const iso = useMemo(() => {
    const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return "";
    return `${m[3]}-${m[2]}-${m[1]}`;
  }, [value]);
  const [next, setNext] = useState(iso);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/30">
      <div
        className="absolute inset-0"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-sm px-5 pt-5 pb-7 shadow-xl">
        <div className="serif text-[19px] font-semibold text-neutral-900 mb-1">
          Change due date
        </div>
        <p className="text-xs text-neutral-500 mb-4">
          Your provider may revise this after an ultrasound. Updating it here
          adjusts your week count.
        </p>
        <input
          type="date"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="w-full text-base border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
        />
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-neutral-100 text-neutral-700 font-semibold text-sm active:scale-[0.98] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!next) return onClose();
              const [y, m, d] = next.split("-");
              onSave(`${d}.${m}.${y}`);
            }}
            className="flex-1 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm active:scale-[0.98] transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
