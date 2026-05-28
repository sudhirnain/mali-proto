/**
 * Web Vibration API micro-buzz. Android Chrome supports it; iOS Safari
 * silently no-ops. Wrapped so callers don't need to feature-detect.
 *
 * Slide 17 comment: "can we make this haptic feedback?" anchored to the
 * Kick tap button — use this on any satisfying micro-action (kicks, feeds,
 * a contraction tick, etc.).
 */
export function tinyHaptic(durationMs: number = 18): void {
  if (typeof window === "undefined") return;
  const vibrate = window.navigator?.vibrate?.bind(window.navigator);
  if (!vibrate) return;
  try {
    vibrate(durationMs);
  } catch {
    // no-op
  }
}
