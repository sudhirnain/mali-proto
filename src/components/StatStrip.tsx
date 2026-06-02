"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePhase, isPregnancy } from "@/lib/phase";
import { useBaby, useMom, useColdMode } from "@/lib/cold-mode";
import { useEntries } from "@/lib/journal-store";
import { Illustration } from "./Illustration";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function articleFor(word: string | undefined): string {
  if (!word) return "a";
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/** DD.MM.YYYY (European, as stored) → YYYY-MM-DD for <input type="date">. */
function euToIso(eu: string | undefined): string {
  if (!eu) return "";
  const [d, m, y] = eu.split(".");
  if (!d || !m || !y) return "";
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD from <input type="date"> → DD.MM.YYYY for display/storage. */
function isoToEu(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
}

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

// Session-local due-date override. Lives at module scope so an edited due date
// survives StatStrip remounts (CollapsingHero unmounts the hero on scroll).
// Mock-only — there's no backend setter yet.
let dueDateOverride: string | undefined;

function PregnancyStatStrip() {
  const baby = useBaby();
  const mom = useMom();
  const cold = useColdMode();
  const entries = useEntries();
  const week = baby.week ?? 20;

  // Due date is a read-only mock field (no store setter — see report). The
  // edit sheet writes to local state so the demo reflects the change for the
  // session; backend wiring is the cross-file follow-up.
  const [dueDate, setDueDate] = useState<string | undefined>(dueDateOverride ?? baby.dueDate);
  const [dueOpen, setDueOpen] = useState(false);
  useEffect(() => {
    if (dueDateOverride === undefined) setDueDate(baby.dueDate);
  }, [baby.dueDate]);

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

        {/* Right — A5b: due date is now PRIMARY (tappable → change-due-date
         *  sheet), baby weight estimate is the secondary subline. R2 s3:
         *  "due-date element should be a link (see right)." Baby weight stays
         *  read-only per A5c — it rides along as a non-tappable subline. */}
        <DueDateStat
          dueDate={dueDate}
          babyWeight={baby.weight}
          onEdit={() => setDueOpen(true)}
        />
      </div>

      {/* R2 s3: "Baby is the size of xxx" + image, surfaced statically so it
       *  reads without scrolling (the ScrollPills pill repeats it once the
       *  hero collapses). Image reuses the weekly watercolor — no animal art
       *  asset exists yet (see report). */}
      {baby.sizeFruit && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/55 backdrop-blur px-3 py-2">
          <span className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--color-primary-softer)] shrink-0">
            <Image
              src={weekArt}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <span className="text-[13px] leading-snug text-neutral-700">
            <span className="font-semibold text-neutral-900">{baby.name}</span> is the
            size of {articleFor(baby.sizeFruit)}{" "}
            <span className="font-semibold text-[var(--color-primary-dark)]">
              {baby.sizeFruit.toLowerCase()}
            </span>
          </span>
        </div>
      )}

      {dueOpen &&
        createPortal(
          <DueDateSheet
            value={dueDate}
            onClose={() => setDueOpen(false)}
            onSave={(eu) => {
              dueDateOverride = eu;
              setDueDate(eu);
              setDueOpen(false);
            }}
          />,
          document.body,
        )}
    </div>
  );
}

/**
 * Right-side stat for pregnancy: due date as the headline (tappable to edit),
 * baby-weight estimate as a smaller subline. Tap target is the whole tile —
 * opens the change-due-date sheet. Falls back to the baby-weight-only readout
 * if no due date is stored (shouldn't happen for pregnancy mock data).
 */
function DueDateStat({
  dueDate,
  babyWeight,
  onEdit,
}: {
  dueDate?: string;
  babyWeight: string | null;
  onEdit: () => void;
}) {
  const ringClass = "border border-[var(--color-primary)]/40";
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Change due date"
      className="flex flex-col items-center gap-1 min-h-[84px] active:scale-[0.98] transition"
    >
      <div
        className={`w-12 h-12 rounded-full ${ringClass} flex items-center justify-center text-[var(--color-primary)] bg-white/40`}
      >
        <Illustration name="due-date" className="w-6 h-6" />
      </div>
      {dueDate ? (
        <>
          <div className="text-xs font-semibold text-neutral-900 leading-tight mt-1 tabular-nums underline decoration-dotted underline-offset-2">
            {dueDate}
          </div>
          <div className="text-[11px] text-neutral-700 -mt-0.5">Due date</div>
          {babyWeight && (
            <div className="text-[10px] text-neutral-500 -mt-0.5 tabular-nums">
              ~{babyWeight}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="text-xs font-semibold text-[var(--color-primary-dark)] mt-1 underline decoration-dotted underline-offset-2">
            Set date →
          </div>
          <div className="text-[11px] text-neutral-700 -mt-0.5">Due date</div>
        </>
      )}
    </button>
  );
}

/**
 * Lightweight prototype "Change due date" sheet — a centered modal over the
 * phone shell with a native date input. Per A5b/R2 s3. No store wiring: the
 * saved value lives in PregnancyStatStrip local state for the session (see
 * report for the cross-file follow-up).
 */
function DueDateSheet({
  value,
  onClose,
  onSave,
}: {
  value?: string;
  onClose: () => void;
  onSave: (eu: string) => void;
}) {
  const [iso, setIso] = useState(euToIso(value));
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Change due date"
      onClick={onClose}
    >
      <div
        className="w-full md:w-[340px] rounded-t-3xl md:rounded-3xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="serif text-lg font-semibold text-neutral-900">
          Change due date
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Your estimated due date. We&apos;ll use it to track your weeks.
        </p>
        <input
          type="date"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          className="mt-4 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 active:scale-[0.98] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!iso}
            onClick={() => iso && onSave(isoToEu(iso))}
            className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] disabled:opacity-40 active:scale-[0.98] transition"
          >
            Save
          </button>
        </div>
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


