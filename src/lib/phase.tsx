"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Phase = "pregnancy" | "parenting";

type PhaseCtx = {
  phase: Phase;
  setPhase: (p: Phase) => void;
  /** What caused the last phase change. URL-driven swaps (deep links,
   *  screenshot sweeps) must not fire the BirthHandoff celebration. */
  lastChangeSource: "user" | "url";
};

const Ctx = createContext<PhaseCtx | null>(null);

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ phase: Phase; lastChangeSource: "user" | "url" }>({
    phase: "pregnancy",
    lastChangeSource: "user",
  });

  // Honor ?phase=parenting after mount — deep-linkable demo states and
  // headless screenshot sweeps. Effect (not state initializer) so SSR and
  // first client render agree; the swap lands one frame later.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("phase");
    if (p === "parenting" || p === "pregnancy") setState({ phase: p, lastChangeSource: "url" });
  }, []);

  const setPhase = (p: Phase) => setState({ phase: p, lastChangeSource: "user" });

  return (
    <Ctx.Provider value={{ phase: state.phase, setPhase, lastChangeSource: state.lastChangeSource }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePhase(): PhaseCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePhase must be used within PhaseProvider");
  return ctx;
}

export const PHASE_LABELS: Record<Phase, string> = {
  pregnancy: "Pregnancy",
  parenting: "Parenting",
};

export function isPregnancy(p: Phase) {
  return p === "pregnancy";
}
