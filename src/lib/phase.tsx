"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Phase = "pregnancy" | "parenting";

type PhaseCtx = {
  phase: Phase;
  setPhase: (p: Phase) => void;
};

const Ctx = createContext<PhaseCtx | null>(null);

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("pregnancy");
  return <Ctx.Provider value={{ phase, setPhase }}>{children}</Ctx.Provider>;
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
