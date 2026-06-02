"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePhase, PHASE_LABELS, type Phase } from "@/lib/phase";
import { useColdMode } from "@/lib/cold-mode";
import { TweakPanel } from "./TweakPanel";

const PHASES: Phase[] = ["pregnancy", "parenting"];

/**
 * Demo-only navigator. Renders outside the device frame on desktop and as
 * a compact pill on mobile. Lets a reviewer (Jonas) flip between every
 * state we want to showcase:
 *   - Phase (Pregnancy / Parenting)
 *   - Data state (Populated 19 entries / Empty first-day)
 *   - The Adjust self-serve panel (text + colors)
 * ("Jump to" and "In case you missed" were removed 2026-06-02 per Sudhir —
 * reviewers navigate in the app itself; the widget stays minimal.)
 */
export function DemoNavigator({ compact = false }: { compact?: boolean }) {
  const { phase, setPhase } = usePhase();
  const cold = useColdMode();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function setCold(value: boolean) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    if (value) params.set("mode", "cold");
    else params.delete("mode");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-full border border-neutral-200 shadow-sm px-2 py-1 text-xs">
        <select
          aria-label="Phase"
          value={phase}
          onChange={(e) => setPhase(e.target.value as Phase)}
          className="bg-transparent outline-none"
        >
          {PHASES.map((p) => (
            <option key={p} value={p}>{PHASE_LABELS[p]}</option>
          ))}
        </select>
        <span className="text-neutral-300">·</span>
        <button
          onClick={() => setCold(!cold)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
            cold
              ? "bg-[var(--color-primary)] text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {cold ? "Empty" : "Populated"}
        </button>
      </div>
    );
  }

  return (
    // max-h + scroll: the widget outgrew the viewport once the Adjust section
    // landed — without this the lower sections are unreachable.
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-neutral-200 w-60 max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain">
      <div className="px-3 pt-3 pb-3">
        <Section label="Phase">
          {PHASES.map((p) => (
            <Row
              key={p}
              label={PHASE_LABELS[p]}
              active={phase === p}
              onClick={() => setPhase(p)}
            />
          ))}
        </Section>
      </div>

      <div className="px-3 py-3 border-t border-neutral-100">
        <Section label="State">
          <Row
            label="Populated"
            sub="19 entries"
            active={!cold}
            onClick={() => setCold(false)}
          />
          <Row
            label="Empty"
            sub="first day"
            active={cold}
            onClick={() => setCold(true)}
          />
        </Section>
      </div>

      <div className="px-3 py-3 border-t border-neutral-100">
        <Section label="Adjust (for Mali team)">
          <TweakPanel />
        </Section>
      </div>

      <div className="px-3 py-2 border-t border-neutral-100 bg-neutral-50/60">
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          Demo controls — not part of the app. Phase swaps theme + categories;
          State toggles the cold-start walkthrough.
        </p>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </>
  );
}

function Row({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-baseline justify-between text-left text-[13px] px-2.5 py-1.5 rounded-lg transition ${
        active
          ? "bg-[var(--color-primary)] text-white font-semibold"
          : "text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      <span>{label}</span>
      {sub && (
        <span className={`text-[10px] ${active ? "text-white/80" : "text-neutral-400"}`}>
          {sub}
        </span>
      )}
    </button>
  );
}

