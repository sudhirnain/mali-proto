# Handoff — Mali journal redesign

Last updated: **2026-06-06** (end of round-3). The auto-memory (`MEMORY.md` → `project_round3_feedback`) is the living pickup doc; **[ROUND3.md](ROUND3.md)** (repo root) is the round-3 spec; this file is the coarser summary.

For project conventions read [CLAUDE.md](CLAUDE.md) first. For the screen-by-screen spec read [SPEC.md](SPEC.md); for round-3 specifically read [ROUND3.md](ROUND3.md).

## TL;DR

**Round-3 (Jonas Jun-5 review, deck slides 3–23) is built and committed on branch `round-3` (6 commits, tree clean) — but NOT pushed and NOT deployed.** Prod (`mali-proto.vercel.app`) still serves the round-2 build (`86dbb90`); `main` is at `d0008db`. **Deploying and pushing are Sudhir's call** (outward-facing) — he hasn't greenlit either.

Round-3 = two phases, both ✅: **Phase 1** non-chart feedback; **Phase 2** the last-30-days chart system + phase-aware mom-weight + milestone axis fix — plus a nursing rework (dual L/R timer, optional Poor/Good/Great quality) and form-spacing standardization. Per-item detail + file:line anchors in [ROUND3.md](ROUND3.md).

**Biggest opens:** deploy round-3, push/merge to main, and (carried from round-2) reply to Jonas.

**Reading the deck (Sudhir distrusts PDF — it drops comments):** comments live in `ppt/comments/comment*.xml` (`authorId`→`commentAuthors.xml`, `dt`, `pos`, `text`); read those + typed slide `<a:t>` text + `ppt/media/*.png` **directly**. Slide images carry drawn X-marks/strikethroughs that text can't.

**Decisions locked:** A1 = keep teal parenting chrome (mom elements coral/pink); **production APK palette is the default** (froly `#f08180` / maliRed `#d14747` / paradiso `#2c746d` etc., extracted from `mali-2.9.4.xapk`); tiles color via `tileColor()` (group color, mom=maliRed/azalea), detail surfaces via domain `cat.color`; week-size = **produce, not animals** (week-32 = "kale leaf", site-verified — `sizeAnimal` is an unseeded hook awaiting Mali's art).

Chrome MCP: tab management works now, but `navigate` is still denied at the extension's agent-permission layer — **headless Chrome (shoot ≥600px wide; narrower clips the right edge) is the QA path.**

## What shipped in round-3 (✅ committed on `round-3`, ⚠️ undeployed)

- **Phase 1 — non-chart** (`f46d3c7`): `/log` Food+Activity→**Care**; drop **"My"** from mom labels; removed dead **`…`** ellipsis (2 headers); contractions **"Done"→"End session"** + removed on-screen stats + inline **"MM:SS since last contraction"**; Kicks 🎉→**Mali baby** art; water units **Gulp(50ml)/Small Glass(150ml)**, no "Other"; temperature **fever-warning** banner (≥38°C).
- **Phase 2 — charts** (`a541771`): new `CategoryBarChart` last-30-days bars (sleep grouped Baby/Mom + toggle, nursing stacked success/fail, pumping/bottle ml, diaper stacked-by-type+legend, temperature ≥38 red, water +2.5 L line); new `MomWeightChart` (pregnancy ideal-gain band / parenting 12-month); milestone `SigmoidChart` axis fix; removed old 7-day-dot `PatternSection`. **Chart data is representative + deterministic (seeded), gated on populated mode — real numbers come from Mali's backend.**
- **Nursing rework** — dedicated `NursingForm` (routed in `FormBody`; other timers keep `TimerEntryForm`): dual Left/Right timer (`ActiveTimer` keyed `nursing:left`/`nursing:right`); optional **Poor/Good/Great** quality (`43f2ee3`); (L)/(R) on entries + chip.
- **Polish from review** — reset moved to **header ↺** via new `HeaderSlotContext` (`7f60067`); quality block uses standard `<Field>` (`dd3333a`); all entry forms standardized to `space-y-5` / 20px (`f01e14b`).
- Verified: `tsc --noEmit` clean; every changed screen QA'd via headless Chrome + CDP-driven interaction.

## What shipped in round-2 session 4 (✅, deployed)

- **Contraction tracker rewrite** (`00aa8a8`) — was a hardcoded `00:45` headline + `running=true` on mount + state that died on nav (Jonas "still don't understand"). Now a persistent session (`ContractionSessionProvider`) + ActiveTimer chip, "like sleep." Hero clock is **state-swapped** (`abb5f0c`): running = current duration + frozen "after a X gap" line; idle = ticking "Since last contraction" + static last-duration. One ticking clock at a time.
- **s10 article reader** (`4ab3dcd`) — `/article/[slug]` + 8 mock articles in `articles.ts`; every "Read more" wired (feed cards, category insight, milestone chart).
- **s12 chart image-mode** (`4ab3dcd`) — their static chart PNG (cropped from deck, marker healed out) in our card chrome with our overlaid "now" marker via per-image calibration (`milestone-chart-images.ts`, sample `m-face`).
- **s3/s4** — JourneyHero size line = produce ("kale leaf"); due-date row restyled to the MilestoneHero dotted-underline `→` treatment Jonas approved.
- **Trend-chart label collisions** (`4ab3dcd`) — `kg` unit on its own row, percentile legend moved off the value label.
- **Production APK palette as default** (`9a54f45`) — extraction in `mali-source/notes/apk-brand-colors.md`.
- **Icon/container color audit** (`5d5c3e5`, `9e981f1`) — QuickLogCard/WelcomeCard now use `tileColor()` (raw `cat.color` was Jonas's "icons don't match backgrounds"); mom tiles maliRed-on-azalea; cat-kicks/cat-milestone re-aliased coral→coral-dark; cat-growth `#e0566b`.
- **Adjust panel** (`4ab3dcd`, `e95e18d`, `4418c31`, `86dbb90`) — DemoNavigator "Adjust (for Mali team)": designMode click-to-edit text + hex color inputs for brand/category vars, localStorage-persisted, brand groups start expanded.
- **DemoNavigator slimmed** (`edb84b2`, `756e738`) — Jump-to + In-case-you-missed removed; now Phase/State/Adjust.
- **`?phase=` deep link** (`5d5c3e5`) — `lastChangeSource` guard so BirthHandoff fires only on user switches.

## Open / next (🔴)

1. **Deploy round-3** — `vercel deploy --prod --yes` from the `round-3` working dir → updates `mali-proto.vercel.app` so Jonas can review. Sudhir's call (not done).
2. **Push round-3 / merge to main** — local-only; `origin/main` ~31+ behind. Ask before pushing.
3. **Reply to Jonas** — draft in memory `project_email_reply_draft`; fold in round-3 wins.
4. **Offered, not done:** tighten `Field` label→input 8px→6px *globally* for stronger grouping (needs Sudhir's nod — app-wide); full app-wide spacing audit beyond the forms.
5. **Carryover (round-2):** s15 full icon-weight pass; `cat-growth #e0566b` vs froly watch-item.

## Owned externally (📦)

- **Real animal art + week→animal map** — Mali/Junporn. Production currently uses produce; `sizeAnimal` is the ready hook, unseeded. Don't re-seed placeholders (the raccoon was rejected as not culturally right).
- **Graph data** — s12 shipped against their static chart *images*; if they ever provide curve data we can swap to live SVG. Per-image calibration is the cost of image-mode — flag if their PNGs don't share one layout.

## Where things live

| | Path |
|---|---|
| Production prototype | https://mali-proto.vercel.app (no auth wall; prod == HEAD) |
| GitHub | https://github.com/sudhirnain/mali-proto (private) |
| Canonical spec | [SPEC.md](SPEC.md) |
| Project conventions | [CLAUDE.md](CLAUDE.md) (also `@AGENTS.md` for Next-16 warning) |
| Older priority list | [BACKLOG.md](BACKLOG.md) |
| Source deck (Jonas comments live) | mali-source/Mali 2026 New Journal.pptx (re-pull before reviewing; view slide IMAGES) |
| APK brand-color extraction | [mali-source/notes/apk-brand-colors.md](mali-source/notes/apk-brand-colors.md) |
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

# Re-extract deck media (view slide IMAGES — drawn marks are feedback)
mkdir -p /tmp/mali-deck && cd /tmp/mali-deck && unzip -o -q "$HOME/Projects/mali-proto/mali-source/Mali 2026 New Journal.pptx" "ppt/media/*" "ppt/slides/_rels/*"
# Map a slide N to its images: grep -o 'media/image[0-9]*\.[a-z]*' ppt/slides/_rels/slideN.xml.rels
```

## Notes for next agent

- If `vercel deploy` errors "Could not retrieve Project Settings", the `.vercel/` link is stale → `rm .vercel/project.json .vercel/README.txt && rmdir .vercel && vercel link --yes`. Don't try to deploy under the old sudhir-4400 team — credentials are gone.
- Memory files at `/Users/sudhirnain/.claude/projects/-Users-sudhirnain-Projects-mali-proto/memory/` — read MEMORY.md first.
- Sudhir wants terse output; no recap of the diff; verify UI in a browser before reporting "done"; "start now" = execute, don't re-confirm.
