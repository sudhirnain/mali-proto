"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Active running timer — survives navigation so a sleep session started from
 * the journal stays visible (and tickable) on /feed, /journal, etc.
 *
 * Demo-scoped: state is in-memory React Context, cleared on full reload. A
 * production version would lean on a Live Activity (iOS) / persistent
 * notification (Android) for true background continuation.
 */
export type ActiveTimer = {
  categoryId: string;
  startedAt: number;
};

type Ctx = {
  active: ActiveTimer | null;
  /** Begin a new active timer. No-op if one is already running. */
  start: (categoryId: string) => void;
  /** End the timer and return elapsed minutes (>=1 if any time passed). */
  stop: () => number;
  /** Live-ticking elapsed seconds (updates ~1Hz while active). */
  elapsedSec: number;
};

const ActiveTimerContext = createContext<Ctx | null>(null);

export function ActiveTimerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveTimer | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!active) return;
    const tick = () => setElapsedSec(Math.floor((Date.now() - active.startedAt) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const start = useCallback((categoryId: string) => {
    setActive((curr) => curr ?? { categoryId, startedAt: Date.now() });
  }, []);

  const stop = useCallback((): number => {
    if (!active) return 0;
    const mins = Math.max(1, Math.round((Date.now() - active.startedAt) / 60_000));
    setActive(null);
    setElapsedSec(0);
    return mins;
  }, [active]);

  return (
    <ActiveTimerContext.Provider value={{ active, start, stop, elapsedSec }}>
      {children}
    </ActiveTimerContext.Provider>
  );
}

export function useActiveTimer(): Ctx {
  const ctx = useContext(ActiveTimerContext);
  if (!ctx) throw new Error("useActiveTimer must be used within ActiveTimerProvider");
  return ctx;
}
