"use client";

import { type ReactNode } from "react";
import { DemoNavigator } from "./DemoNavigator";
import { BirthHandoff } from "./BirthHandoff";
import { ActiveTimerChip } from "./ActiveTimerChip";
import { PhotoLightboxProvider } from "./PhotoLightbox";
import { useStoredColorTweaks } from "./TweakPanel";
import { usePhase } from "@/lib/phase";

/**
 * Mobile frame for the prototype.
 * - On desktop: centers a 390×844 device-like card.
 * - On mobile: full-bleed, no frame.
 * - Phase toggle pinned outside the frame on desktop, top-right on mobile.
 * - Sets `data-phase` so CSS can swap --color-primary between coral (pregnancy) and teal (parenting).
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  const { phase } = usePhase();
  // Re-apply any client color overrides saved from the Adjust panel.
  useStoredColorTweaks();
  return (
    <div
      data-phase={phase}
      // Desktop-only chrome wash; phase-aware via the --color-primary-softer
      // token so Parenting reads teal and Pregnancy reads coral. The
      // utility-class side handles `md:` gating; the var inside the gradient
      // gets resolved against [data-phase] at runtime.
      className="min-h-dvh flex md:items-center justify-center md:py-8 md:bg-[image:linear-gradient(to_bottom_right,var(--color-primary-softer),var(--color-cream))]"
    >
      <div className="relative w-full md:w-[390px] md:h-[844px] md:rounded-[44px] md:shadow-2xl md:overflow-hidden bg-white">
        <PhotoLightboxProvider>
          {/* fake status bar on desktop */}
          <div className="hidden md:flex h-11 px-8 items-center justify-between text-xs font-medium text-neutral-900 absolute inset-x-0 top-0 z-30 bg-transparent">
            <span>15:31</span>
            <span className="flex items-center gap-1">
              <span>4G</span>
              <span className="w-6 h-3 border border-neutral-900 rounded-sm relative">
                <span className="absolute inset-y-[2px] left-[2px] w-3 bg-neutral-900 rounded-[1px]" />
              </span>
            </span>
          </div>
          {/* Content area: no top padding here. Each page owns its status-bar
           *  clearance — tinted-top pages bleed up to top:0 (status bar over
           *  their tint), white-top pages add md:pt-11. The actual scroll
           *  container is `<main className="flex-1 overflow-y-auto" id="phone-scroll">`
           *  in src/app/(prototype)/layout.tsx — scroll hooks target that id. */}
          <div className="md:h-[844px] flex flex-col h-dvh">
            {children}
          </div>

          {/* Sticky running-timer chip, pinned above the bottom tab bar so a
           *  sleep / nursing session started in the log form stays visible (and
           *  resumable) when the user navigates back to feed or journal. */}
          <ActiveTimerChip />

          {/* Pregnancy → parenting transition celebration, scoped to the
           *  phone shell so the overlay fills the device frame on desktop. */}
          <BirthHandoff />
        </PhotoLightboxProvider>
      </div>

      {/* Demo navigator — desktop floats outside the frame, mobile compact pill on top */}
      <div className="hidden md:block fixed top-6 right-6 z-50">
        <DemoNavigator />
      </div>
      <div className="md:hidden fixed top-2 right-2 z-50">
        <DemoNavigator compact />
      </div>
    </div>
  );
}
