"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategory, type Category } from "@/lib/categories";
import { Illustration } from "@/components/Illustration";
import { milestoneArtOrFallback } from "@/lib/milestone-art";
import { formatTime } from "@/lib/format";
import { MOCK_KICK_SESSIONS, TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { useJournalStore } from "@/lib/journal-store";
import { useActiveTimer } from "@/lib/active-timer";
import { useContractionSession } from "@/lib/contraction-session";
import { tinyHaptic } from "@/lib/haptic";

/** Lets a form register an icon button into the page header's right slot (e.g.
 *  nursing's live-timer reset), so secondary actions stay out of the form's
 *  vertical flow. Null for forms that don't use it — the slot stays an empty
 *  spacer, balancing the back chevron. */
const HeaderSlotContext = createContext<(node: ReactNode) => void>(() => {});

export default function LogEntryPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const editId = search?.get("id") ?? null;
  const id = params.category;
  const cat = getCategory(id);
  const { getEntry } = useJournalStore();
  const editing = editId ? getEntry(editId) : undefined;
  const [headerRight, setHeaderRight] = useState<ReactNode>(null);

  // The Milestone form has no real "add new event" affordance — milestones are
  // selected from a curated list. Route there directly so the salmon-walled
  // mini-form isn't a dead end.
  useEffect(() => {
    if (id === "milestone") router.replace("/journal/category/milestone");
  }, [id, router]);
  if (id === "milestone") return null;

  if (!cat) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unknown category</h1>
        <Link href="/log" className="text-[var(--color-primary)] underline text-sm mt-2 inline-block">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16 min-h-full md:pt-11" style={{ backgroundColor: `var(--color-${cat.color}-soft)` }}>
      {/* Coral-tinted header */}
      <header className="px-3 pt-4 pb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center text-neutral-800"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">{editing ? `Edit ${cat.label.toLowerCase()}` : cat.label}</h1>
        {/* Forms register a header action here (e.g. nursing's reset); the dead
         *  3-dot menu is gone (Jonas round-3 s12 "remove here and everywhere"). */}
        <div className="w-9 h-9 flex items-center justify-center">{headerRight}</div>
      </header>

      {/* White card content area */}
      <div className="mx-3 bg-white rounded-3xl p-5 shadow-sm">
        <CategoryIconBadge cat={cat} />
        <HeaderSlotContext.Provider value={setHeaderRight}>
          <FormBody cat={cat} editing={editing} />
        </HeaderSlotContext.Provider>
      </div>
    </div>
  );
}

function CategoryIconBadge({ cat }: { cat: Category }) {
  return (
    <div className="flex justify-center -mt-10 mb-6">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center ring-4 ring-white"
        style={{
          backgroundColor: `var(--color-${cat.color}-soft)`,
          color: `var(--color-${cat.color})`,
        }}
      >
        <Illustration name={cat.iconName} className="w-9 h-9" />
      </div>
    </div>
  );
}

function FormBody({ cat, editing }: { cat: Category; editing?: Entry }) {
  switch (cat.formKind) {
    case "timer":
      // Nursing gets its own dual left/right timer + Success/Failure outcome
      // (Jonas round-3 s12); other timer categories share TimerEntryForm.
      return cat.id === "nursing" ? (
        <NursingForm cat={cat} editing={editing} />
      ) : (
        <TimerEntryForm cat={cat} editing={editing} />
      );
    case "measurement":
      return <MeasurementForm cat={cat} editing={editing} />;
    case "event":
      return <EventForm cat={cat} editing={editing} />;
    case "kicks":
      return <KicksForm cat={cat} />;
    case "contractions":
      return <ContractionsForm cat={cat} />;
    case "milestone":
      // Unreachable — id === "milestone" redirects in the page-level useEffect
      // above. Kept so the switch type-checks against Category.formKind.
      return null;
    case "note":
      return <NoteForm cat={cat} editing={editing} />;
  }
}

/**
 * Memory-type categories whose entries live in a mixed feed, not a single
 * tracking overview — landing on "/journal/category/note" after a quick note
 * would feel like a dead-end, so these fall back to router.back() (s9).
 */
const MEMORY_CATEGORIES = new Set(["note", "quote", "picture", "milestone"]);

/**
 * Hook every form uses to actually save. New entries get a unique id; edits
 * reuse the existing id so the store replaces the record cleanly.
 *
 * Navigation is centralized here (per the CLAUDE.md save contract — callers
 * never navigate): trackable categories land on their category overview so the
 * just-saved entry is visible in context (Jonas s9: "After SAVE I should come
 * to My Weight overview"). Memory categories go back instead (see set above).
 */
function useSaveEntry(cat: Category, editing?: Entry) {
  const { addEntry } = useJournalStore();
  const router = useRouter();
  return function save(patch: Partial<Entry>) {
    const newId = editing?.id ?? `e-${Date.now()}`;
    addEntry({
      id: newId,
      categoryId: cat.id,
      at: editing?.at ?? new Date().toISOString(),
      ...patch,
    });
    if (MEMORY_CATEGORIES.has(cat.id)) {
      router.back();
    } else {
      router.push(`/journal/category/${cat.id}`);
    }
  };
}

/* ------------------------------------------------------------------ */
/*  Form variants                                                     */
/* ------------------------------------------------------------------ */

/**
 * Category-adaptive timer entry form for every `formKind: "timer"` category
 * (sleep, sleep-mom, nursing, bottle, pumping, stroll, bathing). Field-first:
 * Start/End are the PRIMARY logging method so historic data is always
 * enterable (Jonas s4: the old bare stopwatch couldn't add past entries).
 *
 * The live timer is an escape hatch — tap "Start live timer" and the running
 * session ticks via the global ActiveTimer context (survives navigation,
 * stacks concurrently with other categories' timers). Stopping fills the
 * Start/End fields from the elapsed session.
 *
 * Per-category extras (My Baby parity, slides 27/30/34/36):
 *   nursing/pumping → Left/Both/Right side
 *   bottle/pumping  → Quantity (ml)
 *   bottle          → Breast milk/Formula
 *   sleep/sleep-mom → Daytime/Night + quick chips ("Just woke up", etc.)
 *   sleep/bottle/pumping → Comments
 */
function TimerEntryForm({ cat, editing }: { cat: Category; editing?: Entry }) {
  const isSleep = cat.id === "sleep" || cat.id === "sleep-mom";
  const showSide = cat.id === "nursing" || cat.id === "pumping";
  const showQuantity = cat.id === "bottle" || cat.id === "pumping";
  const showMilkType = cat.id === "bottle";
  const showComments = isSleep || cat.id === "bottle" || cat.id === "pumping";

  const defaultEnd = editing?.at ? new Date(editing.at) : new Date();
  const defaultStart = editing?.durationMin
    ? new Date(defaultEnd.getTime() - editing.durationMin * 60000)
    : new Date(defaultEnd.getTime() - 60 * 60000);

  const [start, setStart] = useState<Date>(defaultStart);
  const [end, setEnd] = useState<Date>(defaultEnd);
  // Daytime/Night is auto-derived from the start time (no manual toggle — it
  // was redundant with the start, see 2026-06-02). Still recorded on the entry.
  const sleepKind = inferSleepKind(start);
  const [side, setSide] = useState<"left" | "right" | "both">(() => parseSide(editing?.meta) ?? "right");
  const [quantityMl, setQuantityMl] = useState<number>(() => parseMl(editing?.meta) ?? (cat.id === "bottle" ? 120 : 90));
  const [milkType, setMilkType] = useState<"Breast milk" | "Formula">(() => (/formula/i.test(editing?.meta ?? "") ? "Formula" : "Breast milk"));
  const [comments, setComments] = useState<string>("");
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);

  const save = useSaveEntry(cat, editing);
  const timer = useActiveTimer();
  const liveTimer = timer.timerFor(cat.id);
  const runningHere = !!liveTimer;
  // Manual (start/end fields) vs Live timer (Start → Stop) — the My Baby
  // Manual/Timer pattern (slide 34). Defaults to Manual (retro logging is the
  // common case); opens in Live if a timer for this category is already running.
  const [mode, setMode] = useState<"Manual" | "Live timer">(runningHere ? "Live timer" : "Manual");

  const accent = `var(--color-${cat.color})`;
  const fieldDurationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const invalid = !runningHere && end.getTime() <= start.getTime();

  const stopLive = () => {
    if (!liveTimer) return;
    timer.stop(cat.id);
    setStart(new Date(liveTimer.startedAt));
    setEnd(new Date());
  };

  return (
    <div className="space-y-4">
      <SegmentedToggle
        options={["Manual", "Live timer"] as const}
        value={mode}
        onChange={(m) => {
          // Switching to Manual mid-session stops the timer and fills the times.
          if (m === "Manual" && runningHere) stopLive();
          setMode(m);
        }}
      />

      {mode === "Live timer" ? (
        runningHere ? (
          <div className="space-y-3">
            <div className="text-center py-1">
              <div className="serif text-4xl font-semibold tabular-nums" style={{ color: accent }}>
                {formatTimerLive(timer.elapsedSec(cat.id))}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Running — keeps going if you navigate away
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopLive();
                setMode("Manual");
              }}
              className="w-full py-3 rounded-full text-white font-semibold text-base active:scale-[0.98] transition"
              style={{ backgroundColor: accent }}
            >
              Stop &amp; review
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="serif text-4xl font-semibold tabular-nums text-center text-neutral-300 py-1">
              00:00
            </div>
            <button
              type="button"
              onClick={() => timer.start(cat.id)}
              className="w-full py-3 rounded-full text-white font-semibold text-base active:scale-[0.98] transition"
              style={{ backgroundColor: accent }}
            >
              Start timer
            </button>
            <div className="text-xs text-neutral-500 text-center px-2">
              Runs in the background — Stop fills the times so you can review &amp; save.
            </div>
          </div>
        )
      ) : (
        <>
          <Field label="Start">
            <DateTimeInput value={start} onChange={setStart} />
          </Field>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">End</span>
              <span className={`text-xs tabular-nums ${invalid ? "text-red-500" : "text-neutral-500"}`}>
                {invalid ? "End is before start" : formatDurationShort(fieldDurationMin)}
              </span>
            </div>
            <DateTimeInput value={end} onChange={setEnd} />
          </div>

          {showSide && (
            <SegmentedToggle
              options={["left", "both", "right"] as const}
              value={side}
              onChange={setSide}
              capitalize
            />
          )}

          {showQuantity && (
            <Field label="Quantity (ml)">
              <input
                type="number"
                inputMode="numeric"
                value={quantityMl}
                min={0}
                step={10}
                onChange={(e) => setQuantityMl(Number(e.target.value) || 0)}
                className={`${INPUT_CLASS} text-base tabular-nums`}
              />
            </Field>
          )}

          {showMilkType && (
            <SegmentedToggle
              options={["Breast milk", "Formula"] as const}
              value={milkType}
              onChange={setMilkType}
            />
          )}

          {showComments && (
            <Field label="Comments (optional)">
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Anything you want to remember?"
                className={`${INPUT_CLASS} text-sm resize-none`}
              />
            </Field>
          )}

          <PhotoAttachField photo={photo} onChange={setPhoto} />

          <SaveBar
            cat={cat}
            editing={editing}
            onSave={() => {
              let finalStart = start;
              let finalEnd = end;
              if (liveTimer) {
                timer.stop(cat.id);
                finalStart = new Date(liveTimer.startedAt);
                finalEnd = new Date();
              }
              const finalMin = Math.max(1, Math.round((finalEnd.getTime() - finalStart.getTime()) / 60000));
              const parts: string[] = [formatDurationShort(finalMin)];
              if (isSleep) parts.push(sleepKind);
              if (showQuantity) parts.push(`${quantityMl}ml`);
              if (showMilkType) parts.push(milkType);
              if (showSide) parts.push(side);
              const baseMeta = parts.join(", ");
              const note = comments.trim();
              save({
                at: finalEnd.toISOString(),
                durationMin: finalMin,
                meta: note ? `${baseMeta} — ${note}` : baseMeta,
                photo,
              });
            }}
          />
        </>
      )}
    </div>
  );
}

/**
 * Nursing form — dual left/right timing (Jonas round-3 s12 "introduce left and
 * right for the time"; reference = two stopwatches) + a Success/Failure outcome
 * ("change the CTA to be SUCCESS and FAILURE"). Replaces TimerEntryForm for
 * nursing only; pumping keeps the single timer.
 *
 * Live: two stopwatches, one breast at a time (starting one pauses the other),
 * each accumulating across pauses; the running side survives navigation via
 * ActiveTimer keyed `nursing:left` / `nursing:right`. Manual: per-side minute
 * inputs for retro logging. Either way the entry records per-side time +
 * outcome, e.g. "12 min (L 7m · R 5m), Success".
 */
function NursingForm({ cat, editing }: { cat: Category; editing?: Entry }) {
  const save = useSaveEntry(cat, editing);
  const timer = useActiveTimer();
  const accent = `var(--color-${cat.color})`;

  const [mode, setMode] = useState<"Manual" | "Live timer">(
    timer.timerFor("nursing:left") || timer.timerFor("nursing:right") ? "Live timer" : "Manual",
  );
  // Optional quality rating (Jonas floated "poor / good / better"); softer than
  // a forced Success/Failure toggle, and unrated feeds simply carry no rating.
  const [quality, setQuality] = useState<"Poor" | "Good" | "Great" | null>(null);
  const [comments, setComments] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);

  // Manual: minutes per side.
  const [leftMin, setLeftMin] = useState(0);
  const [rightMin, setRightMin] = useState(0);

  // Live: seconds banked at each pause, plus whatever the running side has
  // ticked since it last started.
  const [leftAcc, setLeftAcc] = useState(0);
  const [rightAcc, setRightAcc] = useState(0);
  const leftRunning = !!timer.timerFor("nursing:left");
  const rightRunning = !!timer.timerFor("nursing:right");
  const liveSec = (side: "left" | "right") => {
    const acc = side === "left" ? leftAcc : rightAcc;
    const running = side === "left" ? leftRunning : rightRunning;
    return acc + (running ? timer.elapsedSec(`nursing:${side}`) : 0);
  };

  const pauseSide = (side: "left" | "right") => {
    if (!timer.timerFor(`nursing:${side}`)) return;
    const sec = timer.elapsedSec(`nursing:${side}`);
    timer.stop(`nursing:${side}`);
    if (side === "left") setLeftAcc((s) => s + sec);
    else setRightAcc((s) => s + sec);
  };
  const startSide = (side: "left" | "right") => {
    pauseSide(side === "left" ? "right" : "left"); // one breast at a time
    if (!timer.timerFor(`nursing:${side}`)) timer.start(`nursing:${side}`);
  };
  const resetTimers = () => {
    if (timer.timerFor("nursing:left")) timer.stop("nursing:left");
    if (timer.timerFor("nursing:right")) timer.stop("nursing:right");
    setLeftAcc(0);
    setRightAcc(0);
  };

  // Reset lives in the page header (top-right), out of the form's vertical
  // flow — shown only in Live mode once a side has run (never a dead control).
  const setHeaderRight = useContext(HeaderSlotContext);
  const resetRef = useRef(resetTimers);
  resetRef.current = resetTimers;
  const showReset = mode === "Live timer" && (leftRunning || rightRunning || leftAcc > 0 || rightAcc > 0);
  useEffect(() => {
    setHeaderRight(
      showReset ? (
        <button
          type="button"
          aria-label="Reset timers"
          title="Reset timers"
          onClick={() => resetRef.current()}
          className="w-9 h-9 flex items-center justify-center text-neutral-700 active:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      ) : null,
    );
    return () => setHeaderRight(null);
  }, [showReset, setHeaderRight]);

  const metaFor = (lSec: number, rSec: number) => {
    const lMin = Math.round(lSec / 60);
    const rMin = Math.round(rSec / 60);
    const total = Math.max(1, lMin + rMin);
    const sides: string[] = [];
    if (lMin > 0) sides.push(`L ${lMin}m`);
    if (rMin > 0) sides.push(`R ${rMin}m`);
    const sideStr = sides.length ? ` (${sides.join(" · ")})` : "";
    const base = quality ? `${total} min${sideStr}, ${quality}` : `${total} min${sideStr}`;
    const note = comments.trim();
    return { total, meta: note ? `${base} — ${note}` : base };
  };

  const saveLive = () => {
    const lSec = liveSec("left");
    const rSec = liveSec("right");
    if (leftRunning) timer.stop("nursing:left");
    if (rightRunning) timer.stop("nursing:right");
    const { total, meta } = metaFor(lSec, rSec);
    save({ at: new Date().toISOString(), durationMin: total, meta, photo });
  };
  const saveManual = () => {
    const { total, meta } = metaFor(leftMin * 60, rightMin * 60);
    save({ at: new Date().toISOString(), durationMin: total, meta, photo });
  };

  // Uses the standard <Field> wrapper so its label + label-to-control gap match
  // Comments / Photo exactly (don't hand-roll the label spacing — that was the
  // 6px-vs-8px drift).
  const qualityField = (
    <Field label="How did it go? (optional)">
      <div className="flex gap-2">
        {(["Poor", "Good", "Great"] as const).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuality((cur) => (cur === q ? null : q))}
            aria-pressed={quality === q}
            className={`flex-1 py-2 rounded-full text-sm font-semibold border transition ${
              quality === q
                ? "text-white border-transparent"
                : "text-neutral-600 border-neutral-200 bg-white active:bg-neutral-50"
            }`}
            style={quality === q ? { backgroundColor: accent } : undefined}
          >
            {q}
          </button>
        ))}
      </div>
    </Field>
  );

  const commentsField = (
    <Field label="Comments (optional)">
      <textarea
        rows={2}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Anything you want to remember?"
        className={`${INPUT_CLASS} text-sm resize-none`}
      />
    </Field>
  );

  return (
    <div className="space-y-4">
      <SegmentedToggle
        options={["Manual", "Live timer"] as const}
        value={mode}
        onChange={(m) => {
          if (m === "Manual") {
            pauseSide("left");
            pauseSide("right");
          }
          setMode(m);
        }}
      />

      {mode === "Live timer" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {(["left", "right"] as const).map((side) => {
              const running = side === "left" ? leftRunning : rightRunning;
              const sec = liveSec(side);
              return (
                <div key={side} className="rounded-2xl border border-neutral-200 p-4 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    {side === "left" ? "Left" : "Right"}
                  </div>
                  <div
                    className="serif text-3xl font-semibold tabular-nums"
                    style={{ color: running ? accent : "var(--color-neutral-400)" }}
                  >
                    {formatTimerLive(sec)}
                  </div>
                  <button
                    type="button"
                    onClick={() => (running ? pauseSide(side) : startSide(side))}
                    className="mt-3 w-full py-2 rounded-full text-sm font-semibold text-white active:scale-[0.98] transition"
                    style={{ backgroundColor: accent }}
                  >
                    {running ? "Pause" : sec > 0 ? "Resume" : "Start"}
                  </button>
                </div>
              );
            })}
          </div>
          {qualityField}
          {commentsField}
          <PhotoAttachField photo={photo} onChange={setPhoto} />
          <SaveBar cat={cat} editing={editing} onSave={saveLive} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Left (min)">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={leftMin}
                onChange={(e) => setLeftMin(Math.max(0, Number(e.target.value) || 0))}
                className={`${INPUT_CLASS} text-base tabular-nums`}
              />
            </Field>
            <Field label="Right (min)">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={rightMin}
                onChange={(e) => setRightMin(Math.max(0, Number(e.target.value) || 0))}
                className={`${INPUT_CLASS} text-base tabular-nums`}
              />
            </Field>
          </div>
          {qualityField}
          {commentsField}
          <PhotoAttachField photo={photo} onChange={setPhoto} />
          <SaveBar cat={cat} editing={editing} onSave={saveManual} />
        </>
      )}
    </div>
  );
}

/** Pill segmented control shared by every timer-form choice (side, milk, sleep kind). */
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  capitalize,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-neutral-100 rounded-full p-1 flex">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${capitalize ? "capitalize" : ""} ${
            value === o ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function formatTimerLive(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Contraction gap, in the unit production Mali's Rate column uses (~45s / ~6 min). */
function formatGap(ms: number): string {
  const sec = Math.round(ms / 1000);
  return sec < 90 ? `~${sec}s` : `~${Math.round(sec / 60)} min`;
}

function parseSide(meta?: string): "left" | "right" | "both" | null {
  if (!meta) return null;
  if (/right/i.test(meta)) return "right";
  if (/left/i.test(meta)) return "left";
  if (/both/i.test(meta)) return "both";
  return null;
}

function parseMl(meta?: string): number | null {
  if (!meta) return null;
  const m = meta.match(/(\d+)\s*ml/i);
  return m ? Number(m[1]) : null;
}

function formatDurationShort(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0 ? `${h} h` : `${h} h ${rem} min`;
}

function inferSleepKind(d: Date): "Daytime" | "Night" {
  const h = d.getHours();
  return h >= 19 || h < 6 ? "Night" : "Daytime";
}

/**
 * Shared input chrome. Per Jonas s5b — the old `border border-neutral-200`
 * outlines read as heavy "lines around every field"; My Baby is softer. These
 * use a filled neutral-50 ground with a hairline border that only firms up on
 * focus, so fields recede until tapped.
 */
const INPUT_CLASS =
  "w-full bg-neutral-50 border border-transparent rounded-xl px-3 py-2.5 text-neutral-900 focus:outline-none focus:bg-white focus:border-[var(--color-primary)] transition";

function DateTimeInput({
  value,
  onChange,
  disabled,
}: {
  value: Date;
  onChange: (d: Date) => void;
  disabled?: boolean;
}) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const local = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
  return (
    <input
      type="datetime-local"
      value={local}
      disabled={disabled}
      onChange={(e) => {
        const next = new Date(e.target.value);
        if (!isNaN(next.getTime())) onChange(next);
      }}
      className={`${INPUT_CLASS} text-base tabular-nums disabled:text-neutral-500`}
    />
  );
}

function MeasurementForm({ cat, editing }: { cat: Category; editing?: Entry }) {
  const unit =
    cat.id === "temperature"
      ? "°C"
      : cat.id.startsWith("weight")
        ? "kg"
        : cat.id === "length"
          ? "cm"
          : "cm";
  const initialValue =
    parseLeadingNumber(editing?.meta) ??
    (cat.id === "weight-baby"
      ? 5.4
      : cat.id === "length"
        ? 63
        : cat.id === "head"
          ? 40
          : cat.id === "temperature"
            ? 37.0
            : 60.0);
  const [value, setValue] = useState<number>(initialValue);
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const save = useSaveEntry(cat, editing);

  return (
    <div className="space-y-5">
      <Field label="Date">
        <button className="w-full text-left text-sm text-neutral-900 bg-neutral-50 border border-transparent rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span>Today, {formatTime(TODAY_DATE.toISOString())}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </Field>

      <Field label={`${cat.label} (${unit})`}>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step="0.1"
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full text-3xl serif font-semibold text-neutral-900 tabular-nums border-b-2 border-neutral-100 pb-2 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </Field>

      {cat.hasGraph && (
        <div
          className="rounded-2xl p-4 text-sm text-neutral-700"
          style={{ backgroundColor: `var(--color-${cat.color}-soft)` }}
        >
          Your trend is on track. Tap the chart in the journal to see history.
        </div>
      )}

      <PhotoAttachField photo={photo} onChange={setPhoto} />

      <SaveBar cat={cat} editing={editing} onSave={() => save({ meta: `${value} ${unit}`, photo })} />
    </div>
  );
}

function parseLeadingNumber(s?: string): number | null {
  if (!s) return null;
  const m = s.match(/^(-?\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function EventForm({ cat, editing }: { cat: Category; editing?: Entry }) {
  const presets = presetsFor(cat.id);
  const [selected, setSelected] = useState<string | null>(() => {
    if (editing?.meta && presets.includes(editing.meta)) return editing.meta;
    return presets[0] ?? null;
  });
  const [note, setNote] = useState(() => {
    if (!editing?.meta) return "";
    return presets.includes(editing.meta) ? "" : editing.meta;
  });
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const save = useSaveEntry(cat, editing);
  const isMoodPicker = cat.id === "mom-mood" || cat.id === "mood";

  return (
    <div className="space-y-5">
      <Field label="When">
        <button className="w-full text-left text-sm text-neutral-900 bg-neutral-50 border border-transparent rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span>Today, {formatTime(TODAY_DATE.toISOString())}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </Field>

      {isMoodPicker ? (
        <MomMoodPicker cat={cat} selected={selected} onSelect={setSelected} />
      ) : presets.length > 0 ? (
        <Field label="Type">
          <div className="flex gap-2 flex-wrap">
            {presets.map((p) => {
              const on = selected === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelected(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                    on ? "text-white border-transparent" : "bg-white text-neutral-700 border-neutral-200"
                  }`}
                  style={on ? { backgroundColor: `var(--color-${cat.color})` } : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </Field>
      ) : null}

      <Field label={selected === OTHER_PRESET ? "Describe" : "Note (optional)"}>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${INPUT_CLASS} text-sm resize-none`}
          placeholder={selected === OTHER_PRESET ? "What was it?" : "Anything else?"}
          autoFocus={selected === OTHER_PRESET && !note}
        />
      </Field>

      <PhotoAttachField photo={photo} onChange={setPhoto} />

      <SaveBar
        cat={cat}
        editing={editing}
        onSave={() =>
          save({
            // If "Other" is the chip, the note IS the entry. For other chips,
            // a free-text note still overrides the chip label (existing behavior).
            meta:
              selected === OTHER_PRESET
                ? note.trim() || OTHER_PRESET
                : note.trim() || selected || cat.label,
            photo,
          })
        }
      />
    </div>
  );
}

function MomMoodPicker({
  cat,
  selected,
  onSelect,
}: {
  cat: Category;
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  const isBaby = cat.id === "mood";
  const moods = isBaby
    ? [
        { id: "Cheerful", emoji: "😊" },
        { id: "Fine", emoji: "🙂" },
        { id: "Sad", emoji: "😢" },
        { id: "Crying", emoji: "😭" },
        { id: OTHER_PRESET, emoji: "💭" },
      ]
    : [
        { id: "Cheerful", emoji: "😊" },
        { id: "Fine", emoji: "🙂" },
        { id: "Anxious", emoji: "😟" },
        { id: "Overwhelmed", emoji: "😩" },
        { id: "Grateful", emoji: "🙏" },
        { id: OTHER_PRESET, emoji: "💭" },
      ];
  return (
    <Field label={isBaby ? "Baby's mood" : "How are you?"}>
      <div className="flex flex-wrap gap-2">
        {moods.map((m) => {
          const on = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`inline-flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 rounded-full border text-sm font-semibold transition active:scale-95 ${
                on ? "text-white border-transparent shadow-sm" : "bg-white text-neutral-700 border-neutral-200"
              }`}
              style={on ? { backgroundColor: `var(--color-${cat.color})` } : undefined}
              aria-pressed={on}
            >
              <span className="text-[17px] leading-none" aria-hidden>{m.emoji}</span>
              <span>{m.id}</span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function KicksForm({ cat }: { cat: Category }) {
  const [count, setCount] = useState(3);
  const [startedAt] = useState(() => Date.now());
  const goal = 10;
  const save = useSaveEntry(cat);
  const router = useRouter();
  const reached = count >= goal;
  const elapsedMin = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));

  return (
    <div className="space-y-5 text-center">
      <div>
        <div className="serif text-6xl font-semibold text-neutral-900 tabular-nums">{count}</div>
        <div className="text-xs text-neutral-500 mt-1">of {goal} kicks</div>
      </div>

      <button
        onClick={() => {
          tinyHaptic();
          setCount((c) => Math.min(c + 1, goal));
        }}
        disabled={reached}
        className="w-32 h-32 mx-auto rounded-full text-white font-semibold text-base shadow-lg active:scale-95 transition disabled:opacity-60 disabled:active:scale-100"
        style={{ backgroundColor: "var(--color-cat-kicks)" }}
      >
        {reached ? "Reached!" : "Tap for a kick"}
      </button>

      <div className="text-xs text-neutral-500">Last session: {MOCK_KICK_SESSIONS[0].kicks} kicks, {MOCK_KICK_SESSIONS[0].durationMin} min</div>

      {/* Hidden once the goal is reached — KickCelebration owns the terminal
          save then, so two save affordances can't both fire (dupe entry). */}
      {!reached && (
        <DoneBar
          onDone={() => {
            if (count <= 0) {
              router.back();
              return;
            }
            save({ meta: `${count} kicks, ${elapsedMin} min`, durationMin: elapsedMin });
          }}
        />
      )}

      {/* Slide 17 comment: "Can we add positive feedback upon completion?"
       *  Celebration overlay when the 10-kick goal is reached — copy lifted
       *  from the slide. Tapping Save triggers the same save() as DoneBar. */}
      {reached && (
        <KickCelebration
          count={count}
          minutes={elapsedMin}
          onSave={() =>
            save({ meta: `${count} kicks, ${elapsedMin} min`, durationMin: elapsedMin })
          }
          onClose={() => setCount(goal - 1)}
        />
      )}
    </div>
  );
}

function KickCelebration({
  count,
  minutes,
  onSave,
  onClose,
}: {
  count: number;
  minutes: number;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-neutral-400"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        </button>

        {/* Mali baby line-art instead of an emoji (Jonas round-3 s23 "change to Mali baby"). */}
        <div className="flex justify-center mb-2" aria-hidden>
          <Image
            src={milestoneArtOrFallback("m-laugh")}
            alt=""
            width={84}
            height={84}
            className="object-contain"
          />
        </div>
        <div className="serif text-2xl font-semibold text-neutral-900 mb-1">Great!</div>
        <p className="text-sm text-neutral-700 leading-relaxed">
          You felt{" "}
          <span className="font-semibold text-neutral-900">{count} movements</span> in{" "}
          <span className="font-semibold text-neutral-900">{minutes} {minutes === 1 ? "minute" : "minutes"}</span>.
        </p>
        <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
          Healthy babies move at least 10 times in two hours. Yours is doing great.
        </p>
        <button
          type="button"
          onClick={onSave}
          className="w-full mt-6 py-3 rounded-full text-white font-semibold text-base"
          style={{ backgroundColor: "var(--color-cat-kicks)" }}
        >
          Save session
        </button>
      </div>
    </div>
  );
}

/**
 * Contraction timing mirrors production Mali's two-clock logic (Jonas round-2
 * s33 follow-up "Please compare with our logic"): a per-contraction duration
 * timer (their pop-up) and an always-running "time since last contraction"
 * clock (their page-top bar). The session lives in ContractionSessionContext
 * and registers with ActiveTimer, so leaving the screen keeps it running and
 * the floating chip leads back — "in as a tracker, like with sleep".
 */
function ContractionsForm({ cat }: { cat: Category }) {
  const save = useSaveEntry(cat);
  const router = useRouter();
  const timer = useActiveTimer();
  const session = useContractionSession();
  const [explainerOpen, setExplainerOpen] = useState(false);

  const running = session.currentStart != null;
  const count = session.events.length;
  const lastEnd = count > 0 ? session.events[count - 1].end : null;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running && lastEnd == null) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, lastEnd]);

  const currentSec = running ? Math.max(0, Math.floor((now - session.currentStart!) / 1000)) : 0;
  const sinceLastSec = lastEnd != null ? Math.max(0, Math.floor((now - lastEnd) / 1000)) : null;

  // On-screen session stats (count/avg/today) removed per Jonas round-3 s22
  // ("Remove" — X over both lines). Stats are still computed in sessionMeta and
  // saved with the entry; they just don't clutter the live tracker.
  const sessionMeta = (events: { start: number; end: number }[]) => {
    const n = events.length;
    const avg = Math.round(events.reduce((s, e) => s + (e.end - e.start), 0) / n / 1000);
    const gaps = events.slice(1).map((e, i) => e.start - events[i].end);
    const parts = [`${n} ${n === 1 ? "contraction" : "contractions"}`, `avg ${avg}s`];
    if (gaps.length > 0) parts.push(`${formatGap(gaps.reduce((a, b) => a + b, 0) / gaps.length)} apart`);
    return parts.join(", ");
  };

  // The hero slot shows ONE clock, swapped by state (2026-06-02, Sudhir):
  // during a contraction the duration is the number that matters; between
  // contractions the gap is. Two ticking clocks compete — and mid-contraction
  // "since last" stops meaning "the gap" anyway. Production is effectively
  // modal here too (their pop-up covers the page clock).
  const lastDurSec =
    count > 0
      ? Math.round((session.events[count - 1].end - session.events[count - 1].start) / 1000)
      : null;
  // Frozen at start — context line while timing, not a competing ticker.
  const gapBeforeCurrent =
    running && lastEnd != null ? formatGap(session.currentStart! - lastEnd) : null;

  return (
    <div className="space-y-5">
      {running ? (
        <div className="text-center">
          <div
            className="serif text-4xl font-semibold tabular-nums"
            style={{ color: "var(--color-cat-contractions)" }}
          >
            {formatTimerLive(currentSec)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Current contraction</div>
          {gapBeforeCurrent && (
            <div className="text-[11px] text-neutral-400 mt-1.5">
              after a {gapBeforeCurrent.replace("~", "")} gap
            </div>
          )}
        </div>
      ) : sinceLastSec != null ? (
        <div className="text-center">
          {/* Read as one phrase — "00:08 since last contraction" (Jonas round-3
           *  s4). The value stays prominent; the label is inline, not a separate
           *  stacked caption. */}
          <div className="serif text-4xl font-semibold text-neutral-900 leading-tight text-balance">
            <span className="tabular-nums">{formatTimerLive(sinceLastSec)}</span>{" "}
            <span className="text-lg font-medium text-neutral-500">since last contraction</span>
          </div>
          {lastDurSec != null && (
            <div className="text-[11px] text-neutral-400 mt-1.5 tabular-nums">
              Last contraction · {lastDurSec}s
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="serif text-4xl font-semibold text-neutral-300 tabular-nums">00:00</div>
          <div className="text-xs text-neutral-500 mt-1">Tap below when a contraction starts</div>
        </div>
      )}

      <button
        onClick={() => {
          tinyHaptic();
          if (running) {
            session.stopContraction();
            // Re-baseline the floating chip so its ticking number is "time
            // since last contraction" — the page-top clock in production Mali.
            timer.stop(cat.id);
            timer.start(cat.id);
          } else {
            session.startContraction();
            timer.start(cat.id); // no-op if already running — chip persists across the session
          }
        }}
        className="w-full py-3 rounded-full text-white font-semibold text-base active:scale-[0.98] transition"
        style={{ backgroundColor: "var(--color-cat-contractions)" }}
      >
        {running ? "Stop contraction" : count > 0 ? "Start next" : "Start contraction"}
      </button>

      {/* Slide 18 comment: "Note that this is relevant. Pls show somewhere." —
       *  surface the true-contractions explainer as a collapsible panel. */}
      <button
        type="button"
        onClick={() => setExplainerOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[13px] font-semibold text-neutral-800 active:bg-neutral-50 transition"
        aria-expanded={explainerOpen}
      >
        <span>What&rsquo;s a true contraction?</span>
        <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${explainerOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {explainerOpen && (
        <p className="text-[13px] text-neutral-700 leading-relaxed -mt-2 px-1">
          True contractions indicate the onset of labor. They increase in
          frequency until they are 5 minutes apart or reach 12 contractions
          per hour.
        </p>
      )}

      <DoneBar
        label="End session"
        onDone={() => {
          // Done mid-contraction counts the in-flight one as ending now.
          const finalEvents = running
            ? [...session.events, { start: session.currentStart!, end: Date.now() }]
            : session.events;
          timer.stop(cat.id);
          session.reset();
          if (finalEvents.length === 0) {
            router.back();
            return;
          }
          save({ meta: sessionMeta(finalEvents) });
        }}
      />
    </div>
  );
}

function NoteForm({ cat, editing }: { cat: Category; editing?: Entry }) {
  const isPicture = cat.id === "picture";
  const isQuote = cat.id === "quote";
  const [text, setText] = useState(editing?.meta ?? "");
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const save = useSaveEntry(cat, editing);

  return (
    <div className="space-y-5">
      <Field label="When">
        <button className="w-full text-left text-sm text-neutral-900 bg-neutral-50 border border-transparent rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span>Today, {formatTime(TODAY_DATE.toISOString())}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </Field>

      {isPicture ? (
        <PhotoPickerSquare photo={photo} onChange={setPhoto} />
      ) : (
        <>
          <Field label={isQuote ? "Quote" : "Note"}>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${INPUT_CLASS} text-sm resize-none`}
              placeholder={isQuote ? "“Something they said today...”" : "What's on your mind?"}
            />
          </Field>
          <PhotoAttachField photo={photo} onChange={setPhoto} />
        </>
      )}

      <SaveBar
        cat={cat}
        editing={editing}
        onSave={() => save({ meta: text.trim() || cat.label, photo })}
      />
    </div>
  );
}

/** Large square photo picker for the dedicated Picture/Memory entry. */
function PhotoPickerSquare({ photo, onChange }: { photo?: string; onChange: (p?: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-square rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center gap-1.5 text-neutral-500 text-sm overflow-hidden active:scale-[0.99] transition"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Selected" className="w-full h-full object-cover" />
        ) : (
          <>
            <Illustration name="camera" className="w-8 h-8 text-neutral-400" />
            <span>Tap to add a photo</span>
          </>
        )}
      </button>
      {photo && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 text-xs font-semibold text-neutral-700 shadow-sm"
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFileAsDataUrl(f).then(onChange);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared bits                                                       */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</div>
      {children}
    </div>
  );
}

/**
 * Optional photo attach affordance — compact dashed button when empty, thumbnail
 * + Remove pill when filled. Reads the picked file as a data: URL so the prototype
 * can persist photos in the in-memory journal store without a backend.
 */
function PhotoAttachField({ photo, onChange }: { photo?: string; onChange: (p?: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        Photo (optional)
      </div>
      {photo ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="w-full h-32 object-cover rounded-xl" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 text-xs font-semibold text-neutral-700 shadow-sm"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-500 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <Illustration name="camera" className="w-4 h-4" />
          <span>Attach photo</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFileAsDataUrl(f).then(onChange);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

/**
 * Pinned to the bottom of the form viewport so Save is always reachable
 * without scrolling (Jonas s5a: My Baby's SAVE is always visible). Bleeds to
 * the white card's edges (cancels the card's p-5) and sits on a white ground
 * that fades at the top, so fields scrolling under it stay legible.
 */
function SaveBar({ cat, editing, onSave }: { cat: Category; editing?: Entry; onSave?: () => void }) {
  return (
    <button
      onClick={onSave}
      className="w-full py-3 rounded-full text-white font-semibold text-base active:scale-[0.98] transition"
      style={{ backgroundColor: `var(--color-${cat.color})` }}
    >
      {editing ? "Save changes" : "Save"}
    </button>
  );
}

/**
 * Terminal "Done" affordance for forms whose primary action is a counter or
 * timer (kicks, contractions). onDone is responsible for both saving (if
 * anything was logged) and navigating away — useSaveEntry already handles
 * router.back() after addEntry, so callers control that flow.
 */
function DoneBar({ onDone, label = "Done" }: { onDone: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onDone}
      className="w-full py-3 rounded-full bg-white border-2 border-neutral-200 text-neutral-700 font-semibold text-base active:scale-[0.98] transition"
    >
      {label}
    </button>
  );
}

// Sentinel value for the "Other" preset chip on every picker. When selected,
// the Note field becomes the freeform entry. Per slide 16 comment: "Always
// allow to 'Other'".
export const OTHER_PRESET = "Other";

function presetsFor(id: string): string[] {
  switch (id) {
    case "diaper":
      return ["Wet", "Dirty", "Mixed", "Clean", OTHER_PRESET];
    case "solids":
      return ["Veg", "Fruit", "Grain", "Protein", "Dairy", OTHER_PRESET];
    case "doctor":
      return ["Checkup", "Sick visit", "Specialist", OTHER_PRESET];
    case "vaccinations":
      return ["DTP", "Hep B", "MMR", "Flu", OTHER_PRESET];
    case "temperature":
      return [];
    case "illnesses":
      return ["Fever", "Cough", "Cold", "Rash", OTHER_PRESET];
    case "medications":
      return ["Paracetamol", "Ibuprofen", "Vitamin D", OTHER_PRESET];
    case "mood":
      return ["Cheerful", "Fine", "Sad", "Crying", OTHER_PRESET];

    // Pregnancy mom-experience presets
    case "mom-mood":
      return ["Cheerful", "Fine", "Anxious", "Overwhelmed", "Grateful", OTHER_PRESET];
    case "symptoms":
      return ["Nausea", "Headache", "Swelling", "Heartburn", "Fatigue", "Back pain", "Cramping", OTHER_PRESET];
    case "hydration":
      // Jonas round-3 s17: add smaller units (Gulp / Small Glass), remove "Other".
      return ["Gulp (50ml)", "Small Glass (150ml)", "Cup (250ml)", "Glass (350ml)", "Bottle (500ml)", "Large (1L)"];

    default:
      return [];
  }
}
