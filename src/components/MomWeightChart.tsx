"use client";

import Link from "next/link";
import { usePhase } from "@/lib/phase";

/**
 * Mom-weight chart — phase-aware (Jonas round-3 s18; he X'd out the generic
 * "Trend · Last 12 weeks" line for both phases):
 *
 *   Pregnancy → "Ideal weight gain": kg vs gestational week with a shaded ideal
 *               range band and the "you should have gained ~X kg" guidance.
 *   Parenting → "Last 12 months": the climb to birth, then postpartum recovery.
 *
 * Representative data (real values come from the backend); this is the design.
 */

const W = 320;
const H = 172;
const padL = 28;
const padR = 14;
const padT = 18;
const padB = 26;
const plotW = W - padL - padR;
const plotH = H - padT - padB;

export function MomWeightChart() {
  const { phase } = usePhase();
  return phase === "pregnancy" ? <PregnancyGain /> : <ParentingTwelveMonths />;
}

/* --------------------------- Pregnancy --------------------------- */

function PregnancyGain() {
  const weeks = 40;
  const curWeek = 32;
  const yMin = 48;
  const yMax = 66;
  const yTicks = [50, 55, 60, 65];

  const sx = (wk: number) => padL + (wk / weeks) * plotW;
  const sy = (kg: number) => padT + (1 - (kg - yMin) / (yMax - yMin)) * plotH;

  // Ideal-range band: total healthy gain ≈ 9–14 kg from a 50 kg pre-pregnancy
  // weight, ramping in after ~week 12.
  const ramp = (wk: number) => Math.max(0, (wk - 12) / (weeks - 12));
  const lower = (wk: number) => 50 + ramp(wk) * 9;
  const upper = (wk: number) => 50 + ramp(wk) * 14;
  const stepW = 2;
  const ws: number[] = [];
  for (let w = 0; w <= weeks; w += stepW) ws.push(w);
  const band =
    ws.map((w, i) => `${i === 0 ? "M" : "L"}${sx(w).toFixed(1)},${sy(upper(w)).toFixed(1)}`).join(" ") +
    " " +
    [...ws].reverse().map((w) => `L${sx(w).toFixed(1)},${sy(lower(w)).toFixed(1)}`).join(" ") +
    " Z";

  // Mom's actual logged trend, ending near the upper edge of "ideal" (≈10.8 kg).
  const actual: [number, number][] = [
    [0, 50], [8, 51], [16, 53.5], [24, 57], [curWeek, 60.8],
  ];
  const path = actual.map(([w, kg], i) => `${i === 0 ? "M" : "L"}${sx(w).toFixed(1)},${sy(kg).toFixed(1)}`).join(" ");
  const [lw, lkg] = actual[actual.length - 1];

  return (
    <Card title="Ideal weight gain" period="During pregnancy">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <YAxis yTicks={yTicks} sy={sy} unit="kg" />
        {/* ideal range band */}
        <path d={band} fill="var(--color-cat-growth)" opacity={0.18} />
        <text x={W - padR} y={sy(upper(weeks)) + 3} textAnchor="end" fontSize="7.5" fill="var(--color-cat-growth)" opacity={0.85}>
          ideal range
        </text>
        {/* current-week marker */}
        <line x1={sx(curWeek)} y1={padT} x2={sx(curWeek)} y2={H - padB} stroke="var(--color-neutral-300)" strokeWidth={1} />
        {/* actual trend */}
        <path d={path} fill="none" stroke="var(--color-cat-growth)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={sx(lw)} cy={sy(lkg)} r={4.5} fill="var(--color-cat-growth)" stroke="white" strokeWidth={2} />
        <text x={sx(lw)} y={sy(lkg) - 9} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--color-cat-growth)">
          {lkg.toFixed(1)} kg
        </text>
        {/* x labels */}
        {[0, 13, 27, 40].map((w) => (
          <text key={w} x={sx(w)} y={H - 6} textAnchor="middle" fontSize="8" fill="var(--color-neutral-500)">
            {w === 0 ? "wk 0" : `wk ${w}`}
          </text>
        ))}
      </svg>
      <Blurb>
        Based on your pre-pregnancy weight of <b className="text-neutral-900">50 kg</b> and height of{" "}
        <b className="text-neutral-900">160 cm</b>, you should have gained about{" "}
        <b className="text-neutral-900">10.8 kg</b> by now.
      </Blurb>
    </Card>
  );
}

/* --------------------------- Parenting --------------------------- */

function ParentingTwelveMonths() {
  // 13 monthly points: 12 months ago → now. Climb to birth (≈5 months ago),
  // then postpartum recovery.
  const kg = [70, 73, 76, 79, 81, 79.5, 77, 74.5, 72, 70.5, 69, 68, 67];
  const birthIdx = 4;
  const n = kg.length - 1;
  const yMin = 62;
  const yMax = 84;
  const yTicks = [65, 70, 75, 80];

  const sx = (i: number) => padL + (i / n) * plotW;
  const sy = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const path = kg.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  const fill = `${path} L${sx(n).toFixed(1)},${sy(yMin).toFixed(1)} L${sx(0).toFixed(1)},${sy(yMin).toFixed(1)} Z`;

  return (
    <Card title="Last 12 months" period="Parenting">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <YAxis yTicks={yTicks} sy={sy} unit="kg" />
        <path d={fill} fill="var(--color-cat-growth)" opacity={0.12} />
        <path d={path} fill="none" stroke="var(--color-cat-growth)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* birth marker */}
        <line x1={sx(birthIdx)} y1={padT} x2={sx(birthIdx)} y2={H - padB} stroke="var(--color-neutral-300)" strokeWidth={1} strokeDasharray="2 2" />
        <text x={sx(birthIdx)} y={padT - 4} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--color-neutral-500)">
          birth
        </text>
        <circle cx={sx(n)} cy={sy(kg[n])} r={4.5} fill="var(--color-cat-growth)" stroke="white" strokeWidth={2} />
        <text x={sx(n)} y={sy(kg[n]) - 9} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--color-cat-growth)">
          {kg[n]} kg
        </text>
        {/* x labels */}
        <text x={sx(0)} y={H - 6} textAnchor="start" fontSize="8" fill="var(--color-neutral-500)">12 mo ago</text>
        <text x={sx(n)} y={H - 6} textAnchor="end" fontSize="8" fill="var(--color-neutral-500)">now</text>
      </svg>
      <Blurb>Your weight across the past 12 months — the climb to birth, then recovery.</Blurb>
    </Card>
  );
}

/* ------------------------------ shared ------------------------------ */

function Card({ title, period, children }: { title: string; period: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">{title}</div>
          <div className="text-xs text-neutral-500">{period}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function YAxis({ yTicks, sy, unit }: { yTicks: number[]; sy: (v: number) => number; unit: string }) {
  return (
    <>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={sy(t)} x2={W - padR} y2={sy(t)} stroke="var(--color-neutral-200)" strokeWidth={1} opacity={0.55} />
          <text x={padL - 4} y={sy(t) + 3} textAnchor="end" fontSize="8" fill="var(--color-neutral-500)">{t}</text>
        </g>
      ))}
      <text x={padL - 4} y={9} textAnchor="end" fontSize="8" fontWeight="600" fill="var(--color-neutral-700)">{unit}</text>
    </>
  );
}

function Blurb({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-neutral-700 leading-relaxed mt-3">
      {children}{" "}
      <Link href="/article/healthy-weight-gain" className="text-[var(--color-primary)] font-semibold active:opacity-70">
        Read more
      </Link>
    </p>
  );
}
