"use client";

import { useEffect, useState } from "react";

/**
 * The MobileFrame mounts the scroll container with `id="phone-scroll"` on
 * desktop (so content scrolls inside the 844px shell, not the page).
 * On mobile there's no shell and the body scrolls. These hooks listen on
 * #phone-scroll if it exists, otherwise fall back to window.
 */
function getScrollSource(): HTMLElement | Window {
  if (typeof document === "undefined") return window;
  return document.getElementById("phone-scroll") ?? window;
}

function getScrollTop(source: HTMLElement | Window): number {
  return source instanceof Window ? source.scrollY : source.scrollTop;
}

export function useScrolledPast(threshold: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const source = getScrollSource();
    const onScroll = () => setPast(getScrollTop(source) > threshold);
    onScroll();
    source.addEventListener("scroll", onScroll, { passive: true });
    return () => source.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}

/**
 * Live scrollY value, throttled to one update per animation frame so consumers
 * can compute opacity / transform ramps from raw scroll position without
 * thrashing React. Used by the FeedHeader to cross-fade the size-of tooltip
 * pill with the compact "Week N" pill across a scrollY range.
 */
export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    const source = getScrollSource();
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setY(getScrollTop(source));
      });
    };
    onScroll();
    source.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      source.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return y;
}

/**
 * Reports "scrolling" while scroll events are firing and "rest" after
 * `idleMs` of no movement. Used by the FAB to dim + shrink while the user
 * is reading, then expand back to full opacity when they stop.
 */
export function useScrollIdleState(idleMs: number = 500): "rest" | "scrolling" {
  const [state, setState] = useState<"rest" | "scrolling">("rest");
  useEffect(() => {
    const source = getScrollSource();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      setState("scrolling");
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setState("rest"), idleMs);
    };
    source.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      source.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [idleMs]);
  return state;
}
