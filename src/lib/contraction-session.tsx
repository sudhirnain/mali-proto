"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * A contraction-timing session — survives navigation, like ActiveTimer
 * (Jonas round-2 s33 follow-up: "the timer seem to stop or I don't know how
 * to get back to it… I suggest we just put the timer in as a tracker, like
 * with sleep"). Holds raw timestamps only; the form derives durations,
 * intervals and the since-last clock from these.
 */
export type ContractionEvent = { start: number; end: number };

type Ctx = {
  /** Start timestamp of the in-progress contraction, or null when idle. */
  currentStart: number | null;
  /** Completed contractions this session, in order. */
  events: ContractionEvent[];
  startContraction: () => void;
  /** Finish the in-progress contraction; no-op when idle. */
  stopContraction: () => void;
  /** Clear the session (after saving or discarding). */
  reset: () => void;
};

const ContractionSessionContext = createContext<Ctx | null>(null);

export function ContractionSessionProvider({ children }: { children: ReactNode }) {
  const [currentStart, setCurrentStart] = useState<number | null>(null);
  const [events, setEvents] = useState<ContractionEvent[]>([]);

  const startContraction = useCallback(() => {
    setCurrentStart((curr) => curr ?? Date.now());
  }, []);

  const stopContraction = useCallback(() => {
    setCurrentStart((curr) => {
      if (curr != null) setEvents((evs) => [...evs, { start: curr, end: Date.now() }]);
      return null;
    });
  }, []);

  const reset = useCallback(() => {
    setCurrentStart(null);
    setEvents([]);
  }, []);

  const value = useMemo(
    () => ({ currentStart, events, startContraction, stopContraction, reset }),
    [currentStart, events, startContraction, stopContraction, reset],
  );

  return <ContractionSessionContext.Provider value={value}>{children}</ContractionSessionContext.Provider>;
}

export function useContractionSession(): Ctx {
  const ctx = useContext(ContractionSessionContext);
  if (!ctx) throw new Error("useContractionSession must be used within ContractionSessionProvider");
  return ctx;
}
