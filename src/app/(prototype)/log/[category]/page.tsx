"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCategory, type Category } from "@/lib/categories";
import { Illustration } from "@/components/Illustration";
import { formatTime } from "@/lib/format";
import { MOCK_KICK_SESSIONS, MOCK_CONTRACTIONS, TODAY_DATE, type Entry } from "@/lib/mock-entries";
import { useJournalStore } from "@/lib/journal-store";
import { useActiveTimer } from "@/lib/active-timer";
import { tinyHaptic } from "@/lib/haptic";

export default function LogEntryPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const editId = search?.get("id") ?? null;
  const id = params.category;
  const cat = getCategory(id);
  const { getEntry } = useJournalStore();
  const editing = editId ? getEntry(editId) : undefined;

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
        <button aria-label="More" className="w-9 h-9 flex items-center justify-center text-neutral-700">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </header>

      {/* White card content area */}
      <div className="mx-3 bg-white rounded-3xl p-5 shadow-sm">
        <CategoryIconBadge cat={cat} />
        <FormBody cat={cat} editing={editing} />
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
      return <TimerForm cat={cat} editing={editing} />;
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
 * Hook every form uses to actually save. New entries get a unique id; edits
 * reuse the existing id so the store replaces the record cleanly.
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
    router.back();
  };
}

/* ------------------------------------------------------------------ */
/*  Form variants                                                     */
/* ------------------------------------------------------------------ */

function TimerForm({ cat, editing }: { cat: Category; editing?: Entry }) {
  const [side, setSide] = useState<"left" | "right" | "both">(() => parseSide(editing?.meta) ?? "right");
  const [minutes, setMinutes] = useState(editing?.durationMin ?? 0);
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  // Slide 27/30/34/36 — per-category form extras copied from My Baby:
  // Sleep gets Daytime/Night, Bottle gets ml + Breast milk/Formula, Pumping
  // gets ml + L/R/Both, all three get a Comments field.
  const showSide = cat.id === "nursing" || cat.id === "pumping";
  const showQuantity = cat.id === "bottle" || cat.id === "pumping";
  const showSleepKind = cat.id === "sleep";
  const showMilkType = cat.id === "bottle";
  const showComments = cat.id === "sleep" || cat.id === "bottle" || cat.id === "pumping";

  const [sleepKind, setSleepKind] = useState<"Daytime" | "Night">("Daytime");
  const [quantityMl, setQuantityMl] = useState<number>(cat.id === "bottle" ? 120 : 90);
  const [milkType, setMilkType] = useState<"Breast milk" | "Formula">("Breast milk");
  const [comments, setComments] = useState<string>("");

  const save = useSaveEntry(cat, editing);
  const timer = useActiveTimer();

  // Running state is derived from the global active-timer context — that
  // way the chip and form agree even after navigation. The form drives
  // start/stop; the context owns the elapsed-time tick.
  const runningHere = timer.active?.categoryId === cat.id;
  const liveMinutes = runningHere ? Math.max(1, Math.floor(timer.elapsedSec / 60)) : minutes;

  const onToggle = () => {
    if (runningHere) {
      const mins = timer.stop();
      setMinutes(mins);
    } else {
      timer.start(cat.id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="serif text-4xl font-semibold text-neutral-900 tabular-nums">
          {runningHere ? formatTimerLive(timer.elapsedSec) : formatTimerClock(minutes)}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          {editing ? "Editing entry" : runningHere ? "Running — keeps going if you navigate away" : "Tap Start to begin"}
        </div>
      </div>

      {showSleepKind && (
        <div className="bg-neutral-50 rounded-full p-1 flex">
          {(["Daytime", "Night"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSleepKind(k)}
              className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${
                sleepKind === k ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {showSide && (
        <div className="bg-neutral-50 rounded-full p-1 flex">
          {(["left", "both", "right"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`flex-1 capitalize text-sm font-semibold py-2 rounded-full transition ${
                side === s ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
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
            className="w-full text-base border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] tabular-nums"
          />
        </Field>
      )}

      {showMilkType && (
        <div className="bg-neutral-50 rounded-full p-1 flex">
          {(["Breast milk", "Formula"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMilkType(m)}
              className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${
                milkType === m ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="flex-1 py-3 rounded-full text-white font-semibold text-base"
          style={{ backgroundColor: `var(--color-${cat.color})` }}
        >
          {runningHere ? "Stop" : minutes > 0 ? "Resume" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => setMinutes((m) => m + 5)}
          className="px-4 py-3 rounded-full bg-neutral-100 text-neutral-700 text-sm font-semibold"
          aria-label="Add 5 minutes"
        >
          +5
        </button>
      </div>

      {showComments && (
        <Field label="Comments (optional)">
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Anything you want to remember?"
            className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] resize-none"
          />
        </Field>
      )}

      <PhotoAttachField photo={photo} onChange={setPhoto} />

      <SaveBar
        cat={cat}
        editing={editing}
        onSave={() => {
          const finalMin = runningHere ? timer.stop() : liveMinutes || 1;
          const dur = formatDurationShort(finalMin);
          const parts: string[] = [dur];
          if (showSleepKind) parts.push(sleepKind);
          if (showQuantity) parts.push(`${quantityMl}ml`);
          if (showMilkType) parts.push(milkType);
          if (showSide) parts.push(side);
          const note = comments.trim();
          const baseMeta = parts.join(", ");
          save({
            durationMin: finalMin,
            meta: note ? `${baseMeta} — ${note}` : baseMeta,
            photo,
          });
        }}
      />
    </div>
  );
}

function formatTimerLive(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function parseSide(meta?: string): "left" | "right" | "both" | null {
  if (!meta) return null;
  if (/right/i.test(meta)) return "right";
  if (/left/i.test(meta)) return "left";
  if (/both/i.test(meta)) return "both";
  return null;
}

function formatTimerClock(min: number): string {
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDurationShort(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0 ? `${h} h` : `${h} h ${rem} min`;
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
        <button className="w-full text-left text-sm text-neutral-900 border border-neutral-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
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
          className="w-full text-3xl serif font-semibold text-neutral-900 tabular-nums border-b-2 border-neutral-200 pb-2 focus:outline-none focus:border-[var(--color-primary)]"
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
  const isMoodPicker = cat.id === "mom-mood";

  return (
    <div className="space-y-5">
      <Field label="When">
        <button className="w-full text-left text-sm text-neutral-900 border border-neutral-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
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
          className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] resize-none"
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
  const moods = [
    { id: "Cheerful", emoji: "😊" },
    { id: "Fine", emoji: "🙂" },
    { id: "Anxious", emoji: "😟" },
    { id: "Overwhelmed", emoji: "😩" },
    { id: "Grateful", emoji: "🙏" },
    { id: OTHER_PRESET, emoji: "💭" },
  ];
  return (
    <Field label="How are you?">
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

      <DoneBar
        onDone={() => {
          if (count <= 0) {
            router.back();
            return;
          }
          save({ meta: `${count} kicks, ${elapsedMin} min`, durationMin: elapsedMin });
        }}
      />

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="bg-white rounded-3xl max-w-sm w-full p-7 text-center shadow-2xl relative">
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

        <div className="text-5xl mb-3" aria-hidden>🎉</div>
        <div className="serif text-2xl font-semibold text-neutral-900 mb-1">Great!</div>
        <p className="text-sm text-neutral-700 leading-relaxed">
          You felt{" "}
          <span className="font-semibold text-neutral-900">{count} movements</span> in{" "}
          <span className="font-semibold text-neutral-900">{minutes} minutes</span>.
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

function ContractionsForm({ cat }: { cat: Category }) {
  const save = useSaveEntry(cat);
  const router = useRouter();
  const [running, setRunning] = useState(true);
  const [logged, setLogged] = useState(0);
  const [explainerOpen, setExplainerOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="serif text-4xl font-semibold text-neutral-900 tabular-nums">00:45</div>
        <div className="text-xs text-neutral-500 mt-1">
          {running ? "Current contraction" : "Stopped — tap below to log"}
        </div>
      </div>

      <div className="bg-neutral-50 rounded-2xl p-4 text-center text-sm text-neutral-700">
        Average interval: <span className="font-semibold text-neutral-900">7 min</span> · Last: 50s
      </div>

      <button
        onClick={() => {
          tinyHaptic();
          setRunning((r) => !r);
          setLogged((n) => n + 1);
        }}
        className="w-full py-3 rounded-full text-white font-semibold text-base"
        style={{ backgroundColor: "var(--color-cat-contractions)" }}
      >
        {running ? "Stop contraction" : "Start next"}
      </button>

      <div className="text-xs text-neutral-500 text-center">
        {MOCK_CONTRACTIONS.length + logged} contractions logged today
      </div>

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
        onDone={() => {
          if (logged <= 0) {
            router.back();
            return;
          }
          save({ meta: `${logged} ${logged === 1 ? "contraction" : "contractions"}, ~45s each` });
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
        <button className="w-full text-left text-sm text-neutral-900 border border-neutral-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
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
              className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] resize-none"
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
        className="w-full aspect-square rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1.5 text-neutral-500 text-sm overflow-hidden active:scale-[0.99] transition"
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
          className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-200 text-sm text-neutral-500 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"
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

function SaveBar({ cat, editing, onSave }: { cat: Category; editing?: Entry; onSave?: () => void }) {
  return (
    <button
      onClick={onSave}
      className="w-full py-3 rounded-full text-white font-semibold text-base mt-3 active:scale-[0.98] transition"
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
function DoneBar({ onDone }: { onDone: () => void }) {
  return (
    <button
      type="button"
      onClick={onDone}
      className="w-full py-3 rounded-full bg-white border-2 border-neutral-200 text-neutral-700 font-semibold text-base active:scale-[0.98] transition"
    >
      Done
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
    case "cheerful":
    case "fine":
    case "sad":
    case "crying":
      return [];

    // Pregnancy mom-experience presets
    case "mom-mood":
      return ["Cheerful", "Fine", "Anxious", "Overwhelmed", "Grateful", OTHER_PRESET];
    case "symptoms":
      return ["Nausea", "Headache", "Swelling", "Heartburn", "Fatigue", "Back pain", "Cramping", OTHER_PRESET];
    case "hydration":
      return ["Cup (250ml)", "Glass (350ml)", "Bottle (500ml)", "Large (1L)", OTHER_PRESET];

    default:
      return [];
  }
}
