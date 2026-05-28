"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";

/**
 * Full-screen photo viewer with swipe between photos. Slide 51 spec:
 *
 *   "It would be nice if users can see the picture full screen (and maybe share)."
 *   "I think it would be nice if users can see the picture full screen and
 *    moms can swipe through."
 *
 * Any component can open the lightbox via `useLightbox().open(photos, index)`.
 * The provider lives inside MobileFrame so the overlay renders within the
 * phone shell on desktop while still going full-screen on mobile.
 */

type LightboxCtx = {
  open: (photos: string[], index?: number) => void;
};

const Ctx = createContext<LightboxCtx | null>(null);

type State = { photos: string[]; index: number } | null;

export function PhotoLightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(null);

  const open = useCallback((photos: string[], index = 0) => {
    if (photos.length === 0) return;
    setState({ photos, index: Math.max(0, Math.min(index, photos.length - 1)) });
  }, []);

  const close = useCallback(() => setState(null), []);
  const next = useCallback(() => {
    setState((s) => (s ? { ...s, index: Math.min(s.index + 1, s.photos.length - 1) } : null));
  }, []);
  const prev = useCallback(() => {
    setState((s) => (s ? { ...s, index: Math.max(s.index - 1, 0) } : null));
  }, []);

  const value = useMemo<LightboxCtx>(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {state && (
        <Overlay
          photos={state.photos}
          index={state.index}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </Ctx.Provider>
  );
}

export function useLightbox(): LightboxCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLightbox must be used within PhotoLightboxProvider");
  return ctx;
}

function Overlay({
  photos,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const photo = photos[index];
  const multi = photos.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-[70] bg-black/90 flex items-center justify-center"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white active:scale-95 transition"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      </button>

      {/* Tap left/right halves to navigate, or use the chevrons. Photo stays
       *  centered; sizes/contain so portraits and landscapes both fit. */}
      <div className="relative w-full h-full">
        <Image
          key={photo}
          src={photo}
          alt=""
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      {multi && (
        <>
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs tabular-nums">
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
