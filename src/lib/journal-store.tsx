"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ENTRIES, type Entry } from "./mock-entries";
import { MILESTONES } from "./mock-milestones";
import { useColdMode } from "./cold-mode";

/**
 * In-memory journal store.
 *
 * Two parallel slices — `live` (seeded from MOCK_ENTRIES + MILESTONES) and
 * `cold` (starts empty) — selected by `?mode=cold` in the URL. Mutations
 * routed to the active slice so toggling between modes via DemoNavigator
 * preserves each timeline independently.
 *
 * Reset-on-refresh is intentional: the prototype is demo-first, not a real
 * database. We don't need persistence — we need accurate edit/delete behavior
 * during the demo session.
 */

export type MilestoneStatus = { doneAt?: string };
type Slice = {
  entries: Entry[];
  milestones: Map<string, MilestoneStatus>;
};

function seedLiveMilestones(): Map<string, MilestoneStatus> {
  const m = new Map<string, MilestoneStatus>();
  for (const ms of MILESTONES) {
    if (ms.done) m.set(ms.id, { doneAt: pickSeedDate(ms.id) });
  }
  return m;
}

// Seed plausible completion dates for the two already-done milestones so the
// detail screen shows real dates instead of a literal "20 May 2026".
function pickSeedDate(id: string): string {
  // m-smile completed yesterday (May 18), m-head five days ago (May 14)
  if (id === "m-smile") return new Date("2026-05-18T18:00:00").toISOString();
  if (id === "m-head") return new Date("2026-05-14T12:00:00").toISOString();
  return new Date().toISOString();
}

type Ctx = {
  entries: Entry[];
  getEntry: (id: string) => Entry | undefined;
  addEntry: (e: Entry) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  milestoneStatus: (id: string) => MilestoneStatus;
  setMilestoneDone: (
    id: string,
    label: string,
    when: Date | null,
    extra?: { note?: string; photo?: string }
  ) => void;
};

const JournalCtx = createContext<Ctx | null>(null);

export function JournalStoreProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Slice>(() => ({
    entries: [...MOCK_ENTRIES],
    milestones: seedLiveMilestones(),
  }));
  const [cold, setCold] = useState<Slice>(() => ({
    entries: [],
    milestones: new Map(),
  }));

  const isCold = useColdMode();
  const slice = isCold ? cold : live;
  const setSlice = isCold ? setCold : setLive;

  const getEntry = useCallback(
    (id: string) => slice.entries.find((e) => e.id === id),
    [slice.entries]
  );

  const addEntry = useCallback(
    (e: Entry) => {
      setSlice((prev) => ({
        ...prev,
        entries: [e, ...prev.entries.filter((x) => x.id !== e.id)],
      }));
    },
    [setSlice]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setSlice((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== id),
      }));
    },
    [setSlice]
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<Entry>) => {
      setSlice((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [setSlice]
  );

  const milestoneStatus = useCallback(
    (id: string): MilestoneStatus => slice.milestones.get(id) ?? {},
    [slice.milestones]
  );

  // Marking a milestone "done" also drops a milestone entry into the journal so
  // it surfaces in Timeline / Calendar like every other event. Optional
  // `extra.note` is appended to the label (so the entry reads "Smiles
  // spontaneously — first time was at the changing table") and `extra.photo`
  // is attached so the memory variant of JournalEntryCard renders rich.
  const setMilestoneDone = useCallback(
    (
      id: string,
      label: string,
      when: Date | null,
      extra?: { note?: string; photo?: string }
    ) => {
      setSlice((prev) => {
        const milestones = new Map(prev.milestones);
        const entryId = `milestone:${id}`;
        if (when) {
          milestones.set(id, { doneAt: when.toISOString() });
          const note = extra?.note?.trim();
          const meta = note ? `${label} — ${note}` : label;
          const milestoneEntry: Entry = {
            id: entryId,
            categoryId: "milestone",
            at: when.toISOString(),
            meta,
            milestoneId: id,
            ...(extra?.photo ? { photo: extra.photo } : {}),
          };
          return {
            entries: [milestoneEntry, ...prev.entries.filter((x) => x.id !== entryId)],
            milestones,
          };
        }
        milestones.delete(id);
        return {
          entries: prev.entries.filter((x) => x.id !== entryId),
          milestones,
        };
      });
    },
    [setSlice]
  );

  const value = useMemo<Ctx>(
    () => ({
      entries: slice.entries,
      getEntry,
      addEntry,
      removeEntry,
      updateEntry,
      milestoneStatus,
      setMilestoneDone,
    }),
    [slice.entries, getEntry, addEntry, removeEntry, updateEntry, milestoneStatus, setMilestoneDone]
  );

  return <JournalCtx.Provider value={value}>{children}</JournalCtx.Provider>;
}

export function useJournalStore(): Ctx {
  const ctx = useContext(JournalCtx);
  if (!ctx) throw new Error("useJournalStore must be used within JournalStoreProvider");
  return ctx;
}

/** Backwards-compatible hook used widely across pages. */
export function useEntries(): Entry[] {
  return useJournalStore().entries;
}
