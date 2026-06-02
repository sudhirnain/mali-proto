"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePhase, PHASE_LABELS, type Phase } from "@/lib/phase";
import { useColdMode } from "@/lib/cold-mode";
import { TweakPanel } from "./TweakPanel";

const PHASES: Phase[] = ["pregnancy", "parenting"];

/**
 * Demo-only navigator. Renders outside the device frame on desktop and as
 * a compact pill on mobile. Lets a reviewer (Jonas) jump between every
 * state we want to showcase:
 *   - Phase (T1-2 / T3 / Parenting)
 *   - Data state (Populated 19 entries / Empty first-day)
 *   - Specific routes (Feed / Journal / Calendar / Add event / Entry detail)
 *
 * Cold-state preservation: jump links carry the current `?mode=cold` through,
 * so you can navigate the whole empty-state walkthrough without losing it.
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

  const jumpHref = (href: string) => (cold ? `${href}?mode=cold` : href);

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
        <Section label="Jump to">
          <JumpLink href={jumpHref("/feed")}>Home · Feed</JumpLink>
          <JumpLink href={jumpHref("/journal")}>Journal · Timeline</JumpLink>
          <JumpLink href={jumpHref("/journal/moments")}>Journal · Moments</JumpLink>
          <JumpLink href={jumpHref("/journal/calendar")}>Journal · Calendar</JumpLink>
          <JumpLink href={jumpHref("/journal/category/nursing")}>
            Category detail
          </JumpLink>
          <JumpLink href={jumpHref("/journal/category/milestone")}>
            Milestones library
          </JumpLink>
          <JumpLink href={jumpHref("/log")}>Add to Journal</JumpLink>
          <JumpLink href={jumpHref("/journal/entry/e1")}>Entry detail</JumpLink>
        </Section>
      </div>

      <div className="px-3 py-3 border-t border-neutral-100">
        <Section label="In case you missed">
          <TryThis
            label="Mark a milestone as a memory"
            sub="Parenting · capture form"
            onClick={() => {
              setPhase("parenting");
              setCold(false);
              router.push("/journal/category/milestone");
            }}
          />
          <TryThis
            label="See the birth handoff"
            sub="Pregnancy → Parenting"
            onClick={() => {
              setCold(false);
              setPhase("pregnancy");
              router.push("/feed");
              // Tiny delay so the pregnancy state settles before the
              // transition; BirthHandoff fires on the parenting flip.
              setTimeout(() => setPhase("parenting"), 350);
            }}
          />
          <TryThis
            label="See the cold-start experience"
            sub="Empty state · any phase"
            onClick={() => {
              setCold(true);
              router.push("/feed");
            }}
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

function TryThis({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left text-[13px] px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 transition flex flex-col"
    >
      <span className="font-medium">{label}</span>
      <span className="text-[10px] text-neutral-400">{sub}</span>
    </button>
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

function JumpLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[13px] px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
    >
      {children}
    </Link>
  );
}
