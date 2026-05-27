"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePhase } from "@/lib/phase";
import { useMom, useBaby } from "@/lib/cold-mode";

/**
 * Fires a one-time celebration overlay when the user transitions from
 * pregnancy → parenting. This is the moment My Baby structurally can't have
 * — Mali's two-phase journey culminates here. Re-fires every time the
 * transition happens (so demos can replay by toggling phase).
 */
export function BirthHandoff() {
  const { phase } = usePhase();
  const prevPhase = useRef(phase);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (prevPhase.current === "pregnancy" && phase === "parenting") {
      setOpen(true);
    }
    prevPhase.current = phase;
  }, [phase]);

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
      {/* Soft coral→teal gradient symbolizing the phase transition itself */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-coral-softer)] via-white to-[var(--color-teal-softer)]" />

      {/* Sprinkled hearts + sparkles backdrop */}
      <SprinkleConfetti />

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
