"use client";

import { useState } from "react";
import Image from "next/image";
import { useJournalStore } from "@/lib/journal-store";
import type { AgeBucket } from "@/lib/mock-milestones";

const STUB_PHOTO =
  "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=320&h=320&fit=crop&auto=format&q=70";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Add-a-custom-milestone bottom sheet. Per Jonas's 2026-05-28 email:
 *
 *   "Once users click add (+), they should be able to add a date, image,
 *    title and notes. That's it. It then appears with a checkbox in the
 *    overview."
 *
 * The act of saving = marking it done. The new milestone lands in the
 * current age bucket (passed in by the parent) and threads into the journal
 * via addCustomMilestone → setMilestoneDone.
 */
export function CustomMilestoneSheet({
  bucket,
  onClose,
}: {
  bucket: AgeBucket;
  onClose: () => void;
}) {
  const { addCustomMilestone } = useJournalStore();
  const [title, setTitle] = useState("");
  const [whenStr, setWhenStr] = useState(todayIso());
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const canSave = title.trim().length > 0;

  function save() {
    if (!canSave) return;
    const when = whenStr ? new Date(whenStr + "T12:00:00") : new Date();
    addCustomMilestone({
      label: title.trim(),
      bucket,
      when,
      note: note.trim() || undefined,
      photo: photo ?? undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} role="presentation" />
      <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-sm px-5 pt-5 pb-7 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-baseline justify-between mb-1">
          <div className="serif text-[19px] font-semibold text-neutral-900">
            New milestone
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 w-8 h-8 flex items-center justify-center text-neutral-500"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-neutral-500 mb-4">
          A moment worth remembering — first time at the beach, grandma&rsquo;s
          first visit, anything.
        </p>

        <div className="space-y-4">
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First time at the beach"
              className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
              autoFocus
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={whenStr}
              onChange={(e) => setWhenStr(e.target.value)}
              className="w-full text-base border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything you want to remember about this?"
              className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </Field>

          <Field label="Photo (optional)">
            {photo ? (
              <div className="relative">
                <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-neutral-100">
                  <Image src={photo} alt="" fill sizes="(max-width: 640px) 90vw, 320px" className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6l12 12M18 6l-12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPhoto(STUB_PHOTO)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-200 text-sm text-neutral-500 font-medium active:bg-neutral-50 transition"
              >
                + Add photo
              </button>
            )}
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-neutral-100 text-neutral-700 font-semibold text-sm active:scale-[0.98] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="flex-1 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100"
          >
            Save as memory
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}
