"use client";

import { useSearchParams } from "next/navigation";
import { usePhase } from "./phase";
import { BABIES, FIRST_DAY_BABIES, MOMS, FIRST_DAY_MOMS, type Baby, type Mom } from "./mock-baby";

/**
 * Cold-start demo path. Activated by ?mode=cold in the URL.
 *
 * Lets us walk Jonas through cold → first-entry → steady-state on the same
 * prototype without writing localStorage logic. Toggle by appending/removing
 * the search param.
 *
 * Entry data itself lives in JournalStoreProvider — import `useEntries` from
 * `@/lib/journal-store`, not from this file.
 */
export function useColdMode(): boolean {
  const params = useSearchParams();
  return params?.get("mode") === "cold";
}

/** Returns the phase-appropriate Baby, swapped to a first-day persona in cold mode. */
export function useBaby(): Baby {
  const { phase } = usePhase();
  const cold = useColdMode();
  return cold ? FIRST_DAY_BABIES[phase] : BABIES[phase];
}

/** Mom record — pregnancy-centric. Same cold-start swap as useBaby. */
export function useMom(): Mom {
  const { phase } = usePhase();
  const cold = useColdMode();
  return cold ? FIRST_DAY_MOMS[phase] : MOMS[phase];
}
