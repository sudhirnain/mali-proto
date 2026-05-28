# Handoff — Mali journal redesign

Last updated: **2026-05-28**.

For project conventions read [CLAUDE.md](CLAUDE.md) first. For the screen-by-screen redesign spec read [SPEC.md](SPEC.md). This file is the **"what state is the project in right now"** pickup doc.

## TL;DR

Pregnancy header is compact. Photo attach is on most entry forms. Sticky timer chip works across navigation. Deployed to `mali-proto.vercel.app` but **deployment protection is still blocking anonymous viewers** (401). The May-28 review deck arrived and has been fully reconciled into [SPEC.md](SPEC.md); ~15 new build items are queued there.

## What's shipped (✅)

Commits on `main`, deployed to https://mali-proto.vercel.app (private under team `sudhir-nain-s-projects`).

- **Initial prototype** (`a81bba7`) — entire feed/journal/forms/data layer/mock data/raster art
- **Compact pregnancy header, photo attach, sticky timer chip** (`edbdf76`)
  - StatStrip pregnancy now: mom-weight | Sarah + Week N · Day D | baby-weight (newborn icon)
  - 5 mini quick-log tiles in one row (symptoms · hydration · sleep · contractions · mood)
  - Optional photo attach on Timer / Measurement / Event / Note forms (skipped Kicks/Contractions per Jonas)
  - `ActiveTimer` context + sticky `ActiveTimerChip` that survives navigation
- **GitHub repo published** (private) — https://github.com/sudhirnain/mali-proto

## What's blocked, waiting on Sudhir (🔴)

1. **Vercel Deployment Protection = 401** at https://mali-proto.vercel.app. Until this flips, Jonas can't see the live build. Fix path:
   - Vercel Dashboard → mali-proto → Settings → Deployment Protection → set to **Disabled** (or *Only Preview Deployments*)
2. **Pink-only color** confirmed by deck slide 54 — but not yet implemented. Removing the teal/coral phase split touches `globals.css` + `BirthHandoff`. **No design pushback needed; just build.**
3. **Mom-track in parenting visual** — biggest open design question (see SPEC.md A2). Needs Sudhir's call: pill, colored row bg, side strip, or "For mom" subsection? **Blocks** rebuilding the parenting feed.
4. **Solids/Vaccinations/etc. forms** — DECIDE chips vs free-text vs both with "Other" — see SPEC.md Part C.
5. **Sponsor/Cryoviva slot** (slide 55) — yes or no for the prototype.

## What's queued to build, ready when Sudhir says go (🟢)

All from [SPEC.md](SPEC.md) Part A. Roughly in dependency order:

| # | Item | Files | Size |
|---|---|---|---|
| A1 | Drop teal/coral phase split; pink everywhere | [globals.css](src/app/globals.css), [BirthHandoff.tsx](src/components/BirthHandoff.tsx) | 1h |
| A5a–b | Center subline format + right ring = due date (tappable to edit) | [StatStrip.tsx](src/components/StatStrip.tsx) | 1h |
| A5d | Per-week watercolor in StatStrip center (parenting fallback = line-art baby unless user-photo) | [StatStrip.tsx](src/components/StatStrip.tsx) | 1h |
| A5f | Replace "1" numeric badge in pregnancy with `due` red dot; keep numeric in parenting | [FeedHeader.tsx](src/components/FeedHeader.tsx) | 30m |
| A6 | Scroll behavior: sticky pill, fruit-size momentary explainer, FAB hides | [FeedHeader.tsx](src/components/FeedHeader.tsx), [PrimaryFAB.tsx](src/components/PrimaryFAB.tsx) | 2-3h |
| A9 | Delete `/journal/trimester/[t]` route + Timeline trimester wrappers | [journal/trimester/](src/app/(prototype)/journal/trimester/), [journal/page.tsx](src/app/(prototype)/journal/page.tsx) | 1h |
| A8 | Lock big-photo card variant to note/picture/quote/milestone only | [JournalEntryCard.tsx](src/components/JournalEntryCard.tsx) | 30m |
| A4 follow | Tap photo in entry → full-screen viewer + swipe | new [PhotoViewer.tsx](src/components/PhotoViewer.tsx), [JournalEntryCard.tsx](src/components/JournalEntryCard.tsx) | 2h |
| A7 | Haptic on kick/feed taps | new [src/lib/haptic.ts](src/lib/haptic.ts), [/log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) | 30m |
| A11 | Graph rules: dots for kicks/contractions, "Last 7 days" relabel | [journal/category/[id]/page.tsx](src/app/(prototype)/journal/category/%5Bid%5D/page.tsx) | 1h |
| A13 | "Other" option on all preset pickers | [/log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) `presetsFor()` | 1h |
| A14 | Birth handoff: due-date-aware trigger + X close | [BirthHandoff.tsx](src/components/BirthHandoff.tsx) | 1h |
| — | Sleep/Bottle/Pumping form expansion (Daytime/Night, Quantity, Breast toggle) per slides 27/30/34/36 | [/log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) | 2h |
| — | Kick goal-reached celebration screen (slide 17) | [/log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) KicksForm | 1h |
| — | Milestone-with-photo: replace illustration with user photo in Overview tab (slide 49) | [journal/category/milestone/[milestoneId]/page.tsx](src/app/(prototype)/journal/category/milestone/%5BmilestoneId%5D/page.tsx) | 1h |
| — | Inline quote card on feed ("Nice idea!" slide 56) | [feed/page.tsx](src/app/(prototype)/feed/page.tsx) | 1h |
| — | "True contractions" educational paragraph on Contractions screen | [/log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) ContractionsForm | 30m |
| — | Pull new pregnancy illustrations from Drive folder | https://drive.google.com/drive/folders/1m8W_ey6mBRes53oBXue4P6YvUCgSMr9v | 30m |
| — | Plus FAB on every journal screen (audit) | [journal/](src/app/(prototype)/journal/) | 15m |

Total: ~17–22 hours of work to fully respond to the review.

## What's owned externally (📦)

- **Graph SVGs** — Junporn (`@junporn@mali.me`) will produce. We render. Slide 13 *"How would you need us to create these graphs?"*. Spec the format: median line as `<path>`, ref band as filled `<path>`, dots as `<g>`. Tell Jonas.
- **Missing screens** in deck (slides 23, 41 callouts) — assigned to Junporn, not us.

## Where things live

| | Path |
|---|---|
| Production prototype | https://mali-proto.vercel.app (auth-walled until A1 below) |
| GitHub | https://github.com/sudhirnain/mali-proto (private) |
| Canonical spec | [SPEC.md](SPEC.md) |
| Project conventions | [CLAUDE.md](CLAUDE.md) (also `@AGENTS.md` for Next-16 warning) |
| Older priority list | [BACKLOG.md](BACKLOG.md) |
| Source deck (with comments) | [mali-source/feedback.pptx](mali-source/feedback.pptx) |
| Extracted text + comments | [mali-source/deck-extracted.txt](mali-source/deck-extracted.txt) |
| Meeting transcript | [mali-source/feedback.txt](mali-source/feedback.txt) |
| Original brief | [mali-source/design-deck.pdf](mali-source/design-deck.pdf) |
| Reference screenshots | [mali-source/screenshots/](mali-source/screenshots/) |
| Live deck (online) | https://docs.google.com/presentation/d/1w-a3QZIoUdLGuOh2tsP67bQis8_1jwgojUtkYF1BvyU/edit |

## Quick commands

```bash
# Dev (port may shift if 3000 is busy; we keep one running often)
pnpm dev

# Type check
pnpm exec tsc --noEmit

# Production build
pnpm exec next build

# Deploy
vercel deploy --prod --yes

# Re-extract deck if feedback.pptx is updated
mkdir -p /tmp/mali-pptx && cd /tmp/mali-pptx && unzip -q ~/Projects/mali-proto/mali-source/feedback.pptx && python3 /tmp/extract_pptx.py > ~/Projects/mali-proto/mali-source/deck-extracted.txt
```

## Notes for next agent

- If `vercel deploy` errors "Could not retrieve Project Settings", the `.vercel/` link is stale → `rm .vercel/project.json .vercel/README.txt && rmdir .vercel && vercel link --yes`. Don't try to deploy under the old sudhir-4400 team — credentials are gone.
- Memory files at `/Users/sudhirnain/.claude/projects/-Users-sudhirnain-Projects-mali-proto/memory/` — read MEMORY.md first.
- Sudhir wants terse output; no recap of the diff; verify UI in a browser before reporting "done"; "start now" = execute, don't re-confirm.
