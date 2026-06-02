# Backlog

Tracks known gaps and deferred work. Items in roughly priority order. Pull from here when picking the next thing.

> **Round 2 feedback (feedback02.pptx, 2026-06-01)** — Jonas's slide 3–15 review is captured as actionable items in [SPEC.md](SPEC.md) **Part B2** (not duplicated here). Highlights: roll the new start/end timer form to all categories (R2 s4), pin Save + lighten field borders (R2 s5), make MOM badges pink + rename "Mom's wellbeing" (R2 s13), "based on your use" top-4 quick-logs (R2 s14), post-save → category overview (R2 s9).

## High-value gaps for the demo

- **~120 unlabeled `File_NNN.png` milestone files are uncatalogued.** Only 5 visual matches wired in `src/lib/milestone-art.ts`. The rest sit in `public/mali-art/milestones/` but Next.js doesn't ship them. To cover more milestones, eyeball the contact sheets (`/tmp/cs_0.png`..`cs_7.png` regenerable) and add registry entries. Could also seed new milestones for files with obvious meaning (File_086 "points at butterfly" → "Points at things"; File_103 "points at airplane" → similar).
- **Universal photo affordance on entry forms.** Currently only `picture` / `note` / `quote` forms expose a photo picker. Timer / event / measurement / kicks / contraction / milestone forms have none. P1 #6 in the plan.
- **Filter chip persistence across view switches.** Selecting Nursing on Timeline, switching to Calendar, switching back — filter is gone. P1 #9. Route through URL search params or context.
- **Empty state on `/feed` for new users.** "Add your first entry by pressing +" with arrow to the FAB, mirroring IMG_9050. P1 #10.
- **24h pattern band on `/feed`.** A consolidated band showing Sleep / Feed / Diaper across last 24h, like My Baby Statistics > Pattern. Currently only per-category (in category detail). P1 #7.

## Polish

- **Parenting StatStrip hero is small inside the circle.** Using `happy_hands_up_baby.png` with `object-contain p-1` — the baby illustration sits at ~70% of the circle. Either crop tighter, swap for a different asset, or use a milestone line-art baby (which fills naturally).
- **Done state needs more push.** Current treatment is `bg-primary-soft` (slightly darker) + check badge. User asked once for "maximize contrast" — could push done state further (heavier bg or colored stroke on the line-art on completion).
- **Calendar tint scale.** Now 5 stops but the visual jump between stops is subtle. Test with a denser fortnight of mock data and decide if more stops or larger tint deltas are needed.
- **Photo-day calendar tiles.** Date numbers now in a white pill — works. Could add a soft drop shadow to the pill so it pops on darker photos.

## Demo-killers (medium severity)

- **Photo selection is faked.** Picture form shows "Tap to add a photo" placeholder; clicking does nothing. New entries from anywhere can't have a photo. Acceptable for screen review but anyone interactive will probe it.
- **Timer is faked.** Start/Stop buttons toggle local state but no timer runs. `+5` lets you fake-add minutes. Sleep / Nursing / Pumping / Stroll / Bathing all use this.
- **No way to delete or unmark a journal entry that came from a milestone.** Tapping a milestone entry redirects to the milestone detail; the detail has "tap to undo" which removes both status + journal entry. But if the user wants to delete just the journal entry without changing milestone status, there's no path. Edge case.

## Long tail (P2 from the plan)

- Persistent in-progress timers across navigation (kicks, contractions, nursing)
- Phase toggle moved out of DemoNavigator (onboarding completion or settings)
- Onboarding flow returned (currently deleted — out of scope per CLAUDE.md, only revisit if asked)
- Pre-filter consistency between `/log` and `/log/[category]`
- Category label tooltips for truncated names

## Architectural debt

- **`useEntries` import migration.** All known callsites updated (5 files), but a future task that adds a new component must remember to import from `@/lib/journal-store`, not `@/lib/cold-mode`. The latter no longer exports `useEntries`.
- **Hardcoded entry IDs.** Seeded entries are e1..e19; new entries use `e-${Date.now()}`. No collision risk in-session, but URLs to specific seeded entries (`/journal/entry/e1`) only work in `live` mode, not `cold`.
- **No persistence.** Store resets on refresh. Acceptable for prototype; would need localStorage or a real backend for anything else.

## Won't-do unless asked

- Real auth, real backend, real photo uploads
- Multi-baby support
- Internationalization (Thai / Vietnamese — though the deck shows Thai screenshots)
- Push notifications
- Onboarding funnel (explicitly out of scope per CLAUDE.md)
