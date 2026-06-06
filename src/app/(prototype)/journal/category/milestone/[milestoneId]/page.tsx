"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Illustration } from "@/components/Illustration";
import { getMilestone, type Milestone } from "@/lib/mock-milestones";
import { useBaby } from "@/lib/cold-mode";
import { useJournalStore, useEntries } from "@/lib/journal-store";
import { formatLongDate } from "@/lib/format";
import { milestoneArtOrFallback } from "@/lib/milestone-art";
import { MILESTONE_CHART_IMAGES, type MilestoneChartImage } from "@/lib/milestone-chart-images";

type Tab = "overview" | "details" | "chart";

// Lu's current age in months — derived from mock baby's ageLabel "3 months, 2 days".
const BABY_AGE_MONTHS = 3.07;

// Placeholder photo URL used when the user "adds" a photo to a milestone
// capture. Real implementation would open the OS photo picker.
const STUB_PHOTO = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=320&h=320&fit=crop&auto=format&q=70";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MilestoneDetailPage() {
  const params = useParams<{ milestoneId: string }>();
  const router = useRouter();
  const baby = useBaby();
  const { milestoneStatus, setMilestoneDone, customMilestones } = useJournalStore();
  // Resolve milestone from either the static preset registry or the user's
  // custom-milestones slice (per Jonas email 2026-05-28).
  const milestone =
    getMilestone(params.milestoneId) ??
    customMilestones.find((m) => m.id === params.milestoneId);
  const entries = useEntries();
  const status = milestone ? milestoneStatus(milestone.id) : {};
  const done = Boolean(status.doneAt);
  const [tab, setTab] = useState<Tab>("overview");

  // Capture-form state (only used when !done).
  const [whenStr, setWhenStr] = useState<string>(todayIso());
  const [note, setNote] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  if (!milestone) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unknown milestone</h1>
        <Link href="/journal/category/milestone" className="text-[var(--color-primary)] underline text-sm mt-2 inline-block">
          Back to Milestones
        </Link>
      </div>
    );
  }

  // Locate the journal entry for this milestone (if any) so we can show the
  // captured note / photo in the done state.
  const milestoneEntry = entries.find((e) => e.milestoneId === milestone.id);

  function markDone() {
    const when = whenStr ? new Date(whenStr + "T12:00:00") : new Date();
    setMilestoneDone(milestone!.id, milestone!.label, when, {
      note: note.trim() || undefined,
      photo: photoUrl ?? undefined,
    });
  }

  function unmarkDone() {
    setMilestoneDone(milestone!.id, milestone!.label, null);
    setNote("");
    setPhotoUrl(null);
  }

  return (
    <div className="pb-16 min-h-full flex flex-col">
      {/* Header */}
      <header className="bg-[var(--color-primary-soft)] px-3 pt-4 pb-4 md:pt-[60px]">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => router.back()} aria-label="Back" className="w-9 h-9 flex items-center justify-center text-[var(--color-primary-dark)] shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[var(--color-primary-dark)] truncate text-center">
            {milestone.label}
          </h1>
          <button aria-label="Share" className="w-9 h-9 flex items-center justify-center text-[var(--color-primary-dark)] shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 12v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2h5" />
              <path d="M14 4h6v6M20 4l-9 9" />
            </svg>
          </button>
        </div>

        {/* Tabs — match journal ViewTabs underline pattern, adapted for the
         *  tinted header (primary-dark text, primary-dark underline). */}
        <nav className="mt-3 px-1 flex gap-5 text-[13px] border-b border-[var(--color-primary-dark)]/15">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "details", label: "Details" },
              { id: "chart", label: "Chart" },
            ] as { id: Tab; label: string }[]
          ).map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-2 -mb-px border-b-2 transition ${
                  on
                    ? "border-[var(--color-primary-dark)] text-[var(--color-primary-dark)] font-semibold"
                    : "border-transparent text-[var(--color-primary-dark)]/60 font-medium"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Body */}
      <div className="flex-1 px-4 pt-5 space-y-5">
        {tab === "overview" && (
          <OverviewTab
            milestone={milestone}
            done={done}
            doneAt={status.doneAt}
            babyName={baby.name}
            entryMeta={milestoneEntry?.meta}
            entryPhoto={milestoneEntry?.photo}
          />
        )}
        {tab === "details" && <DetailsTab milestone={milestone} />}
        {tab === "chart" && <ChartTab milestone={milestone} babyName={baby.name} />}

        {/* Capture form — only on Overview, only when not yet done. Turns the
         *  "did it" toggle into a moment-capture: when, optional note, photo. */}
        {tab === "overview" && !done && (
          <CaptureForm
            whenStr={whenStr}
            onWhenChange={setWhenStr}
            note={note}
            onNoteChange={setNote}
            photoUrl={photoUrl}
            onTogglePhoto={() => setPhotoUrl((p) => (p ? null : STUB_PHOTO))}
            babyName={baby.name}
          />
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-6 pt-2 sticky bottom-0">
        {done ? (
          <button
            onClick={unmarkDone}
            className="w-full py-3 rounded-full bg-[var(--color-primary-softer)] text-[var(--color-primary-dark)] font-semibold text-base inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Saved · tap to undo
          </button>
        ) : (
          <button
            onClick={markDone}
            className="w-full py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold text-base inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Save as memory
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- */
/*  Capture form — when/note/photo for milestone-as-memory  */
/* -------------------------------------------------------- */

function CaptureForm({
  whenStr,
  onWhenChange,
  note,
  onNoteChange,
  photoUrl,
  onTogglePhoto,
  babyName,
}: {
  whenStr: string;
  onWhenChange: (v: string) => void;
  note: string;
  onNoteChange: (v: string) => void;
  photoUrl: string | null;
  onTogglePhoto: () => void;
  babyName: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-1.5">
        <span className="text-[var(--color-primary-dark)]" aria-hidden>✦</span>
        <span className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
          Capture this moment
        </span>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="milestone-when" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          When did this happen?
        </label>
        <input
          id="milestone-when"
          type="date"
          value={whenStr}
          onChange={(e) => onWhenChange(e.target.value)}
          className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="milestone-note" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Add a note (optional)
        </label>
        <textarea
          id="milestone-note"
          rows={3}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={`The story of when ${babyName} did this…`}
          className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <span className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Add a photo (optional)
        </span>
        <button
          type="button"
          onClick={onTogglePhoto}
          aria-pressed={Boolean(photoUrl)}
          className={`w-full aspect-[3/2] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition ${
            photoUrl
              ? "border-transparent"
              : "border-neutral-200 text-neutral-500 hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary-dark)]"
          }`}
        >
          {photoUrl ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={photoUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-white/90 text-[11px] font-semibold text-neutral-700 px-2 py-1 rounded-full">
                tap to remove
              </span>
            </div>
          ) : (
            <>
              <Illustration name="camera" className="w-7 h-7 text-neutral-400" />
              <span className="text-sm">Tap to add a photo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- */
/*  Tabs                                                    */
/* -------------------------------------------------------- */

function OverviewTab({
  milestone,
  done,
  doneAt,
  babyName,
  entryMeta,
  entryPhoto,
}: {
  milestone: Milestone;
  done: boolean;
  doneAt?: string;
  babyName: string;
  entryMeta?: string;
  entryPhoto?: string;
}) {
  const art = milestoneArtOrFallback(milestone.id);

  // The user-added note lives after " — " in meta. Strip the label so the
  // rendered note isn't "Smiles spontaneously — Smiles spontaneously".
  const userNote = (() => {
    if (!entryMeta) return null;
    const sep = ` — `;
    const idx = entryMeta.indexOf(sep);
    if (idx < 0 || !entryMeta.startsWith(milestone.label)) return null;
    const tail = entryMeta.slice(idx + sep.length).trim();
    return tail || null;
  })();

  return (
    <div className="bg-[var(--color-primary-softer)] rounded-3xl px-6 py-8 flex flex-col items-center text-center">
      {/* Slide 49 comment: "If image was updated, this should be the image of
       *  the child." The user's photo replaces the line-art illustration
       *  whenever one is attached to the milestone capture. */}
      {entryPhoto ? (
        <div className="relative w-44 h-44 rounded-full overflow-hidden shadow-md border-4 border-white">
          <Image
            src={entryPhoto}
            alt=""
            fill
            sizes="176px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative w-48 h-48 -mb-2">
          <Image src={art} alt="" fill sizes="200px" className="object-contain" />
        </div>
      )}
      <div className="serif text-2xl font-semibold text-[var(--color-primary-dark)] mt-4">
        {milestone.label}
      </div>
      {done && doneAt ? (
        <>
          <div className="text-sm text-neutral-700 mt-3">Completed on</div>
          <div className="serif text-xl font-semibold text-neutral-900">
            {formatLongDate(doneAt)}
          </div>

          {userNote && (
            <p className="serif italic text-[15px] text-neutral-800 mt-4 max-w-xs leading-relaxed">
              &ldquo;{userNote}&rdquo;
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-neutral-700 mt-3 max-w-xs leading-relaxed">
          When {babyName} reaches this, fill in the moment below and tap{" "}
          <span className="font-semibold">Save as memory</span>.
        </p>
      )}
    </div>
  );
}

function DetailsTab({ milestone }: { milestone: Milestone }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-2">
          {milestone.category} · {milestone.bucket} months
        </div>
        <h2 className="serif text-xl font-semibold text-neutral-900">{milestone.label}</h2>
        <p className="text-sm text-neutral-700 leading-relaxed mt-3">
          {milestone.description}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900">What to watch for</h3>
        <ul className="text-sm text-neutral-700 leading-relaxed space-y-2 list-disc pl-5">
          <li>Most babies reach this milestone between {Math.max(0, milestone.medianAgeMonths - 1).toFixed(1)} and {(milestone.medianAgeMonths + 1.5).toFixed(1)} months.</li>
          <li>Every baby develops at their own pace — the chart shows what's typical, not a deadline.</li>
          <li>If you're concerned, your next checkup is a good time to mention it.</li>
        </ul>
      </div>
    </div>
  );
}

function ChartTab({ milestone, babyName }: { milestone: Milestone; babyName: string }) {
  const chartImage = MILESTONE_CHART_IMAGES[milestone.id];
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
          % of babies who reach this
        </div>
        <div className="text-xs text-neutral-500">{milestone.bucket} months range</div>
      </div>
      {/* s12 "graphs as pictures": when the curve only exists as a CMS image,
       *  render the image in the same card and overlay the one personalized
       *  element — the "now" marker — at the calibrated x for the baby's age.
       *  Milestones without an image keep the live SVG chart. */}
      {chartImage ? (
        <StaticChartImage cfg={chartImage} babyName={babyName} />
      ) : (
        <SigmoidChart median={milestone.medianAgeMonths} />
      )}
      <p className="text-sm text-neutral-700 leading-relaxed mt-3">
        Most babies reach <span className="font-semibold text-neutral-900">{milestone.label.toLowerCase()}</span>{" "}
        around <span className="font-semibold text-neutral-900">{milestone.medianAgeMonths.toFixed(1)} months</span>.{" "}
        {babyName} is at <span className="font-semibold text-neutral-900">{BABY_AGE_MONTHS.toFixed(1)} months</span>.{" "}
        <Link href="/article/milestones-pace" className="text-[var(--color-primary)] font-semibold active:opacity-70">
          Read more
        </Link>
      </p>
      <p className="text-xs text-neutral-400 mt-2">
        Source: Denver Developmental Screening Tests
      </p>
    </div>
  );
}

/** Their static chart PNG + our overlaid "now" marker (s12 image-mode). */
function StaticChartImage({ cfg, babyName }: { cfg: MilestoneChartImage; babyName: string }) {
  const months = Math.min(BABY_AGE_MONTHS, cfg.monthsMax);
  const leftPct = (cfg.x0 + (months / cfg.monthsMax) * (cfg.x1 - cfg.x0)) * 100;
  return (
    <div className="relative rounded-xl overflow-hidden">
      <Image
        src={cfg.src}
        alt=""
        width={945}
        height={766}
        className="w-full h-auto"
      />
      {/* now marker — the only personalized element, no curve data needed */}
      <div
        aria-hidden
        className="absolute border-l border-dashed border-[var(--color-primary-dark)]"
        style={{
          left: `${leftPct}%`,
          top: `${cfg.yTop * 100}%`,
          height: `${(cfg.yBottom - cfg.yTop) * 100}%`,
        }}
      />
      <span
        className="absolute -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[var(--color-primary-dark)] text-white text-[9px] font-semibold whitespace-nowrap"
        style={{ left: `${leftPct}%`, top: `${cfg.yTop * 100 - 6}%` }}
      >
        {babyName} · {BABY_AGE_MONTHS.toFixed(1)} mo
      </span>
    </div>
  );
}

/** Logistic-ish S-curve showing cumulative completion %.
 *  median: x value (months) where 50% of babies have completed. */
function SigmoidChart({ median }: { median: number }) {
  const w = 320;
  const h = 160;
  const padL = 26;
  const padR = 14;
  // Extra top/bottom room so the 100% tick + "%" unit don't collide and the
  // months ticks + axis title each get a clean row (Jonas round-3 s3).
  const padT = 24;
  const padB = 32;
  const xMin = 0;
  const xMax = Math.max(median * 2.2, 12); // show enough range past median
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (w - padL - padR);
  const sy = (pct: number) => padT + (1 - pct) * (h - padT - padB);

  // Logistic: 1 / (1 + e^(-k(x - median)))
  const k = 1.6;
  const fy = (x: number) => 1 / (1 + Math.exp(-k * (x - median)));

  // Build curve path
  const steps = 40;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    points.push([sx(x), sy(fy(x))]);
  }
  const curve = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fillPath = `${curve} L${sx(xMax)},${sy(0)} L${sx(xMin)},${sy(0)} Z`;

  // Now marker (Tom's current age)
  const nowX = sx(BABY_AGE_MONTHS);
  const nowPct = fy(BABY_AGE_MONTHS);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1={padL} y1={sy(p)} x2={w - padR} y2={sy(p)} stroke="var(--color-neutral-200)" strokeWidth={1} />
      ))}
      {/* y-axis labels */}
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <text key={`y${p}`} x={padL - 4} y={sy(p) + 3} textAnchor="end" fontSize="9" fill="var(--color-neutral-400)">
          {Math.round(p * 100)}
        </text>
      ))}
      {/* x-axis month ticks (deduped so small ranges don't double-label) */}
      {Array.from(new Set([0, Math.round(xMax / 3), Math.round((2 * xMax) / 3), Math.round(xMax)])).map((x) => (
        <text key={`x${x}`} x={sx(x)} y={h - 14} textAnchor="middle" fontSize="9" fill="var(--color-neutral-400)">
          {x}
        </text>
      ))}
      {/* filled curve */}
      <path d={fillPath} fill="var(--color-primary-soft)" opacity={0.5} />
      {/* curve line */}
      <path d={curve} fill="none" stroke="var(--color-primary-dark)" strokeWidth={2} strokeLinecap="round" />
      {/* now marker */}
      <line x1={nowX} y1={padT} x2={nowX} y2={h - padB} stroke="var(--color-primary)" strokeWidth={1.2} strokeDasharray="2 2" />
      <circle cx={nowX} cy={sy(nowPct)} r={4} fill="var(--color-primary)" stroke="white" strokeWidth={1.5} />
      <text x={nowX} y={padT - 2} textAnchor="middle" fontSize="9" fill="var(--color-primary-dark)" fontWeight="600">
        now
      </text>
      {/* y unit — top-left, clear of the 100 tick (Jonas s3: % and 100 collided) */}
      <text x={padL - 4} y={12} textAnchor="end" fontSize="8" fontWeight="600" fill="var(--color-neutral-700)">%</text>
      {/* x axis title — centered on its own row below the month ticks */}
      <text x={(padL + w - padR) / 2} y={h - 3} textAnchor="middle" fontSize="8" fill="var(--color-neutral-500)">months</text>
    </svg>
  );
}
