"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Active running timers — survive navigation so a sleep session started from
 * the journal stays visible (and tickable) on /feed, /journal, etc. Multiple
 * timers run at once (e.g. Sleep + Pumping), each keyed by its category, so
 * the floating chip can stack them and forms never block each other.
 *
 * Demo-scoped: state is in-memory React Context, cleared on full reload. A
 * production version would lean on Live Activities (iOS) / persistent
 * notifications (Android) for true background continuation.
 */
export type ActiveTimer = {
  categoryId: string;
  startedAt: number;
};

type Ctx = {
  /** All running timers, in start order. */
  timers: ActiveTimer[];
  /** Begin a timer for a category. No-op if that category is already running. */
  start: (categoryId: string) => void;
  /** End a category's timer; returns elapsed minutes (>=1), or 0 if it wasn't running. */
  stop: (categoryId: string) => number;
  /** The running timer for a category, or undefined. */
  timerFor: (categoryId: string) => ActiveTimer | undefined;
  /** Live-ticking elapsed seconds for a category (0 when not running). */
  elapsedSec: (categoryId: string) => number;
};

const ActiveTimerContext = createContext<Ctx | null>(null);

export function ActiveTimerProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (timers.length === 0) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timers.length]);

  const start = useCallback((categoryId: string) => {
    setTimers((curr) =>
      curr.some((t) => t.categoryId === categoryId)
        ? curr
        : [...curr, { categoryId, startedAt: Date.now() }],
    );
  }, []);

  const stop = useCallback(
    (categoryId: string): number => {
      const t = timers.find((x) => x.categoryId === categoryId);
      const mins = t ? Math.max(1, Math.round((Date.now() - t.startedAt) / 60_000)) : 0;
      setTimers((curr) => curr.filter((x) => x.categoryId !== categoryId));
      return mins;
    },
    [timers],
  );

  const timerFor = useCallback(
    (categoryId: string) => timers.find((t) => t.categoryId === categoryId),
    [timers],
  );

  const elapsedSec = useCallback(
    (categoryId: string) => {
      const t = timers.find((x) => x.categoryId === categoryId);
      return t ? Math.max(0, Math.floor((now - t.startedAt) / 1000)) : 0;
    },
    [timers, now],
  );

  const value = useMemo(
    () => ({ timers, start, stop, timerFor, elapsedSec }),
    [timers, start, stop, timerFor, elapsedSec],
  );

  return <ActiveTimerContext.Provider value={value}>{children}</ActiveTimerContext.Provider>;
}

export function useActiveTimer(): Ctx {
  const ctx = useContext(ActiveTimerContext);
  if (!ctx) throw new Error("useActiveTimer must be used within ActiveTimerProvider");
  return ctx;
}
