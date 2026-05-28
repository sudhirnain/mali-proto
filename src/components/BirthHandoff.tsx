"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePhase } from "@/lib/phase";
import { useMom, useBaby } from "@/lib/cold-mode";

/**
 * Parses a DD.MM.YYYY string into a Date, or returns null if malformed.
 */
function parseEuDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00`);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fires the celebration overlay on either of two triggers:
 *
 *  1. **Phase transition** pregnancy → parenting (preserved for demos — the
 *     DemoNavigator's "See the birth handoff" path relies on this).
 *  2. **Due-date overrun** — slide 54: "Should be triggered during pregnancy
 *     one day after due date." If today is >=1 day past the stored due date
 *     and the user is still in pregnancy phase, fire once. (In the demo the
 *     due date is in the future, so this only matters for real-time users.)
 *
 * Re-fires every transition for demos. The X button now dismisses without a
 * phase change.
 */
export function BirthHandoff() {
  const { phase } = usePhase();
  const baby = useBaby();
  const prevPhase = useRef(phase);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (prevPhase.current === "pregnancy" && phase === "parenting") {
      setOpen(true);
    }
    prevPhase.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "pregnancy") return;
    const due = parseEuDate(baby.dueDate);
    if (!due) return;
    if (Date.now() - due.getTime() >= DAY_MS) {
      setOpen(true);
    }
  }, [phase, baby.dueDate]);

  if (!open) return null;
  return <BirthHandoffOverlay onDismiss={() => setOpen(false)} />;
}

function BirthHandoffOverlay({ onDismiss }: { onDismiss: () => void }) {
  const mom = useMom();
  const baby = useBaby();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="birth-handoff-title"
      className="absolute inset-0 z-[60] flex items-center justify-center px-6 birth-handoff-overlay"
    >
      {/* Soft coral→teal gradient symbolizing the phase transition itself.
       *  Will swap to a coral→cream/deeper-coral gradient once the pink-only
       *  decision (A1) is locked — currently waiting on Jonas's reply. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-coral-softer)] via-white to-[var(--color-teal-softer)]" />

      {/* Sprinkled hearts + sparkles backdrop */}
      <SprinkleConfetti />

      {/* X close — slide 54: "Add X." Lets a user dismiss the overlay without
       *  flipping phase (e.g., if the due-date trigger fires early). */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-neutral-700 shadow-sm active:scale-95 transition"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      </button>

      {/* Centered content */}
      <div className="relative max-w-[300px] text-center">
        <div className="w-32 h-32 mx-auto rounded-full bg-white shadow-lg ring-4 ring-white/60 flex items-center justify-center mb-7 overflow-hidden">
          <Image
            src="/mali-illustrations/happy_hands_up_baby.png"
            alt=""
            width={120}
            height={120}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        <h1
          id="birth-handoff-title"
          className="serif text-[30px] font-semibold text-neutral-900 leading-[1.1] tracking-tight"
        >
          Welcome, {mom.name}.
        </h1>
        <p className="serif italic text-[17px] text-neutral-800 mt-2">
          Your new chapter begins.
        </p>
        <p className="text-[14px] text-neutral-700 mt-4 leading-relaxed">
          {baby.name} has arrived. Every moment from here lives in your journal.
        </p>
        <p className="text-[12px] text-neutral-500 mt-2.5 leading-relaxed">
          Your pregnancy story is kept safe — saved as &ldquo;before {baby.name}&rdquo;.
        </p>

        <button
          onClick={onDismiss}
          className="mt-7 px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-semibold text-[15px] shadow-md active:scale-[0.98] transition"
        >
          Begin
        </button>
      </div>

      <style jsx>{`
        .birth-handoff-overlay {
          animation: fade-in 320ms ease-out both;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/** Decorative — 10 emoji "sprinkles" with subtle floating animation. */
function SprinkleConfetti() {
  const items: { emoji: string; left: string; top: string; delay: string; size: string }[] = [
    { emoji: "✦", left: "8%",  top: "14%", delay: "0s",    size: "20px" },
    { emoji: "♥", left: "22%", top: "8%",  delay: "0.3s",  size: "16px" },
    { emoji: "✦", left: "78%", top: "12%", delay: "0.15s", size: "22px" },
    { emoji: "♥", left: "88%", top: "30%", delay: "0.45s", size: "14px" },
    { emoji: "·", left: "14%", top: "44%", delay: "0.2s",  size: "26px" },
    { emoji: "✦", left: "84%", top: "62%", delay: "0.1s",  size: "18px" },
    { emoji: "♥", left: "12%", top: "70%", delay: "0.5s",  size: "16px" },
    { emoji: "✦", left: "26%", top: "84%", delay: "0.25s", size: "20px" },
    { emoji: "·", left: "72%", top: "88%", delay: "0.35s", size: "28px" },
    { emoji: "♥", left: "92%", top: "78%", delay: "0.4s",  size: "14px" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((s, i) => (
        <span
          key={i}
          className="absolute text-[var(--color-primary)]/40 sprinkle"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            animationDelay: s.delay,
          }}
          aria-hidden
        >
          {s.emoji}
        </span>
      ))}
      <style jsx>{`
        .sprinkle {
          opacity: 0;
          animation: sprinkle-in 900ms ease-out forwards;
        }
        @keyframes sprinkle-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.6); }
          40%  { opacity: 0.85; }
          100% { opacity: 0.55; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
