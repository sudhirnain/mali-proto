"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useBaby } from "@/lib/cold-mode";

const TRIMESTER_LABEL = ["1st", "2nd", "3rd"];

// Session-local due-date override (mock — there's no backend setter). Module
// scope so an edit reflects across the card's two instances (Feed header +
// Moments section) within the session.
let dueDateOverride: string | undefined;

/**
 * Pregnancy "Your journey" card, rendered identically on the Feed
 * (variant="header") and in Moments (variant="section") — that single shared
 * card is Jonas's s7 "replicate card from Feed".
 *
 * Matches the round-2 mock (feedback02 slide 3): trimester · Week N · "Your
 * baby is about the size of a <X>" + image · progress · tappable Due date
 * (s3 "due date should link").
 *
 * Size comparison is the ANIMAL (s3 "add baby image as animal" + the ladybug
 * mock) — emoji placeholder in the image square until their animal art lands;
 * falls back to the weekly watercolor + sizeFruit when no animal is mapped.
 *
 * Bottom-row link uses the MilestoneHero treatment (dotted underline, text
 * "→") — Jonas s4: "Different style and arrow the same action… The one above
 * [Milestones] looks correct." Keep the two cards' chrome identical.
 */
export function JourneyHero({ variant = "section" }: { variant?: "section" | "header" } = {}) {
  const baby = useBaby();
  const week = baby.week ?? 24;
  const trimesterIdx = week <= 13 ? 0 : week <= 27 ? 1 : 2;
  const pct = Math.min(100, Math.round((week / 40) * 100));
  const [dueDate, setDueDate] = useState<string | undefined>(dueDateOverride ?? baby.dueDate);
  const [editing, setEditing] = useState(false);
  const weekArt = `/mali-art/weekly/w${week}.png`;

  return (
    <div
      className={`block rounded-3xl p-4 ${
        variant === "section" ? "mx-1 bg-[var(--color-primary-softer)]" : "bg-white/50 backdrop-blur"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
            {TRIMESTER_LABEL[trimesterIdx]} trimester
          </div>
          <div className="serif text-[21px] font-semibold text-neutral-900 leading-none tracking-tight mt-1">
            Week {week}
          </div>
          {(baby.sizeAnimal || baby.sizeFruit) && (
            <div className="text-[12.5px] text-neutral-700 leading-snug mt-1.5">
              Your baby is about the size of{" "}
              {articleFor(baby.sizeAnimal?.label ?? baby.sizeFruit!)}{" "}
              <span className="font-semibold text-neutral-900">
                {(baby.sizeAnimal?.label ?? baby.sizeFruit!).toLowerCase()}
              </span>
            </div>
          )}
        </div>
        <span className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/70 flex items-center justify-center shrink-0">
          {baby.sizeAnimal ? (
            <span className="text-[34px] leading-none" aria-hidden>
              {baby.sizeAnimal.emoji}
            </span>
          ) : (
            <Image src={weekArt} alt="" fill sizes="64px" className="object-contain p-0.5" />
          )}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-neutral-600 mt-2 font-medium">
          <span>{pct}% through pregnancy</span>
          {dueDate && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Change due date"
              className="truncate ml-3 underline decoration-dotted underline-offset-4 active:opacity-70"
            >
              Due date {dueDate} →
            </button>
          )}
        </div>
      </div>

      {editing &&
        createPortal(
          <DueDateSheet
            value={dueDate}
            onClose={() => setEditing(false)}
            onSave={(eu) => {
              dueDateOverride = eu;
              setDueDate(eu);
              setEditing(false);
            }}
          />,
          document.body,
        )}
    </div>
  );
}

function articleFor(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

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
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm bg-white rounded-t-3xl md:rounded-3xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-neutral-900">Change due date</h2>
        <input
          type="date"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          className="mt-4 w-full bg-neutral-50 rounded-xl px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-neutral-200 text-neutral-700 font-semibold text-sm active:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!iso}
            onClick={() => iso && onSave(isoToEu(iso))}
            className="flex-1 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// dueDate is stored EU-style "DD.MM.YYYY"; <input type="date"> needs ISO.
function euToIso(eu?: string): string {
  if (!eu) return "";
  const m = eu.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}
function isoToEu(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}
