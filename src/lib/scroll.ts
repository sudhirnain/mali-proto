"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the document (or its scroll container) has scrolled past
 * the given threshold. Subscribes to window scroll — the inner content of
 * the MobileFrame scrolls window on mobile; on desktop the device shell is
 * fixed height so the same listener still triggers as the user scrolls the
 * outer page.
 */
export function useScrolledPast(threshold: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}

/**
 * Reports whether the user is currently scrolling DOWN past a small
 * threshold — used to hide the FAB while a user is reading content. Returns
 * to false when scrolling up or coming to rest above the threshold.
 */
export function useScrollingDown(): boolean {
  const [down, setDown] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      // Only flip on meaningful movement to avoid jitter.
      if (Math.abs(delta) < 4) return;
      if (delta > 0 && y > 80) setDown(true);
      else if (delta < 0) setDown(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return down;
}
