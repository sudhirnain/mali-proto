"use client";

import { useEffect, useState } from "react";

/**
 * Self-serve adjustments for the client (Jonas: "Is there a way we can adjust
 * the text and colours ourselves in the prototype so I can make some changes
 * before passing it to the devs?").
 *
 * Text: browser designMode — click any text inside the phone and retype it.
 * DOM-only, gone on navigation; meant for screenshots, not persistence.
 *
 * Colors: every brand + category color routes through CSS variables, so
 * overriding the variable restyles every surface that uses it. Overrides are
 * injected as a `:root, [data-phase] { … !important }` style tag (out-ranks
 * the parenting teal block) and persisted in localStorage. "Reset" returns
 * to shipped.
 *
 * Design-system shape (mirrors globals.css): pregnancy-track categories
 * (kicks / contractions / milestone icon) ALIAS the coral brand tokens via
 * var() — they render as "= coral" chips here, not inputs, and follow brand
 * edits automatically. One source of truth per hue.
 */

const STORAGE_KEY = "mali-color-tweaks";
const STYLE_ID = "mali-color-tweaks";

const BRAND_GROUPS: { label: string; swatches: { var: string; label: string }[] }[] = [
  {
    label: "Pregnancy brand (coral)",
    swatches: [
      { var: "--color-coral", label: "Primary" },
      { var: "--color-coral-dark", label: "Dark" },
      { var: "--color-coral-soft", label: "Soft" },
      { var: "--color-coral-softer", label: "Softer" },
    ],
  },
  {
    label: "Parenting brand (teal)",
    swatches: [
      { var: "--color-teal", label: "Primary" },
      { var: "--color-teal-dark", label: "Dark" },
      { var: "--color-teal-soft", label: "Soft" },
      { var: "--color-teal-softer", label: "Softer" },
    ],
  },
];

/** One row per category: icon color + tile bg. `iconAlias`/`bgAlias` mark
 *  tokens that alias a brand var in globals.css — shown as chips, not inputs
 *  (overriding them here would silently break the alias). */
const CATEGORIES: { id: string; label: string; iconAlias?: string; bgAlias?: string }[] = [
  { id: "sleep", label: "Sleep" },
  { id: "food", label: "Food" },
  { id: "diaper", label: "Diaper" },
  { id: "care", label: "Care" },
  { id: "growth", label: "Growth" },
  { id: "health", label: "Health" },
  { id: "mood", label: "Mood" },
  { id: "kicks", label: "Kicks", iconAlias: "coral dark", bgAlias: "coral soft" },
  { id: "contractions", label: "Contract.", iconAlias: "coral dark" },
  { id: "memory", label: "Memory" },
  { id: "milestone", label: "Milestone", iconAlias: "coral dark" },
];

const EDITABLE_VARS: string[] = [
  ...BRAND_GROUPS.flatMap((g) => g.swatches.map((s) => s.var)),
  ...CATEGORIES.flatMap((c) => [
    ...(c.iconAlias ? [] : [`--color-cat-${c.id}`]),
    ...(c.bgAlias ? [] : [`--color-cat-${c.id}-soft`]),
  ]),
];

// The production APK palette became the shipped default in globals.css
// (2026-06-02) — the former "Use Mali app palette" preset is gone because
// Reset now lands on exactly those values.

function readStored(): Record<string, string> {
  try {
    const raw: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    // Drop keys that are no longer editable (e.g. saved before a token became
    // a brand alias) — otherwise they'd override invisibly, with no UI row.
    return Object.fromEntries(Object.entries(raw).filter(([k]) => EDITABLE_VARS.includes(k)));
  } catch {
    return {};
  }
}

function injectOverrides(overrides: Record<string, string>) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  const entries = Object.entries(overrides);
  if (entries.length === 0) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  const body = entries.map(([k, v]) => `${k}: ${v} !important;`).join(" ");
  el.textContent = `:root, [data-phase] { ${body} }`;
}

/** Apply persisted overrides on boot — called once from MobileFrame so tweaks
 *  take effect on every device, including mobile where the panel is hidden. */
export function useStoredColorTweaks() {
  useEffect(() => {
    injectOverrides(readStored());
  }, []);
}

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

/** Swatch + hex input. Applies on blur/Enter when the value parses as
 *  6-digit hex (leading # optional); invalid input snaps back. */
function HexField({
  value,
  overridden,
  onCommit,
  ariaLabel,
  narrow = false,
}: {
  value: string;
  overridden: boolean;
  onCommit: (hex: string) => void;
  ariaLabel: string;
  narrow?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  // Re-sync when the resolved value arrives async (defaults load after
  // mount) or Reset clears overrides.
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const m = draft.trim().match(HEX_RE);
    if (m) onCommit(`#${m[1].toLowerCase()}`);
    else setDraft(value);
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span
        aria-hidden
        className={`w-3.5 h-3.5 rounded border shrink-0 ${overridden ? "border-neutral-500" : "border-neutral-200"}`}
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        spellCheck={false}
        aria-label={ariaLabel}
        className={`${narrow ? "w-[60px]" : "w-[72px]"} bg-neutral-50 border border-neutral-200 rounded px-1 py-0.5 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${
          overridden ? "font-bold text-neutral-900" : "text-neutral-700"
        }`}
      />
    </span>
  );
}

/** Token that aliases a brand var — follows brand edits, not editable here. */
function AliasChip({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-[79px] py-0.5 rounded border border-dashed border-neutral-200 text-[9px] text-neutral-400 truncate"
      title={`Follows the ${name} brand token`}
    >
      = {name}
    </span>
  );
}

export function TweakPanel() {
  const [editText, setEditText] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  // Resolve shipped values once (for swatches + input starting positions).
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const d: Record<string, string> = {};
    for (const v of EDITABLE_VARS) d[v] = cs.getPropertyValue(v).trim();
    setDefaults(d);
    setOverrides(readStored());
  }, []);

  // designMode is document-global; restore on unmount so it can't get stuck.
  useEffect(() => {
    document.designMode = editText ? "on" : "off";
    return () => {
      document.designMode = "off";
    };
  }, [editText]);

  const setColor = (cssVar: string, value: string) => {
    setOverrides((curr) => {
      const next = { ...curr, [cssVar]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      injectOverrides(next);
      return next;
    });
  };

  const reset = () => {
    setOverrides({});
    localStorage.removeItem(STORAGE_KEY);
    injectOverrides({});
  };


  const valueOf = (cssVar: string) => overrides[cssVar] ?? defaults[cssVar] ?? "";
  const dirty = Object.keys(overrides).length > 0;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setEditText((v) => !v)}
        className={`flex items-baseline justify-between text-left text-[13px] px-2.5 py-1.5 rounded-lg transition ${
          editText
            ? "bg-[var(--color-primary)] text-white font-semibold"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <span>Edit text {editText ? "— on" : ""}</span>
        <span className={`text-[10px] ${editText ? "text-white/80" : "text-neutral-400"}`}>
          click &amp; type
        </span>
      </button>
      {editText && (
        <p className="text-[10px] text-neutral-500 leading-relaxed px-2.5 -mt-1">
          Click any text in the phone and retype it. Temporary — screenshot
          what you like, then toggle off.
        </p>
      )}

      {/* Brand groups start expanded (Sudhir) — they're the high-traffic
          knobs; the long Categories list stays collapsed. */}
      {BRAND_GROUPS.map((g) => (
        <details key={g.label} className="px-1" open>
          <summary className="text-[11px] font-semibold text-neutral-600 cursor-pointer px-1.5 py-1 rounded hover:bg-neutral-100 select-none">
            {g.label}
          </summary>
          <div className="flex flex-col gap-1 mt-1.5 px-1">
            {g.swatches.map((s) => (
              <label key={s.var} className="flex items-center gap-1.5 text-[10.5px] text-neutral-600">
                <span className="flex-1 truncate">{s.label}</span>
                <HexField
                  value={valueOf(s.var)}
                  overridden={s.var in overrides}
                  onCommit={(hex) => setColor(s.var, hex)}
                  ariaLabel={`${g.label} ${s.label} hex`}
                />
              </label>
            ))}
          </div>
        </details>
      ))}

      <details className="px-1">
        <summary className="text-[11px] font-semibold text-neutral-600 cursor-pointer px-1.5 py-1 rounded hover:bg-neutral-100 select-none">
          Categories
        </summary>
        <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[9px] uppercase tracking-wide text-neutral-400">
          <span className="flex-1" />
          <span className="w-[79px] text-center">icon</span>
          <span className="w-[79px] text-center">tile bg</span>
        </div>
        <div className="flex flex-col gap-1 mt-1 px-1">
          {CATEGORIES.map((c) => {
            const iconVar = `--color-cat-${c.id}`;
            const bgVar = `--color-cat-${c.id}-soft`;
            return (
              <div key={c.id} className="flex items-center gap-1.5 text-[10.5px] text-neutral-600">
                <span className="flex-1 truncate" title={c.label}>{c.label}</span>
                {c.iconAlias ? (
                  <AliasChip name={c.iconAlias} />
                ) : (
                  <HexField
                    narrow
                    value={valueOf(iconVar)}
                    overridden={iconVar in overrides}
                    onCommit={(hex) => setColor(iconVar, hex)}
                    ariaLabel={`${c.label} icon hex`}
                  />
                )}
                {c.bgAlias ? (
                  <AliasChip name={c.bgAlias} />
                ) : (
                  <HexField
                    narrow
                    value={valueOf(bgVar)}
                    overridden={bgVar in overrides}
                    onCommit={(hex) => setColor(bgVar, hex)}
                    ariaLabel={`${c.label} tile background hex`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </details>

      <div className="flex items-center justify-between px-1.5">
        <p className="text-[10px] text-neutral-400 leading-snug pr-2">
          Colors persist on this device.
        </p>
        <button
          onClick={reset}
          disabled={!dirty}
          className="text-[11px] font-semibold text-neutral-600 px-2 py-1 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
