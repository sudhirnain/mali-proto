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
 * Colors: every brand + category color routes through the CSS variables
 * below, so overriding the variable restyles every surface that uses it.
 * Overrides are injected as a `:root, [data-phase] { … !important }` style
 * tag (out-ranks the parenting teal block) and persisted in localStorage so
 * they survive reload on the reviewer's device. "Reset" returns to shipped.
 */

const STORAGE_KEY = "mali-color-tweaks";
const STYLE_ID = "mali-color-tweaks";

type Swatch = { var: string; label: string };
type SwatchGroup = { label: string; swatches: Swatch[] };

const GROUPS: SwatchGroup[] = [
  {
    label: "Brand — pregnancy (coral)",
    swatches: [
      { var: "--color-coral", label: "Primary" },
      { var: "--color-coral-dark", label: "Dark" },
      { var: "--color-coral-soft", label: "Soft" },
      { var: "--color-coral-softer", label: "Softer" },
    ],
  },
  {
    label: "Brand — parenting (teal)",
    swatches: [
      { var: "--color-teal", label: "Primary" },
      { var: "--color-teal-dark", label: "Dark" },
      { var: "--color-teal-soft", label: "Soft" },
      { var: "--color-teal-softer", label: "Softer" },
    ],
  },
  {
    label: "Categories (icon · tile bg)",
    swatches: [
      "sleep",
      "food",
      "diaper",
      "care",
      "growth",
      "health",
      "mood",
      "kicks",
      "contractions",
      "memory",
      "milestone",
    ].flatMap((c) => [
      { var: `--color-cat-${c}`, label: c },
      { var: `--color-cat-${c}-soft`, label: `${c} bg` },
    ]),
  },
];

function readStored(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
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

export function TweakPanel() {
  const [editText, setEditText] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  // Resolve shipped values once (for the color inputs' starting position).
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const d: Record<string, string> = {};
    for (const g of GROUPS) for (const s of g.swatches) d[s.var] = cs.getPropertyValue(s.var).trim();
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

      {GROUPS.map((g) => (
        <details key={g.label} className="px-1">
          <summary className="text-[11px] font-semibold text-neutral-600 cursor-pointer px-1.5 py-1 rounded hover:bg-neutral-100 select-none">
            {g.label}
          </summary>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5 px-1">
            {g.swatches.map((s) => (
              <label key={s.var} className="flex items-center gap-1.5 text-[10.5px] text-neutral-600 capitalize cursor-pointer">
                <input
                  type="color"
                  value={overrides[s.var] ?? defaults[s.var] ?? "#000000"}
                  onChange={(e) => setColor(s.var, e.target.value)}
                  className="w-5 h-5 rounded border border-neutral-200 p-0 bg-transparent cursor-pointer"
                  aria-label={`${g.label} ${s.label}`}
                />
                <span className="truncate">{s.label}</span>
              </label>
            ))}
          </div>
        </details>
      ))}

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
