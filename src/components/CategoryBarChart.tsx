"use client";

import { useState } from "react";
import type { Category } from "@/lib/categories";

/**
 * "Last 30 days" bar chart — the consistent care/health trend Jonas asked for
 * across slides 9–17 (his reusable bar-template mockup). One bar per day, with
 * per-category encodings:
 *
 *   sleep        — grouped Baby/Mom bars + a toggle (check baby / mom / both)
 *   nursing      — stacked yellow=success / grey=failure minutes
 *   pumping/bottle — single ml bars
 *   diaper       — stacked by type (pee/poo/mixed/clean/other) + legend
 *   temperature  — single bars, 38°C+ in red (pairs with the fever warning)
 *   hydration    — single litre bars + a faint 2.5 L recommended line
 *
 * Data here is representative + deterministic (seeded, so SSR and client agree).
 * Real numbers come from Mali's backend — this is the design/encoding the chart
 * renders against. The caller gates on populated mode so cold state shows none.
 */

const DAYS = 30;

// Deterministic 0..1 from a key + index (FNV-ish) — no Math.random so the
// server and client render identical bars (no hydration mismatch).
function seeded(key: string, i: number): number {
  let h = 2166136261;
  const s = `${key}:${i}`;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

const gen = (key: string, fn: (r: number, i: number) => number): number[] =>
  Array.from({ length: DAYS }, (_, i) => fn(seeded(key, i), i));

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

type Series = { label: string; color: string };

type ChartConfig = {
  title: string; // small-caps left label
  unit: string; // y-axis unit label
  yMin: number;
  yMax: number;
  yTicks: number[];
  series: Series[];
  layout: "stack" | "group" | "single";
  data: number[][]; // [day][seriesIndex]
  refLine?: { value: number; label: string };
  threshold?: { at: number; color: string }; // single layout: recolor bars >= at
  showLegend: boolean;
  blurb: string;
  /** Footer summary; receives which series are visible (sleep toggle). */
  footer: (visible: boolean[]) => string;
};

function buildConfig(catId: string): ChartConfig {
  switch (catId) {
    case "sleep": {
      const baby = gen("sleepBaby", (r) => 11 + r * 5); // 11–16 h
      const mom = gen("sleepMom", (r) => 5 + r * 4); // 5–9 h
      const data = baby.map((b, i) => [b, mom[i]]);
      const avgB = r0(mean(baby));
      const avgM = r0(mean(mom));
      return {
        title: "Sleep",
        unit: "hours",
        yMin: 0,
        yMax: 20,
        yTicks: [0, 10, 20],
        series: [
          { label: "Baby", color: "var(--color-cat-sleep)" },
          { label: "Mom", color: "var(--color-coral)" },
        ],
        layout: "group",
        data,
        showLegend: true,
        blurb: "Total hours of sleep per day. Newborns often need 14–17 h, toddlers 11–14 h.",
        footer: (vis) => {
          const parts: string[] = [];
          if (vis[0]) parts.push(`${avgB} h baby`);
          if (vis[1]) parts.push(`${avgM} h mom`);
          return parts.length ? `${parts.join(" · ")} daily avg` : "";
        },
      };
    }
    case "nursing": {
      const total = gen("nurseTot", (r) => 90 + r * 160); // 90–250 min
      const failFrac = gen("nurseFail", (r) => (r < 0.7 ? r * 0.15 : 0.15 + r * 0.35));
      const data = total.map((t, i) => [t * (1 - failFrac[i]), t * failFrac[i]]);
      const avg = r0(mean(total));
      return {
        title: "Feeds",
        unit: "minutes",
        yMin: 0,
        yMax: 500,
        yTicks: [0, 250, 500],
        series: [
          { label: "Successful", color: "#f5b800" },
          { label: "Unsuccessful", color: "#c9ccd1" },
        ],
        layout: "stack",
        data,
        showLegend: true,
        blurb: "Minutes nursed per day. Yellow = successful, grey = unsuccessful sessions.",
        footer: () => `${avg} min daily avg`,
      };
    }
    case "pumping": {
      const ml = gen("pump", (r) => 80 + r * 300); // 80–380 ml
      const avg = r0(mean(ml));
      return {
        title: "Pumping",
        unit: "ml",
        yMin: 0,
        yMax: 1000,
        yTicks: [0, 500, 1000],
        series: [{ label: "Pumped", color: "var(--color-cat-food)" }],
        layout: "single",
        data: ml.map((v) => [v]),
        showLegend: false,
        blurb: "Total volume pumped per day (ml).",
        footer: () => `${avg} ml daily avg`,
      };
    }
    case "bottle": {
      const ml = gen("bottle", (r) => 320 + r * 480); // 320–800 ml
      const avg = r0(mean(ml));
      return {
        title: "Bottle",
        unit: "ml",
        yMin: 0,
        yMax: 1000,
        yTicks: [0, 500, 1000],
        series: [{ label: "Bottle-fed", color: "var(--color-cat-food)" }],
        layout: "single",
        data: ml.map((v) => [v]),
        showLegend: false,
        blurb: "Bottle-fed milk per day (ml). First month ~450–750 ml, later 750–950 ml.",
        footer: () => `${avg} ml daily avg`,
      };
    }
    case "diaper": {
      const pee = gen("dPee", (r) => 1 + Math.round(r * 3));
      const poo = gen("dPoo", (r) => Math.round(r * 2));
      const mixed = gen("dMix", (r) => Math.round(r * 2));
      const clean = gen("dCln", (r) => Math.round(r * 1));
      const other = gen("dOth", (r) => (r > 0.85 ? 1 : 0));
      const data = pee.map((_, i) => [pee[i], poo[i], mixed[i], clean[i], other[i]]);
      const avg = r0(mean(data.map((d) => d.reduce((a, b) => a + b, 0))));
      return {
        title: "Diapers",
        unit: "diapers",
        yMin: 0,
        yMax: 10,
        yTicks: [0, 5, 10],
        series: [
          { label: "Pee", color: "#f3c344" },
          { label: "Poo", color: "#6b4423" },
          { label: "Mixed", color: "#b08968" },
          { label: "Clean", color: "#d9dce0" },
          { label: "Other", color: "#6b7280" },
        ],
        layout: "stack",
        data,
        showLegend: true,
        blurb: "Diapers per day, by type.",
        footer: () => `${avg} daily avg`,
      };
    }
    case "temperature": {
      // Mostly 37.0–37.6, with a couple of fever spikes (red).
      const val = gen("temp", (r, i) => (i === 19 ? 38.2 : i === 20 ? 38.6 : 37 + r * 0.7));
      const avg = r1(mean(val));
      return {
        title: "Temperature",
        unit: "°C",
        yMin: 37,
        yMax: 41,
        yTicks: [37, 38, 39, 40, 41],
        series: [{ label: "Temp", color: "var(--color-cat-health)" }],
        layout: "single",
        data: val.map((v) => [Math.min(41, Math.max(37, v))]),
        threshold: { at: 38, color: "#dc2626" },
        showLegend: false,
        blurb: "Highest temperature measured per day. 38 °C+ is shown in red (see the warning above).",
        footer: () => `${avg} °C avg`,
      };
    }
    case "hydration": {
      const liters = gen("hydro", (r) => 1.3 + r * 1.7); // 1.3–3.0 L
      const avg = r1(mean(liters));
      return {
        title: "Water",
        unit: "litres",
        yMin: 0,
        yMax: 3,
        yTicks: [0, 1, 2, 3],
        series: [{ label: "Intake", color: "var(--color-cat-care)" }],
        layout: "single",
        data: liters.map((v) => [v]),
        refLine: { value: 2.5, label: "2.5 L recommended" },
        showLegend: false,
        blurb: "Total fluid per day. Aim for about 2.5 L (breastfeeding moms up to 3 L).",
        footer: () => `${avg} L daily avg`,
      };
    }
    default:
      return {
        title: "Trend",
        unit: "",
        yMin: 0,
        yMax: 10,
        yTicks: [0, 5, 10],
        series: [{ label: "Value", color: "var(--color-cat-care)" }],
        layout: "single",
        data: gen("misc", (r) => r * 10).map((v) => [v]),
        showLegend: false,
        blurb: "",
        footer: () => "",
      };
  }
}

const fmtTick = (catId: string, v: number) =>
  catId === "hydration" || catId === "temperature" ? String(v) : String(v);

export function CategoryBarChart({ cat }: { cat: Category }) {
  const cfg = buildConfig(cat.id);
  // Sleep is the only category with a series toggle (Jonas s9: baby + mom,
  // shown separately, checkable). Everything else shows all series.
  const [visible, setVisible] = useState<boolean[]>(cfg.series.map(() => true));
  const isSleep = cat.id === "sleep";
  const vis = isSleep ? visible : cfg.series.map(() => true);

  const W = 320;
  const H = 156;
  const padL = 26;
  const padR = 10;
  const padT = 14;
  const padB = 16;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const slot = plotW / DAYS;

  const sy = (v: number) =>
    padT + (1 - (v - cfg.yMin) / (cfg.yMax - cfg.yMin)) * plotH;
  const baseY = sy(cfg.yMin);

  const toggle = (i: number) =>
    setVisible((cur) => {
      const next = cur.map((b, k) => (k === i ? !b : b));
      return next.some(Boolean) ? next : cur; // keep at least one on
    });

  return (
    <div className="px-4 pt-5">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            {cfg.title}
          </div>
          <div className="text-xs text-neutral-500">Last 30 days</div>
        </div>

        {/* Sleep series toggle */}
        {isSleep && (
          <div className="flex gap-2 mb-3">
            {cfg.series.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle(i)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                  vis[i] ? "border-transparent text-neutral-900" : "border-neutral-200 text-neutral-400"
                }`}
                style={vis[i] ? { backgroundColor: `color-mix(in srgb, ${s.color} 18%, white)` } : undefined}
                aria-pressed={vis[i]}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: vis[i] ? s.color : "var(--color-neutral-300)" }}
                />
                {s.label}
              </button>
            ))}
          </div>
        )}

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          {/* gridlines + y labels */}
          {cfg.yTicks.map((t, i) => (
            <g key={`g${i}`}>
              <line
                x1={padL}
                y1={sy(t)}
                x2={W - padR}
                y2={sy(t)}
                stroke="var(--color-neutral-200)"
                strokeWidth={1}
                opacity={t === cfg.yMin ? 1 : 0.55}
              />
              <text x={padL - 4} y={sy(t) + 3} textAnchor="end" fontSize="8" fill="var(--color-neutral-500)">
                {fmtTick(cat.id, t)}
              </text>
            </g>
          ))}
          {/* y unit — left-aligned at the edge so long units ("minutes",
           *  "diapers") aren't clipped by the viewBox. */}
          {cfg.unit && (
            <text x={1} y={8} textAnchor="start" fontSize="8" fontWeight="600" fill="var(--color-neutral-700)">
              {cfg.unit}
            </text>
          )}

          {/* reference line (water 2.5 L) */}
          {cfg.refLine && (
            <>
              <line
                x1={padL}
                y1={sy(cfg.refLine.value)}
                x2={W - padR}
                y2={sy(cfg.refLine.value)}
                stroke="var(--color-cat-care)"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                opacity={0.7}
              />
              <text x={W - padR} y={sy(cfg.refLine.value) - 3} textAnchor="end" fontSize="7.5" fill="var(--color-cat-care)">
                {cfg.refLine.label}
              </text>
            </>
          )}

          {/* bars */}
          {cfg.data.map((day, i) => {
            const x0 = padL + i * slot;
            const visIdx = cfg.series.map((_, k) => k).filter((k) => vis[k]);

            if (cfg.layout === "group") {
              const n = visIdx.length;
              const bw = Math.max(1.5, (slot * 0.8) / Math.max(1, n));
              return visIdx.map((k, j) => {
                const v = day[k];
                const x = x0 + (slot - bw * n) / 2 + j * bw;
                return (
                  <rect
                    key={`b${i}-${k}`}
                    x={x}
                    y={sy(v)}
                    width={Math.max(1, bw - 0.6)}
                    height={Math.max(0, baseY - sy(v))}
                    rx={1.2}
                    fill={cfg.series[k].color}
                  />
                );
              });
            }

            const bw = Math.max(2, slot * 0.62);
            const x = x0 + (slot - bw) / 2;

            // single: one bar from the baseline up to the ABSOLUTE value (so a
            // 37–41 axis draws 37.4 as a short bar, not 37+37.4). Threshold
            // recolors (temperature ≥38 → red).
            if (cfg.layout === "single") {
              const v = day[0];
              const h = baseY - sy(v);
              if (h <= 0.3) return null;
              const fill = cfg.threshold && v >= cfg.threshold.at ? cfg.threshold.color : cfg.series[0].color;
              return <rect key={`b${i}`} x={x} y={sy(v)} width={bw} height={h} rx={1.5} fill={fill} />;
            }

            // stack: cumulative segments from yMin (0 for our stacked cats).
            let base = cfg.yMin;
            return visIdx.map((k) => {
              const v = day[k];
              if (v <= 0) return null;
              const top = base + v;
              const y = sy(top);
              const h = Math.max(0, sy(base) - sy(top));
              base = top;
              return <rect key={`b${i}-${k}`} x={x} y={y} width={bw} height={h} rx={1.5} fill={cfg.series[k].color} />;
            });
          })}

          {/* x endpoints */}
          <text x={padL} y={H - 3} textAnchor="start" fontSize="8" fill="var(--color-neutral-400)">
            30 days ago
          </text>
          <text x={W - padR} y={H - 3} textAnchor="end" fontSize="8" fill="var(--color-neutral-400)">
            today
          </text>
        </svg>

        {/* legend */}
        {cfg.showLegend && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            {cfg.series.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5" style={{ opacity: vis[i] ? 1 : 0.35 }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] text-neutral-600">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-neutral-700 leading-relaxed mt-3">
          <span className="font-semibold text-neutral-900 tabular-nums">{cfg.footer(vis)}</span>
          {cfg.blurb ? ` — ${cfg.blurb}` : ""}
        </p>
      </div>
    </div>
  );
}
